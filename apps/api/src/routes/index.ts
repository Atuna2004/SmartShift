import { Router } from "express";
import { AttendanceRoutes } from "../modules/attendance/attendance.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { BranchRoutes } from "../modules/branch/branch.route.js";
import { CompensationRoutes } from "../modules/compensation/compensation.route.js";
import { DailyQrCodeRoutes } from "../modules/dailyQrCode/daily-qr-code.route.js";
import { LeaveRequestRoutes } from "../modules/leaveRequest/leave-request.route.js";
import { NotificationRoutes } from "../modules/notification/notification.route.js";
import { OrganizationRoutes } from "../modules/organization/organization.route.js";
import { PaymentRoutes } from "../modules/payment/payment.route.js";
import { ReportRoutes } from "../modules/report/report.route.js";
import { ScheduleRoutes } from "../modules/schedule/schedule.route.js";
import { ShiftRoutes } from "../modules/shift/shift.route.js";
import { ShiftSwapRoutes } from "../modules/shiftSwap/shift-swap.route.js";
import { SubscriptionRoutes } from "../modules/subscription/subscription.route.js";
import { UserRoutes } from "../modules/user/user.route.js";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/organizations", OrganizationRoutes);
router.use("/branches", BranchRoutes);
router.use("/shift-templates", ShiftRoutes);
router.use("/schedules", ScheduleRoutes);
router.use("/attendances", AttendanceRoutes);
router.use("/compensations", CompensationRoutes);
router.use("/daily-qr-codes", DailyQrCodeRoutes);
router.use("/leave-requests", LeaveRequestRoutes);
router.use("/shift-swaps", ShiftSwapRoutes);
router.use("/notifications", NotificationRoutes);
router.use("/subscriptions", SubscriptionRoutes);
router.use("/payments", PaymentRoutes);
router.use("/reports", ReportRoutes);

export default router;
