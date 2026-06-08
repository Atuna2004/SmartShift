export type ReportEmployeeRow = {
  employeeId: string;
  employeeName: string;
  attendanceCount: number;
  absentCount: number;
  lateCount: number;
  missingCheckoutCount: number;
  overtimeHours: number;
  workHours: number;
  payrollEstimate: number;
};

export type ReportSummary = {
  range: {
    from: string;
    to: string;
  };
  kpis: {
    averageAttendanceRate: number;
    totalWorkHours: number;
    lateRate: number;
    activeBranches: number;
    activeEmployees: number;
    attendanceCount: number;
    absentCount: number;
    missingCheckoutCount: number;
    overtimeHours: number;
    payrollEstimate: number;
  };
  attendanceBreakdown: {
    onTime: number;
    late: number;
    absent: number;
    overtime: number;
    earlyLeave: number;
    missingCheckout: number;
  };
  workHourStats: {
    regularHours: number;
    overtimeHours: number;
    totalLateMinutes: number;
    totalEarlyLeaveMinutes: number;
  };
  attendanceTrend: Array<{
    date: string;
    label: string;
    count: number;
  }>;
  employeeHours: Array<{
    employeeId: string;
    employeeName: string;
    hours: number;
  }>;
  employeeDetails: ReportEmployeeRow[];
  lateEmployees: ReportEmployeeRow[];
  absenceEmployees: ReportEmployeeRow[];
  branchSummary: Array<{
    branchId: string;
    branchName: string;
    employeeCount: number;
    attendanceCount: number;
    absentCount: number;
    missingCheckoutCount: number;
    overtimeHours: number;
    workHours: number;
    lateRate: number;
    absentRate: number;
  }>;
  exceptions: Array<{
    id: string;
    type: "absent" | "late" | "missing_checkout" | "manual_pending";
    date: string;
    employeeId: string;
    employeeName: string;
    branchId: string;
    branchName: string;
    note?: string;
  }>;
  recentReports: Array<{
    id: string;
    name: string;
    generatedAt: string;
    status: "completed" | "processing";
    size: string;
  }>;
};

export type ReportSummaryQuery = {
  from?: string;
  to?: string;
  branchId?: string;
};
