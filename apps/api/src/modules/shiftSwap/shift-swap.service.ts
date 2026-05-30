import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { ScheduleModel } from "../schedule/schedule.model.js";
import type { ISchedule } from "../schedule/schedule.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { ShiftSwapRequestModel } from "./shift-swap.model.js";
import type { IShiftSwapRequest } from "./shift-swap.model.js";
import type {
  CreateShiftSwapInput,
  ManagerShiftSwapInput,
  ReceiverShiftSwapInput,
  ShiftSwapListQuery,
} from "./shift-swap.validation.js";

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

const assertShiftNotStarted = (schedule: ISchedule, label: string) => {
  const interval = getShiftInterval(
    schedule.workDate,
    schedule.shiftStartTime,
    schedule.shiftEndTime
  );

  if (interval.start < Date.now()) {
    throw new AppError(400, `${label} shift has already started`);
  }
};

const toPublicScheduleSummary = (
  schedule: ISchedule,
  branchesById?: Map<string, IBranch>
) => ({
  id: getDocumentId(schedule).toString(),
  organizationId: schedule.organizationId.toString(),
  branchId: schedule.branchId.toString(),
  ...(branchesById?.get(schedule.branchId.toString())?.name
    ? { branchName: branchesById.get(schedule.branchId.toString())?.name }
    : {}),
  employeeId: schedule.employeeId.toString(),
  shiftTemplateId: schedule.shiftTemplateId.toString(),
  workDate: schedule.workDate,
  shiftStartTime: schedule.shiftStartTime,
  shiftEndTime: schedule.shiftEndTime,
  status: schedule.status,
  published: schedule.published,
  ...(schedule.note ? { note: schedule.note } : {}),
});

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

const assertScheduleEligible = (schedule: ISchedule) => {
  if (schedule.deletedAt) {
    throw new AppError(404, "Assigned shift not found");
  }

  if (!["scheduled", "swapped"].includes(schedule.status)) {
    throw new AppError(400, "Assigned shift is not eligible for swap");
  }
};

const assertNoOverlappingShiftAfterSwap = async (
  employeeId: Types.ObjectId,
  schedule: ISchedule,
  excludeScheduleIds: Types.ObjectId[]
) => {
  const filter: Record<string, unknown> = {
    employeeId,
    workDate: {
      $gte: startOfDay(addDays(schedule.workDate, -1)),
      $lte: endOfDay(addDays(schedule.workDate, 1)),
    },
    deletedAt: { $exists: false },
    status: { $ne: "cancelled" },
  };

  if (excludeScheduleIds.length > 0) {
    filter._id = { $nin: excludeScheduleIds };
  }

  const existingSchedules = await ScheduleModel.find(filter);
  const proposedInterval = getShiftInterval(
    schedule.workDate,
    schedule.shiftStartTime,
    schedule.shiftEndTime
  );
  const hasOverlap = existingSchedules.some((existingSchedule) =>
    intervalsOverlap(
      proposedInterval,
      getShiftInterval(
        existingSchedule.workDate,
        existingSchedule.shiftStartTime,
        existingSchedule.shiftEndTime
      )
    )
  );

  if (hasOverlap) {
    throw new AppError(409, "Shift swap would create an overlapping assigned shift");
  }
};

