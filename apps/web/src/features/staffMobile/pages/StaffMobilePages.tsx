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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { attendanceApi } from "@/features/attendance/attendance.api";
import { QrScanner } from "@/features/attendance/components/QrScanner";
import type { AttendanceRecord, AttendanceStatus } from "@/features/attendance/attendance.types";
import { dailyQrApi } from "@/features/attendance/dailyQr.api";
import { authApi } from "@/features/auth/auth.api";
import { compensationApi } from "@/features/compensation/compensation.api";
import type { OvertimeRequest } from "@/features/compensation/compensation.types";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import { leaveRequestApi } from "@/features/requests/leaveRequest.api";
import type { LeaveRequest } from "@/features/requests/leaveRequest.types";
import { notificationApi } from "@/features/notification/notification.api";
import type { Notification } from "@/features/notification/notification.types";
import { shiftSwapApi } from "@/features/requests/shiftSwap.api";
import type { ShiftSwapRequest } from "@/features/requests/shiftSwap.types";
import { scheduleApi } from "@/features/shift/schedule.api";
import type { AssignedShift } from "@/features/shift/schedule.types";
import { getApiErrorMessage } from "@/shared/api";
import { useAuthStore } from "@/store";

const profileImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDqwlsWUlXEIY-pzH4FUL2Q7MdJ5y25__jBsb04UYsNsvax4oDaZo37Yp1Fhq-odmUZGeZgcVd7gSdv6blrFOOo6uGhMaVmlu4SdlXUzDWz4GEdDrjHi21X5IbOFwoSaUaozAKQUpV0aAO4tuhbeTRy_EI0vlSTfYxYBx7_hd-DO77cvNuTaW1JhdYnvIyoK9fxy94faBiStgbTirr--9B3MT_1iUmVLPX1Sx-Vx5Oi9sevxU-fs6mIy9dP88rMQaAVchyZOUWkZWr";

