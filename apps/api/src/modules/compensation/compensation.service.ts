import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { createSystemNotification } from "../notification/notification.service.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import {
  CompensationAdjustmentModel,
  OvertimeRequestModel,
} from "./compensation.model.js";
import type {
  CompensationAdjustmentType,
  ICompensationAdjustment,
  IOvertimeRequest,
  OvertimeRequestStatus,
} from "./compensation.model.js";
import type {
  AdjustmentListQuery,
  CompensationSummaryQuery,
  CreateAdjustmentInput,
  CreateOvertimeRequestInput,
  OvertimeListQuery,
  ReviewOvertimeRequestInput,
} from "./compensation.validation.js";

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

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const timeToMinutes = (value: string) => {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
};

const getOvertimeInterval = ({
  endTime,
  startTime,
  workDate,
}: {
  endTime: string;
  startTime: string;
  workDate: Date;
}) => {
  const dayStart = startOfDay(workDate).getTime();
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const adjustedEndMinutes = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

  return {
    start: dayStart + startMinutes * 60 * 1000,
    end: dayStart + adjustedEndMinutes * 60 * 1000,
  };
};

const calculateHours = (startTime: string, endTime: string) => {
  const interval = getOvertimeInterval({
    workDate: new Date(),
    startTime,
    endTime,
  });
  return Math.round(((interval.end - interval.start) / 3600000) * 100) / 100;
};

const intervalsOverlap = (
  first: { start: number; end: number },
  second: { start: number; end: number }
) => first.start < second.end && second.start < first.end;

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

const formatDateForNotification = (value: Date) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(value);

const assertDateRange = (from?: Date, to?: Date) => {
  if (from && to && startOfDay(from) > endOfDay(to)) {
    throw new AppError(400, "from must be before or equal to to");
  }
};

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

const assertManagerActor = (actor: IUser) => {
  if (!["owner", "manager"].includes(actor.role)) {
    throw new AppError(403, "Only owners and managers can perform this action");
  }
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
    const createdByOwner = branch.createdBy && branch.createdBy.equals(getDocumentId(actor));

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

const getEmployeeForActor = async (
  actor: IUser,
  employeeId: string | Types.ObjectId,
  branchId?: string | Types.ObjectId
) => {
  const employee = await UserModel.findById(employeeId);
  if (!employee || employee.status !== "active") {
    throw new AppError(404, "Employee not found");
  }

  if (employee.role !== "staff" && employee.role !== "manager") {
    throw new AppError(400, "Compensation can only be recorded for employees");
  }

  if (actor.role === "staff" && !getDocumentId(employee).equals(getDocumentId(actor))) {
    throw new AppError(403, "You can only access your own compensation records");
  }

  const targetBranchId = branchId ?? employee.branchId;
  if (!targetBranchId) {
    throw new AppError(400, "Employee is not assigned to a branch");
  }

  const branch = await getBranchForActor(actor, targetBranchId);
  if (employee.branchId && !employee.branchId.equals(getDocumentId(branch))) {
    throw new AppError(400, "Employee is not assigned to the selected branch");
  }

  if (
    actor.organizationId &&
    employee.organizationId &&
    !actor.organizationId.equals(employee.organizationId)
  ) {
    throw new AppError(403, "Employee is outside your organization");
  }

  return { employee, branch };
};

const buildScopeFilter = async (
  actor: IUser,
  query: {
    branchId?: string | undefined;
    employeeId?: string | undefined;
    from?: Date | undefined;
    to?: Date | undefined;
  },
  dateField: "workDate" | "effectiveDate"
) => {
  const filter: Record<string, unknown> = {};

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
      throw new AppError(403, "You can only view your own compensation records");
    }
    filter.employeeId = asObjectId(query.employeeId);
  }

  if (query.from || query.to) {
    assertDateRange(query.from, query.to);
    filter[dateField] = {
      ...(query.from ? { $gte: startOfDay(query.from) } : {}),
      ...(query.to ? { $lte: endOfDay(query.to) } : {}),
    };
  }

  return filter;
};