const toPublicShiftSwap = (
  shiftSwap: IShiftSwapRequest,
  schedulesById?: Map<string, ISchedule>,
  branchesById?: Map<string, IBranch>
) => {
  const fromScheduleId = shiftSwap.fromScheduleId.toString();
  const toScheduleId = shiftSwap.toScheduleId?.toString();
  const fromSchedule = schedulesById?.get(fromScheduleId);
  const toSchedule = toScheduleId ? schedulesById?.get(toScheduleId) : undefined;

  return {
    id: getDocumentId(shiftSwap).toString(),
    organizationId: shiftSwap.organizationId.toString(),
    branchId: shiftSwap.branchId.toString(),
    ...(branchesById?.get(shiftSwap.branchId.toString())?.name
      ? { branchName: branchesById.get(shiftSwap.branchId.toString())?.name }
      : {}),
    fromEmployeeId: shiftSwap.fromEmployeeId.toString(),
    toEmployeeId: shiftSwap.toEmployeeId.toString(),
    fromScheduleId,
    receiverStatus: shiftSwap.receiverStatus,
    managerStatus: shiftSwap.managerStatus,
    finalStatus: shiftSwap.finalStatus,
    ...(toScheduleId ? { toScheduleId } : {}),
    ...(fromSchedule ? { fromSchedule: toPublicScheduleSummary(fromSchedule, branchesById) } : {}),
    ...(toSchedule ? { toSchedule: toPublicScheduleSummary(toSchedule, branchesById) } : {}),
    ...(shiftSwap.reason ? { reason: shiftSwap.reason } : {}),
    ...(shiftSwap.receiverRespondedAt
      ? { receiverRespondedAt: shiftSwap.receiverRespondedAt }
      : {}),
    ...(shiftSwap.managerId ? { managerId: shiftSwap.managerId.toString() } : {}),
    ...(shiftSwap.managerRespondedAt
      ? { managerRespondedAt: shiftSwap.managerRespondedAt }
      : {}),
    ...(shiftSwap.note ? { note: shiftSwap.note } : {}),
    createdAt: shiftSwap.createdAt,
    updatedAt: shiftSwap.updatedAt,
  };
};

const getSchedulesById = async (scheduleIds: Array<string | Types.ObjectId | undefined>) => {
  const ids = [...new Set(scheduleIds.filter(Boolean).map((id) => id?.toString() as string))];

  if (ids.length === 0) {
    return new Map<string, ISchedule>();
  }

  const schedules = await ScheduleModel.find({ _id: { $in: ids.map(asObjectId) } });
  return new Map(schedules.map((schedule) => [getDocumentId(schedule).toString(), schedule]));
};

const getBranchesById = async (branchIds: Array<string | Types.ObjectId | undefined>) => {
  const ids = [...new Set(branchIds.filter(Boolean).map((id) => id?.toString() as string))];

  if (ids.length === 0) {
    return new Map<string, IBranch>();
  }

  const branches = await BranchModel.find({ _id: { $in: ids.map(asObjectId) } });
  return new Map(branches.map((branch) => [getDocumentId(branch).toString(), branch]));
};

const getShiftSwapForActor = async (actor: IUser, shiftSwapId: string) => {
  const shiftSwap = await ShiftSwapRequestModel.findById(shiftSwapId);

  if (!shiftSwap) {
    throw new AppError(404, "Shift swap request not found");
  }

  if (actor.role === "staff") {
    const isParticipant =
      shiftSwap.fromEmployeeId.equals(getDocumentId(actor)) ||
      shiftSwap.toEmployeeId.equals(getDocumentId(actor));

    if (!isParticipant) {
      throw new AppError(403, "You can only access your own shift swaps");
    }

    return shiftSwap;
  }

  await getBranchForActor(actor, shiftSwap.branchId);

  return shiftSwap;
};

