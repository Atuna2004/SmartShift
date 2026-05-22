import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import { LeaveRequestModel } from "../dist/modules/leaveRequest/leave-request.model.js";
import { LeaveRequestService } from "../dist/modules/leaveRequest/leave-request.service.js";
import { ScheduleModel } from "../dist/modules/schedule/schedule.model.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const managerId = new Types.ObjectId("64a000000000000000000002");
const staffId = new Types.ObjectId("64a000000000000000000003");
const branchId = new Types.ObjectId("64b000000000000000000001");
const scheduleId = new Types.ObjectId("64e000000000000000000001");
const shiftTemplateId = new Types.ObjectId("64d000000000000000000001");
const leaveRequestId = new Types.ObjectId("651000000000000000000001");

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

const createScheduleDoc = (overrides = {}) => ({
  _id: overrides._id ?? scheduleId,
  organizationId,
  branchId,
  employeeId: staffId,
  shiftTemplateId,
  workDate: new Date("2026-05-25T00:00:00.000Z"),
  shiftStartTime: "08:00",
  shiftEndTime: "17:00",
  status: "scheduled",
  published: true,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createLeaveRequestDoc = (overrides = {}) => ({
  _id: overrides._id ?? leaveRequestId,
  organizationId,
  branchId,
  employeeId: staffId,
  scheduleId,
  reason: overrides.reason ?? "Family matter",
  status: overrides.status ?? "pending",
  requestedAt: overrides.requestedAt ?? new Date("2026-05-20T00:00:00.000Z"),
  approvedBy: overrides.approvedBy,
  managerNote: overrides.managerNote,
  respondedAt: overrides.respondedAt,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

test("Create Leave Request: staff can request leave for own assigned shift", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const schedule = createScheduleDoc();
  let createdPayload;

  stub(UserModel, "findById", async () => staff);
  stub(ScheduleModel, "findById", async () => schedule);
  stub(BranchModel, "findById", async () => branch);
  stub(LeaveRequestModel, "findOne", async () => null);
  stub(LeaveRequestModel, "create", async (payload) => {
    createdPayload = payload;
    return createLeaveRequestDoc({ _id: leaveRequestId, ...payload });
  });

  const result = await LeaveRequestService.createLeaveRequest(actorPayload(staff), {
    scheduleId: scheduleId.toString(),
    reason: "Family matter",
  });

  assert.equal(result.id, leaveRequestId.toString());
  assert.equal(result.status, "pending");
  assert.equal(createdPayload.organizationId.toString(), organizationId.toString());
  assert.equal(createdPayload.employeeId.toString(), staffId.toString());
});

test("Create Leave Request: staff cannot request leave for another employee", async () => {
  const otherStaffId = new Types.ObjectId("64a000000000000000000004");
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const schedule = createScheduleDoc({ employeeId: otherStaffId });

  stub(UserModel, "findById", async () => staff);
  stub(ScheduleModel, "findById", async () => schedule);
  stub(BranchModel, "findById", async () => branch);

  await assert.rejects(
    () =>
      LeaveRequestService.createLeaveRequest(actorPayload(staff), {
        scheduleId: scheduleId.toString(),
        reason: "Family matter",
      }),
    { statusCode: 403 }
  );
});

test("Approve Leave Request: manager approves pending request and updates schedule", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const branch = createBranchDoc();
  const leaveRequest = createLeaveRequestDoc();
  const schedule = createScheduleDoc();

  stub(UserModel, "findById", async () => manager);
  stub(LeaveRequestModel, "findById", async () => leaveRequest);
  stub(BranchModel, "findById", async () => branch);
  stub(ScheduleModel, "findById", async () => schedule);

  const result = await LeaveRequestService.approveLeaveRequest(
    actorPayload(manager),
    leaveRequestId.toString(),
    { managerNote: "Approved" }
  );

  assert.equal(result.status, "approved");
  assert.equal(result.approvedBy, managerId.toString());
  assert.equal(schedule.status, "leave_requested");
  assert.equal(schedule.saved, true);
  assert.equal(leaveRequest.saved, true);
});

test("Cancel Leave Request: staff can cancel pending request", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const leaveRequest = createLeaveRequestDoc();

  stub(UserModel, "findById", async () => staff);
  stub(LeaveRequestModel, "findById", async () => leaveRequest);

  const result = await LeaveRequestService.cancelLeaveRequest(
    actorPayload(staff),
    leaveRequestId.toString()
  );

  assert.equal(result.status, "cancelled");
  assert.equal(leaveRequest.saved, true);
});
