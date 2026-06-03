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

export type ShiftTemplateStatus = ShiftTemplate["status"];

export type ShiftTemplateListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: ShiftTemplate[];
};

export type ShiftTemplateListQuery = {
  branchId?: string;
  status?: ShiftTemplateStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateShiftTemplateRequest = {
  branchId: string;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  color?: string;
  description?: string;
};

export type UpdateShiftTemplateRequest = Partial<Omit<CreateShiftTemplateRequest, "branchId">>;
