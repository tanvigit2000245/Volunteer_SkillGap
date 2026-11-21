import Location from "../models/Location.js";
import Assignment from "../models/Assignment.js";

/**
 * Checks whether a location's deployment date and shift end time has passed.
 */
export const isDeploymentOver = (date, shiftEnd) => {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);
  const [endHours, endMinutes] = (shiftEnd || "17:00")
    .split(":")
    .map((v) => parseInt(v, 10) || 0);

  // Construct shift end timestamp in local system time
  const shiftEndTimestamp = new Date(year, month - 1, day, endHours, endMinutes, 0, 0);

  return now.getTime() > shiftEndTimestamp.getTime();
};

/**
 * Finds all active/confirmed assignments whose location shift is over,
 * marks them as COMPLETED, and releases the volunteers back to AVAILABLE.
 * Also marks past locations as COMPLETED.
 */
export const releaseExpiredAssignments = async () => {
  try {
    // 1. Release expired assignments whose shift has ended
    const activeAssignments = await Assignment.find({
      status: { $in: ["PROPOSED", "CONFIRMED"] },
    }).populate("location", "date shiftEnd status");

    const expiredAssignmentIds = [];
    for (const a of activeAssignments) {
      if (!a.location) continue;
      if (isDeploymentOver(a.location.date, a.location.shiftEnd)) {
        expiredAssignmentIds.push(a._id);
      }
    }

    if (expiredAssignmentIds.length > 0) {
      await Assignment.updateMany(
        { _id: { $in: expiredAssignmentIds } },
        { $set: { status: "COMPLETED" } }
      );
    }

    // 2. Mark past locations as COMPLETED
    const activeLocations = await Location.find({
      status: { $in: ["UPCOMING", "ACTIVE"] },
    });

    const expiredLocationIds = [];
    for (const loc of activeLocations) {
      if (isDeploymentOver(loc.date, loc.shiftEnd)) {
        expiredLocationIds.push(loc._id);
      }
    }

    if (expiredLocationIds.length > 0) {
      await Location.updateMany(
        { _id: { $in: expiredLocationIds } },
        { $set: { status: "COMPLETED" } }
      );
    }

    return {
      releasedCount: expiredAssignmentIds.length,
      completedLocationsCount: expiredLocationIds.length,
    };
  } catch (error) {
    console.error("Error releasing expired assignments:", error);
    return { releasedCount: 0, completedLocationsCount: 0 };
  }
};

/**
 * Create a new service location with optional operational requirements
 */
export const createLocation = async (data) => {
  return Location.create(data);
};

/**
 * Get all locations with filtering and date sorting
 */
export const getAllLocations = async (query = {}) => {
  // Automatically release volunteers and update past locations
  await releaseExpiredAssignments();

  const { status, city, date, page = 1, limit = 20 } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (city) {
    filter.city = { $regex: new RegExp(city, "i") };
  }

  if (date) {
    const targetDate = new Date(date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    filter.date = { $gte: targetDate, $lt: nextDate };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [locations, total] = await Promise.all([
    Location.find(filter)
      .sort({ date: 1, shiftStart: 1 })
      .skip(skip)
      .limit(limitNum),
    Location.countDocuments(filter),
  ]);

  // Enrich each location with real database assignment metrics
  const locIds = locations.map((l) => l._id);
  const activeAssignments = await Assignment.find({
    location: { $in: locIds },
    status: { $in: ["PROPOSED", "CONFIRMED"] },
  });

  const countByLoc = new Map();
  for (const a of activeAssignments) {
    const lid = a.location.toString();
    countByLoc.set(lid, (countByLoc.get(lid) || 0) + 1);
  }

  const enrichedLocations = locations.map((loc) => {
    const locObj = loc.toObject ? loc.toObject() : loc;
    const assignedCount = countByLoc.get(loc._id.toString()) || 0;
    const totalRequired = (loc.requirements || []).reduce((s, r) => s + (r.requiredCount || 1), 0) || 1;
    const coverage = assignedCount > 0 ? Math.min(100, Math.round((assignedCount / totalRequired) * 100)) : 0;
    return {
      ...locObj,
      assignedCount,
      totalRequired,
      coverage,
      isSiteFull: assignedCount >= totalRequired,
    };
  });

  return {
    locations: enrichedLocations,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a specific location by ID
 */
export const getLocationById = async (id) => {
  return Location.findById(id);
};

/**
 * Update location details
 */
export const updateLocation = async (id, data) => {
  return Location.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

/**
 * Delete a location
 */
export const deleteLocation = async (id) => {
  return Location.findByIdAndDelete(id);
};

/**
 * Add a new operational requirement to an existing location
 */
export const addRequirement = async (locationId, requirementData) => {
  const location = await Location.findById(locationId);
  if (!location) {
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  location.requirements.push(requirementData);
  await location.save();
  return location;
};

/**
 * Update a requirement in a location
 */
export const updateRequirement = async (locationId, requirementId, updateData) => {
  const location = await Location.findById(locationId);
  if (!location) {
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  const reqDoc = location.requirements.id(requirementId);
  if (!reqDoc) {
    const error = new Error("Requirement not found in this location");
    error.statusCode = 404;
    throw error;
  }

  Object.assign(reqDoc, updateData);
  await location.save();
  return location;
};

/**
 * Remove a requirement from a location
 */
export const removeRequirement = async (locationId, requirementId) => {
  const location = await Location.findById(locationId);
  if (!location) {
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  location.requirements.pull({ _id: requirementId });
  await location.save();
  return location;
};
