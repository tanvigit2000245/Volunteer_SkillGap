import DeploymentRun from "../models/DeploymentRun.js";
import Assignment from "../models/Assignment.js";
import SkillGap from "../models/SkillGap.js";
import Location from "../models/Location.js";
import Volunteer from "../models/Volunteer.js";
import { runConstraintMatching, evaluateHardConstraints } from "./matching.service.js";

/**
 * Generate a proposed deployment plan across specified locations
 */
export const generateDeploymentPlan = async ({ locationIds, targetDate, userId, title }) => {
  if (!locationIds || !Array.isArray(locationIds) || locationIds.length === 0) {
    const error = new Error("At least one location ID is required to generate a deployment plan");
    error.statusCode = 400;
    throw error;
  }

  // Load locations and their requirements
  const locations = await Location.find({ _id: { $in: locationIds } });
  if (locations.length === 0) {
    const error = new Error("None of the specified locations were found");
    error.statusCode = 404;
    throw error;
  }

  // Execute constraint matching and gap analysis
  const matchingResult = await runConstraintMatching(locations);

  // Calculate total required headcount across all location requirements
  let totalRequiredHeadcount = 0;
  for (const loc of locations) {
    for (const req of loc.requirements) {
      totalRequiredHeadcount += req.requiredCount || 1;
    }
  }

  // Create DeploymentRun document
  const run = await DeploymentRun.create({
    title: title || `Deployment Plan - ${new Date(targetDate || Date.now()).toISOString().split("T")[0]}`,
    targetDate: targetDate || locations[0].date,
    locations: locationIds,
    status: "PROPOSED",
    createdBy: userId,
    summary: {
      totalRequiredHeadcount,
      totalAssignedHeadcount: matchingResult.proposedAssignments.length,
      totalGaps: matchingResult.detectedSkillGaps.length,
      totalOverrides: 0,
      solver: matchingResult.stats?.engineUsed || "LOCAL_GREEDY_HEURISTIC",
      computationTimeMs: matchingResult.stats?.computationTimeMs || 0,
    },
  });

  // Prepare and bulk-insert proposed assignments
  if (matchingResult.proposedAssignments.length > 0) {
    const assignmentDocs = matchingResult.proposedAssignments.map((a) => ({
      run: run._id,
      volunteer: a.volunteerId,
      location: a.locationId,
      requirementId: a.requirementId,
      task: a.task,
      status: "PROPOSED",
      matchScore: a.matchScore,
      scoreBreakdown: a.scoreBreakdown,
      isManualOverride: false,
    }));
    await Assignment.insertMany(assignmentDocs);
  }

  // Prepare and bulk-insert detected skill gaps
  if (matchingResult.detectedSkillGaps.length > 0) {
    const gapDocs = matchingResult.detectedSkillGaps.map((g) => ({
      run: run._id,
      location: g.locationId,
      requirementId: g.requirementId,
      task: g.task,
      requiredSkill: g.requiredSkill,
      requiredLanguage: g.requiredLanguage,
      required: g.required,
      assigned: g.assigned,
      shortage: g.shortage,
      explanation: g.explanation,
    }));
    await SkillGap.insertMany(gapDocs);
  }

  return getDeploymentPlanById(run._id);
};

/**
 * Fetch complete deployment plan with assignments and gaps
 */
export const getDeploymentPlanById = async (runId) => {
  const run = await DeploymentRun.findById(runId)
    .populate("locations")
    .populate("createdBy", "fullName email role")
    .populate("confirmedBy", "fullName email role");

  if (!run) {
    const error = new Error("Deployment run not found");
    error.statusCode = 404;
    throw error;
  }

  const [assignments, skillGaps] = await Promise.all([
    Assignment.find({ run: runId })
      .populate({
        path: "volunteer",
        populate: { path: "user", select: "fullName email role" },
      })
      .populate("location", "name address date shiftStart shiftEnd")
      .populate("overriddenBy", "fullName email"),
    SkillGap.find({ run: runId }).populate("location", "name date shiftStart shiftEnd"),
  ]);

  return {
    run,
    assignments,
    skillGaps,
  };
};

/**
 * List all deployment runs
 */
export const listDeploymentPlans = async () => {
  return DeploymentRun.find()
    .populate("locations", "name date city")
    .populate("createdBy", "fullName email")
    .sort({ createdAt: -1 });
};

/**
 * Coordinator manual override: reassigns volunteer with logged audit trail
 */
export const manualOverrideAssignment = async ({
  runId,
  assignmentId,
  newVolunteerId,
  coordinatorId,
  overrideReason,
  overriddenConstraint,
}) => {
  if (!assignmentId || !newVolunteerId || !overrideReason) {
    const error = new Error("assignmentId, newVolunteerId, and overrideReason are required");
    error.statusCode = 400;
    throw error;
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, run: runId });
  if (!assignment) {
    const error = new Error("Assignment not found for this deployment run");
    error.statusCode = 404;
    throw error;
  }

  // Fetch location and specific requirement to verify non-overridable rules
  const location = await Location.findById(assignment.location);
  const requirement = location?.requirements?.id(assignment.requirementId);

  // Check safety-critical non-overridable rule
  if (requirement?.isSafetyCritical) {
    const error = new Error(
      `Non-Overridable Constraint: Task '${assignment.task}' is marked as safety-critical and cannot be manually overridden.`
    );
    error.statusCode = 403;
    throw error;
  }

  const newVolunteer = await Volunteer.findById(newVolunteerId).populate("user", "fullName email");
  if (!newVolunteer) {
    const error = new Error("Replacement volunteer profile not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if replacement volunteer has constraint warnings
  const evalResult = requirement
    ? evaluateHardConstraints(
        newVolunteer,
        requirement,
        location.date,
        location.shiftStart,
        location.shiftEnd
      )
    : { eligible: true, failureReasons: [] };

  const warnings = evalResult.failureReasons.map(
    (reason) => `Manual override bypassed constraint: ${reason}`
  );

  // Apply override and log coordinator audit trail
  assignment.volunteer = newVolunteerId;
  assignment.isManualOverride = true;
  assignment.overriddenBy = coordinatorId;
  assignment.overrideReason = overrideReason;
  assignment.overriddenConstraint =
    overriddenConstraint || (evalResult.failureReasons.join(", ") || "COORDINATOR_DISCRETION");
  assignment.overriddenAt = new Date();
  assignment.warnings = warnings;

  await assignment.save();

  // Increment override count in DeploymentRun summary
  await DeploymentRun.findByIdAndUpdate(runId, {
    $inc: { "summary.totalOverrides": 1 },
  });

  return assignment.populate([
    { path: "volunteer", populate: { path: "user", select: "fullName email" } },
    { path: "overriddenBy", select: "fullName email" },
  ]);
};

/**
 * Confirm a proposed deployment plan
 */
export const confirmDeploymentPlan = async (runId, coordinatorId) => {
  const run = await DeploymentRun.findById(runId);
  if (!run) {
    const error = new Error("Deployment run not found");
    error.statusCode = 404;
    throw error;
  }

  run.status = "CONFIRMED";
  run.confirmedBy = coordinatorId;
  run.confirmedAt = new Date();
  await run.save();

  // Update status of all associated assignments
  await Assignment.updateMany({ run: runId }, { $set: { status: "CONFIRMED" } });

  return run;
};
