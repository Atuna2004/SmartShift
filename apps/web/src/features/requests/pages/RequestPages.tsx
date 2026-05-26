import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Info,
  MoreVertical,
  Plane,
  Plus,
  Repeat,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const swapRequests = [
  { from: "Sarah Chen", to: "Marcus Wright", id: "#SW-9021", shift: "Oct 24, 08:00 - 16:00", proposed: "Oct 25, 12:00 - 20:00", role: "Senior Barista", status: "Pending Approval", reason: "Family emergency requires me to travel out of town for the weekend." },
  { from: "Liam Johnson", to: "Elena Rodriguez", id: "#SW-8944", shift: "Oct 25, 14:00 - 22:00", proposed: "Oct 26, 08:00 - 16:00", role: "Shift Manager", status: "Approved", reason: "Scheduling conflict with university exam. Elena has agreed to cover." },
  { from: "Maya Patel", to: "David Wilson", id: "#SW-8812", shift: "Oct 26, 06:00 - 14:00", proposed: "Oct 27, 10:00 - 18:00", role: "Kitchen Staff", status: "Rejected", reason: "Personal appointment that cannot be rescheduled.", note: "David is already reaching maximum overtime for this pay period." },
  { from: "Tom Harris", to: "Sarah Chen", id: "#SW-9105", shift: "Oct 28, 16:00 - 00:00", proposed: "Oct 30, 08:00 - 16:00", role: "Floor Staff", status: "Pending Approval", reason: "Swapping for Sarah's morning shift on Monday to balance my schedule." },
];

const leaveRequests = [
  { name: "Marcus Thorne", role: "Front-end Developer", dates: "Jun 12 - Jun 15, 2024", applied: "Applied on Jun 02", days: "4 Days", type: "Vacation", status: "Pending Review" },
  { name: "Sarah Jenkins", role: "Store Manager", dates: "Jun 14, 2024", applied: "Applied on Jun 05", days: "1 Day", type: "Sick Leave", status: "Approved" },
  { name: "David Chen", role: "Logistics Lead", dates: "Jun 18 - Jun 20, 2024", applied: "Applied on Jun 04", days: "3 Days", type: "Personal", status: "Rejected" },
  { name: "Elena Rodriguez", role: "Operations Analyst", dates: "Jul 01 - Jul 10, 2024", applied: "Applied on Jun 06", days: "8 Days", type: "Vacation", status: "Pending Review" },
];

const notifications = [
  { title: "Shift Swap Request", detail: "Sarah Jenkins requested to swap her Morning Barista shift on Dec 14 with Michael Chen's Closing Barista shift on Dec 15.", time: "2h ago", type: "request", unread: true },
  { title: "Incomplete Schedule Warning", detail: "The North Side branch schedule for next week is currently missing 3 required Floor Lead positions.", time: "5h ago", type: "alert", unread: true },
  { title: "Leave Request Approved", detail: "James Wilson's request for Personal Time (Dec 20 - Dec 22) has been automatically approved based on company policy.", time: "Yesterday", type: "request", unread: false },
  { title: "Monthly Payroll Report Ready", detail: "The payroll summary for November 2023 has been generated and is ready for review in the Reports section.", time: "2 days ago", type: "report", unread: false },
];

export const ShiftSwapPage = () => (
  <RequestShell title="Shift Swaps" search="Search by employee name...">
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <PageTitle
        title="Shift Swaps"
        description="Manage and review employee shift exchange requests."
        action={<Link className="inline-flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:opacity-90" to="/dashboard/shift-swaps/new"><Plus className="h-4 w-4" />New Swap Request</Link>}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
          <input className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-4 outline-none focus:ring-1 focus:ring-black" placeholder="Search by employee name..." />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:col-span-7 lg:justify-end">
          <span className="text-sm font-semibold text-[#444748]">Status:</span>
          {["All", "Pending", "Approved", "Rejected"].map((status, index) => (
            <button className={index === 0 ? "rounded-full bg-black px-4 py-2 text-sm font-bold text-white" : "rounded-full bg-[#f1edec] px-4 py-2 text-sm font-bold text-[#444748] hover:bg-[#ebe7e6]"} key={status}>{status}</button>
          ))}
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f3f2]"><Filter className="h-4 w-4" />More Filters</button>
        </div>
      </div>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {swapRequests.map((request) => <SwapCard key={request.id} request={request} />)}
      </section>
      <div className="flex flex-col items-center gap-4 border-t border-[#e5e7eb] py-8">
        <p className="text-xs text-[#444748]">Showing 4 of 24 requests</p>
        <button className="rounded-lg border border-[#e5e7eb] px-6 py-3 text-sm font-bold hover:bg-[#f7f3f2]">Load More Requests</button>
      </div>
    </main>
  </RequestShell>
);

