import { useQuery } from "@tanstack/react-query";
import { shiftApi } from "./shift.api";

export const useShiftTemplates = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["shift-templates", params],
    queryFn: () => shiftApi.list(params),
  });
};
