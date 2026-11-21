import express from "express";
import {
  previewMatching,
  generate,
  getAllRuns,
  getRun,
  override,
  confirm,
  getLocationCandidates,
  assignVolunteer,
  assignBestCandidates,
  rejectVolunteerAssignment,
} from "../controllers/planner.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// All planner endpoints require authentication
router.use(protect);

// Get skill-matched candidates for a specific location (accessible to all authenticated users)
router.get("/candidates/:locationId", getLocationCandidates);

// Coordinator & Admin only actions
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

// Direct volunteer assignment from Candidate Matching Pool
router.post("/assign", assignVolunteer);

// Auto-assign top candidate(s) with best matching percentage
router.post("/assign-best", assignBestCandidates);

// Reject / cancel volunteer assignment
router.post("/reject", rejectVolunteerAssignment);

export default router;
