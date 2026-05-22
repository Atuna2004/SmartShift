import { createCrudController } from "../../common/utils/crudResource.js";
import { DailyQrCodeModel } from "./daily-qr-code.model.js";

export const DailyQrCodeController = createCrudController({
  model: DailyQrCodeModel,
  resourceName: "Daily QR code",
});
