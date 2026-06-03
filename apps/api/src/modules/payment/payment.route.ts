import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { PaymentController } from "./payment.controller.js";
import {
  calculatePayrollSchema,
  completeRegistrationSchema,
  createRegistrationCheckoutSchema,
  createPayrollPaymentSchema,
  createSubscriptionPaymentSchema,
  registrationIntentStatusSchema,
  markPaymentPaidSchema,
  paymentIdParamSchema,
  paymentListSchema,
  webhookSchema,
} from "./payment.validation.js";

const router = Router();

router.post(
  "/payos/webhook",
  validateRequest(webhookSchema),
  PaymentController.handlePayosWebhook
);
router.post(
  "/registration-checkout",
  validateRequest(createRegistrationCheckoutSchema),
  PaymentController.createRegistrationCheckout
);
router.get(
  "/registration-intents/:intentId",
  validateRequest(registrationIntentStatusSchema),
  PaymentController.getRegistrationIntent
);
router.post(
  "/registration-intents/:intentId/complete",
  validateRequest(completeRegistrationSchema),
  PaymentController.completeRegistration
);

router.use(auth());

router.post(
  "/subscriptions",
  validateRequest(createSubscriptionPaymentSchema),
  PaymentController.createSubscriptionPayment
);
router.post(
  "/payroll/calculate",
  validateRequest(calculatePayrollSchema),
  PaymentController.calculatePayroll
);
router.post(
  "/payroll",
  validateRequest(createPayrollPaymentSchema),
  PaymentController.createPayrollPayment
);
router.get("/", validateRequest(paymentListSchema), PaymentController.getPaymentList);
router.get(
  "/:paymentId",
  validateRequest(paymentIdParamSchema),
  PaymentController.getPaymentById
);
router.patch(
  "/:paymentId/mark-paid",
  validateRequest(markPaymentPaidSchema),
  PaymentController.markPaymentPaid
);
router.patch(
  "/:paymentId/cancel",
  validateRequest(paymentIdParamSchema),
  PaymentController.cancelPayment
);
router.patch(
  "/:paymentId/refund",
  validateRequest(paymentIdParamSchema),
  PaymentController.refundPayment
);

export const PaymentRoutes = router;
