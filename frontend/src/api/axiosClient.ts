import axios, { AxiosHeaders } from "axios";
import type { AxiosInstance } from "axios";

import { AUTH_STORAGE_KEYS } from "@/shared/constants/auth";
import { ROUTES } from "@/shared/constants/routes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
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
      const requestUrl = error.config?.url ?? "";
      const isLoginRequest = requestUrl.includes("/auth/login");

      if (status === 401 && !isLoginRequest) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
        window.location.href = ROUTES.auth.login;
      }
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, token);
  else localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

export default axiosClient;
