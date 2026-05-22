import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const checkInSchema = z.object({
  body: z.object({
    qrToken: z.string().trim().min(1, "QR token is required"),
    scheduleId: objectIdSchema,
    checkInTime: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const checkOutSchema = z.object({
  body: z.object({
    qrToken: z.string().trim().min(1, "QR token is required"),
    scheduleId: objectIdSchema,
    checkOutTime: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const manualCorrectionSchema = z.object({
  body: z.object({
    scheduleId: objectIdSchema,
    employeeId: objectIdSchema.optional(),
    checkInTime: z.coerce.date().optional(),
    checkOutTime: z.coerce.date().optional(),
    note: z.string().trim().max(1000).optional(),
    correctionReason: z.string().trim().min(1).max(1000),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const approveManualAttendanceSchema = z.object({
  body: z.object({
    approved: z.boolean(),
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({
    attendanceId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const autoMarkAbsentSchema = z.object({
  body: z.object({
    branchId: objectIdSchema.optional(),
    workDate: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const attendanceHistorySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    employeeId: objectIdSchema.optional(),
    from: z.coerce.date(),
    to: z.coerce.date(),
    status: z
      .enum(["on_time", "late", "absent", "early_leave", "overtime"])
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const attendanceAlertSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    workDate: z.coerce.date().optional(),
  }),
});

export type CheckInInput = z.infer<typeof checkInSchema>["body"];
export type CheckOutInput = z.infer<typeof checkOutSchema>["body"];
export type ManualCorrectionInput = z.infer<typeof manualCorrectionSchema>["body"];
export type ApproveManualAttendanceInput = z.infer<
  typeof approveManualAttendanceSchema
>["body"];
export type AutoMarkAbsentInput = z.infer<typeof autoMarkAbsentSchema>["body"];
export type AttendanceHistoryQuery = z.infer<typeof attendanceHistorySchema>["query"];
export type AttendanceAlertQuery = z.infer<typeof attendanceAlertSchema>["query"];
