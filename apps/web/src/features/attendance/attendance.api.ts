import { api } from "@/shared/api";
import type {
  ApproveManualAttendanceRequest,
  AttendanceAlertQuery,
  AttendanceHistoryQuery,
  AttendanceHistoryResponse,
  AttendanceRecord,
  AttendanceReminderResponse,
  AutoMarkAbsentRequest,
  AutoMarkAbsentResponse,
  CheckInRequest,
  CheckOutRequest,
  LateWarningResponse,
  ManualCorrectionRequest,
  UndoMarkAbsentRequest,
  UndoMarkAbsentResponse,
} from "./attendance.types";

export const attendanceApi = {
  checkIn: (payload: CheckInRequest) => api.post<AttendanceRecord>("/attendances/check-in", payload),
  checkOut: (payload: CheckOutRequest) => api.post<AttendanceRecord>("/attendances/check-out", payload),
  requestManualCorrection: (payload: ManualCorrectionRequest) =>
    api.post<AttendanceRecord>("/attendances/manual-corrections", payload),
  approveManual: (attendanceId: string, payload: ApproveManualAttendanceRequest) =>
    api.patch<AttendanceRecord>(`/attendances/${attendanceId}/approve-manual`, payload),
  autoMarkAbsent: (payload: AutoMarkAbsentRequest) => api.post<AutoMarkAbsentResponse>("/attendances/auto-mark-absent", payload),
  undoMarkAbsent: (payload: UndoMarkAbsentRequest) => api.post<UndoMarkAbsentResponse>("/attendances/undo-mark-absent", payload),
  history: (query: AttendanceHistoryQuery) => api.get<AttendanceHistoryResponse>("/attendances/history", query),
  reminders: (query?: AttendanceAlertQuery) => api.get<AttendanceReminderResponse>("/attendances/reminders", query),
  lateWarnings: (query?: AttendanceAlertQuery) => api.get<LateWarningResponse>("/attendances/late-warnings", query),
};
