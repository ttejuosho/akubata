// models/User.js
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import config from "../config/index.js";

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue("emailAddress", value.toLowerCase());
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // remove if you want duplicates
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "manager", "staff", "basic"),
      defaultValue: "basic",
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,

    defaultScope: {
      attributes: {
        exclude: ["password", "passwordResetToken", "tokenExpires"],
      },
    },
  }
);

// 🔐 Hash password before save
User.beforeSave(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// 🔍 Instance methods
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.generateJWT = function () {
  const payload = {
    userId: this.userId,
    emailAddress: this.emailAddress,
    role: this.role,
  };

  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
};

export default User;
