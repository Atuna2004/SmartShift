import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { PaymentController } from "./payment.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), PaymentController.create);
router.get("/", validateRequest(listResourceSchema), PaymentController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), PaymentController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), PaymentController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), PaymentController.remove);

export const PaymentRoutes = router;
