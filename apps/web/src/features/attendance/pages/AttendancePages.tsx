import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  Flashlight,
  HelpCircle,
  History,
  Keyboard,
  MapPin,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Timer,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const employees = [
  { initials: "JD", name: "Jameson Dun", role: "Senior Chef", branch: "Central", schedule: "08:00 - 16:00", checkIn: "07:55", checkOut: "--:--", status: "On Time" },
  { initials: "SK", name: "Sarah Kinsley", role: "Floor Manager", branch: "Central", schedule: "09:00 - 17:00", checkIn: "09:22", checkOut: "--:--", status: "Late" },
  { initials: "MR", name: "Marcus Reed", role: "Host", branch: "Central", schedule: "08:00 - 16:00", checkIn: "--:--", checkOut: "--:--", status: "Absent" },
  { initials: "EL", name: "Elena Lu", role: "Sous Chef", branch: "Central", schedule: "06:00 - 14:00", checkIn: "05:58", checkOut: "14:05", status: "Completed" },
  { initials: "TB", name: "Tom Berenger", role: "Cleaning Crew", branch: "Central", schedule: "10:00 - 18:00", checkIn: "10:00", checkOut: "--:--", status: "On Time" },
];

const historyEntries = [
  { shift: "Morning Shift", area: "Floor A", date: "Monday, Oct 23", checkIn: "08:00 AM", checkOut: "04:30 PM", total: "8.5h", status: "On Time" },
  { shift: "Mid-Day Shift", area: "Floor B", date: "Tuesday, Oct 24", checkIn: "10:15 AM", checkOut: "06:15 PM", total: "8.0h", status: "Late" },
  { shift: "Evening Support", area: "Warehouse", date: "Wednesday, Oct 25", checkIn: "02:00 PM", checkOut: "11:00 PM", total: "9.0h", status: "On Time" },
  { shift: "Morning Shift", area: "Floor A", date: "Thursday, Oct 26", checkIn: "08:00 AM", checkOut: "04:30 PM", total: "8.5h", status: "On Time" },
  { shift: "Weekly Sync", area: "Office", date: "Friday, Oct 27", checkIn: "09:00 AM", checkOut: "01:30 PM", total: "4.5h", status: "On Time" },
];

const activity = [
  { name: "Alex Rivera", detail: "Clocked In - Shift B", time: "2m ago" },
  { name: "Sarah Chen", detail: "Clocked Out - Overtime", time: "14m ago" },
  { name: "Jordan Smith", detail: "Clocked In - Shift A", time: "28m ago" },
  { name: "Mark Fletcher", detail: "Clocked Out - Break", time: "1h ago", muted: true },
];

