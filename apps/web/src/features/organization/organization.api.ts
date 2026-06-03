import { api } from "@/shared/api";
import type {
  OrganizationResponse,
  UpdateOrganizationProfileRequest,
  UpdateOrganizationSettingsRequest,
  UpdateOrganizationSubscriptionRequest,
} from "./organization.types";

export const organizationApi = {
  me: (organizationId?: string) => api.get<OrganizationResponse>("/organizations/me", organizationId ? { organizationId } : undefined),
  updateProfile: (payload: UpdateOrganizationProfileRequest, organizationId?: string) =>
    api.patch<OrganizationResponse>("/organizations/me/profile", payload, organizationId ? { organizationId } : undefined),
  updateSettings: (payload: UpdateOrganizationSettingsRequest, organizationId?: string) =>
    api.patch<OrganizationResponse>("/organizations/me/settings", payload, organizationId ? { organizationId } : undefined),
  updateSubscriptionInfo: (payload: UpdateOrganizationSubscriptionRequest, organizationId?: string) =>
    api.patch<OrganizationResponse>("/organizations/me/subscription", payload, organizationId ? { organizationId } : undefined),
};
