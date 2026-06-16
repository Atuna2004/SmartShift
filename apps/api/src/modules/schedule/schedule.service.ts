import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { ShiftTemplateModel } from "../shift/shift-template.model.js";
import { SubscriptionService } from "../subscription/subscription.service.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { ScheduleModel } from "./schedule.model.js";
import type { ISchedule, ScheduleStatus } from "./schedule.model.js";
import type {
  CreateAssignedShiftInput,
  MyScheduleQuery,
  UpdateAssignedShiftInput,
  WeeklyScheduleQuery,
} from "./schedule.validation.js";

const asObjectId = (value: string | Types.ObjectId) =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

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

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const assertNotPastWorkDate = (workDate: Date) => {
  if (startOfDay(workDate) < startOfDay(new Date())) {
    throw new AppError(400, "Assigned shift date cannot be in the past");
  }
};

const assertShiftNotStarted = (
  workDate: Date,
  shiftStartTime: string,
  shiftEndTime: string
) => {
  const interval = getShiftInterval(workDate, shiftStartTime, shiftEndTime);

  if (interval.start <= Date.now()) {
    throw new AppError(400, "Assigned shift start time has already passed");
  }
};

const timeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getShiftInterval = (workDate: Date, startTime: string, endTime: string) => {
  const dayStart = startOfDay(workDate).getTime();
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const endOffset = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

  return {
    start: dayStart + startMinutes * 60 * 1000,
    end: dayStart + endOffset * 60 * 1000,
  };
};

const intervalsOverlap = (
  first: { start: number; end: number },
  second: { start: number; end: number }
) => first.start < second.end && second.start < first.end;

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

const assertManagePermission = (actor: IUser) => {
  if (actor.role === "staff") {
    throw new AppError(403, "Staff cannot manage assigned shifts");
  }
};

