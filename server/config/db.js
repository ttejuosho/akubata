// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import config from "./index.js";
dotenv.config();

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    port: config.db.port,
    logging: config.db.logging,
    pool: config.db.pool,
  }
);

export default sequelize;
