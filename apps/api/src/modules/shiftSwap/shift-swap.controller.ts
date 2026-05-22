import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { ShiftSwapService } from "./shift-swap.service.js";
import type { ShiftSwapListQuery } from "./shift-swap.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getShiftSwapIdParam = (req: Request) => {
  const shiftSwapId = req.params.shiftSwapId;

  if (typeof shiftSwapId !== "string") {
    throw new AppError(400, "Shift swap id is required");
  }

  return shiftSwapId;
};

const createShiftSwap = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftSwapService.createShiftSwap(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Shift swap request created successfully",
    data: result,
  });
});

const acceptShiftSwap = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftSwapService.acceptShiftSwap(
    getAuthUser(req),
    getShiftSwapIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift swap accepted successfully",
    data: result,
  });
});

const rejectShiftSwapByReceiver = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShiftSwapService.rejectShiftSwapByReceiver(
      getAuthUser(req),
      getShiftSwapIdParam(req),
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shift swap rejected by receiver successfully",
      data: result,
    });
  }
);

const approveShiftSwap = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftSwapService.approveShiftSwap(
    getAuthUser(req),
    getShiftSwapIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift swap approved successfully",
    data: result,
  });
});

const rejectShiftSwapByManager = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ShiftSwapService.rejectShiftSwapByManager(
      getAuthUser(req),
      getShiftSwapIdParam(req),
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shift swap rejected by manager successfully",
      data: result,
    });
  }
);

const cancelShiftSwap = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftSwapService.cancelShiftSwap(
    getAuthUser(req),
    getShiftSwapIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift swap cancelled successfully",
    data: result,
  });
});

const getShiftSwapById = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftSwapService.getShiftSwapById(
    getAuthUser(req),
    getShiftSwapIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift swap detail retrieved successfully",
    data: result,
  });
});

const getShiftSwapList = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftSwapService.getShiftSwapList(
    getAuthUser(req),
    req.query as unknown as ShiftSwapListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift swap list retrieved successfully",
    data: result,
  });
});

export const ShiftSwapController = {
  createShiftSwap,
  acceptShiftSwap,
  rejectShiftSwapByReceiver,
  approveShiftSwap,
  rejectShiftSwapByManager,
  cancelShiftSwap,
  getShiftSwapById,
  getShiftSwapList,
};
