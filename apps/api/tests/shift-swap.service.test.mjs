import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import { ScheduleModel } from "../dist/modules/schedule/schedule.model.js";
import { ShiftSwapRequestModel } from "../dist/modules/shiftSwap/shift-swap.model.js";
import { ShiftSwapService } from "../dist/modules/shiftSwap/shift-swap.service.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const managerId = new Types.ObjectId("64a000000000000000000002");
const fromEmployeeId = new Types.ObjectId("64a000000000000000000003");
const toEmployeeId = new Types.ObjectId("64a000000000000000000004");
const branchId = new Types.ObjectId("64b000000000000000000001");
const fromScheduleId = new Types.ObjectId("64e000000000000000000001");
const toScheduleId = new Types.ObjectId("64e000000000000000000002");
const shiftTemplateId = new Types.ObjectId("64d000000000000000000001");
const shiftSwapId = new Types.ObjectId("652000000000000000000001");

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
  _id: overrides._id ?? fromEmployeeId,
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
  _id: overrides._id ?? fromScheduleId,
  organizationId,
  branchId,
  employeeId: overrides.employeeId ?? fromEmployeeId,
  shiftTemplateId,
  workDate: new Date("2026-05-25T00:00:00.000Z"),
  shiftStartTime: "08:00",
  shiftEndTime: "17:00",
  status: overrides.status ?? "scheduled",
  published: true,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createShiftSwapDoc = (overrides = {}) => ({
  _id: overrides._id ?? shiftSwapId,
  organizationId,
  branchId,
  fromEmployeeId,
  toEmployeeId,
  fromScheduleId,
  toScheduleId: overrides.toScheduleId ?? toScheduleId,
  reason: overrides.reason,
  receiverStatus: overrides.receiverStatus ?? "pending",
  managerStatus: overrides.managerStatus ?? "pending",
  finalStatus: overrides.finalStatus ?? "pending_receiver",
  note: overrides.note,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

test("Create Shift Swap: staff creates request for own shift", async () => {
  const requester = createUserDoc({ _id: fromEmployeeId, role: "staff", branchId });
  const receiver = createUserDoc({ _id: toEmployeeId, role: "staff", branchId });
  const branch = createBranchDoc();
  const fromSchedule = createScheduleDoc({ _id: fromScheduleId, employeeId: fromEmployeeId });
  const toSchedule = createScheduleDoc({ _id: toScheduleId, employeeId: toEmployeeId });
  let createdPayload;

  stub(UserModel, "findById", async (id) => {
    if (id.toString() === requester._id.toString()) return requester;
    if (id.toString() === receiver._id.toString()) return receiver;
    return null;
  });
  stub(ScheduleModel, "findById", async (id) =>
    id.toString() === fromScheduleId.toString() ? fromSchedule : toSchedule
  );
  stub(BranchModel, "findById", async () => branch);
  stub(ShiftSwapRequestModel, "findOne", async () => null);
  stub(ShiftSwapRequestModel, "create", async (payload) => {
    createdPayload = payload;
    return createShiftSwapDoc({ _id: shiftSwapId, ...payload });
  });

  const result = await ShiftSwapService.createShiftSwap(actorPayload(requester), {
    toEmployeeId: toEmployeeId.toString(),
    fromScheduleId: fromScheduleId.toString(),
    toScheduleId: toScheduleId.toString(),
    reason: "Need to swap",
  });

  assert.equal(result.id, shiftSwapId.toString());
  assert.equal(result.finalStatus, "pending_receiver");
  assert.equal(createdPayload.organizationId.toString(), organizationId.toString());
});

test("Accept Shift Swap: receiver moves request to manager review", async () => {
  const receiver = createUserDoc({ _id: toEmployeeId, role: "staff", branchId });
  const shiftSwap = createShiftSwapDoc();

  stub(UserModel, "findById", async () => receiver);
  stub(ShiftSwapRequestModel, "findById", async () => shiftSwap);

  const result = await ShiftSwapService.acceptShiftSwap(
    actorPayload(receiver),
    shiftSwapId.toString(),
    { note: "Accepted" }
  );

  assert.equal(result.receiverStatus, "accepted");
  assert.equal(result.finalStatus, "pending_manager");
  assert.equal(shiftSwap.saved, true);
});

test("Approve Shift Swap: manager swaps schedule employees", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const branch = createBranchDoc();
  const shiftSwap = createShiftSwapDoc({
    receiverStatus: "accepted",
    finalStatus: "pending_manager",
  });
  const fromSchedule = createScheduleDoc({ _id: fromScheduleId, employeeId: fromEmployeeId });
  const toSchedule = createScheduleDoc({ _id: toScheduleId, employeeId: toEmployeeId });

  stub(UserModel, "findById", async () => manager);
  stub(ShiftSwapRequestModel, "findById", async () => shiftSwap);
  stub(BranchModel, "findById", async () => branch);
  stub(ScheduleModel, "findById", async (id) =>
    id.toString() === fromScheduleId.toString() ? fromSchedule : toSchedule
  );

  const result = await ShiftSwapService.approveShiftSwap(
    actorPayload(manager),
    shiftSwapId.toString(),
    { note: "Approved" }
  );

  assert.equal(result.finalStatus, "approved");
  assert.equal(fromSchedule.employeeId.toString(), toEmployeeId.toString());
  assert.equal(toSchedule.employeeId.toString(), fromEmployeeId.toString());
  assert.equal(fromSchedule.status, "swapped");
  assert.equal(toSchedule.status, "swapped");
});

test("Cancel Shift Swap: requester can cancel pending request", async () => {
  const requester = createUserDoc({ _id: fromEmployeeId, role: "staff", branchId });
  const shiftSwap = createShiftSwapDoc();

  stub(UserModel, "findById", async () => requester);
  stub(ShiftSwapRequestModel, "findById", async () => shiftSwap);

  const result = await ShiftSwapService.cancelShiftSwap(
    actorPayload(requester),
    shiftSwapId.toString()
  );

  assert.equal(result.finalStatus, "cancelled");
  assert.equal(shiftSwap.saved, true);
});
