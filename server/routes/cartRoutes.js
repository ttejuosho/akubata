import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  checkoutCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  resetCart,
} from "../controllers/cartControllers.js";
const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// @route   GET /api/carts
// @desc    Get current user's cart
// @access  Private
router.get("/", getCart);

// @route   POST /api/carts
// @desc    Add item to cart
// @access  Private
router.post("/", addToCart);

// @route   POST /api/carts/remove
// @desc    Remove item from cart
// @access  Private
router.post("/remove", removeFromCart);

router.put("/", updateCartItem);

router.delete("/", clearCart);
router.get("/reset", resetCart);

// @route
router.post("/checkout", checkoutCart);

export default router;
