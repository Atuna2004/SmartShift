import { api } from "@/shared/api";
import type { Payment, PaymentListQuery, PaymentListResponse } from "./payment.types";

export const paymentApi = {
  list: (query?: PaymentListQuery) => api.get<PaymentListResponse>("/payments", query),
  detail: (paymentId: string) => api.get<Payment>(`/payments/${paymentId}`),
};
