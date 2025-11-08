/**
 * authController.js
 *
 * Handles all authentication logic for Akubata Inc.
 * Works with User model (Sequelize) and JWT for token-based auth.
 */

import User from "../models/User.js"; // import your Sequelize User model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";

// JWT secret and expiration (move to environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "7d";

/**
 * Generate JWT token for a user
 * @param {Object} user - Sequelize User instance
 * @returns {string} JWT token
 */
const generateJWT = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
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
      password,
      verifyPassword,
      role = "basic",
    } = req.body;

    if (password !== verifyPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ where: { emailAddress } });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword,
      role,
    });

    const token = generateJWT(newUser);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailAddress: newUser.emailAddress,
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

    const user = await User.findOne({ where: { emailAddress } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateJWT(user);

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        role: user.role,
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
 */
export const logout = async (req, res) => {
  // JWT logout is handled on the client by deleting the token
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * POST /api/auth/forgot-password
 * Generate password reset token and expiration
 */
export const forgotPassword = async (req, res) => {
  try {
    const { emailAddress } = req.body;

    const user = await User.findOne({ where: { emailAddress } });
    if (!user)
      return res.status(400).json({ message: "No user with that email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = Date.now() + 3600000; // 1 hour expiration

    user.passwordResetToken = resetToken;
    user.tokenExpires = tokenExpires;
    await user.save();

    // TODO: send email with reset token link
    // Example: `${CLIENT_URL}/reset-password/${resetToken}`

    res
      .status(200)
      .json({ message: "Password reset token generated. Check your email." });
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
    const { newPassword } = req.body;

    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        tokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.tokenExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/verify-email
 * Placeholder for additional auth flow (e.g., email verification)
 */
export const verifyEmail = async (req, res) => {
  // Example implementation depends on your flow
  res.status(200).json({ message: "Email verification flow placeholder" });
};

/**
 * authMiddleware.js
 *
 * Protects routes by verifying JWT token.
 * Can also check user roles for authorization.
 */

// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Middleware to verify JWT and attach user to request
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request object (exclude password)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

/**
 * Middleware to restrict access based on user role(s)
 * @param  {...string} roles - roles allowed to access the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
