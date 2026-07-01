import { api } from "@/shared/api";
import type {
  AdjustmentListQuery,
  CompensationAdjustment,
  CompensationListQuery,
  CompensationSummary,
  CreateAdjustmentPayload,
  CreateOvertimePayload,
  OvertimeListQuery,
  OvertimeRequest,
  Paginated,
  ReviewOvertimePayload,
} from "./compensation.types";

export const compensationApi = {
  summary: (query?: CompensationListQuery) => api.get<CompensationSummary>("/compensations/summary", query),
  overtime: {
    list: (query?: OvertimeListQuery) =>
      api.get<Paginated<OvertimeRequest>>("/compensations/overtime-requests", query),
    create: (payload: CreateOvertimePayload) =>
      api.post<OvertimeRequest>("/compensations/overtime-requests", payload),
    approve: (overtimeId: string, payload?: ReviewOvertimePayload) =>
      api.patch<OvertimeRequest>(`/compensations/overtime-requests/${overtimeId}/approve`, payload ?? {}),
    reject: (overtimeId: string, payload?: ReviewOvertimePayload) =>
      api.patch<OvertimeRequest>(`/compensations/overtime-requests/${overtimeId}/reject`, payload ?? {}),
    cancel: (overtimeId: string) =>
      api.patch<OvertimeRequest>(`/compensations/overtime-requests/${overtimeId}/cancel`, {}),
  },
  adjustments: {
    list: (query?: AdjustmentListQuery) =>
      api.get<Paginated<CompensationAdjustment>>("/compensations/adjustments", query),
    create: (payload: CreateAdjustmentPayload) =>
      api.post<CompensationAdjustment>("/compensations/adjustments", payload),
    delete: (adjustmentId: string) => api.delete<{ id: string }>(`/compensations/adjustments/${adjustmentId}`),
  },
};
