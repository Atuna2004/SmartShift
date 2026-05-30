import { api } from "@/shared/api";
import type { ReportSummary, ReportSummaryQuery } from "./report.types";

export const reportApi = {
  ownerSummary: (query?: ReportSummaryQuery) =>
    api.get<ReportSummary>("/reports/owner-summary", query),
};
