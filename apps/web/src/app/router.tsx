import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ShiftPage } from "@/features/shift/pages/ShiftPage";
import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "organization",
        element: (
          <PlaceholderPage
            description="Manage organization profile, settings, and subscription metadata."
            title="Organization"
          />
        ),
      },
      {
        path: "branches",
        element: (
          <PlaceholderPage
            description="Manage locations, branch settings, GPS, and QR attendance defaults."
            title="Branches"
          />
        ),
      },
      {
        path: "employees",
        element: (
          <PlaceholderPage
            description="Create employees, assign managers, and manage branch membership."
            title="Employees"
          />
        ),
      },
      { path: "shifts", element: <ShiftPage /> },
      {
        path: "schedule",
        element: (
          <PlaceholderPage
            description="Build weekly schedules and assign employees to published shifts."
            title="Schedule"
          />
        ),
      },
      {
        path: "attendance",
        element: (
          <PlaceholderPage
            description="Generate daily QR codes, view check-ins, and handle corrections."
            title="Attendance"
          />
        ),
      },
      {
        path: "leave-requests",
        element: (
          <PlaceholderPage
            description="Review leave requests and update assigned shifts."
            title="Leave Requests"
          />
        ),
      },
      {
        path: "shift-swaps",
        element: (
          <PlaceholderPage
            description="Track shift swap requests through receiver and manager approval."
            title="Shift Swaps"
          />
        ),
      },
      {
        path: "notifications",
        element: (
          <PlaceholderPage
            description="Broadcast updates and view user notification state."
            title="Notifications"
          />
        ),
      },
      {
        path: "subscription",
        element: (
          <PlaceholderPage
            description="Manage plans, current subscription, usage limits, and feature access."
            title="Subscription"
          />
        ),
      },
      {
        path: "payments",
        element: (
          <PlaceholderPage
            description="Handle subscription checkout, PayOS status, payroll, and refunds."
            title="Payments"
          />
        ),
      },
    ],
  },
]);
