import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAnalyticsUser, identifyAnalyticsUser } from "@/shared/analytics/ga";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "owner" | "manager" | "staff";
  employeeType?: string;
  phone?: string;
  avatar?: string;
  employeeCode?: string;
  joinDate?: string;
  status?: "active" | "inactive" | "suspended";
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  organizationId?: string;
  branchId?: string;
  branchName?: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (payload: {
    accessToken: string;
    refreshToken?: string;
    user: AuthUser;
  }) => void;
  setUser: (user: AuthUser) => void;
  setTokens: (payload: { accessToken: string; refreshToken?: string }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: ({ accessToken, refreshToken, user }) => {
        identifyAnalyticsUser(user);
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          user,
        }));
      },
      setUser: (user) => {
        identifyAnalyticsUser(user);
        set({ user });
      },
      setTokens: ({ accessToken, refreshToken }) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        })),
      clearAuth: () => {
        clearAnalyticsUser();
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      },
    }),
    {
      name: "smartshift-auth",
    }
  )
);
