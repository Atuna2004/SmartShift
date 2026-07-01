import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { CompensationService } from "./compensation.service.js";
import type {
  AdjustmentListQuery,
  CompensationSummaryQuery,
  OvertimeListQuery,
} from "./compensation.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }
  return req.user;
};

const createOvertimeRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.createOvertimeRequest(getAuthUser(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Overtime request created successfully", data: result });
});

const getOvertimeList = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.getOvertimeList(getAuthUser(req), req.query as unknown as OvertimeListQuery);
  sendResponse(res, { statusCode: 200, success: true, message: "Overtime request list retrieved successfully", data: result });
});

const approveOvertimeRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.approveOvertimeRequest(getAuthUser(req), req.params.overtimeId as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Overtime request approved successfully", data: result });
});

const rejectOvertimeRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.rejectOvertimeRequest(getAuthUser(req), req.params.overtimeId as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Overtime request rejected successfully", data: result });
});

const cancelOvertimeRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.cancelOvertimeRequest(getAuthUser(req), req.params.overtimeId as string);
  sendResponse(res, { statusCode: 200, success: true, message: "Overtime request cancelled successfully", data: result });
});

const createAdjustment = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.createAdjustment(getAuthUser(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Compensation adjustment created successfully", data: result });
});

const getAdjustmentList = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.getAdjustmentList(getAuthUser(req), req.query as unknown as AdjustmentListQuery);
  sendResponse(res, { statusCode: 200, success: true, message: "Compensation adjustment list retrieved successfully", data: result });
});

const deleteAdjustment = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.deleteAdjustment(getAuthUser(req), req.params.adjustmentId as string);
  sendResponse(res, { statusCode: 200, success: true, message: "Compensation adjustment deleted successfully", data: result });
});

const getCompensationSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await CompensationService.getCompensationSummary(getAuthUser(req), req.query as unknown as CompensationSummaryQuery);
  sendResponse(res, { statusCode: 200, success: true, message: "Compensation summary retrieved successfully", data: result });
});

export const CompensationController = {
  createOvertimeRequest,
  getOvertimeList,
  approveOvertimeRequest,
  rejectOvertimeRequest,
  cancelOvertimeRequest,
  createAdjustment,
  getAdjustmentList,
  deleteAdjustment,
  getCompensationSummary,
};
