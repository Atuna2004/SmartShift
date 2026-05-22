import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { ScheduleController } from "./schedule.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), ScheduleController.create);
router.get("/", validateRequest(listResourceSchema), ScheduleController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), ScheduleController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), ScheduleController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), ScheduleController.remove);

export const ScheduleRoutes = router;
