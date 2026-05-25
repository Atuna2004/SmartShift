import { api } from "@/services/api";
import type { ShiftTemplate } from "./shift.types";

export const shiftApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<{ data: ShiftTemplate[]; meta: unknown }>("/shift-templates", params),
};
