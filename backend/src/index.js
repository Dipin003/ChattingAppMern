import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messageRoute from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server , io} from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

// Connect to Database before starting the server
connectDB()
  .then(() => {
    console.log("✅ Database Connected Successfully!");

    // CORS Middleware
    app.use(
      cors({
        origin: "http://localhost:5175", // Allow requests from frontend
        credentials: true, // Allow cookies and authentication headers
        methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
      })
    );

    // Middleware for JSON and Cookies
    app.use(express.json({ limit: "50mb" })); // Prevents PayloadTooLargeError
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use(cookieParser());

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/message", messageRoute);

    // Global Error Handler (Prevents Crashes)
    app.use((err, req, res, next) => {
      console.error("🚨 Server Error:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    });

    // Start the Server
    server.listen(PORT, () => {
      console.log(`🚀 Server Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1); // Exit if DB fails
  });
