import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createLeaveRequestSchema,
  leaveRequestIdParamSchema,
  leaveRequestListSchema,
  reviewLeaveRequestSchema,
  updateLeaveRequestSchema,
} from "./leave-request.validation.js";
import { LeaveRequestController } from "./leave-request.controller.js";

const router = Router();

router.use(auth());

router.post(
  "/",
  validateRequest(createLeaveRequestSchema),
  LeaveRequestController.createLeaveRequest
);
router.get(
  "/",
  validateRequest(leaveRequestListSchema),
  LeaveRequestController.getLeaveRequestList
);
router.get(
  "/:leaveRequestId",
  validateRequest(leaveRequestIdParamSchema),
  LeaveRequestController.getLeaveRequestById
);
router.patch(
  "/:leaveRequestId",
  validateRequest(updateLeaveRequestSchema),
  LeaveRequestController.updateLeaveRequest
);
router.patch(
  "/:leaveRequestId/cancel",
  validateRequest(leaveRequestIdParamSchema),
  LeaveRequestController.cancelLeaveRequest
);
router.patch(
  "/:leaveRequestId/approve",
  validateRequest(reviewLeaveRequestSchema),
  LeaveRequestController.approveLeaveRequest
);
router.patch(
  "/:leaveRequestId/reject",
  validateRequest(reviewLeaveRequestSchema),
  LeaveRequestController.rejectLeaveRequest
);

export const LeaveRequestRoutes = router;
