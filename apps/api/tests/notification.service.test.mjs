import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import { NotificationModel } from "../dist/modules/notification/notification.model.js";
import { NotificationService } from "../dist/modules/notification/notification.service.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const managerId = new Types.ObjectId("64a000000000000000000002");
const staffId = new Types.ObjectId("64a000000000000000000003");
const otherStaffId = new Types.ObjectId("64a000000000000000000004");
const branchId = new Types.ObjectId("64b000000000000000000001");
const notificationId = new Types.ObjectId("653000000000000000000001");

const originals = [];

const stub = (target, key, value) => {
  originals.push([target, key, target[key]]);
  target[key] = value;
};

afterEach(() => {
  while (originals.length) {
    const [target, key, value] = originals.pop();
    target[key] = value;
  }
});

const actorPayload = (user) => ({
  userId: user._id.toString(),
  role: user.role,
  ...(user.branchId ? { branchId: user.branchId.toString() } : {}),
  ...(user.organizationId ? { organizationId: user.organizationId.toString() } : {}),
});

const createUserDoc = (overrides = {}) => ({
  _id: overrides._id ?? staffId,
  fullName: "Test User",
  email: "user@example.com",
  role: overrides.role ?? "staff",
  status: overrides.status ?? "active",
  branchId: overrides.branchId,
  organizationId: overrides.organizationId,
  createdBy: overrides.createdBy,
  ...overrides,
});

const createBranchDoc = (overrides = {}) => ({
  _id: overrides._id ?? branchId,
  organizationId,
  ownerId,
  createdBy: ownerId,
  name: "Branch",
  status: "active",
  ...overrides,
});

const createNotificationDoc = (overrides = {}) => ({
  _id: overrides._id ?? notificationId,
  organizationId,
  userId: overrides.userId ?? staffId,
  branchId,
  title: overrides.title ?? "Notice",
  message: overrides.message ?? "Message",
  type: overrides.type ?? "system",
  isRead: overrides.isRead ?? false,
  readAt: overrides.readAt,
  archivedAt: overrides.archivedAt,
  set(key, value) {
    if (value === undefined) {
      delete this[key];
      return;
    }
    this[key] = value;
  },
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

test("Create Notification: manager can broadcast to assigned branch", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const branch = createBranchDoc();
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const otherStaff = createUserDoc({ _id: otherStaffId, role: "staff", branchId });
  let insertedPayloads;

  stub(UserModel, "findById", async () => manager);
  stub(BranchModel, "findById", async () => branch);
  stub(UserModel, "find", async () => [staff, otherStaff]);
  stub(NotificationModel, "insertMany", async (payloads) => {
    insertedPayloads = payloads;
    return payloads.map((payload, index) =>
      createNotificationDoc({
        _id: new Types.ObjectId(`65300000000000000000000${index + 1}`),
        ...payload,
      })
    );
  });

  const result = await NotificationService.createNotification(actorPayload(manager), {
    branchId: branchId.toString(),
    title: "Schedule update",
    message: "New schedule is available",
    type: "schedule_published",
  });

  assert.equal(result.total, 2);
  assert.equal(insertedPayloads[0].branchId.toString(), branchId.toString());
});

test("Create Notification: staff cannot create notifications", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });

  stub(UserModel, "findById", async () => staff);

  await assert.rejects(
    () =>
      NotificationService.createNotification(actorPayload(staff), {
        userIds: [otherStaffId.toString()],
        title: "Notice",
        message: "Message",
        type: "system",
      }),
    { statusCode: 403 }
  );
});

test("Mark As Read: user can mark own notification", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const notification = createNotificationDoc({ userId: staffId, isRead: false });

  stub(UserModel, "findById", async () => staff);
  stub(NotificationModel, "findById", async () => notification);

  const result = await NotificationService.markAsRead(
    actorPayload(staff),
    notificationId.toString()
  );

  assert.equal(result.isRead, true);
  assert.equal(notification.saved, true);
});

test("Mark As Read: user cannot mark another user's notification", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const notification = createNotificationDoc({ userId: otherStaffId });

  stub(UserModel, "findById", async () => staff);
  stub(NotificationModel, "findById", async () => notification);

  await assert.rejects(
    () =>
      NotificationService.markAsRead(actorPayload(staff), notificationId.toString()),
    { statusCode: 403 }
  );
});

test("Mark All As Read: updates unread own notifications", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  let capturedFilter;

  stub(UserModel, "findById", async () => staff);
  stub(NotificationModel, "updateMany", async (filter) => {
    capturedFilter = filter;
    return { modifiedCount: 3 };
  });

  const result = await NotificationService.markAllAsRead(actorPayload(staff));

  assert.equal(result.modifiedCount, 3);
  assert.equal(capturedFilter.userId.toString(), staffId.toString());
});
