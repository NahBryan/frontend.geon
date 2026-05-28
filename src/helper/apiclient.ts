/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type InternalAxiosRequestConfig } from "axios";
const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1"; 

import {
  clearAuthToken,
  clearRefreshToken,
  getAuthToken,
  getRefreshToken,
  saveAuthToken,
  saveRefreshToken,
} from "./store/AuthStorage"; 

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL,
  timeout: 480000,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();

    config.headers = config.headers ?? {};

    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
      config.transformRequest = [(data) => data];
      config.timeout = 120000;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    if ((status === 401 || status === 419) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token present in browser cache");

        const { data } = await axios.post(`${baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const newAccess = data?.access_token;
        const newRefresh = data?.refresh_token;

        await saveAuthToken(newAccess);
        if (newRefresh) await saveRefreshToken(newRefresh);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        processQueue();
        return apiClient(originalRequest);

      } catch (refreshError) {
        await clearAuthToken();
        await clearRefreshToken();
        processQueue(refreshError);
        
        window.location.href = "/";
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;