import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { ScheduleService } from "./schedule.service.js";
import type {
  MyScheduleQuery,
  WeeklyScheduleQuery,
} from "./schedule.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getAssignedShiftIdParam = (req: Request) => {
  const assignedShiftId = req.params.assignedShiftId;

  if (typeof assignedShiftId !== "string") {
    throw new AppError(400, "Assigned shift id is required");
  }

  return assignedShiftId;
};

const createAssignedShift = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.createAssignedShift(
    getAuthUser(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Assigned shift created successfully",
    data: result,
  });
});

const updateAssignedShift = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.updateAssignedShift(
    getAuthUser(req),
    getAssignedShiftIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assigned shift updated successfully",
    data: result,
  });
});

const deleteAssignedShift = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.deleteAssignedShift(
    getAuthUser(req),
    getAssignedShiftIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assigned shift deleted successfully",
    data: result,
  });
});

const getWeeklySchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.getWeeklySchedule(
    getAuthUser(req),
    req.query as unknown as WeeklyScheduleQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Weekly schedule retrieved successfully",
    data: result,
  });
});

const getMySchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.getMySchedule(
    getAuthUser(req),
    req.query as unknown as MyScheduleQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My schedule retrieved successfully",
    data: result,
  });
});

export const ScheduleController = {
  createAssignedShift,
  updateAssignedShift,
  deleteAssignedShift,
  getWeeklySchedule,
  getMySchedule,
};
