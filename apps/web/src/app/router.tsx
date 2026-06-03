import { Outlet, createBrowserRouter } from "react-router-dom";
import { ScrollToTop } from "@/app/ScrollToTop";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  AdminBusinessDetailPage,
  AdminBusinessListPage,
  AdminPlaceholderPage,
  AdminSaasKpiPage,
  AdminSystemOverviewPage,
} from "@/features/admin/pages/AdminPages";
import { GuestOnlyRoute, ProtectedRoute } from "@/features/auth/routeGuards";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import {
  AttendanceDashboardPage,
  AttendanceHistoryPage,
  AttendanceQrPage,
  CheckInSuccessPage,
  StaffQrScannerPage,
} from "@/features/attendance/pages/AttendancePages";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import {
  BranchCreatePage,
  BranchManagementPage,
  BranchSettingsPage,
  EmployeeCreatePage,
  EmployeeDeactivatePage,
  EmployeeDetailsPage,
  EmployeeListPage,
} from "@/features/employeeBranch/pages/EmployeeBranchPages";
import { AboutContactPage } from "@/features/home/pages/AboutContactPage";
import { FeaturesPage } from "@/features/home/pages/FeaturesPage";
import { HomePage } from "@/features/home/pages/HomePage";
import { PricingPage } from "@/features/home/pages/PricingPage";
import { OrganizationPage } from "@/features/organization/pages/OrganizationPage";
import { PaymentsPage } from "@/features/payment/pages/PaymentsPage";
import {
  RegistrationPaymentCancelPage,
  RegistrationPaymentSuccessPage,
} from "@/features/payment/pages/RegistrationPaymentPages";
import {
  CreateShiftSwapPage,
  LeaveRequestsPage,
  NotificationsPage,
  ShiftSwapPage,
} from "@/features/requests/pages/RequestPages";
import {
  ExportReportPage,
  PaymentSuccessPage,
  PricingPlansPage,
  ReportsPage,
  SubscriptionPage,
} from "@/features/reportSubscription/pages/ReportSubscriptionPages";
import {
  DailySchedulePage,
  MonthlySchedulePage,
  SchedulePage,
  ShiftCreatePage,
  ShiftPage,
} from "@/features/shift/pages/ShiftPage";
import {
  StaffAttendanceHistoryPage,
  StaffHomePage,
  StaffLeaveRequestsPage,
  StaffNotificationsPage,
  StaffProfilePage,
  StaffQrCheckInPage,
  StaffSchedulePage,
  StaffSettingsPage,
  StaffShiftDetailPage,
  StaffShiftSwapsPage,
} from "@/features/staffMobile/pages/StaffMobilePages";

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <Outlet />
      </>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/features",
        element: <FeaturesPage />,
      },
      {
        path: "/pricing",
        element: <PricingPage />,
      },
      {
        path: "/about-contact",
        element: <AboutContactPage />,
      },
      {
        path: "/login",
        element: <GuestOnlyRoute />,
        children: [{ index: true, element: <LoginPage /> }],
      },
      {
        path: "/register",
        element: <GuestOnlyRoute />,
        children: [{ index: true, element: <RegisterPage /> }],
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/payment/success",
        element: <RegistrationPaymentSuccessPage />,
      },
      {
        path: "/payment/cancel",
        element: <RegistrationPaymentCancelPage />,
      },
      {
        path: "/staff",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffHomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/schedule",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffSchedulePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/shift-detail",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffShiftDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/check-in",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffQrCheckInPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/attendance-history",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffAttendanceHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/shift-swaps",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffShiftSwapsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/leave-requests",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffLeaveRequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/notifications",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffNotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/profile",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/settings",
        element: (
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSystemOverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/finance",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSaasKpiPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/businesses",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminBusinessListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/businesses/:businessId",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminBusinessDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPlaceholderPage title="User Management" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/subscriptions",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPlaceholderPage title="Subscription Management" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/payments",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPlaceholderPage title="Payment Operations" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/support",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPlaceholderPage title="Support Operations" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/settings",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPlaceholderPage title="Admin Settings" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/audit-logs",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPlaceholderPage title="Audit Logs" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin", "owner", "manager"]}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: "organization",
            element: <OrganizationPage />,
          },
          {
            path: "branches",
            element: <BranchManagementPage />,
          },
          {
            path: "branches/new",
            element: <BranchCreatePage />,
          },
          {
            path: "branches/settings",
            element: <BranchSettingsPage />,
          },
          {
            path: "branches/:branchId/settings",
            element: <BranchSettingsPage />,
          },
          {
            path: "employees",
            element: <EmployeeListPage />,
          },
          {
            path: "employees/new",
            element: <EmployeeCreatePage />,
          },
          {
            path: "employees/:employeeId",
            element: <EmployeeDetailsPage />,
          },
          {
            path: "employees/:employeeId/deactivate",
            element: <EmployeeDeactivatePage />,
          },
          { path: "shifts", element: <ShiftPage /> },
          { path: "shifts/new", element: <ShiftCreatePage /> },
          {
            path: "schedule",
            element: <SchedulePage />,
          },
          {
            path: "schedule/monthly",
            element: <MonthlySchedulePage />,
          },
          {
            path: "schedule/daily",
            element: <DailySchedulePage />,
          },
          {
            path: "attendance",
            element: <AttendanceDashboardPage />,
          },
          {
            path: "attendance/qr",
            element: <AttendanceQrPage />,
          },
          {
            path: "attendance/history",
            element: <AttendanceHistoryPage />,
          },
          {
            path: "attendance/scanner",
            element: <StaffQrScannerPage />,
          },
          {
            path: "attendance/success",
            element: <CheckInSuccessPage />,
          },
          {
            path: "leave-requests",
            element: <LeaveRequestsPage />,
          },
          {
            path: "shift-swaps",
            element: <ShiftSwapPage />,
          },
          {
            path: "shift-swaps/new",
            element: <CreateShiftSwapPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "reports/export",
            element: <ExportReportPage />,
          },
          {
            path: "subscription",
            element: <SubscriptionPage />,
          },
          {
            path: "subscription/plans",
            element: <PricingPlansPage />,
          },
          {
            path: "payments",
            element: <PaymentsPage />,
          },
          {
            path: "payments/success",
            element: <PaymentSuccessPage />,
          },
        ],
      },
    ],
  },
]);
