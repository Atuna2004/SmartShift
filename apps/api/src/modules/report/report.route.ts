import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { ReportController } from "./report.controller.js";
import { ownerReportSummarySchema } from "./report.validation.js";

const router = Router();

router.use(auth("owner", "manager"));

router.get(
  "/owner-summary",
  validateRequest(ownerReportSummarySchema),
  ReportController.getOwnerSummary
);

export const ReportRoutes = router;
