import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createShiftTemplateSchema,
  shiftTemplateIdParamSchema,
  shiftTemplateListSchema,
  updateShiftTemplateSchema,
} from "./shift.validation.js";
import { ShiftController } from "./shift.controller.js";

const router = Router();

router.use(auth("owner", "manager"));

router.post(
  "/",
  validateRequest(createShiftTemplateSchema),
  ShiftController.createShiftTemplate
);
router.get(
  "/",
  validateRequest(shiftTemplateListSchema),
  ShiftController.getShiftTemplateList
);
router.get(
  "/:shiftTemplateId",
  validateRequest(shiftTemplateIdParamSchema),
  ShiftController.getShiftTemplateById
);
router.patch(
  "/:shiftTemplateId",
  validateRequest(updateShiftTemplateSchema),
  ShiftController.updateShiftTemplate
);
router.delete(
  "/:shiftTemplateId",
  validateRequest(shiftTemplateIdParamSchema),
  ShiftController.disableShiftTemplate
);

export const ShiftRoutes = router;
