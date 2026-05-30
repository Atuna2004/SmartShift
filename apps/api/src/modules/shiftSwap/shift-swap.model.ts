import mongoose, { Schema, Document, Types } from "mongoose";

export type ReceiverStatus = "pending" | "accepted" | "rejected";
export type ManagerStatus = "pending" | "approved" | "rejected";
export type ShiftSwapFinalStatus =
  | "pending_receiver"
  | "pending_manager"
  | "approved"
  | "rejected"
  | "cancelled";

export interface IShiftSwapRequest extends Document {
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;

  fromEmployeeId: Types.ObjectId;
  toEmployeeId: Types.ObjectId;

  fromScheduleId: Types.ObjectId;
  toScheduleId?: Types.ObjectId;

  reason?: string;

  receiverStatus: ReceiverStatus;
  receiverRespondedAt?: Date;

  managerStatus: ManagerStatus;
  managerId?: Types.ObjectId;
  managerRespondedAt?: Date;

  finalStatus: ShiftSwapFinalStatus;

  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSwapRequestSchema = new Schema<IShiftSwapRequest>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    fromEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fromScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },

    toScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
    },

    reason: {
      type: String,
      trim: true,
    },

    receiverStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    receiverRespondedAt: {
      type: Date,
    },

    managerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    managerRespondedAt: {
      type: Date,
    },

    finalStatus: {
      type: String,
      enum: [
        "pending_receiver",
        "pending_manager",
        "approved",
        "rejected",
        "cancelled",
      ],
      default: "pending_receiver",
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

shiftSwapRequestSchema.index({ organizationId: 1, finalStatus: 1 });
shiftSwapRequestSchema.index({ branchId: 1, finalStatus: 1 });
shiftSwapRequestSchema.index({ fromEmployeeId: 1 });
shiftSwapRequestSchema.index({ toEmployeeId: 1 });
shiftSwapRequestSchema.index({ fromScheduleId: 1 });
shiftSwapRequestSchema.index({ managerId: 1 });

export const ShiftSwapRequestModel =
  mongoose.model<IShiftSwapRequest>(
    "ShiftSwapRequest",
    shiftSwapRequestSchema
  );
