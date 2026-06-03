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
    throw new AppError(400, "Thiếu mã giao dịch thanh toán");
  }

  return paymentId;
};

const getIntentIdParam = (req: Request) => {
  const intentId = req.params.intentId;

  if (typeof intentId !== "string") {
    throw new AppError(400, "Registration intent id is required");
  }

  return intentId;
};

const createRegistrationCheckout = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentService.createRegistrationCheckout(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Registration checkout created successfully",
      data: result,
    });
  }
);

const getRegistrationIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getRegistrationIntent(getIntentIdParam(req));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Registration intent retrieved successfully",
    data: result,
  });
});

const completeRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.completeRegistration(
    getIntentIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Registration completion checked successfully",
    data: result,
  });
});

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
    message: "Đã đánh dấu giao dịch là đã thanh toán",
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
    message: "Đã hủy giao dịch thanh toán",
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
    message: "Đã hoàn tiền giao dịch thanh toán",
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
    message: "Đã tải danh sách thanh toán",
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
    message: "Đã tải chi tiết thanh toán",
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
  createRegistrationCheckout,
  getRegistrationIntent,
  completeRegistration,
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
