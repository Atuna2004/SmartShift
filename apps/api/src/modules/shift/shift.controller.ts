import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { ShiftService } from "./shift.service.js";
import type { ShiftTemplateListQuery } from "./shift.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getShiftTemplateIdParam = (req: Request) => {
  const shiftTemplateId = req.params.shiftTemplateId;

  if (typeof shiftTemplateId !== "string") {
    throw new AppError(400, "Shift template id is required");
  }

  return shiftTemplateId;
};

const createShiftTemplate = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftService.createShiftTemplate(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Shift template created successfully",
    data: result,
  });
});

const getShiftTemplateList = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftService.getShiftTemplateList(
    getAuthUser(req),
    req.query as unknown as ShiftTemplateListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift template list retrieved successfully",
    data: result,
  });
});

const getShiftTemplateById = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftService.getShiftTemplateById(
    getAuthUser(req),
    getShiftTemplateIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift template detail retrieved successfully",
    data: result,
  });
});

const updateShiftTemplate = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftService.updateShiftTemplate(
    getAuthUser(req),
    getShiftTemplateIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift template updated successfully",
    data: result,
  });
});

const disableShiftTemplate = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftService.disableShiftTemplate(
    getAuthUser(req),
    getShiftTemplateIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift template disabled successfully",
    data: result,
  });
});

const enableShiftTemplate = catchAsync(async (req: Request, res: Response) => {
  const result = await ShiftService.enableShiftTemplate(
    getAuthUser(req),
    getShiftTemplateIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Shift template enabled successfully",
    data: result,
  });
});

export const ShiftController = {
  createShiftTemplate,
  getShiftTemplateList,
  getShiftTemplateById,
  updateShiftTemplate,
  disableShiftTemplate,
  enableShiftTemplate,
};
