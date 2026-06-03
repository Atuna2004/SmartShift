import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { OrganizationController } from "./organization.controller.js";
import {
  configureOrganizationSettingsSchema,
  configureOrganizationSubscriptionSchema,
  createOrganizationSchema,
  organizationQuerySchema,
  setOrganizationStatusSchema,
  updateOrganizationProfileSchema,
} from "./organization.validation.js";

const router = Router();

router.use(auth());

router.post(
  "/",
  validateRequest(createOrganizationSchema),
  OrganizationController.createOrganization
);
router.get(
  "/me",
  validateRequest(organizationQuerySchema),
  OrganizationController.getMyOrganization
);
router.patch(
  "/me/profile",
  validateRequest(updateOrganizationProfileSchema),
  OrganizationController.updateOrganizationProfile
);
router.patch(
  "/me/settings",
  validateRequest(configureOrganizationSettingsSchema),
  OrganizationController.configureOrganizationSettings
);
router.patch(
  "/me/subscription",
  validateRequest(configureOrganizationSubscriptionSchema),
  OrganizationController.configureSubscriptionInfo
);
router.patch(
  "/:organizationId/disable",
  validateRequest(setOrganizationStatusSchema),
  OrganizationController.disableOrganization
);
router.patch(
  "/:organizationId/enable",
  validateRequest(setOrganizationStatusSchema),
  OrganizationController.enableOrganization
);

export const OrganizationRoutes = router;
