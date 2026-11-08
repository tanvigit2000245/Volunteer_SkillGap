
import jwt from "jsonwebtoken";

import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../services/auth.service.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

// Helper for consistent terminal logs
const log = {
  info: (message, data = "") =>
    console.log(`\n🟢 [AUTH SUCCESS] ${message}`, data),

  error: (message, error = "") =>
    console.error(`\n🔴 [AUTH ERROR] ${message}`, error),

  warning: (message) =>
    console.warn(`\n🟡 [AUTH WARNING] ${message}`),
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
  console.log("\n========== REGISTER REQUEST ==========");

  try {
    const { fullName, email, role } = req.body;

    console.log("📩 Registration request received");
    console.log("👤 Name:", fullName);
    console.log("📧 Email:", email);
    console.log("🔑 Role:", role);

    if (!email || !req.body.password || !fullName) {
      log.warning("Registration failed: Required fields are missing");

      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    console.log("🔍 Checking existing user...");

    const existing = await findUserByEmail(email);

    if (existing) {
      log.warning(`Registration failed: User already exists (${email})`);

      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    console.log("⚙️ Creating new user...");

    // const user = await createUser(req.body);
    const user = await createUser({
      ...req.body,
      role: "volunteer",
    });

    log.info("User registered successfully", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    console.log("======================================\n");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    log.error("Registration failed", {
      message: error.message,
      stack: error.stack,
    });

    console.log("======================================\n");

    return res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  console.log("\n========== LOGIN REQUEST ==========");

  try {
    const { email, password } = req.body;

    console.log("📩 Login request received");
    console.log("📧 Email:", email);

    if (!email || !password) {
      log.warning("Login failed: Email or password missing");

      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    console.log("🔍 Searching user in database...");

    const user = await findUserByEmail(email);

    if (!user) {
      log.warning(`Login failed: User not found (${email})`);

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("👤 User found:", user.email);
    console.log("🔐 Verifying password...");

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      log.warning(`Login failed: Incorrect password (${email})`);

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    log.info("Password verified successfully");

    console.log("🎟️ Generating access token...");

    const accessToken = generateAccessToken(user);

    console.log("🍪 Generating refresh token...");

    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth/refresh",
    });

    log.info("Refresh token cookie configured");

    log.info("Login successful", {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });

    console.log("===================================\n");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    log.error("Login failed", {
      message: error.message,
      stack: error.stack,
    });

    console.log("===================================\n");

    return res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// POST /api/auth/refresh
export const refreshAccessToken = async (req, res) => {
  console.log("\n========== REFRESH TOKEN REQUEST ==========");

  try {
    console.log("🍪 Checking refresh token cookie...");

    const token = req.cookies?.refreshToken;

    if (!token) {
      log.warning("Refresh token cookie not found");

      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    console.log("🔍 Verifying refresh token...");

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    if (decoded.tokenType !== "refresh" || !decoded.id) {
      log.warning("Invalid refresh token payload");

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    console.log("👤 Finding user...");

    const user = await findUserById(decoded.id);

    if (!user) {
      log.warning("Refresh failed: User no longer exists");

      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const newAccessToken = generateAccessToken(user);

    log.info("Access token refreshed successfully", {
      email: user.email,
      role: user.role,
    });

    console.log("==========================================\n");

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });

  } catch (error) {
    log.error("Refresh token failed", {
      message: error.message,
      name: error.name,
    });

    console.log("==========================================\n");

    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid",
    });
  }
};
