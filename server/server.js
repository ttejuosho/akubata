import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/authRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import suppliersRoutes from "./routes/suppliersRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin
    credentials: true, // if you need cookies
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/addresses", addressRoutes);

app.get("/", (req, res) => res.send("Akubata API is running..."));

// Sync DB
sequelize
  .sync({ reset: true }) // { force: true } if you want to reset DB
  .then(() => {
    console.log("Database synced");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));
