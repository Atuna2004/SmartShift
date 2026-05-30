export type AssignedShiftStatus =
  | "scheduled"
  | "completed"
  | "absent"
  | "cancelled"
  | "swapped"
  | "leave_requested";

export type AssignedShift = {
  id: string;
  organizationId: string;
  branchId: string;
  branchName?: string;
  employeeId: string;
  shiftTemplateId: string;
  workDate: string;
  shiftStartTime: string;
  shiftEndTime: string;
  status: AssignedShiftStatus;
  published: boolean;
  note?: string;
  assignedBy?: string;
  updatedBy?: string;
};

export type WeeklyScheduleResponse = {
  weekStart: string;
  weekEnd: string;
  data: AssignedShift[];
};

export type WeeklyScheduleQuery = {
  branchId?: string;
  employeeId?: string;
  weekStart: string;
  published?: boolean;
};

export type MyScheduleResponse = {
  from: string;
  to: string;
  data: AssignedShift[];
};

export type MyScheduleQuery = {
  from: string;
  to: string;
  published?: boolean;
};

export type CreateAssignedShiftRequest = {
  branchId: string;
  employeeId: string;
  shiftTemplateId: string;
  workDate: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  published?: boolean;
  note?: string;
};

export type UpdateAssignedShiftRequest = Partial<
  Pick<
    AssignedShift,
    | "employeeId"
    | "shiftTemplateId"
    | "workDate"
    | "shiftStartTime"
    | "shiftEndTime"
    | "status"
    | "published"
    | "note"
  >
>;
