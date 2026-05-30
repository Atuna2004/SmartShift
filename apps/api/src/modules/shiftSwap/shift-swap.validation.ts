import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const finalStatusSchema = z.enum([
  "pending_receiver",
  "pending_manager",
  "approved",
  "rejected",
  "cancelled",
]);
const receiverStatusSchema = z.enum(["pending", "accepted", "rejected"]);
const managerStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const createShiftSwapSchema = z.object({
  body: z.object({
    toEmployeeId: objectIdSchema,
    fromScheduleId: objectIdSchema,
    toScheduleId: objectIdSchema.optional(),
    reason: z.string().trim().max(1000).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const receiverShiftSwapSchema = z.object({
  body: z.object({
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({
    shiftSwapId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const managerShiftSwapSchema = z.object({
  body: z.object({
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({
    shiftSwapId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const shiftSwapIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    shiftSwapId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const shiftSwapListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    employeeId: objectIdSchema.optional(),
    fromEmployeeId: objectIdSchema.optional(),
    toEmployeeId: objectIdSchema.optional(),
    fromScheduleId: objectIdSchema.optional(),
    toScheduleId: objectIdSchema.optional(),
    managerId: objectIdSchema.optional(),
    finalStatus: finalStatusSchema.optional(),
    receiverStatus: receiverStatusSchema.optional(),
    managerStatus: managerStatusSchema.optional(),
    createdFrom: z.coerce.date().optional(),
    createdTo: z.coerce.date().optional(),
    respondedFrom: z.coerce.date().optional(),
    respondedTo: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateShiftSwapInput = z.infer<typeof createShiftSwapSchema>["body"];
export type ReceiverShiftSwapInput = z.infer<typeof receiverShiftSwapSchema>["body"];
export type ManagerShiftSwapInput = z.infer<typeof managerShiftSwapSchema>["body"];
export type ShiftSwapListQuery = z.infer<typeof shiftSwapListSchema>["query"];