export const AttendanceDashboardPage = () => (
  <AttendanceShell title="Attendance Monitoring" search="Search attendance records..." action={<LinkButton to="/dashboard/attendance/qr" icon={<QrCode className="h-4 w-4" />}>Open QR Gateway</LinkButton>}>
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black">Attendance Monitoring</h1>
          <p className="text-base text-[#444748]">Real-time status for Central Branch - Today, Oct 24</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#f7f3f2]">
            <Filter className="h-4 w-4" />
            Filter View
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<TrendingUp />} label="Attendance Rate" meta="+2.4% vs last week" tone="success" value="94.2%" />
        <KpiCard icon={<Clock3 />} label="Late Today" meta="Requires attention" tone="danger" value="08" />
        <KpiCard icon={<UserRound />} label="Absent Today" meta="Planned: 02" value="03" />
        <KpiCard icon={<Timer />} label="Total Hours" meta="Projected: 440h" tone="secondary" value="412h" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm xl:col-span-9">
          <div className="flex flex-col justify-between gap-3 border-b border-[#e5e7eb] p-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold tracking-tight text-black">Today's Attendance</h2>
            <div className="flex gap-2">
              <select className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none">
                <option>All Branches</option>
                <option>Central Branch</option>
                <option>Westside Hub</option>
              </select>
              <select className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none">
                <option>All Roles</option>
                <option>Kitchen</option>
                <option>Service</option>
                <option>Delivery</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-xs font-bold uppercase tracking-wider text-[#444748]">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3 text-center">Check-in</th>
                  <th className="px-4 py-3 text-center">Check-out</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {employees.map((employee) => (
                  <tr className="transition hover:bg-[#f7f3f2]" key={employee.name}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1edec] text-xs font-bold">{employee.initials}</div>
                        <div>
                          <p className="font-semibold text-black">{employee.name}</p>
                          <p className="text-xs text-[#444748]">{employee.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#444748]">{employee.branch}</td>
                    <td className="px-4 py-4">{employee.schedule}</td>
                    <td className={employee.status === "Late" ? "px-4 py-4 text-center font-semibold text-[#ef4444]" : "px-4 py-4 text-center font-semibold"}>{employee.checkIn}</td>
                    <td className="px-4 py-4 text-center text-[#444748]">{employee.checkOut}</td>
                    <td className="px-4 py-4 text-right"><StatusBadge status={employee.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#e5e7eb] bg-[#f7f3f2] p-4 text-center">
            <Link className="text-sm font-semibold text-black hover:underline" to="/dashboard/attendance/history">View 18 more entries</Link>
          </div>
        </section>

        <aside className="space-y-4 xl:col-span-3">
          <Panel title="Recent Alerts" badge="NEW">
            <AlertItem icon={<AlertTriangle />} title="Late Arrival: Sarah Kinsley" detail="22 minutes late for shift at Central Branch." tone="danger" action="Take Action" />
            <AlertItem icon={<Bell />} title="Missing Check-out" detail="David Chen did not clock out for yesterday's shift." action="Resolve" />
            <AlertItem icon={<CalendarDays />} title="Schedule Change" detail="Shift swap requested by Leo Vance and Mia Wong." action="Review" />
          </Panel>
          <section className="relative overflow-hidden rounded-xl bg-black p-6 text-white">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Optimization Tip</h3>
            <p className="mb-6 text-sm leading-6 text-white/70">Attendance rate is 4% higher during morning shifts compared to evenings. Consider adjusting staffing levels.</p>
            <button className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10">See Insights</button>
          </section>
        </aside>
      </div>
    </main>
  </AttendanceShell>
);

export const AttendanceQrPage = () => {
  const [secondsLeft, setSecondsLeft] = useState(522);
  const qrUrl = useMemo(() => `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=SmartShift-Attendance-${secondsLeft}`, [secondsLeft]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 600));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <AttendanceShell title="Attendance Gateway" search="Search activity..." action={<LinkButton to="/dashboard/attendance/scanner" icon={<QrCode className="h-4 w-4" />}>Staff Scanner</LinkButton>}>
      <main className="grid min-h-[calc(100vh-4rem)] grid-cols-1 bg-white lg:grid-cols-[1fr_320px]">
        <section className="flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <header className="mb-8">
              <h1 className="text-4xl font-semibold tracking-tight text-black">Attendance Gateway</h1>
              <p className="text-base text-[#444748]">Live station for staff clock-in and clock-out.</p>
            </header>
            <div className="relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-8 text-center shadow-sm">
              <div className="absolute right-8 top-8 text-black/5"><QrCode className="h-40 w-40" /></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ffdad6] px-4 py-2 text-sm font-semibold text-[#93000a]">
                  <Timer className="h-4 w-4" />
                  Expires in {minutes}:{seconds}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-black">Scan to Log Session</h2>
                <p className="mx-auto mt-2 max-w-md text-base text-[#444748]">Point your mobile scanner at this code to clock in or clock out. The code refreshes automatically for security.</p>
                <div className="mx-auto my-8 w-fit rounded-xl border-2 border-black bg-white p-4 shadow-xl transition hover:scale-[1.02]">
                  <img alt="SmartShift QR Code" className="h-64 w-64 object-contain" src={qrUrl} />
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-black px-6 text-sm font-semibold text-white" onClick={() => setSecondsLeft(600)}>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate QR
                  </button>
                  <button className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#e5e7eb] px-6 text-sm font-semibold text-black hover:bg-[#f7f3f2]">
                    <BarChart3 className="h-4 w-4" />
                    Fullscreen Mode
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard icon={<QrCode />} label="Device ID" value="HUB-STATION-04" tone="secondary" />
              <InfoCard icon={<MapPin />} label="Station" value="Main Entrance A" />
              <InfoCard icon={<ShieldCheck />} label="Security" value="Dynamic Encryption" />
            </div>
          </div>
        </section>
        <ActivityFeed />
      </main>
    </AttendanceShell>
  );
};

export const AttendanceHistoryPage = () => (
  <AttendanceShell title="Attendance History" search="Search history..." action={<LinkButton to="/dashboard/attendance" icon={<ArrowLeft className="h-4 w-4" />}>Back</LinkButton>}>
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <section className="relative overflow-hidden rounded-xl bg-black p-8 text-white">
        <p className="mb-2 text-sm font-semibold text-white/70">This Week</p>
        <h1 className="text-5xl font-extrabold leading-none">38.5h</h1>
        <p className="mt-3 flex items-center gap-2 text-base text-white/80"><TrendingUp className="h-5 w-5" />4.2h more than last week</p>
      </section>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All Entries", "On Time", "Late", "Overtime"].map((filter, index) => (
          <button className={index === 0 ? "shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#444748]"} key={filter}>
            {filter}
          </button>
        ))}
      </div>
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#444748]">Recent Activity</h2>
        {historyEntries.map((entry) => <HistoryEntry entry={entry} key={entry.date} />)}
      </section>
      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]">
        <Download className="h-4 w-4" />
        Export Monthly Report
      </button>
    </main>
  </AttendanceShell>
);

