
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Automatically attach access token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
