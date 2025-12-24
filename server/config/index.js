// config/index.js
/**
 * Application Configuration
 * -------------------------
 * Centralized configuration for the application, including server settings,
 * database connection details, authentication parameters, and email service
 * configurations.
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config();

const env = process.env.NODE_ENV || "development";

const config = {
  env,
  server: {
    port: Number(process.env.PORT) || 5001,
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "supersecretkey",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  cookies: {
    secure: env === "production",
  },
  db: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.aol.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: env === "production",
    user: process.env.EMAIL_USER || "ttejuosho@aol.com",
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || '"Akubata Stores" <ttejuosho@aol.com>',
    templatesDir:
      process.env.EMAIL_TEMPLATES_DIR ||
      path.resolve("server", "emailTemplates"),
  },
};

export default config;
