/**
 * authRoutes.js
 *
 * Defines authentication routes for Akubata Inc.
 * Routes delegate logic to authController.js.
 */

import express from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail, // placeholder for additional auth flow
} from "../controllers/authControllers.js";

const router = express.Router();

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

// @route   POST /api/auth/verify-email
// @desc    Placeholder for additional auth flow
router.post("/verify-email", verifyEmail);

export default router;
