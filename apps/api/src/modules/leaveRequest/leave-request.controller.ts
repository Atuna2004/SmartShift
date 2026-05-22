import { createCrudController } from "../../common/utils/crudResource.js";
import { LeaveRequestModel } from "./leave-request.model.js";

export const LeaveRequestController = createCrudController({
  model: LeaveRequestModel,
  resourceName: "Leave request",
});
