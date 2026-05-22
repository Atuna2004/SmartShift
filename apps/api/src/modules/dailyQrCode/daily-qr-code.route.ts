import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  createResourceSchema,
  listResourceSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../../common/validations/crud.validation.js";
import { DailyQrCodeController } from "./daily-qr-code.controller.js";

const router = Router();

router.use(auth());

router.post("/", validateRequest(createResourceSchema), DailyQrCodeController.create);
router.get("/", validateRequest(listResourceSchema), DailyQrCodeController.list);
router.get("/:id", validateRequest(resourceIdParamSchema), DailyQrCodeController.getById);
router.patch("/:id", validateRequest(updateResourceSchema), DailyQrCodeController.update);
router.delete("/:id", validateRequest(resourceIdParamSchema), DailyQrCodeController.remove);

export const DailyQrCodeRoutes = router;
