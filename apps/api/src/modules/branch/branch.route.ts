import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import {
  branchIdParamSchema,
  branchListSchema,
  configureBranchSettingsSchema,
  configureLateThresholdSchema,
  configureQrSettingsSchema,
  createBranchSchema,
  updateBranchSchema,
} from "./branch.schema.js";
import { BranchController } from "./branch.controller.js";

const router = Router();

router.use(auth("owner", "manager"));

router.post("/", validateRequest(createBranchSchema), BranchController.createBranch);
router.get("/", validateRequest(branchListSchema), BranchController.getBranchList);
router.get(
  "/:branchId",
  validateRequest(branchIdParamSchema),
  BranchController.getBranchById
);
router.patch(
  "/:branchId",
  validateRequest(updateBranchSchema),
  BranchController.updateBranch
);
router.patch(
  "/:branchId/disable",
  validateRequest(branchIdParamSchema),
  BranchController.disableBranch
);
router.patch(
  "/:branchId/enable",
  validateRequest(branchIdParamSchema),
  BranchController.enableBranch
);
router.patch(
  "/:branchId/settings",
  validateRequest(configureBranchSettingsSchema),
  BranchController.configureBranchSettings
);
router.patch(
  "/:branchId/qr-settings",
  validateRequest(configureQrSettingsSchema),
  BranchController.configureQrSettings
);
router.patch(
  "/:branchId/late-threshold",
  validateRequest(configureLateThresholdSchema),
  BranchController.configureLateThreshold
);

export const BranchRoutes = router;
