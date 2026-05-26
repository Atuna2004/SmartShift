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
import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

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
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
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
        path: "/staff",
        element: <StaffHomePage />,
      },
      {
        path: "/staff/schedule",
        element: <StaffSchedulePage />,
      },
      {
        path: "/staff/shift-detail",
        element: <StaffShiftDetailPage />,
      },
      {
        path: "/staff/check-in",
        element: <StaffQrCheckInPage />,
      },
      {
        path: "/staff/attendance-history",
        element: <StaffAttendanceHistoryPage />,
      },
      {
        path: "/staff/shift-swaps",
        element: <StaffShiftSwapsPage />,
      },
      {
        path: "/staff/leave-requests",
        element: <StaffLeaveRequestsPage />,
      },
      {
        path: "/staff/notifications",
        element: <StaffNotificationsPage />,
      },
      {
        path: "/staff/profile",
        element: <StaffProfilePage />,
      },
      {
        path: "/staff/settings",
        element: <StaffSettingsPage />,
      },
      {
        path: "/admin",
        element: <AdminSystemOverviewPage />,
      },
      {
        path: "/admin/finance",
        element: <AdminSaasKpiPage />,
      },
      {
        path: "/admin/businesses",
        element: <AdminBusinessListPage />,
      },
      {
        path: "/admin/businesses/:businessId",
        element: <AdminBusinessDetailPage />,
      },
      {
        path: "/admin/users",
        element: <AdminPlaceholderPage title="User Management" />,
      },
      {
        path: "/admin/subscriptions",
        element: <AdminPlaceholderPage title="Subscription Management" />,
      },
      {
        path: "/admin/payments",
        element: <AdminPlaceholderPage title="Payment Operations" />,
      },
      {
        path: "/admin/support",
        element: <AdminPlaceholderPage title="Support Operations" />,
      },
      {
        path: "/admin/settings",
        element: <AdminPlaceholderPage title="Admin Settings" />,
      },
      {
        path: "/admin/audit-logs",
        element: <AdminPlaceholderPage title="Audit Logs" />,
      },
      {
        path: "/dashboard",
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
            element: (
              <PlaceholderPage
                description="Handle subscription checkout, PayOS status, payroll, and refunds."
                title="Payments"
              />
            ),
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
