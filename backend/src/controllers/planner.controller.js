import {
  generateDeploymentPlan,
  getDeploymentPlanById,
  listDeploymentPlans,
  manualOverrideAssignment,
  confirmDeploymentPlan,
} from "../services/planner.service.js";
import { runConstraintMatching } from "../services/matching.service.js";
import Location from "../models/Location.js";

/**
 * Preview / test constraint matching without persisting a run
 */
export const previewMatching = async (req, res) => {
  try {
    const { locationIds } = req.body;
    if (!locationIds || !Array.isArray(locationIds) || locationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "locationIds array is required",
      });
    }

    const locations = await Location.find({ _id: { $in: locationIds } });
    const result = await runConstraintMatching(locations);

    return res.status(200).json({
      success: true,
      message: "Constraint matching executed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Preview matching error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to execute constraint matching",
    });
  }
};

/**
 * Generate a new deployment plan (saves run, assignments, and skill gaps)
 */
export const generate = async (req, res) => {
  try {
    const plan = await generateDeploymentPlan({
      locationIds: req.body.locationIds,
      targetDate: req.body.targetDate,
      title: req.body.title,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Deployment plan generated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Generate deployment plan error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to generate deployment plan",
    });
  }
};

/**
 * List all deployment plans
 */
export const getAllRuns = async (req, res) => {
  try {
    const runs = await listDeploymentPlans();

    return res.status(200).json({
      success: true,
      message: "Deployment runs retrieved successfully",
      data: runs,
    });
  } catch (error) {
    console.error("Get deployment runs error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve deployment runs",
    });
  }
};

/**
 * Get detailed deployment plan by run ID
 */
export const getRun = async (req, res) => {
  try {
    const plan = await getDeploymentPlanById(req.params.runId);

    return res.status(200).json({
      success: true,
      message: "Deployment plan retrieved successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Get deployment plan by ID error:", error.message);
    return res.status(error.statusCode || 404).json({
      success: false,
      message: error.message || "Deployment plan not found",
    });
  }
};

/**
 * Coordinator manual override of an assignment with audit logging
 */
export const override = async (req, res) => {
  try {
    const { runId, assignmentId, newVolunteerId, overrideReason, overriddenConstraint } = req.body;

    const assignment = await manualOverrideAssignment({
      runId,
      assignmentId,
      newVolunteerId,
      coordinatorId: req.user.id,
      overrideReason,
      overriddenConstraint,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment manually overridden and logged to audit trail",
      data: assignment,
    });
  } catch (error) {
    console.error("Manual override error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to override assignment",
    });
  }
};

/**
 * Confirm a deployment plan
 */
export const confirm = async (req, res) => {
  try {
    const run = await confirmDeploymentPlan(req.params.runId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Deployment plan successfully confirmed",
      data: run,
    });
  } catch (error) {
    console.error("Confirm deployment plan error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to confirm deployment plan",
    });
  }
};