export const StaffQrScannerPage = () => {
  const [flashOn, setFlashOn] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1c1b1b]">
      <header className="flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
        <div className="flex items-center gap-2">
          <Link className="rounded-full p-2 hover:bg-[#f7f3f2]" to="/dashboard/attendance/qr"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-2xl font-bold">SmartShift</h1>
        </div>
        <div className="flex items-center gap-3 text-[#444748]">
          <HelpCircle className="h-5 w-5" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1edec] text-xs font-bold">AR</div>
        </div>
      </header>
      <div className="flex items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">
        <MapPin className="h-4 w-4" />
        Scanning for Branch: Downtown Hub
      </div>
      <main className="relative flex min-h-[560px] flex-1 items-center justify-center overflow-hidden bg-black">
        <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpgMCNcYk-4MO3bE2bOB6Wp8DtsVhZXLpCcfTKe8l11k4N3DizQWZ_IIvluZDpTFKEvX00zpjXoA1kp3PI2ogWAR2xrrx64yxA8Az5lvcOAFGEMSMtJFlTgo5WzJqhDf1dtJR224EwNIkbUV5JJ4GWjYjDMaA-uz0hbGvaqHevk8SY8RNCA7-MR64LcIb1s2hgGdQ8RcxRTJTA3EN5dZN50mnXJfmqQFn38pCseH5iAdgkR1sgVL6cZoQbiQ7hdHTLvxft9sQmPI3t" />
        <div className="smartshift-scan-overlay absolute inset-0 z-10" />
        <div className="relative z-20 h-[260px] w-[260px]">
          <div className="smartshift-scan-line absolute left-0 w-full" />
          <ScannerCorner className="left-0 top-0 border-b-0 border-r-0" />
          <ScannerCorner className="right-0 top-0 border-b-0 border-l-0" />
          <ScannerCorner className="bottom-0 left-0 border-r-0 border-t-0" />
          <ScannerCorner className="bottom-0 right-0 border-l-0 border-t-0" />
          <div className="absolute inset-0 flex items-center justify-center"><span className="h-1.5 w-1.5 rounded-full bg-white/40" /></div>
        </div>
        <div className="absolute bottom-12 left-1/2 z-30 w-[80%] max-w-md -translate-x-1/2 rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-md">
          Align QR code within the frame to clock in
        </div>
      </main>
      <footer className="bg-white px-6 py-6">
        <div className="mx-auto max-w-md space-y-5">
          <div className="flex items-center justify-center gap-8">
            <ScannerAction active={flashOn} icon={<Flashlight />} label="Flash" onClick={() => setFlashOn((value) => !value)} />
            <ScannerAction icon={<Keyboard />} label="Type Code" />
            <ScannerAction icon={<History />} label="History" />
          </div>
          <Link className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-semibold text-white" to="/dashboard/attendance/success">
            Enter Code Manually
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
};

