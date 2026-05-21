import type { Request, Response } from "express";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { AuthService } from "./auth.service.js";

const registerOwner = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerOwner(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Owner registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Authenticated user is missing from request");
  }

  const result = await AuthService.logout(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logout successful",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reset password email sent successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reset password successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Authenticated user is missing from request");
  }

  const result = await AuthService.changePassword(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Change password successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.refreshToken(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Refresh token successfully",
    data: result,
  });
});

const me = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Authenticated user is missing from request");
  }

  const result = await AuthService.getMe(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Current user retrieved successfully",
    data: result,
  });
});

const viewProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Authenticated user is missing from request");
  }

  const result = await AuthService.viewProfile(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get profile successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Authenticated user is missing from request");
  }

  const result = await AuthService.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Update profile successfully",
    data: result,
  });
});

export const AuthController = {
  registerOwner,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  me,
  viewProfile,
  updateProfile,
};
