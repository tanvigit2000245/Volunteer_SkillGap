
import api from "./axiosInstance";

export const createLocation = async (locationData) => {
  const response = await api.post("/locations", locationData);
  return response.data;
};

export const getAllLocations = async (params) => {
  const response = await api.get("/locations", { params });
  return response.data;
};

export const getLocationById = async (id) => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

export const updateLocation = async (id, data) => {
  const response = await api.put(`/locations/${id}`, data);
  return response.data;
};

export const deleteLocation = async (id) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

export const addRequirement = async (id, requirement) => {
  const response = await api.post(
    `/locations/${id}/requirements`,
    requirement
  );
  return response.data;
};

export const updateRequirement = async (id, reqId, data) => {
  const response = await api.put(
    `/locations/${id}/requirements/${reqId}`,
    data
  );
  return response.data;
};

export const deleteRequirement = async (id, reqId) => {
  const response = await api.delete(
    `/locations/${id}/requirements/${reqId}`
  );
  return response.data;
};
