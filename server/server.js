import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { connectToDatabase, syncDatabase } from "./db/index.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import suppliersRoutes from "./routes/suppliersRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

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
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("Akubata API is running..."));

const server = http.createServer(app);

// SOCKET.IO SETUP
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Authenticate socket connections using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Handle connected sockets
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.userId);

  // Join a conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Leave a conversation
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
  });

  // Handle incoming message
  socket.on("sendMessage", async ({ conversationId, content }) => {
    const senderId = socket.user.userId;

    // DB save
    const message = await Messages.create({
      messageId: uuidv4(),
      conversationId,
      senderId,
      content,
      isRead: false,
    });

    // Broadcast to all participants in the room
    io.to(conversationId).emit("newMessage", message);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.user.userId);
  });
});

// Sync DB
const startServer = async () => {
  try {
    await connectToDatabase();
    await syncDatabase();

    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
