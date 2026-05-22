import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { ShiftSwapController } from "./shift-swap.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), ShiftSwapController.create);
router.get("/", validateRequest(listResourceSchema), ShiftSwapController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), ShiftSwapController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), ShiftSwapController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), ShiftSwapController.remove);

export const ShiftSwapRoutes = router;
