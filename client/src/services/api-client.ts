import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { ApiErrorPayload } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers && !config.headers['x-request-id']) {
      config.headers['x-request-id'] = crypto.randomUUID();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check for token expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
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
        const currentToken = useAuthStore.getState().token;
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: currentToken ? `Bearer ${currentToken}` : undefined,
            },
          }
        );

        const newAccessToken = res.data?.data?.accessToken;
        const refreshedUser = res.data?.data?.user;

        if (newAccessToken && refreshedUser) {
          useAuthStore.getState().setAuthSession({
            user: refreshedUser,
            token: newAccessToken,
          });

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const serverMessage = error.response?.data?.message;
    const statusCode = error.response?.status || (error.code === 'ECONNABORTED' ? 408 : 500);

    const formattedError: ApiErrorPayload = {
      status: 'error',
      statusCode,
      message:
        serverMessage ||
        (error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : error.message || 'An unexpected network error occurred.'),
      requestId: error.response?.headers?.['x-request-id'] as string | undefined,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
      details: error.response?.data?.details,
    };

    return Promise.reject(formattedError);
  }
);
