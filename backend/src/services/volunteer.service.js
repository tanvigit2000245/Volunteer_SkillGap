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
 * Get volunteer profile for the logged in user
 */
export const getVolunteerProfile = async (userId) => {
  return Volunteer.findOne({ user: userId }).populate(populateOptions);
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
