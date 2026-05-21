import mongoose, { Schema, Document, Types } from "mongoose";

export type OrganizationStatus =
  | "active"
  | "inactive"
  | "suspended";

export interface IOrganization extends Document {
  name: string;
  ownerId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;

  email?: string;
  phone?: string;
  address?: string;

  status: OrganizationStatus;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ subscriptionId: 1 });
organizationSchema.index({ status: 1 });

export const OrganizationModel =
  mongoose.model<IOrganization>("Organization", organizationSchema);