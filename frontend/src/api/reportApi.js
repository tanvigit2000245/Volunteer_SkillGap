
import api from "./axiosInstance";

export const getDeploymentSheet = async (runId) => {
  const response = await api.get(`/reports/sheet/${runId}`);
  return response.data;
};

export const exportExcel = async (runId) => {
  const response = await api.get(
    `/reports/export/excel/${runId}`,
    { responseType: "blob" }
  );
  return response.data;
};

export const exportPDF = async (runId) => {
  const response = await api.get(
    `/reports/export/pdf/${runId}`,
    { responseType: "blob" }
  );
  return response.data;
};