const assertBranchAccess = (actor: IUser, branch: IBranch) => {
  if (branch.deletedAt) {
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

  if (!branch || branch.deletedAt) {
    throw new AppError(404, "Branch not found");
  }

  assertBranchAccess(actor, branch);

  return branch;
};

const assertEmployeeAssignable = async (
  actor: IUser,
  branch: IBranch,
  employeeId: string | Types.ObjectId
) => {
  const employee = await UserModel.findById(employeeId);

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  if (employee.status !== "active") {
    throw new AppError(403, "Employee account is inactive");
  }

  if (employee.role === "owner") {
    throw new AppError(400, "Owners cannot be assigned to shifts");
  }

  if (!employee.branchId || !employee.branchId.equals(getDocumentId(branch))) {
    throw new AppError(403, "Employee is outside the selected branch");
  }

  if (
    actor.role === "manager" &&
    (!actor.branchId || !actor.branchId.equals(employee.branchId))
  ) {
    throw new AppError(403, "Managers can only assign employees in their branch");
  }

  return employee;
};

const getActiveShiftTemplate = async (
  branch: IBranch,
  shiftTemplateId: string | Types.ObjectId
) => {
  const shiftTemplate = await ShiftTemplateModel.findById(shiftTemplateId);

  if (!shiftTemplate || shiftTemplate.deletedAt) {
    throw new AppError(404, "Shift template not found");
  }

  if (shiftTemplate.status !== "active") {
    throw new AppError(400, "Shift template is disabled");
  }

  if (!shiftTemplate.branchId.equals(getDocumentId(branch))) {
    throw new AppError(403, "Shift template is outside the selected branch");
  }

  return shiftTemplate;
};

const assertNoOverlappingAssignedShift = async (
  employeeId: Types.ObjectId,
  workDate: Date,
  shiftStartTime: string,
  shiftEndTime: string,
  excludeAssignedShiftId?: Types.ObjectId
) => {
  const filter: Record<string, unknown> = {
    employeeId,
    workDate: {
      $gte: startOfDay(addDays(workDate, -1)),
      $lte: endOfDay(addDays(workDate, 1)),
    },
    deletedAt: { $exists: false },
    status: { $ne: "cancelled" },
  };

  if (excludeAssignedShiftId) {
    filter._id = { $ne: excludeAssignedShiftId };
  }

  const existingSchedules = await ScheduleModel.find(filter);
  const proposedInterval = getShiftInterval(workDate, shiftStartTime, shiftEndTime);
  const hasOverlap = existingSchedules.some((schedule) =>
    intervalsOverlap(
      proposedInterval,
      getShiftInterval(schedule.workDate, schedule.shiftStartTime, schedule.shiftEndTime)
    )
  );

  if (hasOverlap) {
    throw new AppError(409, "Employee already has an overlapping assigned shift");
  }
};

const getAssignedShiftForActor = async (
  actor: IUser,
  assignedShiftId: string
) => {
  const assignedShift = await ScheduleModel.findById(assignedShiftId);

  if (!assignedShift || assignedShift.deletedAt) {
    throw new AppError(404, "Assigned shift not found");
  }

  await getBranchForActor(actor, assignedShift.branchId);

  return assignedShift;
};

const toPublicAssignedShift = (
  assignedShift: ISchedule,
  branchesById?: Map<string, IBranch>
) => ({
  id: getDocumentId(assignedShift).toString(),
  organizationId: assignedShift.organizationId.toString(),
  branchId: assignedShift.branchId.toString(),
  ...(branchesById?.get(assignedShift.branchId.toString())?.name
    ? { branchName: branchesById.get(assignedShift.branchId.toString())?.name }
    : {}),
  employeeId: assignedShift.employeeId.toString(),
  shiftTemplateId: assignedShift.shiftTemplateId.toString(),
  workDate: assignedShift.workDate,
  shiftStartTime: assignedShift.shiftStartTime,
  shiftEndTime: assignedShift.shiftEndTime,
  status: assignedShift.status,
  published: assignedShift.published,
  ...(assignedShift.note ? { note: assignedShift.note } : {}),
  ...(assignedShift.assignedBy
    ? { assignedBy: assignedShift.assignedBy.toString() }
    : {}),
  ...(assignedShift.updatedBy
    ? { updatedBy: assignedShift.updatedBy.toString() }
    : {}),
});

const getBranchesById = async (branchIds: Array<string | Types.ObjectId | undefined>) => {
  const ids = [...new Set(branchIds.filter(Boolean).map((id) => id?.toString() as string))];

  if (ids.length === 0) {
    return new Map<string, IBranch>();
  }

  const branches = await BranchModel.find({ _id: { $in: ids.map(asObjectId) } });
  return new Map(branches.map((branch) => [getDocumentId(branch).toString(), branch]));
};

const createAssignedShift = async (
  actorPayload: AuthTokenPayload,
  payload: CreateAssignedShiftInput
) => {
  const actor = await ensureActor(actorPayload);
  assertManagePermission(actor);

  const branch = await getBranchForActor(actor, payload.branchId);
  const employee = await assertEmployeeAssignable(actor, branch, payload.employeeId);
  const shiftTemplate = await getActiveShiftTemplate(branch, payload.shiftTemplateId);
  const workDate = startOfDay(payload.workDate);
  const shiftStartTime = payload.shiftStartTime ?? shiftTemplate.startTime;
  const shiftEndTime = payload.shiftEndTime ?? shiftTemplate.endTime;

  assertNotPastWorkDate(workDate);
  assertShiftNotStarted(workDate, shiftStartTime, shiftEndTime);

  await SubscriptionService.assertActiveOrganizationSubscription(branch.organizationId);
  await assertNoOverlappingAssignedShift(
    getDocumentId(employee),
    workDate,
    shiftStartTime,
    shiftEndTime
  );

  const assignedShift = await ScheduleModel.create({
    organizationId: branch.organizationId,
    branchId: getDocumentId(branch),
    employeeId: getDocumentId(employee),
    shiftTemplateId: getDocumentId(shiftTemplate),
    workDate,
    shiftStartTime,
    shiftEndTime,
    status: "scheduled",
    published: true,
    assignedBy: getDocumentId(actor),
    ...(payload.note ? { note: payload.note } : {}),
  });

  return toPublicAssignedShift(assignedShift);
};

const updateAssignedShift = async (
  actorPayload: AuthTokenPayload,
  assignedShiftId: string,
  payload: UpdateAssignedShiftInput
) => {
  const actor = await ensureActor(actorPayload);
  assertManagePermission(actor);

  const assignedShift = await getAssignedShiftForActor(actor, assignedShiftId);
  const branch = await getBranchForActor(actor, assignedShift.branchId);

  let employeeId = assignedShift.employeeId;
  let shiftTemplateId = assignedShift.shiftTemplateId;
  let workDate = startOfDay(assignedShift.workDate);
  let shiftStartTime = assignedShift.shiftStartTime;
  let shiftEndTime = assignedShift.shiftEndTime;

  if (payload.employeeId) {
    const employee = await assertEmployeeAssignable(actor, branch, payload.employeeId);
    employeeId = getDocumentId(employee);
  }

  if (payload.shiftTemplateId) {
    const shiftTemplate = await getActiveShiftTemplate(branch, payload.shiftTemplateId);
    shiftTemplateId = getDocumentId(shiftTemplate);

    if (payload.shiftStartTime === undefined) {
      shiftStartTime = shiftTemplate.startTime;
    }

    if (payload.shiftEndTime === undefined) {
      shiftEndTime = shiftTemplate.endTime;
    }
  }

  if (payload.workDate) {
    workDate = startOfDay(payload.workDate);
  }

  assertNotPastWorkDate(workDate);

  await SubscriptionService.assertActiveOrganizationSubscription(branch.organizationId);
  if (payload.shiftStartTime !== undefined) {
    shiftStartTime = payload.shiftStartTime;
  }
  if (payload.shiftEndTime !== undefined) {
    shiftEndTime = payload.shiftEndTime;
  }

  assertShiftNotStarted(workDate, shiftStartTime, shiftEndTime);

  await assertNoOverlappingAssignedShift(
    employeeId,
    workDate,
    shiftStartTime,
    shiftEndTime,
    getDocumentId(assignedShift)
  );

  assignedShift.employeeId = employeeId;
  assignedShift.shiftTemplateId = shiftTemplateId;
  assignedShift.workDate = workDate;
  assignedShift.shiftStartTime = shiftStartTime;
  assignedShift.shiftEndTime = shiftEndTime;
  if (payload.status !== undefined) {
    assignedShift.status = payload.status as ScheduleStatus;
  }
  if (payload.published !== undefined) {
    assignedShift.published = payload.published;
  }
  if (payload.note !== undefined) {
    assignedShift.note = payload.note;
  }

  assignedShift.updatedBy = getDocumentId(actor);
  await assignedShift.save();

  return toPublicAssignedShift(assignedShift);
};

const deleteAssignedShift = async (
  actorPayload: AuthTokenPayload,
  assignedShiftId: string
) => {
  const actor = await ensureActor(actorPayload);
  assertManagePermission(actor);

  const assignedShift = await getAssignedShiftForActor(actor, assignedShiftId);

  await SubscriptionService.assertActiveOrganizationSubscription(
    assignedShift.organizationId
  );
  assignedShift.status = "cancelled";
  assignedShift.deletedAt = new Date();
  assignedShift.updatedBy = getDocumentId(actor);
  await assignedShift.save();

  return toPublicAssignedShift(assignedShift);
};

const getWeeklySchedule = async (
  actorPayload: AuthTokenPayload,
  query: WeeklyScheduleQuery
) => {
  const actor = await ensureActor(actorPayload);
  const weekStart = startOfDay(query.weekStart);
  const weekEnd = endOfDay(addDays(weekStart, 6));
  const filter: Record<string, unknown> = {
    workDate: { $gte: weekStart, $lte: weekEnd },
    deletedAt: { $exists: false },
  };

  if (query.branchId) {
    const branch = await getBranchForActor(actor, query.branchId);
    filter.branchId = getDocumentId(branch);
  } else if (actor.role === "owner") {
    if (actor.organizationId) {
      filter.organizationId = actor.organizationId;
    } else {
      throw new AppError(400, "branchId is required");
    }
  } else {
    if (!actor.branchId) {
      throw new AppError(403, "Manager is not assigned to a branch");
    }

    filter.branchId = actor.branchId;
  }

  if (query.employeeId) {
    filter.employeeId = asObjectId(query.employeeId);
  }

  if (query.published !== undefined) {
    filter.published = query.published;
  }

  const schedules = await ScheduleModel.find(filter).sort({
    workDate: 1,
    shiftStartTime: 1,
  });

  const branchesById = await getBranchesById(schedules.map((schedule) => schedule.branchId));

  return {
    weekStart,
    weekEnd,
    data: schedules.map((schedule) => toPublicAssignedShift(schedule, branchesById)),
  };
};

const getMySchedule = async (
  actorPayload: AuthTokenPayload,
  query: MyScheduleQuery
) => {
  const actor = await ensureActor(actorPayload);
  const from = startOfDay(query.from);
  const to = endOfDay(query.to);

  if (from > to) {
    throw new AppError(400, "from must be before or equal to to");
  }

  const filter: Record<string, unknown> = {
    employeeId: getDocumentId(actor),
    workDate: { $gte: from, $lte: to },
    deletedAt: { $exists: false },
  };

  if (query.published !== undefined) {
    filter.published = query.published;
  }

  const schedules = await ScheduleModel.find(filter).sort({
    workDate: 1,
    shiftStartTime: 1,
  });

  const branchesById = await getBranchesById(schedules.map((schedule) => schedule.branchId));

  return {
    from,
    to,
    data: schedules.map((schedule) => toPublicAssignedShift(schedule, branchesById)),
  };
};

export const ScheduleService = {
  createAssignedShift,
  updateAssignedShift,
  deleteAssignedShift,
  getWeeklySchedule,
  getMySchedule,
};
