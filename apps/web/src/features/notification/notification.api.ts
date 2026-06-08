import { api } from "@/shared/api";
import type { CreateNotificationRequest, CreateNotificationResponse, Notification, NotificationListQuery, NotificationListResponse } from "./notification.types";

export const notificationApi = {
  list: (query?: NotificationListQuery) => api.get<NotificationListResponse>("/notifications", query),
  create: (payload: CreateNotificationRequest) => api.post<CreateNotificationResponse>("/notifications", payload),
  unreadCount: () => api.get<{ unreadCount: number }>("/notifications/unread-count"),
  markAsRead: (notificationId: string) => api.patch<Notification>(`/notifications/${notificationId}/read`, {}),
  markAsUnread: (notificationId: string) => api.patch<Notification>(`/notifications/${notificationId}/unread`, {}),
  markAllAsRead: () => api.patch<{ modifiedCount: number }>("/notifications/mark-all-read", {}),
  archive: (notificationId: string) => api.delete<Notification>(`/notifications/${notificationId}`),
};
