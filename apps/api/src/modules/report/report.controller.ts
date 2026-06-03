import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { ReportService } from "./report.service.js";
import type { OwnerReportSummaryQuery } from "./report.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getOwnerSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getOwnerSummary(
    getAuthUser(req),
    req.query as unknown as OwnerReportSummaryQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report summary retrieved successfully",
    data: result,
  });
});

export const ReportController = {
  getOwnerSummary,
};
