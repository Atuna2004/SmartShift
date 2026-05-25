import { apiClient } from "./axios";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const api = {
  get: async <T>(url: string, params?: Record<string, unknown>) => {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  },
  post: async <T>(url: string, payload?: unknown) => {
    const response = await apiClient.post<ApiResponse<T>>(url, payload);
    return response.data.data;
  },
  patch: async <T>(url: string, payload?: unknown) => {
    const response = await apiClient.patch<ApiResponse<T>>(url, payload);
    return response.data.data;
  },
  delete: async <T>(url: string) => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data.data;
  },
};
