import { createCrudController } from "../../common/utils/crudResource.js";
import { AttendanceModel } from "./attendance.model.js";

export const AttendanceController = createCrudController({
  model: AttendanceModel,
  resourceName: "Attendance",
});
