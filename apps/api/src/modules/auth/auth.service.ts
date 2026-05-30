import crypto from "crypto";
import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import { comparePassword, hashPassword } from "../../common/utils/hash.js";
import {
  createRefreshToken,
  createToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import { OrganizationModel } from "../organization/organization.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterOwnerInput,
  RegisterAdminInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "./auth.validation.js";

const toPublicUser = async (user: IUser) => {
  const branch = user.branchId ? await BranchModel.findById(user.branchId) : null;
  const publicUser = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    employeeType: user.employeeType,
    joinDate: user.joinDate,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
  };

  return {
    ...publicUser,
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.avatar ? { avatar: user.avatar } : {}),
    ...(user.branchId ? { branchId: user.branchId.toString() } : {}),
    ...(branch ? { branchName: branch.name } : {}),
    ...(user.organizationId
      ? { organizationId: user.organizationId.toString() }
      : {}),
    ...(user.employeeCode ? { employeeCode: user.employeeCode } : {}),
  };
};

const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createPasswordResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const buildTokenPair = async (user: IUser) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    ...(user.organizationId
      ? { organizationId: user.organizationId.toString() }
      : {}),
    ...(user.branchId ? { branchId: user.branchId.toString() } : {}),
  };

  const accessToken = createToken(payload);
  const refreshToken = createRefreshToken(payload);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

const registerOwner = async (payload: RegisterOwnerInput) => {
  const existingUser = await UserModel.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const hashedPassword = await hashPassword(payload.password);

  const userPayload = {
    fullName: payload.fullName,
    email: payload.email,
    password: hashedPassword,
    role: "owner" as const,
    status: "active" as const,
    ...(payload.phone ? { phone: payload.phone } : {}),
  };

  const user = await UserModel.create(userPayload);

  try {
    const userId = user._id as Types.ObjectId;

    if (payload.organization) {
      const organizationPayload: Record<string, unknown> = {
        name: payload.organization.name,
        ownerId: userId,
        createdBy: userId,
        status: "active",
      };

      if (payload.organization.businessType) {
        organizationPayload.businessType = payload.organization.businessType;
      }

      if (payload.organization.phone) {
        organizationPayload.phone = payload.organization.phone;
      }

      if (payload.organization.email) {
        organizationPayload.email = payload.organization.email;
      }

      if (payload.organization.address) {
        organizationPayload.address = payload.organization.address;
      }

      if (payload.subscription) {
        organizationPayload.subscription = payload.subscription;
      }

      const organization = await OrganizationModel.create(organizationPayload);

      const organizationId = organization._id as Types.ObjectId;

      user.organizationId = organizationId;

      if (payload.branch) {
        const branchPayload: Record<string, unknown> = {
          organizationId,
          name: payload.branch.name,
          ownerId: userId,
          createdBy: userId,
          status: "active",
        };

        if (payload.branch.address) {
          branchPayload.address = payload.branch.address;
        }

        if (payload.branch.phone) {
          branchPayload.phone = payload.branch.phone;
        }

        const branch = await BranchModel.create(branchPayload);

        user.branchId = branch._id as Types.ObjectId;
      }

      await user.save();
    }
  } catch (error) {
    await Promise.allSettled([
      BranchModel.deleteMany({ ownerId: user._id }),
      OrganizationModel.deleteMany({ ownerId: user._id }),
      UserModel.findByIdAndDelete(user._id),
    ]);

    throw error;
  }

  const tokens = await buildTokenPair(user);

  return {
    ...tokens,
    user: await toPublicUser(user),
  };
};

const registerAdmin = async (payload: RegisterAdminInput) => {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;

  if (!setupSecret || payload.setupSecret !== setupSecret) {
    throw new AppError(403, "Invalid admin setup secret");
  }

  const existingUser = await UserModel.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const hashedPassword = await hashPassword(payload.password);
  const user = await UserModel.create({
    fullName: payload.fullName,
    email: payload.email,
    password: hashedPassword,
    role: "admin" as const,
    status: "active" as const,
    ...(payload.phone ? { phone: payload.phone } : {}),
  });

  const tokens = await buildTokenPair(user);

  return {
    ...tokens,
    user: await toPublicUser(user),
  };
};

const login = async (payload: LoginInput) => {
  const user = await UserModel.findOne({ email: payload.email }).select(
    "+password"
  );

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordMatched = await comparePassword(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive");
  }

  user.lastLoginAt = new Date();

  const tokens = await buildTokenPair(user);

  return {
    ...tokens,
    user: await toPublicUser(user),
  };
};

const logout = async (userId: string) => {
  const user = await UserModel.findById(userId).select("+refreshTokenHash");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  user.set("refreshTokenHash", undefined);
  await user.save();

  return null;
};

const forgotPassword = async (payload: ForgotPasswordInput) => {
  const user = await UserModel.findOne({ email: payload.email }).select(
    "+passwordResetTokenHash +passwordResetExpiresAt"
  );

  if (!user || user.status !== "active") {
    return null;
  }

  const resetToken = createPasswordResetToken();

  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  if (process.env.NODE_ENV !== "production") {
    return {
      resetToken,
    };
  }

  return null;
};

const resetPassword = async (payload: ResetPasswordInput) => {
  const tokenHash = hashToken(payload.token);

  const user = await UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+password +passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    throw new AppError(400, "Invalid or expired reset token");
  }

  user.password = await hashPassword(payload.newPassword);
  user.passwordChangedAt = new Date();
  user.set("passwordResetTokenHash", undefined);
  user.set("passwordResetExpiresAt", undefined);
  user.set("refreshTokenHash", undefined);
  await user.save();

  return null;
};

const changePassword = async (
  userId: string,
  payload: ChangePasswordInput
) => {
  const user = await UserModel.findById(userId).select("+password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive");
  }

  const isPasswordMatched = await comparePassword(
    payload.currentPassword,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Current password is incorrect");
  }

  user.password = await hashPassword(payload.newPassword);
  user.passwordChangedAt = new Date();
  user.set("refreshTokenHash", undefined);
  await user.save();

  return null;
};

const refreshToken = async (payload: RefreshTokenInput) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(payload.refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  if (!decoded.userId) {
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await UserModel.findById(decoded.userId).select(
    "+refreshTokenHash"
  );

  if (!user || !user.refreshTokenHash) {
    throw new AppError(401, "Invalid refresh token");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive");
  }

  if (hashToken(payload.refreshToken) !== user.refreshTokenHash) {
    throw new AppError(401, "Invalid refresh token");
  }

  return buildTokenPair(user);
};

const getMe = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive");
  }

  return await toPublicUser(user);
};

const viewProfile = async (userId: string) => {
  return getMe(userId);
};

const updateProfile = async (
  userId: string,
  payload: UpdateProfileInput
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive");
  }

  if (payload.fullName !== undefined) {
    user.fullName = payload.fullName;
  }

  if (payload.phone !== undefined) {
    user.phone = payload.phone;
  }

  if (payload.avatar !== undefined) {
    user.avatar = payload.avatar;
  }

  await user.save();

  return await toPublicUser(user);
};

export const AuthService = {
  registerAdmin,
  registerOwner,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  getMe,
  viewProfile,
  updateProfile,
};
