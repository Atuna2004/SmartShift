import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { BranchModel } from "./branch.model.js";
import type { IBranch } from "./branch.model.js";
import type {
  BranchListQuery,
  ConfigureBranchSettingsInput,
  ConfigureLateThresholdInput,
  ConfigureQrSettingsInput,
  CreateBranchInput,
  UpdateBranchInput,
} from "./branch.schema.js";

const asObjectId = (value: string | Types.ObjectId) =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

const mergeDefined = <T extends Record<string, unknown>>(
  current: T,
  patch: Record<string, unknown>
) => {
  const next = { ...current };

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      next[key as keyof T] = value as T[keyof T];
    }
  }

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

  if (user.role === "staff") {
    throw new AppError(403, "Staff cannot manage branches");
  }

  return user;
};

const getActorOrganizationId = (actor: IUser, payloadOrganizationId?: string) => {
  if (actor.organizationId) {
    return actor.organizationId;
  }

  if (payloadOrganizationId) {
    return asObjectId(payloadOrganizationId);
  }

  throw new AppError(400, "Organization is required");
};

const assertBranchAccess = (actor: IUser, branch: IBranch) => {
  if (branch.deletedAt) {
    throw new AppError(404, "Branch not found");
  }

  if (actor.role === "owner") {
    const sameOrganization =
      actor.organizationId &&
      branch.organizationId &&
      branch.organizationId.equals(actor.organizationId);
    const ownedByOwner = branch.ownerId && branch.ownerId.equals(getDocumentId(actor));
    const createdByOwner =
      branch.createdBy && branch.createdBy.equals(getDocumentId(actor));

    if (!sameOrganization && !ownedByOwner && !createdByOwner) {
      throw new AppError(403, "Branch is outside your organization");
    }

    return;
  }

  if (!actor.branchId || !branch._id || !actor.branchId.equals(getDocumentId(branch))) {
    throw new AppError(403, "Branch is outside your assignment");
  }
};

const getBranchForActor = async (actor: IUser, branchId: string) => {
  const branch = await BranchModel.findById(branchId);

  if (!branch || branch.deletedAt) {
    throw new AppError(404, "Branch not found");
  }

  assertBranchAccess(actor, branch);

  return branch;
};

const toPublicBranch = (branch: IBranch) => ({
  id: getDocumentId(branch).toString(),
  organizationId: branch.organizationId.toString(),
  name: branch.name,
  status: branch.status,
  settings: branch.settings,
  qrSettings: branch.qrSettings,
  attendanceSettings: branch.attendanceSettings,
  createdBy: branch.createdBy.toString(),
  ...(branch.code ? { code: branch.code } : {}),
  ...(branch.address ? { address: branch.address } : {}),
  ...(branch.phone ? { phone: branch.phone } : {}),
  ...(branch.description ? { description: branch.description } : {}),
  ...(branch.location ? { location: branch.location } : {}),
  ...(branch.updatedBy ? { updatedBy: branch.updatedBy.toString() } : {}),
  ...(branch.disabledAt ? { disabledAt: branch.disabledAt } : {}),
  ...(branch.enabledAt ? { enabledAt: branch.enabledAt } : {}),
  ...(branch.managerId ? { managerId: branch.managerId.toString() } : {}),
  ...(branch.ownerId ? { ownerId: branch.ownerId.toString() } : {}),
});

const assertUniqueCode = async (
  organizationId: Types.ObjectId,
  code: string | undefined,
  excludeBranchId?: Types.ObjectId
) => {
  if (!code) {
    return;
  }

  const filter: Record<string, unknown> = {
    organizationId,
    code,
    deletedAt: { $exists: false },
  };

  if (excludeBranchId) {
    filter._id = { $ne: excludeBranchId };
  }

  const existingBranch = await BranchModel.findOne(filter);

  if (existingBranch) {
    throw new AppError(409, "Branch code already exists");
  }
};

const syncLegacySettings = (branch: IBranch) => {
  branch.qrCheckinEnabled = branch.qrSettings.enabled;
  branch.lateThresholdMinutes = branch.attendanceSettings.lateThresholdMinutes;
  branch.timezone = branch.settings.timezone ?? branch.timezone;
};

const createBranch = async (actorPayload: AuthTokenPayload, payload: CreateBranchInput) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role !== "owner") {
    throw new AppError(403, "Only owners can create branches");
  }

  const organizationId = getActorOrganizationId(actor, payload.organizationId);

  await assertUniqueCode(organizationId, payload.code);

  const branch = await BranchModel.create({
    organizationId,
    name: payload.name,
    ownerId: getDocumentId(actor),
    createdBy: getDocumentId(actor),
    status: "active",
    ...(payload.code ? { code: payload.code } : {}),
    ...(payload.address ? { address: payload.address } : {}),
    ...(payload.phone ? { phone: payload.phone } : {}),
    ...(payload.description ? { description: payload.description } : {}),
    ...(payload.location ? { location: payload.location } : {}),
    ...(payload.settings ? { settings: payload.settings } : {}),
    ...(payload.qrSettings ? { qrSettings: payload.qrSettings } : {}),
    ...(payload.attendanceSettings
      ? { attendanceSettings: payload.attendanceSettings }
      : {}),
  } as Partial<IBranch>);

  return toPublicBranch(branch);
};

