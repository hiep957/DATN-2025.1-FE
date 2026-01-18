// lib/axios.ts


import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const BASE_URL = "https://ededf0088469.ngrok-free.app"; // Thay đổi thành URL backend của bạn

// Instance chính cho app
export const api = axios.create({
  baseURL: "https://ededf0088469.ngrok-free.app",
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Accept": "application/json",
  },
  withCredentials: true,          // nếu backend set refresh bằng cookie httpOnly
  timeout: 10000,
});

// Instance riêng chỉ để refresh, KHÔNG gắn interceptor để tránh vòng lặp
export const refreshApi = axios.create({
  // Gọi Next.js route handler (cùng domain FE) để nó dùng cookie refreshToken
  baseURL: "",
  withCredentials: true,
  timeout: 15000,
});

// ===== REQUEST: gắn accessToken =====
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== RESPONSE: 401 -> refresh (lock + queue) =====
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

// Helper: xác định endpoint nào không nên auto refresh (tránh loop)
function isAuthBypassUrl(url?: string) {
  const u = (url ?? "").toString();
  return (
    u.includes("/api/auth/refresh") ||
    u.includes("/api/auth/logout") ||
    u.includes("/user/refresh") || // phòng khi bạn lỡ gọi trực tiếp
    u.includes("/user/logout")     // phòng khi bạn lỡ gọi trực tiếp
  );
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const status = error.response?.status;

    // Network/CORS hoặc không phải 401
    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    // Bỏ qua nếu là endpoint auth (tránh vòng lặp)
    if (isAuthBypassUrl(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Tránh retry vô hạn
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // Nếu đang refresh: xếp hàng chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) return reject(error);

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    // Bắt đầu refresh
    isRefreshing = true;

    try {
      /**
       * QUAN TRỌNG:
       * Refresh phải gọi Next.js route handler để dùng cookie refreshToken của domain FE
       * Next.js sẽ gọi NestJS ở server-side
       */
      const { data } = await refreshApi.post("/api/auth/refresh", {});
      // Bạn có thể trả thẳng {accessToken} từ Next route
      const newAccessToken: string | null =
        (data as any)?.accessToken ??
        (data as any)?.data?.accessToken ??
        null;

      if (!newAccessToken) throw new Error("Refresh did not return accessToken");

      // Lưu token vào store
      useAuthStore.getState().setAccessToken(newAccessToken);

      // Thả queue
      resolveQueue(newAccessToken);

      // Retry request ban đầu
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      // Refresh fail => gọi logout Next để clear cookie + clear store
      try {
        await refreshApi.post("/api/auth/logout", {});
      } catch { }

      useAuthStore.getState().logout();
      resolveQueue(null);

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
