import { createCrudController } from "../../common/utils/crudResource.js";
import { ScheduleModel } from "./schedule.model.js";

export const ScheduleController = createCrudController({
  model: ScheduleModel,
  resourceName: "Schedule",
});
