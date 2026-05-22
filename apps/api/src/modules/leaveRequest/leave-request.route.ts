import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { LeaveRequestController } from "./leave-request.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), LeaveRequestController.create);
router.get("/", validateRequest(listResourceSchema), LeaveRequestController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), LeaveRequestController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), LeaveRequestController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), LeaveRequestController.remove);

export const LeaveRequestRoutes = router;
