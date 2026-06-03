import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { ShiftTemplateModel } from "./shift-template.model.js";
import type { IShiftTemplate } from "./shift-template.model.js";
import type {
  CreateShiftTemplateInput,
  ShiftTemplateListQuery,
  UpdateShiftTemplateInput,
} from "./shift.validation.js";

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

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
    throw new AppError(403, "Staff cannot manage shift templates");
  }

  return user;
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

const getBranchForActor = async (actor: IUser, branchId: string) => {
  const branch = await BranchModel.findById(branchId);

  if (!branch || branch.deletedAt) {
    throw new AppError(404, "Branch not found");
  }

  assertBranchAccess(actor, branch);

  return branch;
};

const getShiftTemplateForActor = async (
  actor: IUser,
  shiftTemplateId: string
) => {
  const shiftTemplate = await ShiftTemplateModel.findById(shiftTemplateId);

  if (!shiftTemplate) {
    throw new AppError(404, "Shift template not found");
  }

  await getBranchForActor(actor, shiftTemplate.branchId.toString());

  return shiftTemplate;
};

const toPublicShiftTemplate = (shiftTemplate: IShiftTemplate) => ({
  id: getDocumentId(shiftTemplate).toString(),
  organizationId: shiftTemplate.organizationId.toString(),
  branchId: shiftTemplate.branchId.toString(),
  name: shiftTemplate.name,
  startTime: shiftTemplate.startTime,
  endTime: shiftTemplate.endTime,
  breakMinutes: shiftTemplate.breakMinutes,
  status: shiftTemplate.status,
  createdBy: shiftTemplate.createdBy.toString(),
  ...(shiftTemplate.code ? { code: shiftTemplate.code } : {}),
  ...(shiftTemplate.color ? { color: shiftTemplate.color } : {}),
  ...(shiftTemplate.description ? { description: shiftTemplate.description } : {}),
  ...(shiftTemplate.updatedBy ? { updatedBy: shiftTemplate.updatedBy.toString() } : {}),
});

const assertUniqueCode = async (
  branchId: Types.ObjectId,
  code: string | undefined,
  excludeShiftTemplateId?: Types.ObjectId
) => {
  if (!code) {
    return;
  }

  const filter: Record<string, unknown> = {
    branchId,
    code,
    deletedAt: { $exists: false },
  };

  if (excludeShiftTemplateId) {
    filter._id = { $ne: excludeShiftTemplateId };
  }

  const existingShiftTemplate = await ShiftTemplateModel.findOne(filter);

  if (existingShiftTemplate) {
    throw new AppError(409, "Shift template code already exists in this branch");
  }
};

const createShiftTemplate = async (
  actorPayload: AuthTokenPayload,
  payload: CreateShiftTemplateInput
) => {
  const actor = await ensureActor(actorPayload);
  const branch = await getBranchForActor(actor, payload.branchId);

  await assertUniqueCode(getDocumentId(branch), payload.code);

  const shiftTemplate = await ShiftTemplateModel.create({
    organizationId: branch.organizationId,
    branchId: getDocumentId(branch),
    name: payload.name,
    startTime: payload.startTime,
    endTime: payload.endTime,
    breakMinutes: payload.breakMinutes,
    status: "active",
    createdBy: getDocumentId(actor),
    ...(payload.code ? { code: payload.code } : {}),
    ...(payload.color ? { color: payload.color } : {}),
    ...(payload.description ? { description: payload.description } : {}),
  });

  return toPublicShiftTemplate(shiftTemplate);
};

const getShiftTemplateList = async (
  actorPayload: AuthTokenPayload,
  query: ShiftTemplateListQuery
) => {
  const actor = await ensureActor(actorPayload);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  if (query.branchId) {
    const branch = await getBranchForActor(actor, query.branchId);
    filter.branchId = getDocumentId(branch);
  } else if (actor.role === "owner") {
    if (actor.organizationId) {
      filter.organizationId = actor.organizationId;
    } else {
      filter.createdBy = getDocumentId(actor);
    }
  } else {
    if (!actor.branchId) {
      throw new AppError(403, "Manager is not assigned to a branch");
    }

    filter.branchId = actor.branchId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { code: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const [shiftTemplates, total] = await Promise.all([
    ShiftTemplateModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ShiftTemplateModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: shiftTemplates.map(toPublicShiftTemplate),
  };
};

const getShiftTemplateById = async (
  actorPayload: AuthTokenPayload,
  shiftTemplateId: string
) => {
  const actor = await ensureActor(actorPayload);
  const shiftTemplate = await getShiftTemplateForActor(actor, shiftTemplateId);

  return toPublicShiftTemplate(shiftTemplate);
};

const updateShiftTemplate = async (
  actorPayload: AuthTokenPayload,
  shiftTemplateId: string,
  payload: UpdateShiftTemplateInput
) => {
  const actor = await ensureActor(actorPayload);
  const shiftTemplate = await getShiftTemplateForActor(actor, shiftTemplateId);

  await assertUniqueCode(
    shiftTemplate.branchId,
    payload.code,
    getDocumentId(shiftTemplate)
  );

  if (payload.name !== undefined) shiftTemplate.name = payload.name;
  if (payload.code !== undefined) shiftTemplate.code = payload.code;
  if (payload.startTime !== undefined) shiftTemplate.startTime = payload.startTime;
  if (payload.endTime !== undefined) shiftTemplate.endTime = payload.endTime;
  if (payload.breakMinutes !== undefined) {
    shiftTemplate.breakMinutes = payload.breakMinutes;
  }
  if (payload.color !== undefined) shiftTemplate.color = payload.color;
  if (payload.description !== undefined) {
    shiftTemplate.description = payload.description;
  }

  shiftTemplate.updatedBy = getDocumentId(actor);
  await shiftTemplate.save();

  return toPublicShiftTemplate(shiftTemplate);
};

const disableShiftTemplate = async (
  actorPayload: AuthTokenPayload,
  shiftTemplateId: string
) => {
  const actor = await ensureActor(actorPayload);
  const shiftTemplate = await getShiftTemplateForActor(actor, shiftTemplateId);

  shiftTemplate.status = "disabled";
  shiftTemplate.set("deletedAt", undefined);
  shiftTemplate.updatedBy = getDocumentId(actor);
  await shiftTemplate.save();

  return toPublicShiftTemplate(shiftTemplate);
};

const enableShiftTemplate = async (
  actorPayload: AuthTokenPayload,
  shiftTemplateId: string
) => {
  const actor = await ensureActor(actorPayload);
  const shiftTemplate = await getShiftTemplateForActor(actor, shiftTemplateId);

  shiftTemplate.status = "active";
  shiftTemplate.set("deletedAt", undefined);
  shiftTemplate.updatedBy = getDocumentId(actor);
  await shiftTemplate.save();

  return toPublicShiftTemplate(shiftTemplate);
};

export const ShiftService = {
  createShiftTemplate,
  getShiftTemplateList,
  getShiftTemplateById,
  updateShiftTemplate,
  disableShiftTemplate,
  enableShiftTemplate,
};
