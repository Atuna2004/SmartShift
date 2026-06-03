import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { UserService } from "./user.service.js";
import type { EmployeeListQuery } from "./user.schema.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getUserIdParam = (req: Request) => {
  const userId = req.params.userId;

  if (typeof userId !== "string") {
    throw new AppError(400, "User id is required");
  }

  return userId;
};

const createEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createEmployee(getAuthUser(req), req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Employee created successfully",
    data: result,
  });
});

const getEmployeeList = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getEmployeeList(
    getAuthUser(req),
    req.query as unknown as EmployeeListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee list retrieved successfully",
    data: result,
  });
});

const getEmployeeById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getEmployeeById(
    getAuthUser(req),
    getUserIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee detail retrieved successfully",
    data: result,
  });
});

const updateEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateEmployee(
    getAuthUser(req),
    getUserIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee updated successfully",
    data: result,
  });
});

const activateEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.activateEmployee(
    getAuthUser(req),
    getUserIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee activated successfully",
    data: result,
  });
});

const deactivateEmployee = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deactivateEmployee(
    getAuthUser(req),
    getUserIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee deactivated successfully",
    data: result,
  });
});

const transferEmployeeBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.transferEmployeeBranch(
    getAuthUser(req),
    getUserIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Employee transferred successfully",
    data: result,
  });
});

const assignManagerToBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.assignManagerToBranch(
    getAuthUser(req),
    getUserIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Manager assigned to branch successfully",
    data: result,
  });
});

const removeManagerFromBranch = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.removeManagerFromBranch(
    getAuthUser(req),
    getUserIdParam(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Manager removed from branch successfully",
    data: result,
  });
});

export const UserController = {
  createEmployee,
  getEmployeeList,
  getEmployeeById,
  updateEmployee,
  activateEmployee,
  deactivateEmployee,
  transferEmployeeBranch,
  assignManagerToBranch,
  removeManagerFromBranch,
};
