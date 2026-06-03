import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { BadgeDollarSign, CheckCircle2, CreditCard, Search, XCircle } from "lucide-react";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import { paymentApi } from "@/features/payment/payment.api";
import type { Payment, PaymentPurpose, PaymentStatus } from "@/features/payment/payment.types";
import { getApiErrorMessage } from "@/shared/api";
import { useAuthStore } from "@/store";

export const PaymentsPage = () => {
  const queryClient = useQueryClient();
  const organizationId = useAuthStore((state) => state.user?.organizationId);
  const [purpose, setPurpose] = useState<"" | PaymentPurpose>("");
  const [status, setStatus] = useState<"" | PaymentStatus>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const paymentsQuery = useQuery({
    queryKey: ["payments", "operations", { organizationId, purpose, status }],
    queryFn: () =>
      paymentApi.list({
        organizationId,
        page: 1,
        limit: 50,
        ...(purpose ? { purpose } : {}),
        ...(status ? { paymentStatus: status } : {}),
      }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", "payments"],
    queryFn: () => employeeApi.list({ limit: 100, status: "active" }),
  });
  const selectedPayment = paymentsQuery.data?.data.find((payment) => payment.id === selectedId) ?? paymentsQuery.data?.data[0];
  const invalidatePayments = () => void queryClient.invalidateQueries({ queryKey: ["payments"] });
  const markPaidMutation = useMutation({
    mutationFn: (paymentId: string) => paymentApi.markPaid(paymentId, { transactionCode: `MANUAL-${Date.now()}` }),
    onSuccess: invalidatePayments,
  });
  const cancelMutation = useMutation({
    mutationFn: (paymentId: string) => paymentApi.cancel(paymentId),
    onSuccess: invalidatePayments,
  });
  const error = paymentsQuery.error ?? employeesQuery.error ?? markPaidMutation.error ?? cancelMutation.error;
  const payments = paymentsQuery.data?.data ?? [];
  const totals = useMemo(() => ({
    paid: payments.filter((payment) => payment.paymentStatus === "paid").reduce((sum, payment) => sum + payment.amount, 0),
    pending: payments.filter((payment) => payment.paymentStatus === "pending").length,
    failed: payments.filter((payment) => ["failed", "expired", "cancelled"].includes(payment.paymentStatus)).length,
  }), [payments]);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Vận hành thanh toán</h1>
          <p className="text-sm text-[#444748]">Theo dõi giao dịch, xử lý thủ công và tạo thanh toán lương.</p>
        </div>
        <div className="flex gap-2">
          <select className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold" onChange={(event) => setPurpose(event.target.value as "" | PaymentPurpose)} value={purpose}>
            <option value="">Tất cả mục đích</option>
            <option value="subscription">Gói đăng ký</option>
            <option value="registration">Đăng ký</option>
            <option value="payroll">Lương</option>
            <option value="other">Khác</option>
          </select>
          <select className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold" onChange={(event) => setStatus(event.target.value as "" | PaymentStatus)} value={status}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="paid">Đã thanh toán</option>
            <option value="failed">Thất bại</option>
            <option value="cancelled">Đã hủy</option>
            <option value="expired">Hết hạn</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
        </div>
      </header>
      {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(error, "Không thể xử lý thanh toán.")}</p> : null}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric icon={<BadgeDollarSign />} label="Đã thanh toán" value={formatCurrency(totals.paid, "VND")} />
        <Metric icon={<CreditCard />} label="Đang chờ" value={String(totals.pending)} />
        <Metric icon={<XCircle />} label="Cần xem" value={String(totals.failed)} />
      </section>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white xl:col-span-2">
          <div className="flex items-center gap-2 border-b border-[#e5e7eb] px-5 py-4"><Search className="h-4 w-4 text-[#444748]" /><span className="text-sm font-semibold text-[#444748]">{paymentsQuery.isLoading ? "Đang tải..." : `${payments.length} giao dịch`}</span></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-[#f5f5f5] text-xs font-bold uppercase text-[#444748]"><tr><th className="px-4 py-3">Mã</th><th className="px-4 py-3">Mục đích</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Ngày</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-[#e5e7eb]">{payments.length === 0 ? <tr><td className="px-4 py-6 text-sm font-semibold text-[#444748]" colSpan={6}>Chưa có giao dịch.</td></tr> : payments.map((payment) => <PaymentRow key={payment.id} onSelect={() => setSelectedId(payment.id)} payment={payment} selected={selectedPayment?.id === payment.id} />)}</tbody>
            </table>
          </div>
        </section>
        <aside className="space-y-6">
          <PaymentDetailCard canceling={cancelMutation.isPending} marking={markPaidMutation.isPending} onCancel={() => selectedPayment && cancelMutation.mutate(selectedPayment.id)} onMarkPaid={() => selectedPayment && markPaidMutation.mutate(selectedPayment.id)} payment={selectedPayment} />
          <PayrollPaymentForm employees={employeesQuery.data?.data ?? []} organizationId={organizationId} />
        </aside>
      </div>
    </main>
  );
};