export const StaffHomePage = () => {
  const user = useAuthStore((state) => state.user);
  const today = toDateInputValue(new Date());
  const inSevenDays = toDateInputValue(addDays(new Date(), 7));
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { staffHome: true, today, inSevenDays }],
    queryFn: () => scheduleApi.my({ from: today, to: inSevenDays, published: true }),
    enabled: Boolean(user?.id),
  });
  const historyQuery = useQuery({
    queryKey: ["attendances", "my", { staffHome: true, today }],
    queryFn: () => attendanceApi.history({ from: today, to: today, limit: 50 }),
    enabled: Boolean(user?.id),
  });
  const schedules = schedulesQuery.data?.data ?? [];
  const todaySchedule = schedules.find((schedule) => toDateInputValue(schedule.workDate) === today) ?? schedules[0];
  const teamQuery = useQuery({
    queryKey: ["employees", { staffHomeTeam: true, branchId: todaySchedule?.branchId }],
    queryFn: () => employeeApi.list({ limit: 20, role: "staff", status: "active", ...(todaySchedule?.branchId ? { branchId: todaySchedule.branchId } : {}) }),
    enabled: Boolean(todaySchedule?.branchId),
  });
  const upcomingSchedules = schedules.slice(0, 4);
  const attendanceRecords = historyQuery.data?.data ?? [];
  const teamMembers = (teamQuery.data?.data ?? []).filter((employee) => employee.id !== user?.id);
  const totalHours = attendanceRecords.reduce((sum, record) => sum + getWorkedHours(record), 0);
  const nextPayMeta = todaySchedule ? `${todaySchedule.shiftStartTime} - ${todaySchedule.shiftEndTime}` : "Chưa có ca hôm nay";

  return (
    <StaffShell active="home">
      <main className="space-y-6 px-4 py-6">
        <section className="grid grid-cols-2 gap-4">
          <MiniStat icon={<CalendarClock />} label="Tổng giờ" meta={`${attendanceRecords.length} bản ghi chấm công`} value={`${totalHours.toFixed(1)}h`} />
          <MiniStat icon={<Banknote />} label="Ca tiếp theo" meta={todaySchedule ? formatDateLabel(todaySchedule.workDate) : "Chưa xếp lịch"} value={nextPayMeta} />
        </section>
        <section>
          <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-[#444748]">Ca hôm nay</h2>
          <div className="relative overflow-hidden rounded-xl bg-black p-6 text-white shadow-lg">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-base text-white/70">{todaySchedule ? "Ca được xếp hôm nay" : "Chưa có ca hôm nay"}</p>
                <h3 className="mt-1 text-4xl font-semibold tracking-tight">{todaySchedule ? `${todaySchedule.shiftStartTime} - ${todaySchedule.shiftEndTime}` : "--"}</h3>
                <p className="mt-2 text-sm text-white/70">{todaySchedule ? formatDateLabel(todaySchedule.workDate) : "Chờ cập nhật lịch"}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-[#10b981] px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                {todaySchedule ? "Đã xếp" : "Trống"}
              </span>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-3">
              <AvatarStack names={teamMembers.map((employee) => employee.fullName)} />
              <p className="text-xs font-semibold text-white/80">{teamMembers.length > 0 ? `${teamMembers.length} đồng nghiệp cùng chi nhánh` : `${user?.fullName ?? "Bạn"} đang làm việc hôm nay`}</p>
            </div>
            <div className="relative z-10 mt-6 flex gap-3">
              <Link className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-black" to="/staff/check-in">
                <LogOut className="h-4 w-4" />
                Chấm công
              </Link>
              <Link className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 py-3 text-sm font-semibold" to="/staff/attendance-history">
                <Coffee className="h-4 w-4" />
                Lịch sử
              </Link>
            </div>
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#444748]">Lịch sắp tới</h2>
            <Link className="text-sm font-semibold text-[#0058be]" to="/staff/schedule">
              Xem tất cả
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
            {upcomingSchedules.length === 0 ? (
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 text-sm font-semibold text-[#444748]">Chưa có lịch trong tuần này.</div>
            ) : (
              upcomingSchedules.map((schedule) => (
                <Link className="w-44 shrink-0 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4" key={schedule.id} to="/staff/schedule">
                  <p className="text-xs font-semibold text-[#444748]">{formatDateLabel(schedule.workDate)}</p>
                  <div className="mx-auto my-4 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold">{schedule.shiftStartTime} - {schedule.shiftEndTime}</p>
                  <p className="mt-1 text-xs text-[#444748] line-clamp-2">{getAssignedShiftBranchName(schedule)}</p>
                </Link>
              ))
            )}
          </div>
        </section>
        <QuickActions />
      </main>
    </StaffShell>
  );
};

export const StaffSchedulePage = () => {
  const user = useAuthStore((state) => state.user);
  const [statusFilter, setStatusFilter] = useState<"all" | AssignedShift["status"]>("all");
  const [branchFilter, setBranchFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");
  const now = new Date();
  const today = toDateInputValue(now);
  const [selectedMonth, setSelectedMonth] = useState(toMonthInputValue(now));
  const monthDate = new Date(`${selectedMonth}-01T00:00:00`);
  const monthStart = toDateInputValue(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const monthEnd = toDateInputValue(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { staffSchedule: true, monthStart, monthEnd }],
    queryFn: () => scheduleApi.my({ from: monthStart, to: monthEnd, published: true }),
    enabled: Boolean(user?.id),
  });
  const attendanceQuery = useQuery({
    queryKey: ["attendances", "my", { staffSchedule: true, monthStart, monthEnd }],
    queryFn: () => attendanceApi.history({ from: monthStart, to: monthEnd, limit: 200 }),
    enabled: Boolean(user?.id),
  });
  const schedules = schedulesQuery.data?.data ?? [];
  const attendanceRecords = attendanceQuery.data?.data ?? [];
  const attendanceByScheduleId = useMemo(
    () => new Map(attendanceRecords.map((record) => [record.scheduleId, record] as const)),
    [attendanceRecords]
  );
  const branchOptions = useMemo(() => {
    const branches = new Map<string, string>();
    for (const schedule of schedules) {
      branches.set(schedule.branchId, getAssignedShiftBranchName(schedule));
    }
    return Array.from(branches.entries());
  }, [schedules]);
  const schedulesMatchingFilters = useMemo(() => {
    const term = search.trim().toLowerCase();
    return schedules.filter((schedule) => {
      const scheduleDate = toDateInputValue(schedule.workDate);
      const matchesStatus = statusFilter === "all" || schedule.status === statusFilter;
      const matchesBranch = !branchFilter || schedule.branchId === branchFilter;
      const matchesSearch =
        !term ||
        [
          formatDateLabel(scheduleDate),
          schedule.shiftStartTime,
          schedule.shiftEndTime,
          getAssignedShiftBranchName(schedule),
          toAssignedShiftStatusLabel(schedule.status),
          getAssignedShiftAttendanceLabel(schedule, attendanceByScheduleId.get(schedule.id), today),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesBranch && matchesSearch;
    });
  }, [attendanceByScheduleId, branchFilter, schedules, search, statusFilter, today]);
  const dateOptions = useMemo(() => {
    const dates = new Map<string, AssignedShift>();
    for (const schedule of schedulesMatchingFilters) {
      const scheduleDate = toDateInputValue(schedule.workDate);
      if (!dates.has(scheduleDate)) {
        dates.set(scheduleDate, schedule);
      }
    }
    return Array.from(dates.entries()).slice(0, 7);
  }, [schedulesMatchingFilters]);
  const filteredSchedules = useMemo(
    () =>
      schedulesMatchingFilters.filter(
        (schedule) => !selectedDate || toDateInputValue(schedule.workDate) === selectedDate
      ),
    [schedulesMatchingFilters, selectedDate]
  );
  const totalHours = attendanceRecords.reduce((sum, record) => sum + getWorkedHours(record), 0);
  const checkedInCount = schedules.reduce((count, schedule) => count + (attendanceByScheduleId.get(schedule.id)?.checkInTime ? 1 : 0), 0);
  const missingCheckInCount = schedules.reduce(
    (count, schedule) =>
      count + (isPastOrTodayAssignedShift(schedule, today) && !attendanceByScheduleId.get(schedule.id)?.checkInTime ? 1 : 0),
    0
  );
  const byPeriod = useMemo(() => {
    const groups = new Map<string, AssignedShift[]>();
    for (const schedule of filteredSchedules) {
      const scheduleDate = toDateInputValue(schedule.workDate);
      const key = scheduleDate < today ? "Đã qua" : scheduleDate === today ? "Hôm nay" : "Sắp tới";
      const current = groups.get(key) ?? [];
      current.push(schedule);
      groups.set(key, current);
    }
    return groups;
  }, [filteredSchedules, today]);

  return (
    <StaffShell active="schedule">
      <main className="px-4 py-6">
        <section className="mb-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h1 className="text-4xl font-semibold tracking-tight">Lịch làm việc của bạn</h1>
            <span className="text-sm font-semibold text-[#444748]">{filteredSchedules.length}/{schedules.length} ca</span>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-3 md:grid-cols-5">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#444748]" />
              <input className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setSearch(event.target.value)} placeholder="Tìm ca..." value={search} />
            </div>
            <input className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none focus:ring-1 focus:ring-black" onChange={(event) => { setSelectedMonth(event.target.value); setSelectedDate(""); }} type="month" value={selectedMonth} />
            <input className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none focus:ring-1 focus:ring-black" max={monthEnd} min={monthStart} onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} />
            <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} value={statusFilter}>
              <option value="all">Tất cả trạng thái</option>
              <option value="scheduled">Đã xếp</option>
              <option value="swapped">Đã đổi</option>
              <option value="leave_requested">Đã xin nghỉ</option>
              <option value="completed">Hoàn thành</option>
              <option value="absent">Vắng mặt</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => setBranchFilter(event.target.value)} value={branchFilter}>
              <option value="">Tất cả chi nhánh</option>
              {branchOptions.map(([branchId, branchName]) => <option key={branchId} value={branchId}>{branchName}</option>)}
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto py-2 [scrollbar-width:none]">
            <button
              className={!selectedDate ? "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-black text-white" : "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-[#e5e7eb]"}
              onClick={() => setSelectedDate("")}
              type="button"
            >
              <span className="text-xs text-current/70">Tất cả</span>
              <span className="text-lg font-semibold">{schedulesMatchingFilters.length}</span>
              <span className="text-[10px] opacity-70">ca</span>
            </button>
            {dateOptions.map(([date, schedule]) => (
              <button
                className={selectedDate === date ? "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-black text-white" : "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-[#e5e7eb]"}
                key={date}
                onClick={() => setSelectedDate(date)}
                type="button"
              >
                <span className="text-xs text-current/70">{formatDateLabel(date).split(" ")[0]}</span>
                <span className="text-lg font-semibold">{formatDateLabel(date).split(" ").slice(1, 2).join("")}</span>
                <span className="text-[10px] opacity-70">{schedule.shiftStartTime}</span>
              </button>
            ))}
          </div>
        </section>
        {schedulesQuery.isLoading ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Đang tải lịch làm việc...</p> : null}
        {schedulesQuery.isError ? <p className="rounded-xl bg-[#ffdad6] p-4 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(schedulesQuery.error, "Không thể tải lịch làm việc.")}</p> : null}
        {!schedulesQuery.isLoading && !schedulesQuery.isError && filteredSchedules.length === 0 ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Không có ca nào khớp bộ lọc.</p> : null}
        {Array.from(byPeriod.entries()).map(([title, items]) => (
          <ShiftSection
            key={title}
            title={`${title} (${items.length})`}
            items={items.map((schedule) => ({
              attendanceLabel: getAssignedShiftAttendanceLabel(schedule, attendanceByScheduleId.get(schedule.id), today),
              attendanceTone: getAssignedShiftAttendanceTone(schedule, attendanceByScheduleId.get(schedule.id), today),
              day: formatDateLabel(schedule.workDate),
              role: "Ca làm việc",
              time: `${schedule.shiftStartTime} - ${schedule.shiftEndTime}`,
              location: getAssignedShiftBranchName(schedule),
              status: toAssignedShiftStatusLabel(schedule.status),
              cta: toDateInputValue(schedule.workDate) === today,
              workedHours: getWorkedHours(attendanceByScheduleId.get(schedule.id)),
            }))}
          />
        ))}
        <section className="mt-8 grid grid-cols-2 gap-4">
          <StatBlock label="Tổng giờ tháng" meta="Dựa trên check-in/out" value={totalHours.toFixed(1)} />
          <StatBlock label="Tổng ca tháng" meta="Đã xếp lịch" value={String(schedules.length)} />
          <StatBlock label="Đã check-in" meta="Có bản ghi chấm công" value={String(checkedInCount)} />
          <StatBlock label="Chưa check-in" meta="Ca đã qua hoặc hôm nay" value={String(missingCheckInCount)} />
        </section>
      </main>
    </StaffShell>
  );
};

export const StaffShiftDetailPage = () => {
  const user = useAuthStore((state) => state.user);
  const today = toDateInputValue(new Date());
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { staffShiftDetail: true, today }],
    queryFn: () => scheduleApi.my({ from: today, to: today, published: true }),
    enabled: Boolean(user?.id),
  });
  const schedules = schedulesQuery.data?.data ?? [];
  const selectedSchedule = schedules[0];
  const employeesQuery = useQuery({
    queryKey: ["employees", { staffShiftDetail: true, branchId: selectedSchedule?.branchId }],
    queryFn: () => employeeApi.list({ limit: 100, status: "active", ...(selectedSchedule?.branchId ? { branchId: selectedSchedule.branchId } : {}) }),
    enabled: Boolean(selectedSchedule?.branchId),
  });
  const weeklyQuery = useQuery({
    queryKey: ["schedules", "weekly", { staffShiftDetail: true, branchId: selectedSchedule?.branchId, today }],
    queryFn: () => scheduleApi.weekly({ weekStart: toWeekStart(today), branchId: selectedSchedule?.branchId, published: true }),
    enabled: Boolean(selectedSchedule?.branchId),
  });
  const employeeById = useMemo(
    () => new Map((employeesQuery.data?.data ?? []).map((employee) => [employee.id, employee] as const)),
    [employeesQuery.data?.data]
  );
  const branchName = selectedSchedule ? getAssignedShiftBranchName(selectedSchedule) : "--";
  const team = (weeklyQuery.data?.data ?? []).filter((schedule) => schedule.workDate === selectedSchedule?.workDate);

  return (
    <StaffShell active="schedule" back title="Chi tiết ca" noBottomPadding>
      <main className="space-y-6 px-4 py-6 pb-32">
        <section className="space-y-4 rounded-xl bg-[#f5f5f5] p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">{selectedSchedule ? "Sắp tới" : "Chưa có ca"}</span>
              <h1 className="pt-2 text-4xl font-semibold tracking-tight">{selectedSchedule ? `${selectedSchedule.shiftStartTime} - ${selectedSchedule.shiftEndTime}` : "--"}</h1>
              <p className="text-lg text-[#444748]">{selectedSchedule ? formatDateLabel(selectedSchedule.workDate) : "Chưa có lịch hôm nay"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-wider text-[#444748]">Chi nhánh</p>
              <p className="text-2xl font-semibold">{branchName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoTile icon={<LogIn />} label="Bắt đầu" value={selectedSchedule?.shiftStartTime ?? "--"} />
            <InfoTile icon={<LogOut />} label="Kết thúc" value={selectedSchedule?.shiftEndTime ?? "--"} />
          </div>
        </section>
        <section>
          <SectionLabel>Ca cùng ngày</SectionLabel>
          <div className="overflow-hidden rounded-xl border border-[#e5e7eb]">
            {team.length === 0 ? (
              <div className="p-4 text-sm font-semibold text-[#444748]">Chưa có dữ liệu đồng đội cho ca này.</div>
            ) : (
              team.map((schedule) => (
                <TeamRow
                  key={schedule.id}
                  person={`${employeeById.get(schedule.employeeId)?.fullName ?? schedule.employeeId}|${schedule.shiftStartTime} - ${schedule.shiftEndTime}`}
                />
              ))
            )}
          </div>
        </section>
        <section>
          <SectionLabel>Ghi chú ca</SectionLabel>
          <div className="mt-3 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-5">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              Thông tin ca
            </p>
            <ul className="space-y-2 text-[#444748]">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                Dữ liệu đang lấy từ lịch được xuất bản của bạn.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                Nếu backend bổ sung ghi chú chi tiết cho ca, màn này sẽ hiển thị luôn.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[#e5e7eb] bg-white/90 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-4">
          <Link className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-black text-sm font-semibold text-white" to="/staff/shift-swaps">
            <Repeat className="h-4 w-4" />
            Yêu cầu đổi ca
          </Link>
          <button className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb]">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </StaffShell>
  );
};

export const StaffQrCheckInPage = () => {
  const [flash, setFlash] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [mode, setMode] = useState<"check-in" | "check-out">("check-in");
  const [entryMode, setEntryMode] = useState<"scan" | "manual">("scan");
  const [result, setResult] = useState<AttendanceRecord | null>(null);
  const today = toDateInputValue(new Date());
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { staffCheckIn: true, today }],
    queryFn: () => scheduleApi.my({ from: today, to: today, published: true }),
  });
  const historyQuery = useQuery({
    queryKey: ["attendances", "my", { staffCheckIn: true, today }],
    queryFn: () => attendanceApi.history({ from: today, to: today, limit: 50 }),
  });
  const schedules = (schedulesQuery.data?.data ?? []).filter(isAttendanceEligibleSchedule);
  const attendances = historyQuery.data?.data ?? [];
  const attendanceByScheduleId = useMemo(() => new Map(attendances.map((attendance) => [attendance.scheduleId, attendance])), [attendances]);
  const selectedSchedule = schedules.find((schedule) => schedule.id === scheduleId) ?? chooseBestSchedule(schedules, attendanceByScheduleId);
  const submitMutation = useMutation({
    mutationFn: async (token: string) => {
      if (!selectedSchedule) {
        throw new Error("No scheduled shift is available for attendance today.");
      }
      await dailyQrApi.verify({ qrToken: token, branchId: selectedSchedule.branchId });
      return mode === "check-in"
        ? attendanceApi.checkIn({ qrToken: token, scheduleId: selectedSchedule.id })
        : attendanceApi.checkOut({ qrToken: token, scheduleId: selectedSchedule.id });
    },
    onSuccess: (data) => setResult(data),
  });
  const submitToken = useCallback(
    (token: string) => {
      if (!token || submitMutation.isPending) return;
      if (result?.scheduleId === selectedSchedule?.id) {
        const isResultForCurrentAction = mode === "check-in" ? Boolean(result.checkInTime) : Boolean(result.checkOutTime);
        if (isResultForCurrentAction) return;
      }
      submitMutation.mutate(token);
    },
    [mode, result, selectedSchedule?.id, submitMutation]
  );
  const handleScan = useCallback(
    (value: string) => {
      const token = normalizeQrToken(value);
      setQrToken(token);
      submitToken(token);
    },
    [submitToken]
  );

  useEffect(() => {
    if (!selectedSchedule) return;

    setScheduleId(selectedSchedule.id);
    const attendance = attendanceByScheduleId.get(selectedSchedule.id);
    setMode(attendance?.checkInTime && !attendance.checkOutTime ? "check-out" : "check-in");
  }, [attendanceByScheduleId, selectedSchedule]);

  const selectedAttendance = selectedSchedule ? attendanceByScheduleId.get(selectedSchedule.id) : undefined;
  const completedAttendance = result?.scheduleId === selectedSchedule?.id ? result : selectedAttendance;
  const isCurrentActionCompleted = mode === "check-in" ? Boolean(completedAttendance?.checkInTime) : Boolean(completedAttendance?.checkOutTime);
  const attendanceNotice = submitMutation.isError
    ? {
        className: "rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]",
        message: getApiErrorMessage(submitMutation.error, "Không thể gửi chấm công."),
      }
    : result
      ? {
          className: "rounded-lg bg-[#10b981]/10 px-3 py-2 text-sm font-semibold text-[#10b981]",
          message: `${result.checkOutTime ? "Check-out" : "Check-in"} đã lưu.`,
        }
      : null;

  return (
    <div className="min-h-screen bg-white pb-24">
      <StaffTop title="SmartShift" />
      <QrScanner active={entryMode === "scan"} className="mt-16 h-[42vh] min-h-[280px] max-h-[420px] rounded-b-2xl" onScan={handleScan}>
        <div className="smartstaff-scanner-overlay absolute inset-0 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
          <div className="relative aspect-square w-[58%] max-w-[230px] overflow-hidden rounded-xl border-2 border-white/60"><Corner a="left-0 top-0 border-l-4 border-t-4 rounded-tl-lg" /><Corner a="right-0 top-0 border-r-4 border-t-4 rounded-tr-lg" /><Corner a="bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg" /><Corner a="bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg" /><div className="smartstaff-scan-line absolute left-0 h-1 w-full bg-[#0058be] shadow-[0_0_15px_rgba(0,88,190,0.8)]" /></div>
          <div className="mt-5 px-6 text-center text-white"><h1 className="text-xl font-bold drop-shadow">{entryMode === "scan" ? "Quét mã QR" : "Nhập mã QR"}</h1><p className="mt-1 text-sm text-white/80">{mode === "check-in" ? "Vào ca" : "Tan ca"}</p></div>
        </div>
      </QrScanner>
      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#444748]">Ca đã chọn</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{selectedSchedule ? `${selectedSchedule.shiftStartTime} - ${selectedSchedule.shiftEndTime}` : "Hôm nay chưa có ca"}</h1>
              <p className="text-sm text-[#444748]">{formatDateLabel(today)}</p>
            </div>
            <span className={mode === "check-in" ? "rounded-full bg-[#0058be]/10 px-3 py-1 text-xs font-bold uppercase text-[#0058be]" : "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold uppercase text-[#10b981]"}>{mode === "check-in" ? "Vào ca" : "Tan ca"}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[#e5e7eb] pt-3">
            <div><p className="text-xs text-[#444748]">Đã check-in</p><p className="font-semibold">{formatTime(selectedAttendance?.checkInTime)}</p></div>
            <div><p className="text-xs text-[#444748]">Đã check-out</p><p className="font-semibold">{formatTime(selectedAttendance?.checkOutTime)}</p></div>
          </div>
        </section>
        <section className="space-y-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          {attendanceNotice ? <p className={attendanceNotice.className}>{attendanceNotice.message}</p> : null}
          <div className="grid grid-cols-2 gap-2">
            <button className={mode === "check-in" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setMode("check-in")} type="button">Vào ca</button>
            <button className={mode === "check-out" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setMode("check-out")} type="button">Tan ca</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className={entryMode === "scan" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setEntryMode("scan")} type="button">Quét QR</button>
            <button className={entryMode === "manual" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setEntryMode("manual")} type="button">Nhập mã</button>
          </div>
          <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none" onChange={(event) => setScheduleId(event.target.value)} value={selectedSchedule?.id ?? ""}>
            {schedules.length === 0 ? <option value="">Hôm nay chưa có ca</option> : null}
            {schedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{schedule.shiftStartTime} - {schedule.shiftEndTime}</option>)}
          </select>
          {entryMode === "manual" ? (
            <input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setQrToken(event.target.value)} placeholder="Nhập mã QR thủ công" value={qrToken} />
          ) : null}
          <button className="h-11 w-full rounded-lg bg-black text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!qrToken || !selectedSchedule || submitMutation.isPending || isCurrentActionCompleted} onClick={() => submitToken(normalizeQrToken(qrToken))} type="button">
            {submitMutation.isPending ? "Đang gửi..." : "Gửi chấm công"}
          </button>
        </section>
      </main>
      <StaffBottom active="checkin" />
    </div>
  );
};

