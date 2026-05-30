import { api } from "@/shared/api";
import type {
  CreateLeaveRequestPayload,
  LeaveRequest,
  LeaveRequestListQuery,
  LeaveRequestListResponse,
  ReviewLeaveRequestPayload,
  UpdateLeaveRequestPayload,
} from "./leaveRequest.types";

export const leaveRequestApi = {
  list: (query?: LeaveRequestListQuery) => api.get<LeaveRequestListResponse>("/leave-requests", query),
  detail: (leaveRequestId: string) => api.get<LeaveRequest>(`/leave-requests/${leaveRequestId}`),
  create: (payload: CreateLeaveRequestPayload) => api.post<LeaveRequest>("/leave-requests", payload),
  update: (leaveRequestId: string, payload: UpdateLeaveRequestPayload) =>
    api.patch<LeaveRequest>(`/leave-requests/${leaveRequestId}`, payload),
  cancel: (leaveRequestId: string) => api.patch<LeaveRequest>(`/leave-requests/${leaveRequestId}/cancel`, {}),
  approve: (leaveRequestId: string, payload?: ReviewLeaveRequestPayload) =>
    api.patch<LeaveRequest>(`/leave-requests/${leaveRequestId}/approve`, payload ?? {}),
  reject: (leaveRequestId: string, payload?: ReviewLeaveRequestPayload) =>
    api.patch<LeaveRequest>(`/leave-requests/${leaveRequestId}/reject`, payload ?? {}),
};
