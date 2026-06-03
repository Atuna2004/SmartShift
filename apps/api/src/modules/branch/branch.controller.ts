import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { BranchService } from "./branch.service.js";
import type { BranchListQuery } from "./branch.schema.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getBranchIdParam = (req: Request) => {
  const branchId = req.params.branchId;

  if (typeof branchId !== "string") {
    throw new AppError(400, "Branch id is required");
  }

  return branchId;
};

const createBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.createBranch(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Branch created successfully",
    data: result,
  });
});

const getBranchList = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.getBranchList(
    getAuthUser(req),
    req.query as unknown as BranchListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch list retrieved successfully",
    data: result,
  });
});

const getBranchById = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.getBranchById(
    getAuthUser(req),
    getBranchIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch detail retrieved successfully",
    data: result,
  });
});

const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.updateBranch(
    getAuthUser(req),
    getBranchIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch updated successfully",
    data: result,
  });
});

const disableBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.disableBranch(
    getAuthUser(req),
    getBranchIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch disabled successfully",
    data: result,
  });
});

const enableBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.enableBranch(
    getAuthUser(req),
    getBranchIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch enabled successfully",
    data: result,
  });
});

const configureBranchSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.configureBranchSettings(
    getAuthUser(req),
    getBranchIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch settings configured successfully",
    data: result,
  });
});

const configureQrSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.configureQrSettings(
    getAuthUser(req),
    getBranchIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch QR settings configured successfully",
    data: result,
  });
});

const configureLateThreshold = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.configureLateThreshold(
    getAuthUser(req),
    getBranchIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Branch late threshold configured successfully",
    data: result,
  });
});

export const BranchController = {
  createBranch,
  getBranchList,
  getBranchById,
  updateBranch,
  disableBranch,
  enableBranch,
  configureBranchSettings,
  configureQrSettings,
  configureLateThreshold,
};
