import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  checkoutCart,
  removeFromCart,
} from "../controllers/cartControllers.js";
const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// @route   GET /api/cart
// @desc    Get current user's cart
// @access  Private
router.get("/", getCart);

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post("/add", addToCart);

// @route   POST /api/cart/remove
// @desc    Remove item from cart
// @access  Private
router.post("/remove", removeFromCart);

router.post("/checkout", checkoutCart);

export default router;