const getUsersById = async (userIds: Array<string | Types.ObjectId | undefined>) => {
  const ids = [...new Set(userIds.filter(Boolean).map((id) => id?.toString() as string))];
  if (ids.length === 0) return new Map<string, IUser>();
  const users = await UserModel.find({ _id: { $in: ids.map(asObjectId) } });
  return new Map(users.map((user) => [getDocumentId(user).toString(), user]));
};

const getBranchesById = async (branchIds: Array<string | Types.ObjectId | undefined>) => {
  const ids = [...new Set(branchIds.filter(Boolean).map((id) => id?.toString() as string))];
  if (ids.length === 0) return new Map<string, IBranch>();
  const branches = await BranchModel.find({ _id: { $in: ids.map(asObjectId) } });
  return new Map(branches.map((branch) => [getDocumentId(branch).toString(), branch]));
};

const toPublicOvertime = (
  overtime: IOvertimeRequest,
  options?: { usersById?: Map<string, IUser>; branchesById?: Map<string, IBranch> }
) => ({
  id: getDocumentId(overtime).toString(),
  organizationId: overtime.organizationId.toString(),
  branchId: overtime.branchId.toString(),
  branchName: options?.branchesById?.get(overtime.branchId.toString())?.name,
  employeeId: overtime.employeeId.toString(),
  employeeName: options?.usersById?.get(overtime.employeeId.toString())?.fullName,
  workDate: overtime.workDate,
  startTime: overtime.startTime,
  endTime: overtime.endTime,
  hours: overtime.hours,
  hourlyRate: overtime.hourlyRate,
  amount: overtime.amount,
  reason: overtime.reason,
  status: overtime.status,
  requestedAt: overtime.requestedAt,
  reviewedBy: overtime.reviewedBy?.toString(),
  managerNote: overtime.managerNote,
  respondedAt: overtime.respondedAt,
});

const toPublicAdjustment = (
  adjustment: ICompensationAdjustment,
  options?: { usersById?: Map<string, IUser>; branchesById?: Map<string, IBranch> }
) => ({
  id: getDocumentId(adjustment).toString(),
  organizationId: adjustment.organizationId.toString(),
  branchId: adjustment.branchId.toString(),
  branchName: options?.branchesById?.get(adjustment.branchId.toString())?.name,
  employeeId: adjustment.employeeId.toString(),
  employeeName: options?.usersById?.get(adjustment.employeeId.toString())?.fullName,
  type: adjustment.type,
  amount: adjustment.amount,
  reason: adjustment.reason,
  effectiveDate: adjustment.effectiveDate,
  createdBy: adjustment.createdBy.toString(),
  note: adjustment.note,
});

const notifyCompensationAdjustment = async ({
  adjustment,
  branch,
  employee,
}: {
  adjustment: ICompensationAdjustment;
  branch: IBranch;
  employee: IUser;
}) => {
  const isBonus = adjustment.type === "bonus";
  const title = isBonus ? "Bạn có khoản thưởng mới" : "Bạn có khoản phạt mới";
  const prefix = isBonus ? "Khoản thưởng" : "Khoản phạt";

  try {
    await createSystemNotification({
      userId: getDocumentId(employee),
      organizationId: adjustment.organizationId,
      branchId: getDocumentId(branch),
      title,
      message: `${prefix} ${formatMoney(adjustment.amount)} có hiệu lực ngày ${formatDateForNotification(adjustment.effectiveDate)}. Lý do: ${adjustment.reason}`,
      type: isBonus ? "compensation_bonus" : "compensation_penalty",
      relatedId: getDocumentId(adjustment),
      relatedModel: "CompensationAdjustment",
    });
  } catch (error) {
    console.error("Failed to create compensation adjustment notification", error);
  }
};