export const StaffAttendanceHistoryPage = () => {
  const [status, setStatus] = useState<AttendanceStatus | "all">("all");
  const today = new Date();
  const from = toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1));
  const to = toDateInputValue(today);
  const historyQuery = useQuery({
    queryKey: ["attendances", "staffHistory", { from, to, status }],
    queryFn: () => attendanceApi.history({ from, to, limit: 50, ...(status !== "all" ? { status } : {}) }),
  });
  const records = historyQuery.data?.data ?? [];
  const totalHours = records.reduce((sum, record) => sum + getWorkedHours(record), 0);
  const punctuality = records.length > 0 ? Math.round((records.filter((record) => record.attendanceStatus === "on_time").length / records.length) * 100) : 0;

  return (
    <StaffShell active="checkin">
      <main className="px-4 py-6">
        <div className="mb-6"><h1 className="text-2xl font-semibold tracking-tight">Lịch sử chấm công</h1><p className="text-[#444748]">Dữ liệu chấm công trong tháng hiện tại.</p></div>
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"><div className="relative flex h-48 flex-col justify-between overflow-hidden rounded-xl bg-black p-6 text-white md:col-span-2"><div><p className="text-sm font-bold uppercase tracking-widest text-white/70">Tổng kết tháng</p><p className="mt-2 text-4xl font-semibold">{totalHours.toFixed(1)} <span className="text-2xl font-normal">giờ</span></p><p className="text-white/70">{records.length} bản ghi chấm công</p></div><p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-[#10b981]" />{punctuality}% đúng giờ</p></div><div className="flex h-48 flex-col justify-between rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div><p className="text-sm font-bold uppercase tracking-widest text-[#444748]">Đi muộn tháng này</p><p className="mt-2 text-2xl font-bold">{records.filter((record) => record.attendanceStatus === "late").length} lần</p></div><button className="rounded-lg bg-black py-3 text-sm font-semibold text-white" onClick={() => setStatus("late")} type="button">Xem đi muộn</button></div></section>
        <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">{[["all", "Tất cả"], ["late", "Đi muộn"], ["overtime", "Tăng ca"], ["absent", "Vắng mặt"]].map(([value, label]) => <button className={status === value ? "shrink-0 rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-[#e5e7eb] bg-[#f1edec] px-4 py-1.5 text-sm font-semibold text-[#444748]"} key={value} onClick={() => setStatus(value as AttendanceStatus | "all")} type="button">{label}</button>)}</div>
        <section className="space-y-4">
          {historyQuery.isLoading ? <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Đang tải lịch sử chấm công...</div> : null}
          {historyQuery.isError ? <div className="rounded-xl bg-[#ffdad6] p-4 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(historyQuery.error, "Không thể tải lịch sử chấm công.")}</div> : null}
          {!historyQuery.isLoading && !historyQuery.isError && records.length === 0 ? <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Chưa có bản ghi chấm công.</div> : null}
          {records.map((record) => <AttendanceRecordRow record={record} key={record.id} />)}
        </section>
      </main>
    </StaffShell>
  );
};

export const StaffShiftSwapsPage = () => {
  const [tab, setTab] = useState<"mine" | "available">("mine");
  const [openCreate, setOpenCreate] = useState(false);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const swapsQuery = useQuery({
    queryKey: ["shift-swaps", "staff", tab],
    queryFn: () => shiftSwapApi.list(tab === "available" ? { finalStatus: "pending_receiver", toEmployeeId: user?.id, limit: 50 } : { limit: 50 }),
    enabled: Boolean(user?.id),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { staffShiftSwaps: true, branchId: user?.branchId }],
    queryFn: () => employeeApi.list({ limit: 100, role: "staff", status: "active", ...(user?.branchId ? { branchId: user.branchId } : {}) }),
    enabled: Boolean(user?.branchId),
  });
  const employeeById = useMemo(() => new Map((employeesQuery.data?.data ?? []).map((employee) => [employee.id, employee])), [employeesQuery.data?.data]);
  const records = (swapsQuery.data?.data ?? []).filter((request) => tab === "mine" ? request.fromEmployeeId === user?.id : request.toEmployeeId === user?.id && request.finalStatus === "pending_receiver");
  const actionMutation = useMutation({
    mutationFn: ({ action, id }: { action: "accept" | "reject" | "cancel"; id: string }) => {
      if (action === "accept") return shiftSwapApi.accept(id);
      if (action === "reject") return shiftSwapApi.rejectReceiver(id);
      return shiftSwapApi.cancel(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shift-swaps"] });
    },
  });

  return (
    <StaffShell active="requests">
      <main className="px-4 py-6">
        <PageIntro title="Đổi ca" desc="Quản lý yêu cầu của bạn và phản hồi các ca đang chờ." />
        <Tabs tabs={[["mine", "Yêu cầu của tôi"], ["available", "Chờ tôi phản hồi"]]} active={tab} setActive={(v) => setTab(v as typeof tab)} />
        {actionMutation.isError ? <p className="mb-4 rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(actionMutation.error, "Không thể cập nhật yêu cầu đổi ca.")}</p> : null}
        <div className="space-y-4">
          {swapsQuery.isLoading ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Đang tải yêu cầu đổi ca...</p> : null}
          {swapsQuery.isError ? <p className="rounded-xl bg-[#ffdad6] p-4 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(swapsQuery.error, "Không thể tải yêu cầu đổi ca.")}</p> : null}
          {!swapsQuery.isLoading && !swapsQuery.isError && records.length === 0 ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Chưa có yêu cầu đổi ca.</p> : null}
          {records.map((request) => (
            tab === "mine"
              ? <SwapMini key={request.id} onCancel={() => actionMutation.mutate({ action: "cancel", id: request.id })} person={employeeById.get(request.toEmployeeId)?.fullName ?? request.toEmployeeId} request={request} />
              : <AvailableSwap key={request.id} by={employeeById.get(request.fromEmployeeId)?.fullName ?? request.fromEmployeeId} onAccept={() => actionMutation.mutate({ action: "accept", id: request.id })} onReject={() => actionMutation.mutate({ action: "reject", id: request.id })} request={request} />
          ))}
        </div>
        <button className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg" onClick={() => setOpenCreate(true)} type="button"><Plus className="h-8 w-8" /></button>
      </main>
      {openCreate ? <StaffShiftSwapModal onClose={() => setOpenCreate(false)} /> : null}
    </StaffShell>
  );
};

export const StaffLeaveRequestsPage = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const today = toDateInputValue(new Date());
  const to = toDateInputValue(addDays(new Date(), 90));

  const leaveRequestsQuery = useQuery({
    queryKey: ["leave-requests", "my"],
    queryFn: () => leaveRequestApi.list({ limit: 100 }),
  });
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { leaveRequests: true, today, to }],
    queryFn: () => scheduleApi.my({ from: today, to, published: true }),
  });

  const leaveRequests = leaveRequestsQuery.data?.data ?? [];
  const scheduleLabelById = useMemo(
    () => new Map((schedulesQuery.data?.data ?? []).map((schedule) => [schedule.id, formatAssignedShift(schedule)])),
    [schedulesQuery.data?.data]
  );
  const pendingCount = leaveRequests.filter((request) => request.status === "pending").length;
  const approvedCount = leaveRequests.filter((request) => request.status === "approved").length;
  const rejectedCount = leaveRequests.filter((request) => request.status === "rejected").length;

  return (
    <StaffShell active="requests">
      <main className="px-4 py-6">
        <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Nghỉ phép</h1>
            <p className="text-[#444748]">Quản lý các yêu cầu nghỉ phép của bạn.</p>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white" onClick={() => setOpen(true)} type="button">
            <Plus className="h-4 w-4" />
            Tạo yêu cầu nghỉ
          </button>
        </section>
        <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <LeaveBalance icon={<Plane />} label="Đang chờ" meta="Yêu cầu" value={String(pendingCount)} width="60%" />
          <LeaveBalance icon={<HeartPulse />} label="Đã duyệt" meta="Yêu cầu" value={String(approvedCount)} width="40%" />
          <div className="relative overflow-hidden rounded-xl bg-black p-6 text-white">
            <p className="text-sm font-semibold text-white/70">Tổng yêu cầu</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">Bạn đã gửi {leaveRequests.length} yêu cầu nghỉ</h2>
            <p className="mt-4 flex items-center gap-2 text-xs"><CalendarDays className="h-4 w-4" />{rejectedCount} yêu cầu đã từ chối</p>
          </div>
        </section>
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
            <h2 className="text-2xl font-semibold">Lịch sử yêu cầu</h2>
            <div className="flex gap-2"><Search className="h-5 w-5 text-[#444748]" /></div>
          </div>
          {leaveRequestsQuery.isLoading || schedulesQuery.isLoading ? (
            <div className="p-6 text-sm font-semibold text-[#444748]">Đang tải yêu cầu nghỉ phép...</div>
          ) : leaveRequestsQuery.isError ? (
            <div className="p-6 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(leaveRequestsQuery.error, "Không thể tải yêu cầu nghỉ phép.")}</div>
          ) : leaveRequests.length === 0 ? (
            <div className="p-6 text-sm font-semibold text-[#444748]">Bạn chưa có yêu cầu nghỉ phép nào.</div>
          ) : (
            <>
              {leaveRequests.map((request) => (
                <LeaveHistory
                  key={request.id}
                  onCancel={() => leaveRequestApi.cancel(request.id).then(() => void queryClient.invalidateQueries({ queryKey: ["leave-requests"] }))}
                  request={request}
                  scheduleLabel={formatLeaveRequestSchedule(request, scheduleLabelById)}
                />
              ))}
            </>
          )}
          <div className="bg-[#f7f3f2] px-6 py-4 text-center">
            <button className="text-sm font-semibold text-[#444748]" type="button">Xem tất cả yêu cầu</button>
          </div>
        </section>
      </main>
      {open ? <LeaveModal onClose={() => setOpen(false)} onSaved={() => void queryClient.invalidateQueries({ queryKey: ["leave-requests"] })} schedules={schedulesQuery.data?.data ?? []} /> : null}
    </StaffShell>
  );
};

