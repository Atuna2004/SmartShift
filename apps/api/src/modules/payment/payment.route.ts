import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { PaymentController } from "./payment.controller.js";
import {
  calculatePayrollSchema,
  createPayrollPaymentSchema,
  createSubscriptionPaymentSchema,
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
