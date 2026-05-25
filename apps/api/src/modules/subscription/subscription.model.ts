import mongoose, { Document, Schema, Types } from "mongoose";

export type SubscriptionPlanCode = "free" | "basic" | "pro" | string;
export type SubscriptionCurrency = "VND" | "USD";
export type SubscriptionPlanStatus = "active" | "disabled";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export type SubscriptionLimits = {
  maxBranches: number;
  maxEmployees: number;
  maxManagers: number;
  maxShiftTemplates?: number;
  maxAssignedShiftsPerMonth?: number;
};

export type SubscriptionFeatures = {
  qrCheckIn: boolean;
  gpsValidation: boolean;
  attendanceReports: boolean;
  shiftSwap: boolean;
  payroll: boolean;
};

export interface ISubscriptionPlan extends Document {
  name: string;
  code: SubscriptionPlanCode;
  description?: string;
  priceMonthly: number;
  currency: SubscriptionCurrency;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  status: SubscriptionPlanStatus;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedAt?: Date;
}

export interface ISubscription extends Document {
  organizationId: Types.ObjectId;
  ownerId: Types.ObjectId;
  planId: Types.ObjectId;
  planCode: string;
  planName: string;
  priceMonthly: number;
  currency: SubscriptionCurrency;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  autoRenew: boolean;
  cancelledAt?: Date;
  renewedAt?: Date;
  changedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const limitsSchema = new Schema<SubscriptionLimits>(
  {
    maxBranches: { type: Number, required: true, min: 0 },
    maxEmployees: { type: Number, required: true, min: 0 },
    maxManagers: { type: Number, required: true, min: 0 },
    maxShiftTemplates: { type: Number, min: 0 },
    maxAssignedShiftsPerMonth: { type: Number, min: 0 },
  },
  { _id: false }
);

const featuresSchema = new Schema<SubscriptionFeatures>(
  {
    qrCheckIn: { type: Boolean, required: true, default: false },
    gpsValidation: { type: Boolean, required: true, default: false },
    attendanceReports: { type: Boolean, required: true, default: false },
    shiftSwap: { type: Boolean, required: true, default: false },
    payroll: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    priceMonthly: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["VND", "USD"], default: "VND" },
    limits: { type: limitsSchema, required: true },
    features: { type: featuresSchema, required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const subscriptionSchema = new Schema<ISubscription>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    planCode: { type: String, required: true, trim: true, lowercase: true },
    planName: { type: String, required: true, trim: true },
    priceMonthly: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["VND", "USD"], default: "VND" },
    limits: { type: limitsSchema, required: true },
    features: { type: featuresSchema, required: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    autoRenew: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    renewedAt: { type: Date },
    changedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

subscriptionPlanSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { deletedAt: { $exists: false } } }
);
subscriptionPlanSchema.index({ status: 1 });
subscriptionPlanSchema.index({ deletedAt: 1 });

subscriptionSchema.index({ organizationId: 1, status: 1 });
subscriptionSchema.index({ ownerId: 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ endDate: 1 });

export const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);

export const SubscriptionModel = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
