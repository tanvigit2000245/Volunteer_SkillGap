import {
  generateDeploymentPlan,
  getDeploymentPlanById,
  listDeploymentPlans,
  manualOverrideAssignment,
  confirmDeploymentPlan,
} from "../services/planner.service.js";
import {
  runConstraintMatching,
  getCandidatesForLocation,
  calculateWeightedMatchScore,
  checkAvailabilityDetailed,
} from "../services/matching.service.js";
import Location from "../models/Location.js";
import Volunteer from "../models/Volunteer.js";
import Assignment from "../models/Assignment.js";
import { releaseExpiredAssignments, isDeploymentOver } from "../services/location.service.js";

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

/**
 * Get skill-matched candidates for a specific location
 */
export const getLocationCandidates = async (req, res) => {
  try {
    const { locationId } = req.params;
    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: "locationId parameter is required",
      });
    }

    const result = await getCandidatesForLocation(locationId);

    return res.status(200).json({
      success: true,
      message: "Skill-matched candidates retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get location candidates error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve candidates",
    });
  }
};

/**
 * Manually assign a volunteer to a service location (from the Candidate Matching Pool)
 * Persists the assignment in MongoDB so the volunteer is marked as assigned
 * and cannot be double-booked to other sites on the same date.
 */
export const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId, locationId, requirementId, task } = req.body;

    if (!volunteerId || !locationId) {
      return res.status(400).json({
        success: false,
        message: "volunteerId and locationId are required",
      });
    }

    // Automatically release expired assignments before making new assignments
    await releaseExpiredAssignments();

    const [volunteer, location] = await Promise.all([
      Volunteer.findById(volunteerId).populate("user", "fullName email role"),
      Location.findById(locationId),
    ]);

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    // Check if the shift has already concluded
    if (isDeploymentOver(location.date, location.shiftEnd)) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign candidate: this deployment site's shift date and time has already ended.",
      });
    }

    // 1. Check if volunteer is already assigned to this site
    const existingHere = await Assignment.findOne({
      location: locationId,
      volunteer: volunteerId,
      status: { $in: ["PROPOSED", "CONFIRMED"] },
    });
    if (existingHere) {
      return res.status(400).json({
        success: false,
        message: "Volunteer is already assigned to this deployment site",
        data: existingHere,
      });
    }

    // 1b. Capacity check: enforce requiredCount cap per requirement/location
    const reqDoc = requirementId
      ? location.requirements.id(requirementId)
      : location.requirements[0];
    const totalRequired = location.requirements.reduce((s, r) => s + (r.requiredCount || 1), 0);
    const confirmedCount = await Assignment.countDocuments({
      location: locationId,
      status: { $in: ["PROPOSED", "CONFIRMED"] },
    });
    if (confirmedCount >= totalRequired) {
      return res.status(400).json({
        success: false,
        message: `This site already has ${confirmedCount}/${totalRequired} volunteers assigned. The required capacity is full.`,
      });
    }

    // 2. Cross-site double booking check: is volunteer assigned to another site on the same date?
    const locDateStr = location.date ? new Date(location.date).toISOString().split("T")[0] : null;
    const activeAssignments = await Assignment.find({
      volunteer: volunteerId,
      location: { $ne: locationId },
      status: { $in: ["PROPOSED", "CONFIRMED"] },
    }).populate("location", "name date shiftStart shiftEnd");

    const crossSiteConflict = activeAssignments.find((a) => {
      if (!a.location) return false;
      if (!a.location?.date || !locDateStr) return true;
      const otherDateStr = new Date(a.location.date).toISOString().split("T")[0];
      return otherDateStr === locDateStr;
    });

    if (crossSiteConflict) {
      return res.status(409).json({
        success: false,
        message: `Conflict: Volunteer is already assigned to ${crossSiteConflict.location.name} on this date. Double-booking prevented.`,
      });
    }

    // 3. Compute score breakdown
    const volSkill = (volunteer.skills || []).find((s) => s.skillName || s.skill);
    const prof = volSkill?.proficiency || 3;
    const availRes = checkAvailabilityDetailed(volunteer, location.date, location.shiftStart, location.shiftEnd);
    const scoring = calculateWeightedMatchScore(volunteer, location, reqDoc || { minProficiency: 1 }, prof, availRes);

    // 4. Save assignment in MongoDB
    const assignment = await Assignment.create({
      volunteer: volunteerId,
      location: locationId,
      requirementId: reqDoc?._id || null,
      task: task || reqDoc?.task || "Disaster Response Support",
      status: "CONFIRMED",
      matchScore: scoring.matchScore,
      scoreBreakdown: scoring.scoreBreakdown,
      isManualOverride: false,
    });

    const populated = await Assignment.findById(assignment._id)
      .populate({ path: "volunteer", populate: { path: "user", select: "fullName email" } })
      .populate("location", "name address city date shiftStart shiftEnd");

    return res.status(201).json({
      success: true,
      message: `Volunteer ${volunteer.user?.fullName || ""} assigned successfully to ${location.name}`,
      data: populated,
    });
  } catch (error) {
    console.error("Assign volunteer error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to assign volunteer",
    });
  }
};

