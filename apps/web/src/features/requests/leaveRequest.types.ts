export type LeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveRequest = {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  employeeId: string;
  employeeName?: string;
  scheduleId: string;
  schedule?: {
    id: string;
    branchId: string;
    branchName?: string;
    employeeId: string;
    workDate: string;
    shiftStartTime: string;
    shiftEndTime: string;
    status: string;
  };
  reason: string;
  status: LeaveRequestStatus;
  requestedAt: string;
  approvedBy?: string;
  managerNote?: string;
  respondedAt?: string;
};

export type LeaveRequestListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: LeaveRequest[];
};

export type LeaveRequestListQuery = {
  branchId?: string;
  employeeId?: string;
  status?: LeaveRequestStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type CreateLeaveRequestPayload = {
  scheduleId: string;
  reason: string;
};

export type UpdateLeaveRequestPayload = {
  reason?: string;
};

export type ReviewLeaveRequestPayload = {
  managerNote?: string;
};
