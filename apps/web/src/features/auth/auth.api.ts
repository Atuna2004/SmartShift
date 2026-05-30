import { api } from "@/shared/api";
import type { AuthUser } from "@/store";
import type { AuthSession, LoginRequest, RegisterOwnerRequest } from "./types";

export const authApi = {
  login: (payload: LoginRequest) => api.post<AuthSession>("/auth/login", payload),
  registerOwner: (payload: RegisterOwnerRequest) => api.post<AuthSession>("/auth/register-owner", payload),
  logout: () => api.post<null>("/auth/logout", {}),
  me: () => api.get<AuthUser>("/auth/me"),
  forgotPassword: (payload: { email: string }) =>
    api.post<{ resetToken?: string } | null>("/auth/forgot-password", payload),
  resetPassword: (payload: { token: string; newPassword: string }) => api.post<null>("/auth/reset-password", payload),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.patch<null>("/auth/change-password", payload),
  updateProfile: (payload: { fullName?: string; phone?: string; avatar?: string }) =>
    api.patch<AuthUser>("/auth/profile", payload),
};
