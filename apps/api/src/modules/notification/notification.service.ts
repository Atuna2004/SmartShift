import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { NotificationModel } from "./notification.model.js";
import type { INotification, NotificationType } from "./notification.model.js";
import type {
  CreateNotificationInput,
  NotificationListQuery,
} from "./notification.validation.js";

type CreateSystemNotificationInput = {
  userId: string | Types.ObjectId;
  organizationId?: string | Types.ObjectId;
  branchId?: string | Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string | Types.ObjectId;
  relatedModel?: string;
};

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

const asObjectId = (value: string | Types.ObjectId) =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const ensureActor = async (actor: AuthTokenPayload) => {
  if (!actor.userId) {
    throw new AppError(401, "You are not authorized");
  }

  const user = await UserModel.findById(actor.userId);

  if (!user) {
    throw new AppError(401, "Authenticated user no longer exists");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive");
  }

  return user;
};

const assertBranchAccess = (actor: IUser, branch: IBranch) => {
  if (branch.deletedAt || branch.status !== "active") {
    throw new AppError(404, "Branch not found");
  }

  if (actor.role === "owner") {
    const sameOrganization =
      actor.organizationId &&
      branch.organizationId &&
      actor.organizationId.equals(branch.organizationId);
    const ownedByOwner = branch.ownerId && branch.ownerId.equals(getDocumentId(actor));
    const createdByOwner =
      branch.createdBy && branch.createdBy.equals(getDocumentId(actor));

    if (!sameOrganization && !ownedByOwner && !createdByOwner) {
      throw new AppError(403, "Branch is outside your organization");
    }

    return;
  }

  if (!actor.branchId || !actor.branchId.equals(getDocumentId(branch))) {
    throw new AppError(403, "Branch is outside your assignment");
  }
};

const getBranchForActor = async (actor: IUser, branchId: string | Types.ObjectId) => {
  const branch = await BranchModel.findById(branchId);

  if (!branch) {
    throw new AppError(404, "Branch not found");
  }

  assertBranchAccess(actor, branch);

  return branch;
};

const assertRecipientAccess = async (
  actor: IUser,
  recipientId: string | Types.ObjectId
) => {
  const recipient = await UserModel.findById(recipientId);

  if (!recipient) {
    throw new AppError(404, "Notification recipient not found");
  }

  if (recipient.status !== "active") {
    throw new AppError(400, "Notification recipient is inactive");
  }

  if (actor.role === "owner") {
    const sameOrganization =
      actor.organizationId &&
      recipient.organizationId &&
      actor.organizationId.equals(recipient.organizationId);
    const createdByOwner = recipient.createdBy && recipient.createdBy.equals(getDocumentId(actor));
    const isSelf = recipient._id.equals(getDocumentId(actor));

    if (!sameOrganization && !createdByOwner && !isSelf) {
      throw new AppError(403, "Recipient is outside your organization");
    }

    return recipient;
  }

  if (actor.role === "manager") {
    if (!actor.branchId || !recipient.branchId || !actor.branchId.equals(recipient.branchId)) {
      throw new AppError(403, "Recipient is outside your branch");
    }

    return recipient;
  }

  throw new AppError(403, "Staff cannot create notifications");
};

const toPublicNotification = (notification: INotification) => ({
  id: getDocumentId(notification).toString(),
  userId: notification.userId.toString(),
  title: notification.title,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  createdAt: (notification as unknown as { createdAt?: Date }).createdAt,
  updatedAt: (notification as unknown as { updatedAt?: Date }).updatedAt,
  ...(notification.organizationId
    ? { organizationId: notification.organizationId.toString() }
    : {}),
  ...(notification.branchId ? { branchId: notification.branchId.toString() } : {}),
  ...(notification.relatedId ? { relatedId: notification.relatedId.toString() } : {}),
  ...(notification.relatedModel ? { relatedModel: notification.relatedModel } : {}),
  ...(notification.readAt ? { readAt: notification.readAt } : {}),
  ...(notification.archivedAt ? { archivedAt: notification.archivedAt } : {}),
});

export const createSystemNotification = async (
  payload: CreateSystemNotificationInput
) => {
  const notification = await NotificationModel.create({
    userId: asObjectId(payload.userId),
    title: payload.title,
    message: payload.message,
    type: payload.type,
    isRead: false,
    ...(payload.organizationId
      ? { organizationId: asObjectId(payload.organizationId) }
      : {}),
    ...(payload.branchId ? { branchId: asObjectId(payload.branchId) } : {}),
    ...(payload.relatedId ? { relatedId: asObjectId(payload.relatedId) } : {}),
    ...(payload.relatedModel ? { relatedModel: payload.relatedModel } : {}),
  });

  return toPublicNotification(notification);
};

