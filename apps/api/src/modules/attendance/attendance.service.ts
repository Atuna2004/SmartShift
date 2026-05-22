import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { DailyQrCodeModel } from "../dailyQrCode/daily-qr-code.model.js";
import { ScheduleModel } from "../schedule/schedule.model.js";
import type { ISchedule } from "../schedule/schedule.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { AttendanceModel } from "./attendance.model.js";
import type { AttendanceStatus, IAttendance } from "./attendance.model.js";
import type {
  ApproveManualAttendanceInput,
  AttendanceAlertQuery,
  AttendanceHistoryQuery,
  AutoMarkAbsentInput,
  CheckInInput,
  CheckOutInput,
  ManualCorrectionInput,
} from "./attendance.validation.js";

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

const asObjectId = (value: string | Types.ObjectId) =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const dateWithTime = (date: Date, time: string) => {
  const [hour = "0", minute = "0"] = time.split(":");
  const next = new Date(date);
  next.setHours(Number(hour), Number(minute), 0, 0);
  return next;
};

const minutesBetween = (from: Date, to: Date) =>
  Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60000));

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

const getScheduleForActor = async (actor: IUser, scheduleId: string | Types.ObjectId) => {
  const schedule = await ScheduleModel.findById(scheduleId);

  if (!schedule || schedule.deletedAt) {
    throw new AppError(404, "Assigned shift not found");
  }

  await getBranchForActor(actor, schedule.branchId);

  if (actor.role === "staff" && !schedule.employeeId.equals(getDocumentId(actor))) {
    throw new AppError(403, "You can only access your own attendance");
  }

  if (schedule.status === "cancelled" || schedule.status === "leave_requested") {
    throw new AppError(400, "Assigned shift is not available for attendance");
  }

  return schedule;
};

const verifyQrForSchedule = async (actor: IUser, schedule: ISchedule, qrToken: string) => {
  const qrCode = await DailyQrCodeModel.findOne({ qrToken });

  if (!qrCode) {
    throw new AppError(404, "QR code not found");
  }

  await getBranchForActor(actor, qrCode.branchId);

  if (!qrCode.branchId.equals(schedule.branchId)) {
    throw new AppError(400, "QR code does not match assigned shift branch");
  }

  if (qrCode.status !== "active" || qrCode.expiresAt < new Date()) {
    if (qrCode.status === "active") {
      qrCode.status = "expired";
      await qrCode.save();
    }

    throw new AppError(400, "QR code is expired or revoked");
  }

  return qrCode;
};

const getOrCreateAttendance = async (schedule: ISchedule) => {
  const existingAttendance = await AttendanceModel.findOne({
    scheduleId: getDocumentId(schedule),
  });

  if (existingAttendance) {
    return existingAttendance;
  }

  return AttendanceModel.create({
    organizationId: schedule.organizationId,
    branchId: schedule.branchId,
    employeeId: schedule.employeeId,
    scheduleId: getDocumentId(schedule),
    shiftTemplateId: schedule.shiftTemplateId,
    workDate: startOfDay(schedule.workDate),
    scheduledStartTime: schedule.shiftStartTime,
    scheduledEndTime: schedule.shiftEndTime,
    attendanceStatus: "on_time",
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    overtimeMinutes: 0,
    source: "qr",
    manualCorrectionStatus: "none",
  });
};

const computeMetrics = (
  schedule: ISchedule,
  checkInTime?: Date,
  checkOutTime?: Date
) => {
  const scheduledStart = dateWithTime(schedule.workDate, schedule.shiftStartTime);
  const scheduledEnd = dateWithTime(schedule.workDate, schedule.shiftEndTime);
  const lateMinutes = checkInTime ? minutesBetween(scheduledStart, checkInTime) : 0;
  const earlyLeaveMinutes = checkOutTime
    ? minutesBetween(checkOutTime, scheduledEnd)
    : 0;
  const overtimeMinutes = checkOutTime ? minutesBetween(scheduledEnd, checkOutTime) : 0;
  let attendanceStatus: AttendanceStatus = "on_time";

  if (!checkInTime && !checkOutTime) {
    attendanceStatus = "absent";
  } else if (lateMinutes > 0) {
    attendanceStatus = "late";
  } else if (earlyLeaveMinutes > 0) {
    attendanceStatus = "early_leave";
  } else if (overtimeMinutes > 0) {
    attendanceStatus = "overtime";
  }

  return {
    attendanceStatus,
    lateMinutes,
    earlyLeaveMinutes,
    overtimeMinutes,
  };
};