const createShiftSwap = async (
  actorPayload: AuthTokenPayload,
  payload: CreateShiftSwapInput
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role !== "staff") {
    throw new AppError(403, "Only staff can create shift swap requests");
  }

  const [fromSchedule, toSchedule, receiver] = await Promise.all([
    ScheduleModel.findById(payload.fromScheduleId),
    payload.toScheduleId ? ScheduleModel.findById(payload.toScheduleId) : null,
    UserModel.findById(payload.toEmployeeId),
  ]);

  if (!fromSchedule) {
    throw new AppError(404, "Source assigned shift not found");
  }

  if (!receiver) {
    throw new AppError(404, "Receiver employee not found");
  }

  if (receiver.status !== "active" || receiver.role !== "staff") {
    throw new AppError(400, "Receiver must be an active staff user");
  }

  assertScheduleEligible(fromSchedule);
  assertShiftNotStarted(fromSchedule, "Source");

  if (!fromSchedule.employeeId.equals(getDocumentId(actor))) {
    throw new AppError(403, "You can only swap your own assigned shift");
  }

  const branch = await getBranchForActor(actor, fromSchedule.branchId);

  if (!receiver.branchId || !receiver.branchId.equals(getDocumentId(branch))) {
    throw new AppError(403, "Receiver is outside your branch");
  }

  if (receiver._id.equals(getDocumentId(actor))) {
    throw new AppError(400, "Receiver must be another staff user");
  }

  if (toSchedule) {
    assertScheduleEligible(toSchedule);
    assertShiftNotStarted(toSchedule, "Target");

    if (
      intervalsOverlap(
        getShiftInterval(fromSchedule.workDate, fromSchedule.shiftStartTime, fromSchedule.shiftEndTime),
        getShiftInterval(toSchedule.workDate, toSchedule.shiftStartTime, toSchedule.shiftEndTime)
      )
    ) {
      throw new AppError(409, "Cannot swap overlapping shifts");
    }

    if (!toSchedule.branchId.equals(getDocumentId(branch))) {
      throw new AppError(403, "Target assigned shift is outside your branch");
    }

    if (!toSchedule.employeeId.equals(getDocumentId(receiver))) {
      throw new AppError(400, "Target assigned shift does not belong to receiver");
    }

    await Promise.all([
      assertNoOverlappingShiftAfterSwap(getDocumentId(receiver), fromSchedule, [
        getDocumentId(fromSchedule),
        getDocumentId(toSchedule),
      ]),
      assertNoOverlappingShiftAfterSwap(getDocumentId(actor), toSchedule, [
        getDocumentId(fromSchedule),
        getDocumentId(toSchedule),
      ]),
    ]);
  } else {
    await assertNoOverlappingShiftAfterSwap(getDocumentId(receiver), fromSchedule, [
      getDocumentId(fromSchedule),
    ]);
  }

  const existingRequest = await ShiftSwapRequestModel.findOne({
    fromScheduleId: getDocumentId(fromSchedule),
    finalStatus: { $in: ["pending_receiver", "pending_manager"] },
  });

  if (existingRequest) {
    throw new AppError(409, "A pending shift swap already exists for this shift");
  }

  const shiftSwap = await ShiftSwapRequestModel.create({
    organizationId: fromSchedule.organizationId,
    branchId: getDocumentId(branch),
    fromEmployeeId: getDocumentId(actor),
    toEmployeeId: getDocumentId(receiver),
    fromScheduleId: getDocumentId(fromSchedule),
    ...(toSchedule ? { toScheduleId: getDocumentId(toSchedule) } : {}),
    ...(payload.reason ? { reason: payload.reason } : {}),
    receiverStatus: "pending",
    managerStatus: "pending",
    finalStatus: "pending_receiver",
  });

  return toPublicShiftSwap(
    shiftSwap,
    new Map([
      [getDocumentId(fromSchedule).toString(), fromSchedule],
      ...(toSchedule ? [[getDocumentId(toSchedule).toString(), toSchedule] as const] : []),
    ]),
    new Map([[getDocumentId(branch).toString(), branch]])
  );
};

const respondReceiver = async (
  actorPayload: AuthTokenPayload,
  shiftSwapId: string,
  accepted: boolean,
  payload: ReceiverShiftSwapInput
) => {
  const actor = await ensureActor(actorPayload);
  const shiftSwap = await getShiftSwapForActor(actor, shiftSwapId);

  if (!shiftSwap.toEmployeeId.equals(getDocumentId(actor))) {
    throw new AppError(403, "Only the receiver can respond to this shift swap");
  }

  if (shiftSwap.finalStatus !== "pending_receiver") {
    throw new AppError(400, "Shift swap is not waiting for receiver response");
  }

  shiftSwap.receiverStatus = accepted ? "accepted" : "rejected";
  shiftSwap.receiverRespondedAt = new Date();
  shiftSwap.finalStatus = accepted ? "pending_manager" : "rejected";
  if (payload.note !== undefined) {
    shiftSwap.note = payload.note;
  }
  await shiftSwap.save();

  const schedulesById = await getSchedulesById([
    shiftSwap.fromScheduleId,
    shiftSwap.toScheduleId,
  ]);
  const branchesById = await getBranchesById([shiftSwap.branchId]);

  return toPublicShiftSwap(shiftSwap, schedulesById, branchesById);
};

