import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { ApiErrorPayload } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Centralized Axios API Client.
 * All feature services MUST import and use this instance.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s default timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: injects bearer token and tracks client-side request-id
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach authorization header if token exists in auth store
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach client request id if not already present
    if (config.headers && !config.headers['x-request-id']) {
      config.headers['x-request-id'] = crypto.randomUUID();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalizes error messages while preserving server diagnostic context
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    // Extract safe server message if available
    const serverMessage = error.response?.data?.message;
    const statusCode = error.response?.status || (error.code === 'ECONNABORTED' ? 408 : 500);

    const formattedError: ApiErrorPayload = {
      status: 'error',
      statusCode,
      message: serverMessage || (error.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : error.message || 'An unexpected network error occurred.'),
      requestId: error.response?.headers?.['x-request-id'] as string | undefined,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
      details: error.response?.data?.details,
    };

    return Promise.reject(formattedError);
  }
);