const applyMetrics = (attendance: IAttendance, schedule: ISchedule) => {
  const metrics = computeMetrics(schedule, attendance.checkInTime, attendance.checkOutTime);
  attendance.attendanceStatus = metrics.attendanceStatus;
  attendance.lateMinutes = metrics.lateMinutes;
  attendance.earlyLeaveMinutes = metrics.earlyLeaveMinutes;
  attendance.overtimeMinutes = metrics.overtimeMinutes;
};

const toPublicAttendance = (attendance: IAttendance) => ({
  id: getDocumentId(attendance).toString(),
  organizationId: attendance.organizationId.toString(),
  branchId: attendance.branchId.toString(),
  employeeId: attendance.employeeId.toString(),
  scheduleId: attendance.scheduleId.toString(),
  shiftTemplateId: attendance.shiftTemplateId.toString(),
  workDate: attendance.workDate,
  scheduledStartTime: attendance.scheduledStartTime,
  scheduledEndTime: attendance.scheduledEndTime,
  attendanceStatus: attendance.attendanceStatus,
  lateMinutes: attendance.lateMinutes,
  earlyLeaveMinutes: attendance.earlyLeaveMinutes,
  overtimeMinutes: attendance.overtimeMinutes,
  source: attendance.source,
  manualCorrectionStatus: attendance.manualCorrectionStatus,
  ...(attendance.checkInTime ? { checkInTime: attendance.checkInTime } : {}),
  ...(attendance.checkOutTime ? { checkOutTime: attendance.checkOutTime } : {}),
  ...(attendance.qrCodeId ? { qrCodeId: attendance.qrCodeId.toString() } : {}),
  ...(attendance.note ? { note: attendance.note } : {}),
  ...(attendance.correctionReason
    ? { correctionReason: attendance.correctionReason }
    : {}),
  ...(attendance.correctedBy ? { correctedBy: attendance.correctedBy.toString() } : {}),
  ...(attendance.approvedBy ? { approvedBy: attendance.approvedBy.toString() } : {}),
  ...(attendance.approvedAt ? { approvedAt: attendance.approvedAt } : {}),
});

const checkIn = async (actorPayload: AuthTokenPayload, payload: CheckInInput) => {
  const actor = await ensureActor(actorPayload);
  const schedule = await getScheduleForActor(actor, payload.scheduleId);
  const qrCode = await verifyQrForSchedule(actor, schedule, payload.qrToken);
  const attendance = await getOrCreateAttendance(schedule);

  if (attendance.checkInTime) {
    throw new AppError(409, "Attendance already checked in");
  }

  attendance.checkInTime = payload.checkInTime ?? new Date();
  attendance.qrCodeId = getDocumentId(qrCode);
  attendance.source = "qr";
  applyMetrics(attendance, schedule);
  await attendance.save();

  return toPublicAttendance(attendance);
};

const checkOut = async (actorPayload: AuthTokenPayload, payload: CheckOutInput) => {
  const actor = await ensureActor(actorPayload);
  const schedule = await getScheduleForActor(actor, payload.scheduleId);
  const qrCode = await verifyQrForSchedule(actor, schedule, payload.qrToken);
  const attendance = await getOrCreateAttendance(schedule);

  if (!attendance.checkInTime) {
    throw new AppError(400, "Check-in is required before check-out");
  }

  if (attendance.checkOutTime) {
    throw new AppError(409, "Attendance already checked out");
  }

  attendance.checkOutTime = payload.checkOutTime ?? new Date();
  attendance.qrCodeId = getDocumentId(qrCode);
  attendance.source = "qr";
  applyMetrics(attendance, schedule);
  schedule.status = "completed";
  await Promise.all([attendance.save(), schedule.save()]);

  return toPublicAttendance(attendance);
};

