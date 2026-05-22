import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

const locationSchema = z
  .object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    radiusMeters: z.number().int().min(1).max(5000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one location field is required",
  });

const settingsSchema = z
  .object({
    timezone: z.string().trim().min(1).optional(),
    openingTime: timeSchema.optional(),
    closingTime: timeSchema.optional(),
    workingDays: z.array(z.string().trim().min(1)).max(7).optional(),
    allowEarlyCheckInMinutes: z.number().int().min(0).max(1440).optional(),
    allowLateCheckOutMinutes: z.number().int().min(0).max(1440).optional(),
    requireCheckout: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one settings field is required",
  });

const qrSettingsSchema = z
  .object({
    enabled: z.boolean().optional(),
    refreshIntervalSeconds: z.number().int().min(10).max(86400).optional(),
    requireGps: z.boolean().optional(),
    qrExpiresInSeconds: z.number().int().min(10).max(86400).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one QR settings field is required",
  });

const branchBaseSchema = z.object({
  organizationId: objectIdSchema.optional(),
  name: z.string().trim().min(2, "Branch name must be at least 2 characters"),
  code: z.string().trim().min(1).max(32).toUpperCase().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  description: z.string().trim().max(1000).optional(),
  location: locationSchema.optional(),
  settings: settingsSchema.optional(),
  qrSettings: qrSettingsSchema.optional(),
  attendanceSettings: z
    .object({
      lateThresholdMinutes: z.number().int().min(0).max(1440),
    })
    .optional(),
});

export const createBranchSchema = z.object({
  body: branchBaseSchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateBranchSchema = z.object({
  body: branchBaseSchema
    .omit({ organizationId: true })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
  params: z.object({
    branchId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const branchIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    branchId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const branchListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    status: z.enum(["active", "disabled"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const configureBranchSettingsSchema = z.object({
  body: settingsSchema,
  params: z.object({
    branchId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const configureQrSettingsSchema = z.object({
  body: qrSettingsSchema,
  params: z.object({
    branchId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const configureLateThresholdSchema = z.object({
  body: z.object({
    lateThresholdMinutes: z.number().int().min(0).max(1440),
  }),
  params: z.object({
    branchId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>["body"];
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>["body"];
export type BranchListQuery = z.infer<typeof branchListSchema>["query"];
export type ConfigureBranchSettingsInput = z.infer<
  typeof configureBranchSettingsSchema
>["body"];
export type ConfigureQrSettingsInput = z.infer<typeof configureQrSettingsSchema>["body"];
export type ConfigureLateThresholdInput = z.infer<
  typeof configureLateThresholdSchema
>["body"];
