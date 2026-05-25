import mongoose, { Document, Schema, Types } from "mongoose";

export type PaymentPurpose = "subscription" | "payroll" | "other";
export type PaymentProvider = "payos" | "manual";
export type PaymentMethod = "payos" | "cash" | "bank_transfer";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export interface IPayment extends Document {
  purpose: PaymentPurpose;
  provider: PaymentProvider;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  organizationId: Types.ObjectId;
  ownerId: Types.ObjectId;
  branchId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  employeeId?: Types.ObjectId;

  amount: number;
  currency: "VND" | "USD";
  months?: number;

  orderCode: number;
  transactionCode?: string;
  checkoutUrl?: string;
  payosPaymentLinkId?: string;

  payrollPeriodStart?: Date;
  payrollPeriodEnd?: Date;
  payrollMeta?: {
    hourlyRate: number;
    workedHours: number;
    overtimeHours: number;
    lateMinutes: number;
    overtimeMultiplier: number;
    deductionRatePerMinute: number;
    basePay: number;
    overtimePay: number;
    deductions: number;
    attendanceCount: number;
  };

  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  failedAt?: Date;
  note?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const payrollMetaSchema = new Schema(
  {
    hourlyRate: { type: Number, required: true, min: 0 },
    workedHours: { type: Number, required: true, min: 0 },
    overtimeHours: { type: Number, required: true, min: 0 },
    lateMinutes: { type: Number, required: true, min: 0 },
    overtimeMultiplier: { type: Number, required: true, min: 0 },
    deductionRatePerMinute: { type: Number, required: true, min: 0 },
    basePay: { type: Number, required: true, min: 0 },
    overtimePay: { type: Number, required: true, min: 0 },
    deductions: { type: Number, required: true, min: 0 },
    attendanceCount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const paymentSchema = new Schema<IPayment>(
  {
    purpose: {
      type: String,
      enum: ["subscription", "payroll", "other"],
      required: true,
    },
    provider: {
      type: String,
      enum: ["payos", "manual"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["payos", "cash", "bank_transfer"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "expired", "refunded"],
      default: "pending",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
    employeeId: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["VND", "USD"], default: "VND" },
    months: { type: Number, min: 1 },
    orderCode: { type: Number, required: true, unique: true },
    transactionCode: { type: String, trim: true },
    checkoutUrl: { type: String, trim: true },
    payosPaymentLinkId: { type: String, trim: true },
    payrollPeriodStart: { type: Date },
    payrollPeriodEnd: { type: Date },
    payrollMeta: { type: payrollMetaSchema },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
    refundedAt: { type: Date },
    failedAt: { type: Date },
    note: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

paymentSchema.index({ organizationId: 1, paymentStatus: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ employeeId: 1, payrollPeriodStart: 1, payrollPeriodEnd: 1 });
paymentSchema.index({ ownerId: 1 });
paymentSchema.index({ purpose: 1 });
paymentSchema.index({ transactionCode: 1 });

export const PaymentModel = mongoose.model<IPayment>("Payment", paymentSchema);
