import express from "express";
import {
  getDeploymentSheet,
  exportExcel,
  exportPdf,
} from "../controllers/report.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected reports endpoints for Coordinators and Admins
router.use(protect);
router.use(restrictTo("admin", "coordinator"));

// Get deployment sheet data (JSON)
router.get("/sheet/:runId", getDeploymentSheet);

// Download Excel report (.xlsx)
router.get("/export/excel/:runId", exportExcel);

// Download PDF report (.pdf)
router.get("/export/pdf/:runId", exportPdf);

export default router;
