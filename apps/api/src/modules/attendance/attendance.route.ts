import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  approveManualAttendanceSchema,
  attendanceAlertSchema,
  attendanceHistorySchema,
  autoMarkAbsentSchema,
  checkInSchema,
  checkOutSchema,
  manualCorrectionSchema,
} from "./attendance.validation.js";
import { AttendanceController } from "./attendance.controller.js";

const router = Router();

router.use(auth());

router.post("/check-in", validateRequest(checkInSchema), AttendanceController.checkIn);
router.post("/check-out", validateRequest(checkOutSchema), AttendanceController.checkOut);
router.post(
  "/manual-corrections",
  validateRequest(manualCorrectionSchema),
  AttendanceController.requestManualCorrection
);
router.patch(
  "/:attendanceId/approve-manual",
  validateRequest(approveManualAttendanceSchema),
  AttendanceController.approveManualAttendance
);
router.post(
  "/auto-mark-absent",
  validateRequest(autoMarkAbsentSchema),
  AttendanceController.autoMarkAbsent
);
router.get(
  "/history",
  validateRequest(attendanceHistorySchema),
  AttendanceController.getAttendanceHistory
);
router.get(
  "/reminders",
  validateRequest(attendanceAlertSchema),
  AttendanceController.getAttendanceReminders
);
router.get(
  "/late-warnings",
  validateRequest(attendanceAlertSchema),
  AttendanceController.getLateWarnings
);

export const AttendanceRoutes = router;
