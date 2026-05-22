import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color");

const shiftTemplateBaseSchema = z.object({
  organizationId: objectIdSchema.optional(),
  branchId: objectIdSchema,
  name: z.string().trim().min(2, "Shift name must be at least 2 characters"),
  code: z.string().trim().min(1).max(32).toUpperCase().optional(),
  startTime: timeSchema,
  endTime: timeSchema,
  breakMinutes: z.number().int().min(0).max(1440).default(0),
  color: colorSchema.optional(),
  description: z.string().trim().max(1000).optional(),
});

export const createShiftTemplateSchema = z.object({
  body: shiftTemplateBaseSchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateShiftTemplateSchema = z.object({
  body: shiftTemplateBaseSchema
    .omit({ organizationId: true, branchId: true })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
  params: z.object({
    shiftTemplateId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const shiftTemplateIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    shiftTemplateId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const shiftTemplateListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    branchId: objectIdSchema.optional(),
    status: z.enum(["active", "disabled"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateShiftTemplateInput = z.infer<
  typeof createShiftTemplateSchema
>["body"];
export type UpdateShiftTemplateInput = z.infer<
  typeof updateShiftTemplateSchema
>["body"];
export type ShiftTemplateListQuery = z.infer<
  typeof shiftTemplateListSchema
>["query"];
