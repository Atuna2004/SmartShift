import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
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
  LogOut,
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
import { authApi } from "@/features/auth/auth.api";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import type { Employee } from "@/features/employeeBranch/employee.types";
import { organizationApi } from "@/features/organization/organization.api";
import type { Organization } from "@/features/organization/organization.types";
import { paymentApi } from "@/features/payment/payment.api";
import type { Payment } from "@/features/payment/payment.types";
import { subscriptionApi } from "@/features/subscription/subscription.api";
import type { Subscription } from "@/features/subscription/subscription.types";
import { useAuthStore } from "@/store";

type AdminSection = "dashboards" | "businesses" | "users" | "subscriptions" | "payments";

type AdminBusiness = {
  organization: Organization;
  subscription?: Subscription;
  users: Employee[];
  payments: Payment[];
};

type AdminSnapshot = {
  users: Employee[];
  businesses: AdminBusiness[];
  payments: Payment[];
};

const navItems: Array<{ label: string; to: string; icon: typeof LayoutDashboard; key: AdminSection | "support" | "settings" | "audit" }> = [
  { label: "Tổng quan", to: "/admin", icon: LayoutDashboard, key: "dashboards" },
  { label: "Doanh nghiệp", to: "/admin/businesses", icon: Building2, key: "businesses" },
  { label: "Người dùng", to: "/admin/users", icon: UsersRound, key: "users" },
  { label: "Gói dịch vụ", to: "/admin/subscriptions", icon: CalendarDays, key: "subscriptions" },
  { label: "Thanh toán", to: "/admin/payments", icon: CreditCard, key: "payments" },
  { label: "Hỗ trợ", to: "/admin/support", icon: LifeBuoy, key: "support" },
  { label: "Cài đặt", to: "/admin/settings", icon: Settings, key: "settings" },
  { label: "Nhật ký", to: "/admin/audit-logs", icon: History, key: "audit" },
];

const adminShellClass = "min-h-screen bg-[#fdf8f8] text-[#1c1b1b]";
const cardClass = "rounded-lg border border-[#e5e7eb] bg-white";

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

const formatCurrency = (value: number, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
};

const translatePlan = (plan?: string) => {
  const normalized = plan?.toLowerCase();
  if (normalized === "free") return "Miễn phí";
  if (normalized === "basic") return "Cơ bản";
  if (normalized === "pro") return "Chuyên nghiệp";
  return plan || "Chưa có gói";
};

const translateStatus = (status?: string) => {
  const map: Record<string, string> = {
    active: "Đang hoạt động",
    disabled: "Đã vô hiệu",
    inactive: "Ngừng hoạt động",
    trialing: "Dùng thử",
    past_due: "Quá hạn",
    cancelled: "Đã hủy",
    expired: "Hết hạn",
    pending: "Đang chờ",
    paid: "Đã thanh toán",
    failed: "Thất bại",
    refunded: "Đã hoàn tiền",
  };
  return status ? map[status] ?? status : "Chưa rõ";
};

const unique = (values: Array<string | undefined>) => Array.from(new Set(values.filter(Boolean) as string[]));

