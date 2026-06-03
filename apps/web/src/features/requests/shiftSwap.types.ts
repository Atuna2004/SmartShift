export type ShiftSwapFinalStatus =
  | "pending_receiver"
  | "pending_manager"
  | "approved"
  | "rejected"
  | "cancelled";

export type ShiftSwapReceiverStatus = "pending" | "accepted" | "rejected";
export type ShiftSwapManagerStatus = "pending" | "approved" | "rejected";

export type ShiftSwapScheduleSummary = {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  employeeId: string;
  shiftTemplateId: string;
  workDate: string;
  shiftStartTime: string;
  shiftEndTime: string;
  status: string;
  published: boolean;
  note?: string;
};

export type ShiftSwapRequest = {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  fromScheduleId: string;
  toScheduleId?: string;
  fromSchedule?: ShiftSwapScheduleSummary;
  toSchedule?: ShiftSwapScheduleSummary;
  reason?: string;
  receiverStatus: ShiftSwapReceiverStatus;
  managerStatus: ShiftSwapManagerStatus;
  finalStatus: ShiftSwapFinalStatus;
  receiverRespondedAt?: string;
  managerId?: string;
  managerRespondedAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type ShiftSwapListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: ShiftSwapRequest[];
};

export type ShiftSwapListQuery = {
  page?: number;
  limit?: number;
  branchId?: string;
  employeeId?: string;
  fromEmployeeId?: string;
  toEmployeeId?: string;
  fromScheduleId?: string;
  toScheduleId?: string;
  managerId?: string;
  finalStatus?: ShiftSwapFinalStatus;
  receiverStatus?: ShiftSwapReceiverStatus;
  managerStatus?: ShiftSwapManagerStatus;
  createdFrom?: string;
  createdTo?: string;
  respondedFrom?: string;
  respondedTo?: string;
};

export type CreateShiftSwapRequest = {
  toEmployeeId: string;
  fromScheduleId: string;
  toScheduleId?: string;
  reason?: string;
};

export type ShiftSwapDecisionRequest = {
  note?: string;
};
