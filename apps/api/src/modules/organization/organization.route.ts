import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { OrganizationController } from "./organization.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), OrganizationController.create);
router.get("/", validateRequest(listResourceSchema), OrganizationController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), OrganizationController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), OrganizationController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), OrganizationController.remove);

export const OrganizationRoutes = router;