export const StaffOvertimePage = () => {
  const queryClient = useQueryClient();
  const today = toDateInputValue(new Date());
  const monthStart = toDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [form, setForm] = useState({
    workDate: today,
    startTime: "18:00",
    endTime: "20:00",
    reason: "",
  });
  const [clientError, setClientError] = useState("");
  const overtimeQuery = useQuery({
    queryKey: ["compensations", "overtime", "staff", { monthStart }],
    queryFn: () => compensationApi.overtime.list({ from: monthStart, limit: 100 }),
  });
  const overtimeRequests = overtimeQuery.data?.data ?? [];
  const pendingCount = overtimeRequests.filter((request) => request.status === "pending").length;
  const approvedRequests = overtimeRequests.filter((request) => request.status === "approved");
  const approvedHours = approvedRequests.reduce((sum, request) => sum + request.hours, 0);
  const approvedAmount = approvedRequests.reduce((sum, request) => sum + request.amount, 0);
  const validationMessage = getStaffOvertimeValidationMessage(form, overtimeRequests);
  const createMutation = useMutation({
    mutationFn: () =>
      compensationApi.overtime.create({
        workDate: form.workDate,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason.trim(),
      }),
    onSuccess: () => {
      setForm((current) => ({ ...current, reason: "" }));
      setClientError("");
      void queryClient.invalidateQueries({ queryKey: ["compensations", "overtime"] });
      void queryClient.invalidateQueries({ queryKey: ["compensations", "summary"] });
    },
  });

  const handleSubmit = () => {
    if (validationMessage) {
      setClientError(validationMessage);
      return;
    }

    setClientError("");
    createMutation.mutate();
  };

  return (
    <StaffShell active="requests" title="Tăng ca">
      <main className="space-y-6 px-4 py-6">
        <section className="rounded-2xl bg-black p-6 text-white">
          <p className="text-sm font-semibold text-white/70">Tổng tăng ca đã duyệt</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{approvedHours.toFixed(1)}h</h1>
          <p className="mt-2 text-sm text-white/70">Tạm tính {formatStaffCurrency(approvedAmount)} trong tháng này</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <StaffOvertimeStat icon={<CalendarClock />} label="Chờ duyệt" value={String(pendingCount)} />
          <StaffOvertimeStat icon={<Banknote />} label="Đã duyệt" value={String(approvedRequests.length)} />
        </section>

        <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Gửi đơn tăng ca</h2>
              <p className="text-sm text-[#444748]">Quản lý sẽ duyệt và xác nhận đơn giá.</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1edec] text-black">
              <Banknote className="h-5 w-5" />
            </span>
          </div>

          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Ngày tăng ca</span>
              <input className={staffFieldClassName} onChange={(event) => setForm((current) => ({ ...current, workDate: event.target.value }))} type="date" value={form.workDate} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm font-semibold">Bắt đầu</span>
                <input className={staffFieldClassName} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} type="time" value={form.startTime} />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold">Kết thúc</span>
                <input className={staffFieldClassName} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} type="time" value={form.endTime} />
              </label>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] px-3 py-2 text-sm font-semibold text-[#444748]">
              Thời lượng: {getStaffOvertimeHours(form.workDate, form.startTime, form.endTime).toFixed(1)} giờ
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Lý do</span>
              <textarea
                className="min-h-24 w-full resize-none rounded-lg border border-[#e5e7eb] p-3 text-sm outline-none focus:ring-1 focus:ring-black"
                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Ví dụ: hỗ trợ đóng ca, kiểm kê, xử lý khách đông..."
                value={form.reason}
              />
            </label>
            {clientError ? <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{clientError}</p> : null}
            {createMutation.isError ? <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(createMutation.error, "Không thể gửi đơn tăng ca.")}</p> : null}
            {createMutation.isSuccess ? <p className="rounded-lg bg-[#10b981]/10 px-3 py-2 text-sm font-semibold text-[#047857]">Đã gửi đơn tăng ca.</p> : null}
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white disabled:opacity-50"
              disabled={createMutation.isPending}
              onClick={handleSubmit}
              type="button"
            >
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? "Đang gửi..." : "Gửi đơn tăng ca"}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f3f2] px-4 py-3">
            <h2 className="text-xl font-semibold">Lịch sử tăng ca</h2>
            <span className="text-xs font-semibold text-[#444748]">{overtimeRequests.length} đơn</span>
          </div>
          {overtimeQuery.isLoading ? <p className="p-4 text-sm font-semibold text-[#444748]">Đang tải đơn tăng ca...</p> : null}
          {overtimeQuery.isError ? <p className="p-4 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(overtimeQuery.error, "Không thể tải đơn tăng ca.")}</p> : null}
          {!overtimeQuery.isLoading && !overtimeQuery.isError && overtimeRequests.length === 0 ? <p className="p-4 text-sm font-semibold text-[#444748]">Bạn chưa có đơn tăng ca nào.</p> : null}
          {overtimeRequests.map((request) => <StaffOvertimeHistoryItem key={request.id} request={request} />)}
        </section>
      </main>
    </StaffShell>
  );
};

export const StaffNotificationsPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "compensation" | "unread">("all");
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "staff", filter],
    queryFn: () => notificationApi.list({ limit: 50, ...(filter === "unread" ? { isRead: false } : {}) }),
    refetchInterval: 15000,
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const allNotifications = notificationsQuery.data?.data ?? [];
  const notifications = filter === "compensation"
    ? allNotifications.filter((notification) => notification.type === "compensation_bonus" || notification.type === "compensation_penalty")
    : allNotifications;
  const unreadCount = notificationsQuery.data?.meta.unreadCount ?? 0;

  return (
    <StaffShell active="requests">
      <main className="px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {[["all", "Tất cả"], ["unread", "Chưa đọc"]].map(([value, label]) => (
              <button className={filter === value ? "shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-[#e5e7eb] bg-[#f5f5f5] px-4 py-2 text-sm font-semibold text-[#444748]"} key={value} onClick={() => setFilter(value as typeof filter)} type="button">{label}</button>
            ))}
          </div>
          <button className="shrink-0 text-xs font-semibold text-[#0058be] disabled:opacity-50" disabled={markAllReadMutation.isPending || notifications.length === 0} onClick={() => markAllReadMutation.mutate()} type="button">Đánh dấu đã đọc</button>
        </div>
        <section className="space-y-4">
          {notificationsQuery.isLoading ? <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Đang tải thông báo...</div> : null}
          {notificationsQuery.isError ? <div className="rounded-xl bg-[#ffdad6] p-4 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(notificationsQuery.error, "Không thể tải thông báo.")}</div> : null}
          {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#444748]">Bạn chưa có thông báo nào.</div> : null}
          {notifications.map((notification) => (
            <Notice
              detail={notification.message}
              icon={getNotificationIcon(notification.type)}
              key={notification.id}
              muted={notification.isRead}
              time={formatRelativeTime(notification.createdAt)}
              title={notification.title}
              tone={getNotificationTone(notification)}
              unread={!notification.isRead}
            />
          ))}
        </section>
      </main>
    </StaffShell>
  );
};

export const StaffProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const updateProfileMutation = useMutation({
    mutationFn: (payload: { fullName?: string; phone?: string; avatar?: string }) => authApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setEditing(false);
    },
  });
  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <StaffShell active="profile">
      <main className="px-4 py-6">
        <section className="mb-10 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative">
              <img alt="" className="h-32 w-32 rounded-xl border-4 border-white object-cover shadow-sm md:h-40 md:w-40" src={profileImage} />
              <span className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-[#10b981] p-1 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-semibold tracking-tight">{user?.fullName ?? "Nhân viên"}</h1>
              <p className="text-lg font-medium text-[#444748]">{user?.role === "staff" ? "Nhân viên" : user?.role ?? "Tài khoản"}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                <Pill icon={<MapPin />} text={user?.branchId ? `Chi nhánh: ${user.branchName ?? user.branchId}` : "Chưa có chi nhánh"} />
                <Pill icon={<Badge />} text={user?.email ? `Email: ${user.email}` : "Chưa có email"} />
                <Pill icon={<Mail />} text={user?.phone ? `SĐT: ${user.phone}` : "Chưa có SĐT"} />
              </div>
            </div>
            <button className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white" onClick={() => setEditing(true)} type="button">Chỉnh sửa hồ sơ</button>
          </div>
        </section>
        {updateProfileMutation.isError ? <p className="mb-4 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(updateProfileMutation.error, "Không thể cập nhật hồ sơ.")}</p> : null}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-semibold">Thông tin nhân sự</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ProfileInfo icon={<Badge />} label="Mã nhân viên" value={user?.employeeCode ?? "Chưa cập nhật"} />
            <ProfileInfo icon={<CalendarDays />} label="Ngày vào làm" value={user?.joinDate ? formatDateLabel(user.joinDate) : "Chưa cập nhật"} />
            <ProfileInfo icon={<UsersRound />} label="Loại nhân viên" value={user?.employeeType === "full_time" ? "Toàn thời gian" : user?.employeeType === "part_time" ? "Bán thời gian" : "Chưa cập nhật"} />
          </div>
        </section>
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Cài đặt tài khoản</h3>
          </div>
          <SettingsRow icon={<ShieldCheck />} title="Bảo mật và đăng nhập" desc={user?.lastLoginAt ? `Đăng nhập gần nhất: ${formatDate(user.lastLoginAt)}` : "Chưa có lịch sử đăng nhập gần nhất."} />
          <SettingsRow icon={<Bell />} title="Thông báo" desc="Thông báo lấy từ hệ thống lịch, nghỉ phép và đổi ca." />
          <SettingsRow icon={<LogOut />} title="Đăng xuất" desc="Đăng xuất an toàn khỏi thiết bị này." danger onClick={handleSignOut} />
        </section>
      </main>
      {editing && user ? (
        <EditProfileModal
          isPending={updateProfileMutation.isPending}
          onClose={() => setEditing(false)}
          onSubmit={(payload) => updateProfileMutation.mutate(payload)}
          user={user}
        />
      ) : null}
    </StaffShell>
  );
};

