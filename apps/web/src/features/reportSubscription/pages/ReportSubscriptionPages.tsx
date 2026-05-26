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
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const reports = [
  { name: "Q3_Attendance_Final.pdf", date: "Oct 24, 2023 - 14:30", status: "Completed", size: "4.2 MB", icon: FileText },
  { name: "Staff_Overtime_Analysis.xlsx", date: "Oct 23, 2023 - 09:15", status: "Completed", size: "1.8 MB", icon: Table2 },
  { name: "Branch_Efficiency_Index.pdf", date: "Oct 22, 2023 - 18:45", status: "Processing", size: "--", icon: BarChart3 },
];

const invoices = [
  { date: "Sep 12, 2023", id: "INV-98234-SS", amount: "$499.00" },
  { date: "Aug 12, 2023", id: "INV-97412-SS", amount: "$499.00" },
  { date: "Jul 12, 2023", id: "INV-96589-SS", amount: "$499.00" },
  { date: "Jun 12, 2023", id: "INV-95230-SS", amount: "$449.00" },
];

export const ReportsPage = () => (
  <ReportShell title="Reports & Analytics" search="Search reports, branches...">
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black">Reports & Analytics</h1>
          <p className="text-base text-[#444748]">Performance insights for the current fiscal quarter.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#f7f3f2]"><CalendarDays className="h-4 w-4" />Last 30 Days</button>
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90" to="/dashboard/reports/export"><Download className="h-4 w-4" />Export Summary</Link>
        </div>
      </div>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <ReportKpi icon={<CheckCircle2 />} label="Average Attendance" trend="+2.4%" value="94.8%" />
        <ReportKpi icon={<Timer />} label="Total Work Hours" trend="Total hrs" value="12,482" />
        <ReportKpi icon={<AlertTriangle />} label="Late Rate" trend="+0.8%" trendTone="danger" value="4.2%" />
        <ReportKpi icon={<Store />} label="Active Branches" trend="Active" value="14" />
      </section>
      <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-black">Attendance Trends</h2>
            <p className="text-base text-[#444748]">Daily check-in volume across all branches</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">Line View</button>
            <button className="rounded-full px-3 py-1 text-xs font-bold text-[#444748] hover:bg-[#f7f3f2]">Bar View</button>
          </div>
        </div>
        <BarChart heights={[60, 45, 80, 95, 70, 50, 85, 65, 40, 75]} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"]} />
      </section>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ReportCard title="Employee Work Hours"><div className="space-y-3 rounded-lg border border-[#e5e7eb] bg-white p-4">{[80, 65, 90].map((w, i) => <div className="h-3 overflow-hidden rounded-full bg-[#f1edec]" key={i}><div className="h-full bg-black" style={{ width: `${w}%`, opacity: 1 - i * 0.25 }} /></div>)}</div></ReportCard>
        <ReportCard title="Late Statistics"><div className="flex items-center justify-center rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="relative flex h-24 w-24 items-center justify-center rounded-full border-8 border-[#f1edec]"><div className="absolute inset-[-8px] rounded-full border-8 border-black border-b-transparent border-r-transparent" /><b>22%</b></div></div></ReportCard>
        <ReportCard title="Branch Summary"><div className="space-y-4 rounded-lg border border-[#e5e7eb] bg-white p-4">{["London 120%", "Paris 95%", "Tokyo 88%"].map((row) => <div className="flex justify-between text-xs font-bold" key={row}><span className="text-[#444748]">{row.split(" ")[0]}</span><span>{row.split(" ")[1]}</span></div>)}</div></ReportCard>
      </section>
      <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <h2 className="text-2xl font-semibold tracking-tight text-black">Recent Reports</h2>
          <button className="text-sm font-bold hover:underline">View History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-xs font-bold uppercase tracking-wider text-[#444748]"><tr><th className="px-6 py-4">Report Name</th><th className="px-6 py-4">Generated Date</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Size</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#e5e7eb]">{reports.map((report) => <ReportRow report={report} key={report.name} />)}</tbody>
          </table>
        </div>
      </section>
    </main>
  </ReportShell>
);

export const ExportReportPage = () => (
  <>
    <ReportsPage />
    <ExportReportModal />
  </>
);

export const SubscriptionPage = () => (
  <ReportShell title="Subscription & Billing" search="Search invoices...">
    <main className="mx-auto max-w-7xl p-4 md:p-10">
      <header className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-black">Subscription & Billing</h1>
        <p className="max-w-2xl text-base text-[#444748]">Manage your enterprise plan, payment methods, and review your complete billing history.</p>
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
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-tight">Payment Method</h2><button className="text-sm font-semibold text-[#0058be] hover:underline">Edit</button></div>
            <div className="flex items-center gap-6 rounded-lg border border-[#e5e7eb] bg-white p-6">
              <div className="flex h-10 w-16 items-center justify-center rounded border border-[#e5e7eb] bg-[#ebe7e6]"><CreditCard className="h-5 w-5" /></div>
              <div className="flex-1"><p className="font-semibold">Visa ending in **** 4242</p><p className="text-xs text-[#444748]">Expiry: 04 / 2026</p></div>
              <span className="flex items-center gap-2 text-xs text-[#444748]"><span className="h-2 w-2 rounded-full bg-[#10b981]" />Active</span>
            </div>
          </section>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-xl bg-black p-6 text-white"><h2 className="mb-4 text-2xl font-semibold">Need help with billing?</h2><p className="mb-8 text-white/75">Our dedicated account managers are available for enterprise support and custom invoicing requests.</p><button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black">Contact Support</button></section>
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6"><h3 className="mb-4 text-sm font-semibold">Quick Summary</h3><div className="space-y-4"><BillLine label="Monthly Base" value="$449.00" /><BillLine label="Extra Seats (12)" value="$50.00" /><BillLine label="Tax (15%)" value="$74.85" border /><BillLine label="Total Estimated Next Bill" value="$573.85" strong /></div></section>
        </div>
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white lg:col-span-12">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4"><h2 className="text-2xl font-semibold tracking-tight">Billing History</h2><button className="inline-flex gap-2 text-sm font-semibold text-[#444748]"><Filter className="h-4 w-4" />Filter</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f5f5f5] text-xs font-bold uppercase tracking-wider text-[#444748]"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#e5e7eb]">{invoices.map((invoice) => <tr className="hover:bg-[#f7f3f2]" key={invoice.id}><td className="px-6 py-4">{invoice.date}</td><td className="px-6 py-4 text-[#444748]">{invoice.id}</td><td className="px-6 py-4 font-bold">{invoice.amount}</td><td className="px-6 py-4"><span className="rounded-full bg-[#10b981]/10 px-3 py-1 text-sm font-semibold text-[#10b981]">Paid</span></td><td className="px-6 py-4 text-right"><button className="inline-flex items-center gap-2 text-sm font-semibold text-[#0058be] hover:underline"><Download className="h-4 w-4" />Download PDF</button></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </main>
  </ReportShell>
);

export const PricingPlansPage = () => {
  const [yearly, setYearly] = useState(false);
  return (
    <ReportShell title="Pricing Plans" search="Search plans...">
      <main className="mx-auto max-w-7xl space-y-12 p-4 py-10 md:p-10">
        <section className="text-center"><h1 className="mb-4 text-5xl font-semibold tracking-tight">Simple, transparent pricing</h1><p className="mx-auto mb-8 max-w-2xl text-lg text-[#444748]">Choose the plan that fits your business needs. Scale up or down as your team grows.</p><div className="flex items-center justify-center gap-4"><span className="font-semibold">Monthly</span><button className={yearly ? "relative h-6 w-12 rounded-full bg-black" : "relative h-6 w-12 rounded-full bg-[#e5e2e1]"} onClick={() => setYearly((v) => !v)}><span className={yearly ? "absolute left-7 top-1 h-4 w-4 rounded-full bg-white transition" : "absolute left-1 top-1 h-4 w-4 rounded-full bg-black transition"} /></button><span className="font-semibold">Yearly</span><span className="rounded-full bg-[#d8e2ff] px-2 py-1 text-xs font-bold text-[#001a42]">SAVE 20%</span></div></section>
        <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <PlanCard name="Basic Plan" price={yearly ? "39" : "49"} desc="Perfect for single locations and small teams." features={["Up to 25 employees", "Single location support", "QR check-in system", "Standard shift templates"]} />
          <PlanCard featured name="Organization Plan" price={yearly ? "103" : "129"} desc="Advanced tools for multi-branch enterprises." features={["Unlimited employees", "Multi-branch management", "Automated AI scheduling", "Advanced reporting & API", "Priority 24/7 support"]} />
        </section>
        <section className="mx-auto max-w-5xl"><h2 className="mb-8 text-center text-4xl font-semibold tracking-tight">Compare features</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[#e5e7eb]"><th className="px-4 py-4 text-[#444748]">Feature</th><th className="px-4 py-4">Basic</th><th className="px-4 py-4">Organization</th></tr></thead><tbody>{["QR Code Check-in", "Automated Scheduling", "Advanced Reporting", "Multi-branch Support", "API Access"].map((feature, i) => <tr className="border-b border-[#e5e7eb] hover:bg-[#f7f3f2]" key={feature}><td className="px-4 py-4">{feature}</td><td className="px-4 py-4">{i < 2 ? <Check className="h-5 w-5 text-[#10b981]" /> : i === 4 ? "Read-only" : "-"}</td><td className="px-4 py-4">{i === 4 ? "Full Access" : <Check className="h-5 w-5 text-[#10b981]" />}</td></tr>)}</tbody></table></div></section>
      </main>
    </ReportShell>
  );
};

export const PaymentSuccessPage = () => (
  <div className="flex min-h-screen flex-col bg-white">
    <header className="flex h-16 items-center justify-between border-b border-[#e5e7eb] px-6"><Link className="text-2xl font-black" to="/">SmartShift</Link><Link className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white" to="/login">Sign In</Link></header>
    <main className="flex flex-1 items-center justify-center p-6"><div className="flex w-full max-w-[480px] flex-col items-center text-center"><div className="relative mb-8"><div className="absolute inset-0 animate-ping rounded-full bg-[#10b981]/10" /><div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#10b981] shadow-lg"><CheckCircle2 className="h-12 w-12 text-white" /></div></div><h1 className="mb-2 text-4xl font-semibold tracking-tight">Payment Successful</h1><p className="mb-12 text-lg text-[#444748]">Your Professional Plan has been successfully renewed. Your workspace is now updated with all premium features.</p><div className="mb-12 w-full rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 text-left"><div className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-4"><span className="text-sm font-semibold text-[#444748]">Receipt Summary</span><span className="rounded-full bg-[#10b981]/10 px-2 py-1 text-xs font-bold text-[#10b981]">PAID</span></div><div className="space-y-4"><BillLine label="Amount Charged" value="$249.00" strong /><BillLine label="Transaction ID" value="TXN-88294-SSHIFT" /><BillLine label="Next Billing Date" value="January 12, 2025" /><BillLine label="Payment Method" value="**** 4242" /></div></div><div className="w-full space-y-3"><Link className="flex h-12 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" to="/dashboard">Back to Dashboard</Link><button className="h-12 w-full rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]">Download PDF Receipt</button></div></div></main>
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

const ReportKpi = ({ icon, label, trend, trendTone, value }: { icon: ReactNode; label: string; trend: string; trendTone?: "danger"; value: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div className="mb-4 flex items-start justify-between"><span className="rounded-lg border border-[#e5e7eb] bg-white p-2 [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className={trendTone === "danger" ? "text-xs font-bold text-[#ef4444]" : "text-xs font-bold text-[#10b981]"}>{trend}</span></div><p className="text-sm font-semibold text-[#444748]">{label}</p><p className="text-4xl font-semibold tracking-tight text-black">{value}</p></div>
);

const BarChart = ({ heights, labels }: { heights: number[]; labels: string[] }) => (
  <><div className="flex h-80 items-end gap-2 overflow-hidden rounded-xl bg-[#f7f3f2] px-4">{heights.map((height, index) => <div className={index === 3 ? "flex-1 rounded-t-lg bg-black shadow-lg" : "flex-1 rounded-t-lg bg-black/10 transition hover:bg-black/20"} key={index} style={{ height: `${height}%` }} />)}</div><div className="mt-4 flex justify-between px-2 text-xs font-bold uppercase text-[#444748]">{labels.map((label, i) => <span key={`${label}-${i}`}>{label}</span>)}</div></>
);

const ReportCard = ({ children, title }: { children: ReactNode; title: string }) => (
  <article className="flex flex-col rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div className="mb-4 flex items-start justify-between"><h3 className="text-sm font-semibold">{title}</h3><MoreVertical className="h-5 w-5 text-[#444748]" /></div><div className="mb-6 flex-1">{children}</div><div className="flex gap-2"><button className="flex-1 rounded-lg bg-black py-2 text-xs font-bold text-white">View Full</button><button className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-xs font-bold">Export</button></div></article>
);

const ReportRow = ({ report }: { report: (typeof reports)[number] }) => {
  const Icon = report.icon;
  return <tr className="hover:bg-[#f7f3f2]"><td className="px-6 py-4"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#444748]" /><span className="font-semibold">{report.name}</span></div></td><td className="px-6 py-4 text-[#444748]">{report.date}</td><td className="px-6 py-4"><span className={report.status === "Completed" ? "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-black uppercase text-[#10b981]" : "rounded-full bg-[#f1edec] px-3 py-1 text-xs font-black uppercase text-[#444748]"}>{report.status}</span></td><td className="px-6 py-4 text-[#444748]">{report.size}</td><td className="px-6 py-4 text-right"><button className={report.status === "Completed" ? "rounded-lg p-2 hover:bg-[#f1edec]" : "cursor-not-allowed rounded-lg p-2 opacity-30"}><Download className="h-5 w-5" /></button></td></tr>;
};

const MiniMetric = ({ label, value }: { label: string; value: string }) => <div className="rounded-lg border border-[#e5e7eb] bg-white p-4"><p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#444748]">{label}</p><p className="text-sm font-semibold">{value}</p></div>;

const BillLine = ({ border, label, strong, value }: { border?: boolean; label: string; strong?: boolean; value: string }) => <div className={border ? "flex justify-between border-b border-[#e5e7eb] pb-4" : "flex justify-between"}><span className={strong ? "font-semibold text-black" : "text-[#444748]"}>{label}</span><span className={strong ? "font-semibold text-black" : ""}>{value}</span></div>;

const PlanCard = ({ desc, featured, features, name, price }: { desc: string; featured?: boolean; features: string[]; name: string; price: string }) => (
  <article className={featured ? "relative flex flex-col overflow-hidden rounded-xl border border-black bg-black p-6 text-white" : "flex flex-col rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"}>{featured ? <span className="absolute right-4 top-4 rounded bg-[#2170e4] px-2 py-1 text-sm font-semibold">POPULAR</span> : null}<div className="mb-8"><h2 className="mb-2 text-2xl font-semibold tracking-tight">{name}</h2><p className={featured ? "mb-8 text-white/65" : "mb-8 text-[#444748]"}>{desc}</p><div className="flex items-baseline gap-1"><span className="text-4xl font-semibold">$</span><span className="text-5xl font-semibold">{price}</span><span className={featured ? "text-white/65" : "text-[#444748]"}>/month</span></div></div><ul className="mb-10 flex-1 space-y-4">{features.map((f) => <li className="flex items-center gap-2" key={f}><CheckCircle2 className="h-5 w-5 text-[#10b981]" /><span>{f}</span></li>)}</ul><button className={featured ? "h-12 rounded-lg bg-white text-sm font-semibold text-black" : "h-12 rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-white"}>{featured ? "Upgrade Now" : "Get Started"}</button></article>
);

const ExportReportModal = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4"><h2 className="text-2xl font-semibold tracking-tight">Export Report</h2><Link className="rounded-full p-2 text-[#444748] hover:bg-[#f7f3f2]" to="/dashboard/reports"><X className="h-5 w-5" /></Link></div>
      <form className="space-y-6 p-6"><SelectField label="Report Type" options={["Attendance", "Work Hours", "Labor Costs", "Overtime Analysis"]} /><SelectField label="Date Range" options={["Last 30 Days", "Current Month", "Last Quarter", "Custom Range"]} /><div><p className="mb-2 text-sm font-semibold">Format</p><div className="grid grid-cols-3 gap-2"><FormatButton active icon={<FileText />} label="PDF" /><FormatButton icon={<Table2 />} label="CSV" /><FormatButton icon={<Grid3X3 />} label="Excel" /></div></div><label className="flex items-center gap-3"><input className="h-5 w-5" type="checkbox" />Include visual charts</label><label className="flex items-center gap-3"><input className="h-5 w-5" type="checkbox" />Summary only</label></form>
      <div className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4"><Link className="rounded-lg px-5 py-2 text-sm font-semibold hover:bg-[#ebe7e6]" to="/dashboard/reports">Cancel</Link><button className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white"><Download className="h-4 w-4" />Generate & Download</button></div>
    </div>
  </div>
);

const SelectField = ({ label, options }: { label: string; options: string[] }) => <label className="block space-y-1"><span className="text-sm font-semibold">{label}</span><select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:ring-1 focus:ring-black">{options.map((o) => <option key={o}>{o}</option>)}</select></label>;
const FormatButton = ({ active, icon, label }: { active?: boolean; icon: ReactNode; label: string }) => <button className={active ? "flex flex-col items-center gap-1 rounded-lg border border-black bg-[#f7f3f2] p-3 text-sm font-semibold" : "flex flex-col items-center gap-1 rounded-lg border border-[#e5e7eb] p-3 text-sm font-semibold hover:bg-[#f7f3f2]"} type="button"><span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>{label}</button>;
