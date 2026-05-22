import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { ScheduleModel } from "../schedule/schedule.model.js";
import type { ISchedule, ScheduleStatus } from "../schedule/schedule.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { LeaveRequestModel } from "./leave-request.model.js";
import type { ILeaveRequest, LeaveRequestStatus } from "./leave-request.model.js";
import type {
  CreateLeaveRequestInput,
  LeaveRequestListQuery,
  ReviewLeaveRequestInput,
  UpdateLeaveRequestInput,
} from "./leave-request.validation.js";

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
    throw new AppError(403, "You can only request leave for your own schedule");
  }

  if (schedule.status === "cancelled" || schedule.status === "completed") {
    throw new AppError(400, "Assigned shift is not eligible for leave request");
  }

  return schedule;
};

const assertLeaveRequestAccess = async (actor: IUser, leaveRequest: ILeaveRequest) => {
  if (actor.role === "staff") {
    if (!leaveRequest.employeeId.equals(getDocumentId(actor))) {
      throw new AppError(403, "You can only access your own leave requests");
    }
    return;
  }

  await getBranchForActor(actor, leaveRequest.branchId);
};

const getLeaveRequestForActor = async (
  actor: IUser,
  leaveRequestId: string
) => {
  const leaveRequest = await LeaveRequestModel.findById(leaveRequestId);

  if (!leaveRequest) {
    throw new AppError(404, "Leave request not found");
  }

  await assertLeaveRequestAccess(actor, leaveRequest);

  return leaveRequest;
};

const toPublicLeaveRequest = (leaveRequest: ILeaveRequest) => ({
  id: getDocumentId(leaveRequest).toString(),
  organizationId: leaveRequest.organizationId.toString(),
  branchId: leaveRequest.branchId.toString(),
  employeeId: leaveRequest.employeeId.toString(),
  scheduleId: leaveRequest.scheduleId.toString(),
  reason: leaveRequest.reason,
  status: leaveRequest.status,
  requestedAt: leaveRequest.requestedAt,
  ...(leaveRequest.approvedBy
    ? { approvedBy: leaveRequest.approvedBy.toString() }
    : {}),
  ...(leaveRequest.managerNote ? { managerNote: leaveRequest.managerNote } : {}),
  ...(leaveRequest.respondedAt ? { respondedAt: leaveRequest.respondedAt } : {}),
});

const syncScheduleAfterReview = async (
  schedule: ISchedule,
  status: LeaveRequestStatus
) => {
  if (status === "approved") {
    schedule.status = "leave_requested";
  }

  if (status === "rejected" && schedule.status === "leave_requested") {
    schedule.status = "scheduled";
  }

  await schedule.save();
};

const createLeaveRequest = async (
  actorPayload: AuthTokenPayload,
  payload: CreateLeaveRequestInput
) => {
  const actor = await ensureActor(actorPayload);
  const schedule = await getScheduleForActor(actor, payload.scheduleId);

  const existingRequest = await LeaveRequestModel.findOne({
    scheduleId: getDocumentId(schedule),
    status: { $in: ["pending", "approved"] },
  });

  if (existingRequest) {
    throw new AppError(409, "Leave request already exists for this schedule");
  }

  const leaveRequest = await LeaveRequestModel.create({
    organizationId: schedule.organizationId,
    branchId: schedule.branchId,
    employeeId: schedule.employeeId,
    scheduleId: getDocumentId(schedule),
    reason: payload.reason,
    status: "pending",
    requestedAt: new Date(),
  });

  return toPublicLeaveRequest(leaveRequest);
};

const updateLeaveRequest = async (
  actorPayload: AuthTokenPayload,
  leaveRequestId: string,
  payload: UpdateLeaveRequestInput
) => {
  const actor = await ensureActor(actorPayload);
  const leaveRequest = await getLeaveRequestForActor(actor, leaveRequestId);

  if (leaveRequest.status !== "pending") {
    throw new AppError(400, "Only pending leave requests can be updated");
  }

  if (actor.role !== "staff" && !leaveRequest.employeeId.equals(getDocumentId(actor))) {
    await getBranchForActor(actor, leaveRequest.branchId);
  }

  if (payload.reason !== undefined) {
    leaveRequest.reason = payload.reason;
  }

  await leaveRequest.save();

  return toPublicLeaveRequest(leaveRequest);
};

const cancelLeaveRequest = async (
  actorPayload: AuthTokenPayload,
  leaveRequestId: string
) => {
  const actor = await ensureActor(actorPayload);
  const leaveRequest = await getLeaveRequestForActor(actor, leaveRequestId);

  if (leaveRequest.status !== "pending") {
    throw new AppError(400, "Only pending leave requests can be cancelled");
  }

  leaveRequest.status = "cancelled";
  leaveRequest.respondedAt = new Date();
  await leaveRequest.save();

  return toPublicLeaveRequest(leaveRequest);
};

const reviewLeaveRequest = async (
  actorPayload: AuthTokenPayload,
  leaveRequestId: string,
  status: Extract<LeaveRequestStatus, "approved" | "rejected">,
  payload: ReviewLeaveRequestInput
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role === "staff") {
    throw new AppError(403, "Staff cannot review leave requests");
  }

  const leaveRequest = await getLeaveRequestForActor(actor, leaveRequestId);

  if (leaveRequest.status !== "pending") {
    throw new AppError(400, "Only pending leave requests can be reviewed");
  }

  const schedule = await ScheduleModel.findById(leaveRequest.scheduleId);

  if (!schedule || schedule.deletedAt) {
    throw new AppError(404, "Assigned shift not found");
  }

  leaveRequest.status = status;
  leaveRequest.approvedBy = getDocumentId(actor);
  leaveRequest.respondedAt = new Date();
  if (payload.managerNote !== undefined) {
    leaveRequest.managerNote = payload.managerNote;
  }

  await Promise.all([
    leaveRequest.save(),
    syncScheduleAfterReview(schedule, status),
  ]);

  return toPublicLeaveRequest(leaveRequest);
};

const getLeaveRequestById = async (
  actorPayload: AuthTokenPayload,
  leaveRequestId: string
) => {
  const actor = await ensureActor(actorPayload);
  const leaveRequest = await getLeaveRequestForActor(actor, leaveRequestId);

  return toPublicLeaveRequest(leaveRequest);
};

const getLeaveRequestList = async (
  actorPayload: AuthTokenPayload,
  query: LeaveRequestListQuery
) => {
  const actor = await ensureActor(actorPayload);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
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
      throw new AppError(403, "You can only view your own leave requests");
    }
    filter.employeeId = asObjectId(query.employeeId);
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.from || query.to) {
    filter.requestedAt = {
      ...(query.from ? { $gte: startOfDay(query.from) } : {}),
      ...(query.to ? { $lte: endOfDay(query.to) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    LeaveRequestModel.find(filter).sort({ requestedAt: -1 }).skip(skip).limit(limit),
    LeaveRequestModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: items.map(toPublicLeaveRequest),
  };
};

export const LeaveRequestService = {
  createLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
  approveLeaveRequest: (
    actor: AuthTokenPayload,
    leaveRequestId: string,
    payload: ReviewLeaveRequestInput
  ) => reviewLeaveRequest(actor, leaveRequestId, "approved", payload),
  rejectLeaveRequest: (
    actor: AuthTokenPayload,
    leaveRequestId: string,
    payload: ReviewLeaveRequestInput
  ) => reviewLeaveRequest(actor, leaveRequestId, "rejected", payload),
  getLeaveRequestById,
  getLeaveRequestList,
};