const requestManualCorrection = async (
  actorPayload: AuthTokenPayload,
  payload: ManualCorrectionInput
) => {
  const actor = await ensureActor(actorPayload);
  const schedule = await getScheduleForActor(actor, payload.scheduleId);

  if (
    payload.employeeId &&
    actor.role !== "staff" &&
    !schedule.employeeId.equals(asObjectId(payload.employeeId))
  ) {
    throw new AppError(400, "Employee does not match assigned shift");
  }

  const attendance = await getOrCreateAttendance(schedule);

  if (payload.checkInTime !== undefined) attendance.checkInTime = payload.checkInTime;
  if (payload.checkOutTime !== undefined) attendance.checkOutTime = payload.checkOutTime;
  if (payload.note !== undefined) attendance.note = payload.note;

  attendance.source = "manual";
  attendance.manualCorrectionStatus = actor.role === "staff" ? "pending" : "approved";
  attendance.correctionReason = payload.correctionReason;
  attendance.correctedBy = getDocumentId(actor);
  if (actor.role !== "staff") {
    attendance.approvedBy = getDocumentId(actor);
    attendance.approvedAt = new Date();
  }
  applyMetrics(attendance, schedule);
  await attendance.save();

  return toPublicAttendance(attendance);
};

const approveManualAttendance = async (
  actorPayload: AuthTokenPayload,
  attendanceId: string,
  payload: ApproveManualAttendanceInput
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role === "staff") {
    throw new AppError(403, "Staff cannot approve manual attendance");
  }

  const attendance = await AttendanceModel.findById(attendanceId);

  if (!attendance) {
    throw new AppError(404, "Attendance not found");
  }

  await getBranchForActor(actor, attendance.branchId);

  if (attendance.manualCorrectionStatus !== "pending") {
    throw new AppError(400, "Attendance correction is not pending");
  }

  attendance.manualCorrectionStatus = payload.approved ? "approved" : "rejected";
  attendance.approvedBy = getDocumentId(actor);
  attendance.approvedAt = new Date();
  if (payload.note !== undefined) attendance.note = payload.note;
  await attendance.save();

  return toPublicAttendance(attendance);
};

const autoMarkAbsent = async (
  actorPayload: AuthTokenPayload,
  payload: AutoMarkAbsentInput
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role === "staff") {
    throw new AppError(403, "Staff cannot auto mark absent");
  }

  const workDate = startOfDay(payload.workDate ?? new Date());
  const filter: Record<string, unknown> = {
    workDate: { $gte: startOfDay(workDate), $lte: endOfDay(workDate) },
    published: true,
    deletedAt: { $exists: false },
    status: "scheduled",
  };

  if (payload.branchId) {
    const branch = await getBranchForActor(actor, payload.branchId);
    filter.branchId = getDocumentId(branch);
  } else if (actor.role === "manager") {
    if (!actor.branchId) {
      throw new AppError(403, "Manager is not assigned to a branch");
    }

    filter.branchId = actor.branchId;
  } else if (actor.organizationId) {
    filter.organizationId = actor.organizationId;
  } else {
    throw new AppError(400, "branchId is required");
  }

  const schedules = await ScheduleModel.find(filter);
  const results = [];

  for (const schedule of schedules) {
    const existingAttendance = await AttendanceModel.findOne({
      scheduleId: getDocumentId(schedule),
    });

    if (existingAttendance?.checkInTime) {
      continue;
    }

    const attendance =
      existingAttendance ??
      (await AttendanceModel.create({
        organizationId: schedule.organizationId,
        branchId: schedule.branchId,
        employeeId: schedule.employeeId,
        scheduleId: getDocumentId(schedule),
        shiftTemplateId: schedule.shiftTemplateId,
        workDate: startOfDay(schedule.workDate),
        scheduledStartTime: schedule.shiftStartTime,
        scheduledEndTime: schedule.shiftEndTime,
        source: "system",
        manualCorrectionStatus: "none",
      }));

    attendance.attendanceStatus = "absent";
    attendance.lateMinutes = 0;
    attendance.earlyLeaveMinutes = 0;
    attendance.overtimeMinutes = 0;
    attendance.source = "system";
    schedule.status = "absent";
    await Promise.all([attendance.save(), schedule.save()]);
    results.push(toPublicAttendance(attendance));
  }

  return {
    workDate,
    totalMarkedAbsent: results.length,
    data: results,
  };
};

