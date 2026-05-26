import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Plus,
  QrCode,
  Store,
  Timer,
  TrendingDown,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store";

const avatars = {
  manager:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBVfs563XFhRlv010oSxLgkYRw-IE36C5saDt10C36_XPPk9SayFU2E4h7IvjnibbqOMygSOTZ9ftQOAS9Yd4McgDQOtRUL7Zlv20sVHv_OXjooix2A4nj0Kj4QziqyfJP4mtWiCBQFL4xAfrNFOZQXp4VdKhmsILXIyTD2-yXyi4kYc3DUTI_21KAegYwx-jNaX8YboYU9cJZrcDIRP1v7ud5xJhJXrScKt6f7aF0CzRAj0sGVIZqi4uyD7vvET29b6xyfFlF72fkD",
  emp1:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAcLHoppF6YKo5X5QAO--EpqWQdgD2Bp7BhYoUtKQCpOB9suR3-7f2ajYDiVmuqoE-Pcsm8fzNZGPuFxqXwi2ykq-O1HUKZKmBN6E9H_1c611_TNiXQ4Xq7_s4IWqpRIX0TsGgalN1PIfnFY-ZlRfwob1iM40mpXBIqmbVm7Kn0lteUDBlzGlOM6tshgQxCaMNOvw-YMNcj6_GWcRdkKSuAxr0sCS7rJBbtpl-GS3kfRUCRYsVzqfjfHMFEqApMFFDhUKtQaua4GbrB",
  emp2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCU9W7A6b3RATSBSUGIUIA8yl_K4BHmNmpAYnkKlLsEJv-TShII-_j-OF9xxnZrqBuosrERgk--DDXwKDV8eOXQi8-0l2sGdqS0f7L3pgJzHQJ0L_1-KLih1TSQXKT_FmZYS86mgd-_t9DaX1iPiNjJjxlu9G1EMpZ3f2mzxEOMadF_UpXC_EgZAkrV-C_NTpYmZd5W2M_5bhrnMPA3j4CgLHuBoUgHCDDPQba-k9GyeJQZkYE7TCwpxexk_lkEflZZiuu429WVUuI0",
  leave1:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDxvy-DJOMbangnefhWF3cAhJrNzAKwxamAtksc-1tP1HfGa0-pr6VOHaWfBi20NYqM8l-v7dWkAFgZRwhgO7eUVhGcvfjEfoGyjQMzh8reJ3p57efbqbt5GJCNfgm6SDKO23sm5Ir-j83559Z-pIplct2LW4vK3rtYNOaoMVODgXUfRG5TvBg4eLz03FQ4JJM2f8RWeojSK5RUAH9DDmUkR0LNAU4UBoLo8_9IsochspHXZ3edLeSsThTFh8yT0EJ_aFy5pXhWw4Yt",
  leave2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCHoIFCPxdJIYFY711E2WPcgdpSE35s4kvcJaD7wkuzAldPoAEKdjxzhOfe2xmZ1hde7wn2WcjLB8ksLF6YqSb7BMha3eMimE9ecRmUXaPOzV7Wz1nx74mjyNQCxox5nNQ6wtg3JLjXb-Djr5zmqrVAMgNe0Von987yV_DUM-QSzVdVboWnlSaBW3DVacgLrhIEJeY_zYEz5IA3TVlNJRg2jMthJNB5g1LYSieRbRaLgb9L31RniFjahYbzQU3-Qrth1tVoSm_V3eBg",
};

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "manager") {
    return <ManagerDashboard managerName={user.fullName} />;
  }

  return <OwnerDashboard ownerName={user?.fullName ?? "Alex Sterling"} />;
};

