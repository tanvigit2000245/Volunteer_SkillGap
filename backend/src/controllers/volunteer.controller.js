import {
  createVolunteerProfile,
  getVolunteerProfile,
  updateVolunteerProfile,
  deleteVolunteerProfile,
  getAllVolunteers,
  getVolunteerById,
} from "../services/volunteer.service.js";

export const createProfile = async (req, res) => {
  try {
    const profile = await createVolunteerProfile(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Volunteer profile created successfully",
      data: profile,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Volunteer profile already exists",
      });
    }

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Error creating volunteer profile",
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await getVolunteerProfile(req.user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found. Please create one.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Volunteer profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Get volunteer profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error retrieving volunteer profile",
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const profile = await updateVolunteerProfile(req.user.id, req.body);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Volunteer profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Update volunteer profile error:", error.message);

    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "Error updating volunteer profile",
    });
  }
};

export const deleteMyProfile = async (req, res) => {
  try {
    const profile = await deleteVolunteerProfile(req.user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Volunteer profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete volunteer profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error deleting volunteer profile",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const result = await getAllVolunteers(req.query);

    return res.status(200).json({
      success: true,
      message: "Volunteers retrieved successfully",
      data: result.volunteers,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get all volunteers error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error fetching volunteers list",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const volunteer = await getVolunteerById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Volunteer profile retrieved successfully",
      data: volunteer,
    });
  } catch (error) {
    console.error("Get volunteer by ID error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error retrieving volunteer profile",
    });
  }
};
