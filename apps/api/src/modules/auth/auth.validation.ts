import { z } from "zod";

export const registerOwnerValidationSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const logoutValidationSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateProfileValidationSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2, "Full name must be at least 2 characters").optional(),
      phone: z.string().trim().optional(),
      avatar: z.string().trim().url("Avatar must be a valid URL").optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export type RegisterOwnerInput = z.infer<
  typeof registerOwnerValidationSchema
>["body"];

export type LoginInput = z.infer<typeof loginValidationSchema>["body"];
export type ForgotPasswordInput = z.infer<
  typeof forgotPasswordValidationSchema
>["body"];
export type ResetPasswordInput = z.infer<
  typeof resetPasswordValidationSchema
>["body"];
export type ChangePasswordInput = z.infer<
  typeof changePasswordValidationSchema
>["body"];
export type RefreshTokenInput = z.infer<
  typeof refreshTokenValidationSchema
>["body"];
export type UpdateProfileInput = z.infer<
  typeof updateProfileValidationSchema
>["body"];
