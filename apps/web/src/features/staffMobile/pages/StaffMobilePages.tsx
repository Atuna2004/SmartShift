import {
  ArrowLeft,
  Badge,
  Banknote,
  Bell,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Download,
  Edit3,
  FileText,
  Fingerprint,
  Flashlight,
  HeartPulse,
  HelpCircle,
  Home,
  Keyboard,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  MoreVertical,
  Plane,
  Plus,
  QrCode,
  Repeat,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const profileImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDqwlsWUlXEIY-pzH4FUL2Q7MdJ5y25__jBsb04UYsNsvax4oDaZo37Yp1Fhq-odmUZGeZgcVd7gSdv6blrFOOo6uGhMaVmlu4SdlXUzDWz4GEdDrjHi21X5IbOFwoSaUaozAKQUpV0aAO4tuhbeTRy_EI0vlSTfYxYBx7_hd-DO77cvNuTaW1JhdYnvIyoK9fxy94faBiStgbTirr--9B3MT_1iUmVLPX1Sx-Vx5Oi9sevxU-fs6mIy9dP88rMQaAVchyZOUWkZWr";

const scheduleItems = [
  { day: "Today", role: "Senior Barista", time: "08:00 - 16:30", location: "Downtown Branch - Main St.", cta: true },
  { day: "Wed, Nov 15", role: "Senior Barista", time: "09:00 - 17:00", location: "Waterfront Outlet" },
  { day: "Fri, Nov 17", role: "Shift Supervisor", time: "12:00 - 20:30", location: "Downtown Branch - Main St." },
  { day: "Mon, Nov 20", role: "Senior Barista", time: "08:00 - 16:30", location: "Waterfront Outlet" },
  { day: "Thu, Nov 23", role: "Inventory Specialist", time: "10:00 - 14:00", location: "Central Warehouse" },
];

const attendanceRows = [
  { date: "26", site: "Main Site - Warehouse A", time: "08:00 AM - 05:00 PM", hours: "9.0 hrs", status: "On-time" },
  { date: "25", site: "Main Site - Warehouse A", time: "08:14 AM - 05:00 PM", hours: "8.75 hrs", status: "Late (14m)" },
  { date: "24", site: "North Logistics Hub", time: "08:00 AM - 06:30 PM", hours: "10.5 hrs", status: "On-time" },
  { date: "23", site: "Main Site - Warehouse A", time: "08:00 AM - 05:00 PM", hours: "9.0 hrs", status: "On-time" },
];

export const StaffHomePage = () => (
  <StaffShell active="home">
    <main className="space-y-6 px-4 py-6">
      <section className="grid grid-cols-2 gap-4">
        <MiniStat icon={<CalendarClock />} label="This Week" meta="+2.4h vs last" value="32.5h" />
        <MiniStat icon={<Banknote />} label="Est. Earnings" meta="Next pay: Friday" value="$842.00" />
      </section>
      <section>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-[#444748]">Today's Shift</h2>
        <div className="relative overflow-hidden rounded-xl bg-black p-6 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div><p className="text-base text-white/70">Shift Lead - Floor Operations</p><h3 className="mt-1 text-4xl font-semibold tracking-tight">09:00 - 17:30</h3></div>
            <span className="flex items-center gap-1 rounded-full bg-[#10b981] px-3 py-1 text-xs font-semibold"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />Active</span>
          </div>
          <div className="relative z-10 mt-6 flex items-center gap-3"><AvatarStack /><p className="text-xs font-semibold text-white/80">Team on shift with you</p></div>
          <div className="relative z-10 mt-6 flex gap-3"><Link className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-black" to="/staff/check-in"><LogOut className="h-4 w-4" />Clock Out</Link><button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 py-3 text-sm font-semibold"><Coffee className="h-4 w-4" />Take Break</button></div>
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between px-1"><h2 className="text-sm font-bold uppercase tracking-wider text-[#444748]">Next Week Preview</h2><Link className="text-sm font-semibold text-[#0058be]" to="/staff/schedule">View All</Link></div>
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
          {["Mon 12 OFF", "Tue 13 09:00", "Wed 14 08:30", "Thu 15 OFF"].map((item) => {
            const [dow, day, label] = item.split(" ");
            return <div className="w-24 shrink-0 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 text-center" key={item}><p className="text-xs font-semibold text-[#444748]">{dow} {day}</p><div className={label === "OFF" ? "mx-auto my-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#d8e2ff]/30 text-[#0058be]" : "mx-auto my-4 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"}>{label === "OFF" ? <X className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}</div><p className="text-xs font-semibold">{label}</p></div>;
          })}
        </div>
      </section>
      <QuickActions />
    </main>
  </StaffShell>
);

export const StaffSchedulePage = () => (
  <StaffShell active="schedule">
    <main className="px-4 py-6">
      <section className="mb-6">
        <div className="mb-4 flex items-baseline justify-between"><h1 className="text-4xl font-semibold tracking-tight">Your Schedule</h1><button className="flex items-center gap-1 text-sm font-semibold text-[#0058be]"><CalendarDays className="h-4 w-4" />Monthly view</button></div>
        <div className="flex gap-2 overflow-x-auto py-2 [scrollbar-width:none]">{["Mon 13", "Tue 14", "Wed 15", "Thu 16", "Fri 17", "Sat 18"].map((day, index) => <button className={index === 0 ? "flex h-20 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-black text-white" : "flex h-20 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#e5e7eb]"} key={day}><span className="text-xs text-current/70">{day.split(" ")[0]}</span><span className="text-2xl font-semibold">{day.split(" ")[1]}</span></button>)}</div>
      </section>
      <ShiftSection title="This Week (Nov 13 - 19)" items={scheduleItems.slice(0, 3)} />
      <ShiftSection title="Next Week (Nov 20 - 26)" items={scheduleItems.slice(3)} />
      <section className="mt-8 grid grid-cols-2 gap-4"><StatBlock label="Total Hours" meta="+2.5 vs last week" value="38.5" /><StatBlock label="Total Shifts" meta="Scheduled" value="5" /></section>
    </main>
  </StaffShell>
);

export const StaffShiftDetailPage = () => (
  <StaffShell active="schedule" back title="Shift Detail" noBottomPadding>
    <main className="space-y-6 px-4 py-6 pb-32">
      <section className="space-y-4 rounded-xl bg-[#f5f5f5] p-6">
        <div className="flex items-start justify-between"><div><span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">Upcoming</span><h1 className="pt-2 text-4xl font-semibold tracking-tight">Morning Floor Shift</h1><p className="text-lg text-[#444748]">South Wing Level 2</p></div><div className="text-right"><p className="text-sm font-bold uppercase tracking-wider text-[#444748]">Duration</p><p className="text-2xl font-semibold">8.5 hrs</p></div></div>
        <div className="grid grid-cols-2 gap-4"><InfoTile icon={<LogIn />} label="Start Time" value="08:00 AM" /><InfoTile icon={<LogOut />} label="End Time" value="04:30 PM" /></div>
      </section>
      <section><SectionLabel>Location</SectionLabel><div className="relative h-48 overflow-hidden rounded-xl border border-[#e5e7eb]"><img alt="" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOVUiwTfYFoyqCZlYxvuXY7YfoKwTYm7wJ5t6kakqgSlWDrp8cIsZ17VMj_MRSua6H5rubz4_gm21JQWLIvWH7anXVX-YquoLsHAu23rgPCS1KdedWGRFj26NP_23dF5QtD2zhpgiC-Grd3OMZE5cp_I1OJNAbZ2NrIHMljUh-smCqoQDgWjCr3umWJspDrfAxUVP8SCEUXV_iTBH08j7r1gwQavFdQez_O4wGwB-lCc2ADCewxvpC_oMEGkWF3-4WI115AIKSwC84" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><div className="absolute bottom-4 left-4 text-white"><p className="font-semibold">Main Headquarters</p><p className="text-xs opacity-80">1221 Innovation Way, Tech District</p></div><button className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold"><MapPin className="mr-1 inline h-4 w-4" />Get Directions</button></div></section>
      <section><div className="mb-3 flex justify-between"><SectionLabel>Team on Shift</SectionLabel><span className="text-sm font-semibold text-[#0058be]">3 Active</span></div><div className="overflow-hidden rounded-xl border border-[#e5e7eb]">{["Marcus Thorne|Shift Lead", "Elena Rodriguez|Floor Associate", "Julian Chen|Floor Associate"].map((person) => <TeamRow key={person} person={person} />)}</div></section>
      <section><SectionLabel>Shift Notes</SectionLabel><div className="mt-3 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-5"><p className="mb-3 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" />Key Deliverables</p><ul className="space-y-2 text-[#444748]">{["Complete inventory restock for the South Wing prior to the lunch rush.", "Conduct safety walk-through with Marcus at 10:30 AM.", "Special attention to high-traffic areas during the afternoon transition."].map((note) => <li className="flex gap-3" key={note}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />{note}</li>)}</ul></div></section>
    </main>
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[#e5e7eb] bg-white/90 p-4 backdrop-blur"><div className="mx-auto flex max-w-2xl gap-4"><Link className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-black text-sm font-semibold text-white" to="/staff/shift-swaps"><Repeat className="h-4 w-4" />Shift Swap Request</Link><button className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb]"><MoreVertical className="h-5 w-5" /></button></div></div>
  </StaffShell>
);

export const StaffQrCheckInPage = () => {
  const [flash, setFlash] = useState(false);
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <StaffTop title="Workforce" />
      <main className="smartstaff-camera relative mt-16 mb-20 flex-1 overflow-hidden bg-black">
        <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARDb21avW966sKf7Zsa6rXW_NQuopvWqYLqRbbrbAItgcqLlYia9dM8m-qgCxBFw7QqusLZUMV4YAdDRiRpdDMGUwvQynKVxWI4VjQF0MUT34qOBWL-2ZDz6w53eGbPVUUJ_rVeq0B_-QBNWCRQRAAJNMYLYdQzjJtXwSZvp1YbhisLWITHOAo2ffNMeeAZdYXh4u6ZXevmLK01odaWUjwZQ6OuGILpwV5lNN3_zsT2q3LLLLBH_gktXIdKT7Vpk90AaAfRLmQLyGX" />
        <div className="smartstaff-scanner-overlay absolute inset-0 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
          <div className="relative -mt-24 aspect-square w-[70%] overflow-hidden rounded-xl border-2 border-white/50"><Corner a="left-0 top-0 border-l-4 border-t-4 rounded-tl-lg" /><Corner a="right-0 top-0 border-r-4 border-t-4 rounded-tr-lg" /><Corner a="bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg" /><Corner a="bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg" /><div className="smartstaff-scan-line absolute left-0 h-1 w-full bg-[#0058be] shadow-[0_0_15px_rgba(0,88,190,0.8)]" /></div>
          <div className="mt-8 px-6 text-center text-white"><h1 className="text-2xl font-bold drop-shadow">Align QR code to clock in</h1><p className="mt-2 text-white/80">Place the code within the frame to automatically scan</p></div>
        </div>
        <div className="absolute bottom-10 left-0 z-30 flex w-full justify-center gap-10 px-8"><CameraButton active={flash} icon={<Flashlight />} label="Flashlight" onClick={() => setFlash((v) => !v)} /><CameraButton icon={<Keyboard />} label="Manual Entry" /></div>
      </main>
      <StaffBottom active="checkin" />
    </div>
  );
};

export const StaffAttendanceHistoryPage = () => (
  <StaffShell active="checkin">
    <main className="px-4 py-6">
      <div className="mb-6"><h1 className="text-2xl font-semibold tracking-tight">Attendance History</h1><p className="text-[#444748]">Review your past work sessions and hours.</p></div>
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"><div className="relative flex h-48 flex-col justify-between overflow-hidden rounded-xl bg-black p-6 text-white md:col-span-2"><div><p className="text-sm font-bold uppercase tracking-widest text-white/70">Monthly Summary</p><p className="mt-2 text-4xl font-semibold">164.5 <span className="text-2xl font-normal">hrs</span></p><p className="text-white/70">October 2023 - 22 shifts</p></div><p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-[#10b981]" />98% Punctuality</p></div><div className="flex h-48 flex-col justify-between rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div><p className="text-sm font-bold uppercase tracking-widest text-[#444748]">Next Payout</p><p className="mt-2 text-2xl font-bold">$3,240.00</p></div><button className="rounded-lg bg-black py-3 text-sm font-semibold text-white">View Details</button></div></section>
      <div className="mb-4 flex justify-between"><div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">{["All Shifts", "Late Only", "Overtime"].map((f, i) => <button className={i === 0 ? "shrink-0 rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-[#e5e7eb] bg-[#f1edec] px-4 py-1.5 text-sm font-semibold text-[#444748]"} key={f}>{f}</button>)}</div><button className="flex items-center gap-1 font-semibold"><Search className="h-4 w-4" />Sort</button></div>
      <section className="space-y-4">{attendanceRows.map((row) => <AttendanceRow row={row} key={row.date} />)}<div className="py-4 text-center"><button className="font-semibold hover:underline">Load older shifts</button></div></section>
    </main>
  </StaffShell>
);

export const StaffShiftSwapsPage = () => {
  const [tab, setTab] = useState<"mine" | "available">("mine");
  return <StaffShell active="requests"><main className="px-4 py-6"><PageIntro title="Shift Swaps" desc="Manage your requests and browse available openings." /><Tabs tabs={[["mine", "My Requests"], ["available", "Available Swaps"]]} active={tab} setActive={(v) => setTab(v as typeof tab)} />{tab === "mine" ? <div className="space-y-4"><SwapMini title="Morning Shift" date="Mon, Oct 24 - 08:00 - 16:00" person="David Chen" status="Pending" /><SwapMini title="Night Shift" date="Fri, Oct 21 - 22:00 - 06:00" person="Sarah Jenkins" status="Approved" /></div> : <div className="space-y-4"><AvailableSwap title="Kitchen Staff - Saturday" date="Oct 29 - 12:00 - 20:00" by="Marcus Low" /><AvailableSwap title="Floor Manager - Sunday" date="Oct 30 - 09:00 - 17:00" by="Elena Rodriguez" /></div>}<button className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg"><Plus className="h-8 w-8" /></button></main></StaffShell>;
};

export const StaffLeaveRequestsPage = () => {
  const [open, setOpen] = useState(false);
  return <StaffShell active="requests"><main className="px-4 py-6"><section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="text-4xl font-semibold tracking-tight">Time Off</h1><p className="text-[#444748]">Manage your leave balances and requests.</p></div><button className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Request Leave</button></section><section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3"><LeaveBalance icon={<Plane />} label="Vacation" meta="Annual" value="12" width="60%" /><LeaveBalance icon={<HeartPulse />} label="Sick Leave" meta="Medical" value="05" width="40%" /><div className="relative overflow-hidden rounded-xl bg-black p-6 text-white"><p className="text-sm font-semibold text-white/70">Upcoming</p><h2 className="mt-2 text-2xl font-semibold leading-tight">Winter Break starts in 14 days</h2><p className="mt-4 flex items-center gap-2 text-xs"><CalendarDays className="h-4 w-4" />Dec 20 - Jan 02</p></div></section><section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white"><div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4"><h2 className="text-2xl font-semibold">Request History</h2><div className="flex gap-2"><Search className="h-5 w-5 text-[#444748]" /></div></div>{["Wellness Day|Pending|Dec 12, 2023 - 1 Day - Personal", "Thanksgiving Break|Approved|Nov 23 - Nov 25, 2023 - 3 Days - Vacation", "Dentist Appointment|Declined|Oct 15, 2023 - 0.5 Day - Medical"].map((item) => <LeaveHistory item={item} key={item} />)}<div className="bg-[#f7f3f2] px-6 py-4 text-center"><button className="text-sm font-semibold text-[#444748]">View All Requests</button></div></section></main>{open ? <LeaveModal onClose={() => setOpen(false)} /> : null}</StaffShell>;
};

export const StaffNotificationsPage = () => (
  <StaffShell active="requests">
    <main className="px-4 py-6"><div className="mb-6 flex gap-2 overflow-x-auto [scrollbar-width:none]">{["All Alerts", "Shift Reminders", "Approvals", "Announcements"].map((f, i) => <button className={i === 0 ? "shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-[#e5e7eb] bg-[#f5f5f5] px-4 py-2 text-sm font-semibold text-[#444748]"} key={f}>{f}</button>)}</div><section className="space-y-4"><SectionLabel>TODAY</SectionLabel><Notice icon={<CalendarClock />} title="Upcoming Shift Reminder" time="10m ago" detail="Your morning shift at Downtown Branch starts in 1 hour. Don't forget to check in." unread /><Notice icon={<CheckCircle2 />} title="Leave Request Approved" time="2h ago" detail="Your request for Oct 24th - Oct 26th has been approved by Sarah Miller." unread tone="success" /><SectionLabel>YESTERDAY</SectionLabel><Notice icon={<Bell />} title="New Policy Update" time="1d ago" detail="The North Branch has updated its safety protocols. Please review before your next shift." tone="secondary" /><Notice icon={<CalendarClock />} title="Missing Timecard Signature" time="1d ago" detail="You have one unsigned timecard from the previous week. Action required." tone="danger" /><SectionLabel>OCTOBER 15</SectionLabel><Notice icon={<Badge />} title="Perfect Week!" time="5d ago" detail="Great job! You maintained 100% on-time check-ins for the last 7 days." muted /></section></main>
  </StaffShell>
);

export const StaffProfilePage = () => (
  <StaffShell active="profile">
    <main className="px-4 py-6"><section className="mb-10 rounded-xl border border-[#e5e7eb] bg-white p-4"><div className="flex flex-col items-center gap-6 md:flex-row md:items-start"><div className="relative"><img alt="" className="h-32 w-32 rounded-xl border-4 border-white object-cover shadow-sm md:h-40 md:w-40" src={profileImage} /><span className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-[#10b981] p-1 text-white"><CheckCircle2 className="h-5 w-5" /></span></div><div className="flex-1 text-center md:text-left"><h1 className="text-4xl font-semibold tracking-tight">Jordan Sterling</h1><p className="text-lg font-medium text-[#444748]">Senior Operations Specialist</p><div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start"><Pill icon={<MapPin />} text="London West End Branch" /><Pill icon={<Badge />} text="ID: WF-98022" /></div></div><button className="hidden rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white md:block">Edit Profile</button></div></section><section className="mb-10"><h2 className="mb-6 text-2xl font-semibold">Documents & Finance</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><ProfileLink icon={<Banknote />} title="Payment Information" desc="Manage bank accounts and direct deposit settings." action="View Details" /><ProfileLink icon={<FileText />} title="Tax Documents" desc="Access your P60, annual statements, and tax forms." action="Download Forms" /><ProfileLink icon={<Badge />} title="Employment Contract" desc="Review current terms, perks, and signed agreements." action="View Contract" /></div></section><section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white"><div className="border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4"><h3 className="text-sm font-bold uppercase tracking-wider">Account Settings</h3></div><SettingsRow icon={<ShieldCheck />} title="Security & Login" desc="Two-factor authentication and active sessions." /><SettingsRow icon={<Bell />} title="Notification Preferences" desc="Manage push and email alerts for schedules." /><SettingsRow icon={<LogOut />} title="Sign Out" desc="Logout from this device safely." danger /></section></main>
  </StaffShell>
);

export const StaffSettingsPage = () => {
  const [dark, setDark] = useState(false);
  return <StaffShell active="profile" back title="Settings"><main className="mx-auto max-w-lg px-4 py-6"><section className="mb-6 flex items-center gap-4 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><img alt="" className="h-16 w-16 rounded-full object-cover" src={profileImage} /><div><h2 className="font-semibold">Alex Rivera</h2><p className="text-xs text-[#444748]">alex.rivera@workforce.io</p></div><button className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"><Edit3 className="h-4 w-4" /></button></section><div className="space-y-6"><SettingsGroup title="Appearance"><ToggleRow checked={dark} icon={<Moon />} label="Dark Mode" onChange={() => setDark((v) => !v)} /><SettingsRow icon={<Settings />} title="Language" desc="English (US)" compact /></SettingsGroup><SettingsGroup title="Notifications"><ToggleRow checked icon={<Bell />} label="Push Notifications" /><ToggleRow icon={<Mail />} label="Email Updates" /></SettingsGroup><SettingsGroup title="Security & Privacy"><SettingsRow icon={<Lock />} title="Change Password" compact /><ToggleRow checked icon={<Fingerprint />} label="Biometric Login" /><SettingsRow icon={<ShieldCheck />} title="Two-Factor Auth" desc="Enabled" compact success /></SettingsGroup><button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#ef4444]"><LogOut className="h-5 w-5" />Sign Out</button><button className="w-full py-2 text-sm font-semibold text-[#444748] hover:underline">Delete Account</button></div><p className="mt-12 text-center text-xs text-[#444748]">Workforce v2.4.1 (Build 8902)</p></main></StaffShell>;
};

const StaffShell = ({ active, back, children, noBottomPadding, title = "Workforce" }: { active: StaffTab; back?: boolean; children: ReactNode; noBottomPadding?: boolean; title?: string }) => (
  <div className={noBottomPadding ? "min-h-screen bg-white text-[#1c1b1b]" : "min-h-screen bg-white pb-24 text-[#1c1b1b]"}>
    <StaffTop back={back} title={title} />
    <div className="mx-auto mt-16 max-w-5xl">{children}</div>
    {noBottomPadding ? null : <StaffBottom active={active} />}
  </div>
);

const StaffTop = ({ back, title }: { back?: boolean; title: string }) => (
  <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#e5e7eb] bg-[#fdf8f8] px-4">
    <div className="flex items-center gap-3">{back ? <Link className="rounded-full p-2 hover:bg-[#ebe7e6]" to="/staff"><ArrowLeft className="h-5 w-5" /></Link> : <button className="rounded-full p-2 hover:bg-[#ebe7e6]"><Menu className="h-5 w-5" /></button>}<h1 className="text-2xl font-black">{title}</h1></div>
    <div className="flex items-center gap-2"><Link className="relative rounded-full p-2 hover:bg-[#ebe7e6]" to="/staff/notifications"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef4444]" /></Link>{back ? null : <Link className="h-8 w-8 overflow-hidden rounded-full border border-[#e5e7eb]" to="/staff/profile"><img alt="" className="h-full w-full object-cover" src={profileImage} /></Link>}</div>
  </header>
);

type StaffTab = "home" | "schedule" | "checkin" | "requests" | "profile";

const StaffBottom = ({ active }: { active: StaffTab }) => (
  <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-[#e5e7eb] bg-[#fdf8f8] px-2 py-3">
    <BottomLink active={active === "home"} icon={<Home />} label="Home" to="/staff" />
    <BottomLink active={active === "schedule"} icon={<CalendarDays />} label="Schedule" to="/staff/schedule" />
    <BottomLink active={active === "checkin"} floating icon={<QrCode />} label="Check-in" to="/staff/check-in" />
    <BottomLink active={active === "requests"} icon={<CalendarClock />} label="Requests" to="/staff/leave-requests" />
    <BottomLink active={active === "profile"} icon={<UserRound />} label="Profile" to="/staff/profile" />
  </nav>
);

const BottomLink = ({ active, floating, icon, label, to }: { active: boolean; floating?: boolean; icon: ReactNode; label: string; to: string }) => (
  <Link className={active ? "flex flex-col items-center justify-center rounded-xl bg-black px-3 py-1 text-white" : "flex flex-col items-center justify-center px-3 py-1 text-[#444748] hover:bg-[#f7f3f2]"} to={to}>
    <span className={floating ? "mb-1 flex h-10 w-10 -mt-6 items-center justify-center rounded-full bg-black text-white shadow-lg [&>svg]:h-5 [&>svg]:w-5" : "[&>svg]:h-5 [&>svg]:w-5"}>{icon}</span>
    <span className="mt-1 text-[10px] font-semibold">{label}</span>
  </Link>
);

const MiniStat = ({ icon, label, meta, value }: { icon: ReactNode; label: string; meta: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><div className="flex justify-between"><span className="text-[#0058be] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className="text-xs font-semibold text-[#444748]">{label}</span></div><p className="mt-4 text-2xl font-bold">{value}</p><p className="flex items-center gap-1 text-xs font-semibold text-[#10b981]"><TrendingUp className="h-3 w-3" />{meta}</p></div>;
const AvatarStack = () => <div className="flex -space-x-2">{["MS", "ER"].map((v) => <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#f1edec] text-xs font-bold text-black" key={v}>{v}</div>)}<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold text-black">+3</div></div>;
const QuickActions = () => <section><h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-[#444748]">Quick Actions</h2><div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f5f5f5]"><ActionRow icon={<CalendarDays />} title="Request Time Off" desc="Vacation, personal, or sick leave" to="/staff/leave-requests" /><ActionRow icon={<Repeat />} title="Swap Shift" desc="Offer your shift to team members" to="/staff/shift-swaps" /></div></section>;
const ActionRow = ({ desc, icon, title, to }: { desc: string; icon: ReactNode; title: string; to: string }) => <Link className="flex items-center justify-between border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#ebe7e6]" to={to}><div className="flex items-center gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0058be] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="font-semibold">{title}</p><p className="text-xs text-[#444748]">{desc}</p></div></div><ChevronRight className="h-5 w-5 text-[#444748]" /></Link>;
const ShiftSection = ({ items, title }: { items: typeof scheduleItems; title: string }) => <section className="mb-8"><h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#858383]">{title}</h2><div className="space-y-4">{items.map((item) => <ShiftCard item={item} key={`${item.day}-${item.time}`} />)}</div></section>;
const ShiftCard = ({ item }: { item: (typeof scheduleItems)[number] }) => <Link className="block rounded-xl border border-transparent bg-[#f5f5f5] p-4 transition hover:border-[#e5e7eb]" to="/staff/shift-detail"><div className="flex items-start justify-between gap-4"><div><span className={item.cta ? "mb-1 block text-sm font-semibold text-[#0058be]" : "mb-1 block text-sm font-semibold text-[#444748]"}>{item.day}</span><h3 className="text-2xl font-semibold">{item.role}</h3></div><div className="text-right"><p className="font-semibold">{item.time}</p><p className="text-xs text-[#444748]">{item.time.includes("16:30") ? "8.5 hrs (30m break)" : "8 hrs"}</p></div></div><div className="mt-4 flex items-center justify-between border-t border-[#e5e7eb] pt-4"><p className="flex items-center gap-1 text-sm text-[#444748]"><MapPin className="h-4 w-4" />{item.location}</p>{item.cta ? <span className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Clock In</span> : null}</div></Link>;
const StatBlock = ({ label, meta, value }: { label: string; meta: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] p-4"><p className="text-xs uppercase tracking-wide text-[#444748]">{label}</p><p className="mt-1 text-4xl font-semibold">{value}</p><p className="text-xs text-[#10b981]">{meta}</p></div>;
const InfoTile = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1edec] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="text-xs text-[#444748]">{label}</p><p className="font-semibold">{value}</p></div></div>;
const SectionLabel = ({ children }: { children: ReactNode }) => <h3 className="text-sm font-bold uppercase tracking-widest text-[#444748]">{children}</h3>;
const TeamRow = ({ person }: { person: string }) => { const [name, role] = person.split("|"); return <div className="flex items-center gap-4 border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#f7f3f2]"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e5e2e1] font-bold">{name.split(" ").map((p) => p[0]).join("")}</div><div className="flex-1"><p className="font-semibold">{name}</p><p className="text-xs text-[#444748]">{role}</p></div><button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb]"><MessageCircle className="h-5 w-5" /></button></div>; };
const Corner = ({ a }: { a: string }) => <div className={`absolute h-8 w-8 border-white ${a}`} />;
const CameraButton = ({ active, icon, label, onClick }: { active?: boolean; icon: ReactNode; label: string; onClick?: () => void }) => <button className="flex flex-col items-center gap-2" onClick={onClick}><div className={active ? "flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white text-black" : "flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md"}>{icon}</div><span className="text-sm font-semibold text-white">{label}</span></button>;
const AttendanceRow = ({ row }: { row: (typeof attendanceRows)[number] }) => <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white p-4"><div className="flex items-center gap-4"><div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[#f1edec]"><span className="text-xs font-semibold text-[#444748]">OCT</span><b className="text-xl leading-none">{row.date}</b></div><div><h3 className="font-semibold">{row.site}</h3><p className="text-sm text-[#444748]">{row.time} - {row.hours}</p></div></div><div className="flex items-center gap-4"><span className={row.status.startsWith("Late") ? "hidden rounded-full bg-[#ef4444]/10 px-3 py-1 text-sm font-semibold text-[#ef4444] sm:block" : "hidden rounded-full bg-[#10b981]/10 px-3 py-1 text-sm font-semibold text-[#10b981] sm:block"}>{row.status}</span><ChevronRight className="h-5 w-5 text-[#747878]" /></div></div>;
const PageIntro = ({ desc, title }: { desc: string; title: string }) => <section className="mb-6"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-[#444748]">{desc}</p></section>;
const Tabs = ({ active, setActive, tabs }: { active: string; setActive: (v: string) => void; tabs: string[][] }) => <div className="mb-4 flex gap-4 border-b border-[#e5e7eb]">{tabs.map(([value, label]) => <button className={active === value ? "border-b-2 border-black px-2 pb-3 text-sm font-semibold" : "border-b-2 border-transparent px-2 pb-3 text-sm font-semibold text-[#444748]"} onClick={() => setActive(value)} key={value}>{label}</button>)}</div>;
const SwapMini = ({ date, person, status, title }: { date: string; person: string; status: string; title: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><div className="mb-3 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#444748]">{title}</p><p className="font-semibold">{date}</p></div><span className={status === "Approved" ? "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs text-[#10b981]" : "rounded-full bg-[#e5e2e1] px-3 py-1 text-xs text-[#484645]"}>{status}</span></div><div className="flex items-center gap-3 border-t border-[#e5e7eb] py-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e2e1] text-xs font-bold">{person.split(" ").map((p) => p[0]).join("")}</div><p>Swap requested with <b>{person}</b></p></div>{status !== "Approved" ? <button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold">Cancel Request</button> : null}</div>;
const AvailableSwap = ({ by, date, title }: { by: string; date: string; title: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><div className="mb-3 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#444748]">{title}</p><p className="font-semibold">{date}</p></div><ChevronRight className="h-5 w-5 text-[#444748]" /></div><div className="flex items-center justify-between border-t border-[#e5e7eb] pt-3"><p>Posted by <b>{by}</b></p><button className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Claim Shift</button></div></div>;
const LeaveBalance = ({ icon, label, meta, value, width }: { icon: ReactNode; label: string; meta: string; value: string; width: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div className="mb-4 flex justify-between"><span className="rounded-lg bg-black p-2 text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className="rounded-full bg-[#f1edec] px-2 py-1 text-xs text-[#444748]">{meta}</span></div><p className="text-sm font-semibold text-[#444748]">{label}</p><p><span className="text-4xl font-semibold">{value}</span> <span className="text-sm font-semibold text-[#444748]">days left</span></p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e5e2e1]"><div className="h-full bg-black" style={{ width }} /></div></div>;
const LeaveHistory = ({ item }: { item: string }) => { const [title, status, desc] = item.split("|"); const tone = status === "Approved" ? "success" : status === "Declined" ? "danger" : "pending"; return <div className="flex items-center justify-between border-b border-[#e5e7eb] p-6 last:border-b-0 hover:bg-[#f7f3f2]"><div className="flex items-center gap-4"><span className={tone === "success" ? "flex h-12 w-12 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]" : tone === "danger" ? "flex h-12 w-12 items-center justify-center rounded-xl bg-[#ef4444]/10 text-[#ef4444]" : "flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600"}>{tone === "success" ? <CheckCircle2 /> : tone === "danger" ? <X /> : <CalendarClock />}</span><div><p className="font-semibold">{title} <span className="rounded bg-[#f1edec] px-2 py-0.5 text-[10px] uppercase">{status}</span></p><p className="text-xs text-[#444748]">{desc}</p></div></div><ChevronRight className="h-5 w-5 text-[#747878]" /></div>; };
const Notice = ({ detail, icon, muted, time, title, tone = "default", unread }: { detail: string; icon: ReactNode; muted?: boolean; time: string; title: string; tone?: "default" | "success" | "secondary" | "danger"; unread?: boolean }) => { const color = tone === "success" ? "bg-[#10b981]/10 text-[#10b981]" : tone === "secondary" ? "bg-[#0058be]/10 text-[#0058be]" : tone === "danger" ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-black text-white"; return <div className={muted ? "flex gap-4 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5]/50 p-4 opacity-80" : "flex gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4 hover:bg-[#f7f3f2]"}><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${color}`}>{icon}</span><div className="flex-1"><div className="mb-1 flex justify-between gap-2"><h3 className="font-semibold">{title}</h3><span className="shrink-0 text-xs text-[#444748]">{time}</span></div><p className="text-sm leading-tight text-[#444748]">{detail}</p></div>{unread ? <span className="h-2 w-2 self-center rounded-full bg-[#0058be]" /> : null}</div>; };
const Pill = ({ icon, text }: { icon: ReactNode; text: string }) => <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-[#f7f3f2] px-3 py-1 text-sm font-semibold">{icon}<span>{text}</span></span>;
const ProfileLink = ({ action, desc, icon, title }: { action: string; desc: string; icon: ReactNode; title: string }) => <a className="flex flex-col rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 hover:bg-white hover:shadow-md" href="#"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span><h3 className="mb-1 font-semibold">{title}</h3><p className="mb-4 text-xs text-[#444748]">{desc}</p><span className="mt-auto flex items-center text-sm font-semibold">{action}<ChevronRight className="h-4 w-4" /></span></a>;
const SettingsRow = ({ compact, danger, desc, icon, success, title }: { compact?: boolean; danger?: boolean; desc?: string; icon: ReactNode; success?: boolean; title: string }) => <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#f7f3f2]"><div className="flex items-center gap-4"><span className={danger ? "text-[#ef4444]" : "text-[#444748]"}>{icon}</span><div><p className={danger ? "font-semibold text-[#ef4444]" : "font-semibold"}>{title}</p>{desc ? <p className={success ? "text-xs text-[#10b981]" : "text-xs text-[#444748]"}>{desc}</p> : null}</div></div>{compact || !danger ? <ChevronRight className="h-4 w-4 text-[#444748]" /> : null}</div>;
const SettingsGroup = ({ children, title }: { children: ReactNode; title: string }) => <section><h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-[#444748]">{title}</h3><div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">{children}</div></section>;
const ToggleRow = ({ checked, icon, label, onChange }: { checked?: boolean; icon: ReactNode; label: string; onChange?: () => void }) => <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#f7f3f2]"><div className="flex items-center gap-4"><span className="text-[#444748]">{icon}</span><span>{label}</span></div><button className={checked ? "relative h-6 w-11 rounded-full bg-black" : "relative h-6 w-11 rounded-full bg-[#c4c7c7]"} onClick={onChange} type="button"><span className={checked ? "absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition" : "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition"} /></button></div>;
const LeaveModal = ({ onClose }: { onClose: () => void }) => <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"><div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#e5e7eb] p-6"><h2 className="text-2xl font-semibold">New Leave Request</h2><button className="rounded-full p-2 hover:bg-[#f7f3f2]" onClick={onClose}><X className="h-5 w-5" /></button></div><div className="space-y-4 p-6"><label className="block"><span className="mb-2 block font-semibold">Leave Type</span><select className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3"><option>Vacation</option><option>Sick Leave</option><option>Personal Day</option></select></label><div className="grid grid-cols-2 gap-4"><label><span className="mb-2 block font-semibold">Start Date</span><input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3" type="date" /></label><label><span className="mb-2 block font-semibold">End Date</span><input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3" type="date" /></label></div><label><span className="mb-2 block font-semibold">Reason (Optional)</span><textarea className="min-h-24 w-full rounded-lg border border-[#e5e7eb] p-3" placeholder="Briefly describe the reason for your leave..." /></label></div><div className="flex justify-end gap-3 bg-[#f7f3f2] p-6"><button className="rounded-lg border border-[#e5e7eb] px-6 py-2 font-semibold" onClick={onClose}>Cancel</button><button className="rounded-lg bg-black px-6 py-2 font-semibold text-white">Submit Request</button></div></div></div>;