const ManagerDashboard = ({ managerName }: { managerName: string }) => (
  <DashboardCanvas
    actions={
      <>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold text-black transition hover:bg-[#f7f3f2]">
          <QrCode className="h-4 w-4" />
          Generate QR
        </button>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Create Schedule
        </button>
      </>
    }
    eyebrow={`Welcome back, ${managerName.split(" ")[0] ?? "Manager"}`}
    title="Manager Dashboard"
  >
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard icon={<CalendarDays />} label="Today's Shifts" meta="+12% vs prev." metaTone="success" value="42" />
      <KpiCard icon={<BadgeCheck />} label="On Duty" value="18/24" avatars />
      <KpiCard icon={<AlertTriangle />} label="Attendance Alerts" meta="Action Needed" metaTone="danger" value="3" danger />
      <KpiCard icon={<Clock3 />} label="Pending Approvals" value="12" arrow />
    </section>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Panel
          action={<button className="text-sm font-semibold text-[#0058be] hover:underline">View All</button>}
          title="Late Employees"
        >
          <LateEmployee name="Alex Rivera" photo={avatars.emp1} shift="Morning Shift - North Branch" time="18m Overdue" />
          <LateEmployee name="Samantha Blue" photo={avatars.emp2} shift="Inventory Check - Main Store" time="42m Overdue" />
        </Panel>

        <Panel
          action={<span className="text-xs text-[#444748]">Last updated: Just now</span>}
          title={
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981]" />
              Live Shift Feed
            </span>
          }
        >
          <div className="relative space-y-4 p-4 before:absolute before:bottom-6 before:left-[35px] before:top-6 before:w-px before:bg-[#e5e7eb]">
            <FeedItem color="success" text={<><b>Jordan Lee</b> checked in via QR</>} time="09:12 AM" sub="Status: On Time - Branch: North Station" />
            <FeedItem
              color="secondary"
              text={<><b>Maria Garcia</b> requested a Shift Swap</>}
              time="08:45 AM"
              sub="Replacing: Friday 2PM Shift - Reason: Medical"
              actions
            />
            <FeedItem color="danger" text={<><b>System Alert:</b> Unfilled Shift</>} time="08:00 AM" sub='Shift "Evening Runner" remains unfilled for tomorrow.' />
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-black p-6 text-white shadow-xl">
          <h3 className="mb-4 text-2xl font-semibold tracking-tight">Shift Overview</h3>
          <SummaryLine icon={<Timer />} label="Total Scheduled" value="142h" />
          <SummaryLine icon={<BarChart3 />} label="Estimated Payroll" value="$3,840.00" />
          <button className="mt-8 h-12 w-full rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-[#f1edec]">
            View Detailed Report
          </button>
          <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
        </section>

        <Panel title="Leave Requests">
          <div className="space-y-4 p-4">
            <LeaveItem date="Oct 24 - Oct 26 (3 Days)" name="Kevin Vo" photo={avatars.leave1} />
            <LeaveItem date="Nov 02 (Personal)" name="Sarah Miller" photo={avatars.leave2} />
            <button className="h-10 w-full rounded-lg bg-[#f7f3f2] text-xs font-semibold text-[#444748] transition hover:bg-[#f1edec]">
              View all 8 pending
            </button>
          </div>
        </Panel>

        <section className="rounded-xl border border-dashed border-[#e5e7eb] bg-[#f5f5f5] p-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
            <QrCode className="h-10 w-10 text-black" />
          </div>
          <h4 className="text-sm font-bold text-black">North Branch Check-in</h4>
          <p className="mb-4 mt-1 text-xs text-[#444748]">Active for today's morning shifts</p>
          <button className="text-sm font-semibold text-[#0058be] hover:underline">Print Code</button>
        </section>
      </div>
    </div>
  </DashboardCanvas>
);

