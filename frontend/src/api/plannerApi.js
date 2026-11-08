
import api from "./axiosInstance";

export const previewMatching = async (locationIds) => {
  const response = await api.post("/planner/match", { locationIds });
  return response.data;
};

export const generateDeploymentPlan = async (planData) => {
  const response = await api.post("/planner/generate", planData);
  return response.data;
};

export const getDeploymentRuns = async () => {
  const response = await api.get("/planner/runs");
  return response.data;
};

export const getDeploymentPlan = async (runId) => {
  const response = await api.get(`/planner/runs/${runId}`);
  return response.data;
};

export const overrideAssignment = async (data) => {
  const response = await api.post("/planner/override", data);
  return response.data;
};

export const confirmDeployment = async (runId) => {
  const response = await api.post(`/planner/confirm/${runId}`);
  return response.data;
};
