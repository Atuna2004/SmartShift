import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { OrganizationService } from "./organization.service.js";
import type { OrganizationQuery } from "./organization.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getOrganizationIdParam = (req: Request) => {
  const organizationId = req.params.organizationId;

  if (typeof organizationId !== "string") {
    throw new AppError(400, "Organization id is required");
  }

  return organizationId;
};

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.createOrganization(
    getAuthUser(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

const getMyOrganization = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as OrganizationQuery;
  const result = await OrganizationService.getMyOrganization(
    getAuthUser(req),
    query.organizationId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Organization retrieved successfully",
    data: result,
  });
});

const updateOrganizationProfile = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as OrganizationQuery;
    const result = await OrganizationService.updateOrganizationProfile(
      getAuthUser(req),
      req.body,
      query.organizationId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Organization profile updated successfully",
      data: result,
    });
  }
);

const configureOrganizationSettings = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as OrganizationQuery;
    const result = await OrganizationService.configureOrganizationSettings(
      getAuthUser(req),
      req.body,
      query.organizationId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Organization settings configured successfully",
      data: result,
    });
  }
);

const configureSubscriptionInfo = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as OrganizationQuery;
    const result = await OrganizationService.configureSubscriptionInfo(
      getAuthUser(req),
      req.body,
      query.organizationId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Organization subscription info configured successfully",
      data: result,
    });
  }
);

const disableOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.disableOrganization(
    getAuthUser(req),
    getOrganizationIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Organization disabled successfully",
    data: result,
  });
});

const enableOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.enableOrganization(
    getAuthUser(req),
    getOrganizationIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Organization enabled successfully",
    data: result,
  });
});

export const OrganizationController = {
  createOrganization,
  getMyOrganization,
  updateOrganizationProfile,
  configureOrganizationSettings,
  configureSubscriptionInfo,
  disableOrganization,
  enableOrganization,
};