const getBranchList = async (actorPayload: AuthTokenPayload, query: BranchListQuery) => {
  const actor = await ensureActor(actorPayload);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {
    deletedAt: { $exists: false },
  };

  if (actor.role === "owner") {
    if (actor.organizationId) {
      filter.organizationId = actor.organizationId;
    } else {
      filter.ownerId = getDocumentId(actor);
    }
  } else {
    if (!actor.branchId) {
      throw new AppError(403, "Manager is not assigned to a branch");
    }

    filter._id = actor.branchId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { code: { $regex: query.search, $options: "i" } },
      { address: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
    ];
  }

  const [branches, total] = await Promise.all([
    BranchModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    BranchModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: branches.map(toPublicBranch),
  };
};

const getBranchById = async (actorPayload: AuthTokenPayload, branchId: string) => {
  const actor = await ensureActor(actorPayload);
  const branch = await getBranchForActor(actor, branchId);

  return toPublicBranch(branch);
};

const updateBranch = async (
  actorPayload: AuthTokenPayload,
  branchId: string,
  payload: UpdateBranchInput
) => {
  const actor = await ensureActor(actorPayload);
  const branch = await getBranchForActor(actor, branchId);

  await assertUniqueCode(branch.organizationId, payload.code, getDocumentId(branch));

  if (payload.name !== undefined) branch.name = payload.name;
  if (payload.code !== undefined) branch.code = payload.code;
  if (payload.address !== undefined) branch.address = payload.address;
  if (payload.phone !== undefined) branch.phone = payload.phone;
  if (payload.description !== undefined) branch.description = payload.description;
  if (payload.location !== undefined) {
    branch.location = mergeDefined(branch.location ?? {}, payload.location);
  }
  if (payload.settings !== undefined) {
    branch.settings = mergeDefined(branch.settings, payload.settings);
  }
  if (payload.qrSettings !== undefined) {
    branch.qrSettings = mergeDefined(branch.qrSettings, payload.qrSettings);
  }
  if (payload.attendanceSettings !== undefined) {
    branch.attendanceSettings = {
      ...branch.attendanceSettings,
      ...payload.attendanceSettings,
    };
  }

  branch.updatedBy = getDocumentId(actor);
  syncLegacySettings(branch);
  await branch.save();

  return toPublicBranch(branch);
};

const setBranchStatus = async (
  actorPayload: AuthTokenPayload,
  branchId: string,
  status: "active" | "disabled"
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role !== "owner") {
    throw new AppError(403, "Only owners can enable or disable branches");
  }

  const branch = await getBranchForActor(actor, branchId);
  const now = new Date();

  branch.status = status;
  branch.updatedBy = getDocumentId(actor);

  if (status === "disabled") {
    branch.disabledAt = now;
  } else {
    branch.enabledAt = now;
    branch.set("disabledAt", undefined);
  }

  await branch.save();

  return toPublicBranch(branch);
};

const configureBranchSettings = async (
  actorPayload: AuthTokenPayload,
  branchId: string,
  payload: ConfigureBranchSettingsInput
) => {
  const actor = await ensureActor(actorPayload);
  const branch = await getBranchForActor(actor, branchId);

  branch.settings = mergeDefined(branch.settings, payload);
  branch.updatedBy = getDocumentId(actor);
  syncLegacySettings(branch);
  await branch.save();

  return toPublicBranch(branch);
};

const configureQrSettings = async (
  actorPayload: AuthTokenPayload,
  branchId: string,
  payload: ConfigureQrSettingsInput
) => {
  const actor = await ensureActor(actorPayload);
  const branch = await getBranchForActor(actor, branchId);

  branch.qrSettings = mergeDefined(branch.qrSettings, payload);
  branch.updatedBy = getDocumentId(actor);
  syncLegacySettings(branch);
  await branch.save();

  return toPublicBranch(branch);
};

const configureLateThreshold = async (
  actorPayload: AuthTokenPayload,
  branchId: string,
  payload: ConfigureLateThresholdInput
) => {
  const actor = await ensureActor(actorPayload);
  const branch = await getBranchForActor(actor, branchId);

  branch.attendanceSettings = {
    ...branch.attendanceSettings,
    lateThresholdMinutes: payload.lateThresholdMinutes,
  };
  branch.updatedBy = getDocumentId(actor);
  syncLegacySettings(branch);
  await branch.save();

  return toPublicBranch(branch);
};

export const BranchService = {
  createBranch,
  getBranchList,
  getBranchById,
  updateBranch,
  disableBranch: (actor: AuthTokenPayload, branchId: string) =>
    setBranchStatus(actor, branchId, "disabled"),
  enableBranch: (actor: AuthTokenPayload, branchId: string) =>
    setBranchStatus(actor, branchId, "active"),
  configureBranchSettings,
  configureQrSettings,
  configureLateThreshold,
};
