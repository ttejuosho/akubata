/**
 * authMiddleware.js
 *
 * Protects routes by verifying JWT token.
 * Can also check user roles for authorization.
 */

/**
 * Middleware to verify JWT and attach user to request
 */
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // --- 1. Decode without verification ---
  const decodedSoft = jwt.decode(token);
  if (!decodedSoft) {
    return res.status(401).json({ message: "Malformed token" });
  }

  // --- 2. Check expiration ---
  const now = Math.floor(Date.now() / 1000);
  if (decodedSoft.exp && decodedSoft.exp < now) {
    return res.status(401).json({ message: "Token expired" });
  }

  // --- 3. Verify signature safely ---
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT signature invalid:", err.message);
    return res.status(401).json({ message: "Invalid token signature" });
  }

  // --- 4. Load user from DB ---
  try {
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error finding user:", err);
    return res.status(500).json({ message: "Server error" });
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

export const roleBasedResponse = (handlers) => {
  return (req, res, next) => {
    const role = req.user?.role;

    const handler = handlers[role] || handlers.default;
    if (!handler) {
      return res.status(403).json({ message: "Forbidden for your role" });
    }

    return handler(req, res, next);
  };
};
