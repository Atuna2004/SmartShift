import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  generateDailyQrSchema,
  verifyDailyQrSchema,
} from "./daily-qr-code.validation.js";
import { DailyQrCodeController } from "./daily-qr-code.controller.js";

const router = Router();

router.use(auth());

router.post(
  "/generate",
  validateRequest(generateDailyQrSchema),
  DailyQrCodeController.generateDailyQr
);
router.post(
  "/verify",
  validateRequest(verifyDailyQrSchema),
  DailyQrCodeController.verifyQr
);

export const DailyQrCodeRoutes = router;
