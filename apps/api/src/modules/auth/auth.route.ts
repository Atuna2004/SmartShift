import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { AuthController } from "./auth.controller.js";
import {
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  loginValidationSchema,
  logoutValidationSchema,
  refreshTokenValidationSchema,
  registerOwnerValidationSchema,
  resetPasswordValidationSchema,
  updateProfileValidationSchema,
} from "./auth.validation.js";

const router = Router();

router.post(
  "/register-owner",
  validateRequest(registerOwnerValidationSchema),
  AuthController.registerOwner
);

router.post(
  "/login",
  validateRequest(loginValidationSchema),
  AuthController.login
);

router.post(
  "/logout",
  auth(),
  validateRequest(logoutValidationSchema),
  AuthController.logout
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordValidationSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordValidationSchema),
  AuthController.resetPassword
);

router.patch(
  "/change-password",
  auth(),
  validateRequest(changePasswordValidationSchema),
  AuthController.changePassword
);

router.post(
  "/refresh-token",
  validateRequest(refreshTokenValidationSchema),
  AuthController.refreshToken
);

router.get("/me", auth(), AuthController.me);

router.get("/profile", auth(), AuthController.viewProfile);

router.patch(
  "/profile",
  auth(),
  validateRequest(updateProfileValidationSchema),
  AuthController.updateProfile
);

export const AuthRoutes = router;
