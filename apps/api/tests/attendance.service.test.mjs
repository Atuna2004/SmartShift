import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { AttendanceModel } from "../dist/modules/attendance/attendance.model.js";
import { AttendanceService } from "../dist/modules/attendance/attendance.service.js";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import { DailyQrCodeModel } from "../dist/modules/dailyQrCode/daily-qr-code.model.js";
import { DailyQrCodeService } from "../dist/modules/dailyQrCode/daily-qr-code.service.js";
import { ScheduleModel } from "../dist/modules/schedule/schedule.model.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const managerId = new Types.ObjectId("64a000000000000000000002");
const staffId = new Types.ObjectId("64a000000000000000000003");
const branchId = new Types.ObjectId("64b000000000000000000001");
const scheduleId = new Types.ObjectId("64e000000000000000000001");
const shiftTemplateId = new Types.ObjectId("64d000000000000000000001");
const qrCodeId = new Types.ObjectId("64f000000000000000000001");
const attendanceId = new Types.ObjectId("650000000000000000000001");

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
  qrSettings: { enabled: true, qrExpiresInSeconds: 60, refreshIntervalSeconds: 60 },
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

const createQrCodeDoc = (overrides = {}) => ({
  _id: qrCodeId,
  organizationId,
  branchId,
  qrToken: "qr-token",
  validDate: new Date("2026-05-25T00:00:00.000Z"),
  expiresAt: new Date(Date.now() + 60000),
  status: "active",
  createdBy: managerId,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createAttendanceDoc = (overrides = {}) => ({
  _id: attendanceId,
  organizationId,
  branchId,
  employeeId: staffId,
  scheduleId,
  shiftTemplateId,
  workDate: new Date("2026-05-25T00:00:00.000Z"),
  scheduledStartTime: "08:00",
  scheduledEndTime: "17:00",
  attendanceStatus: "on_time",
  lateMinutes: 0,
  earlyLeaveMinutes: 0,
  overtimeMinutes: 0,
  source: "qr",
  manualCorrectionStatus: "none",
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

test("Generate Daily QR: manager can generate QR for assigned branch", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const branch = createBranchDoc();
  let createdPayload;

  stub(UserModel, "findById", async () => manager);
  stub(BranchModel, "findById", async () => branch);
  stub(DailyQrCodeModel, "updateMany", async () => ({ modifiedCount: 0 }));
  stub(DailyQrCodeModel, "create", async (payload) => {
    createdPayload = payload;
    return createQrCodeDoc({ ...payload });
  });

  const result = await DailyQrCodeService.generateDailyQr(actorPayload(manager), {
    branchId: branchId.toString(),
    validDate: new Date("2026-05-25T00:00:00.000Z"),
  });

  assert.equal(result.branchId, branchId.toString());
  assert.equal(createdPayload.organizationId.toString(), organizationId.toString());
  assert.equal(createdPayload.createdBy.toString(), managerId.toString());
});

test("Check-in: staff checks in with valid QR and late minutes are calculated", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const schedule = createScheduleDoc();
  const qrCode = createQrCodeDoc();
  const attendance = createAttendanceDoc();

  stub(UserModel, "findById", async () => staff);
  stub(ScheduleModel, "findById", async () => schedule);
  stub(BranchModel, "findById", async () => branch);
  stub(DailyQrCodeModel, "findOne", async () => qrCode);
  stub(AttendanceModel, "findOne", async () => null);
  stub(AttendanceModel, "create", async () => attendance);

  const result = await AttendanceService.checkIn(actorPayload(staff), {
    scheduleId: scheduleId.toString(),
    qrToken: "qr-token",
    checkInTime: new Date(2026, 4, 25, 8, 15, 0),
  });

  assert.equal(result.attendanceStatus, "late");
  assert.equal(result.lateMinutes, 15);
  assert.equal(attendance.saved, true);
});

test("Check-in: rejects check-in after assigned shift ended", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const schedule = createScheduleDoc({ shiftStartTime: "06:00", shiftEndTime: "11:00" });
  const qrCode = createQrCodeDoc();
  const attendance = createAttendanceDoc();

  stub(UserModel, "findById", async () => staff);
  stub(ScheduleModel, "findById", async () => schedule);
  stub(BranchModel, "findById", async () => branch);
  stub(DailyQrCodeModel, "findOne", async () => qrCode);
  stub(AttendanceModel, "findOne", async () => null);
  stub(AttendanceModel, "create", async () => attendance);

  await assert.rejects(
    () =>
      AttendanceService.checkIn(actorPayload(staff), {
        scheduleId: scheduleId.toString(),
        qrToken: "qr-token",
        checkInTime: new Date(2026, 4, 25, 17, 0, 0),
      }),
    /Check-in is not allowed after the assigned shift has ended/
  );
});

test("Check-out: completes schedule and calculates overtime", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const schedule = createScheduleDoc();
  const qrCode = createQrCodeDoc();
  const attendance = createAttendanceDoc({
    checkInTime: new Date(2026, 4, 25, 8, 0, 0),
  });

  stub(UserModel, "findById", async () => staff);
  stub(ScheduleModel, "findById", async () => schedule);
  stub(BranchModel, "findById", async () => branch);
  stub(DailyQrCodeModel, "findOne", async () => qrCode);
  stub(AttendanceModel, "findOne", async () => attendance);

  const result = await AttendanceService.checkOut(actorPayload(staff), {
    scheduleId: scheduleId.toString(),
    qrToken: "qr-token",
    checkOutTime: new Date(2026, 4, 25, 17, 30, 0),
  });

  assert.equal(result.attendanceStatus, "overtime");
  assert.equal(result.overtimeMinutes, 30);
  assert.equal(schedule.status, "completed");
  assert.equal(schedule.saved, true);
});

test("Check-out: rejects check-out before check-in time", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  const branch = createBranchDoc();
  const schedule = createScheduleDoc();
  const qrCode = createQrCodeDoc();
  const attendance = createAttendanceDoc({
    checkInTime: new Date(2026, 4, 25, 8, 0, 0),
  });

  stub(UserModel, "findById", async () => staff);
  stub(ScheduleModel, "findById", async () => schedule);
  stub(BranchModel, "findById", async () => branch);
  stub(DailyQrCodeModel, "findOne", async () => qrCode);
  stub(AttendanceModel, "findOne", async () => attendance);

  await assert.rejects(
    () =>
      AttendanceService.checkOut(actorPayload(staff), {
        scheduleId: scheduleId.toString(),
        qrToken: "qr-token",
        checkOutTime: new Date(2026, 4, 25, 7, 59, 0),
      }),
    /Check-out time cannot be before check-in time/
  );
});

test("Auto Mark Absent: manager marks published schedules without check-in", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const branch = createBranchDoc();
  const schedule = createScheduleDoc();
  const attendance = createAttendanceDoc({ source: "system" });

  stub(UserModel, "findById", async () => manager);
  stub(BranchModel, "findById", async () => branch);
  stub(ScheduleModel, "find", async () => [schedule]);
  stub(AttendanceModel, "findOne", async () => null);
  stub(AttendanceModel, "create", async (payload) =>
    createAttendanceDoc({ ...payload, _id: attendance._id })
  );

  const result = await AttendanceService.autoMarkAbsent(actorPayload(manager), {
    branchId: branchId.toString(),
    workDate: new Date("2026-05-25T00:00:00.000Z"),
  });

  assert.equal(result.totalMarkedAbsent, 1);
  assert.equal(result.data[0].attendanceStatus, "absent");
  assert.equal(schedule.status, "absent");
});
