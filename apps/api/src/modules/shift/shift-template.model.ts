import mongoose, { Schema, Document, Types } from "mongoose";

export interface IShiftTemplate extends Document {
  branchId: Types.ObjectId;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  lateThresholdMinutes: number;
  maxStaffPerShift: number;
  color?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
}

const shiftTemplateSchema = new Schema<IShiftTemplate>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    breakMinutes: {
      type: Number,
      default: 0,
    },

    lateThresholdMinutes: {
      type: Number,
      default: 15,
    },

    maxStaffPerShift: {
      type: Number,
      default: 1,
    },

    color: {
      type: String,
      default: "#4F46E5",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

shiftTemplateSchema.index({ branchId: 1 });
shiftTemplateSchema.index({ branchId: 1, name: 1 });

export const ShiftTemplateModel =
  mongoose.model<IShiftTemplate>(
    "ShiftTemplate",
    shiftTemplateSchema
  );