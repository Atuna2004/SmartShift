import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { SubscriptionController } from "./subscription.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), SubscriptionController.create);
router.get("/", validateRequest(listResourceSchema), SubscriptionController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), SubscriptionController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), SubscriptionController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), SubscriptionController.remove);

export const SubscriptionRoutes = router;
