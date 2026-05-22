import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const generateDailyQrSchema = z.object({
  body: z.object({
    branchId: objectIdSchema,
    validDate: z.coerce.date().optional(),
    expiresInSeconds: z.number().int().min(10).max(86400).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const verifyDailyQrSchema = z.object({
  body: z.object({
    qrToken: z.string().trim().min(1, "QR token is required"),
    branchId: objectIdSchema.optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export type GenerateDailyQrInput = z.infer<typeof generateDailyQrSchema>["body"];
export type VerifyDailyQrInput = z.infer<typeof verifyDailyQrSchema>["body"];
