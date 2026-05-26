import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  UsersRound,
  Wand2,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const workplaceImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBD10SV1xwMpHvBTCoOhsK582aHXZD8LoSqeVPXCAzw5JAsQR08dCikrDBtAf2rjpd6liDN_7ztKxjHKlm9PK49AvyvEnM0NsHz0jjpxDvt06fFUHTi3ABRZMictAYHjCaadXM4KGTCBLDBTNFKAg5xx2SwJiUwkx1agNSUZTx7GyA2VYAaQdyWDy-WuDg5J5CIGE-Rokg_ztAqFeNuHX8A-Q8LToLFfSTZ3Kb-lujwmGN1euRSd3LSyL0GZBjZJE89kfwOlAgVTD9d";

const staff = [
  {
    name: "Alex Rivera",
    role: "Floor Manager",
    photo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDMU2AQMAbPtJU66Yel2ddibOuCZ7V_Yn97YRTEVD3qlUQmatY2-EsuBtRI08gqVOo93C5MZLA5lAy6IIZ3iZfe5uGUkkvzOam7fdXc7Bt1BPTXVAckTc_tBoOZAKJ304sJBNnp5GGKhq-T2YefTUkCMFALWSIdw4X00keZzAvG6fLeBowCUddg3HwAioo0x877muin9KucSrYARubMbB9RqAUx3nJCOaEdZtHZx4p7puogWsEwafJikUtbYYkhyZY-u4fqLct7MDK",
    shifts: ["Opening Shift", "Opening Shift", "", "Opening Shift", "Opening Shift", "Off", "Off"],
  },
  {
    name: "Jordan Lee",
    role: "Lead Barista",
    photo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqOLvmQOr5n6EZUuDRBBeZEmeopXkUXZdNUl_6CMZ4FKL73-6iHYg7wuzFy0pdvXlpIQWDQVNuzwhft1Mdcx_PMhgWjm3cPoat13oWDSFc6Bw8s_Ce6TGjoaOZJsiwQW1b2bKJZjlG9S4OFISpp1aE7LzsId31JUb0zLyb6sQcF6QCI9jBOz87L2kunXBS205ZCbBlF4prUhuMYc13HA6WiwXWdgh-xwCpmRYD2mwDaXgqIYp4q5tIdBi9YBbkC84to-0ZXUHCcoPy",
    shifts: ["", "Closing Support", "Closing Support", "Closing Support", "Closing Support", "Weekend Lead", "Weekend Lead"],
  },
  {
    name: "Sam Smith",
    role: "Junior Barista",
    photo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCEw1gtF0I6a9bLmWtlYYpyPkdOv7E_3lq4kdvgNDbQYQF11UCp3xO5uPPEkrHP3Y6kWpbLJStTVguPh9ss_LjO9d7SLUskOCGXY_GgN9Mf5vx4H1YvqLtozyA4ZRLxydS4NEKAGVehqMRUa-TMlYfZpWKlgf4JsTGgzdevAj52qZaFHm4kphDBPn_3-eIt8m0Mu9ZwpfTj0A30Fih6jnYHY5SGi9sdXwcDd8PB3YFdl-9mAfazev96yAtjx03QCF7fSbnURjerqUKS",
    shifts: ["Unavailable", "Night Shift", "", "Night Shift", "Night Shift", "", ""],
  },
  {
    name: "Casey Quinn",
    role: "General Staff",
    photo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqcI_586dEAoaYSZDHgA0Fc5McVabP3JIZ7Oxtr0N_eXKN12EaeRxaL0tRvzEfTtgzeHUkiQdbgGGIodHR8wIQj1hTlfQ7Yr9QqNTwrlO3SpFWJ2AzbNQN7WOGkALsbdSEikBs5Q6WtaeWa8cKiDRP1lk2TbC3FuEVkxdpK-wyR4QkIBJyqUO4rsGF17_kyMFWZ4e3yc97t3uCo4WopdA6AQKB-IfYOsLiv-oRayOGu9LLqWY9wfR0_Wi0uDP1Llo6Oun1BPGpsC43",
    shifts: ["Floor Support", "", "Floor Support", "", "Floor Support", "", ""],
  },
];

