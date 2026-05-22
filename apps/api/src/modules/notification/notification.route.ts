import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createNotificationSchema,
  notificationIdParamSchema,
  notificationListSchema,
} from "./notification.validation.js";
import { NotificationController } from "./notification.controller.js";

const router = Router();

router.use(auth());

router.post(
  "/",
  validateRequest(createNotificationSchema),
  NotificationController.createNotification
);
router.get(
  "/",
  validateRequest(notificationListSchema),
  NotificationController.getMyNotifications
);
router.get("/unread-count", NotificationController.getUnreadCount);
router.patch(
  "/mark-all-read",
  NotificationController.markAllAsRead
);
router.patch(
  "/:notificationId/read",
  validateRequest(notificationIdParamSchema),
  NotificationController.markAsRead
);
router.patch(
  "/:notificationId/unread",
  validateRequest(notificationIdParamSchema),
  NotificationController.markAsUnread
);
router.delete(
  "/:notificationId",
  validateRequest(notificationIdParamSchema),
  NotificationController.archiveNotification
);

export const NotificationRoutes = router;
