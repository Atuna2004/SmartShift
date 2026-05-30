import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { PaymentService } from "./payment.service.js";
import type { PaymentListQuery } from "./payment.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getPaymentIdParam = (req: Request) => {
  const paymentId = req.params.paymentId;

  if (typeof paymentId !== "string") {
    throw new AppError(400, "Payment id is required");
  }

  return paymentId;
};

const createSubscriptionPayment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentService.createSubscriptionPayment(
      getAuthUser(req),
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subscription payment created successfully",
      data: result,
    });
  }
);

const calculatePayroll = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.calculatePayroll(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payroll calculated successfully",
    data: result,
  });
});

const createPayrollPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPayrollPayment(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payroll payment created successfully",
    data: result,
  });
});

const markPaymentPaid = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.markPaymentPaid(
    getAuthUser(req),
    getPaymentIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment marked as paid successfully",
    data: result,
  });
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.cancelPayment(
    getAuthUser(req),
    getPaymentIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment cancelled successfully",
    data: result,
  });
});

const refundPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.refundPayment(
    getAuthUser(req),
    getPaymentIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment refunded successfully",
    data: result,
  });
});

const getPaymentList = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentList(
    getAuthUser(req),
    req.query as unknown as PaymentListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment list retrieved successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentById(
    getAuthUser(req),
    getPaymentIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment detail retrieved successfully",
    data: result,
  });
});

const handlePayosWebhook = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.handlePayosWebhook(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "PayOS webhook handled successfully",
    data: result,
  });
});

export const PaymentController = {
  createSubscriptionPayment,
  calculatePayroll,
  createPayrollPayment,
  markPaymentPaid,
  cancelPayment,
  refundPayment,
  getPaymentList,
  getPaymentById,
  handlePayosWebhook,
};
