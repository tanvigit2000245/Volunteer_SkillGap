import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById } from "../services/auth.service.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { email } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ success: false, message: "Error creating user" });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in httpOnly cookie — only sent to the refresh endpoint
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: "/api/auth/refresh",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Error logging in" });
  }
};

// POST /api/auth/refresh
export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Refresh token missing" });
    }

    // Verify with the refresh secret
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (decoded.tokenType !== "refresh" || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      accessToken: generateAccessToken(user),
    });
  } catch (error) {
    console.error("Refresh token error:", error.name, error.message);
    return res.status(401).json({ success: false, message: "Refresh token expired or invalid" });
  }
};