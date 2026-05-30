import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import { ScheduleModel } from "../dist/modules/schedule/schedule.model.js";
import { ScheduleService } from "../dist/modules/schedule/schedule.service.js";
import { ShiftTemplateModel } from "../dist/modules/shift/shift-template.model.js";
import { ShiftService } from "../dist/modules/shift/shift.service.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const managerId = new Types.ObjectId("64a000000000000000000002");
const staffId = new Types.ObjectId("64a000000000000000000003");
const branchId = new Types.ObjectId("64b000000000000000000001");
const shiftTemplateId = new Types.ObjectId("64d000000000000000000001");
const assignedShiftId = new Types.ObjectId("64e000000000000000000001");

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
  _id: overrides._id ?? new Types.ObjectId(),
  fullName: overrides.fullName ?? "Nguyen Van A",
  email: overrides.email ?? "user@example.com",
  role: overrides.role ?? "staff",
  employeeType: overrides.employeeType ?? "part_time",
  status: overrides.status ?? "active",
  isEmailVerified: false,
  branchId: overrides.branchId,
  organizationId: overrides.organizationId,
  createdBy: overrides.createdBy,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createBranchDoc = (overrides = {}) => ({
  _id: overrides._id ?? branchId,
  organizationId: overrides.organizationId ?? organizationId,
  name: overrides.name ?? "Branch 1",
  ownerId: overrides.ownerId ?? ownerId,
  createdBy: overrides.createdBy ?? ownerId,
  status: "active",
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createShiftTemplateDoc = (overrides = {}) => ({
  _id: overrides._id ?? shiftTemplateId,
  organizationId: overrides.organizationId ?? organizationId,
  branchId: overrides.branchId ?? branchId,
  name: overrides.name ?? "Morning",
  code: overrides.code,
  startTime: overrides.startTime ?? "08:00",
  endTime: overrides.endTime ?? "17:00",
  breakMinutes: overrides.breakMinutes ?? 60,
  status: overrides.status ?? "active",
  color: overrides.color,
  description: overrides.description,
  createdBy: overrides.createdBy ?? managerId,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createAssignedShiftDoc = (overrides = {}) => ({
  _id: overrides._id ?? assignedShiftId,
  organizationId: overrides.organizationId ?? organizationId,
  branchId: overrides.branchId ?? branchId,
  employeeId: overrides.employeeId ?? staffId,
  shiftTemplateId: overrides.shiftTemplateId ?? shiftTemplateId,
  workDate: overrides.workDate ?? new Date("2026-05-25T00:00:00.000Z"),
  shiftStartTime: overrides.shiftStartTime ?? "08:00",
  shiftEndTime: overrides.shiftEndTime ?? "17:00",
  status: overrides.status ?? "scheduled",
  published: overrides.published ?? false,
  assignedBy: overrides.assignedBy ?? managerId,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

test("Create Shift Template: manager can create template in assigned branch", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const branch = createBranchDoc();
  let createdPayload;

  stub(UserModel, "findById", async () => manager);
  stub(BranchModel, "findById", async () => branch);
  stub(ShiftTemplateModel, "findOne", async () => null);
  stub(ShiftTemplateModel, "create", async (payload) => {
    createdPayload = payload;
    return createShiftTemplateDoc({ _id: shiftTemplateId, ...payload });
  });

  const result = await ShiftService.createShiftTemplate(actorPayload(manager), {
    branchId: branchId.toString(),
    name: "Morning",
    code: "MORNING",
    startTime: "08:00",
    endTime: "17:00",
    breakMinutes: 60,
  });

  assert.equal(result.id, shiftTemplateId.toString());
  assert.equal(result.branchId, branchId.toString());
  assert.equal(result.status, "active");
  assert.equal(createdPayload.organizationId.toString(), organizationId.toString());
  assert.equal(createdPayload.createdBy.toString(), managerId.toString());
});

test("Create Shift Template: staff cannot manage templates", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });

  stub(UserModel, "findById", async () => staff);

  await assert.rejects(
    () =>
      ShiftService.createShiftTemplate(actorPayload(staff), {
        branchId: branchId.toString(),
        name: "Morning",
        startTime: "08:00",
        endTime: "17:00",
        breakMinutes: 0,
      }),
    { statusCode: 403 }
  );
});

test("Create Assigned Shift: manager can assign staff using template times", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const shiftTemplate = createShiftTemplateDoc();
  const findByIdQueue = [manager, staff];
  let createdPayload;

  stub(UserModel, "findById", async () => findByIdQueue.shift() ?? null);
  stub(BranchModel, "findById", async () => branch);
  stub(ShiftTemplateModel, "findById", async () => shiftTemplate);
  stub(ScheduleModel, "find", async () => []);
  stub(ScheduleModel, "create", async (payload) => {
    createdPayload = payload;
    return createAssignedShiftDoc({ _id: assignedShiftId, ...payload });
  });

  const result = await ScheduleService.createAssignedShift(actorPayload(manager), {
    branchId: branchId.toString(),
    employeeId: staffId.toString(),
    shiftTemplateId: shiftTemplateId.toString(),
    workDate: new Date("2026-05-25T10:00:00.000Z"),
  });

  assert.equal(result.id, assignedShiftId.toString());
  assert.equal(result.shiftStartTime, "08:00");
  assert.equal(result.shiftEndTime, "17:00");
  assert.equal(createdPayload.workDate.getHours(), 0);
  assert.equal(createdPayload.assignedBy.toString(), managerId.toString());
});

test("Create Assigned Shift: allows same employee on non-overlapping day and overnight shifts", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const nightTemplate = createShiftTemplateDoc({
    name: "Night",
    startTime: "20:00",
    endTime: "04:00",
  });
  const existingMorningShift = createAssignedShiftDoc({
    workDate: new Date("2026-05-25T00:00:00.000Z"),
    shiftStartTime: "08:00",
    shiftEndTime: "16:00",
  });
  const findByIdQueue = [manager, staff];

  stub(UserModel, "findById", async () => findByIdQueue.shift() ?? null);
  stub(BranchModel, "findById", async () => branch);
  stub(ShiftTemplateModel, "findById", async () => nightTemplate);
  stub(ScheduleModel, "find", async () => [existingMorningShift]);
  stub(ScheduleModel, "create", async (payload) =>
    createAssignedShiftDoc({ _id: assignedShiftId, ...payload })
  );

  const result = await ScheduleService.createAssignedShift(actorPayload(manager), {
    branchId: branchId.toString(),
    employeeId: staffId.toString(),
    shiftTemplateId: shiftTemplateId.toString(),
    workDate: new Date("2026-05-25T00:00:00.000Z"),
  });

  assert.equal(result.shiftStartTime, "20:00");
  assert.equal(result.shiftEndTime, "04:00");
});

