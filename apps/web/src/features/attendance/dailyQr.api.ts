import { api } from "@/shared/api";
import type { DailyQrCode, GenerateDailyQrRequest, VerifyDailyQrRequest, VerifyDailyQrResponse } from "./dailyQr.types";

export const dailyQrApi = {
  generate: (payload: GenerateDailyQrRequest) => api.post<DailyQrCode>("/daily-qr-codes/generate", payload),
  verify: (payload: VerifyDailyQrRequest) => api.post<VerifyDailyQrResponse>("/daily-qr-codes/verify", payload),
};
