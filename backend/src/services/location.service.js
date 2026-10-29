import Location from "../models/Location.js";

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

  return {
    locations,
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