test("Create Assigned Shift: rejects overlapping overnight shift into next day", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const earlyTemplate = createShiftTemplateDoc({
    name: "Early",
    startTime: "03:00",
    endTime: "06:00",
  });
  const existingNightShift = createAssignedShiftDoc({
    workDate: new Date("2026-05-25T00:00:00.000Z"),
    shiftStartTime: "20:00",
    shiftEndTime: "04:00",
  });
  const findByIdQueue = [manager, staff];

  stub(UserModel, "findById", async () => findByIdQueue.shift() ?? null);
  stub(BranchModel, "findById", async () => branch);
  stub(ShiftTemplateModel, "findById", async () => earlyTemplate);
  stub(ScheduleModel, "find", async () => [existingNightShift]);

  await assert.rejects(
    () =>
      ScheduleService.createAssignedShift(actorPayload(manager), {
        branchId: branchId.toString(),
        employeeId: staffId.toString(),
        shiftTemplateId: shiftTemplateId.toString(),
        workDate: new Date("2026-05-26T00:00:00.000Z"),
      }),
    { statusCode: 409 }
  );
});

test("View My Schedule: filters by authenticated user and date range", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const assignedShift = createAssignedShiftDoc();
  let capturedFilter;

  stub(UserModel, "findById", async () => staff);
  stub(ScheduleModel, "find", (filter) => {
    capturedFilter = filter;
    return {
      async sort() {
        return [assignedShift];
      },
    };
  });

  const result = await ScheduleService.getMySchedule(actorPayload(staff), {
    from: new Date("2026-05-25T00:00:00.000Z"),
    to: new Date("2026-05-31T00:00:00.000Z"),
  });

  assert.equal(result.data.length, 1);
  assert.equal(capturedFilter.employeeId.toString(), staffId.toString());
  assert.equal(capturedFilter.deletedAt.$exists, false);
});
