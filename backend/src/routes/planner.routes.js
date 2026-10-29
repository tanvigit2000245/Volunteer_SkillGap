import express from "express";
import {
  previewMatching,
  generate,
  getAllRuns,
  getRun,
  override,
  confirm,
} from "../controllers/planner.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// All planner endpoints require authentication and Coordinator or Admin role
router.use(protect);
router.use(restrictTo("admin", "coordinator"));

// Preview matching without saving
router.post("/match", previewMatching);

// Generate new deployment plan
router.post("/generate", generate);

// List and view deployment plans
router.get("/runs", getAllRuns);
router.get("/runs/:runId", getRun);

// Coordinator manual override with audit logging
router.post("/override", override);

// Confirm deployment plan
router.post("/confirm/:runId", confirm);

export default router;
