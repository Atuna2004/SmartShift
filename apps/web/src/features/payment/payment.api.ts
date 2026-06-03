import { api } from "@/shared/api";
import type {
  CreateSubscriptionPaymentRequest,
  CreateSubscriptionPaymentResponse,
  CompleteRegistrationResponse,
  CreateRegistrationCheckoutRequest,
  CreateRegistrationCheckoutResponse,
  MarkPaymentPaidRequest,
  Payment,
  PaymentListQuery,
  PaymentListResponse,
  PayrollCalculationResponse,
  PayrollPaymentRequest,
} from "./payment.types";

export const paymentApi = {
  createRegistrationCheckout: (payload: CreateRegistrationCheckoutRequest) =>
    api.post<CreateRegistrationCheckoutResponse>("/payments/registration-checkout", payload),
  getRegistrationIntent: (intentId: string) =>
    api.get<CompleteRegistrationResponse["intent"]>(`/payments/registration-intents/${intentId}`),
  completeRegistration: (intentId: string, completionToken: string) =>
    api.post<CompleteRegistrationResponse>(`/payments/registration-intents/${intentId}/complete`, {
      completionToken,
    }),
  list: (query?: PaymentListQuery) => api.get<PaymentListResponse>("/payments", query),
  detail: (paymentId: string) => api.get<Payment>(`/payments/${paymentId}`),
  createSubscription: (payload: CreateSubscriptionPaymentRequest) =>
    api.post<CreateSubscriptionPaymentResponse>("/payments/subscriptions", payload),
  markPaid: (paymentId: string, payload?: MarkPaymentPaidRequest) =>
    api.patch<Payment>(`/payments/${paymentId}/mark-paid`, payload ?? {}),
  cancel: (paymentId: string) => api.patch<Payment>(`/payments/${paymentId}/cancel`, {}),
  refund: (paymentId: string) => api.patch<Payment>(`/payments/${paymentId}/refund`, {}),
  calculatePayroll: (payload: PayrollPaymentRequest) =>
    api.post<PayrollCalculationResponse>("/payments/payroll/calculate", payload),
  createPayroll: (payload: PayrollPaymentRequest) =>
    api.post<Payment>("/payments/payroll", payload),
};
