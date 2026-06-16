import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid3X3,
  HelpCircle,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Store,
  Table2,
  Timer,
  UsersRound,
  X,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { branchApi } from "@/features/employeeBranch/branch.api";
import { paymentApi } from "@/features/payment/payment.api";
import type { Payment, PaymentStatus } from "@/features/payment/payment.types";
import { reportApi } from "@/features/reportSubscription/report.api";
import type { ReportSummary } from "@/features/reportSubscription/report.types";
import { subscriptionApi } from "@/features/subscription/subscription.api";
import type { Subscription, SubscriptionPlan } from "@/features/subscription/subscription.types";
import { getApiErrorMessage } from "@/shared/api";
import { useAuthStore } from "@/store";

export const ReportsPage = () => {
  const [activeDetail, setActiveDetail] = useState<"employee-hours" | "late-statistics" | "branch-summary" | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "branches" | "exceptions" | "payroll">("overview");
  const today = new Date();
  const [rangePreset, setRangePreset] = useState<"7d" | "30d" | "month" | "lastMonth" | "quarter" | "custom">("30d");
  const [customFrom, setCustomFrom] = useState(toDateInputValue(addDays(today, -29)));
  const [customTo, setCustomTo] = useState(toDateInputValue(today));
  const [branchId, setBranchId] = useState("");
  const range = resolveReportRange(rangePreset, customFrom, customTo);
  const branchesQuery = useQuery({
    queryKey: ["branches", "report-filter"],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const reportQuery = useQuery({
    queryKey: ["reports", "owner-summary", { branchId, from: range.from, to: range.to }],
    queryFn: () => reportApi.ownerSummary({ from: range.from, to: range.to, ...(branchId ? { branchId } : {}) }),
  });
  const summary = reportQuery.data;
  const trend = summary?.attendanceTrend ?? [];
  const maxTrendCount = Math.max(1, ...trend.map((item) => item.count));
  const trendHeights = trend.slice(-10).map((item) => Math.max(6, Math.round((item.count / maxTrendCount) * 100)));
  const trendLabels = trend.slice(-10).map((item) => item.label);
  const employeeHours = summary?.employeeHours ?? [];
  const maxEmployeeHours = Math.max(1, ...employeeHours.map((item) => item.hours));
  const branchSummary = summary?.branchSummary ?? [];
  const exceptions = summary?.exceptions ?? [];
  const employeeDetails = summary?.employeeDetails ?? [];
  const tabs: Array<{ label: string; value: typeof activeTab }> = [
    { label: "Tổng quan", value: "overview" },
    { label: "Nhân viên", value: "employees" },
    { label: "Chi nhánh", value: "branches" },
    { label: "Ngoại lệ", value: "exceptions" },
    { label: "Lương ước tính", value: "payroll" },
  ];

  return (
    <ReportShell title="Báo cáo & phân tích" search="Tìm báo cáo, chi nhánh...">
      <main className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Báo cáo & phân tích</h1>
            <p className="text-base text-[#444748]">Theo dõi vận hành theo khoảng ngày, chi nhánh, nhân viên và các ngoại lệ cần xử lý.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90" onClick={() => exportReportCsv(summary)} type="button"><Download className="h-4 w-4" />Xuất CSV</button>
          </div>
        </div>
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="grid gap-3 md:grid-cols-5">
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase text-[#444748]">Khoảng thời gian</span>
              <select className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold" onChange={(event) => setRangePreset(event.target.value as typeof rangePreset)} value={rangePreset}>
                <option value="7d">7 ngày gần nhất</option>
                <option value="30d">30 ngày gần nhất</option>
                <option value="month">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="quarter">Quý này</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase text-[#444748]">Từ ngày</span>
              <input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold disabled:bg-[#f5f5f5]" disabled={rangePreset !== "custom"} onChange={(event) => setCustomFrom(event.target.value)} type="date" value={range.from} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase text-[#444748]">Đến ngày</span>
              <input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold disabled:bg-[#f5f5f5]" disabled={rangePreset !== "custom"} onChange={(event) => setCustomTo(event.target.value)} type="date" value={range.to} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-bold uppercase text-[#444748]">Chi nhánh</span>
              <select className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
                <option value="">Tất cả chi nhánh</option>
                {(branchesQuery.data?.data ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>
          </div>
        </section>
        {reportQuery.isError ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(reportQuery.error, "Không thể tải báo cáo.")}</p> : null}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportKpi icon={<CheckCircle2 />} label="Tỷ lệ có mặt" loading={reportQuery.isLoading} trend={`${summary?.kpis.attendanceCount ?? 0} lượt`} value={summary ? `${summary.kpis.averageAttendanceRate}%` : "--"} />
          <ReportKpi icon={<Timer />} label="Tổng giờ làm" loading={reportQuery.isLoading} trend="Tổng giờ" value={summary ? formatNumber(summary.kpis.totalWorkHours) : "--"} />
          <ReportKpi icon={<AlertTriangle />} label="Ngoại lệ" loading={reportQuery.isLoading} trend={`${summary?.kpis.missingCheckoutCount ?? 0} thiếu checkout`} trendTone="danger" value={summary ? String(exceptions.length) : "--"} />
          <ReportKpi icon={<CreditCard />} label="Lương ước tính" loading={reportQuery.isLoading} trend={`${summary?.kpis.overtimeHours ?? 0}h tăng ca`} value={summary ? formatCurrency(summary.kpis.payrollEstimate, "VND") : "--"} />
        </section>
        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white p-2">
          {tabs.map((tab) => (
            <button className={activeTab === tab.value ? "shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white" : "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]"} key={tab.value} onClick={() => setActiveTab(tab.value)} type="button">
              {tab.label}
            </button>
          ))}
        </nav>
        {activeTab === "overview" ? (
          <>
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-black">Xu hướng chấm công</h2>
              <p className="text-base text-[#444748]">Số lượt chấm công hằng ngày trên toàn bộ chi nhánh</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white" type="button">Chế độ cột</button>
            </div>
          </div>
          <BarChart heights={trendHeights.length > 0 ? trendHeights : [6]} labels={trendLabels.length > 0 ? trendLabels : ["--"]} />
        </section>
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ReportCard onViewFull={() => setActiveDetail("employee-hours")} title="Giờ làm của nhân viên"><div className="space-y-3 rounded-lg border border-[#e5e7eb] bg-white p-4">{employeeHours.length === 0 ? <p className="text-sm font-semibold text-[#444748]">Chưa có dữ liệu giờ làm.</p> : employeeHours.map((item, index) => <div key={item.employeeId}><div className="mb-1 flex justify-between gap-3 text-xs font-bold"><span className="truncate text-[#444748]">{item.employeeName}</span><span>{formatNumber(item.hours)}h</span></div><div className="h-3 overflow-hidden rounded-full bg-[#f1edec]"><div className="h-full bg-black" style={{ width: `${Math.max(6, Math.round((item.hours / maxEmployeeHours) * 100))}%`, opacity: 1 - index * 0.12 }} /></div></div>)}</div></ReportCard>
          <ReportCard onViewFull={() => setActiveDetail("late-statistics")} title="Thống kê đi muộn"><div className="flex items-center justify-center rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="relative flex h-24 w-24 items-center justify-center rounded-full border-8 border-[#f1edec]"><div className="absolute inset-[-8px] rounded-full border-8 border-black border-b-transparent border-r-transparent" style={{ transform: `rotate(${Math.min(360, (summary?.kpis.lateRate ?? 0) * 3.6)}deg)` }} /><b>{summary ? `${summary.kpis.lateRate}%` : "--"}</b></div></div></ReportCard>
          <ReportCard onViewFull={() => setActiveDetail("branch-summary")} title="Tóm tắt chi nhánh"><div className="space-y-4 rounded-lg border border-[#e5e7eb] bg-white p-4">{branchSummary.length === 0 ? <p className="text-sm font-semibold text-[#444748]">Chưa có dữ liệu chi nhánh.</p> : branchSummary.map((row) => <div className="flex justify-between gap-3 text-xs font-bold" key={row.branchId}><span className="truncate text-[#444748]">{row.branchName}</span><span>{formatNumber(row.workHours)}h</span></div>)}</div></ReportCard>
        </section>
          </>
        ) : null}
        {activeTab === "employees" ? <EmployeeReportTable rows={employeeDetails} /> : null}
        {activeTab === "branches" ? <BranchPerformanceTable rows={branchSummary} /> : null}
        {activeTab === "exceptions" ? <ExceptionTable rows={exceptions} /> : null}
        {activeTab === "payroll" ? <PayrollEstimateTable rows={employeeDetails} total={summary?.kpis.payrollEstimate ?? 0} /> : null}
        {activeDetail ? <ReportDetailModal detail={activeDetail} onClose={() => setActiveDetail(null)} summary={summary} /> : null}
      </main>
    </ReportShell>
  );
};

export const ExportReportPage = () => (
  <>
    <ReportsPage />
    <XuấtReportModal />
  </>
);

export const SubscriptionPage = () => {
  const organizationId = useAuthStore((state) => state.user?.organizationId);
  const subscriptionQuery = useQuery({
    queryKey: ["subscription", "current", organizationId],
    queryFn: () => subscriptionApi.current(organizationId),
  });
  const limitsQuery = useQuery({
    queryKey: ["subscription", "limits", organizationId],
    queryFn: () => subscriptionApi.limits(organizationId),
  });
  const paymentsQuery = useQuery({
    queryKey: ["payments", "subscription", organizationId],
    queryFn: () =>
      paymentApi.list({
        organizationId,
        purpose: "subscription",
        page: 1,
        limit: 20,
      }),
  });
  const subscription = subscriptionQuery.data;
  const usage = limitsQuery.data;
  const displayedEmployeeLimit = normalizeDisplayedLimit(subscription?.planCode, "employees", subscription?.limits.maxEmployees);
  const displayedBranchLimit = normalizeDisplayedLimit(subscription?.planCode, "branches", subscription?.limits.maxBranches);
  const payments = paymentsQuery.data?.data ?? [];
  const latestPayment = payments[0];
  const totalPaid = payments
    .filter((payment) => payment.paymentStatus === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const error = subscriptionQuery.error ?? limitsQuery.error ?? paymentsQuery.error;

  return (
    <ReportShell title="Gói đăng ký & thanh toán" search="Tìm hóa đơn...">
      <main className="mx-auto max-w-7xl p-4 md:p-10">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-black">Gói đăng ký & thanh toán</h1>
          <p className="max-w-2xl text-base text-[#444748]">Quản lý gói doanh nghiệp, thanh toán PayOS và xem lịch sử giao dịch.</p>
        </header>
        {error ? <p className="mb-6 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(error, "Không thể tải dữ liệu gói đăng ký.")}</p> : null}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <span className="mb-4 inline-block rounded bg-black px-2 py-1 text-sm font-semibold text-white">GÓI HIỆN TẠI</span>
                  <h2 className="text-2xl font-semibold tracking-tight text-black">{subscriptionQuery.isLoading ? "Đang tải..." : subscription?.planName ?? "Chưa có gói active"}</h2>
                  <p className="text-[#444748]">{subscription ? `${toSubscriptionStatusLabel(subscription.status)} - ${displayedEmployeeLimit} nhân viên tối đa` : "Chọn một gói để bắt đầu sử dụng."}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-2xl font-semibold">{subscription ? formatCurrency(subscription.priceMonthly, subscription.currency) : "--"}<span className="text-base text-[#444748]">/tháng</span></p>
                  <p className="text-xs text-[#444748]">Gia hạn: {subscription ? formatDate(subscription.endDate) : "--"}</p>
                </div>
              </div>
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <MiniMetric label="Nhân viên" value={formatUsageWithOverride(usage?.limits.employees, displayedEmployeeLimit)} />
                <MiniMetric label="Chi nhánh" value={formatUsageWithOverride(usage?.limits.branches, displayedBranchLimit)} />
                <MiniMetric label="Mẫu ca" value={formatUsage(usage?.limits.shiftTemplates)} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white" to="/dashboard/subscription/plans">Đổi gói</Link>
                <Link className="rounded-lg border border-[#e5e7eb] bg-white px-6 py-3 text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/subscription/plans">So sánh gói</Link>
              </div>
            </section>
            <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
              <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-tight">Phương thức thanh toán</h2><span className="text-sm font-semibold text-[#444748]">PayOS</span></div>
              <div className="flex items-center gap-6 rounded-lg border border-[#e5e7eb] bg-white p-6">
                <div className="flex h-10 w-16 items-center justify-center rounded border border-[#e5e7eb] bg-[#ebe7e6]"><CreditCard className="h-5 w-5" /></div>
                <div className="flex-1"><p className="font-semibold">Thanh toán qua PayOS</p><p className="text-xs text-[#444748]">{latestPayment ? `Giao dịch gần nhất: SSPAY-${latestPayment.orderCode}` : "Chưa có giao dịch gói đăng ký."}</p></div>
                <span className="flex items-center gap-2 text-xs text-[#444748]"><span className="h-2 w-2 rounded-full bg-[#10b981]" />Đang hoạt động</span>
              </div>
            </section>
          </div>
          <div className="space-y-6 lg:col-span-5">
            <section className="rounded-xl bg-black p-6 text-white"><h2 className="mb-4 text-2xl font-semibold">Cần hỗ trợ thanh toán?</h2><p className="mb-8 text-white/75">Liên hệ bộ phận vận hành để kiểm tra giao dịch, hóa đơn hoặc trạng thái webhook PayOS.</p><Link className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black" to="/about-contact">Liên hệ hỗ trợ</Link></section>
            <section className="rounded-xl border border-[#e5e7eb] bg-white p-6"><h3 className="mb-4 text-sm font-semibold">Tóm tắt nhanh</h3><div className="space-y-4"><BillLine label="Phí gói hiện tại" value={subscription ? formatCurrency(subscription.priceMonthly, subscription.currency) : "--"} /><BillLine label="Đã thanh toán" value={formatCurrency(totalPaid, latestPayment?.currency ?? subscription?.currency ?? "VND")} /><BillLine label="Giao dịch chờ" value={String(payments.filter((payment) => payment.paymentStatus === "pending").length)} border /><BillLine label="Kỳ hiện tại kết thúc" value={subscription ? formatDate(subscription.endDate) : "--"} strong /></div></section>
          </div>
          <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white lg:col-span-12">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4"><h2 className="text-2xl font-semibold tracking-tight">Lịch sử thanh toán</h2><span className="inline-flex gap-2 text-sm font-semibold text-[#444748]"><Filter className="h-4 w-4" />{paymentsQuery.isLoading ? "Đang tải" : `${payments.length} giao dịch`}</span></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f5f5f5] text-xs font-bold uppercase tracking-wider text-[#444748]"><tr><th className="px-6 py-4">Ngày</th><th className="px-6 py-4">Mã thanh toán</th><th className="px-6 py-4">Số tiền</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Ghi chú</th></tr></thead><tbody className="divide-y divide-[#e5e7eb]">{payments.length === 0 ? <tr><td className="px-6 py-4 text-sm font-semibold text-[#444748]" colSpan={5}>Chưa có giao dịch gói đăng ký.</td></tr> : payments.map((payment) => <PaymentHistoryRow key={payment.id} payment={payment} />)}</tbody></table></div>
          </section>
        </div>
      </main>
    </ReportShell>
  );
};

export const PricingPlansPage = () => {
  const [yearly, setYearly] = useState(false);
  const organizationId = useAuthStore((state) => state.user?.organizationId);
  const plansQuery = useQuery({
    queryKey: ["subscription", "plans", "active"],
    queryFn: () => subscriptionApi.plans({ status: "active", page: 1, limit: 20 }),
  });
  const currentSubscriptionQuery = useQuery({
    queryKey: ["subscription", "current", organizationId],
    queryFn: () => subscriptionApi.current(organizationId),
  });
  const checkoutMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      paymentApi.createSubscription({
        organizationId: organizationId ?? "",
        planId: plan.id,
        months: yearly ? 12 : 1,
        paymentMethod: "payos",
        note: `Thanh toán gói ${plan.code}`,
      }),
    onSuccess: (result) => {
      if (result.payment.checkoutUrl) {
        window.location.assign(result.payment.checkoutUrl);
      }
    },
  });
  const plans = plansQuery.data?.data ?? [];
  const mutationError = checkoutMutation.error;

  return (
    <ReportShell title="Gói giá" search="Tìm gói...">
      <main className="mx-auto max-w-7xl space-y-12 p-4 py-10 md:p-10">
        <section className="text-center"><h1 className="mb-4 text-5xl font-semibold tracking-tight">Bảng giá đơn giản, minh bạch</h1><p className="mx-auto mb-8 max-w-2xl text-lg text-[#444748]">Chọn gói phù hợp với nhu cầu doanh nghiệp của bạn. Mở rộng hoặc thu hẹp khi đội ngũ thay đổi.</p><div className="flex items-center justify-center gap-4"><span className="font-semibold">Theo tháng</span><button className={yearly ? "relative h-6 w-12 rounded-full bg-black" : "relative h-6 w-12 rounded-full bg-[#e5e2e1]"} onClick={() => setYearly((v) => !v)}><span className={yearly ? "absolute left-7 top-1 h-4 w-4 rounded-full bg-white transition" : "absolute left-1 top-1 h-4 w-4 rounded-full bg-black transition"} /></button><span className="font-semibold">Theo năm</span><span className="rounded-full bg-[#d8e2ff] px-2 py-1 text-xs font-bold text-[#001a42]">GIẢM 20%</span></div></section>
        {plansQuery.isError ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(plansQuery.error, "Không thể tải danh sách gói.")}</p> : null}
        {mutationError ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(mutationError, "Không thể tạo thanh toán gói.")}</p> : null}
        <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {plansQuery.isLoading ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm font-semibold text-[#444748] md:col-span-2">Đang tải bảng giá...</p> : null}
          {!plansQuery.isLoading && plans.length === 0 ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm font-semibold text-[#444748] md:col-span-2">Chưa có gói active. Vui lòng tạo gói trong hệ thống trước.</p> : null}
          {plans.map((plan, index) => (
            <PlanCard
              current={currentSubscriptionQuery.data?.planId === plan.id}
              disabled={!organizationId || checkoutMutation.isPending || currentSubscriptionQuery.data?.planId === plan.id}
              featured={index === 1 || plan.features.payroll}
              key={plan.id}
              loading={checkoutMutation.isPending && checkoutMutation.variables?.id === plan.id}
              plan={plan}
              yearly={yearly}
              onSelect={() => checkoutMutation.mutate(plan)}
            />
          ))}
        </section>
        <section className="mx-auto max-w-5xl"><h2 className="mb-8 text-center text-4xl font-semibold tracking-tight">So sánh tính năng</h2><PlanComparisonTable plans={plans} /></section>
      </main>
    </ReportShell>
  );
};

export const PaymentSuccessPage = () => {
  const organizationId = useAuthStore((state) => state.user?.organizationId);
  const subscriptionQuery = useQuery({
    queryKey: ["subscription", "current", organizationId, "payment-success"],
    queryFn: () => subscriptionApi.current(organizationId),
    refetchInterval: (query) => query.state.data ? false : 3000,
    retry: 5,
  });
  const paymentsQuery = useQuery({
    queryKey: ["payments", "subscription", organizationId, "payment-success"],
    queryFn: () => paymentApi.list({ organizationId, purpose: "subscription", paymentStatus: "paid", page: 1, limit: 1 }),
    refetchInterval: (query) => (query.state.data?.data.length ? false : 3000),
    retry: 5,
  });
  const subscription = subscriptionQuery.data;
  const payment = paymentsQuery.data?.data[0];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-between border-b border-[#e5e7eb] px-6"><Link className="text-2xl font-black" to="/">SmartShift</Link><Link className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white" to="/dashboard">Bảng điều khiển</Link></header>
      <main className="flex flex-1 items-center justify-center p-6"><div className="flex w-full max-w-[480px] flex-col items-center text-center"><div className="relative mb-8"><div className="absolute inset-0 animate-ping rounded-full bg-[#10b981]/10" /><div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#10b981] shadow-lg"><CheckCircle2 className="h-12 w-12 text-white" /></div></div><h1 className="mb-2 text-4xl font-semibold tracking-tight">Thanh toán thành công</h1><p className="mb-12 text-lg text-[#444748]">{subscription ? `Gói ${subscription.planName} của bạn đang hoạt động. Hệ thống đã cập nhật giới hạn và tính năng theo gói mới.` : "Hệ thống đang đồng bộ trạng thái thanh toán từ PayOS."}</p><div className="mb-12 w-full rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 text-left"><div className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-4"><span className="text-sm font-semibold text-[#444748]">Tóm tắt biên nhận</span><span className="rounded-full bg-[#10b981]/10 px-2 py-1 text-xs font-bold text-[#10b981]">ĐÃ THANH TOÁN</span></div><div className="space-y-4"><BillLine label="Số tiền đã trừ" value={payment ? formatCurrency(payment.amount, payment.currency) : "--"} strong /><BillLine label="Mã giao dịch" value={payment?.transactionCode ?? (payment ? `SSPAY-${payment.orderCode}` : "--")} /><BillLine label="Ngày gia hạn tiếp theo" value={subscription ? formatDate(subscription.endDate) : "--"} /><BillLine label="Phương thức thanh toán" value="PayOS" /></div></div><div className="w-full space-y-3"><Link className="flex h-12 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" to="/dashboard/subscription">Quay lại gói đăng ký</Link><Link className="flex h-12 items-center justify-center rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard">Quay lại bảng điều khiển</Link></div></div></main>
    </div>
  );
};

const ReportShell = ({ action, children, search, title }: { action?: ReactNode; children: ReactNode; search: string; title: string }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-6"><h2 className="shrink-0 text-2xl font-semibold tracking-tight text-black">{title}</h2><div className="relative hidden w-80 lg:block"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" /><input className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder={search} /></div></div>
      <div className="flex items-center gap-4"><button className="hidden items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm font-semibold text-[#444748] md:inline-flex"><Store className="h-4 w-4" />Trụ sở chính</button><Bell className="h-5 w-5 text-[#444748]" />{action}</div>
    </header>
    {children}
  </div>
);

const ReportKpi = ({ icon, label, loading, trend, trendTone, value }: { icon: ReactNode; label: string; loading?: boolean; trend: string; trendTone?: "danger"; value: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div className="mb-4 flex items-start justify-between"><span className="rounded-lg border border-[#e5e7eb] bg-white p-2 [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className={trendTone === "danger" ? "text-xs font-bold text-[#ef4444]" : "text-xs font-bold text-[#10b981]"}>{loading ? "Đang tải" : trend}</span></div><p className="text-sm font-semibold text-[#444748]">{label}</p><p className="text-4xl font-semibold tracking-tight text-black">{loading ? "--" : value}</p></div>
);

const BarChart = ({ heights, labels }: { heights: number[]; labels: string[] }) => (
  <><div className="flex h-80 items-end gap-2 overflow-hidden rounded-xl bg-[#f7f3f2] px-4">{heights.map((height, index) => <div className={index === 3 ? "flex-1 rounded-t-lg bg-black shadow-lg" : "flex-1 rounded-t-lg bg-black/10 transition hover:bg-black/20"} key={index} style={{ height: `${height}%` }} />)}</div><div className="mt-4 flex justify-between px-2 text-xs font-bold uppercase text-[#444748]">{labels.map((label, i) => <span key={`${label}-${i}`}>{label}</span>)}</div></>
);

const ReportCard = ({ children, onViewFull, title }: { children: ReactNode; onViewFull: () => void; title: string }) => (
  <article className="flex flex-col rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div className="mb-4 flex items-start justify-between"><h3 className="text-sm font-semibold">{title}</h3><MoreVertical className="h-5 w-5 text-[#444748]" /></div><div className="mb-6 flex-1">{children}</div><div className="flex gap-2"><button className="flex-1 rounded-lg bg-black py-2 text-xs font-bold text-white" onClick={onViewFull} type="button">Xem đầy đủ</button><button className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-xs font-bold" type="button">Xuất</button></div></article>
);

const ReportDetailModal = ({
  detail,
  onClose,
  summary,
}: {
  detail: "employee-hours" | "late-statistics" | "branch-summary";
  onClose: () => void;
  summary?: ReportSummary;
}) => {
  const title =
    detail === "employee-hours"
      ? "Chi tiết giờ làm nhân viên"
      : detail === "late-statistics"
        ? "Chi tiết đi muộn"
        : "Chi tiết chi nhánh";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-[#444748]">Khoảng thời gian: {summary ? `${formatDate(summary.range.from)} - ${formatDate(summary.range.to)}` : "--"}</p>
          </div>
          <button className="rounded-lg p-2 text-[#444748] hover:bg-[#f7f3f2]" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {detail === "employee-hours" ? <EmployeeHoursDetail rows={summary?.employeeHours ?? []} /> : null}
          {detail === "late-statistics" ? <LateStatisticsDetail summary={summary} /> : null}
          {detail === "branch-summary" ? <BranchSummaryDetail rows={summary?.branchSummary ?? []} /> : null}
        </div>
      </div>
    </div>
  );
};

const EmployeeHoursDetail = ({ rows }: { rows: ReportSummary["employeeHours"] }) => (
  <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
    <table className="w-full min-w-[560px] text-left">
      <thead className="bg-[#f5f5f5] text-xs font-bold uppercase text-[#444748]"><tr><th className="px-4 py-3">Nhân viên</th><th className="px-4 py-3 text-right">Giờ làm</th></tr></thead>
      <tbody className="divide-y divide-[#e5e7eb]">{rows.length === 0 ? <tr><td className="px-4 py-3 text-sm font-semibold text-[#444748]" colSpan={2}>Chưa có dữ liệu giờ làm.</td></tr> : rows.map((row) => <tr className="hover:bg-[#f7f3f2]" key={row.employeeId}><td className="px-4 py-3 font-semibold">{row.employeeName}</td><td className="px-4 py-3 text-right font-bold">{formatNumber(row.hours)}h</td></tr>)}</tbody>
    </table>
  </div>
);

const LateStatisticsDetail = ({ summary }: { summary?: ReportSummary }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    <MiniMetric label="Tỷ lệ đi muộn" value={summary ? `${summary.kpis.lateRate}%` : "--"} />
    <MiniMetric label="Tổng lượt chấm công" value={summary ? String(summary.kpis.attendanceCount) : "--"} />
    <MiniMetric label="Nhân viên hoạt động" value={summary ? String(summary.kpis.activeEmployees) : "--"} />
  </div>
);

const BranchSummaryDetail = ({ rows }: { rows: ReportSummary["branchSummary"] }) => (
  <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
    <table className="w-full min-w-[720px] text-left">
      <thead className="bg-[#f5f5f5] text-xs font-bold uppercase text-[#444748]"><tr><th className="px-4 py-3">Chi nhánh</th><th className="px-4 py-3 text-right">Lượt chấm công</th><th className="px-4 py-3 text-right">Giờ làm</th><th className="px-4 py-3 text-right">Tỷ lệ muộn</th></tr></thead>
      <tbody className="divide-y divide-[#e5e7eb]">{rows.length === 0 ? <tr><td className="px-4 py-3 text-sm font-semibold text-[#444748]" colSpan={4}>Chưa có dữ liệu chi nhánh.</td></tr> : rows.map((row) => <tr className="hover:bg-[#f7f3f2]" key={row.branchId}><td className="px-4 py-3 font-semibold">{row.branchName}</td><td className="px-4 py-3 text-right">{row.attendanceCount}</td><td className="px-4 py-3 text-right font-bold">{formatNumber(row.workHours)}h</td><td className="px-4 py-3 text-right">{row.lateRate}%</td></tr>)}</tbody>
    </table>
  </div>
);

const EmployeeReportTable = ({ rows }: { rows: ReportSummary["employeeDetails"] }) => (
  <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
    <TableHeader title="Báo cáo nhân viên" subtitle={`${rows.length} nhân viên có dữ liệu trong kỳ`} />
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left">
        <thead className="bg-[#f5f5f5] text-xs font-bold uppercase text-[#444748]"><tr><th className="px-4 py-3">Nhân viên</th><th className="px-4 py-3 text-right">Lượt công</th><th className="px-4 py-3 text-right">Giờ làm</th><th className="px-4 py-3 text-right">Tăng ca</th><th className="px-4 py-3 text-right">Đi muộn</th><th className="px-4 py-3 text-right">Vắng</th><th className="px-4 py-3 text-right">Thiếu checkout</th></tr></thead>
        <tbody className="divide-y divide-[#e5e7eb]">{rows.length === 0 ? <EmptyTableRow colSpan={7} label="Chưa có dữ liệu nhân viên." /> : rows.map((row) => <tr className="hover:bg-[#f7f3f2]" key={row.employeeId}><td className="px-4 py-3 font-semibold">{row.employeeName}</td><td className="px-4 py-3 text-right">{row.attendanceCount}</td><td className="px-4 py-3 text-right font-bold">{formatNumber(row.workHours)}h</td><td className="px-4 py-3 text-right">{formatNumber(row.overtimeHours)}h</td><td className="px-4 py-3 text-right text-[#ef4444]">{row.lateCount}</td><td className="px-4 py-3 text-right">{row.absentCount}</td><td className="px-4 py-3 text-right">{row.missingCheckoutCount}</td></tr>)}</tbody>
      </table>
    </div>
  </section>
);

const BranchPerformanceTable = ({ rows }: { rows: ReportSummary["branchSummary"] }) => (
  <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
    <TableHeader title="Hiệu suất chi nhánh" subtitle={`${rows.length} chi nhánh có dữ liệu trong kỳ`} />
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left">
        <thead className="bg-[#f5f5f5] text-xs font-bold uppercase text-[#444748]"><tr><th className="px-4 py-3">Chi nhánh</th><th className="px-4 py-3 text-right">Nhân viên</th><th className="px-4 py-3 text-right">Lượt công</th><th className="px-4 py-3 text-right">Giờ làm</th><th className="px-4 py-3 text-right">Tăng ca</th><th className="px-4 py-3 text-right">Tỷ lệ muộn</th><th className="px-4 py-3 text-right">Tỷ lệ vắng</th><th className="px-4 py-3 text-right">Thiếu checkout</th></tr></thead>
        <tbody className="divide-y divide-[#e5e7eb]">{rows.length === 0 ? <EmptyTableRow colSpan={8} label="Chưa có dữ liệu chi nhánh." /> : rows.map((row) => <tr className="hover:bg-[#f7f3f2]" key={row.branchId}><td className="px-4 py-3 font-semibold">{row.branchName}</td><td className="px-4 py-3 text-right">{row.employeeCount}</td><td className="px-4 py-3 text-right">{row.attendanceCount}</td><td className="px-4 py-3 text-right font-bold">{formatNumber(row.workHours)}h</td><td className="px-4 py-3 text-right">{formatNumber(row.overtimeHours)}h</td><td className="px-4 py-3 text-right">{row.lateRate}%</td><td className="px-4 py-3 text-right">{row.absentRate}%</td><td className="px-4 py-3 text-right">{row.missingCheckoutCount}</td></tr>)}</tbody>
      </table>
    </div>
  </section>
);

const ExceptionTable = ({ rows }: { rows: ReportSummary["exceptions"] }) => (
  <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
    <TableHeader title="Ngoại lệ cần xử lý" subtitle={`${rows.length} bản ghi gần nhất`} />
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left">
        <thead className="bg-[#f5f5f5] text-xs font-bold uppercase text-[#444748]"><tr><th className="px-4 py-3">Ngày</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Nhân viên</th><th className="px-4 py-3">Chi nhánh</th><th className="px-4 py-3">Ghi chú</th></tr></thead>
        <tbody className="divide-y divide-[#e5e7eb]">{rows.length === 0 ? <EmptyTableRow colSpan={5} label="Không có ngoại lệ trong kỳ." /> : rows.map((row) => <tr className="hover:bg-[#f7f3f2]" key={row.id}><td className="px-4 py-3">{formatDate(row.date)}</td><td className="px-4 py-3"><ExceptionBadge type={row.type} /></td><td className="px-4 py-3 font-semibold">{row.employeeName}</td><td className="px-4 py-3 text-[#444748]">{row.branchName}</td><td className="px-4 py-3 text-[#444748]">{row.note ?? "--"}</td></tr>)}</tbody>
      </table>
    </div>
  </section>
);

const PayrollEstimateTable = ({ rows, total }: { rows: ReportSummary["employeeDetails"]; total: number }) => (
  <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
    <TableHeader title="Lương ước tính" subtitle={`Tổng ước tính: ${formatCurrency(total, "VND")}`} />
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead className="bg-[#f5f5f5] text-xs font-bold uppercase text-[#444748]"><tr><th className="px-4 py-3">Nhân viên</th><th className="px-4 py-3 text-right">Giờ làm</th><th className="px-4 py-3 text-right">Tăng ca</th><th className="px-4 py-3 text-right">Ước tính</th></tr></thead>
        <tbody className="divide-y divide-[#e5e7eb]">{rows.length === 0 ? <EmptyTableRow colSpan={4} label="Chưa có dữ liệu lương ước tính." /> : rows.map((row) => <tr className="hover:bg-[#f7f3f2]" key={row.employeeId}><td className="px-4 py-3 font-semibold">{row.employeeName}</td><td className="px-4 py-3 text-right">{formatNumber(row.workHours)}h</td><td className="px-4 py-3 text-right">{formatNumber(row.overtimeHours)}h</td><td className="px-4 py-3 text-right font-bold">{formatCurrency(row.payrollEstimate, "VND")}</td></tr>)}</tbody>
      </table>
    </div>
  </section>
);

const TableHeader = ({ subtitle, title }: { subtitle: string; title: string }) => (
  <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4"><h2 className="text-2xl font-semibold tracking-tight text-black">{title}</h2><span className="text-sm font-semibold text-[#444748]">{subtitle}</span></div>
);

const EmptyTableRow = ({ colSpan, label }: { colSpan: number; label: string }) => <tr><td className="px-4 py-5 text-sm font-semibold text-[#444748]" colSpan={colSpan}>{label}</td></tr>;

const ExceptionBadge = ({ type }: { type: ReportSummary["exceptions"][number]["type"] }) => {
  const label = type === "absent" ? "Vắng" : type === "missing_checkout" ? "Thiếu checkout" : type === "manual_pending" ? "Chờ chỉnh công" : "Đi muộn";
  const className = type === "absent" ? "bg-[#ffdad6] text-[#93000a]" : type === "missing_checkout" ? "bg-[#fff4cc] text-[#7a5900]" : "bg-[#f1edec] text-[#444748]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
};

const ReportRow = ({ report }: { report: ReportSummary["recentReports"][number] }) => {
  const Icon = report.name.endsWith(".xlsx") ? Table2 : FileText;
  const isCompleted = report.status === "completed";
  return <tr className="hover:bg-[#f7f3f2]"><td className="px-6 py-4"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#444748]" /><span className="font-semibold">{report.name}</span></div></td><td className="px-6 py-4 text-[#444748]">{formatDateTime(report.generatedAt)}</td><td className="px-6 py-4"><span className={isCompleted ? "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-black uppercase text-[#10b981]" : "rounded-full bg-[#f1edec] px-3 py-1 text-xs font-black uppercase text-[#444748]"}>{isCompleted ? "Hoàn tất" : "Đang xử lý"}</span></td><td className="px-6 py-4 text-[#444748]">{report.size}</td><td className="px-6 py-4 text-right"><button className={isCompleted ? "rounded-lg p-2 hover:bg-[#f1edec]" : "cursor-not-allowed rounded-lg p-2 opacity-30"} type="button"><Download className="h-5 w-5" /></button></td></tr>;
};

const resolveReportRange = (preset: "7d" | "30d" | "month" | "lastMonth" | "quarter" | "custom", customFrom: string, customTo: string) => {
  const today = new Date();

  if (preset === "custom") {
    return { from: customFrom, to: customTo };
  }

  if (preset === "7d") {
    return { from: toDateInputValue(addDays(today, -6)), to: toDateInputValue(today) };
  }

  if (preset === "month") {
    return { from: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)), to: toDateInputValue(today) };
  }

  if (preset === "lastMonth") {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: toDateInputValue(from), to: toDateInputValue(to) };
  }

  if (preset === "quarter") {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    return { from: toDateInputValue(new Date(today.getFullYear(), quarterStartMonth, 1)), to: toDateInputValue(today) };
  }

  return { from: toDateInputValue(addDays(today, -29)), to: toDateInputValue(today) };
};

const exportReportCsv = (summary?: ReportSummary) => {
  if (!summary) return;

  const rows = [
    ["Section", "Name", "Attendance", "Hours", "Late", "Absent", "Missing checkout", "Payroll estimate"],
    ...summary.employeeDetails.map((row) => [
      "Employee",
      row.employeeName,
      row.attendanceCount,
      row.workHours,
      row.lateCount,
      row.absentCount,
      row.missingCheckoutCount,
      row.payrollEstimate,
    ]),
    ...summary.branchSummary.map((row) => [
      "Branch",
      row.branchName,
      row.attendanceCount,
      row.workHours,
      row.lateRate,
      row.absentCount,
      row.missingCheckoutCount,
      "",
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `smartshift-report-${summary.range.from.slice(0, 10)}-${summary.range.to.slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toDateInputValue = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value);
const formatCurrency = (value: number, currency: "VND" | "USD") => new Intl.NumberFormat("vi-VN", { currency, maximumFractionDigits: currency === "VND" ? 0 : 2, style: "currency" }).format(value);
const formatDateTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));

const MiniMetric = ({ label, value }: { label: string; value: string }) => <div className="rounded-lg border border-[#e5e7eb] bg-white p-4"><p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#444748]">{label}</p><p className="text-sm font-semibold">{value}</p></div>;

const BillLine = ({ border, label, strong, value }: { border?: boolean; label: string; strong?: boolean; value: string }) => <div className={border ? "flex justify-between border-b border-[#e5e7eb] pb-4" : "flex justify-between"}><span className={strong ? "font-semibold text-black" : "text-[#444748]"}>{label}</span><span className={strong ? "font-semibold text-black" : ""}>{value}</span></div>;

const PlanCard = ({
  current,
  disabled,
  featured,
  loading,
  onSelect,
  plan,
  yearly,
}: {
  current?: boolean;
  disabled?: boolean;
  featured?: boolean;
  loading?: boolean;
  onSelect: () => void;
  plan: SubscriptionPlan;
  yearly: boolean;
}) => (
  <article className={featured ? "relative flex flex-col overflow-hidden rounded-xl border border-black bg-black p-6 text-white" : "flex flex-col rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"}>
    {featured ? <span className="absolute right-4 top-4 rounded bg-[#2170e4] px-2 py-1 text-sm font-semibold">PHỔ BIẾN</span> : null}
    <div className="mb-8">
      <h2 className="mb-2 pr-24 text-2xl font-semibold tracking-tight">{plan.name}</h2>
      <p className={featured ? "mb-8 text-white/65" : "mb-8 text-[#444748]"}>{plan.description ?? `${plan.limits.maxBranches} chi nhánh, tối đa ${plan.limits.maxEmployees} nhân viên.`}</p>
      <div className="flex items-baseline gap-1"><span className="text-5xl font-semibold">{formatCurrency(plan.priceMonthly * (yearly ? 12 : 1), plan.currency)}</span><span className={featured ? "text-white/65" : "text-[#444748]"}>/{yearly ? "năm" : "tháng"}</span></div>
    </div>
    <ul className="mb-10 flex-1 space-y-4">
      {toPlanFeatureLines(plan).map((feature) => <li className="flex items-center gap-2" key={feature}><CheckCircle2 className="h-5 w-5 shrink-0 text-[#10b981]" /><span>{feature}</span></li>)}
    </ul>
    <button className={featured ? "h-12 rounded-lg bg-white text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60" : "h-12 rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"} disabled={disabled} onClick={onSelect} type="button">{loading ? "Đang tạo thanh toán..." : current ? "Gói hiện tại" : "Thanh toán qua PayOS"}</button>
  </article>
);

const PlanComparisonTable = ({ plans }: { plans: SubscriptionPlan[] }) => {
  const rows: Array<[string, (plan: SubscriptionPlan) => ReactNode]> = [
    ["Giá tháng", (plan) => formatCurrency(plan.priceMonthly, plan.currency)],
    ["Chi nhánh", (plan) => formatLimit(plan.limits.maxBranches)],
    ["Nhân viên", (plan) => formatLimit(plan.limits.maxEmployees)],
    ["Quản lý", (plan) => formatLimit(plan.limits.maxManagers)],
    ["Chấm công QR", (plan) => featureCell(plan.features.qrCheckIn)],
    ["GPS", (plan) => featureCell(plan.features.gpsValidation)],
    ["Báo cáo", (plan) => featureCell(plan.features.attendanceReports)],
    ["Đổi ca", (plan) => featureCell(plan.features.shiftSwap)],
    ["Tính lương", (plan) => featureCell(plan.features.payroll)],
  ];

  if (plans.length === 0) {
    return <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm font-semibold text-[#444748]">Chưa có dữ liệu gói để so sánh.</div>;
  }

  return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-[#e5e7eb]"><th className="px-4 py-4 text-[#444748]">Tính năng</th>{plans.map((plan) => <th className="px-4 py-4" key={plan.id}>{plan.name}</th>)}</tr></thead><tbody>{rows.map(([label, render]) => <tr className="border-b border-[#e5e7eb] hover:bg-[#f7f3f2]" key={label}><td className="px-4 py-4 text-[#444748]">{label}</td>{plans.map((plan) => <td className="px-4 py-4" key={`${plan.id}-${label}`}>{render(plan)}</td>)}</tr>)}</tbody></table></div>;
};

const PaymentHistoryRow = ({ payment }: { payment: Payment }) => (
  <tr className="hover:bg-[#f7f3f2]"><td className="px-6 py-4">{formatDateTime(payment.paidAt ?? payment.expiresAt ?? new Date().toISOString())}</td><td className="px-6 py-4 text-[#444748]">SSPAY-{payment.orderCode}</td><td className="px-6 py-4 font-bold">{formatCurrency(payment.amount, payment.currency)}</td><td className="px-6 py-4"><PaymentStatusBadge status={payment.paymentStatus} /></td><td className="px-6 py-4 text-right text-sm text-[#444748]">{payment.transactionCode ?? payment.note ?? "--"}</td></tr>
);

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const className = status === "paid" ? "bg-[#10b981]/10 text-[#10b981]" : status === "pending" ? "bg-[#0058be]/10 text-[#0058be]" : status === "failed" || status === "cancelled" || status === "expired" ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#f1edec] text-[#444748]";
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${className}`}>{toPaymentStatusLabel(status)}</span>;
};

const featureCell = (enabled: boolean) => enabled ? <Check className="h-5 w-5 text-[#10b981]" /> : "-";
const isLimitedStarterPlan = (planCode?: string) => planCode === "trial_14d" || planCode === "basic_49k" || planCode === "basic";
const normalizeDisplayedLimit = (planCode: string | undefined, kind: "employees" | "branches", value?: number) => {
  if (isLimitedStarterPlan(planCode)) {
    return kind === "employees" ? 20 : 1;
  }

  return value ?? 0;
};
const formatLimit = (value?: number) => value === undefined ? "--" : value >= 999999 ? "Không giới hạn" : formatNumber(value);
const formatUsage = (limit?: { used: number; limit: number | null }) => limit ? `${formatNumber(limit.used)} / ${limit.limit === null || limit.limit >= 999999 ? "Không giới hạn" : formatNumber(limit.limit)}` : "--";
const formatUsageWithOverride = (limit: { used: number; limit: number | null } | undefined, overrideLimit: number) =>
  limit ? `${formatNumber(limit.used)} / ${formatNumber(overrideLimit)}` : `0 / ${formatNumber(overrideLimit)}`;
const toPlanFeatureLines = (plan: SubscriptionPlan) => [
  `${formatLimit(plan.limits.maxEmployees)} nhân viên`,
  `${formatLimit(plan.limits.maxBranches)} chi nhánh`,
  plan.features.qrCheckIn ? "Chấm công QR" : "Không gồm chấm công QR",
  plan.features.gpsValidation ? "Xác thực GPS" : "Không gồm GPS",
  plan.features.payroll ? "Tính lương" : "Không gồm tính lương",
];
const toPaymentStatusLabel = (status: PaymentStatus) => status === "paid" ? "Đã thanh toán" : status === "pending" ? "Đang chờ" : status === "failed" ? "Thất bại" : status === "cancelled" ? "Đã hủy" : status === "expired" ? "Hết hạn" : "Hoàn tiền";
const toSubscriptionStatusLabel = (status: Subscription["status"]) => status === "active" ? "Đang hoạt động" : status === "pending" ? "Đang chờ" : status === "expired" ? "Hết hạn" : "Đã hủy";

const XuấtReportModal = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4"><h2 className="text-2xl font-semibold tracking-tight">Xuất báo cáo</h2><Link className="rounded-full p-2 text-[#444748] hover:bg-[#f7f3f2]" to="/dashboard/reports"><X className="h-5 w-5" /></Link></div>
      <form className="space-y-6 p-6"><SelectField label="Loại báo cáo" options={["Chấm công", "Giờ làm", "Chi phí lao động", "Phân tích tăng ca"]} /><SelectField label="Khoảng thời gian" options={["30 ngày gần nhất", "Tháng hiện tại", "Quý trước", "Tùy chỉnh"]} /><div><p className="mb-2 text-sm font-semibold">Định dạng</p><div className="grid grid-cols-3 gap-2"><FormatButton active icon={<FileText />} label="PDF" /><FormatButton icon={<Table2 />} label="CSV" /><FormatButton icon={<Grid3X3 />} label="Excel" /></div></div><label className="flex items-center gap-3"><input className="h-5 w-5" type="checkbox" />Bao gồm biểu đồ trực quan</label><label className="flex items-center gap-3"><input className="h-5 w-5" type="checkbox" />Chỉ tóm tắt</label></form>
      <div className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4"><Link className="rounded-lg px-5 py-2 text-sm font-semibold hover:bg-[#ebe7e6]" to="/dashboard/reports">Hủy</Link><button className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white"><Download className="h-4 w-4" />Tạo & tải xuống</button></div>
    </div>
  </div>
);

const SelectField = ({ label, options }: { label: string; options: string[] }) => <label className="block space-y-1"><span className="text-sm font-semibold">{label}</span><select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:ring-1 focus:ring-black">{options.map((o) => <option key={o}>{o}</option>)}</select></label>;
const FormatButton = ({ active, icon, label }: { active?: boolean; icon: ReactNode; label: string }) => <button className={active ? "flex flex-col items-center gap-1 rounded-lg border border-black bg-[#f7f3f2] p-3 text-sm font-semibold" : "flex flex-col items-center gap-1 rounded-lg border border-[#e5e7eb] p-3 text-sm font-semibold hover:bg-[#f7f3f2]"} type="button"><span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>{label}</button>;

