import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

export const createResourceSchema = z.object({
  body: z.record(z.string(), z.unknown()).refine((body) => Object.keys(body).length > 0, {
    message: "Request body is required",
  }),
});

export const updateResourceSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.record(z.string(), z.unknown()).refine((body) => Object.keys(body).length > 0, {
    message: "Request body is required",
  }),
});

export const resourceIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const listResourceSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});
