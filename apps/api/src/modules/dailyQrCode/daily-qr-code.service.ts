import crypto from "crypto";
import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import type { IBranch } from "../branch/branch.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { DailyQrCodeModel } from "./daily-qr-code.model.js";
import type { IDailyQrCode } from "./daily-qr-code.model.js";
import type {
  GenerateDailyQrInput,
  VerifyDailyQrInput,
} from "./daily-qr-code.validation.js";

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

const toPublicDailyQrCode = (qrCode: IDailyQrCode) => ({
  id: getDocumentId(qrCode).toString(),
  organizationId: qrCode.organizationId.toString(),
  branchId: qrCode.branchId.toString(),
  qrToken: qrCode.qrToken,
  validDate: qrCode.validDate,
  expiresAt: qrCode.expiresAt,
  status: qrCode.status,
  createdBy: qrCode.createdBy.toString(),
});

const generateDailyQr = async (
  actorPayload: AuthTokenPayload,
  payload: GenerateDailyQrInput
) => {
  const actor = await ensureActor(actorPayload);

  if (actor.role === "staff") {
    throw new AppError(403, "Staff cannot generate daily QR codes");
  }

  const branch = await getBranchForActor(actor, payload.branchId);

  if (!branch.qrSettings.enabled) {
    throw new AppError(400, "QR check-in is disabled for this branch");
  }

  const validDate = startOfDay(payload.validDate ?? new Date());
  const expiresInSeconds =
    payload.expiresInSeconds ??
    branch.qrSettings.qrExpiresInSeconds ??
    branch.qrSettings.refreshIntervalSeconds ??
    60;
  const now = new Date();

  await DailyQrCodeModel.updateMany(
    {
      branchId: getDocumentId(branch),
      validDate: { $gte: startOfDay(validDate), $lte: endOfDay(validDate) },
      status: "active",
    },
    { status: "expired" }
  );

  const qrCode = await DailyQrCodeModel.create({
    organizationId: branch.organizationId,
    branchId: getDocumentId(branch),
    qrToken: crypto.randomBytes(32).toString("hex"),
    validDate,
    expiresAt: new Date(now.getTime() + expiresInSeconds * 1000),
    status: "active",
    createdBy: getDocumentId(actor),
  });

  return toPublicDailyQrCode(qrCode);
};

const verifyQr = async (actorPayload: AuthTokenPayload, payload: VerifyDailyQrInput) => {
  const actor = await ensureActor(actorPayload);
  const qrCode = await DailyQrCodeModel.findOne({ qrToken: payload.qrToken });

  if (!qrCode) {
    throw new AppError(404, "QR code not found");
  }

  const branch = await getBranchForActor(actor, qrCode.branchId);

  if (payload.branchId && payload.branchId !== getDocumentId(branch).toString()) {
    throw new AppError(400, "QR code does not belong to the selected branch");
  }

  if (qrCode.status !== "active" || qrCode.expiresAt < new Date()) {
    if (qrCode.status === "active") {
      qrCode.status = "expired";
      await qrCode.save();
    }

    throw new AppError(400, "QR code is expired or revoked");
  }

  return {
    valid: true,
    qrCode: toPublicDailyQrCode(qrCode),
  };
};

export const DailyQrCodeService = {
  generateDailyQr,
  verifyQr,
};
