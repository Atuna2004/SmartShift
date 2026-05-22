import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

const statusSchema = z.enum([
  "scheduled",
  "completed",
  "absent",
  "cancelled",
  "swapped",
  "leave_requested",
]);

export const createAssignedShiftSchema = z.object({
  body: z.object({
    organizationId: objectIdSchema.optional(),
    branchId: objectIdSchema,
    employeeId: objectIdSchema,
    shiftTemplateId: objectIdSchema,
    workDate: z.coerce.date(),
    shiftStartTime: timeSchema.optional(),
    shiftEndTime: timeSchema.optional(),
    published: z.boolean().optional(),
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateAssignedShiftSchema = z.object({
  body: z
    .object({
      employeeId: objectIdSchema.optional(),
      shiftTemplateId: objectIdSchema.optional(),
      workDate: z.coerce.date().optional(),
      shiftStartTime: timeSchema.optional(),
      shiftEndTime: timeSchema.optional(),
      status: statusSchema.optional(),
      published: z.boolean().optional(),
      note: z.string().trim().max(1000).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
  params: z.object({
    assignedShiftId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const assignedShiftIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    assignedShiftId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const weeklyScheduleSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    employeeId: objectIdSchema.optional(),
    weekStart: z.coerce.date(),
    published: z.coerce.boolean().optional(),
  }),
});

export const myScheduleSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    published: z.coerce.boolean().optional(),
  }),
});

export type CreateAssignedShiftInput = z.infer<
  typeof createAssignedShiftSchema
>["body"];
export type UpdateAssignedShiftInput = z.infer<
  typeof updateAssignedShiftSchema
>["body"];
export type WeeklyScheduleQuery = z.infer<typeof weeklyScheduleSchema>["query"];
export type MyScheduleQuery = z.infer<typeof myScheduleSchema>["query"];
