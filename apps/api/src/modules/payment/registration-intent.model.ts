import mongoose, { Document, Schema, Types } from "mongoose";
import type { OrganizationBusinessType } from "../organization/organization.model.js";

export type RegistrationIntentStatus = "pending" | "paid" | "expired" | "failed";

export interface IRegistrationIntent extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  organization: {
    name: string;
    businessType?: OrganizationBusinessType;
    phone?: string;
    email?: string;
    address?: string;
  };
  branch: {
    name: string;
    address?: string;
    phone?: string;
  };
  planId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  status: RegistrationIntentStatus;
  completionTokenHash: string;
  expiresAt: Date;
  paidAt?: Date;
  completedAt?: Date;
  userId?: Types.ObjectId;
  organizationId?: Types.ObjectId;
  branchId?: Types.ObjectId;
}

const registrationIntentSchema = new Schema<IRegistrationIntent>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    organization: {
      name: { type: String, required: true, trim: true },
      businessType: {
        type: String,
        enum: ["cafe", "restaurant", "retail", "service", "other"],
      },
      phone: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      address: { type: String, trim: true },
    },
    branch: {
      name: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    status: {
      type: String,
      enum: ["pending", "paid", "expired", "failed"],
      default: "pending",
    },
    completionTokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    paidAt: { type: Date },
    completedAt: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  { timestamps: true }
);

registrationIntentSchema.index({ email: 1, status: 1 });
registrationIntentSchema.index({ paymentId: 1 });
registrationIntentSchema.index({ expiresAt: 1 });

export const RegistrationIntentModel = mongoose.model<IRegistrationIntent>(
  "RegistrationIntent",
  registrationIntentSchema
);
