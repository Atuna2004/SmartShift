import mongoose, { Schema, Document, Types } from "mongoose";

export type DailyQrCodeStatus = "active" | "expired" | "revoked";

export interface IDailyQrCode extends Document {
  branchId: Types.ObjectId;
  qrToken: string;
  validDate: Date;
  expiresAt: Date;
  status: DailyQrCodeStatus;
  createdBy: Types.ObjectId;
}

const dailyQrCodeSchema = new Schema<IDailyQrCode>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    qrToken: {
      type: String,
      required: true,
      unique: true,
    },

    validDate: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

dailyQrCodeSchema.index({ branchId: 1, validDate: 1 });
dailyQrCodeSchema.index({ qrToken: 1 }, { unique: true });
dailyQrCodeSchema.index({ expiresAt: 1 });

export const DailyQrCodeModel =
  mongoose.model<IDailyQrCode>("DailyQrCode", dailyQrCodeSchema);