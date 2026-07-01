import mongoose, { Schema, Document, Types } from "mongoose";

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
  | "compensation_bonus"
  | "compensation_penalty"
  | "system";

export interface INotification extends Document {
  organizationId?: Types.ObjectId;
  userId: Types.ObjectId;
  branchId?: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: Types.ObjectId;
  relatedModel?: string;
  isRead: boolean;
  readAt?: Date;
  archivedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "schedule_published",
        "shift_changed",
        "shift_swap_requested",
        "shift_swap_accepted",
        "shift_swap_rejected",
        "leave_requested",
        "leave_approved",
        "leave_rejected",
        "checkin_reminder",
        "checkout_reminder",
        "attendance_warning",
        "compensation_bonus",
        "compensation_penalty",
        "system",
      ],
      required: true,
    },

    relatedId: {
      type: Schema.Types.ObjectId,
    },

    relatedModel: {
      type: String,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    archivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ organizationId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ branchId: 1 });
notificationSchema.index({ archivedAt: 1 });

export const NotificationModel =
  mongoose.model<INotification>("Notification", notificationSchema);
