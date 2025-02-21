import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for session handling
});

// Add request interceptor to handle file uploads
api.interceptors.request.use((config) => {
  // If sending FormData, let the browser set the Content-Type
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }
  return config;
});

export const logout = async () => {
  const response = await api.get("/auth/logout");
  return response.data;
};
