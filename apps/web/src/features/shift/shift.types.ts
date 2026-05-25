export type ShiftTemplate = {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  color?: string;
  description?: string;
  status: "active" | "disabled";
};
