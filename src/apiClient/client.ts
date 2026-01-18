import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: redirect to login on 401
    if (error.response?.status === 401) {
      // handle logout / redirect
    }
    return Promise.reject(error);
  },
);
