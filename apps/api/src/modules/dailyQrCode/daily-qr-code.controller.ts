import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { DailyQrCodeService } from "./daily-qr-code.service.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const generateDailyQr = catchAsync(async (req: Request, res: Response) => {
  const result = await DailyQrCodeService.generateDailyQr(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Daily QR generated successfully",
    data: result,
  });
});

const verifyQr = catchAsync(async (req: Request, res: Response) => {
  const result = await DailyQrCodeService.verifyQr(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "QR verified successfully",
    data: result,
  });
});

export const DailyQrCodeController = {
  generateDailyQr,
  verifyQr,
};
