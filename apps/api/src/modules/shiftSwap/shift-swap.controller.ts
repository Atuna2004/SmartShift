import { createCrudController } from "../../common/utils/crudResource.js";
import { ShiftSwapRequestModel } from "./shift-swap.model.js";

export const ShiftSwapController = createCrudController({
  model: ShiftSwapRequestModel,
  resourceName: "Shift swap request",
});
