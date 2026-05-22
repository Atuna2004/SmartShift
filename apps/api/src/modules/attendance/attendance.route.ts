import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { AttendanceController } from "./attendance.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), AttendanceController.create);
router.get("/", validateRequest(listResourceSchema), AttendanceController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), AttendanceController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), AttendanceController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), AttendanceController.remove);

export const AttendanceRoutes = router;
