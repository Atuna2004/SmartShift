export type BranchStatus = "active" | "disabled";

export type BranchSettings = {
  timezone?: string;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
  allowEarlyCheckInMinutes?: number;
  allowLateCheckOutMinutes?: number;
  requireCheckout?: boolean;
};

export type BranchQrSettings = {
  enabled?: boolean;
  refreshIntervalSeconds?: number;
  requireGps?: boolean;
  qrExpiresInSeconds?: number;
};

export type Branch = {
  id: string;
  organizationId: string;
  name: string;
  status: BranchStatus;
  code?: string;
  address?: string;
  phone?: string;
  description?: string;
  settings?: BranchSettings;
  qrSettings?: BranchQrSettings;
  attendanceSettings?: {
    lateThresholdMinutes?: number;
  };
  managerId?: string;
  ownerId?: string;
};

export type BranchListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Branch[];
};

export type BranchListQuery = {
  page?: number;
  limit?: number;
  status?: BranchStatus;
  search?: string;
};

export type CreateBranchRequest = {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  description?: string;
  settings?: BranchSettings;
  qrSettings?: BranchQrSettings;
  attendanceSettings?: {
    lateThresholdMinutes: number;
  };
};

export type UpdateBranchRequest = Partial<CreateBranchRequest>;