const assertNoOverlappingOvertime = async ({
  employeeId,
  endTime,
  startTime,
  workDate,
}: {
  employeeId: Types.ObjectId;
  endTime: string;
  startTime: string;
  workDate: Date;
}) => {
  const proposedInterval = getOvertimeInterval({ workDate, startTime, endTime });
  const candidates = await OvertimeRequestModel.find({
    employeeId,
    status: { $in: ["pending", "approved"] },
    workDate: {
      $gte: startOfDay(addDays(workDate, -1)),
      $lte: endOfDay(addDays(workDate, 1)),
    },
  });

  const overlapping = candidates.find((item) =>
    intervalsOverlap(
      proposedInterval,
      getOvertimeInterval({
        workDate: item.workDate,
        startTime: item.startTime,
        endTime: item.endTime,
      })
    )
  );

  if (overlapping) {
    throw new AppError(409, "Overtime request overlaps an existing overtime record for this employee");
  }
};

const createOvertimeRequest = async (
  actorPayload: AuthTokenPayload,
  payload: CreateOvertimeRequestInput
) => {
  const actor = await ensureActor(actorPayload);
  if (actor.role !== "staff" && !payload.employeeId) {
    throw new AppError(400, "employeeId is required");
  }
  const employeeId = actor.role === "staff" ? getDocumentId(actor) : asObjectId(payload.employeeId as string);

  const { employee, branch } = await getEmployeeForActor(actor, employeeId, payload.branchId);
  const calculatedHours = calculateHours(payload.startTime, payload.endTime);
  if (payload.hours !== undefined && Math.abs(payload.hours - calculatedHours) > 0.01) {
    throw new AppError(400, "Overtime hours must match startTime and endTime");
  }

  const hours = calculatedHours;
  if (hours <= 0 || hours > 24) {
    throw new AppError(400, "Overtime hours must be greater than 0 and no more than 24");
  }
  await assertNoOverlappingOvertime({
    employeeId: getDocumentId(employee),
    workDate: payload.workDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
  });

  const isManagerCreated = actor.role !== "staff";
  const hourlyRate = isManagerCreated ? payload.hourlyRate ?? 0 : 0;
  const overtime = await OvertimeRequestModel.create({
    organizationId: employee.organizationId ?? branch.organizationId,
    branchId: getDocumentId(branch),
    employeeId: getDocumentId(employee),
    workDate: payload.workDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    hours,
    hourlyRate,
    amount: Math.round(hours * hourlyRate),
    reason: payload.reason,
    status: isManagerCreated ? "approved" : "pending",
    requestedAt: new Date(),
    ...(isManagerCreated
      ? {
          reviewedBy: getDocumentId(actor),
          respondedAt: new Date(),
        }
      : {}),
  });

  return toPublicOvertime(overtime, {
    usersById: new Map([[getDocumentId(employee).toString(), employee]]),
    branchesById: new Map([[getDocumentId(branch).toString(), branch]]),
  });
};

const getOvertimeList = async (actorPayload: AuthTokenPayload, query: OvertimeListQuery) => {
  const actor = await ensureActor(actorPayload);
  const page = query.page;
  const limit = query.limit;
  const filter = await buildScopeFilter(actor, query, "workDate");
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    OvertimeRequestModel.find(filter).sort({ workDate: -1, requestedAt: -1 }).skip((page - 1) * limit).limit(limit),
    OvertimeRequestModel.countDocuments(filter),
  ]);
  const [usersById, branchesById] = await Promise.all([
    getUsersById(items.map((item) => item.employeeId)),
    getBranchesById(items.map((item) => item.branchId)),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: items.map((item) => toPublicOvertime(item, { usersById, branchesById })),
  };
};

