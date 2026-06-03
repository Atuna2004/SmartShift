import { api } from "@/shared/api";
import type {
  Branch,
  BranchListQuery,
  BranchListResponse,
  BranchQrSettings,
  BranchSettings,
  BranchStatus,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "./branch.types";

export const branchApi = {
  list: (query?: BranchListQuery) => api.get<BranchListResponse>("/branches", query),
  detail: (branchId: string) => api.get<Branch>(`/branches/${branchId}`),
  create: (payload: CreateBranchRequest) => api.post<Branch>("/branches", payload),
  update: (branchId: string, payload: UpdateBranchRequest) => api.patch<Branch>(`/branches/${branchId}`, payload),
  setStatus: (branchId: string, status: BranchStatus) =>
    api.patch<Branch>(`/branches/${branchId}/${status === "active" ? "enable" : "disable"}`, {}),
  configureSettings: (branchId: string, payload: BranchSettings) =>
    api.patch<Branch>(`/branches/${branchId}/settings`, payload),
  configureQrSettings: (branchId: string, payload: BranchQrSettings) =>
    api.patch<Branch>(`/branches/${branchId}/qr-settings`, payload),
  configureLateThreshold: (branchId: string, lateThresholdMinutes: number) =>
    api.patch<Branch>(`/branches/${branchId}/late-threshold`, { lateThresholdMinutes }),
};
