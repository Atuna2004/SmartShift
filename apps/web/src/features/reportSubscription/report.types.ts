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
  branchSummary: Array<{
    branchId: string;
    branchName: string;
    attendanceCount: number;
    workHours: number;
    lateRate: number;
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