const approveShiftSwapSchedules = async (shiftSwap: IShiftSwapRequest) => {
  const fromSchedule = await ScheduleModel.findById(shiftSwap.fromScheduleId);

  if (!fromSchedule) {
    throw new AppError(404, "Source assigned shift not found");
  }

  assertScheduleEligible(fromSchedule);

  if (!fromSchedule.employeeId.equals(shiftSwap.fromEmployeeId)) {
    throw new AppError(409, "Source assigned shift owner has changed");
  }

  if (shiftSwap.toScheduleId) {
    const toSchedule = await ScheduleModel.findById(shiftSwap.toScheduleId);

    if (!toSchedule) {
      throw new AppError(404, "Target assigned shift not found");
    }

    assertScheduleEligible(toSchedule);

    if (!toSchedule.employeeId.equals(shiftSwap.toEmployeeId)) {
      throw new AppError(409, "Target assigned shift owner has changed");
    }

    await Promise.all([
      assertNoOverlappingShiftAfterSwap(shiftSwap.toEmployeeId, fromSchedule, [
        getDocumentId(fromSchedule),
        getDocumentId(toSchedule),
      ]),
      assertNoOverlappingShiftAfterSwap(shiftSwap.fromEmployeeId, toSchedule, [
        getDocumentId(fromSchedule),
        getDocumentId(toSchedule),
      ]),
    ]);

    fromSchedule.employeeId = shiftSwap.toEmployeeId;
    toSchedule.employeeId = shiftSwap.fromEmployeeId;
    fromSchedule.status = "swapped";
    toSchedule.status = "swapped";
    await Promise.all([fromSchedule.save(), toSchedule.save()]);
    return;
  }

  await assertNoOverlappingShiftAfterSwap(shiftSwap.toEmployeeId, fromSchedule, [
    getDocumentId(fromSchedule),
  ]);

  fromSchedule.employeeId = shiftSwap.toEmployeeId;
  fromSchedule.status = "swapped";
  await fromSchedule.save();
};

const reviewByManager = async (
  actorPayload: AuthTokenPayload,
  shiftSwapId: string,
  approved: boolean,
  payload: ManagerShiftSwapInput
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role === "staff") {
    throw new AppError(403, "Staff cannot review shift swap requests");
  }

  const shiftSwap = await getShiftSwapForActor(actor, shiftSwapId);

  if (shiftSwap.finalStatus !== "pending_manager") {
    throw new AppError(400, "Shift swap is not waiting for manager review");
  }

  shiftSwap.managerStatus = approved ? "approved" : "rejected";
  shiftSwap.managerId = getDocumentId(actor);
  shiftSwap.managerRespondedAt = new Date();
  shiftSwap.finalStatus = approved ? "approved" : "rejected";
  if (payload.note !== undefined) {
    shiftSwap.note = payload.note;
  }

  if (approved) {
    await approveShiftSwapSchedules(shiftSwap);
  }

  await shiftSwap.save();

  const schedulesById = await getSchedulesById([
    shiftSwap.fromScheduleId,
    shiftSwap.toScheduleId,
  ]);
  const branchesById = await getBranchesById([shiftSwap.branchId]);

  return toPublicShiftSwap(shiftSwap, schedulesById, branchesById);
};

const cancelShiftSwap = async (actorPayload: AuthTokenPayload, shiftSwapId: string) => {
  const actor = await ensureActor(actorPayload);
  const shiftSwap = await getShiftSwapForActor(actor, shiftSwapId);

  if (actor.role !== "staff") {
    throw new AppError(403, "Only requester can cancel this shift swap");
  }

  if (!shiftSwap.fromEmployeeId.equals(getDocumentId(actor))) {
    throw new AppError(403, "Only requester can cancel this shift swap");
  }

  if (!["pending_receiver", "pending_manager"].includes(shiftSwap.finalStatus)) {
    throw new AppError(400, "Only pending shift swaps can be cancelled");
  }

  shiftSwap.finalStatus = "cancelled";
  await shiftSwap.save();

  const schedulesById = await getSchedulesById([
    shiftSwap.fromScheduleId,
    shiftSwap.toScheduleId,
  ]);
  const branchesById = await getBranchesById([shiftSwap.branchId]);

  return toPublicShiftSwap(shiftSwap, schedulesById, branchesById);
};