/**
 * Auto-assign candidate(s) with the best matching percentage to a deployment site
 * If there are more eligible candidates than required, select top candidates by matchScore
 */
export const assignBestCandidates = async (req, res) => {
  try {
    const { locationId } = req.body;
    if (!locationId) {
      return res.status(400).json({ success: false, message: "locationId is required" });
    }

    await releaseExpiredAssignments();

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    if (isDeploymentOver(location.date, location.shiftEnd)) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign: deployment shift has already ended.",
      });
    }

    const candidateData = await getCandidatesForLocation(locationId);
    const totalRequired = candidateData.totalRequired || 1;
    const assignedCount = candidateData.assignedCount || 0;
    const remainingSlots = Math.max(0, totalRequired - assignedCount);

    if (remainingSlots === 0) {
      return res.status(400).json({
        success: false,
        message: `This location is already at full capacity (${assignedCount}/${totalRequired}).`,
      });
    }

    // Filter unassigned eligible candidates (already sorted descending by matchScore)
    const eligibleUnassigned = (candidateData.eligible || []).filter(
      (c) => !c.isAlreadyAssigned && !c.isDoubleBooked
    );

    if (eligibleUnassigned.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No unassigned eligible candidates available for this location.",
      });
    }

    // Pick top candidates with best matching percentage up to remaining slots
    const toAssign = eligibleUnassigned.slice(0, remainingSlots);
    const createdAssignments = [];
    const reqDoc = location.requirements?.[0];

    for (const cand of toAssign) {
      const assignment = await Assignment.create({
        volunteer: cand.volunteerId,
        location: locationId,
        requirementId: reqDoc?._id || null,
        task: reqDoc?.task || "Disaster Response Support",
        status: "CONFIRMED",
        matchScore: cand.matchScore,
        scoreBreakdown: cand.scoreBreakdown,
        isManualOverride: false,
      });
      createdAssignments.push(assignment);
    }

    return res.status(201).json({
      success: true,
      message: `Assigned top ${toAssign.length} candidate(s) with best matching percentage: ${toAssign.map((c) => `${c.volunteerName} (${c.matchScore}%)`).join(", ")}`,
      data: {
        assignedCandidates: toAssign,
        assignments: createdAssignments,
      },
    });
  } catch (error) {
    console.error("Assign best candidates error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to auto-assign best candidates",
    });
  }
};

/**
 * Reject or cancel a volunteer's assignment
 */
export const rejectVolunteerAssignment = async (req, res) => {
  try {
    const { assignmentId, volunteerId, locationId, reason } = req.body;

    let assignment = null;
    if (assignmentId) {
      assignment = await Assignment.findById(assignmentId);
    } else if (volunteerId && locationId) {
      assignment = await Assignment.findOne({
        volunteer: volunteerId,
        location: locationId,
      });
    }

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    assignment.status = "REJECTED";
    if (reason) {
      assignment.overrideReason = reason;
    }
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment status updated to REJECTED",
      data: assignment,
    });
  } catch (error) {
    console.error("Reject assignment error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update assignment",
    });
  }
};
