import { api } from "@/shared/api";
import type { OrganizationResponse } from "./organization.types";

export const organizationApi = {
  me: (organizationId?: string) => api.get<OrganizationResponse>("/organizations/me", organizationId ? { organizationId } : undefined),
};
