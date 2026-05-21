import mongoose, { Schema, Document, Types } from "mongoose";

export type AttendanceStatus =
  | "on_time"
  | "late"
  | "absent"
  | "early_leave"
  | "overtime";

export interface IAttendance extends Document {
  branchId: Types.ObjectId;
  employeeId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  shiftTemplateId: Types.ObjectId;
  workDate: Date;

  scheduledStartTime: string;
  scheduledEndTime: string;

  checkInTime?: Date;
  checkOutTime?: Date;

  attendanceStatus: AttendanceStatus;

  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;

  qrCodeId?: Types.ObjectId;

  note?: string;

  approvedBy?: Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
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

    shiftTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "ShiftTemplate",
      required: true,
    },

    workDate: {
      type: Date,
      required: true,
    },

    scheduledStartTime: {
      type: String,
      required: true,
    },

    scheduledEndTime: {
      type: String,
      required: true,
    },

    checkInTime: {
      type: Date,
    },

    checkOutTime: {
      type: Date,
    },

    attendanceStatus: {
      type: String,
      enum: [
        "on_time",
        "late",
        "absent",
        "early_leave",
        "overtime",
      ],
      default: "on_time",
    },

    lateMinutes: {
      type: Number,
      default: 0,
    },

    earlyLeaveMinutes: {
      type: Number,
      default: 0,
    },

    overtimeMinutes: {
      type: Number,
      default: 0,
    },

    qrCodeId: {
      type: Schema.Types.ObjectId,
      ref: "DailyQrCode",
    },

    note: {
      type: String,
      trim: true,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({
  employeeId: 1,
  workDate: 1,
});

attendanceSchema.index({
  branchId: 1,
  workDate: 1,
});

attendanceSchema.index({
  scheduleId: 1
});

export const AttendanceModel =
  mongoose.model<IAttendance>(
    "Attendance",
    attendanceSchema
  );