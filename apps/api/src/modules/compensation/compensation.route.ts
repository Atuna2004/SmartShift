import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { CompensationController } from "./compensation.controller.js";
import {
  adjustmentIdParamSchema,
  adjustmentListSchema,
  compensationSummarySchema,
  createAdjustmentSchema,
  createOvertimeRequestSchema,
  overtimeIdParamSchema,
  overtimeListSchema,
  reviewOvertimeRequestSchema,
} from "./compensation.validation.js";

const router = Router();

router.use(auth());

router.get(
  "/summary",
  validateRequest(compensationSummarySchema),
  CompensationController.getCompensationSummary
);

router.post(
  "/overtime-requests",
  validateRequest(createOvertimeRequestSchema),
  CompensationController.createOvertimeRequest
);
router.get(
  "/overtime-requests",
  validateRequest(overtimeListSchema),
  CompensationController.getOvertimeList
);
router.patch(
  "/overtime-requests/:overtimeId/approve",
  validateRequest(reviewOvertimeRequestSchema),
  CompensationController.approveOvertimeRequest
);
router.patch(
  "/overtime-requests/:overtimeId/reject",
  validateRequest(reviewOvertimeRequestSchema),
  CompensationController.rejectOvertimeRequest
);
router.patch(
  "/overtime-requests/:overtimeId/cancel",
  validateRequest(overtimeIdParamSchema),
  CompensationController.cancelOvertimeRequest
);

router.post(
  "/adjustments",
  validateRequest(createAdjustmentSchema),
  CompensationController.createAdjustment
);
router.get(
  "/adjustments",
  validateRequest(adjustmentListSchema),
  CompensationController.getAdjustmentList
);
router.delete(
  "/adjustments/:adjustmentId",
  validateRequest(adjustmentIdParamSchema),
  CompensationController.deleteAdjustment
);

export const CompensationRoutes = router;
