import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { NotificationController } from "./notification.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), NotificationController.create);
router.get("/", validateRequest(listResourceSchema), NotificationController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), NotificationController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), NotificationController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), NotificationController.remove);

export const NotificationRoutes = router;
