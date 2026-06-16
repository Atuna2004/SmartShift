import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { AttendanceService } from "./attendance.service.js";
import type {
  AttendanceAlertQuery,
  AttendanceHistoryQuery,
} from "./attendance.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getAttendanceIdParam = (req: Request) => {
  const attendanceId = req.params.attendanceId;

  if (typeof attendanceId !== "string") {
    throw new AppError(400, "Attendance id is required");
  }

  return attendanceId;
};

const checkIn = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceService.checkIn(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Check-in successful",
    data: result,
  });
});

const checkOut = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceService.checkOut(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check-out successful",
    data: result,
  });
});

const requestManualCorrection = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceService.requestManualCorrection(
      getAuthUser(req),
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Manual attendance correction submitted successfully",
      data: result,
    });
  }
);

const approveManualAttendance = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AttendanceService.approveManualAttendance(
      getAuthUser(req),
      getAttendanceIdParam(req),
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Manual attendance reviewed successfully",
      data: result,
    });
  }
);

const autoMarkAbsent = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceService.autoMarkAbsent(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Absent schedules marked successfully",
    data: result,
  });
});

const undoMarkAbsent = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceService.undoMarkAbsent(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Absent mark cancelled successfully",
    data: result,
  });
});

const getAttendanceHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceService.getAttendanceHistory(
    getAuthUser(req),
    req.query as unknown as AttendanceHistoryQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance history retrieved successfully",
    data: result,
  });
});

const getAttendanceReminders = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceService.getAttendanceReminders(
    getAuthUser(req),
    req.query as unknown as AttendanceAlertQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Attendance reminders retrieved successfully",
    data: result,
  });
});

const getLateWarnings = catchAsync(async (req: Request, res: Response) => {
  const result = await AttendanceService.getLateWarnings(
    getAuthUser(req),
    req.query as unknown as AttendanceAlertQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Late warnings retrieved successfully",
    data: result,
  });
});

export const AttendanceController = {
  checkIn,
  checkOut,
  requestManualCorrection,
  approveManualAttendance,
  autoMarkAbsent,
  undoMarkAbsent,
  getAttendanceHistory,
  getAttendanceReminders,
  getLateWarnings,
};