const getAttendanceHistory = async (
  actorPayload: AuthTokenPayload,
  query: AttendanceHistoryQuery
) => {
  const actor = await ensureActor(actorPayload);
  const from = startOfDay(query.from);
  const to = endOfDay(query.to);

  if (from > to) {
    throw new AppError(400, "from must be before or equal to to");
  }

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {
    workDate: { $gte: from, $lte: to },
  };

  if (actor.role === "staff") {
    filter.employeeId = getDocumentId(actor);
  } else if (query.branchId) {
    const branch = await getBranchForActor(actor, query.branchId);
    filter.branchId = getDocumentId(branch);
  } else if (actor.role === "manager") {
    if (!actor.branchId) {
      throw new AppError(403, "Manager is not assigned to a branch");
    }
    filter.branchId = actor.branchId;
  } else if (actor.organizationId) {
    filter.organizationId = actor.organizationId;
  }

  if (query.employeeId) {
    if (actor.role === "staff" && query.employeeId !== getDocumentId(actor).toString()) {
      throw new AppError(403, "You can only view your own attendance");
    }
    filter.employeeId = asObjectId(query.employeeId);
  }

  if (query.status) {
    filter.attendanceStatus = query.status;
  }

  const [items, total] = await Promise.all([
    AttendanceModel.find(filter).sort({ workDate: -1 }).skip(skip).limit(limit),
    AttendanceModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: items.map(toPublicAttendance),
  };
};

const getAttendanceReminders = async (
  actorPayload: AuthTokenPayload,
  query: AttendanceAlertQuery
) => {
  const actor = await ensureActor(actorPayload);
  const workDate = startOfDay(query.workDate ?? new Date());
  const filter: Record<string, unknown> = {
    workDate: { $gte: startOfDay(workDate), $lte: endOfDay(workDate) },
    published: true,
    status: "scheduled",
    deletedAt: { $exists: false },
  };

  if (query.branchId) {
    const branch = await getBranchForActor(actor, query.branchId);
    filter.branchId = getDocumentId(branch);
  } else if (actor.role === "manager") {
    filter.branchId = actor.branchId;
  } else if (actor.role === "staff") {
    filter.employeeId = getDocumentId(actor);
  } else if (actor.organizationId) {
    filter.organizationId = actor.organizationId;
  }

  const schedules = await ScheduleModel.find(filter).sort({ shiftStartTime: 1 });
  const reminders = [];

  for (const schedule of schedules) {
    const attendance = await AttendanceModel.findOne({
      scheduleId: getDocumentId(schedule),
    });
    if (!attendance?.checkInTime) {
      reminders.push({
        scheduleId: getDocumentId(schedule).toString(),
        branchId: schedule.branchId.toString(),
        employeeId: schedule.employeeId.toString(),
        workDate: schedule.workDate,
        shiftStartTime: schedule.shiftStartTime,
        type: "check_in_reminder",
      });
    }
  }

  return { workDate, data: reminders };
};

const getLateWarnings = async (
  actorPayload: AuthTokenPayload,
  query: AttendanceAlertQuery
) => {
  const actor = await ensureActor(actorPayload);
  const workDate = startOfDay(query.workDate ?? new Date());
  const filter: Record<string, unknown> = {
    workDate: { $gte: startOfDay(workDate), $lte: endOfDay(workDate) },
    attendanceStatus: "late",
  };

  if (query.branchId) {
    const branch = await getBranchForActor(actor, query.branchId);
    filter.branchId = getDocumentId(branch);
  } else if (actor.role === "manager") {
    filter.branchId = actor.branchId;
  } else if (actor.role === "staff") {
    filter.employeeId = getDocumentId(actor);
  } else if (actor.organizationId) {
    filter.organizationId = actor.organizationId;
  }

  const attendances = await AttendanceModel.find(filter).sort({ lateMinutes: -1 });

  return {
    workDate,
    data: attendances.map(toPublicAttendance),
  };
};

export const AttendanceService = {
  checkIn,
  checkOut,
  requestManualCorrection,
  approveManualAttendance,
  autoMarkAbsent,
  getAttendanceHistory,
  getAttendanceReminders,
  getLateWarnings,
};
