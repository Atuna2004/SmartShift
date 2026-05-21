import mongoose, { Schema, Document, Types } from "mongoose";

export type PlanType = "basic" | "organization";
export type BillingCycle = "monthly" | "yearly";
export type SubscriptionStatus =
  | "trial"
  | "active"
  | "expired"
  | "cancelled";

export interface ISubscription extends Document {
  ownerId: Types.ObjectId;
  branchId?: Types.ObjectId;
  organizationId?: Types.ObjectId;

  planName: string;
  planType: PlanType;
  billingCycle: BillingCycle;

  price: number;
  currency: string;

  startDate: Date;
  endDate: Date;

  status: SubscriptionStatus;

  maxBranches: number;
  maxEmployees: number;

  autoRenew: boolean;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },

    planName: {
      type: String,
      required: true,
      trim: true,
    },

    planType: {
      type: String,
      enum: ["basic", "organization"],
      required: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "VND",
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["trial", "active", "expired", "cancelled"],
      default: "trial",
    },

    maxBranches: {
      type: Number,
      default: 1,
    },

    maxEmployees: {
      type: Number,
      default: 30,
    },

    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ ownerId: 1 });
subscriptionSchema.index({ branchId: 1 });
subscriptionSchema.index({ organizationId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

export const SubscriptionModel =
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);