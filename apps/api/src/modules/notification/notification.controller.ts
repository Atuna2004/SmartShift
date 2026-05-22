import { createCrudController } from "../../common/utils/crudResource.js";
import { NotificationModel } from "./notification.model.js";

export const NotificationController = createCrudController({
  model: NotificationModel,
  resourceName: "Notification",
});
