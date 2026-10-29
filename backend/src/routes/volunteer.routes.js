import express from "express";
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getAll,
  getById,
} from "../controllers/volunteer.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateVolunteerProfile } from "../validators/volunteer.validator.js";

const router = express.Router();

// All routes require valid JWT authentication
router.use(protect);

// Volunteer Self-Service Routes
router.post("/profile", validateVolunteerProfile, createProfile);
router.get("/profile/me", getMyProfile);
router.put("/profile/me", validateVolunteerProfile, updateMyProfile);
router.delete("/profile/me", deleteMyProfile);

// Coordinator & Admin Volunteer Directory Routes
router.get("/all", restrictTo("admin", "coordinator"), getAll);
router.get("/:id", restrictTo("admin", "coordinator"), getById);

export default router;