export const CheckInSuccessPage = () => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fdf8f8] p-6 text-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
    <div className="relative z-10 w-full max-w-sm">
      <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-[#10b981]/10">
        <CheckCircle2 className="h-16 w-16 text-[#10b981]" />
      </div>
      <h1 className="mb-2 text-4xl font-semibold tracking-tight text-black">Good morning, Alex!</h1>
      <p className="mb-12 text-lg text-[#444748]">You are clocked in.</p>
      <div className="mb-12 space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-[#444748]"><Clock3 className="h-5 w-5" />Clocked In At</span>
          <span className="text-xl font-semibold text-black">08:56 AM</span>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 text-left">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#444748]"><CalendarDays className="h-4 w-4" />Current Shift</span>
          <p className="mt-3 text-2xl font-semibold text-black">Morning Shift</p>
          <p className="text-base text-[#444748]">09:00 - 17:00</p>
        </div>
      </div>
      <div className="space-y-3">
        <Link className="flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" to="/dashboard/attendance/history">Go to Attendance History</Link>
        <Link className="flex h-12 w-full items-center justify-center rounded-lg border border-[#e5e7eb] text-sm font-semibold text-black hover:bg-[#f7f3f2]" to="/dashboard/attendance">Close</Link>
      </div>
    </div>
    <div className="fixed bottom-6 left-1/2 w-[calc(100%-48px)] max-w-sm -translate-x-1/2 rounded-full bg-black px-4 py-3 text-white shadow-lg">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />Location verified: HQ Office</span>
        <ShieldCheck className="h-4 w-4" />
      </div>
    </div>
  </div>
);

