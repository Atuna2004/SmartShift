export type OrganizationStatus = "active" | "disabled";
export type OrganizationBusinessType = "cafe" | "restaurant" | "retail" | "service" | "other";
export type OrganizationSubscriptionPlan = "free" | "basic" | "pro";
export type OrganizationSubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";

export type OrganizationSubscriptionInfo = {
  plan: OrganizationSubscriptionPlan;
  status: OrganizationSubscriptionStatus;
  startedAt?: string;
  expiredAt?: string;
  maxBranches?: number;
  maxEmployees?: number;
};

export type Organization = {
  id: string;
  name: string;
  status: OrganizationStatus;
  settings: {
    timezone: string;
    defaultLateThresholdMinutes: number;
    defaultQrExpiresInSeconds: number;
    defaultRequireGps: boolean;
    defaultAllowEarlyCheckInMinutes: number;
    defaultAllowLateCheckOutMinutes: number;
  };
  subscription: OrganizationSubscriptionInfo;
  ownerId: string;
  createdBy: string;
  slug?: string;
  businessType?: OrganizationBusinessType;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  subscriptionId?: string;
  updatedBy?: string;
  disabledAt?: string;
  enabledAt?: string;
};

export type OrganizationResponse = Organization;

export type UpdateOrganizationProfileRequest = {
  name?: string;
  slug?: string;
  businessType?: OrganizationBusinessType;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
};

export type UpdateOrganizationSettingsRequest = Partial<Organization["settings"]>;
