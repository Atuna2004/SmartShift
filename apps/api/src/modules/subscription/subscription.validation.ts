import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const positiveLimitSchema = z.number().int().min(0);

const limitsSchema = z.object({
  maxBranches: positiveLimitSchema,
  maxEmployees: positiveLimitSchema,
  maxManagers: positiveLimitSchema,
  maxShiftTemplates: positiveLimitSchema.optional(),
  maxAssignedShiftsPerMonth: positiveLimitSchema.optional(),
});

const featuresSchema = z.object({
  qrCheckIn: z.boolean(),
  gpsValidation: z.boolean(),
  attendanceReports: z.boolean(),
  shiftSwap: z.boolean(),
  payroll: z.boolean(),
});

const planBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(32).toLowerCase(),
  description: z.string().trim().max(1000).optional(),
  priceMonthly: z.number().min(0),
  currency: z.enum(["VND", "USD"]).default("VND"),
  limits: limitsSchema,
  features: featuresSchema,
});

export const createSubscriptionPlanSchema = z.object({
  body: planBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateSubscriptionPlanSchema = z.object({
  body: planBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  }),
  params: z.object({
    planId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const subscriptionPlanIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    planId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const subscriptionPlanListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    status: z.enum(["active", "disabled"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const subscribeOrganizationSchema = z.object({
  body: z.object({
    planId: objectIdSchema,
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    autoRenew: z.boolean().optional(),
  }),
  params: z.object({
    organizationId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const organizationSubscriptionSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    organizationId: objectIdSchema.optional(),
  }),
});

export const changeSubscriptionPlanSchema = z.object({
  body: z.object({
    organizationId: objectIdSchema.optional(),
    planId: objectIdSchema,
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const cancelSubscriptionSchema = z.object({
  body: z.object({
    organizationId: objectIdSchema.optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const renewSubscriptionSchema = z.object({
  body: z.object({
    organizationId: objectIdSchema.optional(),
    months: z.number().int().min(1).max(36).default(1),
    autoRenew: z.boolean().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const checkSubscriptionLimitsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    organizationId: objectIdSchema.optional(),
    feature: z
      .enum([
        "qrCheckIn",
        "gpsValidation",
        "attendanceReports",
        "shiftSwap",
        "payroll",
      ])
      .optional(),
  }),
});

export type CreateSubscriptionPlanInput = z.infer<
  typeof createSubscriptionPlanSchema
>["body"];
export type UpdateSubscriptionPlanInput = z.infer<
  typeof updateSubscriptionPlanSchema
>["body"];
export type SubscriptionPlanListQuery = z.infer<
  typeof subscriptionPlanListSchema
>["query"];
export type SubscribeOrganizationInput = z.infer<
  typeof subscribeOrganizationSchema
>["body"];
export type ChangeSubscriptionPlanInput = z.infer<
  typeof changeSubscriptionPlanSchema
>["body"];
export type CancelSubscriptionInput = z.infer<
  typeof cancelSubscriptionSchema
>["body"];
export type RenewSubscriptionInput = z.infer<
  typeof renewSubscriptionSchema
>["body"];
export type OrganizationSubscriptionQuery = z.infer<
  typeof organizationSubscriptionSchema
>["query"];
export type CheckSubscriptionLimitsQuery = z.infer<
  typeof checkSubscriptionLimitsSchema
>["query"];