export const CreateShiftSwapPage = () => (
  <>
    <ShiftSwapPage />
    <ShiftSwapModal />
  </>
);

export const LeaveRequestsPage = () => (
  <RequestShell title="Leave Requests" search="Search requests...">
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <PageTitle
        title="Leave Requests"
        description="Review and manage employee time-off applications across all branches."
        action={<button className="inline-flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:opacity-90"><Plus className="h-4 w-4" />New Leave Request</button>}
      />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard icon={<CalendarDays />} label="Pending Approval" value="12" tone="secondary" />
        <StatCard icon={<Plane />} label="On Vacation" value="5" />
        <StatCard icon={<Stethoscope />} label="Sick Leave" value="3" />
        <StatCard icon={<CalendarDays />} label="Available Balance" value="184" />
      </section>
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#f7f3f2] p-3">
        <span className="text-sm font-semibold text-[#444748]">Filters:</span>
        <select className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold"><option>Type: All</option><option>Vacation</option><option>Sick</option><option>Personal</option></select>
        <select className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold"><option>Status: All</option><option>Pending</option><option>Approved</option><option>Rejected</option></select>
        <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold hover:bg-[#ebe7e6]"><CalendarDays className="h-4 w-4" />This Month</button>
        <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold hover:bg-[#ebe7e6]"><Filter className="h-4 w-4" />More Filters</button>
        <button className="ml-auto text-sm font-semibold text-[#0058be] hover:underline">Clear all filters</button>
      </div>
      <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-sm font-semibold text-[#444748]">
              <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Date Range</th><th className="px-6 py-4 text-center">Total Days</th><th className="px-6 py-4">Leave Type</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {leaveRequests.map((request) => <LeaveRow key={request.name} request={request} />)}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
          <p className="text-xs text-[#444748]">Showing 1 to 4 of 24 requests</p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[#e5e7eb] p-1.5 opacity-50" disabled><ChevronLeft className="h-5 w-5" /></button>
            {[1, 2, 3].map((page) => <button className={page === 1 ? "rounded-lg bg-black px-3 py-1 text-sm font-semibold text-white" : "rounded-lg border border-[#e5e7eb] px-3 py-1 text-sm font-semibold hover:bg-white"} key={page}>{page}</button>)}
            <button className="rounded-lg border border-[#e5e7eb] p-1.5 hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 md:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-black">Leave Distribution</h2>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#0058be]"><Download className="h-4 w-4" />Export Report</button>
          </div>
          <div className="flex h-48 items-end gap-3 px-2">
            {[60, 45, 75, 40, 90, 55, 30, 65].map((height, index) => <div className={index === 4 ? "flex-1 rounded-t-lg bg-black" : "flex-1 rounded-t-lg bg-[#e5e2e1]"} key={index} style={{ height: `${height}%` }} />)}
          </div>
          <div className="mt-4 flex justify-between px-2 text-xs text-[#444748]">{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((month) => <span key={month}>{month}</span>)}</div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-[#0058be] p-6 text-white">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20"><AlertTriangle className="h-6 w-6" /></div>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight">Staffing Alert</h2>
            <p className="text-base text-white/90">3 team members in Logistics are requesting leave for the same week in July. Review schedules before approving.</p>
          </div>
          <button className="mt-6 h-12 rounded-xl bg-white text-sm font-semibold text-[#0058be]">Resolve Conflicts</button>
        </div>
      </section>
    </main>
  </RequestShell>
);

export const NotificationsPage = () => {
  const [tab, setTab] = useState<"all" | "unread" | "requests" | "alerts">("all");
  const visible = notifications.filter((item) => tab === "all" || (tab === "unread" ? item.unread : tab === "requests" ? item.type === "request" : item.type === "alert"));

  return (
    <RequestShell title="Notifications" search="Search notifications...">
      <main className="mx-auto max-w-5xl p-4 md:p-6">
        <PageTitle title="Notifications" description="Manage and review all your enterprise alerts and staff requests." action={<button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f3f2]">Mark all as read</button>} />
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="flex overflow-x-auto border-b border-[#e5e7eb] bg-[#f7f3f2] px-4">
            {[
              ["all", "All"],
              ["unread", "Unread"],
              ["requests", "Requests"],
              ["alerts", "System Alerts"],
            ].map(([value, label]) => (
              <button className={tab === value ? "border-b-2 border-black px-6 py-4 text-sm font-semibold text-black" : "border-b-2 border-transparent px-6 py-4 text-sm font-semibold text-[#444748] hover:text-black"} key={value} onClick={() => setTab(value as typeof tab)}>
                {label}
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f1edec]"><Bell className="h-16 w-16 text-black/20" /></div>
              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-black">All caught up!</h2>
              <p className="max-w-md text-base text-[#444748]">You have no unread notifications at the moment. Check back later for shift updates or system alerts.</p>
              <button className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white" onClick={() => setTab("all")}>View All Notifications</button>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {visible.map((item) => <NotificationItem item={item} key={item.title} />)}
            </div>
          )}
        </section>
        <p className="mt-8 text-center text-xs text-[#444748]">Need help managing notifications? <span className="font-semibold text-[#0058be]">Visit Support Center</span></p>
      </main>
    </RequestShell>
  );
};

const RequestShell = ({ action, children, search, title }: { action?: ReactNode; children: ReactNode; search: string; title: string }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-6">
        <h2 className="shrink-0 text-2xl font-semibold tracking-tight text-black">{title}</h2>
        <div className="relative hidden w-80 lg:block">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
          <input className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder={search} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Bell className="h-5 w-5 text-[#444748]" />
        {action}
      </div>
    </header>
    {children}
  </div>
);

const PageTitle = ({ action, description, title }: { action?: ReactNode; description: string; title: string }) => (
  <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
    <div>
      <h1 className="text-4xl font-semibold tracking-tight text-black">{title}</h1>
      <p className="text-base text-[#444748]">{description}</p>
    </div>
    {action}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const tone = status.includes("Pending") ? "bg-amber-100 text-amber-800" : status === "Approved" ? "bg-green-100 text-green-800" : status === "Rejected" ? "bg-red-100 text-red-800" : "bg-[#f1edec] text-[#444748]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>;
};

const SwapCard = ({ request }: { request: (typeof swapRequests)[number] }) => (
  <article className="flex flex-col gap-4 rounded-xl border border-transparent bg-[#f5f5f5] p-6 transition hover:border-[#e5e7eb] hover:bg-white hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <AvatarPair a={request.from} b={request.to} />
        <div>
          <p className="text-sm font-bold">{request.from} <span className="font-normal text-[#444748]">to</span> {request.to}</p>
          <p className="text-xs text-[#444748]">Request ID: {request.id}</p>
        </div>
      </div>
      <StatusBadge status={request.status} />
    </div>
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
      <Meta label="Original Shift" value={request.shift} />
      <Meta label="Role" value={request.role} />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase text-[#444748]">Reason</p>
      <p className="text-base italic text-black">"{request.reason}"</p>
    </div>
    {request.note ? <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700"><b>Note:</b> {request.note}</div> : null}
    {request.status.includes("Pending") ? (
      <div className="mt-auto flex gap-2">
        <button className="flex-1 rounded-lg bg-black py-2 text-sm font-bold text-white hover:opacity-90">Approve</button>
        <button className="flex-1 rounded-lg border border-[#e5e7eb] py-2 text-sm font-bold text-[#444748] hover:bg-[#f7f3f2]">Decline</button>
      </div>
    ) : (
      <button className="mt-auto rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] py-2 text-sm font-bold text-[#444748]">View History</button>
    )}
  </article>
);

const AvatarPair = ({ a, b }: { a: string; b: string }) => (
  <div className="flex -space-x-3">
    {[a, b].map((name) => <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#e5e2e1] text-xs font-bold" key={name}>{name.split(" ").map((part) => part[0]).join("")}</div>)}
  </div>
);

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-1 text-[10px] font-bold uppercase text-[#444748]">{label}</p>
    <p className="text-sm font-semibold text-black">{value}</p>
  </div>
);

const StatCard = ({ icon, label, tone, value }: { icon: ReactNode; label: string; tone?: "secondary"; value: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[#444748] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <span className={tone === "secondary" ? "text-xs text-[#0058be]" : "text-xs text-[#444748]"}>{label}</span>
    </div>
    <p className="text-2xl font-semibold text-black">{value}</p>
  </div>
);

const LeaveRow = ({ request }: { request: (typeof leaveRequests)[number] }) => (
  <tr className="group hover:bg-[#f7f3f2]">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f1edec] text-xs font-bold">{request.name.split(" ").map((part) => part[0]).join("")}</div>
        <div><p className="text-sm font-semibold text-black">{request.name}</p><p className="text-xs text-[#444748]">{request.role}</p></div>
      </div>
    </td>
    <td className="px-6 py-4"><p>{request.dates}</p><p className="text-xs text-[#444748]">{request.applied}</p></td>
    <td className="px-6 py-4 text-center"><span className="rounded-full bg-[#f1edec] px-3 py-1 text-sm font-semibold">{request.days}</span></td>
    <td className="px-6 py-4"><span className="inline-flex items-center gap-2"><span className={request.type === "Vacation" ? "h-2 w-2 rounded-full bg-[#0058be]" : request.type === "Sick Leave" ? "h-2 w-2 rounded-full bg-[#ef4444]" : "h-2 w-2 rounded-full bg-black/40"} />{request.type}</span></td>
    <td className="px-6 py-4"><StatusBadge status={request.status} /></td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
        {request.status.includes("Pending") ? <><button className="rounded-lg p-2 text-[#10b981] hover:bg-green-50"><CheckCircle2 className="h-5 w-5" /></button><button className="rounded-lg p-2 text-[#ef4444] hover:bg-red-50"><X className="h-5 w-5" /></button></> : <button className="rounded-lg p-2 text-[#444748] hover:bg-[#ebe7e6]"><Info className="h-5 w-5" /></button>}
        <button className="rounded-lg p-2 text-[#444748] hover:bg-[#ebe7e6]"><MoreVertical className="h-5 w-5" /></button>
      </div>
    </td>
  </tr>
);

const NotificationItem = ({ item }: { item: (typeof notifications)[number] }) => {
  const icon = item.type === "request" ? <Repeat /> : item.type === "alert" ? <AlertTriangle /> : <BarChart3 />;
  const tone = item.type === "request" ? "bg-[#0058be]/10 text-[#0058be]" : item.type === "alert" ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-[#f1edec] text-black";

  return (
    <div className="relative flex items-start gap-4 p-6 transition hover:bg-[#f7f3f2]">
      {item.unread ? <span className="absolute left-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-[#0058be]" /> : null}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tone}`}>{icon}</div>
      <div className="flex-1">
        <div className="mb-1 flex items-start justify-between gap-4">
          <h3 className="text-sm font-bold text-black">{item.title}</h3>
          <span className="shrink-0 text-xs text-[#444748]">{item.time}</span>
        </div>
        <p className="mb-4 text-base text-[#444748]">{item.detail}</p>
        {item.type === "request" && item.unread ? <div className="flex gap-2"><button className="rounded-lg bg-black px-4 py-1.5 text-sm font-semibold text-white">Approve</button><button className="rounded-lg border border-[#e5e7eb] px-4 py-1.5 text-sm font-semibold hover:bg-white">Decline</button></div> : null}
      </div>
      {item.unread ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0058be]" /> : null}
    </div>
  );
};

const ShiftSwapModal = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Request Shift Swap</h2>
        <Link className="text-[#444748] hover:text-black" to="/dashboard/shift-swaps"><X className="h-5 w-5" /></Link>
      </div>
      <div className="space-y-6 p-6">
        <FieldSelect label="Select Your Shift" options={["Choose an upcoming shift...", "Oct 26: 08:00 - 16:00 (Downtown)", "Oct 28: 12:00 - 20:00 (Northside)", "Oct 30: 09:00 - 17:00 (Downtown)"]} />
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-black">Select Colleague</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
            <input className="h-11 w-full rounded-lg border border-[#e5e7eb] pl-10 pr-4 outline-none focus:ring-1 focus:ring-black" placeholder="Search by name or role..." />
          </div>
          <div className="flex gap-1 overflow-x-auto pt-2">
            {["Elena R.", "Sarah M.", "James W.", "Mark D."].map((name) => <button className="shrink-0 rounded-full border border-[#e5e7eb] px-3 py-1 text-xs hover:bg-[#f1edec]" key={name}>{name}</button>)}
          </div>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-black">Reason for Swap</span>
          <textarea className="min-h-28 w-full resize-none rounded-lg border border-[#e5e7eb] p-4 outline-none focus:ring-1 focus:ring-black" placeholder="Briefly explain the reason for your request..." />
        </label>
        <div className="flex gap-3 rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-4">
          <Info className="h-5 w-5 text-[#0058be]" />
          <p className="text-xs leading-5 text-[#444748]">The recipient will receive a notification and must approve the swap before it is sent to the manager for final authorization.</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-white px-6 py-4">
        <Link className="rounded-lg px-5 py-2 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]" to="/dashboard/shift-swaps">Cancel</Link>
        <button className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90">Send Request</button>
      </div>
    </div>
  </div>
);

const FieldSelect = ({ label, options }: { label: string; options: string[] }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-black">{label}</span>
    <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:ring-1 focus:ring-black">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  </label>
);
