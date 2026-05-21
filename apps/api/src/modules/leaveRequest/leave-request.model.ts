import mongoose, { Schema, Document, Types } from "mongoose";

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ILeaveRequest extends Document {
  branchId: Types.ObjectId;
  employeeId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  reason: string;
  status: LeaveRequestStatus;
  requestedAt: Date;
  approvedBy?: Types.ObjectId;
  managerNote?: string;
  respondedAt?: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    managerNote: {
      type: String,
      trim: true,
    },

    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({ branchId: 1, status: 1 });
leaveRequestSchema.index({ employeeId: 1 });
leaveRequestSchema.index({ scheduleId: 1 });
leaveRequestSchema.index({ approvedBy: 1 });

export const LeaveRequestModel =
  mongoose.model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);