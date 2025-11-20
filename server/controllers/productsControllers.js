/**
 * productController.js
 *
 * Handles all Product-related operations for Akubata Inc.
 * Includes CRUD operations and links products to suppliers.
 */

import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import { Op } from "sequelize";
/**
 * Create a new product
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      description,
      unitPrice,
      stockQuantity,
      imageUrl,
      supplierId,
    } = req.body;

    // Check if supplier exists
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier)
      return res.status(400).json({ message: "Invalid supplier ID" });

    const product = await Product.create({
      productName,
      category,
      description,
      unitPrice,
      stockQuantity,
      imageUrl,
      supplierId,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all products
 * GET /api/products
 * Uses Progressive Partial Search Fallback:
 */

// Helper function to search products by a term
const searchProductsByTerm = async (term) => {
  const query = `%${term}%`;

  const [products, suppliers] = await Promise.all([
    Product.findAll({
      where: {
        [Op.or]: [
          { productName: { [Op.like]: query } },
          { category: { [Op.like]: query } },
          { description: { [Op.like]: query } },
        ],
      },
    }),
    Supplier.findAll({
      where: {
        companyName: { [Op.like]: query },
      },
    }),
  ]);

  const supplierProducts = suppliers.length
    ? await Product.findAll({
        where: {
          supplierId: { [Op.in]: suppliers.map((s) => s.supplierId) },
        },
      })
    : [];

  return [...products, ...supplierProducts];
};

export const getProducts = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    let combinedProducts = [];
    let responseMessage = "";

    if (!searchQuery || searchQuery.trim() === "") {
      combinedProducts = await Product.findAll();
    } else {
      // Regular full search
      combinedProducts = await searchProductsByTerm(searchQuery);

      if (combinedProducts.length === 0) {
        responseMessage = "No exact matches found";

        // Progressive Partial Search Fallback
        const prefixes = [
          searchQuery.slice(0, 3),
          searchQuery.slice(0, 4),
          searchQuery.slice(0, 5),
        ].filter((s) => s.length >= 3);

        const partialResults = (
          await Promise.all(
            prefixes.map((prefix) => searchProductsByTerm(prefix))
          )
        ).flat();

        // Remove duplicates
        combinedProducts = partialResults.filter(
          (v, i, a) => a.findIndex((p) => p.productId === v.productId) === i
        );

        // Final fallback: top 9 products by stockQuantity
        if (combinedProducts.length === 0) {
          combinedProducts = await Product.findAll({
            order: [["stockQuantity", "DESC"]],
            limit: 9,
          });
        }
      }
    }

    res.json({
      products: combinedProducts,
      message: responseMessage,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get product by ID
 * GET /api/products/:productId
 */
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Supplier,
          attributes: [
            "supplierId",
            "companyName",
            "contactName",
            "contactEmail",
            "contactPhone",
          ],
        },
      ],
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get product by ID
 * GET /api/products/:supplierId
 */
export const getProductsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const products = await Product.findAll({
      where: { supplierId },
      include: [
        {
          model: Supplier,
          attributes: [
            "supplierId",
            "companyName",
            "contactName",
            "contactEmail",
          ],
        },
      ],
    });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a product
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      category,
      description,
      unitPrice,
      stockQuantity,
      supplierId,
      isActive,
    } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (supplierId) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier)
        return res.status(400).json({ message: "Invalid supplier ID" });
      product.supplierId = supplierId;
    }

    product.productName = productName || product.productName;
    product.category = category || product.category;
    product.description = description || product.description;
    product.unitPrice = unitPrice || product.unitPrice;
    product.stockQuantity = stockQuantity || product.stockQuantity;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a product
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
