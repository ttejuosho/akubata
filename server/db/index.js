import sequelize from "../config/db.js";

/**
 * Establish a connection to the database.
 */
export const connectToDatabase = async () => {
  await sequelize.authenticate();
  console.log("MySQL connection established successfully.");
};

/**
 * Synchronize all defined models with the database.
 * @param {import("sequelize").SyncOptions} [options]
 */
export const syncDatabase = async (options = {}) => {
  await sequelize.sync(options);
  console.log("Database synced");
};

/**
 * Close the database connection.
 */
export const closeDatabase = async () => {
  await sequelize.close();
  console.log("Database connection closed.");
};

export { sequelize };
