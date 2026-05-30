import { api } from "@/shared/api";
import type {
  AssignedShift,
  CreateAssignedShiftRequest,
  MyScheduleQuery,
  MyScheduleResponse,
  UpdateAssignedShiftRequest,
  WeeklyScheduleQuery,
  WeeklyScheduleResponse,
} from "./schedule.types";

export const scheduleApi = {
  weekly: (query: WeeklyScheduleQuery) => api.get<WeeklyScheduleResponse>("/schedules/weekly", query),
  my: (query: MyScheduleQuery) => api.get<MyScheduleResponse>("/schedules/my", query),
  create: (payload: CreateAssignedShiftRequest) => api.post<AssignedShift>("/schedules", payload),
  update: (assignedShiftId: string, payload: UpdateAssignedShiftRequest) =>
    api.patch<AssignedShift>(`/schedules/${assignedShiftId}`, payload),
  delete: (assignedShiftId: string) => api.delete<AssignedShift>(`/schedules/${assignedShiftId}`),
};
