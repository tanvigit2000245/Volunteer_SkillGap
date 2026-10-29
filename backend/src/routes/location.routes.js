import express from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove,
  addRequirementToLocation,
  updateLocationRequirement,
  deleteLocationRequirement,
} from "../controllers/location.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  validateLocation,
  validateRequirement,
} from "../validators/location.validator.js";

const router = express.Router();

// All routes require valid authentication
router.use(protect);

// Location read endpoints (accessible by volunteers, coordinators, and admins)
router.get("/", getAll);
router.get("/:id", getById);

// Location management (restricted to coordinators and admins)
router.post("/", restrictTo("admin", "coordinator"), validateLocation, create);
router.put("/:id", restrictTo("admin", "coordinator"), validateLocation, update);
router.delete("/:id", restrictTo("admin"), remove);

// Operational requirement management within a location
router.post(
  "/:id/requirements",
  restrictTo("admin", "coordinator"),
  validateRequirement,
  addRequirementToLocation
);
router.put(
  "/:id/requirements/:reqId",
  restrictTo("admin", "coordinator"),
  updateLocationRequirement
);
router.delete(
  "/:id/requirements/:reqId",
  restrictTo("admin", "coordinator"),
  deleteLocationRequirement
);

export default router;
