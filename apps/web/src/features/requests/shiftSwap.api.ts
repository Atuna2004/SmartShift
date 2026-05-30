import { api } from "@/shared/api";
import type {
  CreateShiftSwapRequest,
  ShiftSwapDecisionRequest,
  ShiftSwapListQuery,
  ShiftSwapListResponse,
  ShiftSwapRequest,
} from "./shiftSwap.types";

export const shiftSwapApi = {
  list: (query?: ShiftSwapListQuery) => api.get<ShiftSwapListResponse>("/shift-swaps", query),
  detail: (shiftSwapId: string) => api.get<ShiftSwapRequest>(`/shift-swaps/${shiftSwapId}`),
  create: (payload: CreateShiftSwapRequest) => api.post<ShiftSwapRequest>("/shift-swaps", payload),
  accept: (shiftSwapId: string, payload?: ShiftSwapDecisionRequest) =>
    api.patch<ShiftSwapRequest>(`/shift-swaps/${shiftSwapId}/accept`, payload ?? {}),
  rejectReceiver: (shiftSwapId: string, payload?: ShiftSwapDecisionRequest) =>
    api.patch<ShiftSwapRequest>(`/shift-swaps/${shiftSwapId}/reject-receiver`, payload ?? {}),
  approve: (shiftSwapId: string, payload?: ShiftSwapDecisionRequest) =>
    api.patch<ShiftSwapRequest>(`/shift-swaps/${shiftSwapId}/approve`, payload ?? {}),
  rejectManager: (shiftSwapId: string, payload?: ShiftSwapDecisionRequest) =>
    api.patch<ShiftSwapRequest>(`/shift-swaps/${shiftSwapId}/reject-manager`, payload ?? {}),
  cancel: (shiftSwapId: string) => api.patch<ShiftSwapRequest>(`/shift-swaps/${shiftSwapId}/cancel`, {}),
};