function useAdminSnapshot() {
  const [snapshot, setSnapshot] = useState<AdminSnapshot>({ users: [], businesses: [], payments: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userResponse = await employeeApi.list({ page: 1, limit: 100 });
        const users = userResponse.data;
        const organizationIds = unique(users.map((user) => user.organizationId));

        const businesses = await Promise.all(
          organizationIds.map(async (organizationId) => {
            const [organizationResult, subscriptionResult, paymentsResult] = await Promise.allSettled([
              organizationApi.me(organizationId),
              subscriptionApi.current(organizationId),
              paymentApi.list({ organizationId, limit: 10, page: 1 }),
            ]);

            if (organizationResult.status !== "fulfilled") {
              return null;
            }

            return {
              organization: organizationResult.value,
              subscription: subscriptionResult.status === "fulfilled" ? subscriptionResult.value : undefined,
              users: users.filter((user) => user.organizationId === organizationId),
              payments: paymentsResult.status === "fulfilled" ? paymentsResult.value.data : [],
            };
          })
        );

        const resolvedBusinesses = businesses.filter(Boolean) as AdminBusiness[];

        if (mounted) {
          setSnapshot({
            users,
            businesses: resolvedBusinesses,
            payments: resolvedBusinesses.flatMap((business) => business.payments),
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Không thể tải dữ liệu admin.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return { snapshot, isLoading, error };
}

function AdminShell({
  active,
  children,
  searchPlaceholder = "Tìm doanh nghiệp, người dùng hoặc yêu cầu hỗ trợ...",
}: {
  active: AdminSection;
  children: React.ReactNode;
  searchPlaceholder?: string;
}) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className={adminShellClass}>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-[#e5e7eb] bg-[#fdf8f8] px-4 py-6 lg:flex">
        <div className="mb-6 px-4">
          <p className="text-3xl font-extrabold tracking-tight">SmartShift Admin</p>
          <p className="mt-1 text-sm font-semibold text-[#747878]">Vận hành hệ thống</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <NavLink
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-[#e5e2e1] text-black" : "text-[#444748] hover:bg-[#f1edec] hover:text-black"
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
        <div className="mt-auto space-y-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white font-bold">
              AD
            </div>
            <div>
              <p className="text-sm font-bold">Quản trị viên</p>
              <p className="text-xs text-[#747878]">Toàn quyền hệ thống</p>
            </div>
          </div>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-bold text-[#ef4444] transition hover:bg-[#ef4444]/10"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
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
          <button
            aria-label="Đăng xuất"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#ef4444] transition hover:bg-[#ef4444]/10"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut size={18} />
          </button>
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

function LoadingNotice({ isLoading, error }: { isLoading: boolean; error: string | null }) {
  if (isLoading) {
    return <div className={`${cardClass} p-4 text-sm font-semibold text-[#747878]`}>Đang tải dữ liệu từ API...</div>;
  }

  if (error) {
    return <div className={`${cardClass} border-[#ef4444]/30 p-4 text-sm font-semibold text-[#ef4444]`}>{error}</div>;
  }

  return null;
}

function RevenueLine() {
  return (
    <div className="h-72">
      <svg className="h-full w-full" viewBox="0 0 720 260" role="img" aria-label="Biểu đồ tăng trưởng doanh thu">
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
      <div className="grid h-52 w-52 place-items-center rounded-full" style={{ background: `conic-gradient(${segments.join(", ")})` }}>
        <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-3xl font-extrabold">{center}</p>
            <p className="text-xs font-bold uppercase text-[#747878]">Tổng</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSystemOverviewPage() {
  const { snapshot, isLoading, error } = useAdminSnapshot();
  const activeBusinesses = snapshot.businesses.filter((business) => business.organization.status === "active").length;
  const activeSubscriptions = snapshot.businesses.filter((business) => business.subscription?.status === "active").length;
  const paidRevenue = snapshot.payments.filter((payment) => payment.paymentStatus === "paid").reduce((total, payment) => total + payment.amount, 0);
  const activeUsers = snapshot.users.filter((user) => user.status === "active").length;
  const recentBusinesses = snapshot.businesses.slice(0, 4);

  return (
    <AdminShell active="dashboards">
      <AdminHeader
        action={
          <div className="flex gap-2">
            <Link className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-bold" to="/admin/finance">
              KPI tài chính
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white" to="/admin/businesses">
              <Plus size={18} />
              Xem doanh nghiệp
            </Link>
          </div>
        }
        eyebrow="Quản trị toàn hệ thống"
        title="Tổng quan hệ thống"
        description="Theo dõi tài khoản doanh nghiệp, gói dịch vụ, người dùng và tình trạng vận hành từ dữ liệu API hiện có."
      />
      <LoadingNotice error={error} isLoading={isLoading} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard change="Từ API" icon={Building2} label="Doanh nghiệp" tone="good" value={formatNumber(snapshot.businesses.length)} />
        <KpiCard change={`${activeBusinesses} hoạt động`} icon={CheckCircle2} label="Tài khoản hoạt động" tone="good" value={formatNumber(activeBusinesses)} />
        <KpiCard change="Đã thanh toán" icon={CreditCard} label="Doanh thu ghi nhận" tone="good" value={formatCurrency(paidRevenue)} />
        <KpiCard change={`${activeUsers} đang hoạt động`} icon={UsersRound} label="Người dùng" tone="good" value={formatNumber(snapshot.users.length)} />
        <KpiCard change="Theo gói hiện tại" icon={Server} label="Gói đang hoạt động" value={formatNumber(activeSubscriptions)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel aside={<span className="text-xs font-bold text-[#10b981]">API hoạt động</span>} title="Người dùng theo doanh nghiệp">
          <div className="flex h-72 items-end gap-3">
            {(snapshot.businesses.length ? snapshot.businesses : []).slice(0, 12).map((business, index) => {
              const count = business.users.length;
              const height = Math.max(12, Math.min(96, count * 12));
              return (
                <div className="flex flex-1 flex-col items-center gap-2" key={index}>
                  <div className="w-full rounded-t bg-black" style={{ height: `${height}%` }} />
                  <span className="text-[10px] font-bold text-[#747878]">{index + 1}</span>
                </div>
              );
            })}
            {!snapshot.businesses.length
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div className="flex flex-1 flex-col items-center gap-2" key={`empty-${index}`}>
                    <div className="w-full rounded-t bg-black" style={{ height: `${12 + index * 8}%` }} />
                    <span className="text-[10px] font-bold text-[#747878]">{index + 1}</span>
                  </div>
                ))
              : null}
          </div>
        </Panel>
        <Panel title="Doanh thu theo gói">
          <DonutChart
            center={formatCurrency(paidRevenue)}
            segments={["#000 0 52%", "#2170e4 52% 78%", "#c8c6c5 78% 91%", "#e5e7eb 91% 100%"]}
          />
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {["Chuyên nghiệp", "Cơ bản", "Miễn phí", "Hết hạn"].map((item) => (
              <div className="flex items-center gap-2" key={item}>
                <span className="h-2 w-2 rounded-full bg-black" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Cảnh báo hệ thống">
          <div className="space-y-3">
            {[
              ["Doanh nghiệp chưa có gói active", `${Math.max(snapshot.businesses.length - activeSubscriptions, 0)} tài khoản cần kiểm tra`, AlertTriangle],
              ["Thanh toán lỗi", `${snapshot.payments.filter((payment) => payment.paymentStatus === "failed").length} giao dịch thất bại`, AlertTriangle],
              ["Người dùng ngừng hoạt động", `${snapshot.users.filter((user) => user.status !== "active").length} tài khoản`, CheckCircle2],
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
      <Panel title="Doanh nghiệp gần đây">
        <div className="divide-y divide-[#e5e7eb]">
          {recentBusinesses.length ? (
            recentBusinesses.map((business) => (
              <div className="flex items-center justify-between py-3" key={business.organization.id}>
                <div>
                  <p className="font-bold">{business.organization.name}</p>
                  <p className="text-sm text-[#747878]">{translatePlan(business.subscription?.planCode ?? business.organization.subscription?.plan)}</p>
                </div>
                <span className="text-xs font-bold text-[#747878]">{translateStatus(business.organization.status)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-[#747878]">Chưa có dữ liệu doanh nghiệp.</p>
          )}
        </div>
      </Panel>
    </AdminShell>
  );
}

export function AdminSaasKpiPage() {
  const { snapshot, isLoading, error } = useAdminSnapshot();
  const paidRevenue = snapshot.payments.filter((payment) => payment.paymentStatus === "paid").reduce((total, payment) => total + payment.amount, 0);
  const monthlyRevenue = snapshot.businesses.reduce((total, business) => total + (business.subscription?.status === "active" ? business.subscription.priceMonthly : 0), 0);
  const churnCount = snapshot.businesses.filter((business) => ["cancelled", "expired"].includes(business.subscription?.status ?? "")).length;
  const churnRate = snapshot.businesses.length ? (churnCount / snapshot.businesses.length) * 100 : 0;

  return (
    <AdminShell active="dashboards">
      <AdminHeader
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white">
            <Download size={18} />
            Xuất dữ liệu
          </button>
        }
        eyebrow="Phân tích tài chính"
        title="Bảng KPI SaaS"
        description="Theo dõi doanh thu, trạng thái gói dịch vụ và mức sử dụng nền tảng từ dữ liệu thanh toán hiện có."
      />
      <LoadingNotice error={error} isLoading={isLoading} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard change="Gói active" icon={CreditCard} label="MRR" tone="good" value={formatCurrency(monthlyRevenue)} />
        <KpiCard change="Ước tính" icon={TrendingUp} label="ARR" tone="good" value={formatCurrency(monthlyRevenue * 12)} />
        <KpiCard change={`${churnCount} tài khoản`} icon={TrendingDown} label="Churn" tone={churnRate > 5 ? "bad" : "good"} value={`${churnRate.toFixed(1)}%`} />
        <KpiCard change="Thanh toán paid" icon={LineChart} label="Doanh thu đã thu" tone="good" value={formatCurrency(paidRevenue)} />
        <KpiCard change="Từ /payments" icon={BarChart3} label="Giao dịch" value={formatNumber(snapshot.payments.length)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Tăng trưởng doanh thu">
            <RevenueLine />
          </Panel>
        </div>
        <Panel title="Cơ cấu gói dịch vụ">
          <DonutChart
            center={formatNumber(snapshot.businesses.length)}
            segments={["#000 0 48%", "#2170e4 48% 74%", "#10b981 74% 88%", "#e5e7eb 88% 100%"]}
          />
          <div className="mt-5 space-y-3">
            {["pro", "basic", "free"].map((plan) => {
              const count = snapshot.businesses.filter((business) => (business.subscription?.planCode ?? business.organization.subscription?.plan) === plan).length;
              const percentage = snapshot.businesses.length ? Math.round((count / snapshot.businesses.length) * 100) : 0;
              return (
                <div className="flex items-center justify-between text-sm" key={plan}>
                  <div>
                    <p className="font-bold">{translatePlan(plan)}</p>
                    <p className="text-[#747878]">{formatNumber(count)} tài khoản</p>
                  </div>
                  <span className="font-black">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <Panel title="Doanh nghiệp sử dụng nhiều nhất">
        {snapshot.businesses.slice(0, 5).map((business) => (
          <div className="flex items-center justify-between border-b border-[#e5e7eb] py-3 last:border-0" key={business.organization.id}>
            <div>
              <p className="font-bold">{business.organization.name}</p>
              <p className="text-sm text-[#747878]">{formatNumber(business.users.length)} người dùng</p>
            </div>
            <span className="rounded-full bg-[#f1edec] px-3 py-1 text-xs font-bold">{translatePlan(business.subscription?.planCode)}</span>
          </div>
        ))}
      </Panel>
    </AdminShell>
  );
}

export function AdminBusinessListPage() {
  const { snapshot, isLoading, error } = useAdminSnapshot();
  const activeBusinesses = snapshot.businesses.filter((business) => business.organization.status === "active").length;
  const atRiskBusinesses = snapshot.businesses.filter((business) => business.organization.status !== "active" || business.subscription?.status !== "active").length;
  const paidRevenue = snapshot.payments.filter((payment) => payment.paymentStatus === "paid").reduce((total, payment) => total + payment.amount, 0);

  return (
    <AdminShell active="businesses" searchPlaceholder="Tìm theo tên hoặc ID doanh nghiệp">
      <AdminHeader
        action={
          <button className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white">
            <Plus size={18} />
            Thêm doanh nghiệp
          </button>
        }
        eyebrow="Quản lý doanh nghiệp"
        title="Tài khoản doanh nghiệp"
        description="Theo dõi tình trạng tài khoản, gói dịch vụ và quy mô nhân sự của từng tenant."
      />
      <LoadingNotice error={error} isLoading={isLoading} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard change="Đang hoạt động" icon={Building2} label="Doanh nghiệp active" tone="good" value={formatNumber(activeBusinesses)} />
        <KpiCard change="Cần kiểm tra" icon={AlertTriangle} label="Doanh nghiệp rủi ro" tone="bad" value={formatNumber(atRiskBusinesses)} />
        <KpiCard change="Từ dữ liệu user" icon={TrendingUp} label="Tổng doanh nghiệp" tone="good" value={formatNumber(snapshot.businesses.length)} />
        <KpiCard change="Đã thanh toán" icon={CreditCard} label="Doanh thu" tone="good" value={formatCurrency(paidRevenue)} />
      </div>
      <section className={`${cardClass} p-5`}>
        <div className="grid gap-3 md:grid-cols-4">
          {["Gói dịch vụ", "Trạng thái", "Khoảng ngày"].map((label) => (
            <select className="rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-3 py-2 text-sm font-semibold" key={label}>
              <option>{label}</option>
            </select>
          ))}
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm font-bold">
            <Filter size={18} />
            Áp dụng lọc
          </button>
        </div>
      </section>
      <section className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f1edec] text-xs font-black uppercase tracking-wide text-[#444748]">
              <tr>
                {["Doanh nghiệp", "Gói", "Trạng thái", "Người dùng", "Doanh thu", "Thao tác"].map((head) => (
                  <th className="px-5 py-3" key={head}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {snapshot.businesses.map((business) => {
                const revenue = business.payments.filter((payment) => payment.paymentStatus === "paid").reduce((total, payment) => total + payment.amount, 0);
                return (
                  <tr className="hover:bg-[#fdf8f8]" key={business.organization.id}>
                    <td className="px-5 py-4">
                      <p className="font-bold">{business.organization.name}</p>
                      <p className="text-xs text-[#747878]">{business.organization.id}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold">{translatePlan(business.subscription?.planCode ?? business.organization.subscription?.plan)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          business.organization.status === "active" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#ef4444]/10 text-[#ef4444]"
                        }`}
                      >
                        {translateStatus(business.organization.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold">{formatNumber(business.users.length)}</td>
                    <td className="px-5 py-4 font-bold">{formatCurrency(revenue)}</td>
                    <td className="px-5 py-4">
                      <Link
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-[#f1edec]"
                        to={`/admin/businesses/${business.organization.id}`}
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#e5e7eb] px-5 py-4 text-sm">
          <span className="font-semibold text-[#747878]">Hiển thị {formatNumber(snapshot.businesses.length)} doanh nghiệp</span>
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
  const { businessId } = useParams();
  const { snapshot, isLoading, error } = useAdminSnapshot();
  const business = useMemo(
    () => snapshot.businesses.find((item) => item.organization.id === businessId) ?? snapshot.businesses[0],
    [businessId, snapshot.businesses]
  );
  const paidRevenue = business?.payments.filter((payment) => payment.paymentStatus === "paid").reduce((total, payment) => total + payment.amount, 0) ?? 0;
  const seatLimit = business?.subscription?.limits.maxEmployees ?? business?.organization.subscription?.maxEmployees ?? 0;
  const seatUsage = seatLimit ? Math.min(100, Math.round((business.users.length / seatLimit) * 100)) : 0;

  return (
    <AdminShell active="businesses">
      <LoadingNotice error={error} isLoading={isLoading} />
      {!business && !isLoading ? (
        <section className={`${cardClass} p-8 text-center`}>
          <XCircle className="mx-auto text-[#747878]" size={32} />
          <p className="mt-3 font-bold">Không tìm thấy doanh nghiệp.</p>
        </section>
      ) : business ? (
        <>
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#747878]">
                <Link to="/admin/businesses">Tài khoản doanh nghiệp</Link>
                <span>•</span>
                <span>ID: {business.organization.id}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight">{business.organization.name}</h1>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold uppercase text-[#10b981]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                  {translateStatus(business.organization.status)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-bold">Cập nhật</button>
              <button className="rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-bold text-white">Tạm khóa</button>
            </div>
          </section>
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard change="Từ gói dịch vụ" icon={Building2} label="Giới hạn chi nhánh" value={`${business.subscription?.limits.maxBranches ?? business.organization.subscription?.maxBranches ?? 0}`} />
            <KpiCard change="Tổng tài khoản" icon={UsersRound} label="Nhân sự" value={formatNumber(business.users.length)} />
            <div className={`${cardClass} p-5 md:col-span-2`}>
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-[#f1edec] p-2">
                  <UsersRound size={20} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#747878]">
                    {business.users.length} / {seatLimit || "không giới hạn"} nhân sự
                  </p>
                  <div className="mt-1 h-1 w-36 overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div className="h-full bg-black" style={{ width: `${seatUsage}%` }} />
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm font-medium text-[#747878]">Mức sử dụng</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight">{seatUsage}%</p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid gap-6 md:grid-cols-2">
                <Panel aside={<ShieldCheck size={18} />} title="Thông tin liên hệ">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-lg border border-[#e5e7eb] bg-[#f1edec] font-black">
                      {business.organization.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{business.organization.name}</p>
                      <p className="text-sm text-[#747878]">{business.organization.businessType ?? "Doanh nghiệp"}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2 text-sm">
                    <p>{business.organization.email ?? "Chưa có email"}</p>
                    <p>{business.organization.phone ?? "Chưa có số điện thoại"}</p>
                    <p>{business.organization.address ?? "Chưa có địa chỉ"}</p>
                  </div>
                </Panel>
                <Panel title="Gói dịch vụ hiện tại">
                  <p className="text-4xl font-black tracking-tight">{translatePlan(business.subscription?.planCode ?? business.organization.subscription?.plan)}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#747878]">
                    {translateStatus(business.subscription?.status ?? business.organization.subscription?.status)}
                  </p>
                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-[#747878]">Ngày hết hạn</p>
                      <p className="font-bold">{formatDate(business.subscription?.endDate ?? business.organization.subscription?.expiredAt)}</p>
                    </div>
                    <p className="font-black">{business.subscription ? formatCurrency(business.subscription.priceMonthly, business.subscription.currency) : "Chưa có giá"}</p>
                  </div>
                </Panel>
              </div>
              <Panel aside={<span className="text-xs font-bold text-[#2170e4]">Từ API thanh toán</span>} title="Lịch sử thanh toán">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs font-black uppercase tracking-wide text-[#747878]">
                      <tr>
                        {["Mã giao dịch", "Ngày", "Số tiền", "Trạng thái", ""].map((head) => (
                          <th className="pb-3" key={head}>
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb]">
                      {business.payments.slice(0, 5).map((payment) => (
                        <tr key={payment.id}>
                          <td className="py-4 font-bold">{payment.orderCode}</td>
                          <td className="py-4 text-sm">{formatDate(payment.paidAt ?? payment.cancelledAt ?? payment.failedAt)}</td>
                          <td className="py-4 font-bold">{formatCurrency(payment.amount, payment.currency)}</td>
                          <td className="py-4">
                            <span className="rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold text-[#10b981]">
                              {translateStatus(payment.paymentStatus)}
                            </span>
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
              <Panel title="Tổng quan vận hành">
                <div className="space-y-3">
                  <div className="rounded-lg border border-[#e5e7eb] bg-[#fdf8f8] p-3">
                    <p className="truncate text-sm font-bold">Doanh thu đã thu</p>
                    <p className="text-xs text-[#747878]">{formatCurrency(paidRevenue)}</p>
                  </div>
                  <div className="rounded-lg border border-[#e5e7eb] bg-[#fdf8f8] p-3">
                    <p className="truncate text-sm font-bold">Người dùng đang hoạt động</p>
                    <p className="text-xs text-[#747878]">{formatNumber(business.users.filter((user) => user.status === "active").length)} tài khoản</p>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-lg bg-black py-2 text-sm font-bold text-white">Tạo ticket hỗ trợ</button>
              </Panel>
              <Panel title="Hoạt động gần đây">
                <div className="space-y-4">
                  {business.users.slice(0, 4).map((user) => (
                    <div className="flex gap-3" key={user.id}>
                      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black text-white">
                        <MoreHorizontal size={14} />
                      </div>
                      <div>
                        <p className="text-sm">{user.fullName}</p>
                        <p className="text-[10px] font-bold uppercase text-[#747878]">{translateStatus(user.status)} • {user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}

const placeholderTitles: Record<string, { active: AdminSection; title: string; description: string }> = {
  "User Management": {
    active: "users",
    title: "Quản lý người dùng",
    description: "Khu vực quản lý tài khoản, phân quyền và trạng thái người dùng.",
  },
  "Subscription Management": {
    active: "subscriptions",
    title: "Quản lý gói dịch vụ",
    description: "Khu vực quản lý plan, subscription và giới hạn sử dụng.",
  },
  "Payment Operations": {
    active: "payments",
    title: "Vận hành thanh toán",
    description: "Khu vực theo dõi giao dịch, hoàn tiền và trạng thái PayOS.",
  },
  "Support Operations": {
    active: "users",
    title: "Vận hành hỗ trợ",
    description: "Khu vực quản lý ticket hỗ trợ của doanh nghiệp.",
  },
  "Admin Settings": {
    active: "users",
    title: "Cài đặt quản trị",
    description: "Khu vực cấu hình hệ thống dành cho admin.",
  },
  "Audit Logs": {
    active: "users",
    title: "Nhật ký kiểm toán",
    description: "Khu vực theo dõi lịch sử thao tác quản trị.",
  },
};

export function AdminPlaceholderPage({ title }: { title: string }) {
  const content = placeholderTitles[title] ?? {
    active: "users" as AdminSection,
    title,
    description: "Khu vực admin này sẽ được triển khai ở bước tiếp theo.",
  };

  return (
    <AdminShell active={content.active}>
      <AdminHeader eyebrow="Bảng điều khiển admin" title={content.title} description={content.description} />
      <section className={`${cardClass} p-8 text-center`}>
        <XCircle className="mx-auto text-[#747878]" size={32} />
        <p className="mt-3 font-bold">Màn hình chi tiết chưa được triển khai.</p>
      </section>
    </AdminShell>
  );
}
