import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { LeaveRequestService } from "./leave-request.service.js";
import type { LeaveRequestListQuery } from "./leave-request.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getLeaveRequestIdParam = (req: Request) => {
  const leaveRequestId = req.params.leaveRequestId;

  if (typeof leaveRequestId !== "string") {
    throw new AppError(400, "Leave request id is required");
  }

  return leaveRequestId;
};

const createLeaveRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveRequestService.createLeaveRequest(
    getAuthUser(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Leave request created successfully",
    data: result,
  });
});

const updateLeaveRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveRequestService.updateLeaveRequest(
    getAuthUser(req),
    getLeaveRequestIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave request updated successfully",
    data: result,
  });
});

const cancelLeaveRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveRequestService.cancelLeaveRequest(
    getAuthUser(req),
    getLeaveRequestIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave request cancelled successfully",
    data: result,
  });
});

const approveLeaveRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveRequestService.approveLeaveRequest(
    getAuthUser(req),
    getLeaveRequestIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave request approved successfully",
    data: result,
  });
});

const rejectLeaveRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveRequestService.rejectLeaveRequest(
    getAuthUser(req),
    getLeaveRequestIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave request rejected successfully",
    data: result,
  });
});

const getLeaveRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveRequestService.getLeaveRequestById(
    getAuthUser(req),
    getLeaveRequestIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave request detail retrieved successfully",
    data: result,
  });
});

const getLeaveRequestList = catchAsync(async (req: Request, res: Response) => {
  const result = await LeaveRequestService.getLeaveRequestList(
    getAuthUser(req),
    req.query as unknown as LeaveRequestListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leave request list retrieved successfully",
    data: result,
  });
});

export const LeaveRequestController = {
  createLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveRequestById,
  getLeaveRequestList,
};
