import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  assignedShiftIdParamSchema,
  createAssignedShiftSchema,
  myScheduleSchema,
  updateAssignedShiftSchema,
  weeklyScheduleSchema,
} from "./schedule.validation.js";
import { ScheduleController } from "./schedule.controller.js";

const router = Router();

router.use(auth());

router.get(
  "/weekly",
  validateRequest(weeklyScheduleSchema),
  ScheduleController.getWeeklySchedule
);
router.get(
  "/my",
  validateRequest(myScheduleSchema),
  ScheduleController.getMySchedule
);
router.post(
  "/",
  validateRequest(createAssignedShiftSchema),
  ScheduleController.createAssignedShift
);
router.patch(
  "/:assignedShiftId",
  validateRequest(updateAssignedShiftSchema),
  ScheduleController.updateAssignedShift
);
router.delete(
  "/:assignedShiftId",
  validateRequest(assignedShiftIdParamSchema),
  ScheduleController.deleteAssignedShift
);

export const ScheduleRoutes = router;