const PayrollPaymentForm = ({ employees, organizationId }: { employees: Array<{ id: string; fullName: string }>; organizationId?: string }) => {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState("");
  const [from, setFrom] = useState(toDateInputValue(addDays(new Date(), -30)));
  const [to, setTo] = useState(toDateInputValue(new Date()));
  const [hourlyRate, setHourlyRate] = useState(25000);
  const [calculation, setCalculation] = useState<number | null>(null);
  const calculateMutation = useMutation({
    mutationFn: () => paymentApi.calculatePayroll({ employeeId, from, to, hourlyRate, organizationId, paymentMethod: "bank_transfer" }),
    onSuccess: (result) => setCalculation(result.payroll.netAmount),
  });
  const createMutation = useMutation({
    mutationFn: () => paymentApi.createPayroll({ employeeId, from, to, hourlyRate, organizationId, paymentMethod: "bank_transfer", note: "Thanh toán lương từ trang vận hành" }),
    onSuccess: () => {
      setCalculation(null);
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    calculateMutation.mutate();
  };

  return (
    <form className="rounded-xl border border-[#e5e7eb] bg-white p-5" onSubmit={submit}>
      <h2 className="mb-4 text-xl font-semibold">Tạo thanh toán lương</h2>
      {(calculateMutation.error || createMutation.error) ? <p className="mb-3 rounded-lg bg-[#ffdad6] px-3 py-2 text-xs font-semibold text-[#93000a]">{getApiErrorMessage(calculateMutation.error ?? createMutation.error, "Không thể tạo thanh toán lương.")}</p> : null}
      <div className="space-y-3">
        <label className="block space-y-1"><span className="text-sm font-semibold">Nhân viên</span><select className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm" onChange={(event) => setEmployeeId(event.target.value)} required value={employeeId}><option value="">Chọn nhân viên</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2"><Input label="Từ" onChange={setFrom} type="date" value={from} /><Input label="Đến" onChange={setTo} type="date" value={to} /></div>
        <Input label="Lương giờ" onChange={(value) => setHourlyRate(Number(value))} type="number" value={String(hourlyRate)} />
      </div>
      {calculation !== null ? <p className="mt-4 rounded-lg bg-[#f5f5f5] px-3 py-2 text-sm font-semibold">Số tiền thực nhận: {formatCurrency(calculation, "VND")}</p> : null}
      <div className="mt-4 flex gap-2"><button className="h-10 flex-1 rounded-lg border border-[#e5e7eb] text-sm font-semibold" disabled={calculateMutation.isPending} type="submit">{calculateMutation.isPending ? "Đang tính..." : "Tính lương"}</button><button className="h-10 flex-1 rounded-lg bg-black text-sm font-semibold text-white disabled:opacity-50" disabled={!calculation || createMutation.isPending} onClick={() => createMutation.mutate()} type="button">{createMutation.isPending ? "Đang tạo..." : "Tạo giao dịch"}</button></div>
    </form>
  );
};

const PaymentDetailCard = ({ canceling, marking, onCancel, onMarkPaid, payment }: { canceling: boolean; marking: boolean; onCancel: () => void; onMarkPaid: () => void; payment?: Payment }) => (
  <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
    <h2 className="mb-4 text-xl font-semibold">Chi tiết giao dịch</h2>
    {!payment ? (
      <p className="text-sm font-semibold text-[#444748]">Chọn một giao dịch.</p>
    ) : (
      <div className="space-y-3 text-sm">
        <Line label="Mã" value={`SSPAY-${payment.orderCode}`} />
        <Line label="Nhà cung cấp" value={toPaymentProviderLabel(payment.provider)} />
        <Line label="Phương thức" value={toPaymentMethodLabel(payment.paymentMethod)} />
        <Line label="Mã giao dịch" value={payment.transactionCode ?? "--"} />
        <Line label="Ghi chú" value={payment.note ?? "--"} />
        {payment.purpose === "subscription" ? (
          <p className="rounded-lg bg-[#f5f5f5] px-3 py-2 text-xs font-semibold text-[#444748]">
            Thanh toán gói đăng ký được đối soát qua PayOS hoặc bộ phận admin. Chủ sở hữu không tự đánh dấu đã thanh toán hay hoàn tiền gói.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black text-sm font-semibold text-white disabled:opacity-50"
            disabled={payment.paymentStatus === "paid" || payment.purpose === "subscription" || marking}
            onClick={onMarkPaid}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            Đánh dấu đã thanh toán
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] text-sm font-semibold disabled:opacity-50"
            disabled={payment.paymentStatus !== "pending" || canceling}
            onClick={onCancel}
            type="button"
          >
            <XCircle className="h-4 w-4" />
            Hủy giao dịch
          </button>
        </div>
      </div>
    )}
  </section>
);

const PaymentRow = ({ onSelect, payment, selected }: { onSelect: () => void; payment: Payment; selected: boolean }) => <tr className={selected ? "bg-[#f7f3f2]" : "hover:bg-[#f7f3f2]"}><td className="px-4 py-3 font-semibold">SSPAY-{payment.orderCode}</td><td className="px-4 py-3 text-[#444748]">{toPaymentPurposeLabel(payment.purpose)}</td><td className="px-4 py-3 font-bold">{formatCurrency(payment.amount, payment.currency)}</td><td className="px-4 py-3"><StatusBadge status={payment.paymentStatus} /></td><td className="px-4 py-3 text-[#444748]">{formatDate(payment.paidAt ?? payment.expiresAt ?? payment.failedAt ?? new Date().toISOString())}</td><td className="px-4 py-3 text-right"><button className="text-sm font-semibold text-[#0058be] hover:underline" onClick={onSelect} type="button">Xem</button></td></tr>;
const StatusBadge = ({ status }: { status: PaymentStatus }) => <span className={`rounded-full px-2 py-1 text-xs font-bold ${status === "paid" ? "bg-[#10b981]/10 text-[#10b981]" : status === "pending" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#ffdad6] text-[#93000a]"}`}>{toPaymentStatusLabel(status)}</span>;
const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-white p-5"><div className="mb-3 text-[#444748]">{icon}</div><p className="text-xs font-bold uppercase text-[#444748]">{label}</p><p className="text-2xl font-semibold">{value}</p></div>;
const Line = ({ label, value }: { label: string; value: string }) => <div className="flex justify-between gap-4 border-b border-[#e5e7eb] pb-2"><span className="text-[#444748]">{label}</span><span className="text-right font-semibold">{value}</span></div>;
const Input = ({ label, onChange, type = "text", value }: { label: string; onChange: (value: string) => void; type?: string; value: string }) => <label className="block space-y-1"><span className="text-sm font-semibold">{label}</span><input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm" onChange={(event) => onChange(event.target.value)} required type={type} value={value} /></label>;
const formatCurrency = (value: number, currency: "VND" | "USD") => new Intl.NumberFormat("vi-VN", { currency, maximumFractionDigits: currency === "VND" ? 0 : 2, style: "currency" }).format(value);
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const toPaymentPurposeLabel = (purpose: PaymentPurpose) => purpose === "subscription" ? "Gói đăng ký" : purpose === "registration" ? "Đăng ký tài khoản" : purpose === "payroll" ? "Thanh toán lương" : "Khác";
const toPaymentStatusLabel = (status: PaymentStatus) => status === "paid" ? "Đã thanh toán" : status === "pending" ? "Đang chờ" : status === "failed" ? "Thất bại" : status === "cancelled" ? "Đã hủy" : status === "expired" ? "Hết hạn" : "Đã hoàn tiền";
const toPaymentMethodLabel = (method: Payment["paymentMethod"]) => method === "payos" ? "PayOS" : method === "bank_transfer" ? "Chuyển khoản" : "Tiền mặt";
const toPaymentProviderLabel = (provider: Payment["provider"]) => provider === "payos" ? "PayOS" : "Thủ công";
const toDateInputValue = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
