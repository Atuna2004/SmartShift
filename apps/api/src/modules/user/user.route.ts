import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import { validateRequest } from "../../common/middlewares/validateRequest.js";
import { UserController } from "./user.controller.js";
import {
  createEmployeeSchema,
  employeeIdParamSchema,
  employeeListSchema,
  managerBranchSchema,
  transferEmployeeBranchSchema,
  updateEmployeeSchema,
} from "./user.schema.js";

const router = Router();

router.use(auth("owner", "manager"));

router.post("/", validateRequest(createEmployeeSchema), UserController.createEmployee);

router.get("/", validateRequest(employeeListSchema), UserController.getEmployeeList);

router.get(
  "/:userId",
  validateRequest(employeeIdParamSchema),
  UserController.getEmployeeById
);

router.patch(
  "/:userId",
  validateRequest(updateEmployeeSchema),
  UserController.updateEmployee
);

router.patch(
  "/:userId/activate",
  validateRequest(employeeIdParamSchema),
  UserController.activateEmployee
);

router.patch(
  "/:userId/deactivate",
  validateRequest(employeeIdParamSchema),
  UserController.deactivateEmployee
);

router.patch(
  "/:userId/transfer-branch",
  validateRequest(transferEmployeeBranchSchema),
  UserController.transferEmployeeBranch
);

router.patch(
  "/:userId/assign-manager-branch",
  validateRequest(managerBranchSchema),
  UserController.assignManagerToBranch
);

router.patch(
  "/:userId/remove-manager-branch",
  validateRequest(managerBranchSchema),
  UserController.removeManagerFromBranch
);

export const UserRoutes = router;
