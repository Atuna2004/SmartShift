import { createCrudController } from "../../common/utils/crudResource.js";
import { ShiftTemplateModel } from "./shift-template.model.js";

export const ShiftController = createCrudController({
  model: ShiftTemplateModel,
  resourceName: "Shift template",
});
