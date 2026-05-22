import { createCrudController } from "../../common/utils/crudResource.js";
import { PaymentModel } from "./payment.model.js";

export const PaymentController = createCrudController({
  model: PaymentModel,
  resourceName: "Payment",
});