const getShiftSwapById = async (actorPayload: AuthTokenPayload, shiftSwapId: string) => {
  const actor = await ensureActor(actorPayload);
  const shiftSwap = await getShiftSwapForActor(actor, shiftSwapId);
  const schedulesById = await getSchedulesById([
    shiftSwap.fromScheduleId,
    shiftSwap.toScheduleId,
  ]);
  const branchesById = await getBranchesById([shiftSwap.branchId]);

  return toPublicShiftSwap(shiftSwap, schedulesById, branchesById);
};

const getShiftSwapList = async (
  actorPayload: AuthTokenPayload,
  query: ShiftSwapListQuery
) => {
  const actor = await ensureActor(actorPayload);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};
  const andFilters: Record<string, unknown>[] = [];

  if (actor.role === "staff") {
    andFilters.push({ $or: [
      { fromEmployeeId: getDocumentId(actor) },
      { toEmployeeId: getDocumentId(actor) },
    ] });
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
    const employeeId = asObjectId(query.employeeId);
    andFilters.push({ $or: [{ fromEmployeeId: employeeId }, { toEmployeeId: employeeId }] });
  }

  if (query.fromEmployeeId) {
    filter.fromEmployeeId = asObjectId(query.fromEmployeeId);
  }

  if (query.toEmployeeId) {
    filter.toEmployeeId = asObjectId(query.toEmployeeId);
  }

  if (query.fromScheduleId) {
    filter.fromScheduleId = asObjectId(query.fromScheduleId);
  }

  if (query.toScheduleId) {
    filter.toScheduleId = asObjectId(query.toScheduleId);
  }

  if (query.managerId) {
    filter.managerId = asObjectId(query.managerId);
  }

  if (actor.role !== "staff" && query.finalStatus === "pending_receiver") {
    throw new AppError(403, "Shift swap is still waiting for receiver response");
  }

  if (query.finalStatus) {
    filter.finalStatus = query.finalStatus;
  } else if (actor.role !== "staff") {
    filter.finalStatus = { $ne: "pending_receiver" };
  }

  if (query.receiverStatus) {
    filter.receiverStatus = query.receiverStatus;
  }

  if (query.managerStatus) {
    filter.managerStatus = query.managerStatus;
  }

  if (query.createdFrom || query.createdTo) {
    filter.createdAt = {
      ...(query.createdFrom ? { $gte: query.createdFrom } : {}),
      ...(query.createdTo ? { $lte: query.createdTo } : {}),
    };
  }

  if (query.respondedFrom || query.respondedTo) {
    const respondedAtFilter = {
      ...(query.respondedFrom ? { $gte: query.respondedFrom } : {}),
      ...(query.respondedTo ? { $lte: query.respondedTo } : {}),
    };
    andFilters.push({ $or: [
      { receiverRespondedAt: respondedAtFilter },
      { managerRespondedAt: respondedAtFilter },
    ] });
  }

  if (andFilters.length > 0) {
    filter.$and = andFilters;
  }

  const [items, total] = await Promise.all([
    ShiftSwapRequestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ShiftSwapRequestModel.countDocuments(filter),
  ]);

  const schedulesById = await getSchedulesById(
    items.flatMap((item) => [item.fromScheduleId, item.toScheduleId])
  );
  const branchesById = await getBranchesById(items.map((item) => item.branchId));

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: items.map((item) => toPublicShiftSwap(item, schedulesById, branchesById)),
  };
};

export const ShiftSwapService = {
  createShiftSwap,
  acceptShiftSwap: (
    actor: AuthTokenPayload,
    shiftSwapId: string,
    payload: ReceiverShiftSwapInput
  ) => respondReceiver(actor, shiftSwapId, true, payload),
  rejectShiftSwapByReceiver: (
    actor: AuthTokenPayload,
    shiftSwapId: string,
    payload: ReceiverShiftSwapInput
  ) => respondReceiver(actor, shiftSwapId, false, payload),
  approveShiftSwap: (
    actor: AuthTokenPayload,
    shiftSwapId: string,
    payload: ManagerShiftSwapInput
  ) => reviewByManager(actor, shiftSwapId, true, payload),
  rejectShiftSwapByManager: (
    actor: AuthTokenPayload,
    shiftSwapId: string,
    payload: ManagerShiftSwapInput
  ) => reviewByManager(actor, shiftSwapId, false, payload),
  cancelShiftSwap,
  getShiftSwapById,
  getShiftSwapList,
};
