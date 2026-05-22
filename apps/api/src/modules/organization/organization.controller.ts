import { createCrudController } from "../../common/utils/crudResource.js";
import { OrganizationModel } from "./organization.model.js";

export const OrganizationController = createCrudController({
  model: OrganizationModel,
  resourceName: "Organization",
});
