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
