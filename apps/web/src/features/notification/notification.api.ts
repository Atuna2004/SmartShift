import { api } from "@/shared/api";
import type { Notification, NotificationListQuery, NotificationListResponse } from "./notification.types";

export const notificationApi = {
  list: (query?: NotificationListQuery) => api.get<NotificationListResponse>("/notifications", query),
  unreadCount: () => api.get<{ unreadCount: number }>("/notifications/unread-count"),
  markAsRead: (notificationId: string) => api.patch<Notification>(`/notifications/${notificationId}/read`, {}),
  markAllAsRead: () => api.patch<{ modifiedCount: number }>("/notifications/mark-all-read", {}),
};
