import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import volunteerRoutes from "./src/routes/volunteer.routes.js";
import locationRoutes from "./src/routes/location.routes.js";
import plannerRoutes from "./src/routes/planner.routes.js";
import reportRoutes from "./src/routes/report.routes.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (_req, res) => res.json({ success: true, message: "API is running..." }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/reports", reportRoutes);


// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));