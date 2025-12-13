/**
 * authController.js
 *
 * Handles all authentication logic for Akubata Inc.
 * Works with User model (Sequelize) and JWT for token-based auth.
 */

import User from "../models/User.js"; // import your Sequelize User model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import config from "../config/index.js";
import { sendEmail } from "../middleware/mailer.js";
import { getDefaultAddress } from "./addressControllers.js";
import { Address } from "../models/index.js";

// JWT secret and expiration (move to environment variables in production)
const JWT_SECRET = config.auth.jwtSecret;

function formatAddress(address) {
  if (!address) return null;
  const { addressLine1, addressLine2, city, state, zipCode, country } = address;

  return [addressLine1, addressLine2, city, state, zipCode, country]
    .filter(Boolean) // removes null, undefined, empty strings
    .join(", ");
}

//** GET /api/auth/me
//* Get current authenticated user
//*/
export const getCurrentUser = async (req, res) => {
  try {
    let token = null;

    // --- 1. Extract token (header > cookie) ---
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // --- 2. Soft decode for pre-validation ---
    const decodedSoft = jwt.decode(token);
    if (!decodedSoft) {
      return res.status(401).json({ message: "Malformed token" });
    }

    // --- 3. Check expiration manually ---
    const now = Math.floor(Date.now() / 1000);
    if (decodedSoft.exp && decodedSoft.exp < now) {
      return res.status(401).json({ message: "Token expired" });
    }

    // --- 4. Verify signature ---
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ message: "Invalid token signature" });
    }

    // --- 5. Fetch user ---
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User no longer exists" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("getCurrentUser error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/signup
 * Register a new user
 */
export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      password,
      confirmPassword,
      role = "admin",
    } = req.body;

    // Normalize email
    const normalizedEmail = emailAddress.trim().toLowerCase();

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({
      where: { emailAddress: normalizedEmail },
    });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const newUser = await User.create({
      firstName,
      lastName,
      emailAddress: normalizedEmail,
      phoneNumber,
      password,
      role,
    });

    const token = newUser.generateJWT();
    await sendEmail(
      "welcome",
      {
        firstName: firstName,
        loginLink: `http://localhost:5173/login`,
      },
      "Akubata Stores - Welcome!",
      normalizedEmail
    );

    // set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Welcome! Signup successful.",
      user: {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailAddress: newUser.emailAddress,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/login
 * Login user and return JWT
 */
export const login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    // Normalize email
    const normalizedEmail = emailAddress.trim().toLowerCase();

    const user = await User.scope(null).findOne({
      where: { emailAddress: normalizedEmail },
      include: [
        {
          model: Address,
          //as: "address",
          where: { isDefault: true },
          required: false,
          attributes: [
            "addressId",
            "addressLine1",
            "addressLine2",
            "city",
            "state",
            "zipCode",
            "country",
          ],
        },
      ],
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const userData = user.toJSON();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = user.generateJWT();

    // set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Logged in successfully",
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: formatAddress(userData.Addresses[0]),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/logout
 * Logout user (client should delete token)
 * res.clearCookie("token") removes the JWT from the browser.
 * Keeps httpOnly, secure, and sameSite aligned with how the cookie was set in login.
 * Returns a simple confirmation message.
 * Frontend handles redirect or state reset.
 */
export const logout = async (req, res) => {
  try {
    // Clear the HttpOnly cookie storing the JWT
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/forgot-password
 * Generate password reset token and expiration
 */
export const forgotPassword = async (req, res) => {
  try {
    const { emailAddress } = req.body;
    const normalizedEmail = emailAddress.trim().toLowerCase();

    const user = await User.findOne({
      where: { emailAddress: normalizedEmail },
    });
    if (!user)
      return res.status(400).json({ message: "No user with that email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = Date.now() + 3600000; // 1 hour expiration

    user.passwordResetToken = resetToken;
    user.tokenExpires = tokenExpires;
    await user.save();

    await sendEmail(
      "forgot",
      {
        firstName: user.firstName,
        passwordResetLink: `http://localhost:5173/reset-password/${resetToken}`,
      },
      "Akubata Stores - Lets Reset Your Password",
      normalizedEmail
    );

    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Reset password using the token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        tokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = newPassword;
    user.passwordResetToken = null;
    user.tokenExpires = null;

    await user.save();

    await sendEmail(
      "passwordReset",
      {},
      "Akubata Stores - Password Reset Confirmation",
      user.emailAddress
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// In App Password Reset
export const passwordReset = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newPassword, confirmNewPassword } = req.body;

    // Validate inputs
    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Fetch user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password (beforeUpdate hook will hash it)
    user.password = newPassword;

    // Clear reset token fields (safety)
    user.passwordResetToken = null;
    user.tokenExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/verify-email
 * Placeholder for additional auth flow (e.g., email verification)
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params; // token comes from email link like /api/auth/verify-email/:token

    if (!token)
      return res
        .status(400)
        .json({ message: "Verification token is required" });

    // Find user by token and ensure token not expired
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        tokenExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });

    // Mark email verified
    user.isActive = true;
    user.passwordResetToken = null;
    user.tokenExpires = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phoneNumber } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields only
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