const AttendanceShell = ({ action, children, search, title }: { action?: ReactNode; children: ReactNode; search: string; title: string }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-4 md:gap-6">
        <h2 className="shrink-0 text-xl font-semibold tracking-tight text-black md:text-2xl">{title}</h2>
        <div className="relative hidden w-96 lg:block">
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

const LinkButton = ({ children, icon, to }: { children: ReactNode; icon?: ReactNode; to: string }) => (
  <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90" to={to}>
    {icon}
    {children}
  </Link>
);

const KpiCard = ({ icon, label, meta, tone = "default", value }: { icon: ReactNode; label: string; meta: string; tone?: "default" | "success" | "secondary" | "danger"; value: string }) => {
  const toneClass = tone === "success" ? "bg-[#10b981]/10 text-[#10b981]" : tone === "danger" ? "bg-[#ef4444]/10 text-[#ef4444]" : tone === "secondary" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#444748]/10 text-[#444748]";
  const metaClass = tone === "success" ? "text-[#10b981]" : tone === "danger" ? "text-[#ef4444]" : tone === "secondary" ? "text-[#0058be]" : "text-[#444748]";

  return (
    <div className="flex h-32 flex-col justify-between rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 transition hover:border-black/20">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#444748]">{label}</span>
        <span className={`rounded-lg p-2 [&>svg]:h-5 [&>svg]:w-5 ${toneClass}`}>{icon}</span>
      </div>
      <div>
        <p className="text-4xl font-semibold tracking-tight text-black">{value}</p>
        <p className={`text-xs font-bold ${metaClass}`}>{meta}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const tone = status === "On Time" ? "bg-[#10b981]/10 text-[#10b981]" : status === "Late" ? "bg-[#ef4444]/10 text-[#ef4444]" : status === "Completed" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#444748]/10 text-[#444748]";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${tone}`}>{status}</span>;
};

const Panel = ({ badge, children, title }: { badge?: string; children: ReactNode; title: string }) => (
  <section className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-2xl font-semibold tracking-tight text-black">{title}</h3>
      {badge ? <span className="rounded bg-[#ef4444] px-2 py-1 text-[10px] font-black text-white">{badge}</span> : null}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const AlertItem = ({ action, detail, icon, title, tone = "default" }: { action: string; detail: string; icon: ReactNode; title: string; tone?: "default" | "danger" }) => (
  <div className={tone === "danger" ? "flex gap-3 rounded-lg border-l-4 border-[#ef4444] bg-[#ffdad6]/20 p-3" : "flex gap-3 rounded-lg border-l-4 border-[#747878] bg-[#f7f3f2] p-3"}>
    <div className={tone === "danger" ? "mt-1 text-[#ef4444]" : "mt-1 text-[#444748]"}>{icon}</div>
    <div>
      <p className="text-sm font-bold text-black">{title}</p>
      <p className="text-xs text-[#444748]">{detail}</p>
      <button className={tone === "danger" ? "mt-1 flex items-center gap-1 text-sm font-semibold text-[#ef4444]" : "mt-1 flex items-center gap-1 text-sm font-semibold text-[#444748]"}>
        {action}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const InfoCard = ({ icon, label, tone, value }: { icon: ReactNode; label: string; tone?: "secondary"; value: string }) => (
  <div className="flex items-center gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
    <div className={tone === "secondary" ? "flex h-12 w-12 items-center justify-center rounded-lg bg-[#d8e2ff] text-[#0058be]" : "flex h-12 w-12 items-center justify-center rounded-lg bg-[#f1edec] text-black"}>
      <span className="[&>svg]:h-6 [&>svg]:w-6">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#444748]">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  </div>
);

const ActivityFeed = () => (
  <aside className="hidden border-l border-[#e5e7eb] bg-white lg:flex lg:flex-col">
    <div className="border-b border-[#e5e7eb] p-6">
      <h3 className="text-2xl font-semibold tracking-tight text-black">Recent Activity</h3>
      <p className="text-xs text-[#444748]">Real-time check-in stream</p>
    </div>
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {activity.map((item) => (
        <div className={item.muted ? "rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4 opacity-60" : "rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4"} key={item.name}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-xs font-bold">{item.name.split(" ").map((part) => part[0]).join("")}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold text-black">{item.name}</p>
                <span className="shrink-0 text-[10px] text-[#444748]">{item.time}</span>
              </div>
              <p className="text-xs text-[#444748]">{item.detail}</p>
              {!item.muted ? <p className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase text-[#10b981]"><span className="h-2 w-2 rounded-full bg-[#10b981]" />Verified</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="border-t border-[#e5e7eb] p-4">
      <Link className="flex h-10 w-full items-center justify-center rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/attendance/history">View Full History</Link>
    </div>
  </aside>
);

const HistoryEntry = ({ entry }: { entry: (typeof historyEntries)[number] }) => (
  <article className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 transition hover:bg-[#f1edec]">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="mb-0.5 text-sm font-semibold text-black">{entry.shift} - {entry.area}</p>
        <h3 className="text-lg font-bold text-black">{entry.date}</h3>
      </div>
      <StatusBadge status={entry.status} />
    </div>
    <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-4">
      <div className="flex gap-8">
        <TimeValue label="Check In" value={entry.checkIn} />
        <TimeValue label="Check Out" value={entry.checkOut} />
      </div>
      <div className="text-right">
        <p className="text-xs text-[#444748]">Total</p>
        <p className="text-xl font-black text-black">{entry.total}</p>
      </div>
    </div>
  </article>
);

const TimeValue = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-[#444748]">{label}</p>
    <p className="text-sm font-semibold text-black">{value}</p>
  </div>
);

const ScannerCorner = ({ className }: { className: string }) => (
  <div className={`absolute h-10 w-10 border-4 border-white transition ${className}`} />
);

const ScannerAction = ({ active, icon, label, onClick }: { active?: boolean; icon: ReactNode; label: string; onClick?: () => void }) => (
  <button className="group flex flex-col items-center gap-1" onClick={onClick} type="button">
    <div className={active ? "flex h-14 w-14 items-center justify-center rounded-full border border-[#0058be] bg-[#d8e2ff] text-[#0058be] transition group-active:scale-90" : "flex h-14 w-14 items-center justify-center rounded-full border border-[#e5e7eb] text-black transition hover:bg-[#f7f3f2] group-active:scale-90"}>
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
    </div>
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
  </button>
);
