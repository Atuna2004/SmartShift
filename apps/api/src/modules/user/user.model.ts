import mongoose, { Document, Schema, Types } from "mongoose";

export type UserRole = "admin" | "owner" | "manager" | "staff";
export type EmployeeType = "full_time" | "part_time";
export type UserStatus = "active" | "inactive";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  employeeType: EmployeeType;
  branchId?: Types.ObjectId;
  organizationId?: Types.ObjectId;
  employeeCode?: string;
  joinDate?: Date;
  status: UserStatus;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  refreshTokenHash?: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  passwordChangedAt?: Date;
  createdBy?: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
    },

    role: {
      type: String,
      enum: ["admin", "owner", "manager", "staff"],
      required: true,
    },

    employeeType: {
      type: String,
      enum: ["full_time", "part_time"],
      default: "part_time",
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },

    employeeCode: {
      type: String,
      trim: true,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    refreshTokenHash: {
      type: String,
      select: false,
    },

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ branchId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ employeeCode: 1 });

export const UserModel = mongoose.model<IUser>("User", userSchema);
