import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { SubscriptionService } from "./subscription.service.js";
import type {
  CheckSubscriptionLimitsQuery,
  OrganizationSubscriptionQuery,
  SubscriptionPlanListQuery,
} from "./subscription.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getPlanIdParam = (req: Request) => {
  const planId = req.params.planId;

  if (typeof planId !== "string") {
    throw new AppError(400, "Subscription plan id is required");
  }

  return planId;
};

const getOrganizationIdParam = (req: Request) => {
  const organizationId = req.params.organizationId;

  if (typeof organizationId !== "string") {
    throw new AppError(400, "Organization id is required");
  }

  return organizationId;
};

const createSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.createSubscriptionPlan(
    getAuthUser(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription plan created successfully",
    data: result,
  });
});

const updateSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.updateSubscriptionPlan(
    getAuthUser(req),
    getPlanIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan updated successfully",
    data: result,
  });
});

const disableSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.disableSubscriptionPlan(
    getAuthUser(req),
    getPlanIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan disabled successfully",
    data: result,
  });
});

const getSubscriptionPlanList = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getSubscriptionPlanList(
    getAuthUser(req),
    req.query as unknown as SubscriptionPlanListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan list retrieved successfully",
    data: result,
  });
});

const getSubscriptionPlanById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getSubscriptionPlanById(
    getAuthUser(req),
    getPlanIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan detail retrieved successfully",
    data: result,
  });
});

const subscribeOrganizationToPlan = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SubscriptionService.subscribeOrganizationToPlan(
      getAuthUser(req),
      getOrganizationIdParam(req),
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Organization subscribed successfully",
      data: result,
    });
  }
);

const getCurrentSubscription = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as OrganizationSubscriptionQuery;
  const result = await SubscriptionService.getCurrentSubscription(
    getAuthUser(req),
    query.organizationId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Current subscription retrieved successfully",
    data: result,
  });
});

const changeSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.changeSubscriptionPlan(
    getAuthUser(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan changed successfully",
    data: result,
  });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.cancelSubscription(
    getAuthUser(req),
    req.body.organizationId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription cancelled successfully",
    data: result,
  });
});

const renewSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.renewSubscription(
    getAuthUser(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription renewed successfully",
    data: result,
  });
});

const checkSubscriptionLimits = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.checkSubscriptionLimits(
    getAuthUser(req),
    req.query as unknown as CheckSubscriptionLimitsQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription limits checked successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  disableSubscriptionPlan,
  getSubscriptionPlanList,
  getSubscriptionPlanById,
  subscribeOrganizationToPlan,
  getCurrentSubscription,
  changeSubscriptionPlan,
  cancelSubscription,
  renewSubscription,
  checkSubscriptionLimits,
};
