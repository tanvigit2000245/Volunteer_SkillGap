import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  addRequirement,
  updateRequirement,
  removeRequirement,
} from "../services/location.service.js";

export const create = async (req, res) => {
  try {
    const location = await createLocation(req.body);

    return res.status(201).json({
      success: true,
      message: "Service location created successfully",
      data: location,
    });
  } catch (error) {
    console.error("Create location error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create location",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const result = await getAllLocations(req.query);

    return res.status(200).json({
      success: true,
      message: "Locations retrieved successfully",
      data: result.locations,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get all locations error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve locations",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const location = await getLocationById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location retrieved successfully",
      data: location,
    });
  } catch (error) {
    console.error("Get location by ID error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve location",
    });
  }
};

export const update = async (req, res) => {
  try {
    const location = await updateLocation(req.params.id, req.body);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: location,
    });
  } catch (error) {
    console.error("Update location error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update location",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const location = await deleteLocation(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Delete location error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete location",
    });
  }
};

export const addRequirementToLocation = async (req, res) => {
  try {
    const location = await addRequirement(req.params.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Requirement added to location successfully",
      data: location,
    });
  } catch (error) {
    console.error("Add requirement error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to add requirement",
    });
  }
};

export const updateLocationRequirement = async (req, res) => {
  try {
    const location = await updateRequirement(
      req.params.id,
      req.params.reqId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Location requirement updated successfully",
      data: location,
    });
  } catch (error) {
    console.error("Update requirement error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update requirement",
    });
  }
};

export const deleteLocationRequirement = async (req, res) => {
  try {
    const location = await removeRequirement(req.params.id, req.params.reqId);

    return res.status(200).json({
      success: true,
      message: "Location requirement removed successfully",
      data: location,
    });
  } catch (error) {
    console.error("Delete requirement error:", error.message);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to remove requirement",
    });
  }
};
