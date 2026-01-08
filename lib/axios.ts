// lib/axios.ts
"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const BASE_URL = "https://f25bd1d9cba5.ngrok-free.app";

// Instance chính cho app
export const api = axios.create({
  baseURL: "https://f25bd1d9cba5.ngrok-free.app",
  withCredentials: true,          // nếu backend set refresh bằng cookie httpOnly
  timeout: 10000,
});

// Instance riêng chỉ để refresh, KHÔNG gắn interceptor để tránh vòng lặp
const refreshApi = axios.create({
  baseURL: "https://f25bd1d9cba5.ngrok-free.app",
  withCredentials: true,
  timeout: 10000,
});

// ----- REQUEST: đính token -----
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- RESPONSE: 401 -> refresh (chỉ 1 lần, có khóa & queue) -----
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function onRefreshed(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Guard lỗi không có response (mạng/CORS)
    const status = error.response?.status;
    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    // BỎ QUA: nếu là request đến endpoint refresh thì không tự refresh nữa (tránh vòng lặp)
    const url = (originalRequest.url || "").toString();
    if (url.includes("/user/refresh")) {
      return Promise.reject(error);
    }

    // Tránh retry vô hạn cho request gốc
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // Nếu đang refresh rồi: chờ xong rồi retry
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) return reject(error);
          // token mới sẽ được request interceptor gắn lại, nhưng vẫn nên set header để chắc chắn
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // Bắt đầu refresh
    isRefreshing = true;
    try {
      // GỌI BẰNG refreshApi để không bị interceptor bắt lại
      const { data } = await refreshApi.post("/user/refresh"); // nhớ dấu "/" đầu
      console.log("Response từ /user/refresh:", data);
      const newAccessToken = (data as any)?.data.accessToken ?? null;

      // Lưu token vào store (để request interceptor gắn cho các request sau)
      useAuthStore.getState().setAccessToken(newAccessToken);

      // Đánh thức queue
      onRefreshed(newAccessToken);

      // Retry request ban đầu
      originalRequest.headers = originalRequest.headers ?? {};
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (refreshErr) {
      // Refresh fail -> logout
      useAuthStore.getState().logout();

      // Nếu đang ở client: điều hướng
      if (typeof window !== "undefined") {
        // dùng replace để tránh quay lại vòng lặp
        window.location.replace("/login");
      }

      // Đánh thức queue với null để các pending reject
      onRefreshed(null);
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