const templates = [
  { name: "Morning Shift", desc: "Daily opening and prep crew", time: "08:00 AM - 04:00 PM", staff: 6, color: "#10b981", active: true },
  { name: "Night Shift", desc: "Late night operations and security", time: "10:00 PM - 06:00 AM", staff: 3, color: "#0058be", active: true },
  { name: "Weekend Rush", desc: "High capacity peak hour staffing", time: "12:00 PM - 08:00 PM", staff: 12, color: "#ef4444", active: false },
  { name: "Afternoon Support", desc: "Mid-day transition and cleaning", time: "02:00 PM - 06:00 PM", staff: 4, color: "#868381", active: true },
];

export const ShiftPage = () => (
  <ShiftShell title="Shift Templates" search="Search templates..." action={<Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" to="/dashboard/shifts/new"><Plus className="h-4 w-4" />New Shift</Link>}>
    <main className="p-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-4xl font-semibold tracking-tight text-black">Shift Templates</h1>
          <p className="text-base text-[#444748]">Manage and organize your recurring shift patterns for easier scheduling.</p>
        </div>
        <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90" to="/dashboard/shifts/new">
          <Plus className="h-4 w-4" />
          Create Template
        </Link>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <MetricCard icon={<CheckCircle2 />} label="Active Templates" value="12" />
        <MetricCard icon={<Sparkles />} label="Weekly Coverage" value="94.2%" tone="success" />
        <MetricCard icon={<UsersRound />} label="Avg. Staff / Shift" value="8.5" tone="secondary" />
        <MetricCard icon={<AlertTriangle />} label="Unfilled Gaps" value="2" tone="danger" />
      </div>
      <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-black">Reusable Templates</h3>
          <div className="flex gap-2">
            <button className="rounded p-1 hover:bg-[#ebe7e6]"><Filter className="h-5 w-5" /></button>
            <button className="rounded p-1 hover:bg-[#ebe7e6]"><MoreVertical className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="divide-y divide-[#e5e7eb]">
          {templates.map((template) => <TemplateRow key={template.name} template={template} />)}
        </div>
        <div className="flex items-center justify-between bg-[#f7f3f2] px-6 py-4">
          <span className="text-xs text-[#444748]">Showing 4 of 12 templates</span>
          <div className="flex gap-2">
            <button className="rounded border border-[#e5e7eb] px-4 py-1 text-sm font-semibold hover:bg-white">Previous</button>
            <button className="rounded border border-[#e5e7eb] px-4 py-1 text-sm font-semibold hover:bg-white">Next</button>
          </div>
        </div>
      </section>
      <div className="mt-12 grid h-auto grid-cols-1 gap-6 md:grid-cols-3 xl:h-[400px]">
        <section className="group relative col-span-1 min-h-[320px] overflow-hidden rounded-2xl md:col-span-2">
          <img alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={workplaceImage} />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8">
            <h4 className="text-4xl font-semibold tracking-tight text-white">Smart Scheduling AI</h4>
            <p className="mt-2 max-w-md text-lg text-white/80">Let our AI optimize your template assignments based on historical peak traffic and staff availability.</p>
            <button className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black">Explore Insights <ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>
        <section className="flex flex-col justify-between rounded-2xl bg-black p-8 text-white">
          <div>
            <Wand2 className="mb-4 h-12 w-12" />
            <h4 className="mb-2 text-2xl font-semibold tracking-tight">Quick Fill</h4>
            <p className="text-base text-white/70">Instantly generate a full monthly schedule using your favorite templates in one click.</p>
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-white/10 p-4">
            <div className="mb-1 flex justify-between text-xs"><span>Integration Status</span><span className="text-[#10b981]">Active</span></div>
            <div className="h-1 overflow-hidden rounded-full bg-white/20"><div className="h-full w-4/5 bg-white" /></div>
          </div>
        </section>
      </div>
    </main>
  </ShiftShell>
);

export const ShiftCreatePage = () => (
  <>
    <SchedulePage />
    <ShiftModal />
  </>
);

export const SchedulePage = () => (
  <ShiftShell title="Schedules" search="Search shifts, staff..." action={<Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" to="/dashboard/shifts/new"><Plus className="h-4 w-4" />New Shift</Link>}>
    <main className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-white/95 px-6 py-5 backdrop-blur">
        <div className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">Weekly Schedule</h1>
            <p className="text-base text-[#444748]">Oct 23 - Oct 29, 2023</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold hover:bg-[#f7f3f2]"><Copy className="h-4 w-4" />Duplicate Previous</button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold hover:bg-[#f7f3f2]"><Sparkles className="h-4 w-4" />Bulk Auto-Assign</button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white"><ArrowRight className="h-4 w-4" />Publish Schedule</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
            <button className="bg-[#ebe7e6] px-4 py-2 text-sm font-semibold">Weekly</button>
            <Link className="border-l border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/schedule/monthly">Monthly</Link>
            <button className="border-l border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f3f2]">Daily</button>
          </div>
          <span className="mx-1 h-8 w-px bg-[#e5e7eb]" />
          <button className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#444748]"><Filter className="h-4 w-4" />Role: All Staff</button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#444748]"><CalendarDays className="h-4 w-4" />Next Week</button>
          <span className="ml-auto text-xs italic text-[#444748]">Showing 12 employees - 42 assigned shifts</span>
        </div>
      </div>
      <WeeklyBoard />
      <ScheduleSummary />
      <Link className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition active:scale-90" to="/dashboard/shifts/new">
        <Plus className="h-7 w-7" />
      </Link>
    </main>
  </ShiftShell>
);

export const MonthlySchedulePage = () => (
  <ShiftShell title="Schedules" search="Search shifts or staff..." action={<Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" to="/dashboard/shifts/new"><Plus className="h-4 w-4" />New Shift</Link>}>
    <main className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard icon={<Clock3 />} label="Total Labor Hours" value="1,248.5" sub="4.2% vs last month" tone="success" tall />
        <MetricCard icon={<UsersRound />} label="Attendance Rate" value="98.2%" sub="Target: 95.0%" tall />
        <MetricCard icon={<CalendarDays />} label="Open Shifts" value="12" sub="Requires attention" tone="danger" tall />
        <MetricCard icon={<Sparkles />} label="Labor Cost" value="$28.4k" sub="Within budget (92%)" tall />
      </div>
      <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-semibold tracking-tight">October 2023</h2>
            <div className="flex gap-1">
              <button className="rounded-lg border border-[#e5e7eb] p-1 hover:bg-[#f7f3f2]"><ChevronLeft className="h-5 w-5" /></button>
              <button className="rounded-lg border border-[#e5e7eb] p-1 hover:bg-[#f7f3f2]"><ChevronRight className="h-5 w-5" /></button>
              <button className="ml-2 rounded-lg border border-[#e5e7eb] px-4 py-1 text-sm font-semibold hover:bg-[#f7f3f2]">Today</button>
            </div>
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-1">
            <button className="px-4 py-1 text-sm font-semibold text-[#444748]">Day</button>
            <Link className="px-4 py-1 text-sm font-semibold text-[#444748]" to="/dashboard/schedule">Week</Link>
            <button className="rounded-md bg-white px-4 py-1 text-sm font-semibold shadow-sm">Month</button>
          </div>
        </div>
        <MonthlyCalendar />
      </section>
      <Link className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl transition hover:scale-110 active:scale-95" to="/dashboard/shifts/new">
        <Plus className="h-7 w-7" />
      </Link>
    </main>
  </ShiftShell>
);

const ShiftShell = ({ action, children, search, title }: { action?: ReactNode; children: ReactNode; search: string; title: string }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-6">
      <div className="flex min-w-0 items-center gap-6">
        <h2 className="shrink-0 text-2xl font-semibold tracking-tight text-black">{title}</h2>
        <div className="relative hidden w-96 lg:block">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
          <input className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 outline-none focus:ring-1 focus:ring-black" placeholder={search} />
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

const MetricCard = ({ icon, label, sub, tall, tone = "default", value }: { icon: ReactNode; label: string; sub?: string; tall?: boolean; tone?: "default" | "success" | "secondary" | "danger"; value: string }) => (
  <div className={`flex flex-col justify-between rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 ${tall ? "h-32" : ""}`}>
    <div className="mb-2 flex items-start justify-between">
      <span className="text-xs font-semibold text-[#444748]">{label}</span>
      <span className={tone === "danger" ? "text-[#ef4444]" : tone === "success" ? "text-[#10b981]" : tone === "secondary" ? "text-[#0058be]" : "text-black"}>{icon}</span>
    </div>
    <div>
      <p className={tone === "danger" ? "text-3xl font-semibold tracking-tight text-[#ef4444]" : "text-3xl font-semibold tracking-tight text-black"}>{value}</p>
      {sub ? <p className={tone === "success" ? "text-xs text-[#10b981]" : "text-xs text-[#444748]"}>{sub}</p> : null}
    </div>
  </div>
);

const TemplateRow = ({ template }: { template: (typeof templates)[number] }) => (
  <div className="flex items-center px-6 py-4 transition hover:bg-[#fdf8f8]">
    <div className="flex flex-1 items-center gap-6">
      <div className="h-12 w-1 rounded-full" style={{ backgroundColor: template.color }} />
      <div className="flex-1">
        <h4 className="font-bold text-black">{template.name}</h4>
        <p className="text-xs text-[#444748]">{template.desc}</p>
      </div>
      <div className="hidden w-48 items-center gap-1 text-sm font-semibold md:flex"><Clock3 className="h-4 w-4" />{template.time}</div>
      <div className="hidden w-40 items-center gap-1 text-sm md:flex"><UsersRound className="h-4 w-4 text-[#444748]" />Max Staff: <b>{template.staff}</b></div>
      <div className="w-20">
        <span className={`block h-5 w-10 rounded-full p-0.5 ${template.active ? "bg-black" : "bg-[#e5e2e1]"}`}>
          <span className={`block h-4 w-4 rounded-full bg-white transition ${template.active ? "translate-x-5" : ""}`} />
        </span>
      </div>
      <MoreVertical className="h-5 w-5 text-[#444748]" />
    </div>
  </div>
);

const WeeklyBoard = () => {
  const days = ["Monday|Oct 23", "Tuesday|Oct 24", "Wednesday|Oct 25", "Thursday|Oct 26", "Friday|Oct 27", "Saturday|Oct 28", "Sunday|Oct 29"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] table-fixed border-collapse">
        <thead className="sticky top-[133px] z-20 bg-white">
          <tr>
            <th className="sticky left-0 z-30 w-64 border-b border-r border-[#e5e7eb] bg-white p-0"><div className="flex h-16 items-center px-6 text-sm font-semibold text-[#444748]">Staff Member</div></th>
            {days.map((day) => {
              const [name, date] = day.split("|");
              return <th className="h-16 border-b border-[#e5e7eb] bg-white p-0" key={day}><div className={name === "Thursday" ? "flex flex-col items-center justify-center text-black" : "flex flex-col items-center justify-center"}><span className="text-sm font-semibold">{name}</span><span className="text-xs text-[#444748]">{date}</span>{name === "Thursday" ? <span className="mt-1 h-1 w-1 rounded-full bg-black" /> : null}</div></th>;
            })}
          </tr>
        </thead>
        <tbody>
          {staff.map((person) => <ScheduleRow key={person.name} person={person} />)}
        </tbody>
      </table>
    </div>
  );
};

const ScheduleRow = ({ person }: { person: (typeof staff)[number] }) => (
  <tr className="group">
    <td className="sticky left-0 z-10 border-b border-r border-[#e5e7eb] bg-white p-0 transition group-hover:bg-[#f7f3f2]">
      <div className="flex h-24 items-center gap-4 px-6">
        <img alt="" className="h-10 w-10 rounded-full border border-[#e5e7eb] object-cover" src={person.photo} />
        <div><p className="text-sm font-semibold">{person.name}</p><p className="text-xs text-[#444748]">{person.role}</p></div>
      </div>
    </td>
    {person.shifts.map((shift, index) => <ScheduleCell key={`${person.name}-${index}`} shift={shift} weekend={index > 4} />)}
  </tr>
);

const ScheduleCell = ({ shift, weekend }: { shift: string; weekend?: boolean }) => (
  <td className={`border-b border-r border-[#e5e7eb]/70 p-2 align-top ${weekend ? "bg-[#f7f3f2]/60" : ""}`}>
    {shift === "Off" ? <div className="flex h-full items-center justify-center text-xs italic opacity-30">Off</div> : null}
    {shift === "Unavailable" ? <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-[#f7f3f2] p-2 text-xs font-bold text-[#ef4444]">Unavailability</div> : null}
    {shift && shift !== "Off" && shift !== "Unavailable" ? <ShiftPill name={shift} /> : null}
  </td>
);

const ShiftPill = ({ name }: { name: string }) => {
  const primary = name.includes("Closing") || name.includes("Weekend");
  const muted = name.includes("Night");
  return (
    <div className={muted ? "rounded-lg border-l-4 border-[#747878] bg-[#e5e2e1] p-2" : primary ? "rounded-lg border-l-4 border-black bg-[#e6e1df] p-2" : "rounded-lg border-l-4 border-[#0058be] bg-[#d8e2ff]/30 p-2"}>
      <span className={primary ? "text-xs font-bold text-black" : muted ? "text-xs font-bold text-[#1c1b1b]" : "text-xs font-bold text-[#0058be]"}>{name.includes("Opening") ? "08:00 - 16:00" : name.includes("Night") ? "14:00 - 22:00" : name.includes("Weekend") ? "10:00 - 18:00" : "12:00 - 20:00"}</span>
      <p className="mt-1 text-[11px] font-medium">{name}</p>
    </div>
  );
};

const ScheduleSummary = () => (
  <footer className="border-t border-[#e5e7eb] bg-white p-6">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <SummaryItem label="Total Hours" value="342.5" meta="+12% vs last week" tone="success" />
      <SummaryItem label="Labor Cost (Est.)" value="$5,140" meta="Budget: $6,000" />
      <SummaryItem label="Coverage Gaps" value="2" meta="Friday Evening" tone="danger" />
      <div><span className="text-xs font-bold uppercase tracking-wider text-[#444748]">Status</span><div className="mt-2 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ef4444]" /><b>Draft - Not Published</b></div></div>
    </div>
  </footer>
);

const SummaryItem = ({ label, meta, tone, value }: { label: string; meta: string; tone?: "success" | "danger"; value: string }) => (
  <div><span className="text-xs font-bold uppercase tracking-wider text-[#444748]">{label}</span><div className="flex items-end gap-2"><span className={tone === "danger" ? "text-2xl font-semibold text-[#ef4444]" : "text-2xl font-semibold"}>{value}</span><span className={tone === "success" ? "pb-1 text-xs font-bold text-[#10b981]" : "pb-1 text-xs text-[#444748]"}>{meta}</span></div></div>
);

const MonthlyCalendar = () => {
  const labels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const cells = [
    ...[25, 26, 27, 28, 29, 30].map((day) => ({ day, muted: true })),
    { day: 1, shifts: ["08:00 - Opening", "14:00 - Mid"] },
    { day: 2, shifts: ["4 Shifts"] },
    { day: 3, active: true, shifts: ["08:00 - Kitchen", "Unassigned (2)", "16:00 - Bar"] },
    ...Array.from({ length: 29 }, (_, index) => ({ day: index + 4, shifts: [`${(index % 5) + 2} Scheduled`], open: index % 6 === 0 })),
  ].slice(0, 35);
  return (
    <>
      <div className="grid grid-cols-7 border-b border-[#e5e7eb] bg-[#f7f3f2]">
        {labels.map((label) => <div className="px-4 py-2 text-center text-sm font-semibold text-[#444748]" key={label}>{label}</div>)}
      </div>
      <div className="grid min-h-[600px] grid-cols-7 grid-rows-5">
        {cells.map((cell, index) => <CalendarCell cell={cell} key={`${cell.day}-${index}`} />)}
      </div>
    </>
  );
};

const CalendarCell = ({ cell }: { cell: { active?: boolean; day: number; muted?: boolean; open?: boolean; shifts?: string[] } }) => (
  <div className={`relative border-b border-r border-[#e5e7eb] p-2 transition hover:bg-[#f7f3f2] ${cell.muted ? "bg-[#f7f3f2] opacity-40" : ""} ${cell.active ? "bg-black/5 ring-1 ring-inset ring-black/20" : ""}`}>
    <span className={cell.active ? "flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white" : "text-xs font-semibold"}>{cell.day}</span>
    <div className="mt-1 space-y-1">
      {cell.shifts?.map((shift) => (
        <div className={shift.includes("Unassigned") || shift.includes("Open") ? "rounded-sm border-l-2 border-[#ef4444] bg-[#ef4444]/10 px-1 py-0.5" : shift.includes("Bar") ? "rounded-sm border-l-2 border-black bg-black/5 px-1 py-0.5" : "rounded-sm border-l-2 border-[#0058be] bg-[#0058be]/10 px-1 py-0.5"} key={shift}>
          <p className={shift.includes("Unassigned") || shift.includes("Open") ? "truncate text-[10px] font-bold text-[#ef4444]" : shift.includes("Bar") ? "truncate text-[10px] font-bold text-black" : "truncate text-[10px] font-bold text-[#0058be]"}>{shift}</p>
        </div>
      ))}
      {cell.open ? <div className="rounded-sm border-l-2 border-[#ef4444] bg-[#ef4444]/10 px-1 py-0.5"><p className="truncate text-[10px] font-bold text-[#ef4444]">Open Shift</p></div> : null}
    </div>
  </div>
);

const ShiftModal = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/20 p-4 backdrop-blur-sm">
    <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fdf8f8] px-6 py-4">
        <div><h2 className="text-2xl font-semibold tracking-tight text-black">Add New Shift</h2><p className="text-xs text-[#444748]">Monday, Oct 23 - Downtown Branch</p></div>
        <Link className="rounded-full p-2 hover:bg-[#ebe7e6]" to="/dashboard/schedule"><X className="h-5 w-5" /></Link>
      </div>
      <div className="space-y-6 p-6">
        <div className="flex items-start gap-4 rounded-lg border border-[#ef4444]/20 bg-[#ffdad6]/40 p-4">
          <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
          <div><p className="text-sm font-semibold text-[#93000a]">Scheduling Conflict Detected</p><p className="text-xs text-[#93000a]/80">Employee "Jordan Smith" is already scheduled for a Morning Shift (8:00 AM - 12:00 PM) at this location.</p></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-semibold">Shift Template</span><select className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none"><option>Standard Opening (8:00 AM - 4:00 PM)</option><option>Mid-Day Support (11:00 AM - 7:00 PM)</option><option>Closing Shift (4:00 PM - 12:00 AM)</option></select></label>
          <label className="space-y-2"><span className="text-sm font-semibold">Assign Employee</span><div className="flex h-10 items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4"><span className="flex-grow text-sm font-semibold">Jordan Smith</span><Search className="h-4 w-4 text-[#444748]" /></div></label>
          <div className="col-span-full grid grid-cols-2 gap-4 rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] p-4"><label><span className="text-xs text-[#444748]">Start Time</span><input className="block w-full border-0 bg-transparent p-0 text-2xl font-semibold outline-none" type="time" defaultValue="08:00" /></label><label><span className="text-xs text-[#444748]">End Time</span><input className="block w-full border-0 bg-transparent p-0 text-2xl font-semibold outline-none" type="time" defaultValue="16:00" /></label></div>
          <label className="col-span-full flex items-center gap-3"><input className="h-5 w-5 rounded border-[#e5e7eb]" type="checkbox" />Include 30-minute unpaid break</label>
          <label className="col-span-full space-y-2"><span className="text-sm font-semibold">Shift Notes (Optional)</span><textarea className="min-h-[100px] w-full resize-none rounded-lg border border-[#e5e7eb] px-4 py-2 outline-none" placeholder="Specific tasks, coverage requirements, or reminders..." /></label>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-[#fdf8f8] px-6 py-4">
        <button className="text-sm font-semibold text-[#444748] hover:text-black">Delete Draft</button>
        <div className="flex gap-3"><Link className="rounded-lg border border-[#e5e7eb] px-6 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/schedule">Cancel</Link><button className="rounded-lg bg-black px-8 py-2 text-sm font-semibold text-white">Publish Shift</button></div>
      </div>
    </div>
  </div>
);
