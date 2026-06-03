import mongoose, { Document, Schema, Types } from "mongoose";

export type BranchStatus = "active" | "disabled";

export type BranchLocation = {
  lat?: number;
  lng?: number;
  radiusMeters?: number;
};

export type BranchSettings = {
  timezone?: string;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
  allowEarlyCheckInMinutes?: number;
  allowLateCheckOutMinutes?: number;
  requireCheckout?: boolean;
};

export type BranchQrSettings = {
  enabled: boolean;
  refreshIntervalSeconds?: number;
  requireGps?: boolean;
  qrExpiresInSeconds?: number;
};

export type BranchAttendanceSettings = {
  lateThresholdMinutes: number;
};

export interface IBranch extends Document {
  organizationId: Types.ObjectId;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  description?: string;
  status: BranchStatus;
  location?: BranchLocation;
  settings: BranchSettings;
  qrSettings: BranchQrSettings;
  attendanceSettings: BranchAttendanceSettings;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  disabledAt?: Date;
  enabledAt?: Date;
  deletedAt?: Date;

  managerId?: Types.ObjectId;
  ownerId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  qrCheckinEnabled: boolean;
  lateThresholdMinutes: number;
  timezone: string;
}

const branchSchema = new Schema<IBranch>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },

    location: {
      lat: { type: Number },
      lng: { type: Number },
      radiusMeters: { type: Number, min: 1 },
    },

    settings: {
      timezone: { type: String, default: "Asia/Ho_Chi_Minh" },
      openingTime: { type: String },
      closingTime: { type: String },
      workingDays: [{ type: String }],
      allowEarlyCheckInMinutes: { type: Number, min: 0, default: 0 },
      allowLateCheckOutMinutes: { type: Number, min: 0, default: 0 },
      requireCheckout: { type: Boolean, default: true },
    },

    qrSettings: {
      enabled: { type: Boolean, default: true },
      refreshIntervalSeconds: { type: Number, min: 10, default: 60 },
      requireGps: { type: Boolean, default: true },
      qrExpiresInSeconds: { type: Number, min: 10, default: 60 },
    },

    attendanceSettings: {
      lateThresholdMinutes: { type: Number, min: 0, default: 15 },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    disabledAt: {
      type: Date,
    },

    enabledAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },

    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },

    qrCheckinEnabled: {
      type: Boolean,
      default: true,
    },

    lateThresholdMinutes: {
      type: Number,
      min: 0,
      default: 15,
    },

    timezone: {
      type: String,
      default: "Asia/Ho_Chi_Minh",
    },
  },
  {
    timestamps: true,
  }
);

branchSchema.pre("validate", function syncLegacyFields() {
  if (this.status === ("inactive" as BranchStatus)) {
    this.status = "disabled";
  }

  this.qrCheckinEnabled = this.qrSettings?.enabled ?? this.qrCheckinEnabled ?? true;
  this.lateThresholdMinutes =
    this.attendanceSettings?.lateThresholdMinutes ?? this.lateThresholdMinutes ?? 15;
  this.timezone = this.settings?.timezone ?? this.timezone ?? "Asia/Ho_Chi_Minh";
});

branchSchema.index({ ownerId: 1 });
branchSchema.index({ managerId: 1 });
branchSchema.index({ organizationId: 1, status: 1 });
branchSchema.index(
  { organizationId: 1, code: 1 },
  { unique: true, partialFilterExpression: { code: { $exists: true } } }
);
branchSchema.index({ deletedAt: 1 });

export const BranchModel = mongoose.model<IBranch>("Branch", branchSchema);
