import axios, { AxiosHeaders } from "axios";
import type { AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response) {
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

export function getAuthToken(): string | null {
  return localStorage.getItem("accessToken");
}

export default axiosClient;
