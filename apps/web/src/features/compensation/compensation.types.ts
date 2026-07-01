export type OvertimeRequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type CompensationAdjustmentType = "bonus" | "penalty";

export type OvertimeRequest = {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  employeeId: string;
  employeeName?: string;
  workDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  reason: string;
  status: OvertimeRequestStatus;
  requestedAt: string;
  reviewedBy?: string;
  managerNote?: string;
  respondedAt?: string;
};

export type CompensationAdjustment = {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  employeeId: string;
  employeeName?: string;
  type: CompensationAdjustmentType;
  amount: number;
  reason: string;
  effectiveDate: string;
  createdBy: string;
  note?: string;
};

export type Paginated<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: T[];
};

export type CompensationListQuery = {
  branchId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type OvertimeListQuery = CompensationListQuery & {
  status?: OvertimeRequestStatus;
};

export type AdjustmentListQuery = CompensationListQuery & {
  type?: CompensationAdjustmentType;
};

export type CreateOvertimePayload = {
  employeeId?: string;
  branchId?: string;
  workDate: string;
  startTime: string;
  endTime: string;
  hours?: number;
  hourlyRate?: number;
  reason: string;
};

export type ReviewOvertimePayload = {
  hourlyRate?: number;
  managerNote?: string;
};

export type CreateAdjustmentPayload = {
  employeeId: string;
  branchId?: string;
  type: CompensationAdjustmentType;
  amount: number;
  reason: string;
  effectiveDate: string;
  note?: string;
};

export type CompensationSummary = {
  totals: {
    overtimeHours: number;
    overtimeAmount: number;
    bonusAmount: number;
    penaltyAmount: number;
    netAmount: number;
  };
  employees: Array<{
    employeeId: string;
    employeeName: string;
    overtimeHours: number;
    overtimeAmount: number;
    bonusAmount: number;
    penaltyAmount: number;
    netAmount: number;
  }>;
};