export const createSystemNotifications = async (
  payloads: CreateSystemNotificationInput[]
) => {
  if (!payloads.length) {
    return [];
  }

  const createdNotifications = await NotificationModel.insertMany(
    payloads.map((payload) => ({
      userId: asObjectId(payload.userId),
      title: payload.title,
      message: payload.message,
      type: payload.type,
      isRead: false,
      ...(payload.organizationId
        ? { organizationId: asObjectId(payload.organizationId) }
        : {}),
      ...(payload.branchId ? { branchId: asObjectId(payload.branchId) } : {}),
      ...(payload.relatedId ? { relatedId: asObjectId(payload.relatedId) } : {}),
      ...(payload.relatedModel ? { relatedModel: payload.relatedModel } : {}),
    }))
  );

  return createdNotifications.map(toPublicNotification);
};

const createNotification = async (
  actorPayload: AuthTokenPayload,
  payload: CreateNotificationInput
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role === "staff") {
    throw new AppError(403, "Staff cannot create notifications");
  }

  const recipients = new Map<string, IUser>();
  let branch: IBranch | null = null;

  if (payload.branchId) {
    branch = await getBranchForActor(actor, payload.branchId);
    const branchUsers = await UserModel.find({
      branchId: getDocumentId(branch),
      status: "active",
    });

    for (const user of branchUsers) {
      recipients.set(getDocumentId(user).toString(), user);
    }
  }

  if (payload.userIds) {
    for (const userId of payload.userIds) {
      const recipient = await assertRecipientAccess(actor, userId);
      recipients.set(getDocumentId(recipient).toString(), recipient);
    }
  }

  if (!recipients.size) {
    throw new AppError(400, "No notification recipients found");
  }

  const notifications = await createSystemNotifications(
    [...recipients.values()].map((recipient) => {
      const organizationId =
        recipient.organizationId ?? branch?.organizationId ?? actor.organizationId;
      const branchId = recipient.branchId ?? branch?._id;

      return {
        userId: getDocumentId(recipient),
        title: payload.title,
        message: payload.message,
        type: payload.type,
        ...(organizationId ? { organizationId } : {}),
        ...(branchId ? { branchId } : {}),
        ...(payload.relatedId ? { relatedId: payload.relatedId } : {}),
        ...(payload.relatedModel ? { relatedModel: payload.relatedModel } : {}),
      };
    })
  );

  return {
    total: notifications.length,
    data: notifications,
  };
};

const getMyNotifications = async (
  actorPayload: AuthTokenPayload,
  query: NotificationListQuery
) => {
  const actor = await ensureActor(actorPayload);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {
    userId: getDocumentId(actor),
  };

  if (!query.includeArchived) {
    filter.archivedAt = { $exists: false };
  }

  if (query.isRead !== undefined) {
    filter.isRead = query.isRead;
  }

  if (query.type) {
    filter.type = query.type;
  }

  const [items, total, unreadCount] = await Promise.all([
    NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    NotificationModel.countDocuments(filter),
    NotificationModel.countDocuments({
      userId: getDocumentId(actor),
      isRead: false,
      archivedAt: { $exists: false },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    },
    data: items.map(toPublicNotification),
  };
};

const getUnreadCount = async (actorPayload: AuthTokenPayload) => {
  const actor = await ensureActor(actorPayload);
  const unreadCount = await NotificationModel.countDocuments({
    userId: getDocumentId(actor),
    isRead: false,
    archivedAt: { $exists: false },
  });

  return { unreadCount };
};

const getOwnedNotification = async (
  actor: IUser,
  notificationId: string | Types.ObjectId
) => {
  const notification = await NotificationModel.findById(notificationId);

  if (!notification || notification.archivedAt) {
    throw new AppError(404, "Notification not found");
  }

  if (!notification.userId.equals(getDocumentId(actor))) {
    throw new AppError(403, "You can only update your own notifications");
  }

  return notification;
};

const markAsRead = async (actorPayload: AuthTokenPayload, notificationId: string) => {
  const actor = await ensureActor(actorPayload);
  const notification = await getOwnedNotification(actor, notificationId);

  notification.isRead = true;
  notification.readAt = notification.readAt ?? new Date();
  await notification.save();

  return toPublicNotification(notification);
};

const markAsUnread = async (actorPayload: AuthTokenPayload, notificationId: string) => {
  const actor = await ensureActor(actorPayload);
  const notification = await getOwnedNotification(actor, notificationId);

  notification.isRead = false;
  notification.set("readAt", undefined);
  await notification.save();

  return toPublicNotification(notification);
};

const markAllAsRead = async (actorPayload: AuthTokenPayload) => {
  const actor = await ensureActor(actorPayload);
  const now = new Date();
  const result = await NotificationModel.updateMany(
    {
      userId: getDocumentId(actor),
      isRead: false,
      archivedAt: { $exists: false },
    },
    {
      isRead: true,
      readAt: now,
    }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

const archiveNotification = async (
  actorPayload: AuthTokenPayload,
  notificationId: string
) => {
  const actor = await ensureActor(actorPayload);
  const notification = await getOwnedNotification(actor, notificationId);

  notification.archivedAt = new Date();
  await notification.save();

  return toPublicNotification(notification);
};

export const NotificationService = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  archiveNotification,
  createSystemNotification,
  createSystemNotifications,
};
