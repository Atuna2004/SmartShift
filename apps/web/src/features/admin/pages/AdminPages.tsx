import { NavLink, Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  Download,
  Eye,
  Filter,
  History,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  MoreHorizontal,
  Plus,
  Search,
  Server,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UsersRound,
  XCircle,
} from "lucide-react";

type AdminSection = "dashboards" | "businesses" | "users" | "subscriptions" | "payments";

const navItems = [
  { label: "Dashboards", to: "/admin", icon: LayoutDashboard, key: "dashboards" },
  { label: "Business Management", to: "/admin/businesses", icon: Building2, key: "businesses" },
  { label: "User Management", to: "/admin/users", icon: UsersRound, key: "users" },
  { label: "Subscriptions", to: "/admin/subscriptions", icon: CalendarDays, key: "subscriptions" },
  { label: "Payments", to: "/admin/payments", icon: CreditCard, key: "payments" },
  { label: "Support", to: "/admin/support", icon: LifeBuoy, key: "support" },
  { label: "Settings", to: "/admin/settings", icon: Settings, key: "settings" },
  { label: "Audit Logs", to: "/admin/audit-logs", icon: History, key: "audit" },
];

const adminShellClass = "min-h-screen bg-[#fdf8f8] text-[#1c1b1b]";
const cardClass = "rounded-lg border border-[#e5e7eb] bg-white";

