import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { sendResponse } from "../../common/utils/response.js";
import { NotificationService } from "./notification.service.js";
import type { NotificationListQuery } from "./notification.validation.js";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError(401, "You are not authorized");
  }

  return req.user;
};

const getNotificationIdParam = (req: Request) => {
  const notificationId = req.params.notificationId;

  if (typeof notificationId !== "string") {
    throw new AppError(400, "Notification id is required");
  }

  return notificationId;
};

const createNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.createNotification(
    getAuthUser(req),
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Notification created successfully",
    data: result,
  });
});

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getMyNotifications(
    getAuthUser(req),
    req.query as unknown as NotificationListQuery
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getUnreadCount(getAuthUser(req));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Unread notification count retrieved successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markAsRead(
    getAuthUser(req),
    getNotificationIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read successfully",
    data: result,
  });
});

const markAsUnread = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markAsUnread(
    getAuthUser(req),
    getNotificationIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as unread successfully",
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markAllAsRead(getAuthUser(req));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications marked as read successfully",
    data: result,
  });
});

const archiveNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.archiveNotification(
    getAuthUser(req),
    getNotificationIdParam(req)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification archived successfully",
    data: result,
  });
});

export const NotificationController = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  archiveNotification,
};
