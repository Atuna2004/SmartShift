import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");
const dateSchema = z.coerce.date();

export const ownerReportSummarySchema = z.object({
  query: z.object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    branchId: objectIdSchema.optional(),
  }),
});

export type OwnerReportSummaryQuery = z.infer<typeof ownerReportSummarySchema>["query"];