function AdminShell({
  active,
  children,
  searchPlaceholder = "Search businesses, users, or tickets...",
}: {
  active: AdminSection;
  children: React.ReactNode;
  searchPlaceholder?: string;
}) {
  return (
    <div className={adminShellClass}>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-[#e5e7eb] bg-[#fdf8f8] px-4 py-6 lg:flex">
        <div className="mb-6 px-4">
          <p className="text-3xl font-extrabold tracking-tight">SmartShift Admin</p>
          <p className="mt-1 text-sm font-semibold text-[#747878]">System Operations</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <NavLink
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#e5e2e1] text-black"
                    : "text-[#444748] hover:bg-[#f1edec] hover:text-black"
                }`}
                key={item.label}
                to={item.to}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white font-bold">
            AU
          </div>
          <div>
            <p className="text-sm font-bold">Admin User</p>
            <p className="text-xs text-[#747878]">Global Access</p>
          </div>
        </div>
      </aside>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white/95 px-4 backdrop-blur lg:left-64 lg:px-6">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" size={18} />
          <input
            className="w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] py-2 pl-10 pr-3 text-sm outline-none focus:border-black"
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="ml-4 flex items-center gap-4 text-[#444748]">
          <Bell size={20} />
          <Database size={20} />
          <Settings size={20} />
        </div>
      </header>
      <main className="px-4 pb-12 pt-24 lg:ml-64 lg:px-6">
        <div className="mx-auto max-w-7xl space-y-6">{children}</div>
      </main>
    </div>
  );
}

function AdminHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#747878]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-black">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#747878]">{description}</p> : null}
      </div>
      {action}
    </section>
  );
}

function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof BarChart3;
  tone?: "neutral" | "good" | "bad";
}) {
  const color = tone === "bad" ? "text-[#ef4444]" : tone === "good" ? "text-[#10b981]" : "text-[#444748]";
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-[#f1edec] p-2">
          <Icon size={20} />
        </div>
        <span className={`text-xs font-bold ${color}`}>{change}</span>
      </div>
      <p className="mt-5 text-sm font-medium text-[#747878]">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}

function Panel({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f5f5f5] px-5 py-4">
        <h2 className="text-sm font-black uppercase tracking-wide">{title}</h2>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function RevenueLine() {
  return (
    <div className="h-72">
      <svg className="h-full w-full" viewBox="0 0 720 260" role="img" aria-label="Revenue growth chart">
        {[0, 1, 2, 3, 4].map((line) => (
          <line key={line} x1="20" x2="700" y1={30 + line * 45} y2={30 + line * 45} stroke="#e5e7eb" />
        ))}
        <path
          d="M25 210 C100 184 128 160 182 166 C240 173 255 116 315 126 C378 137 398 84 452 96 C514 110 540 48 610 58 C655 64 674 45 695 32"
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M25 210 C100 184 128 160 182 166 C240 173 255 116 315 126 C378 137 398 84 452 96 C514 110 540 48 610 58 C655 64 674 45 695 32 L695 235 L25 235 Z"
          fill="url(#adminRevenueGradient)"
          opacity="0.45"
        />
        <defs>
          <linearGradient id="adminRevenueGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c8c6c5" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function DonutChart({ center, segments }: { center: string; segments: string[] }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="grid h-52 w-52 place-items-center rounded-full"
        style={{ background: `conic-gradient(${segments.join(", ")})` }}
      >
        <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-3xl font-extrabold">{center}</p>
            <p className="text-xs font-bold uppercase text-[#747878]">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSystemOverviewPage() {
  const registrations = [
    ["Northstar Retail", "Trial", "5 minutes ago"],
    ["Pacific Care Group", "Organization", "1 hour ago"],
    ["Mira Cafe", "Basic", "3 hours ago"],
  ];
  return (
    <AdminShell active="dashboards">
      <AdminHeader
        action={
          <div className="flex gap-2">
            <Link className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-bold" to="/admin/finance">
              Finance KPI
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white">
              <Plus size={18} />
              Register Business
            </button>
          </div>
        }
        eyebrow="Global Admin"
        title="System Overview"
        description="Live operating view for business accounts, subscriptions, employee usage, and platform health."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard change="+12.5%" icon={Building2} label="Total Businesses" tone="good" value="1,240" />
        <KpiCard change="+4.8%" icon={CheckCircle2} label="Active Subs" tone="good" value="1,180" />
        <KpiCard change="+8.2%" icon={CreditCard} label="Monthly Revenue" tone="good" value="$420k" />
        <KpiCard change="+2.1%" icon={UsersRound} label="Active Employees" tone="good" value="45k" />
        <KpiCard change="+320" icon={Server} label="Total Branches" tone="neutral" value="3,200" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel aside={<span className="text-xs font-bold text-[#10b981]">Status: Optimal</span>} title="Daily Active Users">
          <div className="flex h-72 items-end gap-3">
            {[36, 64, 48, 76, 58, 88, 70, 96, 72, 84, 60, 92].map((height, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={index}>
                <div className="w-full rounded-t bg-black" style={{ height: `${height}%` }} />
                <span className="text-[10px] font-bold text-[#747878]">{index + 1}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Revenue by Plan">
          <DonutChart
            center="$420k"
            segments={["#000 0 52%", "#2170e4 52% 78%", "#c8c6c5 78% 91%", "#e5e7eb 91% 100%"]}
          />
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {["Organization", "Basic", "Trial", "Expired"].map((item) => (
              <div className="flex items-center gap-2" key={item}>
                <span className="h-2 w-2 rounded-full bg-black" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="System Alerts">
          <div className="space-y-3">
            {[
              ["Billing queue latency", "2 invoices pending retry", AlertTriangle],
              ["API health", "99.98% uptime in last 24h", CheckCircle2],
              ["Seat limit warning", "18 businesses above 90% capacity", AlertTriangle],
            ].map(([title, detail, Icon]) => (
              <div className="flex gap-3 rounded-lg border border-[#e5e7eb] bg-[#fdf8f8] p-3" key={title as string}>
                <Icon className="mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-bold">{title as string}</p>
                  <p className="text-xs text-[#747878]">{detail as string}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Recent Registrations">
        <div className="divide-y divide-[#e5e7eb]">
          {registrations.map(([name, plan, time]) => (
            <div className="flex items-center justify-between py-3" key={name}>
              <div>
                <p className="font-bold">{name}</p>
                <p className="text-sm text-[#747878]">{plan} plan</p>
              </div>
              <span className="text-xs font-bold text-[#747878]">{time}</span>
            </div>
          ))}
        </div>
      </Panel>
    </AdminShell>
  );
}

export function AdminSaasKpiPage() {
  return (
    <AdminShell active="dashboards">
      <AdminHeader
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white">
            <Download size={18} />
            Export Data
          </button>
        }
        eyebrow="Finance Analytics"
        title="SaaS KPI Dashboard"
        description="Subscription economics and operational usage trends for the SmartShift platform."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard change="+12.8%" icon={CreditCard} label="MRR" tone="good" value="$420,000" />
        <KpiCard change="+12.8%" icon={TrendingUp} label="ARR" tone="good" value="$5,040,000" />
        <KpiCard change="-0.4%" icon={TrendingDown} label="Churn" tone="good" value="1.2%" />
        <KpiCard change="+6.1%" icon={LineChart} label="LTV" tone="good" value="$12,500" />
        <KpiCard change="+2.3%" icon={BarChart3} label="CAC" tone="bad" value="$450" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Revenue Growth">
            <RevenueLine />
          </Panel>
        </div>
        <Panel title="Plan Breakdown">
          <DonutChart
            center="1,284"
            segments={["#000 0 48%", "#2170e4 48% 74%", "#10b981 74% 88%", "#e5e7eb 88% 100%"]}
          />
          <div className="mt-5 space-y-3">
            {[
              ["Organization", "620 accounts", "48%"],
              ["Basic", "336 accounts", "26%"],
              ["Trial", "180 accounts", "14%"],
            ].map(([plan, count, value]) => (
              <div className="flex items-center justify-between text-sm" key={plan}>
                <div>
                  <p className="font-bold">{plan}</p>
                  <p className="text-[#747878]">{count}</p>
                </div>
                <span className="font-black">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="User Activity">
          <div className="flex h-64 items-end gap-3">
            {[42, 54, 61, 76, 83, 69, 88, 93].map((height, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={index}>
                <div className="w-full rounded-t bg-[#2170e4]" style={{ height: `${height}%` }} />
                <span className="text-[10px] font-bold text-[#747878]">W{index + 1}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Usage Leaders">
          {[
            ["Blue Tech Solutions", "1,020 employees", "45 branches"],
            ["Lumina Logistics", "452 employees", "12 branches"],
            ["Northstar Retail", "388 employees", "20 branches"],
            ["Pacific Care Group", "341 employees", "18 branches"],
          ].map(([name, employees, branches]) => (
            <div className="flex items-center justify-between border-b border-[#e5e7eb] py-3 last:border-0" key={name}>
              <div>
                <p className="font-bold">{name}</p>
                <p className="text-sm text-[#747878]">{employees}</p>
              </div>
              <span className="rounded-full bg-[#f1edec] px-3 py-1 text-xs font-bold">{branches}</span>
            </div>
          ))}
        </Panel>
      </div>
    </AdminShell>
  );
}

const businesses = [
  ["Lumina Logistics", "BUS-90210", "Organization", "Active", "452", "12"],
  ["Velvet Kitchens", "BUS-44122", "Basic", "Active", "24", "2"],
  ["Swift Cleaners Inc.", "BUS-77102", "Trial", "Suspended", "8", "1"],
  ["Blue Tech Solutions", "BUS-33100", "Organization", "Expired", "1,020", "45"],
];

export function AdminBusinessListPage() {
  return (
    <AdminShell active="businesses" searchPlaceholder="Search by Business Name or ID">
      <AdminHeader
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white">
            <Plus size={18} />
            Register New Business
          </button>
        }
        eyebrow="Business Management"
        title="Business Accounts"
        description="Monitor account health, plan status, seat usage, and operational scale across tenants."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard change="+8.4%" icon={Building2} label="Total Active Businesses" tone="good" value="1,284" />
        <KpiCard change="+6 today" icon={AlertTriangle} label="Businesses at Risk" tone="bad" value="42" />
        <KpiCard change="+21.3%" icon={TrendingUp} label="New Registrations" tone="good" value="89" />
        <KpiCard change="+3.6%" icon={CreditCard} label="MRR Forecast" tone="good" value="$142.5k" />
      </div>
      <section className={`${cardClass} p-5`}>
        <div className="grid gap-3 md:grid-cols-4">
          {["Plan", "Status", "Date Range"].map((label) => (
            <select className="rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-3 py-2 text-sm font-semibold" key={label}>
              <option>{label}</option>
            </select>
          ))}
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm font-bold">
            <Filter size={18} />
            Apply Filters
          </button>
        </div>
      </section>
      <section className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f1edec] text-xs font-black uppercase tracking-wide text-[#444748]">
              <tr>
                {["Business", "Plan", "Status", "Employees", "Branches", "Action"].map((head) => (
                  <th className="px-5 py-3" key={head}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {businesses.map(([name, id, plan, status, employees, branches]) => (
                <tr className="hover:bg-[#fdf8f8]" key={id}>
                  <td className="px-5 py-4">
                    <p className="font-bold">{name}</p>
                    <p className="text-xs text-[#747878]">{id}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold">{plan}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        status === "Active"
                          ? "bg-[#10b981]/10 text-[#10b981]"
                          : status === "Suspended"
                            ? "bg-[#ef4444]/10 text-[#ef4444]"
                            : "bg-[#f1edec] text-[#444748]"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold">{employees}</td>
                  <td className="px-5 py-4 font-bold">{branches}</td>
                  <td className="px-5 py-4">
                    <Link
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-[#f1edec]"
                      to="/admin/businesses/acme-corp"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#e5e7eb] px-5 py-4 text-sm">
          <span className="font-semibold text-[#747878]">Showing 1-4 of 1,284 businesses</span>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[#e5e7eb] p-2">
              <ChevronLeft size={18} />
            </button>
            <button className="rounded-lg border border-[#e5e7eb] p-2">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminBusinessDetailPage() {
  return (
    <AdminShell active="businesses">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#747878]">
            <Link to="/admin/businesses">Business Account</Link>
            <span>•</span>
            <span>ID: ACME-8842-X</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight">Acme Corp</h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold uppercase text-[#10b981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Active
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-bold">Edit Details</button>
          <button className="rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-bold text-white">Suspend Business</button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard change="+2 New" icon={Building2} label="Infrastructure" tone="good" value="12 Branches" />
        <KpiCard change="Total Staff" icon={UsersRound} label="Personnel" value="442 Employees" />
        <div className={`${cardClass} p-5 md:col-span-2`}>
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-[#f1edec] p-2">
              <UsersRound size={20} />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#747878]">450 / 500 Seats Used</p>
              <div className="mt-1 h-1 w-36 overflow-hidden rounded-full bg-[#e5e7eb]">
                <div className="h-full w-[90%] bg-black" />
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-[#747878]">Capacity Utilization</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">90% Allocated</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel aside={<ShieldCheck size={18} />} title="Primary Contact">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-[#e5e7eb] bg-[#f1edec] font-black">
                  MH
                </div>
                <div>
                  <p className="font-bold">Marcus Holloway</p>
                  <p className="text-sm text-[#747878]">Managing Director</p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <p>m.holloway@acme.corp</p>
                <p>+1 (555) 012-9984</p>
              </div>
            </Panel>
            <Panel title="Active Subscription">
              <p className="text-4xl font-black tracking-tight">Organization</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#747878]">Annual Billing Cycle</p>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#747878]">Next Renewal</p>
                  <p className="font-bold">Dec 12, 2024</p>
                </div>
                <p className="font-black">$4,999.00/yr</p>
              </div>
            </Panel>
          </div>
          <Panel aside={<button className="text-xs font-bold text-[#2170e4]">View All Invoices</button>} title="Payment History">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-black uppercase tracking-wide text-[#747878]">
                  <tr>
                    {["Invoice ID", "Date", "Amount", "Status", ""].map((head) => (
                      <th className="pb-3" key={head}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {["INV-2023-012", "INV-2023-011", "INV-2023-010"].map((invoice, index) => (
                    <tr key={invoice}>
                      <td className="py-4 font-bold">{invoice}</td>
                      <td className="py-4 text-sm">Dec 12, {2023 - index}</td>
                      <td className="py-4 font-bold">$4,999.00</td>
                      <td className="py-4">
                        <span className="rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold text-[#10b981]">Paid</span>
                      </td>
                      <td className="py-4 text-right">
                        <Download className="inline" size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel aside={<span className="rounded-lg bg-[#ef4444]/10 px-2 py-1 text-xs font-bold text-[#ef4444]">2 Open</span>} title="Support Overview">
            <div className="space-y-3">
              {["API Integration Failure in Branch #4", "Request for additional seat limit"].map((ticket, index) => (
                <div className="rounded-lg border border-[#e5e7eb] bg-[#fdf8f8] p-3" key={ticket}>
                  <p className="truncate text-sm font-bold">{ticket}</p>
                  <p className="text-xs text-[#747878]">{index === 0 ? "Opened 2h ago • High Priority" : "Opened 1d ago • Medium Priority"}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-lg bg-black py-2 text-sm font-bold text-white">Create Admin Ticket</button>
          </Panel>
          <Panel title="Recent Activity">
            <div className="space-y-4">
              {[
                "Marcus Holloway updated billing information",
                "Bulk invite: 12 new employees added to NYC branch",
                "Security policy changed: 2FA Mandatory",
                "New branch registered: London HQ",
              ].map((activity, index) => (
                <div className="flex gap-3" key={activity}>
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black text-white">
                    <MoreHorizontal size={14} />
                  </div>
                  <div>
                    <p className="text-sm">{activity}</p>
                    <p className="text-[10px] font-bold uppercase text-[#747878]">{index === 0 ? "2 hours ago" : "Mar 10, 2024"}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <AdminShell active={title.includes("Payment") ? "payments" : title.includes("Subscription") ? "subscriptions" : "users"}>
      <AdminHeader eyebrow="Admin Console" title={title} description="This admin area is reserved for the next implementation slice." />
      <section className={`${cardClass} p-8 text-center`}>
        <XCircle className="mx-auto text-[#747878]" size={32} />
        <p className="mt-3 font-bold">No detailed admin design has been provided for this screen yet.</p>
      </section>
    </AdminShell>
  );
}
