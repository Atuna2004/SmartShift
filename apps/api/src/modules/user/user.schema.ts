import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const roleSchema = z.enum(["manager", "staff"]);
const employeeTypeSchema = z.enum(["full_time", "part_time"]);

export const createEmployeeSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().trim().optional(),
    avatar: z.string().trim().url("Avatar must be a valid URL").optional(),
    role: roleSchema.default("staff"),
    employeeType: employeeTypeSchema.optional(),
    branchId: objectIdSchema.optional(),
    organizationId: objectIdSchema.optional(),
    employeeCode: z.string().trim().optional(),
    joinDate: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateEmployeeSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2, "Full name must be at least 2 characters").optional(),
      phone: z.string().trim().optional(),
      avatar: z.string().trim().url("Avatar must be a valid URL").optional(),
      role: roleSchema.optional(),
      employeeType: employeeTypeSchema.optional(),
      branchId: objectIdSchema.optional(),
      organizationId: objectIdSchema.optional(),
      employeeCode: z.string().trim().optional(),
      joinDate: z.coerce.date().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
  params: z.object({
    userId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const employeeIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    userId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const employeeListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    role: roleSchema.optional(),
    status: z.enum(["active", "inactive"]).optional(),
    branchId: objectIdSchema.optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const transferEmployeeBranchSchema = z.object({
  body: z.object({
    branchId: objectIdSchema,
  }),
  params: z.object({
    userId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export const managerBranchSchema = z.object({
  body: z.object({
    branchId: objectIdSchema,
  }),
  params: z.object({
    userId: objectIdSchema,
  }),
  query: z.object({}).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>["body"];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>["body"];
export type EmployeeListQuery = z.infer<typeof employeeListSchema>["query"];
export type TransferEmployeeBranchInput = z.infer<
  typeof transferEmployeeBranchSchema
>["body"];
export type ManagerBranchInput = z.infer<typeof managerBranchSchema>["body"];
