import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Prefer using a proxy route to avoid CORS issues, but allow overriding via env.
// If NEXT_PUBLIC_API_URL is set, we will call the remote API directly.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Extended config type to track retry attempts
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if we have a refresh token
      const refreshToken = typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;

      if (!refreshToken) {
        // No refresh token, clear everything and let the app handle redirect
        clearAuthTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post<{
          success: boolean;
          data: { access: string; refresh?: string };
        }>(`${API_BASE_URL}/admin/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data.success && response.data.data.access) {
          const newAccessToken = response.data.data.access;
          const newRefreshToken = response.data.data.refresh;

          // Store new tokens
          setAuthTokens(newAccessToken, newRefreshToken);

          // Update the failed request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Process queued requests
          processQueue(null, newAccessToken);

          return apiClient(originalRequest);
        } else {
          // Refresh failed, clear tokens
          clearAuthTokens();
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh request failed, clear tokens
        clearAuthTokens();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth helper functions
export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  }
};

export const clearAuthTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default apiClient;
