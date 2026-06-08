export type NotificationType =
  | "schedule_published"
  | "shift_changed"
  | "shift_swap_requested"
  | "shift_swap_accepted"
  | "shift_swap_rejected"
  | "leave_requested"
  | "leave_approved"
  | "leave_rejected"
  | "checkin_reminder"
  | "checkout_reminder"
  | "attendance_warning"
  | "system";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  branchId?: string;
  organizationId?: string;
  relatedId?: string;
  relatedModel?: string;
};

export type NotificationListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
  data: Notification[];
};

export type NotificationListQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
  includeArchived?: boolean;
};

export type CreateNotificationRequest = {
  userIds?: string[];
  branchId?: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  relatedModel?: string;
};

export type CreateNotificationResponse = {
  total: number;
  data: Notification[];
};
