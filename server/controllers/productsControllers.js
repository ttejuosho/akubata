/**
 * productController.js
 *
 * Handles all Product-related operations for Akubata Inc.
 * Includes CRUD operations and links products to suppliers.
 */

import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

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
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
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
