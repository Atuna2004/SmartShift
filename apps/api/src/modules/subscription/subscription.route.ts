import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { SubscriptionController } from "./subscription.controller.js";
import {
  cancelSubscriptionSchema,
  changeSubscriptionPlanSchema,
  checkSubscriptionLimitsSchema,
  createSubscriptionPlanSchema,
  organizationSubscriptionSchema,
  renewSubscriptionSchema,
  subscribeOrganizationSchema,
  subscriptionPlanIdParamSchema,
  subscriptionPlanListSchema,
  updateSubscriptionPlanSchema,
} from "./subscription.validation.js";

const router = Router();

router.use(auth());

router.post(
  "/plans",
  validateRequest(createSubscriptionPlanSchema),
  SubscriptionController.createSubscriptionPlan
);
router.get(
  "/plans",
  validateRequest(subscriptionPlanListSchema),
  SubscriptionController.getSubscriptionPlanList
);
router.get(
  "/plans/:planId",
  validateRequest(subscriptionPlanIdParamSchema),
  SubscriptionController.getSubscriptionPlanById
);
router.patch(
  "/plans/:planId",
  validateRequest(updateSubscriptionPlanSchema),
  SubscriptionController.updateSubscriptionPlan
);
router.delete(
  "/plans/:planId",
  validateRequest(subscriptionPlanIdParamSchema),
  SubscriptionController.disableSubscriptionPlan
);

router.post(
  "/organizations/:organizationId/subscribe",
  validateRequest(subscribeOrganizationSchema),
  SubscriptionController.subscribeOrganizationToPlan
);
router.get(
  "/current",
  validateRequest(organizationSubscriptionSchema),
  SubscriptionController.getCurrentSubscription
);
router.patch(
  "/current/change-plan",
  validateRequest(changeSubscriptionPlanSchema),
  SubscriptionController.changeSubscriptionPlan
);
router.patch(
  "/current/cancel",
  validateRequest(cancelSubscriptionSchema),
  SubscriptionController.cancelSubscription
);
router.patch(
  "/current/renew",
  validateRequest(renewSubscriptionSchema),
  SubscriptionController.renewSubscription
);
router.get(
  "/limits",
  validateRequest(checkSubscriptionLimitsSchema),
  SubscriptionController.checkSubscriptionLimits
);

export const SubscriptionRoutes = router;
