import mongoose, { Schema, Document, Types } from "mongoose";

export type ScheduleStatus =
  | "scheduled"
  | "completed"
  | "absent"
  | "cancelled"
  | "swapped"
  | "leave_requested";

export interface ISchedule extends Document {
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;
  employeeId: Types.ObjectId;
  shiftTemplateId: Types.ObjectId;
  workDate: Date;
  shiftStartTime: string;
  shiftEndTime: string;
  status: ScheduleStatus;
  published: boolean;
  note?: string;
  assignedBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedAt?: Date;
}

const scheduleSchema = new Schema<ISchedule>(
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

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shiftTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "ShiftTemplate",
      required: true,
    },

    workDate: {
      type: Date,
      required: true,
    },

    shiftStartTime: {
      type: String,
      required: true,
    },

    shiftEndTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "absent",
        "cancelled",
        "swapped",
        "leave_requested",
      ],
      default: "scheduled",
    },

    published: {
      type: Boolean,
      default: false,
    },

    note: {
      type: String,
      trim: true,
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({
  organizationId: 1,
  branchId: 1,
  workDate: 1,
});

scheduleSchema.index({
  employeeId: 1,
  workDate: 1,
});

scheduleSchema.index({
  branchId: 1,
  workDate: 1,
});

scheduleSchema.index({
  branchId: 1,
  employeeId: 1,
  workDate: 1,
});

scheduleSchema.index({ deletedAt: 1 });

export const ScheduleModel =
  mongoose.model<ISchedule>(
    "Schedule",
    scheduleSchema
  );
