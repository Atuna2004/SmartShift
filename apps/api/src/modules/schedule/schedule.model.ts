import mongoose, { Schema, Document, Types } from "mongoose";

export type ScheduleStatus =
  | "scheduled"
  | "completed"
  | "absent"
  | "cancelled"
  | "swapped"
  | "leave_requested";

export interface ISchedule extends Document {
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
}

const scheduleSchema = new Schema<ISchedule>(
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
  },
  {
    timestamps: true,
  }
);

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

export const ScheduleModel =
  mongoose.model<ISchedule>(
    "Schedule",
    scheduleSchema
  );