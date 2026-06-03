import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createShiftSwapSchema,
  managerShiftSwapSchema,
  receiverShiftSwapSchema,
  shiftSwapIdParamSchema,
  shiftSwapListSchema,
} from "./shift-swap.validation.js";
import { ShiftSwapController } from "./shift-swap.controller.js";

const router = Router();

router.use(auth());

router.post(
  "/",
  validateRequest(createShiftSwapSchema),
  ShiftSwapController.createShiftSwap
);
router.get(
  "/",
  validateRequest(shiftSwapListSchema),
  ShiftSwapController.getShiftSwapList
);
router.get(
  "/:shiftSwapId",
  validateRequest(shiftSwapIdParamSchema),
  ShiftSwapController.getShiftSwapById
);
router.patch(
  "/:shiftSwapId/accept",
  validateRequest(receiverShiftSwapSchema),
  ShiftSwapController.acceptShiftSwap
);
router.patch(
  "/:shiftSwapId/reject-receiver",
  validateRequest(receiverShiftSwapSchema),
  ShiftSwapController.rejectShiftSwapByReceiver
);
router.patch(
  "/:shiftSwapId/approve",
  validateRequest(managerShiftSwapSchema),
  ShiftSwapController.approveShiftSwap
);
router.patch(
  "/:shiftSwapId/reject-manager",
  validateRequest(managerShiftSwapSchema),
  ShiftSwapController.rejectShiftSwapByManager
);
router.patch(
  "/:shiftSwapId/cancel",
  validateRequest(shiftSwapIdParamSchema),
  ShiftSwapController.cancelShiftSwap
);

export const ShiftSwapRoutes = router;
