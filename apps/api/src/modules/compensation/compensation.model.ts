import mongoose, { Document, Schema, Types } from "mongoose";

export type OvertimeRequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type CompensationAdjustmentType = "bonus" | "penalty";

export interface IOvertimeRequest extends Document {
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;
  employeeId: Types.ObjectId;
  workDate: Date;
  startTime: string;
  endTime: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  reason: string;
  status: OvertimeRequestStatus;
  requestedAt: Date;
  reviewedBy?: Types.ObjectId;
  managerNote?: string;
  respondedAt?: Date;
}

export interface ICompensationAdjustment extends Document {
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;
  employeeId: Types.ObjectId;
  type: CompensationAdjustmentType;
  amount: number;
  reason: string;
  effectiveDate: Date;
  createdBy: Types.ObjectId;
  note?: string;
}

const overtimeRequestSchema = new Schema<IOvertimeRequest>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workDate: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0.25 },
    hourlyRate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    managerNote: { type: String, trim: true },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

const compensationAdjustmentSchema = new Schema<ICompensationAdjustment>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["bonus", "penalty"], required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    effectiveDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

overtimeRequestSchema.index({ organizationId: 1, status: 1, workDate: -1 });
overtimeRequestSchema.index({ branchId: 1, status: 1, workDate: -1 });
overtimeRequestSchema.index({ employeeId: 1, workDate: -1 });

compensationAdjustmentSchema.index({ organizationId: 1, effectiveDate: -1 });
compensationAdjustmentSchema.index({ branchId: 1, effectiveDate: -1 });
compensationAdjustmentSchema.index({ employeeId: 1, effectiveDate: -1 });
compensationAdjustmentSchema.index({ type: 1 });

export const OvertimeRequestModel = mongoose.model<IOvertimeRequest>(
  "OvertimeRequest",
  overtimeRequestSchema
);

export const CompensationAdjustmentModel = mongoose.model<ICompensationAdjustment>(
  "CompensationAdjustment",
  compensationAdjustmentSchema
);
