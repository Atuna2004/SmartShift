import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const paymentMethodSchema = z.enum(["payos", "cash", "bank_transfer"]);

export const createSubscriptionPaymentSchema = z.object({
  body: z.object({
    organizationId: objectIdSchema,
    planId: objectIdSchema,
    months: z.number().int().min(1).max(36).default(1),
    paymentMethod: paymentMethodSchema.default("payos"),
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const calculatePayrollSchema = z.object({
  body: z.object({
    organizationId: objectIdSchema.optional(),
    employeeId: objectIdSchema,
    from: z.coerce.date(),
    to: z.coerce.date(),
    hourlyRate: z.number().min(0).optional(),
    overtimeMultiplier: z.number().min(0).default(1.5),
    deductionRatePerMinute: z.number().min(0).default(0),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const createPayrollPaymentSchema = z.object({
  body: z.object({
    organizationId: objectIdSchema.optional(),
    employeeId: objectIdSchema,
    from: z.coerce.date(),
    to: z.coerce.date(),
    hourlyRate: z.number().min(0).optional(),
    overtimeMultiplier: z.number().min(0).default(1.5),
    deductionRatePerMinute: z.number().min(0).default(0),
    paymentMethod: paymentMethodSchema.default("bank_transfer"),
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const paymentListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    organizationId: objectIdSchema.optional(),
    purpose: z.enum(["subscription", "payroll", "other"]).optional(),
    paymentStatus: z
      .enum(["pending", "paid", "failed", "cancelled", "expired", "refunded"])
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const paymentIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    paymentId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const markPaymentPaidSchema = z.object({
  body: z.object({
    transactionCode: z.string().trim().max(120).optional(),
    note: z.string().trim().max(1000).optional(),
  }),
  params: z.object({
    paymentId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const webhookSchema = z.object({
  body: z.record(z.string(), z.unknown()),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export type CreateSubscriptionPaymentInput = z.infer<
  typeof createSubscriptionPaymentSchema
>["body"];
export type CalculatePayrollInput = z.infer<typeof calculatePayrollSchema>["body"];
export type CreatePayrollPaymentInput = z.infer<
  typeof createPayrollPaymentSchema
>["body"];
export type PaymentListQuery = z.infer<typeof paymentListSchema>["query"];
export type MarkPaymentPaidInput = z.infer<typeof markPaymentPaidSchema>["body"];
