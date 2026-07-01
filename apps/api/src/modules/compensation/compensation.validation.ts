import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format");

export const overtimeStatusSchema = z.enum(["pending", "approved", "rejected", "cancelled"]);
export const adjustmentTypeSchema = z.enum(["bonus", "penalty"]);

export const createOvertimeRequestSchema = z.object({
  body: z.object({
    employeeId: objectIdSchema.optional(),
    branchId: objectIdSchema.optional(),
    workDate: z.coerce.date(),
    startTime: timeSchema,
    endTime: timeSchema,
    hours: z.coerce.number().min(0.25).max(24).optional(),
    hourlyRate: z.coerce.number().min(0).optional(),
    reason: z.string().trim().min(1).max(1000),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const overtimeListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    employeeId: objectIdSchema.optional(),
    status: overtimeStatusSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const overtimeIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ overtimeId: objectIdSchema }),
  query: z.object({}).optional(),
});

export const reviewOvertimeRequestSchema = z.object({
  body: z.object({
    hourlyRate: z.coerce.number().min(0).optional(),
    managerNote: z.string().trim().max(1000).optional(),
  }),
  params: z.object({ overtimeId: objectIdSchema }),
  query: z.object({}).optional(),
});

export const createAdjustmentSchema = z.object({
  body: z.object({
    employeeId: objectIdSchema,
    branchId: objectIdSchema.optional(),
    type: adjustmentTypeSchema,
    amount: z.coerce.number().min(1),
    reason: z.string().trim().min(1).max(1000),
    effectiveDate: z.coerce.date(),
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const adjustmentListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    employeeId: objectIdSchema.optional(),
    type: adjustmentTypeSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const adjustmentIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ adjustmentId: objectIdSchema }),
  query: z.object({}).optional(),
});

export const compensationSummarySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    employeeId: objectIdSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export type CreateOvertimeRequestInput = z.infer<typeof createOvertimeRequestSchema>["body"];
export type OvertimeListQuery = z.infer<typeof overtimeListSchema>["query"];
export type ReviewOvertimeRequestInput = z.infer<typeof reviewOvertimeRequestSchema>["body"];
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>["body"];
export type AdjustmentListQuery = z.infer<typeof adjustmentListSchema>["query"];
export type CompensationSummaryQuery = z.infer<typeof compensationSummarySchema>["query"];