const OwnerDashboard = ({ ownerName }: { ownerName: string }) => (
  <DashboardCanvas
    actions={
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90">
        <Plus className="h-4 w-4" />
        Create Shift
      </button>
    }
    eyebrow={`Welcome back, ${ownerName.split(" ")[0] ?? "Owner"}`}
    title="Overview"
  >
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <OwnerKpi icon={<UsersRound />} label="Total Employees" trend="+4%" trendIcon={<TrendingUp />} value="156" />
      <OwnerKpi icon={<CheckCircle2 />} label="Attendance Rate" trend="98%" trendIcon={<CheckCircle2 />} value="96.2%" />
      <OwnerKpi icon={<Store />} label="Active Branches" trend="Stable" value="12" />
      <OwnerKpi icon={<BarChart3 />} label="Monthly Cost" trend="-2.1%" trendIcon={<TrendingDown />} trendTone="danger" value="$42,850" />
    </section>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Panel
          action={
            <div className="flex gap-2">
              <button className="rounded-lg bg-[#f1edec] px-3 py-1 text-sm font-semibold">Weekly</button>
              <button className="px-3 py-1 text-sm font-semibold text-[#444748]">Monthly</button>
            </div>
          }
          title="Branch Performance"
        >
          <div className="p-6">
            <div className="relative flex h-64 items-end justify-between overflow-hidden rounded-lg bg-[#f5f5f5] px-4 pb-4">
              {[60, 45, 85, 30, 70, 55, 95].map((height, index) => (
                <div
                  className={index % 2 === 0 ? "w-12 rounded-t-sm bg-black" : "w-12 rounded-t-sm bg-[#1c1b1b]"}
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-y border-[#e5e7eb] bg-[#f5f5f5] text-sm font-semibold text-[#444748]">
                <tr>
                  <th className="px-6 py-3">Branch Name</th>
                  <th className="px-6 py-3">Efficiency</th>
                  <th className="px-6 py-3">Coverage</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                <BranchRow branch="Downtown HQ" coverage="100%" efficiency="94%" status="Optimal" />
                <BranchRow branch="Westside Retail" coverage="92%" efficiency="88%" status="Optimal" />
                <BranchRow branch="North Logistics" coverage="84%" efficiency="76%" status="Review" tone="secondary" />
              </tbody>
            </table>
          </div>
          <div className="p-4 text-center">
            <button className="text-sm font-semibold text-[#444748] hover:text-black">View All Branches -&gt;</button>
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-xl bg-black p-6 text-white shadow-lg">
          <h3 className="mb-2 text-2xl font-black tracking-tight">Premium Enterprise</h3>
          <p className="mb-8 text-sm leading-6 text-white/65">Your plan supports up to 500 employees and unlimited branches.</p>
          <div className="mb-8">
            <div className="mb-3 flex justify-between text-sm font-semibold">
              <span className="text-white/65">Next Renewal</span>
              <span>Oct 12, 2024</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-3/4 bg-white" />
            </div>
          </div>
          <button className="h-12 w-full rounded-lg bg-white text-sm font-semibold text-black transition hover:bg-[#f1edec]">
            Manage Subscription
          </button>
        </section>

        <Panel title="Recent Activity">
          <div className="space-y-5 p-4">
            <ActivityItem icon={<UsersRound />} title="New Employee Hired" detail="Jordan Smith joined Downtown Branch." time="2 hours ago" />
            <ActivityItem icon={<ArrowRight />} title="Shift Swap Approved" detail="Maria V. swapped with Leon K." time="5 hours ago" tone="secondary" />
            <ActivityItem icon={<AlertTriangle />} title="Late Attendance" detail="4 employees clocked in late at Westside." time="Yesterday" tone="danger" />
            <button className="h-10 w-full rounded-lg border border-[#e5e7eb] text-sm font-semibold text-[#444748] transition hover:bg-[#f5f5f5]">
              View All Activity
            </button>
          </div>
        </Panel>
      </div>
    </div>
  </DashboardCanvas>
);

const DashboardCanvas = ({
  actions,
  children,
  eyebrow,
  title,
}: {
  actions: ReactNode;
  children: ReactNode;
  eyebrow: string;
  title: string;
}) => (
  <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6">
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-semibold text-[#444748]">{eyebrow}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-black">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </section>
    {children}
  </div>
);

const KpiCard = ({
  arrow,
  avatars: showAvatars,
  danger,
  icon,
  label,
  meta,
  metaTone = "muted",
  value,
}: {
  arrow?: boolean;
  avatars?: boolean;
  danger?: boolean;
  icon: ReactNode;
  label: string;
  meta?: string;
  metaTone?: "success" | "danger" | "muted";
  value: string;
}) => (
  <div className="flex min-h-[150px] flex-col justify-between rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 transition hover:border-black">
    <div className="flex items-start justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${danger ? "bg-[#ef4444]/5 text-[#ef4444]" : "bg-black/5 text-black"} [&>svg]:h-5 [&>svg]:w-5`}>
        {icon}
      </div>
      {showAvatars ? (
        <div className="flex -space-x-2">
          <img alt="" className="h-6 w-6 rounded-full border border-white object-cover" src={avatars.emp1} />
          <img alt="" className="h-6 w-6 rounded-full border border-white object-cover" src={avatars.emp2} />
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5e2e1] text-[10px] font-bold">+15</div>
        </div>
      ) : meta ? (
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${metaTone === "success" ? "text-[#10b981]" : metaTone === "danger" ? "bg-[#ffdad6] text-[#93000a]" : "text-[#444748]"}`}>
          {meta}
        </span>
      ) : arrow ? (
        <ArrowRight className="h-5 w-5 text-[#444748]" />
      ) : null}
    </div>
    <div>
      <p className="text-sm font-semibold uppercase tracking-tight text-[#444748]">{label}</p>
      <p className={`text-4xl font-semibold tracking-tight ${danger ? "text-[#ef4444]" : "text-black"}`}>{value}</p>
    </div>
  </div>
);

const OwnerKpi = ({
  icon,
  label,
  trend,
  trendIcon,
  trendTone = "success",
  value,
}: {
  icon: ReactNode;
  label: string;
  trend: string;
  trendIcon?: ReactNode;
  trendTone?: "success" | "danger";
  value: string;
}) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 transition hover:border-black">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <span className={`flex items-center gap-1 text-sm font-semibold ${trendTone === "danger" ? "text-[#ef4444]" : "text-[#10b981]"}`}>
        {trend}
        <span className="[&>svg]:h-4 [&>svg]:w-4">{trendIcon}</span>
      </span>
    </div>
    <p className="text-xs text-[#444748]">{label}</p>
    <h3 className="mt-1 text-2xl font-black tracking-tight">{value}</h3>
  </div>
);

const Panel = ({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: ReactNode;
}) => (
  <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4">
      <h2 className="text-2xl font-semibold tracking-tight text-black">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const LateEmployee = ({ name, photo, shift, time }: { name: string; photo: string; shift: string; time: string }) => (
  <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#f7f3f2]">
    <div className="flex items-center gap-4">
      <img alt="" className="h-12 w-12 rounded-full object-cover" src={photo} />
      <div>
        <p className="text-sm font-semibold text-black">{name}</p>
        <p className="text-xs text-[#444748]">{shift}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold text-[#ef4444]">{time}</p>
      <p className="text-xs text-[#444748]">Scheduled: 08:00 AM</p>
    </div>
  </div>
);

const FeedItem = ({
  actions,
  color,
  sub,
  text,
  time,
}: {
  actions?: boolean;
  color: "success" | "secondary" | "danger";
  sub: string;
  text: ReactNode;
  time: string;
}) => {
  const tone = color === "success" ? "bg-[#10b981]" : color === "secondary" ? "bg-[#0058be]" : "bg-[#ef4444]";

  return (
    <div className="relative pl-12">
      <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center bg-white">
        <span className={`h-4 w-4 rounded-full ${tone} ring-4 ring-white`} />
      </div>
      <div className="rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] p-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-base text-black">{text}</p>
          <span className="shrink-0 text-xs text-[#444748]">{time}</span>
        </div>
        <p className="mt-1 text-xs text-[#444748]">{sub}</p>
        {actions ? (
          <div className="mt-4 flex gap-2">
            <button className="rounded bg-black px-4 py-1.5 text-xs font-semibold text-white">Approve</button>
            <button className="rounded border border-[#e5e7eb] bg-white px-4 py-1.5 text-xs font-semibold text-black">Review</button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const SummaryLine = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-white/10 py-4 last:border-b-0">
    <div>
      <p className="text-xs text-white/70">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
    <div className="text-white/20 [&>svg]:h-10 [&>svg]:w-10">{icon}</div>
  </div>
);

const LeaveItem = ({ date, name, photo }: { date: string; name: string; photo: string }) => (
  <div className="flex items-center gap-3">
    <img alt="" className="h-10 w-10 rounded-full object-cover" src={photo} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-black">{name}</p>
      <p className="truncate text-xs text-[#444748]">{date}</p>
    </div>
    <div className="flex gap-1">
      <button className="flex h-8 w-8 items-center justify-center rounded border border-[#e5e7eb] hover:bg-[#ef4444]/5 hover:text-[#ef4444]">
        <X className="h-4 w-4" />
      </button>
      <button className="flex h-8 w-8 items-center justify-center rounded border border-[#e5e7eb] hover:bg-[#10b981]/5 hover:text-[#10b981]">
        <Check className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const BranchRow = ({
  branch,
  coverage,
  efficiency,
  status,
  tone = "success",
}: {
  branch: string;
  coverage: string;
  efficiency: string;
  status: string;
  tone?: "success" | "secondary";
}) => (
  <tr className="hover:bg-[#f5f5f5]">
    <td className="px-6 py-4 font-semibold">{branch}</td>
    <td className="px-6 py-4">{efficiency}</td>
    <td className="px-6 py-4">{coverage}</td>
    <td className="px-6 py-4">
      <span className={tone === "success" ? "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#10b981]" : "rounded-full bg-[#0058be]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0058be]"}>
        {status}
      </span>
    </td>
  </tr>
);

const ActivityItem = ({
  detail,
  icon,
  time,
  title,
  tone = "primary",
}: {
  detail: string;
  icon: ReactNode;
  time: string;
  title: string;
  tone?: "primary" | "secondary" | "danger";
}) => {
  const color = tone === "secondary" ? "text-[#0058be]" : tone === "danger" ? "text-[#ef4444]" : "text-black";

  return (
    <div className="flex gap-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f5f5f5] ${color} [&>svg]:h-5 [&>svg]:w-5`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="text-xs text-[#444748]">{detail}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase text-[#444748]/60">{time}</p>
      </div>
    </div>
  );
};
