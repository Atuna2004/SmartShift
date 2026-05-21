import mongoose, { Schema, Document, Types } from "mongoose";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "momo"
  | "vnpay";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface IPayment extends Document {
  subscriptionId: Types.ObjectId;
  ownerId: Types.ObjectId;
  branchId?: Types.ObjectId;
  organizationId?: Types.ObjectId;

  amount: number;
  currency: string;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  transactionCode?: string;
  paidAt?: Date;

  note?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },

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

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "VND",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "momo", "vnpay"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    transactionCode: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ ownerId: 1 });
paymentSchema.index({ branchId: 1 });
paymentSchema.index({ organizationId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ transactionCode: 1 });

export const PaymentModel =
  mongoose.model<IPayment>("Payment", paymentSchema);