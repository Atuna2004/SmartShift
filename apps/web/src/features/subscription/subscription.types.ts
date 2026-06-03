export type SubscriptionCurrency = "VND" | "USD";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";
export type SubscriptionPlanCode = "free" | "basic" | "pro" | string;

export type SubscriptionLimits = {
  maxBranches: number;
  maxEmployees: number;
  maxManagers: number;
  maxShiftTemplates?: number;
  maxAssignedShiftsPerMonth?: number;
};

export type SubscriptionFeatures = {
  qrCheckIn: boolean;
  gpsValidation: boolean;
  attendanceReports: boolean;
  shiftSwap: boolean;
  payroll: boolean;
};

export type Subscription = {
  id: string;
  organizationId: string;
  ownerId: string;
  planId: string;
  planCode: SubscriptionPlanCode;
  planName: string;
  priceMonthly: number;
  currency: SubscriptionCurrency;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  cancelledAt?: string;
  renewedAt?: string;
  changedAt?: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  code: SubscriptionPlanCode;
  priceMonthly: number;
  currency: SubscriptionCurrency;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  status: "active" | "disabled";
  description?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type SubscriptionPlanListQuery = {
  status?: "active" | "disabled";
  search?: string;
  page?: number;
  limit?: number;
};

export type SubscriptionPlanListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: SubscriptionPlan[];
};

export type SubscriptionLimitUsage = {
  used: number;
  limit: number | null;
  remaining: number | null;
  allowed: boolean;
};

export type SubscriptionLimitsCheck = {
  subscription: Subscription;
  usage: {
    branches: number;
    employees: number;
    managers: number;
    shiftTemplates: number;
    assignedShiftsThisMonth: number;
  };
  limits: {
    branches: SubscriptionLimitUsage;
    employees: SubscriptionLimitUsage;
    managers: SubscriptionLimitUsage;
    shiftTemplates: SubscriptionLimitUsage;
    assignedShiftsPerMonth: SubscriptionLimitUsage;
  };
  features: SubscriptionFeatures;
  feature?: keyof SubscriptionFeatures;
  allowed?: boolean;
};
