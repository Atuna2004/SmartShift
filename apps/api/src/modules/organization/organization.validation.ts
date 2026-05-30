import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL friendly");

const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    slug: slugSchema.optional(),
    businessType: z
      .enum(["cafe", "restaurant", "retail", "service", "other"])
      .optional(),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().email().optional(),
    address: z.string().trim().max(500).optional(),
    logo: z.string().trim().url().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const settingsSchema = z
  .object({
    timezone: z.string().trim().min(1).optional(),
    defaultLateThresholdMinutes: z.number().int().min(0).max(1440).optional(),
    defaultQrExpiresInSeconds: z.number().int().min(10).max(86400).optional(),
    defaultRequireGps: z.boolean().optional(),
    defaultAllowEarlyCheckInMinutes: z.number().int().min(0).max(1440).optional(),
    defaultAllowLateCheckOutMinutes: z.number().int().min(0).max(1440).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one settings field is required",
  });

const subscriptionInfoSchema = z
  .object({
    plan: z.enum(["free", "basic", "pro"]).optional(),
    status: z.enum(["trialing", "active", "past_due", "cancelled"]).optional(),
    startedAt: z.coerce.date().optional(),
    expiredAt: z.coerce.date().optional(),
    maxBranches: z.number().int().min(0).optional(),
    maxEmployees: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one subscription field is required",
  });

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    slug: slugSchema.optional(),
    businessType: z
      .enum(["cafe", "restaurant", "retail", "service", "other"])
      .optional(),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().email().optional(),
    address: z.string().trim().max(500).optional(),
    logo: z.string().trim().url().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const organizationQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    organizationId: objectIdSchema.optional(),
  }),
});

export const updateOrganizationProfileSchema = z.object({
  body: profileSchema,
  params: z.object({}).optional(),
  query: z.object({
    organizationId: objectIdSchema.optional(),
  }),
});

export const configureOrganizationSettingsSchema = z.object({
  body: settingsSchema,
  params: z.object({}).optional(),
  query: z.object({
    organizationId: objectIdSchema.optional(),
  }),
});

export const configureOrganizationSubscriptionSchema = z.object({
  body: subscriptionInfoSchema,
  params: z.object({}).optional(),
  query: z.object({
    organizationId: objectIdSchema.optional(),
  }),
});

export const setOrganizationStatusSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    organizationId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>["body"];
export type OrganizationQuery = z.infer<typeof organizationQuerySchema>["query"];
export type UpdateOrganizationProfileInput = z.infer<
  typeof updateOrganizationProfileSchema
>["body"];
export type ConfigureOrganizationSettingsInput = z.infer<
  typeof configureOrganizationSettingsSchema
>["body"];
export type ConfigureOrganizationSubscriptionInput = z.infer<
  typeof configureOrganizationSubscriptionSchema
>["body"];
