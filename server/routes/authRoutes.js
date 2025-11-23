/**
 * authRoutes.js
 *
 * Defines authentication routes for Akubata Inc.
 * Routes delegate logic to authController.js.
 */

import express from "express";
import {
  getCurrentUser,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updateUser,
  passwordReset,
} from "../controllers/authControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/auth/me
// @desc    Get current authenticated user
router.get("/me", getCurrentUser);

router.put("/", protect, updateUser);

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post("/signup", signup);

// @route   POST /api/auth/login
// @desc    Login user
router.post("/login", login);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post("/logout", logout);

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
router.post("/reset-password/:token", resetPassword);

// In App Password Reset
router.post("/password-reset", protect, passwordReset);

// @route   POST /api/auth/verify-email
// @desc    Placeholder for additional auth flow
router.post("/verify-email/:token", verifyEmail);

export default router;
