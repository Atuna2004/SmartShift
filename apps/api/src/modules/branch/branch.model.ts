import mongoose, { Schema, Document, Types } from "mongoose";

export type BranchStatus = "active" | "inactive";

export interface IBranch extends Document {
  name: string;
  code?: string;
  address: string;
  phone?: string;
  managerId?: Types.ObjectId;
  ownerId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  status: BranchStatus;
  qrCheckinEnabled: boolean;
  lateThresholdMinutes: number;
  timezone: string;
}

const branchSchema = new Schema<IBranch>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      unique: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
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

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },

    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    qrCheckinEnabled: {
      type: Boolean,
      default: true,
    },

    lateThresholdMinutes: {
      type: Number,
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

branchSchema.index({ ownerId: 1 });
branchSchema.index({ managerId: 1 });
branchSchema.index({ organizationId: 1 });
branchSchema.index({ code: 1 }, { unique: true });

export const BranchModel = mongoose.model<IBranch>(
  "Branch",
  branchSchema
);