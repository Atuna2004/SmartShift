export type PaymentPurpose = "subscription" | "payroll" | "other";
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
  organizationId: string;
  ownerId: string;
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
