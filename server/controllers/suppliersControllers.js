/**
 * supplierController.js
 *
 * Handles all Supplier-related operations for Akubata Inc.
 * Includes CRUD operations using Sequelize ORM.
 */

import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";

/**
 * Create a new supplier
 * POST /api/suppliers
 */
export const createSupplier = async (req, res) => {
  try {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      country,
    } = req.body;

    // Check if supplier already exists
    const existingSupplier = await Supplier.findOne({
      where: { contactEmail },
    });
    if (existingSupplier) {
      return res
        .status(400)
        .json({ message: "Supplier with this email already exists" });
    }

    const supplier = await Supplier.create({
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      country,
    });

    res
      .status(201)
      .json({ message: "Supplier created successfully", supplier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all suppliers
 * GET /api/suppliers
 */
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.status(200).json(suppliers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get supplier by ID
 * GET /api/suppliers/:id
 */
export const getSupplierById = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get supplier by Product Id
 * GET /api/suppliers/byProduct/:productId
 */
export const getSupplierByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const supplier = await Supplier.findOne({
      include: [
        {
          model: Product,
          where: { productId },
        },
      ],
    });

    if (!supplier) {
      return res
        .status(404)
        .json({ message: "Supplier not found for this product" });
    }

    res.status(200).json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a supplier
 * PUT /api/suppliers/:id
 */
export const updateSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      country,
      isActive,
    } = req.body;

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.companyName = companyName || supplier.companyName;
    supplier.contactName = contactName || supplier.contactName;
    supplier.contactEmail = contactEmail || supplier.contactEmail;
    supplier.contactPhone = contactPhone || supplier.contactPhone;
    supplier.address = address || supplier.address;
    supplier.city = city || supplier.city;
    supplier.state = state || supplier.state;
    supplier.country = country || supplier.country;
    supplier.isActive = isActive || supplier.isActive;

    await supplier.save();

    res
      .status(200)
      .json({ message: "Supplier updated successfully", supplier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a supplier
 * DELETE /api/suppliers/:id
 */
export const deleteSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await supplier.destroy();

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
