import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const notificationTypeSchema = z.enum([
  "schedule_published",
  "shift_changed",
  "shift_swap_requested",
  "shift_swap_accepted",
  "shift_swap_rejected",
  "leave_requested",
  "leave_approved",
  "leave_rejected",
  "checkin_reminder",
  "checkout_reminder",
  "attendance_warning",
  "compensation_bonus",
  "compensation_penalty",
  "system",
]);

export const createNotificationSchema = z
  .object({
    body: z
      .object({
        userIds: z.array(objectIdSchema).min(1).max(100).optional(),
        branchId: objectIdSchema.optional(),
        title: z.string().trim().min(1).max(200),
        message: z.string().trim().min(1).max(2000),
        type: notificationTypeSchema.default("system"),
        relatedId: objectIdSchema.optional(),
        relatedModel: z.string().trim().min(1).max(100).optional(),
      })
      .refine((value) => value.userIds || value.branchId, {
        message: "Either userIds or branchId is required",
      }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  });

export const notificationListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    isRead: z.coerce.boolean().optional(),
    type: notificationTypeSchema.optional(),
    includeArchived: z.coerce.boolean().default(false),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const notificationIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    notificationId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export type CreateNotificationInput = z.infer<
  typeof createNotificationSchema
>["body"];
export type NotificationListQuery = z.infer<typeof notificationListSchema>["query"];
