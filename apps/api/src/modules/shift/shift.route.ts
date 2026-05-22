import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { ShiftController } from "./shift.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), ShiftController.create);
router.get("/", validateRequest(listResourceSchema), ShiftController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), ShiftController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), ShiftController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), ShiftController.remove);

export const ShiftRoutes = router;
