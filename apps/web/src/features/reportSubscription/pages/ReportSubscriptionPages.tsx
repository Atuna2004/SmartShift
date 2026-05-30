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
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { reportApi } from "@/features/reportSubscription/report.api";
import type { ReportSummary } from "@/features/reportSubscription/report.types";
import { getApiErrorMessage } from "@/shared/api";

const invoices = [
  { date: "Sep 12, 2023", id: "INV-98234-SS", amount: "$499.00" },
  { date: "Aug 12, 2023", id: "INV-97412-SS", amount: "$499.00" },
  { date: "Jul 12, 2023", id: "INV-96589-SS", amount: "$499.00" },
  { date: "Jun 12, 2023", id: "INV-95230-SS", amount: "$449.00" },
];

export const ReportsPage = () => {
  const [activeDetail, setActiveDetail] = useState<"employee-hours" | "late-statistics" | "branch-summary" | null>(null);
  const today = new Date();
  const from = toDateInputValue(addDays(today, -29));
  const to = toDateInputValue(today);
  const reportQuery = useQuery({
    queryKey: ["reports", "owner-summary", { from, to }],
    queryFn: () => reportApi.ownerSummary({ from, to }),
  });
  const summary = reportQuery.data;
  const trend = summary?.attendanceTrend ?? [];
  const maxTrendCount = Math.max(1, ...trend.map((item) => item.count));
  const trendHeights = trend.slice(-10).map((item) => Math.max(6, Math.round((item.count / maxTrendCount) * 100)));
  const trendLabels = trend.slice(-10).map((item) => item.label);
  const employeeHours = summary?.employeeHours ?? [];
  const maxEmployeeHours = Math.max(1, ...employeeHours.map((item) => item.hours));
  const branchSummary = summary?.branchSummary ?? [];
  const reports = summary?.recentReports ?? [];

  return (
    <ReportShell title="Báo cáo & phân tích" search="Tìm báo cáo, chi nhánh...">
      <main className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-black">Báo cáo & phân tích</h1>
            <p className="text-base text-[#444748]">Dữ liệu vận hành trong 30 ngày gần nhất.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#f7f3f2]" type="button"><CalendarDays className="h-4 w-4" />30 ngày gần nhất</button>
            <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90" to="/dashboard/reports/export"><Download className="h-4 w-4" />Xuất Summary</Link>
          </div>
        </div>
        {reportQuery.isError ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(reportQuery.error, "Không thể tải báo cáo.")}</p> : null}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportKpi icon={<CheckCircle2 />} label="Tỷ lệ có mặt" loading={reportQuery.isLoading} trend={`${summary?.kpis.attendanceCount ?? 0} lượt`} value={summary ? `${summary.kpis.averageAttendanceRate}%` : "--"} />
          <ReportKpi icon={<Timer />} label="Tổng giờ làm" loading={reportQuery.isLoading} trend="Tổng giờ" value={summary ? formatNumber(summary.kpis.totalWorkHours) : "--"} />
          <ReportKpi icon={<AlertTriangle />} label="Tỷ lệ đi muộn" loading={reportQuery.isLoading} trend={`${summary?.kpis.activeEmployees ?? 0} nhân viên`} trendTone="danger" value={summary ? `${summary.kpis.lateRate}%` : "--"} />
          <ReportKpi icon={<Store />} label="Chi nhánh hoạt động" loading={reportQuery.isLoading} trend="Active" value={summary ? String(summary.kpis.activeBranches) : "--"} />
        </section>
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-black">Attendance Trends</h2>
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
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
            <h2 className="text-2xl font-semibold tracking-tight text-black">Recent Reports</h2>
            <button className="text-sm font-bold hover:underline" type="button">Xem lịch sử</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-xs font-bold uppercase tracking-wider text-[#444748]"><tr><th className="px-6 py-4">Report Name</th><th className="px-6 py-4">Generated Date</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Size</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#e5e7eb]">{reports.length === 0 ? <tr><td className="px-6 py-4 text-sm font-semibold text-[#444748]" colSpan={5}>Chưa có báo cáo gần đây.</td></tr> : reports.map((report) => <ReportRow report={report} key={report.id} />)}</tbody>
            </table>
          </div>
        </section>
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

export const SubscriptionPage = () => (
  <ReportShell title="Gói đăng ký & thanh toán" search="Tìm hóa đơn...">
    <main className="mx-auto max-w-7xl p-4 md:p-10">
      <header className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-black">Gói đăng ký & thanh toán</h1>
        <p className="max-w-2xl text-base text-[#444748]">Quản lý gói doanh nghiệp, phương thức thanh toán và xem toàn bộ lịch sử thanh toán.</p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
            <div className="mb-8 flex justify-between gap-4">
              <div><span className="mb-4 inline-block rounded bg-black px-2 py-1 text-sm font-semibold text-white">CURRENT PLAN</span><h2 className="text-2xl font-semibold tracking-tight text-black">Enterprise Pro</h2><p className="text-[#444748]">Billed annually - Up to 500 employees</p></div>
              <div className="text-right"><p className="text-2xl font-semibold">$499<span className="text-base text-[#444748]">/mo</span></p><p className="text-xs text-[#444748]">Next renewal: Oct 12, 2024</p></div>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <MiniMetric label="Active Seats" value="412 / 500" />
              <MiniMetric label="Branches" value="12 Locations" />
              <MiniMetric label="Storage" value="85% utilized" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white" to="/dashboard/subscription/plans">Upgrade Plan</Link>
              <Link className="rounded-lg border border-[#e5e7eb] bg-white px-6 py-3 text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/subscription/plans">Compare Plans</Link>
            </div>
          </section>
          <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-tight">Phương thức thanh toán</h2><button className="text-sm font-semibold text-[#0058be] hover:underline">Chỉnh sửa</button></div>
            <div className="flex items-center gap-6 rounded-lg border border-[#e5e7eb] bg-white p-6">
              <div className="flex h-10 w-16 items-center justify-center rounded border border-[#e5e7eb] bg-[#ebe7e6]"><CreditCard className="h-5 w-5" /></div>
              <div className="flex-1"><p className="font-semibold">Visa ending in **** 4242</p><p className="text-xs text-[#444748]">Expiry: 04 / 2026</p></div>
              <span className="flex items-center gap-2 text-xs text-[#444748]"><span className="h-2 w-2 rounded-full bg-[#10b981]" />Active</span>
            </div>
          </section>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-xl bg-black p-6 text-white"><h2 className="mb-4 text-2xl font-semibold">Need help with billing?</h2><p className="mb-8 text-white/75">Our dedicated account managers are available for enterprise support and custom invoicing requests.</p><button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black">Contact Support</button></section>
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6"><h3 className="mb-4 text-sm font-semibold">Tóm tắt nhanh</h3><div className="space-y-4"><BillLine label="Phí cơ bản tháng" value="$449.00" /><BillLine label="Ghế bổ sung (12)" value="$50.00" /><BillLine label="Thuế (15%)" value="$74.85" border /><BillLine label="Tổng ước tính kỳ tới" value="$573.85" strong /></div></section>
        </div>
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white lg:col-span-12">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4"><h2 className="text-2xl font-semibold tracking-tight">Lịch sử thanh toán</h2><button className="inline-flex gap-2 text-sm font-semibold text-[#444748]"><Filter className="h-4 w-4" />Lọc</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f5f5f5] text-xs font-bold uppercase tracking-wider text-[#444748]"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#e5e7eb]">{invoices.map((invoice) => <tr className="hover:bg-[#f7f3f2]" key={invoice.id}><td className="px-6 py-4">{invoice.date}</td><td className="px-6 py-4 text-[#444748]">{invoice.id}</td><td className="px-6 py-4 font-bold">{invoice.amount}</td><td className="px-6 py-4"><span className="rounded-full bg-[#10b981]/10 px-3 py-1 text-sm font-semibold text-[#10b981]">Paid</span></td><td className="px-6 py-4 text-right"><button className="inline-flex items-center gap-2 text-sm font-semibold text-[#0058be] hover:underline"><Download className="h-4 w-4" />Download PDF</button></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </main>
  </ReportShell>
);

export const PricingPlansPage = () => {
  const [yearly, setYearly] = useState(false);
  return (
    <ReportShell title="Gói giá" search="Tìm gói...">
      <main className="mx-auto max-w-7xl space-y-12 p-4 py-10 md:p-10">
        <section className="text-center"><h1 className="mb-4 text-5xl font-semibold tracking-tight">Bảng giá đơn giản, minh bạch</h1><p className="mx-auto mb-8 max-w-2xl text-lg text-[#444748]">Chọn gói phù hợp với nhu cầu doanh nghiệp của bạn. Mở rộng hoặc thu hẹp khi đội ngũ thay đổi.</p><div className="flex items-center justify-center gap-4"><span className="font-semibold">Theo tháng</span><button className={yearly ? "relative h-6 w-12 rounded-full bg-black" : "relative h-6 w-12 rounded-full bg-[#e5e2e1]"} onClick={() => setYearly((v) => !v)}><span className={yearly ? "absolute left-7 top-1 h-4 w-4 rounded-full bg-white transition" : "absolute left-1 top-1 h-4 w-4 rounded-full bg-black transition"} /></button><span className="font-semibold">Theo năm</span><span className="rounded-full bg-[#d8e2ff] px-2 py-1 text-xs font-bold text-[#001a42]">GIẢM 20%</span></div></section>
        <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <PlanCard name="Gói cơ bản" price={yearly ? "39" : "49"} desc="Phù hợp cho một địa điểm và đội ngũ nhỏ." features={["Tối đa 25 nhân viên", "Hỗ trợ một địa điểm", "Hệ thống check-in QR", "Mẫu ca làm chuẩn"]} />
          <PlanCard featured name="Gói tổ chức" price={yearly ? "103" : "129"} desc="Công cụ nâng cao cho doanh nghiệp nhiều chi nhánh." features={["Không giới hạn nhân viên", "Quản lý đa chi nhánh", "Lập lịch AI tự động", "Báo cáo nâng cao & API", "Hỗ trợ ưu tiên 24/7"]} />
        </section>
        <section className="mx-auto max-w-5xl"><h2 className="mb-8 text-center text-4xl font-semibold tracking-tight">So sánh tính năng</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[#e5e7eb]"><th className="px-4 py-4 text-[#444748]">Tính năng</th><th className="px-4 py-4">Cơ bản</th><th className="px-4 py-4">Tổ chức</th></tr></thead><tbody>{["Chấm công QR", "Lập lịch tự động", "Báo cáo nâng cao", "Hỗ trợ đa chi nhánh", "Truy cập API"].map((feature, i) => <tr className="border-b border-[#e5e7eb] hover:bg-[#f7f3f2]" key={feature}><td className="px-4 py-4">{feature}</td><td className="px-4 py-4">{i < 2 ? <Check className="h-5 w-5 text-[#10b981]" /> : i === 4 ? "Chỉ xem" : "-"}</td><td className="px-4 py-4">{i === 4 ? "Toàn quyền" : <Check className="h-5 w-5 text-[#10b981]" />}</td></tr>)}</tbody></table></div></section>
      </main>
    </ReportShell>
  );
};

export const PaymentSuccessPage = () => (
  <div className="flex min-h-screen flex-col bg-white">
    <header className="flex h-16 items-center justify-between border-b border-[#e5e7eb] px-6"><Link className="text-2xl font-black" to="/">SmartShift</Link><Link className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white" to="/login">Sign In</Link></header>
    <main className="flex flex-1 items-center justify-center p-6"><div className="flex w-full max-w-[480px] flex-col items-center text-center"><div className="relative mb-8"><div className="absolute inset-0 animate-ping rounded-full bg-[#10b981]/10" /><div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#10b981] shadow-lg"><CheckCircle2 className="h-12 w-12 text-white" /></div></div><h1 className="mb-2 text-4xl font-semibold tracking-tight">Thanh toán thành công</h1><p className="mb-12 text-lg text-[#444748]">Gói Professional của bạn đã được gia hạn thành công. Không gian làm việc của bạn đã được cập nhật đầy đủ tính năng cao cấp.</p><div className="mb-12 w-full rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 text-left"><div className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-4"><span className="text-sm font-semibold text-[#444748]">Tóm tắt biên nhận</span><span className="rounded-full bg-[#10b981]/10 px-2 py-1 text-xs font-bold text-[#10b981]">ĐÃ THANH TOÁN</span></div><div className="space-y-4"><BillLine label="Số tiền đã trừ" value="$249.00" strong /><BillLine label="Mã giao dịch" value="TXN-88294-SSHIFT" /><BillLine label="Ngày thanh toán tiếp theo" value="January 12, 2025" /><BillLine label="Phương thức thanh toán" value="**** 4242" /></div></div><div className="w-full space-y-3"><Link className="flex h-12 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" to="/dashboard">Quay lại bảng điều khiển</Link><button className="h-12 w-full rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]">Tải biên nhận PDF</button></div></div></main>
  </div>
);

const ReportShell = ({ action, children, search, title }: { action?: ReactNode; children: ReactNode; search: string; title: string }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-6"><h2 className="shrink-0 text-2xl font-semibold tracking-tight text-black">{title}</h2><div className="relative hidden w-80 lg:block"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" /><input className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder={search} /></div></div>
      <div className="flex items-center gap-4"><button className="hidden items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm font-semibold text-[#444748] md:inline-flex"><Store className="h-4 w-4" />Main HQ</button><Bell className="h-5 w-5 text-[#444748]" />{action}</div>
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

const ReportRow = ({ report }: { report: ReportSummary["recentReports"][number] }) => {
  const Icon = report.name.endsWith(".xlsx") ? Table2 : FileText;
  const isCompleted = report.status === "completed";
  return <tr className="hover:bg-[#f7f3f2]"><td className="px-6 py-4"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#444748]" /><span className="font-semibold">{report.name}</span></div></td><td className="px-6 py-4 text-[#444748]">{formatDateTime(report.generatedAt)}</td><td className="px-6 py-4"><span className={isCompleted ? "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-black uppercase text-[#10b981]" : "rounded-full bg-[#f1edec] px-3 py-1 text-xs font-black uppercase text-[#444748]"}>{isCompleted ? "Completed" : "Processing"}</span></td><td className="px-6 py-4 text-[#444748]">{report.size}</td><td className="px-6 py-4 text-right"><button className={isCompleted ? "rounded-lg p-2 hover:bg-[#f1edec]" : "cursor-not-allowed rounded-lg p-2 opacity-30"} type="button"><Download className="h-5 w-5" /></button></td></tr>;
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
const formatDateTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));

const MiniMetric = ({ label, value }: { label: string; value: string }) => <div className="rounded-lg border border-[#e5e7eb] bg-white p-4"><p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#444748]">{label}</p><p className="text-sm font-semibold">{value}</p></div>;

const BillLine = ({ border, label, strong, value }: { border?: boolean; label: string; strong?: boolean; value: string }) => <div className={border ? "flex justify-between border-b border-[#e5e7eb] pb-4" : "flex justify-between"}><span className={strong ? "font-semibold text-black" : "text-[#444748]"}>{label}</span><span className={strong ? "font-semibold text-black" : ""}>{value}</span></div>;

const PlanCard = ({ desc, featured, features, name, price }: { desc: string; featured?: boolean; features: string[]; name: string; price: string }) => (
  <article className={featured ? "relative flex flex-col overflow-hidden rounded-xl border border-black bg-black p-6 text-white" : "flex flex-col rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"}>{featured ? <span className="absolute right-4 top-4 rounded bg-[#2170e4] px-2 py-1 text-sm font-semibold">POPULAR</span> : null}<div className="mb-8"><h2 className="mb-2 text-2xl font-semibold tracking-tight">{name}</h2><p className={featured ? "mb-8 text-white/65" : "mb-8 text-[#444748]"}>{desc}</p><div className="flex items-baseline gap-1"><span className="text-4xl font-semibold">$</span><span className="text-5xl font-semibold">{price}</span><span className={featured ? "text-white/65" : "text-[#444748]"}>/month</span></div></div><ul className="mb-10 flex-1 space-y-4">{features.map((f) => <li className="flex items-center gap-2" key={f}><CheckCircle2 className="h-5 w-5 text-[#10b981]" /><span>{f}</span></li>)}</ul><button className={featured ? "h-12 rounded-lg bg-white text-sm font-semibold text-black" : "h-12 rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-white"}>{featured ? "Upgrade Now" : "Get Started"}</button></article>
);

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

