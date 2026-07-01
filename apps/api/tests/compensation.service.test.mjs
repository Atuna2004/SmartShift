import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import {
  CompensationAdjustmentModel,
  OvertimeRequestModel,
} from "../dist/modules/compensation/compensation.model.js";
import { CompensationService } from "../dist/modules/compensation/compensation.service.js";
import { NotificationModel } from "../dist/modules/notification/notification.model.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const managerId = new Types.ObjectId("64a000000000000000000002");
const staffId = new Types.ObjectId("64a000000000000000000003");
const branchId = new Types.ObjectId("64b000000000000000000001");
const overtimeId = new Types.ObjectId("653000000000000000000001");
const adjustmentId = new Types.ObjectId("654000000000000000000001");
const notificationId = new Types.ObjectId("655000000000000000000001");

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
  fullName: overrides.fullName ?? "Test Staff",
  email: "user@example.com",
  role: overrides.role ?? "staff",
  status: overrides.status ?? "active",
  branchId: overrides.branchId ?? branchId,
  organizationId,
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

const createOvertimeDoc = (overrides = {}) => ({
  _id: overrides._id ?? overtimeId,
  organizationId,
  branchId,
  employeeId: staffId,
  workDate: new Date("2026-06-10T00:00:00.000Z"),
  startTime: "18:00",
  endTime: "20:00",
  hours: 2,
  hourlyRate: 50000,
  amount: 100000,
  reason: "Support closing",
  status: "pending",
  requestedAt: new Date("2026-06-10T10:00:00.000Z"),
  ...overrides,
});

const createAdjustmentDoc = (overrides = {}) => ({
  _id: overrides._id ?? adjustmentId,
  organizationId,
  branchId,
  employeeId: staffId,
  type: "bonus",
  amount: 100000,
  reason: "Good performance",
  effectiveDate: new Date("2026-06-10T00:00:00.000Z"),
  createdBy: managerId,
  ...overrides,
});

const setupUserAndBranch = (actor, employee = createUserDoc()) => {
  const branch = createBranchDoc();

  stub(UserModel, "findById", async (id) => {
    if (id.toString() === actor._id.toString()) return actor;
    if (id.toString() === employee._id.toString()) return employee;
    return null;
  });
  stub(BranchModel, "findById", async () => branch);

  return { branch };
};

test("Create Overtime: manager-created records are approved immediately", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  let createdPayload;

  setupUserAndBranch(manager, staff);
  stub(OvertimeRequestModel, "find", async () => []);
  stub(OvertimeRequestModel, "create", async (payload) => {
    createdPayload = payload;
    return createOvertimeDoc({ _id: overtimeId, ...payload });
  });

  const result = await CompensationService.createOvertimeRequest(actorPayload(manager), {
    employeeId: staffId.toString(),
    workDate: new Date("2026-06-10T00:00:00.000Z"),
    startTime: "18:00",
    endTime: "20:00",
    hourlyRate: 50000,
    reason: "Support closing",
  });

  assert.equal(result.status, "approved");
  assert.equal(result.reviewedBy, managerId.toString());
  assert.equal(result.hours, 2);
  assert.equal(result.amount, 100000);
  assert.equal(createdPayload.status, "approved");
});

test("Create Adjustment: creates a notification for the staff recipient", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  let notificationPayload;

  setupUserAndBranch(manager, staff);
  stub(CompensationAdjustmentModel, "create", async (payload) =>
    createAdjustmentDoc({ _id: adjustmentId, ...payload })
  );
  stub(NotificationModel, "create", async (payload) => {
    notificationPayload = payload;
    return {
      _id: notificationId,
      ...payload,
      createdAt: new Date("2026-06-10T00:00:00.000Z"),
      updatedAt: new Date("2026-06-10T00:00:00.000Z"),
    };
  });

  const result = await CompensationService.createAdjustment(actorPayload(manager), {
    employeeId: staffId.toString(),
    type: "bonus",
    amount: 100000,
    reason: "Good performance",
    effectiveDate: new Date("2026-06-10T00:00:00.000Z"),
  });

  assert.equal(result.id, adjustmentId.toString());
  assert.equal(notificationPayload.userId.toString(), staffId.toString());
  assert.equal(notificationPayload.type, "compensation_bonus");
  assert.equal(notificationPayload.relatedModel, "CompensationAdjustment");
  assert.equal(notificationPayload.relatedId.toString(), adjustmentId.toString());
});

test("Create Overtime: rejects overlapping overtime for the same employee", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });

  setupUserAndBranch(staff, staff);
  stub(OvertimeRequestModel, "find", async () => [
    createOvertimeDoc({
      employeeId: staffId,
      workDate: new Date("2026-06-10T00:00:00.000Z"),
      startTime: "18:00",
      endTime: "20:00",
      status: "pending",
    }),
  ]);
  stub(OvertimeRequestModel, "create", async () => {
    throw new Error("create should not be called");
  });

  await assert.rejects(
    () =>
      CompensationService.createOvertimeRequest(actorPayload(staff), {
        workDate: new Date("2026-06-10T00:00:00.000Z"),
        startTime: "19:00",
        endTime: "21:00",
        reason: "Extra setup",
      }),
    { statusCode: 409 }
  );
});

test("Create Overtime: rejects overlap with an overnight overtime record", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });

  setupUserAndBranch(staff, staff);
  stub(OvertimeRequestModel, "find", async () => [
    createOvertimeDoc({
      employeeId: staffId,
      workDate: new Date("2026-06-10T00:00:00.000Z"),
      startTime: "22:00",
      endTime: "02:00",
      status: "approved",
    }),
  ]);

  await assert.rejects(
    () =>
      CompensationService.createOvertimeRequest(actorPayload(staff), {
        workDate: new Date("2026-06-11T00:00:00.000Z"),
        startTime: "01:00",
        endTime: "03:00",
        reason: "Late inventory",
      }),
    { statusCode: 409 }
  );
});

test("Create Overtime: rejected or cancelled records do not block a new overtime request", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  let created = false;

  setupUserAndBranch(staff, staff);
  stub(OvertimeRequestModel, "find", async () => []);
  stub(OvertimeRequestModel, "create", async (payload) => {
    created = true;
    return createOvertimeDoc({ _id: overtimeId, ...payload });
  });

  const result = await CompensationService.createOvertimeRequest(actorPayload(staff), {
    workDate: new Date("2026-06-10T00:00:00.000Z"),
    startTime: "18:00",
    endTime: "20:00",
    reason: "Retry request",
  });

  assert.equal(created, true);
  assert.equal(result.status, "pending");
});

test("Create Overtime: rejects client-provided hours that do not match the time range", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });

  setupUserAndBranch(staff, staff);
  stub(OvertimeRequestModel, "find", async () => []);

  await assert.rejects(
    () =>
      CompensationService.createOvertimeRequest(actorPayload(staff), {
        workDate: new Date("2026-06-10T00:00:00.000Z"),
        startTime: "18:00",
        endTime: "20:00",
        hours: 8,
        reason: "Wrong hours",
      }),
    { statusCode: 400 }
  );
});

test("Compensation Summary: rejects invalid date range", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });

  setupUserAndBranch(manager);
  stub(OvertimeRequestModel, "find", async () => []);
  stub(CompensationAdjustmentModel, "find", async () => []);

  await assert.rejects(
    () =>
      CompensationService.getCompensationSummary(actorPayload(manager), {
        from: new Date("2026-06-11T00:00:00.000Z"),
        to: new Date("2026-06-10T00:00:00.000Z"),
      }),
    { statusCode: 400 }
  );
});
