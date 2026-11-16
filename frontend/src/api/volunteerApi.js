
import api from "./axiosInstance";

export const createVolunteerProfile = async (profileData) => {
  const response = await api.post("/volunteer/profile", profileData);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/volunteer/profile/me");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await api.put("/volunteer/profile/me", profileData);
  return response.data;
};

export const deleteMyProfile = async () => {
  const response = await api.delete("/volunteer/profile/me");
  return response.data;
};

export const getAllVolunteers = async (params) => {
  const response = await api.get("/volunteer/all", { params });
  return response.data;
};

export const getVolunteerById = async (id) => {
  const response = await api.get(`/volunteer/${id}`);
  return response.data;
};
