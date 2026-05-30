import type { AuthUser } from "@/store";

export type AuthRole = AuthUser["role"];

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterOwnerRequest = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  organization?: {
    name: string;
    businessType?: "cafe" | "restaurant" | "retail" | "service" | "other";
    phone?: string;
    email?: string;
    address?: string;
  };
  branch?: {
    name: string;
    address?: string;
    phone?: string;
  };
  subscription?: {
    plan?: "free" | "basic" | "pro";
    status?: "trialing" | "active" | "past_due" | "cancelled";
    startedAt?: string;
    expiredAt?: string;
    maxBranches?: number;
    maxEmployees?: number;
  };
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
