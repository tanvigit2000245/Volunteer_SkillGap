import Volunteer from "../models/Volunteer.js";

const populateOptions = [{ path: "user", select: "fullName email role" }];

/**
 * Create a new volunteer profile
 */
export const createVolunteerProfile = async (userId, data) => {
  const existing = await Volunteer.findOne({ user: userId });
  if (existing) {
    const error = new Error("Volunteer profile already exists");
    error.statusCode = 409;
    throw error;
  }

  const volunteer = await Volunteer.create({ ...data, user: userId });
  return Volunteer.findById(volunteer._id).populate(populateOptions);
};

/**
 * Get volunteer profile for the logged in user, enriched with deployment status,
 * active assignments, and matched service locations.
 */
export const getVolunteerProfile = async (userId) => {
  const volunteer = await Volunteer.findOne({ user: userId }).populate(populateOptions);
  if (!volunteer) return null;

  const { default: Assignment } = await import("../models/Assignment.js");
  const { default: Location } = await import("../models/Location.js");
  const { default: DeploymentRun } = await import("../models/DeploymentRun.js");
  const { skillsMatch } = await import("./matching.service.js");
  const { releaseExpiredAssignments } = await import("./location.service.js");

  // Release any assignments whose shift end time has passed
  await releaseExpiredAssignments();

  // Fetch active and past assignments across deployment sites
  const assignments = await Assignment.find({
    volunteer: volunteer._id,
    status: { $in: ["PROPOSED", "CONFIRMED", "REJECTED", "COMPLETED"] },
  })
    .populate("location", "name address city date shiftStart shiftEnd status")
    .populate("run", "title targetDate status")
    .sort({ createdAt: -1 });

  const hasConfirmed = assignments.some((a) => a.status === "CONFIRMED");
  const hasProposed = assignments.some((a) => a.status === "PROPOSED");
  const hasRejected = !hasConfirmed && !hasProposed && assignments.some((a) => a.status === "REJECTED");
  const deploymentStatus = hasConfirmed
    ? "CONFIRMED"
    : hasProposed
    ? "PROPOSED"
    : hasRejected
    ? "REJECTED"
    : "AVAILABLE";

  // Find upcoming service locations matching volunteer's skills
  const volSkills = volunteer.skills || [];
  const allLocations = await Location.find({ status: { $in: ["UPCOMING", "ACTIVE"] } });

  const matchedLocations = allLocations
    .filter((loc) =>
      (loc.requirements || []).some((req) =>
        volSkills.some((s) => skillsMatch(s.skillName || s.skill || "", req.requiredSkill))
      )
    )
    .map((loc) => {
      const matchingReqs = (loc.requirements || []).filter((req) =>
        volSkills.some((s) => skillsMatch(s.skillName || s.skill || "", req.requiredSkill))
      );
      return {
        id: loc._id,
        name: loc.name,
        city: loc.city || loc.address || "",
        date: loc.date,
        shiftStart: loc.shiftStart,
        shiftEnd: loc.shiftEnd,
        status: loc.status,
        matchingSkills: matchingReqs.map((r) => r.requiredSkill),
      };
    });

  const volObj = volunteer.toObject();
  // Map assignments to plain objects with a consistent `reason` field
  const assignmentsMapped = assignments.map((a) => {
    const obj = a.toObject ? a.toObject() : a;
    return {
      ...obj,
      reason: obj.overrideReason || null,
    };
  });
  return {
    ...volObj,
    assignments: assignmentsMapped,
    deploymentStatus,
    matchedLocations,
  };
};

/**
 * Get volunteer profile by profile ID or Auth user ID
 */
export const getVolunteerById = async (id) => {
  // Check if id matches volunteer doc ID or user ref ID
  let volunteer = await Volunteer.findById(id).populate(populateOptions);
  if (!volunteer) {
    volunteer = await Volunteer.findOne({ user: id }).populate(populateOptions);
  }
  return volunteer;
};

/**
 * Update volunteer profile for the logged in user
 */
export const updateVolunteerProfile = async (userId, data) => {
  const allowedFields = [
    "mobilityLevel",
    "experienceYears",
    "phone",
    "homeAddress",
    "skills",
    "languages",
    "availability",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  return Volunteer.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate(populateOptions);
};

/**
 * Delete volunteer profile
 */
export const deleteVolunteerProfile = async (userId) => {
  return Volunteer.findOneAndDelete({ user: userId });
};

/**
 * List all volunteers with optional filters (for Admin / Coordinator)
 */
export const getAllVolunteers = async (query = {}) => {
  const { skill, language, mobilityLevel, minExperience, page = 1, limit = 20 } = query;

  const filter = {};

  if (mobilityLevel) {
    filter.mobilityLevel = mobilityLevel;
  }

  if (minExperience !== undefined && !isNaN(minExperience)) {
    filter.experienceYears = { $gte: Number(minExperience) };
  }

  if (skill) {
    // Match skillName or skill field
    filter.$or = [
      { "skills.skillName": { $regex: new RegExp(skill, "i") } },
      { "skills.skill": { $regex: new RegExp(skill, "i") } },
    ];
  }

  if (language) {
    filter["languages.language"] = { $regex: new RegExp(language, "i") };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [volunteers, total] = await Promise.all([
    Volunteer.find(filter)
      .populate(populateOptions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Volunteer.countDocuments(filter),
  ]);

  return {
    volunteers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};
