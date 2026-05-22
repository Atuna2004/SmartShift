import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const leaveStatusSchema = z.enum(["pending", "approved", "rejected", "cancelled"]);

export const createLeaveRequestSchema = z.object({
  body: z.object({
    scheduleId: objectIdSchema,
    reason: z.string().trim().min(1).max(1000),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateLeaveRequestSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().min(1).max(1000).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
  params: z.object({
    leaveRequestId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const reviewLeaveRequestSchema = z.object({
  body: z.object({
    managerNote: z.string().trim().max(1000).optional(),
  }),
  params: z.object({
    leaveRequestId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const leaveRequestIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    leaveRequestId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const leaveRequestListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    employeeId: objectIdSchema.optional(),
    status: leaveStatusSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateLeaveRequestInput = z.infer<
  typeof createLeaveRequestSchema
>["body"];
export type UpdateLeaveRequestInput = z.infer<
  typeof updateLeaveRequestSchema
>["body"];
export type ReviewLeaveRequestInput = z.infer<
  typeof reviewLeaveRequestSchema
>["body"];
export type LeaveRequestListQuery = z.infer<typeof leaveRequestListSchema>["query"];
