import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAddressById,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressControllers.js";

const router = express.Router();

// Protect all routes (user must be logged in)
router.use(protect);

// Get all addresses for current user
router.get("/", getAddresses);

// Get an address
router.get("/:addressId", getAddressById);

// Add a new address
router.post("/", addAddress);

// Update an address by ID
router.put("/:addressId", updateAddress);

// Delete an address by ID
router.delete("/:addressId", deleteAddress);

// Set an address as default
router.patch("/:addressId/default", setDefaultAddress);

export default router;