export const StaffSettingsPage = () => {
  const [dark, setDark] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <StaffShell active="profile" back title="Cài đặt">
      <main className="mx-auto max-w-lg px-4 py-6">
        <section className="mb-6 flex items-center gap-4 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
          <img alt="" className="h-16 w-16 rounded-full object-cover" src={profileImage} />
          <div>
            <h2 className="font-semibold">{user?.fullName ?? "Nhân viên"}</h2>
            <p className="text-xs text-[#444748]">{user?.email ?? "Chưa có email"}</p>
          </div>
          <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <Edit3 className="h-4 w-4" />
          </button>
        </section>
        <div className="space-y-6">
          <SettingsGroup title="Giao diện">
            <ToggleRow checked={dark} icon={<Moon />} label="Chế độ tối" onChange={() => setDark((v) => !v)} />
            <SettingsRow icon={<Settings />} title="Ngôn ngữ" desc="Tiếng Việt" compact />
          </SettingsGroup>
          <SettingsGroup title="Thông báo">
            <SettingsRow icon={<Bell />} title="Thông báo hệ thống" desc="Xem thông báo lịch, nghỉ phép và đổi ca trong Trung tâm thông báo." compact />
            <SettingsRow icon={<Mail />} title="Email" desc={user?.email ?? "Chưa có email"} compact />
          </SettingsGroup>
          <SettingsGroup title="Bảo mật và quyền riêng tư">
            <SettingsRow icon={<Lock />} title="Đổi mật khẩu" compact />
            <SettingsRow icon={<ShieldCheck />} title="Xác minh email" desc={user?.isEmailVerified ? "Đã xác minh" : "Chưa xác minh"} compact success={user?.isEmailVerified} />
          </SettingsGroup>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm font-semibold text-[#ef4444]" onClick={handleSignOut} type="button">
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
          <button className="w-full py-2 text-sm font-semibold text-[#444748] hover:underline">Xóa tài khoản</button>
        </div>
        <p className="mt-12 text-center text-xs text-[#444748]">SmartShift v2.4.1 (Build 8902)</p>
      </main>
    </StaffShell>
  );
};

const StaffShell = ({ active, back, children, noBottomPadding, title = "SmartShift" }: { active: StaffTab; back?: boolean; children: ReactNode; noBottomPadding?: boolean; title?: string }) => (
  <div className={noBottomPadding ? "min-h-screen bg-white text-[#1c1b1b]" : "min-h-screen bg-white pb-24 text-[#1c1b1b]"}>
    <StaffTop back={back} title={title} />
    <div className="mx-auto mt-16 max-w-5xl">{children}</div>
    {noBottomPadding ? null : <StaffBottom active={active} />}
  </div>
);

const StaffTop = ({ back, title }: { back?: boolean; title: string }) => (
  <StaffTopContent back={back} title={title} />
);

const StaffTopContent = ({ back, title }: { back?: boolean; title: string }) => {
  const unreadQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApi.unreadCount(),
    refetchInterval: 15000,
  });
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;
  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#e5e7eb] bg-[#fdf8f8] px-4">
      <div className="flex items-center gap-3">{back ? <Link className="rounded-full p-2 hover:bg-[#ebe7e6]" to="/staff"><ArrowLeft className="h-5 w-5" /></Link> : <button className="rounded-full p-2 hover:bg-[#ebe7e6]"><Menu className="h-5 w-5" /></button>}<h1 className="text-2xl font-black">{title}</h1></div>
      <div className="flex items-center gap-2"><Link aria-label="Thông báo" className="relative rounded-full p-2 hover:bg-[#ebe7e6]" to="/staff/notifications"><Bell className="h-5 w-5" />{unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#fdf8f8]">{unreadLabel}</span> : null}</Link>{back ? null : <Link className="h-8 w-8 overflow-hidden rounded-full border border-[#e5e7eb]" to="/staff/profile"><img alt="" className="h-full w-full object-cover" src={profileImage} /></Link>}</div>
    </header>
  );
};

type StaffTab = "home" | "schedule" | "checkin" | "requests" | "profile";