const reviewOvertimeRequest = async (
  actorPayload: AuthTokenPayload,
  overtimeId: string,
  status: Extract<OvertimeRequestStatus, "approved" | "rejected">,
  payload: ReviewOvertimeRequestInput
) => {
  const actor = await ensureActor(actorPayload);
  assertManagerActor(actor);
  const overtime = await OvertimeRequestModel.findById(overtimeId);
  if (!overtime) {
    throw new AppError(404, "Overtime request not found");
  }
  await getBranchForActor(actor, overtime.branchId);
  if (overtime.status !== "pending") {
    throw new AppError(400, "Only pending overtime requests can be reviewed");
  }

  if (payload.hourlyRate !== undefined) {
    overtime.hourlyRate = payload.hourlyRate;
    overtime.amount = Math.round(overtime.hours * payload.hourlyRate);
  }
  overtime.status = status;
  overtime.reviewedBy = getDocumentId(actor);
  overtime.respondedAt = new Date();
  if (payload.managerNote !== undefined) {
    overtime.managerNote = payload.managerNote;
  }
  await overtime.save();

  const [usersById, branchesById] = await Promise.all([
    getUsersById([overtime.employeeId]),
    getBranchesById([overtime.branchId]),
  ]);
  return toPublicOvertime(overtime, { usersById, branchesById });
};

const cancelOvertimeRequest = async (actorPayload: AuthTokenPayload, overtimeId: string) => {
  const actor = await ensureActor(actorPayload);
  const overtime = await OvertimeRequestModel.findById(overtimeId);
  if (!overtime) {
    throw new AppError(404, "Overtime request not found");
  }

  if (actor.role === "staff" && !overtime.employeeId.equals(getDocumentId(actor))) {
    throw new AppError(403, "You can only cancel your own overtime requests");
  }
  if (actor.role !== "staff") {
    await getBranchForActor(actor, overtime.branchId);
  }
  if (overtime.status !== "pending") {
    throw new AppError(400, "Only pending overtime requests can be cancelled");
  }

  overtime.status = "cancelled";
  overtime.respondedAt = new Date();
  await overtime.save();

  const [usersById, branchesById] = await Promise.all([
    getUsersById([overtime.employeeId]),
    getBranchesById([overtime.branchId]),
  ]);
  return toPublicOvertime(overtime, { usersById, branchesById });
};

const createAdjustment = async (actorPayload: AuthTokenPayload, payload: CreateAdjustmentInput) => {
  const actor = await ensureActor(actorPayload);
  assertManagerActor(actor);
  const { employee, branch } = await getEmployeeForActor(actor, payload.employeeId, payload.branchId);

  const adjustmentPayload = {
    organizationId: employee.organizationId ?? branch.organizationId,
    branchId: getDocumentId(branch),
    employeeId: getDocumentId(employee),
    type: payload.type,
    amount: Math.round(payload.amount),
    reason: payload.reason,
    effectiveDate: payload.effectiveDate,
    createdBy: getDocumentId(actor),
    ...(payload.note !== undefined ? { note: payload.note } : {}),
  };

  const adjustment = await CompensationAdjustmentModel.create(adjustmentPayload);
  await notifyCompensationAdjustment({ adjustment, branch, employee });

  return toPublicAdjustment(adjustment, {
    usersById: new Map([[getDocumentId(employee).toString(), employee]]),
    branchesById: new Map([[getDocumentId(branch).toString(), branch]]),
  });
};

