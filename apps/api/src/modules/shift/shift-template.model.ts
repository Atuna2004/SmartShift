import mongoose, { Schema, Document, Types } from "mongoose";

export type ShiftTemplateStatus = "active" | "disabled";

export interface IShiftTemplate extends Document {
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  color?: string;
  description?: string;
  status: ShiftTemplateStatus;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedAt?: Date;
}

const shiftTemplateSchema = new Schema<IShiftTemplate>(
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

    color: {
      type: String,
      default: "#4F46E5",
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

shiftTemplateSchema.index({ organizationId: 1, branchId: 1, status: 1 });
shiftTemplateSchema.index({ branchId: 1, deletedAt: 1 });
shiftTemplateSchema.index(
  { branchId: 1, code: 1 },
  {
    unique: true,
    partialFilterExpression: {
      code: { $exists: true },
      deletedAt: { $exists: false },
    },
  }
);
shiftTemplateSchema.index({ branchId: 1, name: 1 });

export const ShiftTemplateModel =
  mongoose.model<IShiftTemplate>(
    "ShiftTemplate",
    shiftTemplateSchema
  );
