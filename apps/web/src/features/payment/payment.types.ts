import type { AuthSession } from "@/features/auth/types";

export type PaymentPurpose = "subscription" | "registration" | "payroll" | "other";
export type PaymentProvider = "payos" | "manual";
export type PaymentMethod = "payos" | "cash" | "bank_transfer";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded";
export type PaymentCurrency = "VND" | "USD";

export type Payment = {
  id: string;
  purpose: PaymentPurpose;
  provider: PaymentProvider;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  organizationId?: string;
  ownerId?: string;
  amount: number;
  currency: PaymentCurrency;
  orderCode: number;
  branchId?: string;
  subscriptionId?: string;
  employeeId?: string;
  months?: number;
  transactionCode?: string;
  checkoutUrl?: string;
  payosPaymentLinkId?: string;
  payrollPeriodStart?: string;
  payrollPeriodEnd?: string;
  payrollMeta?: {
    hourlyRate: number;
    workedHours: number;
    overtimeHours: number;
    lateMinutes: number;
    overtimeMultiplier: number;
    deductionRatePerMinute: number;
    basePay: number;
    overtimePay: number;
    deductions: number;
    attendanceCount: number;
  };
  paidAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  failedAt?: string;
  expiresAt?: string;
  note?: string;
};

export type PaymentListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Payment[];
};

export type PaymentListQuery = {
  organizationId?: string;
  purpose?: PaymentPurpose;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
};

export type CreateSubscriptionPaymentRequest = {
  organizationId: string;
  planId: string;
  months?: number;
  paymentMethod?: PaymentMethod;
  note?: string;
};

export type BankTransferInfo = {
  bankBin: string;
  accountNo: string;
  accountName: string;
  template: string;
  transferContent: string;
  qrImageUrl: string;
};

export type CreateSubscriptionPaymentResponse = {
  subscriptionId: string;
  payment: Payment;
  bankTransfer?: BankTransferInfo;
};

export type MarkPaymentPaidRequest = {
  transactionCode?: string;
  note?: string;
};

export type PayrollPaymentRequest = {
  organizationId?: string;
  employeeId: string;
  from: string;
  to: string;
  hourlyRate?: number;
  overtimeMultiplier?: number;
  deductionRatePerMinute?: number;
  paymentMethod?: PaymentMethod;
  note?: string;
};

export type PayrollCalculationResponse = {
  organizationId: string;
  employeeId: string;
  period: {
    from: string;
    to: string;
  };
  payroll: NonNullable<Payment["payrollMeta"]> & {
    netAmount: number;
  };
};

export type CreateRegistrationCheckoutRequest = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  planCode: "basic_49k" | "pro_99k";
  organization: {
    name: string;
    businessType?: "cafe" | "restaurant" | "retail" | "service" | "other";
    phone?: string;
    email?: string;
    address?: string;
  };
  branch: {
    name: string;
    address?: string;
    phone?: string;
  };
};

export type RegistrationIntent = {
  id: string;
  status: "pending" | "paid" | "expired" | "failed";
  email: string;
  expiresAt: string;
  userId?: string;
  organizationId?: string;
  branchId?: string;
  payment?: Payment;
};

export type CreateRegistrationCheckoutResponse = {
  intentId: string;
  completionToken: string;
  checkoutUrl: string;
  payment: Payment;
};

export type CompleteRegistrationResponse =
  | ({ completed: true; intent: RegistrationIntent } & AuthSession)
  | { completed: false; intent: RegistrationIntent };