const getAdjustmentList = async (actorPayload: AuthTokenPayload, query: AdjustmentListQuery) => {
  const actor = await ensureActor(actorPayload);
  const page = query.page;
  const limit = query.limit;
  const filter = await buildScopeFilter(actor, query, "effectiveDate");
  if (query.type) filter.type = query.type;

  const [items, total] = await Promise.all([
    CompensationAdjustmentModel.find(filter).sort({ effectiveDate: -1 }).skip((page - 1) * limit).limit(limit),
    CompensationAdjustmentModel.countDocuments(filter),
  ]);
  const [usersById, branchesById] = await Promise.all([
    getUsersById(items.map((item) => item.employeeId)),
    getBranchesById(items.map((item) => item.branchId)),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: items.map((item) => toPublicAdjustment(item, { usersById, branchesById })),
  };
};

const deleteAdjustment = async (actorPayload: AuthTokenPayload, adjustmentId: string) => {
  const actor = await ensureActor(actorPayload);
  assertManagerActor(actor);
  const adjustment = await CompensationAdjustmentModel.findById(adjustmentId);
  if (!adjustment) {
    throw new AppError(404, "Compensation adjustment not found");
  }
  await getBranchForActor(actor, adjustment.branchId);
  await adjustment.deleteOne();
  return { id: adjustmentId };
};

const getCompensationSummary = async (
  actorPayload: AuthTokenPayload,
  query: CompensationSummaryQuery
) => {
  const actor = await ensureActor(actorPayload);
  const overtimeFilter = await buildScopeFilter(actor, query, "workDate");
  overtimeFilter.status = "approved";
  const adjustmentFilter = await buildScopeFilter(actor, query, "effectiveDate");

  const [overtimeItems, adjustments] = await Promise.all([
    OvertimeRequestModel.find(overtimeFilter),
    CompensationAdjustmentModel.find(adjustmentFilter),
  ]);

  const employeeTotals = new Map<
    string,
    { overtimeHours: number; overtimeAmount: number; bonusAmount: number; penaltyAmount: number }
  >();

  for (const overtime of overtimeItems) {
    const employeeId = overtime.employeeId.toString();
    const current = employeeTotals.get(employeeId) ?? {
      overtimeHours: 0,
      overtimeAmount: 0,
      bonusAmount: 0,
      penaltyAmount: 0,
    };
    current.overtimeHours += overtime.hours;
    current.overtimeAmount += overtime.amount;
    employeeTotals.set(employeeId, current);
  }

  for (const adjustment of adjustments) {
    const employeeId = adjustment.employeeId.toString();
    const current = employeeTotals.get(employeeId) ?? {
      overtimeHours: 0,
      overtimeAmount: 0,
      bonusAmount: 0,
      penaltyAmount: 0,
    };
    const key = `${adjustment.type}Amount` as `${CompensationAdjustmentType}Amount`;
    current[key] += adjustment.amount;
    employeeTotals.set(employeeId, current);
  }

  const usersById = await getUsersById(Array.from(employeeTotals.keys()));
  const rows = Array.from(employeeTotals.entries()).map(([employeeId, totals]) => ({
    employeeId,
    employeeName: usersById.get(employeeId)?.fullName ?? employeeId,
    overtimeHours: Math.round(totals.overtimeHours * 100) / 100,
    overtimeAmount: Math.round(totals.overtimeAmount),
    bonusAmount: Math.round(totals.bonusAmount),
    penaltyAmount: Math.round(totals.penaltyAmount),
    netAmount: Math.round(totals.overtimeAmount + totals.bonusAmount - totals.penaltyAmount),
  }));

  return {
    totals: {
      overtimeHours: Math.round(overtimeItems.reduce((sum, item) => sum + item.hours, 0) * 100) / 100,
      overtimeAmount: Math.round(overtimeItems.reduce((sum, item) => sum + item.amount, 0)),
      bonusAmount: Math.round(adjustments.filter((item) => item.type === "bonus").reduce((sum, item) => sum + item.amount, 0)),
      penaltyAmount: Math.round(adjustments.filter((item) => item.type === "penalty").reduce((sum, item) => sum + item.amount, 0)),
      netAmount: Math.round(rows.reduce((sum, row) => sum + row.netAmount, 0)),
    },
    employees: rows.sort((a, b) => b.netAmount - a.netAmount),
  };
};

export const CompensationService = {
  createOvertimeRequest,
  getOvertimeList,
  approveOvertimeRequest: (actor: AuthTokenPayload, overtimeId: string, payload: ReviewOvertimeRequestInput) =>
    reviewOvertimeRequest(actor, overtimeId, "approved", payload),
  rejectOvertimeRequest: (actor: AuthTokenPayload, overtimeId: string, payload: ReviewOvertimeRequestInput) =>
    reviewOvertimeRequest(actor, overtimeId, "rejected", payload),
  cancelOvertimeRequest,
  createAdjustment,
  getAdjustmentList,
  deleteAdjustment,
  getCompensationSummary,
};