const StaffBottom = ({ active }: { active: StaffTab }) => (
  <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-[#e5e7eb] bg-[#fdf8f8] px-2 py-3">
    <BottomLink active={active === "home"} icon={<Home />} label="Trang chủ" to="/staff" />
    <BottomLink active={active === "schedule"} icon={<CalendarDays />} label="Lịch" to="/staff/schedule" />
    <BottomLink active={active === "checkin"} floating icon={<QrCode />} label="Chấm công" to="/staff/check-in" />
    <BottomLink active={active === "requests"} icon={<CalendarClock />} label="Yêu cầu" to="/staff/leave-requests" />
    <BottomLink active={active === "profile"} icon={<UserRound />} label="Hồ sơ" to="/staff/profile" />
  </nav>
);

const BottomLink = ({ active, floating, icon, label, to }: { active: boolean; floating?: boolean; icon: ReactNode; label: string; to: string }) => (
  <Link className={active ? "flex flex-col items-center justify-center rounded-xl bg-black px-3 py-1 text-white" : "flex flex-col items-center justify-center px-3 py-1 text-[#444748] hover:bg-[#f7f3f2]"} to={to}>
    <span className={floating ? "mb-1 flex h-10 w-10 -mt-6 items-center justify-center rounded-full bg-black text-white shadow-lg [&>svg]:h-5 [&>svg]:w-5" : "[&>svg]:h-5 [&>svg]:w-5"}>{icon}</span>
    <span className="mt-1 text-[10px] font-semibold">{label}</span>
  </Link>
);

const MiniStat = ({ icon, label, meta, value }: { icon: ReactNode; label: string; meta: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><div className="flex justify-between"><span className="text-[#0058be] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className="text-xs font-semibold text-[#444748]">{label}</span></div><p className="mt-4 text-2xl font-bold">{value}</p><p className="flex items-center gap-1 text-xs font-semibold text-[#10b981]"><TrendingUp className="h-3 w-3" />{meta}</p></div>;
const AvatarStack = ({ names }: { names: string[] }) => {
  const visible = names.slice(0, 2);
  const remaining = Math.max(0, names.length - visible.length);

  if (names.length === 0) {
    return <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold text-black">1</div>;
  }

  return <div className="flex -space-x-2">{visible.map((name) => <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#f1edec] text-xs font-bold text-black" key={name}>{getInitials(name)}</div>)}{remaining > 0 ? <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold text-black">+{remaining}</div> : null}</div>;
};
const QuickActions = () => <section><h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-[#444748]">Thao tác nhanh</h2><div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f5f5f5]"><ActionRow icon={<CalendarDays />} title="Xin nghỉ phép" desc="Nghỉ phép, việc riêng hoặc nghỉ ốm" to="/staff/leave-requests" /><ActionRow icon={<Banknote />} title="Tăng ca" desc="Gửi đơn tăng ca để quản lý duyệt" to="/staff/overtime" /><ActionRow icon={<Repeat />} title="Đổi ca" desc="Gửi yêu cầu đổi ca với đồng nghiệp" to="/staff/shift-swaps" /></div></section>;
const ActionRow = ({ desc, icon, title, to }: { desc: string; icon: ReactNode; title: string; to: string }) => <Link className="flex items-center justify-between border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#ebe7e6]" to={to}><div className="flex items-center gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0058be] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="font-semibold">{title}</p><p className="text-xs text-[#444748]">{desc}</p></div></div><ChevronRight className="h-5 w-5 text-[#444748]" /></Link>;
const staffFieldClassName = "h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-black";
const StaffOvertimeStat = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black [&>svg]:h-5 [&>svg]:w-5">{icon}</span><p className="text-xs font-semibold uppercase tracking-wide text-[#444748]">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p></div>;
const StaffOvertimeHistoryItem = ({ request }: { request: OvertimeRequest }) => {
  const status = toStaffOvertimeStatusLabel(request.status);
  const tone = request.status === "approved" ? "bg-[#10b981]/10 text-[#047857]" : request.status === "pending" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#ffdad6] text-[#93000a]";

  return (
    <div className="border-b border-[#e5e7eb] p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{formatDateLabel(toDateInputValue(request.workDate))}</p>
          <p className="text-sm text-[#444748]">{request.startTime} - {request.endTime} ({request.hours}h)</p>
          <p className="mt-2 line-clamp-2 text-sm text-[#444748]">{request.reason}</p>
          {request.managerNote ? <p className="mt-1 text-xs text-[#444748]">Ghi chú: {request.managerNote}</p> : null}
        </div>
        <div className="shrink-0 text-right">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>
          {request.status === "approved" ? <p className="mt-2 text-sm font-semibold">{formatStaffCurrency(request.amount)}</p> : null}
        </div>
      </div>
    </div>
  );
};
type StaffScheduleItem = {
  attendanceLabel: string;
  attendanceTone: "danger" | "muted" | "success" | "warning";
  cta?: boolean;
  day: string;
  location: string;
  role: string;
  status: string;
  time: string;
  workedHours: number;
};
const ShiftSection = ({ items, title }: { items: StaffScheduleItem[]; title: string }) => <section className="mb-8"><h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#858383]">{title}</h2><div className="space-y-4">{items.map((item) => <ShiftCard item={item} key={`${item.day}-${item.time}`} />)}</div></section>;
const ShiftCard = ({ item }: { item: StaffScheduleItem }) => (
  <div className="rounded-xl border border-transparent bg-[#f5f5f5] p-4 transition hover:border-[#e5e7eb]">
    <Link className="block" to="/staff/shift-detail">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={item.cta ? "mb-1 block text-sm font-semibold text-[#0058be]" : "mb-1 block text-sm font-semibold text-[#444748]"}>{item.day}</span>
          <h3 className="text-2xl font-semibold">{item.role}</h3>
          <span className="mt-2 inline-flex rounded-full bg-[#f1edec] px-2 py-0.5 text-xs font-semibold text-[#444748]">{item.status}</span>
          <span className={`ml-2 mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getAttendanceToneClassName(item.attendanceTone)}`}>{item.attendanceLabel}</span>
        </div>
        <div className="text-right">
          <p className="font-semibold">{item.time}</p>
          <p className="text-xs text-[#444748]">{getShiftDurationLabel(item.time)}</p>
          {item.workedHours > 0 ? <p className="text-xs font-semibold text-[#10b981]">{item.workedHours.toFixed(1)} giờ làm</p> : null}
        </div>
      </div>
    </Link>
    <div className="mt-4 flex items-center justify-between border-t border-[#e5e7eb] pt-4">
      <Link className="flex min-w-0 items-center gap-1 text-sm text-[#444748]" to="/staff/shift-detail">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.location}</span>
      </Link>
      {item.cta ? (
        <Link className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white" to="/staff/check-in">
          Chấm công
        </Link>
      ) : null}
    </div>
  </div>
);
const StatBlock = ({ label, meta, value }: { label: string; meta: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] p-4"><p className="text-xs uppercase tracking-wide text-[#444748]">{label}</p><p className="mt-1 text-4xl font-semibold">{value}</p><p className="text-xs text-[#10b981]">{meta}</p></div>;
const InfoTile = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1edec] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="text-xs text-[#444748]">{label}</p><p className="font-semibold">{value}</p></div></div>;
const SectionLabel = ({ children }: { children: ReactNode }) => <h3 className="text-sm font-bold uppercase tracking-widest text-[#444748]">{children}</h3>;
const TeamRow = ({ person }: { person: string }) => { const [name, role] = person.split("|"); return <div className="flex items-center gap-4 border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#f7f3f2]"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e5e2e1] font-bold">{name.split(" ").map((p) => p[0]).join("")}</div><div className="flex-1"><p className="font-semibold">{name}</p><p className="text-xs text-[#444748]">{role}</p></div><button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb]"><MessageCircle className="h-5 w-5" /></button></div>; };
const Corner = ({ a }: { a: string }) => <div className={`absolute h-8 w-8 border-white ${a}`} />;
const CameraButton = ({ active, icon, label, onClick }: { active?: boolean; icon: ReactNode; label: string; onClick?: () => void }) => <button className="flex flex-col items-center gap-2" onClick={onClick}><div className={active ? "flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white text-black" : "flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md"}>{icon}</div><span className="text-sm font-semibold text-white">{label}</span></button>;
const toDateInputValue = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const toMonthInputValue = (value: Date | string) => toDateInputValue(value).slice(0, 7);
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const formatDateLabel = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${toDateInputValue(value)}T00:00:00`));
const formatDate = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const formatTime = (value?: string) => value ? new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "--:--";
const formatStaffCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};
const getNotificationIcon = (type: Notification["type"]) => {
  if (type.includes("compensation")) return <Banknote />;
  if (type.includes("leave")) return <Plane />;
  if (type.includes("shift_swap")) return <Repeat />;
  if (type.includes("checkin") || type.includes("checkout") || type === "attendance_warning") return <CalendarClock />;
  if (type.includes("schedule") || type === "shift_changed") return <CalendarDays />;
  return <Bell />;
};
const getNotificationTone = (notification: Notification): "default" | "success" | "secondary" | "danger" => {
  if (notification.type === "compensation_bonus") return "success";
  if (notification.type === "compensation_penalty") return "danger";
  if (notification.type === "leave_approved" || notification.type === "shift_swap_accepted") return "success";
  if (notification.type === "leave_rejected" || notification.type === "shift_swap_rejected" || notification.type === "attendance_warning") return "danger";
  if (notification.type === "schedule_published" || notification.type === "shift_changed") return "secondary";
  return "default";
};
const formatAssignedShift = (schedule: AssignedShift) => `${formatDateLabel(toDateInputValue(schedule.workDate))} - ${schedule.shiftStartTime} - ${schedule.shiftEndTime}`;
const toAssignedShiftStatusLabel = (status: AssignedShift["status"]) => {
  if (status === "scheduled") return "Đã xếp";
  if (status === "completed") return "Hoàn thành";
  if (status === "absent") return "Vắng mặt";
  if (status === "cancelled") return "Đã hủy";
  if (status === "swapped") return "Đã đổi";
  return "Đã xin nghỉ";
};
const getShiftDurationLabel = (timeRange: string) => {
  const [startTime, endTime] = timeRange.split(" - ");
  if (!startTime || !endTime) return "--";
  const start = assignedShiftTimeToMinutes(startTime);
  const end = assignedShiftTimeToMinutes(endTime);
  const duration = (end <= start ? end + 24 * 60 : end) - start;
  return `${(duration / 60).toFixed(duration % 60 === 0 ? 0 : 1)} giờ`;
};
const getAssignedShiftBranchName = (schedule: Pick<AssignedShift, "branchId" | "branchName">) => schedule.branchName ?? schedule.branchId;
const isPastOrTodayAssignedShift = (schedule: Pick<AssignedShift, "workDate">, today: string) =>
  toDateInputValue(schedule.workDate) <= today;
const getAssignedShiftAttendanceLabel = (
  schedule: Pick<AssignedShift, "status" | "workDate">,
  attendance: AttendanceRecord | undefined,
  today: string
) => {
  if (attendance?.checkOutTime) return "Đã checkout";
  if (attendance?.checkInTime) return "Đã check-in";
  if (attendance?.attendanceStatus === "absent" || schedule.status === "absent") return "Vắng mặt";
  if (isPastOrTodayAssignedShift(schedule, today)) return "Chưa check-in";
  return "Chưa tới ca";
};
const getAssignedShiftAttendanceTone = (
  schedule: Pick<AssignedShift, "status" | "workDate">,
  attendance: AttendanceRecord | undefined,
  today: string
): StaffScheduleItem["attendanceTone"] => {
  if (attendance?.checkOutTime || attendance?.checkInTime) return "success";
  if (attendance?.attendanceStatus === "absent" || schedule.status === "absent") return "danger";
  if (isPastOrTodayAssignedShift(schedule, today)) return "warning";
  return "muted";
};
const getAttendanceToneClassName = (tone: StaffScheduleItem["attendanceTone"]) => {
  if (tone === "success") return "bg-[#10b981]/10 text-[#047857]";
  if (tone === "danger") return "bg-[#ffdad6] text-[#93000a]";
  if (tone === "warning") return "bg-orange-50 text-orange-700";
  return "bg-[#e5e7eb] text-[#444748]";
};
const formatLeaveRequestSchedule = (request: LeaveRequest, scheduleLabelById: Map<string, string>) => {
  if (request.schedule) {
    return `${formatDateLabel(toDateInputValue(request.schedule.workDate))} - ${request.schedule.shiftStartTime} - ${request.schedule.shiftEndTime}`;
  }

  return scheduleLabelById.get(request.scheduleId) ?? `Ca ${request.scheduleId}`;
};
const formatStaffSwapSchedule = (schedule: ShiftSwapRequest["fromSchedule"], fallbackId?: string) =>
  schedule ? `${formatDateLabel(toDateInputValue(schedule.workDate))} - ${schedule.shiftStartTime} - ${schedule.shiftEndTime}` : fallbackId ? `Ca ${fallbackId}` : "--";
const toWeekStart = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return toDateInputValue(start);
};
const assignedShiftTimeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const getStaffOvertimeInterval = (workDate: string, startTime: string, endTime: string) => {
  const dayStart = new Date(`${toDateInputValue(workDate)}T00:00:00`).getTime();
  const startMinutes = assignedShiftTimeToMinutes(startTime);
  const endMinutes = assignedShiftTimeToMinutes(endTime);
  const endOffset = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

  return {
    start: dayStart + startMinutes * 60 * 1000,
    end: dayStart + endOffset * 60 * 1000,
  };
};
const getStaffOvertimeHours = (workDate: string, startTime: string, endTime: string) => {
  if (!workDate || !startTime || !endTime) return 0;
  const interval = getStaffOvertimeInterval(workDate, startTime, endTime);
  return Math.max(0, Math.round(((interval.end - interval.start) / 36e5) * 10) / 10);
};
const staffOvertimeIntervalsOverlap = (
  first: { start: number; end: number },
  second: { start: number; end: number }
) => first.start < second.end && second.start < first.end;
const getStaffOvertimeValidationMessage = (
  form: { workDate: string; startTime: string; endTime: string; reason: string },
  requests: OvertimeRequest[]
) => {
  if (!form.workDate) return "Vui lòng chọn ngày tăng ca.";
  if (!form.startTime || !form.endTime) return "Vui lòng nhập giờ bắt đầu và kết thúc.";
  if (!form.reason.trim()) return "Vui lòng nhập lý do tăng ca.";
  if (form.reason.trim().length > 1000) return "Lý do tăng ca không được vượt quá 1000 ký tự.";

  const hours = getStaffOvertimeHours(form.workDate, form.startTime, form.endTime);
  if (hours < 0.25) return "Thời lượng tăng ca tối thiểu là 15 phút.";
  if (hours > 24) return "Thời lượng tăng ca không được vượt quá 24 giờ.";

  const proposed = getStaffOvertimeInterval(form.workDate, form.startTime, form.endTime);
  const hasOverlap = requests
    .filter((request) => request.status === "pending" || request.status === "approved")
    .some((request) =>
      staffOvertimeIntervalsOverlap(
        proposed,
        getStaffOvertimeInterval(toDateInputValue(request.workDate), request.startTime, request.endTime)
      )
    );

  if (hasOverlap) return "Bạn đã có đơn tăng ca đang chờ hoặc đã duyệt bị trùng giờ.";
  return "";
};
const toStaffOvertimeStatusLabel = (status: OvertimeRequest["status"]) => {
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  if (status === "cancelled") return "Đã hủy";
  return "Chờ duyệt";
};
const getAssignedShiftInterval = (schedule: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">) => {
  const dayStart = new Date(`${toDateInputValue(schedule.workDate)}T00:00:00`).getTime();
  const startMinutes = assignedShiftTimeToMinutes(schedule.shiftStartTime);
  const endMinutes = assignedShiftTimeToMinutes(schedule.shiftEndTime);
  const endOffset = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

  return {
    start: dayStart + startMinutes * 60 * 1000,
    end: dayStart + endOffset * 60 * 1000,
  };
};
const isFutureStaffAssignedShift = (schedule: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">) =>
  getAssignedShiftInterval(schedule).start >= Date.now();
const isSelectableStaffSwapShift = (schedule: AssignedShift) =>
  isFutureStaffAssignedShift(schedule) && ["scheduled", "swapped"].includes(schedule.status);
const assignedShiftsOverlap = (
  first: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">,
  second: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">
) => {
  const firstInterval = getAssignedShiftInterval(first);
  const secondInterval = getAssignedShiftInterval(second);
  return firstInterval.start < secondInterval.end && secondInterval.start < firstInterval.end;
};
const hasAnyAssignedShiftOverlap = (proposed: AssignedShift, schedules: AssignedShift[], excludeIds: string[]) =>
  schedules.some((schedule) => !excludeIds.includes(schedule.id) && assignedShiftsOverlap(proposed, schedule));
const isValidAssignedShiftSwapTarget = ({
  actorSchedules,
  fromSchedule,
  receiverSchedules,
  toSchedule,
}: {
  actorSchedules: AssignedShift[];
  fromSchedule: AssignedShift;
  receiverSchedules: AssignedShift[];
  toSchedule: AssignedShift;
}) =>
  !assignedShiftsOverlap(fromSchedule, toSchedule) &&
  !hasAnyAssignedShiftOverlap(fromSchedule, receiverSchedules, [toSchedule.id]) &&
  !hasAnyAssignedShiftOverlap(toSchedule, actorSchedules, [fromSchedule.id]);
const getInitials = (value: string) => value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const getWorkedHours = (attendance?: AttendanceRecord) => {
  if (!attendance?.checkInTime || !attendance.checkOutTime) return 0;
  return Math.max(0, (new Date(attendance.checkOutTime).getTime() - new Date(attendance.checkInTime).getTime()) / 36e5);
};
const chooseBestSchedule = (schedules: AssignedShift[], attendanceByScheduleId: Map<string, AttendanceRecord>) => {
  const pending = schedules.filter((schedule) => !attendanceByScheduleId.get(schedule.id)?.checkOutTime);
  const candidates = pending.length > 0 ? pending : schedules;

  return [...candidates].sort((a, b) => getScheduleDistanceMinutes(a) - getScheduleDistanceMinutes(b))[0];
};

const isAttendanceEligibleSchedule = (schedule: AssignedShift) =>
  schedule.status === "scheduled" || schedule.status === "swapped";
const getScheduleDistanceMinutes = (schedule: AssignedShift) => {
  const now = new Date();
  const date = toDateInputValue(schedule.workDate);
  const start = new Date(`${date}T${schedule.shiftStartTime}:00`);
  const end = new Date(`${date}T${schedule.shiftEndTime}:00`);

  if (end <= start) end.setDate(end.getDate() + 1);
  if (now >= start && now <= end) return 0;

  return Math.min(Math.abs(now.getTime() - start.getTime()), Math.abs(now.getTime() - end.getTime())) / 60000;
};
const normalizeQrToken = (value: string) => {
  const trimmed = value.trim();

  try {
    const parsed = JSON.parse(trimmed) as { qrToken?: unknown };
    if (typeof parsed.qrToken === "string") return parsed.qrToken.trim();
  } catch {
    // QR payloads can be raw tokens, URLs, or JSON.
  }

  try {
    const url = new URL(trimmed);
    return url.searchParams.get("qrToken")?.trim() || url.searchParams.get("token")?.trim() || trimmed;
  } catch {
    return trimmed;
  }
};
const toAttendanceLabel = (status: AttendanceStatus) => {
  if (status === "on_time") return "On-time";
  if (status === "late") return "Late";
  if (status === "absent") return "Absent";
  if (status === "early_leave") return "Early leave";
  return "Overtime";
};
const toStaffSwapStatusLabel = (status: ShiftSwapRequest["finalStatus"]) => {
  if (status === "pending_receiver") return "Pending receiver";
  if (status === "pending_manager") return "Pending manager";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Từ chối";
  return "Cancelled";
};
const AttendanceRecordRow = ({ record }: { record: AttendanceRecord }) => (
  <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white p-4">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[#f1edec]">
        <span className="text-xs font-semibold text-[#444748]">{new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(record.workDate)).toUpperCase()}</span>
        <b className="text-xl leading-none">{new Date(record.workDate).getDate()}</b>
      </div>
      <div>
        <h3 className="font-semibold">{record.scheduledStartTime} - {record.scheduledEndTime}</h3>
        <p className="text-sm text-[#444748]">{formatTime(record.checkInTime)} - {formatTime(record.checkOutTime)} - {getWorkedHours(record).toFixed(1)} giờ</p>
      </div>
    </div>
    <div className="flex items-center gap-4"><span className={record.attendanceStatus === "late" || record.attendanceStatus === "absent" ? "hidden rounded-full bg-[#ef4444]/10 px-3 py-1 text-sm font-semibold text-[#ef4444] sm:block" : "hidden rounded-full bg-[#10b981]/10 px-3 py-1 text-sm font-semibold text-[#10b981] sm:block"}>{toAttendanceLabel(record.attendanceStatus)}</span><ChevronRight className="h-5 w-5 text-[#747878]" /></div>
  </div>
);
const PageIntro = ({ desc, title }: { desc: string; title: string }) => <section className="mb-6"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-[#444748]">{desc}</p></section>;
const Tabs = ({ active, setActive, tabs }: { active: string; setActive: (v: string) => void; tabs: string[][] }) => <div className="mb-4 flex gap-4 border-b border-[#e5e7eb]">{tabs.map(([value, label]) => <button className={active === value ? "border-b-2 border-black px-2 pb-3 text-sm font-semibold" : "border-b-2 border-transparent px-2 pb-3 text-sm font-semibold text-[#444748]"} onClick={() => setActive(value)} key={value}>{label}</button>)}</div>;
const SwapMini = ({ onCancel, person, request }: { onCancel: () => void; person: string; request: ShiftSwapRequest }) => {
  const canCancel = request.finalStatus === "pending_receiver" || request.finalStatus === "pending_manager";
  return <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><div className="mb-3 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#444748]">Yêu cầu đổi ca</p><p className="font-semibold">{formatDate(request.createdAt)}</p></div><span className={request.finalStatus === "approved" ? "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs text-[#10b981]" : request.finalStatus === "rejected" || request.finalStatus === "cancelled" ? "rounded-full bg-[#ef4444]/10 px-3 py-1 text-xs text-[#ef4444]" : "rounded-full bg-[#e5e2e1] px-3 py-1 text-xs text-[#484645]"}>{toStaffSwapStatusLabel(request.finalStatus)}</span></div><div className="flex items-center gap-3 border-t border-[#e5e7eb] py-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e2e1] text-xs font-bold">{getInitials(person)}</div><p>Đổi ca với <b>{person}</b></p></div><div className="mb-3 grid gap-2 rounded-lg border border-[#e5e7eb] bg-white p-3 text-sm"><p><span className="font-semibold">Ca của bạn:</span> {formatStaffSwapSchedule(request.fromSchedule, request.fromScheduleId)}</p><p><span className="font-semibold">Bạn nhận:</span> {request.toSchedule ? formatStaffSwapSchedule(request.toSchedule, request.toScheduleId) : "Không nhận lại ca - đồng nghiệp phủ ca của bạn"}</p></div>{request.reason ? <p className="pb-3 text-sm text-[#444748]">{request.reason}</p> : null}{canCancel ? <button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Hủy yêu cầu</button> : null}</div>;
};
const AvailableSwap = ({ by, onAccept, onReject, request }: { by: string; onAccept: () => void; onReject: () => void; request: ShiftSwapRequest }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4"><div className="mb-3 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#444748]">Cần phản hồi</p><p className="font-semibold">{formatDate(request.createdAt)}</p></div><ChevronRight className="h-5 w-5 text-[#444748]" /></div><div className="border-t border-[#e5e7eb] pt-3"><p>Người yêu cầu: <b>{by}</b></p><div className="my-3 grid gap-2 rounded-lg border border-[#e5e7eb] bg-white p-3 text-sm"><p><span className="font-semibold">Ca được yêu cầu:</span> {formatStaffSwapSchedule(request.fromSchedule, request.fromScheduleId)}</p><p><span className="font-semibold">Họ nhận:</span> {request.toSchedule ? formatStaffSwapSchedule(request.toSchedule, request.toScheduleId) : "Không nhận lại ca - chỉ phủ ca"}</p></div>{request.reason ? <p className="mt-1 text-sm text-[#444748]">{request.reason}</p> : null}<div className="mt-3 flex gap-2"><button className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white" onClick={onAccept} type="button">Đồng ý</button><button className="flex-1 rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold" onClick={onReject} type="button">Từ chối</button></div></div></div>;
const StaffShiftSwapModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const today = toDateInputValue(new Date());
  const to = toDateInputValue(addDays(new Date(), 30));
  const [fromScheduleId, setFromScheduleId] = useState("");
  const [toEmployeeId, setToEmployeeId] = useState("");
  const [toScheduleId, setToScheduleId] = useState("");
  const [swapMode, setSwapMode] = useState<"cover" | "swap">("cover");
  const [reason, setReason] = useState("");
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { staffShiftSwapCreate: true, today, to }],
    queryFn: () => scheduleApi.my({ from: today, to, published: true }),
  });
  const futureMySchedules = (schedulesQuery.data?.data ?? []).filter(isSelectableStaffSwapShift);
  const selectedSchedule = futureMySchedules.find((schedule) => schedule.id === fromScheduleId);
  const employeesQuery = useQuery({
    queryKey: ["employees", { staffShiftSwapCreate: true, branchId: selectedSchedule?.branchId }],
    queryFn: () => employeeApi.list({ limit: 100, role: "staff", status: "active", ...(selectedSchedule?.branchId ? { branchId: selectedSchedule.branchId } : {}) }),
    enabled: Boolean(selectedSchedule?.branchId),
  });
  const receiverSchedulesQuery = useQuery({
    queryKey: ["schedules", "weekly", { staffShiftSwapReceiver: true, toEmployeeId, workDate: selectedSchedule?.workDate }],
    queryFn: () => scheduleApi.weekly({ weekStart: toWeekStart(selectedSchedule?.workDate ?? today), employeeId: toEmployeeId, branchId: selectedSchedule?.branchId, published: true }),
    enabled: Boolean(toEmployeeId && selectedSchedule?.branchId),
  });
  const colleagues = (employeesQuery.data?.data ?? []).filter((employee) => employee.id !== user?.id);
  const receiverSchedules = (receiverSchedulesQuery.data?.data ?? []).filter((schedule) => schedule.employeeId === toEmployeeId && isSelectableStaffSwapShift(schedule));
  const coverHasOverlap = selectedSchedule ? hasAnyAssignedShiftOverlap(selectedSchedule, receiverSchedules, []) : false;
  const selectedReceiverSchedule = receiverSchedules.find((schedule) => schedule.id === toScheduleId);
  const selectedSwapHasOverlap =
    selectedSchedule && selectedReceiverSchedule
      ? !isValidAssignedShiftSwapTarget({
          actorSchedules: futureMySchedules,
          fromSchedule: selectedSchedule,
          receiverSchedules,
          toSchedule: selectedReceiverSchedule,
        })
      : false;

  useEffect(() => {
    if (toScheduleId && !receiverSchedules.some((schedule) => schedule.id === toScheduleId)) {
      setToScheduleId("");
    }
  }, [receiverSchedules, toScheduleId]);
  const createMutation = useMutation({
    mutationFn: () => shiftSwapApi.create({ fromScheduleId, toEmployeeId, ...(toScheduleId ? { toScheduleId } : {}), ...(reason.trim() ? { reason: reason.trim() } : {}) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shift-swaps"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white p-4">
          <h2 className="text-xl font-semibold">Đổi ca mới</h2>
          <button className="rounded-full p-2 hover:bg-[#f7f3f2]" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-4">
          {createMutation.isError ? <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(createMutation.error, "Không thể tạo yêu cầu đổi ca.")}</p> : null}
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Ca của bạn</span>
            <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3" onChange={(event) => { setFromScheduleId(event.target.value); setToEmployeeId(""); setToScheduleId(""); setSwapMode("cover"); }} value={fromScheduleId}>
              <option value="">Chọn ca</option>
              {futureMySchedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{formatAssignedShift(schedule)}</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Đồng nghiệp</span>
            <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3" disabled={!selectedSchedule} onChange={(event) => { setToEmployeeId(event.target.value); setToScheduleId(""); setSwapMode("cover"); }} value={toEmployeeId}>
              <option value="">Chọn đồng nghiệp</option>
              {colleagues.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
            </select>
          </label>
          <section className="space-y-3 rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-3">
            <div>
              <p className="text-sm font-semibold">Chế độ đổi</p>
              <p className="text-xs text-[#444748]">Phủ ca nghĩa là đồng nghiệp nhận ca của bạn. Đổi ca nghĩa là bạn nhận lại một ca của họ.</p>
            </div>
            <div className="grid gap-2">
	              <button className={swapMode === "cover" ? "rounded-lg border border-black bg-white p-3 text-left text-sm font-semibold disabled:opacity-50" : "rounded-lg border border-[#e5e7eb] bg-white p-3 text-left text-sm font-semibold text-[#444748] disabled:opacity-50"} disabled={!toEmployeeId || coverHasOverlap} onClick={() => { setSwapMode("cover"); setToScheduleId(""); }} type="button">Chỉ phủ ca<span className="block text-xs font-normal text-[#747878]">{coverHasOverlap ? "Không khả dụng vì đồng nghiệp này có ca chồng lịch." : "Đồng nghiệp sẽ nhận ca của bạn."}</span></button>
              <button className={swapMode === "swap" ? "rounded-lg border border-black bg-white p-3 text-left text-sm font-semibold" : "rounded-lg border border-[#e5e7eb] bg-white p-3 text-left text-sm font-semibold text-[#444748] disabled:opacity-50"} disabled={!toEmployeeId} onClick={() => setSwapMode("swap")} type="button">Đổi với ca của đồng nghiệp<span className="block text-xs font-normal text-[#747878]">Chọn một ca bạn sẽ nhận lại.</span></button>
            </div>
            {swapMode === "swap" ? (
              <label className="block space-y-1">
	                <span className="text-sm font-semibold">Ca của đồng nghiệp để nhận</span>
                <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3" disabled={!toEmployeeId || receiverSchedulesQuery.isLoading || receiverSchedules.length === 0} onChange={(event) => setToScheduleId(event.target.value)} value={toScheduleId}>
	                  <option value="">{receiverSchedulesQuery.isLoading ? "Đang tải ca của đồng nghiệp..." : "Chọn ca của đồng nghiệp"}</option>
                  {receiverSchedules.map((schedule) => {
                    const conflictsAfterSwap =
                      selectedSchedule
                        ? !isValidAssignedShiftSwapTarget({
                            actorSchedules: futureMySchedules,
                            fromSchedule: selectedSchedule,
                            receiverSchedules,
                            toSchedule: schedule,
                          })
                        : false;

                    return (
                      <option disabled={conflictsAfterSwap} key={schedule.id} value={schedule.id}>
	                        {formatAssignedShift(schedule)}{conflictsAfterSwap ? " (trùng sau khi đổi)" : ""}
                      </option>
                    );
                  })}
                </select>
                {toEmployeeId && !receiverSchedulesQuery.isLoading && receiverSchedules.length === 0 ? <p className="text-xs font-semibold text-[#93000a]">Đồng nghiệp này không có ca đã xuất bản nào trong tuần đã chọn.</p> : null}
	                {toEmployeeId && toScheduleId && selectedSwapHasOverlap ? <p className="text-xs font-semibold text-[#93000a]">Ca đổi này sẽ tạo trùng lịch sau khi hoán đổi.</p> : null}
              </label>
            ) : null}
          </section>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Lý do</span>
	            <textarea className="min-h-24 w-full rounded-lg border border-[#e5e7eb] p-3" onChange={(event) => setReason(event.target.value)} placeholder="Nhập lý do đổi ca" value={reason} />
          </label>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e5e7eb] bg-white p-4">
	          <button className="rounded-lg px-4 py-2 text-sm font-semibold" onClick={onClose} type="button">Hủy</button>
	          <button className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!fromScheduleId || !toEmployeeId || (swapMode === "cover" && coverHasOverlap) || (swapMode === "swap" && (!toScheduleId || selectedSwapHasOverlap)) || createMutation.isPending} onClick={() => createMutation.mutate()} type="button">{createMutation.isPending ? "Đang gửi..." : "Gửi"}</button>
        </div>
      </div>
    </div>
  );
};
const LeaveBalance = ({ icon, label, meta, value, width }: { icon: ReactNode; label: string; meta: string; value: string; width: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><div className="mb-4 flex justify-between"><span className="rounded-lg bg-black p-2 text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className="rounded-full bg-[#f1edec] px-2 py-1 text-xs text-[#444748]">{meta}</span></div><p className="text-sm font-semibold text-[#444748]">{label}</p><p><span className="text-4xl font-semibold">{value}</span> <span className="text-sm font-semibold text-[#444748]">yêu cầu</span></p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e5e2e1]"><div className="h-full bg-black" style={{ width }} /></div></div>;
const leaveStatusLabel = (status: LeaveRequest["status"]) =>
  status === "approved" ? "Đã duyệt" : status === "rejected" ? "Từ chối" : status === "cancelled" ? "Đã hủy" : "Đang chờ";

const LeaveHistory = ({
  onCancel,
  request,
  scheduleLabel,
}: {
  onCancel?: () => void;
  request: LeaveRequest;
  scheduleLabel: string;
}) => {
  const canCancel = request.status === "pending" && onCancel;
  const tone =
    request.status === "approved"
      ? "success"
      : request.status === "rejected" || request.status === "cancelled"
        ? "danger"
        : "pending";

  return (
    <div className="border-b border-[#e5e7eb] p-6 last:border-b-0 hover:bg-[#f7f3f2]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className={
              tone === "success"
                ? "flex h-12 w-12 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]"
                : tone === "danger"
                  ? "flex h-12 w-12 items-center justify-center rounded-xl bg-[#ef4444]/10 text-[#ef4444]"
                  : "flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600"
            }
          >
            {tone === "success" ? <CheckCircle2 /> : tone === "danger" ? <X /> : <CalendarClock />}
          </span>
          <div className="space-y-1">
            <p className="font-semibold">
              {scheduleLabel}{" "}
              <span className="rounded bg-[#f1edec] px-2 py-0.5 text-[10px] uppercase">{leaveStatusLabel(request.status)}</span>
            </p>
            <p className="text-xs text-[#444748]">Gửi lúc {formatDate(request.requestedAt)}</p>
            <p className="text-sm text-[#444748]">{request.reason}</p>
            {request.managerNote ? <p className="text-xs text-[#444748]">Ghi chú quản lý: {request.managerNote}</p> : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ChevronRight className="h-5 w-5 text-[#747878]" />
          {canCancel ? (
            <button className="rounded-lg border border-[#e5e7eb] px-3 py-1 text-xs font-semibold" onClick={onCancel} type="button">
              Hủy yêu cầu
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
const Notice = ({ detail, icon, muted, time, title, tone = "default", unread }: { detail: string; icon: ReactNode; muted?: boolean; time: string; title: string; tone?: "default" | "success" | "secondary" | "danger"; unread?: boolean }) => { const color = tone === "success" ? "bg-[#10b981]/10 text-[#10b981]" : tone === "secondary" ? "bg-[#0058be]/10 text-[#0058be]" : tone === "danger" ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-black text-white"; return <div className={muted ? "flex gap-4 rounded-xl border border-[#e5e7eb] bg-[#f5f5f5]/50 p-4 opacity-80" : "flex gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4 hover:bg-[#f7f3f2]"}><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${color}`}>{icon}</span><div className="flex-1"><div className="mb-1 flex justify-between gap-2"><h3 className="font-semibold">{title}</h3><span className="shrink-0 text-xs text-[#444748]">{time}</span></div><p className="text-sm leading-tight text-[#444748]">{detail}</p></div>{unread ? <span className="h-2 w-2 self-center rounded-full bg-[#0058be]" /> : null}</div>; };
const Pill = ({ icon, text }: { icon: ReactNode; text: string }) => <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-[#f7f3f2] px-3 py-1 text-sm font-semibold">{icon}<span>{text}</span></span>;
const ProfileInfo = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span><p className="text-xs font-semibold uppercase tracking-wider text-[#444748]">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
const EditProfileModal = ({
  isPending,
  onClose,
  onSubmit,
  user,
}: {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: { fullName?: string; phone?: string; avatar?: string }) => void;
  user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>;
}) => {
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const canSubmit = fullName.trim().length >= 2 && !isPending;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <h2 className="text-2xl font-semibold">Chỉnh sửa hồ sơ</h2>
          <button className="rounded-full p-2 hover:bg-[#f7f3f2]" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-6">
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Họ tên</span>
            <input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3 outline-none focus:ring-1 focus:ring-black" onChange={(event) => setFullName(event.target.value)} value={fullName} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Số điện thoại</span>
            <input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3 outline-none focus:ring-1 focus:ring-black" onChange={(event) => setPhone(event.target.value)} placeholder="Nhập số điện thoại" value={phone} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Ảnh đại diện URL</span>
            <input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3 outline-none focus:ring-1 focus:ring-black" onChange={(event) => setAvatar(event.target.value)} placeholder="https://..." value={avatar} />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
          <button className="rounded-lg px-4 py-2 text-sm font-semibold" onClick={onClose} type="button">Hủy</button>
          <button
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                fullName: fullName.trim(),
                phone: phone.trim(),
                ...(avatar.trim() ? { avatar: avatar.trim() } : {}),
              })
            }
            type="button"
          >
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};
const ProfileLink = ({ action, desc, icon, title }: { action: string; desc: string; icon: ReactNode; title: string }) => <a className="flex flex-col rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 hover:bg-white hover:shadow-md" href="#"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</span><h3 className="mb-1 font-semibold">{title}</h3><p className="mb-4 text-xs text-[#444748]">{desc}</p><span className="mt-auto flex items-center text-sm font-semibold">{action}<ChevronRight className="h-4 w-4" /></span></a>;
const SettingsRow = ({ compact, danger, desc, icon, onClick, success, title }: { compact?: boolean; danger?: boolean; desc?: string; icon: ReactNode; onClick?: () => void; success?: boolean; title: string }) => {
  const content = <><div className="flex items-center gap-4"><span className={danger ? "text-[#ef4444]" : "text-[#444748]"}>{icon}</span><div><p className={danger ? "font-semibold text-[#ef4444]" : "font-semibold"}>{title}</p>{desc ? <p className={success ? "text-xs text-[#10b981]" : "text-xs text-[#444748]"}>{desc}</p> : null}</div></div>{compact || !danger ? <ChevronRight className="h-4 w-4 text-[#444748]" /> : null}</>;
  const className = "flex w-full items-center justify-between border-b border-[#e5e7eb] p-4 text-left last:border-b-0 hover:bg-[#f7f3f2]";

  return onClick ? <button className={className} onClick={onClick} type="button">{content}</button> : <div className={className}>{content}</div>;
};
const SettingsGroup = ({ children, title }: { children: ReactNode; title: string }) => <section><h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-[#444748]">{title}</h3><div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">{children}</div></section>;
const ToggleRow = ({ checked, icon, label, onChange }: { checked?: boolean; icon: ReactNode; label: string; onChange?: () => void }) => <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4 last:border-b-0 hover:bg-[#f7f3f2]"><div className="flex items-center gap-4"><span className="text-[#444748]">{icon}</span><span>{label}</span></div><button className={checked ? "relative h-6 w-11 rounded-full bg-black" : "relative h-6 w-11 rounded-full bg-[#c4c7c7]"} onClick={onChange} type="button"><span className={checked ? "absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition" : "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition"} /></button></div>;
const LeaveModal = ({ onClose, onSaved, schedules }: { onClose: () => void; onSaved: () => void; schedules: AssignedShift[] }) => {
  const queryClient = useQueryClient();
  const [scheduleId, setScheduleId] = useState("");
  const [reason, setReason] = useState("");
  const createMutation = useMutation({
    mutationFn: () => leaveRequestApi.create({ scheduleId, reason: reason.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      onSaved();
      onClose();
    },
  });

  const canSubmit = Boolean(scheduleId && reason.trim()) && !createMutation.isPending;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] p-6">
          <h2 className="text-2xl font-semibold">Tạo yêu cầu nghỉ phép</h2>
          <button className="rounded-full p-2 hover:bg-[#f7f3f2]" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          {createMutation.isError ? (
            <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">
              {getApiErrorMessage(createMutation.error, "Không thể tạo yêu cầu nghỉ phép.")}
            </p>
          ) : null}
          <label className="block">
            <span className="mb-2 block font-semibold">Chọn ca nghỉ</span>
            <select className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3" onChange={(event) => setScheduleId(event.target.value)} value={scheduleId}>
              <option value="">Chọn một ca làm việc</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {formatAssignedShift(schedule)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-semibold">Lý do</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[#e5e7eb] p-3"
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do nghỉ phép"
              value={reason}
            />
          </label>
          {schedules.length === 0 ? <p className="text-xs font-semibold text-[#93000a]">Bạn chưa có ca làm việc tương lai nào để tạo yêu cầu nghỉ.</p> : null}
        </div>
        <div className="flex justify-end gap-3 bg-[#f7f3f2] p-6">
          <button className="rounded-lg border border-[#e5e7eb] px-6 py-2 font-semibold" onClick={onClose} type="button">
            Hủy
          </button>
          <button
            className="rounded-lg bg-black px-6 py-2 font-semibold text-white disabled:opacity-50"
            disabled={!canSubmit}
            onClick={() => createMutation.mutate()}
            type="button"
          >
            {createMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
};

