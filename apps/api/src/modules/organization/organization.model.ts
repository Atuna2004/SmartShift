import mongoose, { Document, Schema, Types } from "mongoose";

export type OrganizationBusinessType =
  | "cafe"
  | "restaurant"
  | "retail"
  | "service"
  | "other";
export type OrganizationStatus = "active" | "disabled";
export type OrganizationSubscriptionPlan = "free" | "basic" | "pro";
export type OrganizationSubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled";

export type OrganizationSettings = {
  timezone: string;
  defaultLateThresholdMinutes: number;
  defaultQrExpiresInSeconds: number;
  defaultRequireGps: boolean;
  defaultAllowEarlyCheckInMinutes: number;
  defaultAllowLateCheckOutMinutes: number;
};

export type OrganizationSubscriptionInfo = {
  plan: OrganizationSubscriptionPlan;
  status: OrganizationSubscriptionStatus;
  startedAt?: Date;
  expiredAt?: Date;
  maxBranches?: number;
  maxEmployees?: number;
};

export interface IOrganization extends Document {
  name: string;
  slug?: string;
  businessType?: OrganizationBusinessType;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  status: OrganizationStatus;
  settings: OrganizationSettings;
  subscription: OrganizationSubscriptionInfo;
  subscriptionId?: Types.ObjectId;
  ownerId: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  disabledAt?: Date;
  enabledAt?: Date;
  deletedAt?: Date;
}

const settingsSchema = new Schema<OrganizationSettings>(
  {
    timezone: { type: String, required: true, default: "Asia/Ho_Chi_Minh" },
    defaultLateThresholdMinutes: { type: Number, required: true, min: 0, default: 15 },
    defaultQrExpiresInSeconds: { type: Number, required: true, min: 10, default: 60 },
    defaultRequireGps: { type: Boolean, required: true, default: true },
    defaultAllowEarlyCheckInMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    defaultAllowLateCheckOutMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const subscriptionInfoSchema = new Schema<OrganizationSubscriptionInfo>(
  {
    plan: { type: String, enum: ["free", "basic", "pro"], default: "free" },
    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "cancelled"],
      default: "trialing",
    },
    startedAt: { type: Date },
    expiredAt: { type: Date },
    maxBranches: { type: Number, min: 0 },
    maxEmployees: { type: Number, min: 0 },
  },
  { _id: false }
);

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    businessType: {
      type: String,
      enum: ["cafe", "restaurant", "retail", "service", "other"],
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    subscription: {
      type: subscriptionInfoSchema,
      default: () => ({}),
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },
  {
    timestamps: true,
  }
);

organizationSchema.pre("validate", function normalizeLegacyStatus() {
  if (this.status === ("inactive" as OrganizationStatus)) {
    this.status = "disabled";
  }

  if (this.status === ("suspended" as OrganizationStatus)) {
    this.status = "disabled";
  }
});

organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ subscriptionId: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ deletedAt: 1 });
organizationSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $exists: true } } }
);

export const OrganizationModel = mongoose.model<IOrganization>(
  "Organization",
  organizationSchema
);
