import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAuthStore } from "@/store";
import type { AuthRole } from "./types";

const getDefaultRoute = (role?: AuthRole) => {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/dashboard";
};

export const GuestOnlyRoute = () => {
  const { accessToken, user } = useAuthStore();

  if (accessToken) {
    return <Navigate replace to={getDefaultRoute(user?.role)} />;
  }

  return <Outlet />;
};

export const ProtectedRoute = ({ allowedRoles, children }: PropsWithChildren<{ allowedRoles?: AuthRole[] }>) => {
  const location = useLocation();
  const { accessToken, user } = useAuthStore();

  if (!accessToken) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to={getDefaultRoute(user.role)} />;
  }

  return children ?? <Outlet />;
};
