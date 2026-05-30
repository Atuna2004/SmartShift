import { api } from "@/shared/api";
import type {
  CreateShiftTemplateRequest,
  ShiftTemplate,
  ShiftTemplateListQuery,
  ShiftTemplateListResponse,
  UpdateShiftTemplateRequest,
} from "./shift.types";

export const shiftApi = {
  list: (params?: ShiftTemplateListQuery) => api.get<ShiftTemplateListResponse>("/shift-templates", params),
  detail: (shiftTemplateId: string) => api.get<ShiftTemplate>(`/shift-templates/${shiftTemplateId}`),
  create: (payload: CreateShiftTemplateRequest) => api.post<ShiftTemplate>("/shift-templates", payload),
  update: (shiftTemplateId: string, payload: UpdateShiftTemplateRequest) =>
    api.patch<ShiftTemplate>(`/shift-templates/${shiftTemplateId}`, payload),
  enable: (shiftTemplateId: string) => api.patch<ShiftTemplate>(`/shift-templates/${shiftTemplateId}/enable`, {}),
  disable: (shiftTemplateId: string) => api.delete<ShiftTemplate>(`/shift-templates/${shiftTemplateId}`),
};
