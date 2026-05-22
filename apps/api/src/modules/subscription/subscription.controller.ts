import { createCrudController } from "../../common/utils/crudResource.js";
import { SubscriptionModel } from "./subscription.model.js";

export const SubscriptionController = createCrudController({
  model: SubscriptionModel,
  resourceName: "Subscription",
});
