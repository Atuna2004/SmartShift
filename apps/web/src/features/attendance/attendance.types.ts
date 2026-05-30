export type AttendanceStatus = "on_time" | "late" | "absent" | "early_leave" | "overtime";
export type AttendanceSource = "qr" | "manual" | "system";
export type ManualCorrectionStatus = "none" | "pending" | "approved" | "rejected";

export type AttendanceRecord = {
  id: string;
  organizationId: string;
  branchId: string;
  employeeId: string;
  scheduleId: string;
  shiftTemplateId: string;
  workDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  attendanceStatus: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  source: AttendanceSource;
  manualCorrectionStatus: ManualCorrectionStatus;
  checkInTime?: string;
  checkOutTime?: string;
  qrCodeId?: string;
  note?: string;
  correctionReason?: string;
  correctedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type AttendanceHistoryQuery = {
  branchId?: string;
  employeeId?: string;
  from: string;
  to: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
};

export type AttendanceHistoryResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: AttendanceRecord[];
};

export type AttendanceAlertQuery = {
  branchId?: string;
  workDate?: string;
};

export type AttendanceReminder = {
  scheduleId: string;
  branchId: string;
  employeeId: string;
  workDate: string;
  shiftStartTime: string;
  type: "check_in_reminder";
};

export type AttendanceReminderResponse = {
  workDate: string;
  data: AttendanceReminder[];
};

export type LateWarningResponse = {
  workDate: string;
  data: AttendanceRecord[];
};

export type CheckInRequest = {
  qrToken: string;
  scheduleId: string;
  checkInTime?: string;
};

export type CheckOutRequest = {
  qrToken: string;
  scheduleId: string;
  checkOutTime?: string;
};

export type ManualCorrectionRequest = {
  scheduleId: string;
  employeeId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  note?: string;
  correctionReason: string;
};

export type ApproveManualAttendanceRequest = {
  approved: boolean;
  note?: string;
};

export type AutoMarkAbsentRequest = {
  branchId?: string;
  workDate?: string;
};

export type AutoMarkAbsentResponse = {
  workDate: string;
  totalMarkedAbsent: number;
  data: AttendanceRecord[];
};
