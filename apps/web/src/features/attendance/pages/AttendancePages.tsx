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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { branchApi } from "@/features/employeeBranch/branch.api";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import type { Employee } from "@/features/employeeBranch/employee.types";
import { scheduleApi } from "@/features/shift/schedule.api";
import type { AssignedShift } from "@/features/shift/schedule.types";
import { getApiErrorMessage } from "@/shared/api";
import { QrScanner } from "../components/QrScanner";
import { attendanceApi } from "../attendance.api";
import type { AttendanceRecord, AttendanceStatus } from "../attendance.types";
import { dailyQrApi } from "../dailyQr.api";
import type { DailyQrCode } from "../dailyQr.types";

export const AttendanceDashboardPage = () => {
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState("all");
  const today = toDateInputValue(new Date());
  const weekStart = getWeekStartInputValue(new Date());
  const branchQuery = useQuery({
    queryKey: ["branches", { attendance: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeeQuery = useQuery({
    queryKey: ["employees", { attendance: true, branchId }],
    queryFn: () => employeeApi.list({ limit: 100, status: "active", ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const scheduleQuery = useQuery({
    queryKey: ["schedules", "weekly", { attendanceToday: true, branchId, weekStart }],
    queryFn: () => scheduleApi.weekly({ weekStart, published: true, ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const historyQuery = useQuery({
    queryKey: ["attendances", "history", { branchId, today }],
    queryFn: () => attendanceApi.history({ from: today, to: today, limit: 100, ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const remindersQuery = useQuery({
    queryKey: ["attendances", "reminders", { branchId, today }],
    queryFn: () => attendanceApi.reminders({ workDate: today, ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const lateWarningsQuery = useQuery({
    queryKey: ["attendances", "lateWarnings", { branchId, today }],
    queryFn: () => attendanceApi.lateWarnings({ workDate: today, ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const autoAbsentMutation = useMutation({
    mutationFn: () => attendanceApi.autoMarkAbsent({ workDate: today, ...(branchId !== "all" ? { branchId } : {}) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendances"] });
      void queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
  const branches = branchQuery.data?.data ?? [];
  const employeesById = useMemo(() => new Map((employeeQuery.data?.data ?? []).map((employee) => [employee.id, employee])), [employeeQuery.data?.data]);
  const branchesById = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches]);
  const todaySchedules = (scheduleQuery.data?.data ?? []).filter((schedule) => toDateInputValue(schedule.workDate) === today);
  const attendances = historyQuery.data?.data ?? [];
  const attendanceByScheduleId = useMemo(() => new Map(attendances.map((item) => [item.scheduleId, item])), [attendances]);
  const rows = todaySchedules.map((schedule) => ({
    schedule,
    attendance: attendanceByScheduleId.get(schedule.id),
    employee: employeesById.get(schedule.employeeId),
  }));
  const lateCount = attendances.filter((item) => item.attendanceStatus === "late").length;
  const absentCount = attendances.filter((item) => item.attendanceStatus === "absent").length;
  const totalHours = attendances.reduce((sum, item) => sum + getWorkedHours(item), 0);
  const attendanceRate = todaySchedules.length > 0 ? Math.round((attendances.filter((item) => item.checkInTime).length / todaySchedules.length) * 100) : 0;
  const isLoading = branchQuery.isLoading || employeeQuery.isLoading || scheduleQuery.isLoading || historyQuery.isLoading;

  return (
      <AttendanceShell title="Giám sát chấm công" search="Tìm bản ghi chấm công..." action={<LinkButton to="/dashboard/attendance/qr" icon={<QrCode className="h-4 w-4" />}>Mở cổng QR</LinkButton>}>
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black">Giám sát chấm công</h1>
          <p className="text-base text-[#444748]">Real-time status for {formatDateLabel(today)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
            <option value="all">Tất cả chi nhánh</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90">
            <Download className="h-4 w-4" />
            Xuất CSV
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#f7f3f2] disabled:opacity-50" disabled={autoAbsentMutation.isPending} onClick={() => autoAbsentMutation.mutate()} type="button">
            <Filter className="h-4 w-4" />
            {autoAbsentMutation.isPending ? "Đang đánh dấu..." : "Đánh dấu vắng"}
          </button>
        </div>
      </div>
      {autoAbsentMutation.isError ? <ApiErrorMessage error={autoAbsentMutation.error} fallback="Unable to mark absent schedules." /> : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<TrendingUp />} label="Tỷ lệ chấm công" meta={`${attendances.length}/${todaySchedules.length} đã ghi nhận`} tone="success" value={`${attendanceRate}%`} />
        <KpiCard icon={<Clock3 />} label="Đi muộn hôm nay" meta="Cần chú ý" tone="danger" value={String(lateCount).padStart(2, "0")} />
        <KpiCard icon={<UserRound />} label="Vắng hôm nay" meta={`${remindersQuery.data?.data.length ?? 0} chưa check-in`} value={String(absentCount).padStart(2, "0")} />
        <KpiCard icon={<Timer />} label="Tổng giờ" meta="Đã ghi nhận hôm nay" tone="secondary" value={`${totalHours.toFixed(1)}h`} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm xl:col-span-9">
          <div className="flex flex-col justify-between gap-3 border-b border-[#e5e7eb] p-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold tracking-tight text-black">Chấm công hôm nay</h2>
            <div className="flex gap-2">
              <Link className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/attendance/history">Lịch sử</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-xs font-bold uppercase tracking-wider text-[#444748]">
                <tr>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Chi nhánh</th>
                  <th className="px-4 py-3">Lịch</th>
                  <th className="px-4 py-3 text-center">Check-in</th>
                  <th className="px-4 py-3 text-center">Check-out</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {isLoading ? (
                  <tr><td className="px-4 py-10 text-center text-sm font-semibold text-[#444748]" colSpan={6}>Đang tải chấm công...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td className="px-4 py-10 text-center text-sm font-semibold text-[#444748]" colSpan={6}>Không tìm thấy lịch đã xuất bản cho hôm nay.</td></tr>
                ) : rows.map(({ attendance, employee, schedule }) => {
                  const status = attendance ? toAttendanceLabel(attendance.attendanceStatus) : "Chờ";
                  return (
                  <tr className="transition hover:bg-[#f7f3f2]" key={schedule.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1edec] text-xs font-bold">{getInitials(employee?.fullName ?? "Nhân viên")}</div>
                        <div>
                          <p className="font-semibold text-black">{employee?.fullName ?? schedule.employeeId}</p>
                          <p className="text-xs text-[#444748]">{employee ? toRoleLabel(employee) : "Nhân viên"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#444748]">{branchesById.get(schedule.branchId) ?? schedule.branchId}</td>
                    <td className="px-4 py-4">{schedule.shiftStartTime} - {schedule.shiftEndTime}</td>
                    <td className={attendance?.attendanceStatus === "late" ? "px-4 py-4 text-center font-semibold text-[#ef4444]" : "px-4 py-4 text-center font-semibold"}>{formatTime(attendance?.checkInTime)}</td>
                    <td className="px-4 py-4 text-center text-[#444748]">{formatTime(attendance?.checkOutTime)}</td>
                    <td className="px-4 py-4 text-right"><StatusBadge status={status} /></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#e5e7eb] bg-[#f7f3f2] p-4 text-center">
            <Link className="text-sm font-semibold text-black hover:underline" to="/dashboard/attendance/history">Xem lịch sử chấm công</Link>
          </div>
        </section>

        <aside className="space-y-4 xl:col-span-3">
          <Panel title="Cảnh báo gần đây" badge="MỚI">
            {(lateWarningsQuery.data?.data ?? []).slice(0, 2).map((item) => (
              <AlertItem action="Xem lại" detail={`${employeesById.get(item.employeeId)?.fullName ?? item.employeeId} đang đi muộn ${item.lateMinutes} phút.`} icon={<AlertTriangle />} key={item.id} title="Đi muộn" tone="danger" />
            ))}
            {(remindersQuery.data?.data ?? []).slice(0, 2).map((item) => (
              <AlertItem action="Xử lý" detail={`${employeesById.get(item.employeeId)?.fullName ?? item.employeeId} chưa check-in cho ca ${item.shiftStartTime}.`} icon={<Bell />} key={item.scheduleId} title="Thiếu check-in" />
            ))}
            {(lateWarningsQuery.data?.data.length ?? 0) === 0 && (remindersQuery.data?.data.length ?? 0) === 0 ? (
              <AlertItem action="Xem lịch sử" detail="Không có cảnh báo đi muộn hoặc thiếu check-in cho chi nhánh đã chọn." icon={<CalendarDays />} title="Mọi thứ ổn" />
            ) : null}
          </Panel>
          <section className="relative overflow-hidden rounded-xl bg-black p-6 text-white">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Gợi ý tối ưu</h3>
            <p className="mb-6 text-sm leading-6 text-white/70">Tỷ lệ chấm công vào ca sáng cao hơn 4% so với ca tối. Hãy cân nhắc điều chỉnh mức nhân sự.</p>
            <button className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10">Xem phân tích</button>
          </section>
        </aside>
      </div>
    </main>
  </AttendanceShell>
  );
};

export const AttendanceQrPage = () => {
  const [branchId, setBranchId] = useState("");
  const [qrCode, setQrCode] = useState<DailyQrCode | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const today = toDateInputValue(new Date());
  const branchesQuery = useQuery({
    queryKey: ["branches", { attendanceQr: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const branches = branchesQuery.data?.data ?? [];
  const selectedBranchId = branchId || branches[0]?.id || "";
  const generateMutation = useMutation({
    mutationFn: () => dailyQrApi.generate({ branchId: selectedBranchId, validDate: today }),
    onSuccess: (data) => {
      setQrCode(data);
      setSecondsLeft(getSecondsUntil(data.expiresAt));
    },
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!branchId && branches[0]?.id) {
      setBranchId(branches[0].id);
    }
  }, [branchId, branches]);

  useEffect(() => {
    if (!selectedBranchId) return;

    setQrCode(null);
    setSecondsLeft(0);
    generateMutation.mutate();
  }, [selectedBranchId]);

  useEffect(() => {
    if (!autoRefresh || !selectedBranchId || !qrCode || secondsLeft > 0 || generateMutation.isPending) return;

    generateMutation.mutate();
  }, [autoRefresh, generateMutation, qrCode, secondsLeft, selectedBranchId]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <AttendanceShell title="Cổng chấm công" search="Tìm hoạt động..." action={<LinkButton to="/dashboard/attendance/scanner" icon={<QrCode className="h-4 w-4" />}>Máy quét nhân viên</LinkButton>}>
      <main className="grid min-h-[calc(100vh-4rem)] grid-cols-1 bg-white lg:grid-cols-[1fr_320px]">
        <section className="flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <header className="mb-8">
              <h1 className="text-4xl font-semibold tracking-tight text-black">Cổng chấm công</h1>
              <p className="text-base text-[#444748]">Trạm trực tiếp để nhân viên check-in và check-out.</p>
            </header>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none" onChange={(event) => setBranchId(event.target.value)} value={selectedBranchId}>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={!selectedBranchId || generateMutation.isPending} onClick={() => generateMutation.mutate()} type="button">
                <RefreshCw className="h-4 w-4" />
                {generateMutation.isPending ? "Đang tạo..." : "Tạo QR"}
              </button>
              <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold">
                <input checked={autoRefresh} className="h-4 w-4 accent-black" onChange={(event) => setAutoRefresh(event.target.checked)} type="checkbox" />
                Tự động làm mới
              </label>
            </div>
            {generateMutation.isError ? <ApiErrorMessage error={generateMutation.error} fallback="Không thể tạo mã QR." /> : null}
            <div className="relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-8 text-center shadow-sm">
              <div className="absolute right-8 top-8 text-black/5"><QrCode className="h-40 w-40" /></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ffdad6] px-4 py-2 text-sm font-semibold text-[#93000a]">
                  <Timer className="h-4 w-4" />
                  {qrCode ? `Hết hạn sau ${minutes}:${seconds}` : "Chưa tạo QR hoạt động"}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-black">Quét để ghi nhận ca</h2>
                <p className="mx-auto mt-2 max-w-md text-base text-[#444748]">Hướng máy quét vào mã này để check-in hoặc check-out. Mã sẽ tự đổi để bảo mật.</p>
                <div className="mx-auto my-8 w-fit rounded-xl border-2 border-black bg-white p-4 shadow-xl transition hover:scale-[1.02]">
                  {qrCode ? <QRCodeSVG className="h-64 w-64" level="M" value={qrCode.qrToken} /> : <div className="flex h-64 w-64 items-center justify-center text-sm font-semibold text-[#444748]">Tạo QR để bắt đầu</div>}
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-black px-6 text-sm font-semibold text-white disabled:opacity-50" disabled={!selectedBranchId || generateMutation.isPending} onClick={() => generateMutation.mutate()} type="button">
                    <RefreshCw className="h-4 w-4" />
                    Tạo lại QR
                  </button>
                  <button className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#e5e7eb] px-6 text-sm font-semibold text-black hover:bg-[#f7f3f2]">
                    <BarChart3 className="h-4 w-4" />
                    Chế độ toàn màn hình
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard icon={<QrCode />} label="Trạng thái QR" value={qrCode?.status ?? "Chưa tạo"} tone="secondary" />
              <InfoCard icon={<MapPin />} label="Chi nhánh" value={branches.find((branch) => branch.id === selectedBranchId)?.name ?? "Chọn chi nhánh"} />
              <InfoCard icon={<ShieldCheck />} label="Bảo mật" value={qrCode ? "Đã xác minh token máy chủ" : "Đang chờ"} />
            </div>
          </div>
        </section>
        <ActivityFeed attendances={[]} employeesById={new Map<string, Employee>()} />
      </main>
    </AttendanceShell>
  );
};

export const AttendanceHistoryPage = () => {
  const [status, setStatus] = useState<AttendanceStatus | "all">("all");
  const today = new Date();
  const from = toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1));
  const to = toDateInputValue(today);
  const historyQuery = useQuery({
    queryKey: ["attendances", "historyPage", { from, to, status }],
    queryFn: () => attendanceApi.history({ from, to, limit: 50, ...(status !== "all" ? { status } : {}) }),
  });
  const entries = historyQuery.data?.data ?? [];
  const totalHours = entries.reduce((sum, item) => sum + getWorkedHours(item), 0);
  const onTimeRate = entries.length > 0 ? Math.round((entries.filter((item) => item.attendanceStatus === "on_time").length / entries.length) * 100) : 0;

  return (
  <AttendanceShell title="Lịch sử chấm công" search="Tìm lịch sử..." action={<LinkButton to="/dashboard/attendance" icon={<ArrowLeft className="h-4 w-4" />}>Quay lại</LinkButton>}>
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <section className="relative overflow-hidden rounded-xl bg-black p-8 text-white">
        <p className="mb-2 text-sm font-semibold text-white/70">Tháng này</p>
        <h1 className="text-5xl font-extrabold leading-none">{totalHours.toFixed(1)}h</h1>
        <p className="mt-3 flex items-center gap-2 text-base text-white/80"><TrendingUp className="h-5 w-5" />{onTimeRate}% đúng giờ trên {entries.length} bản ghi</p>
      </section>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ["all", "Tất cả bản ghi"],
          ["on_time", "Đúng giờ"],
          ["late", "Đi muộn"],
          ["overtime", "Tăng ca"],
        ].map(([value, label]) => (
          <button className={status === value ? "shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#444748]"} key={value} onClick={() => setStatus(value as AttendanceStatus | "all")} type="button">
            {label}
          </button>
        ))}
      </div>
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#444748]">Hoạt động gần đây</h2>
        {historyQuery.isLoading ? (
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 text-sm font-semibold text-[#444748]">Đang tải lịch sử chấm công...</div>
        ) : historyQuery.isError ? (
          <ApiErrorMessage error={historyQuery.error} fallback="Không thể tải lịch sử chấm công." />
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6 text-sm font-semibold text-[#444748]">Không tìm thấy bản ghi chấm công.</div>
        ) : (
          entries.map((entry) => <HistoryEntry entry={entry} key={entry.id} />)
        )}
      </section>
      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]">
        <Download className="h-4 w-4" />
        Xuất báo cáo tháng
      </button>
    </main>
  </AttendanceShell>
  );
};

export const StaffQrScannerPage = () => {
  const [flashOn, setFlashOn] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [mode, setMode] = useState<"check-in" | "check-out">("check-in");
  const [entryMode, setEntryMode] = useState<"scan" | "manual">("scan");
  const [result, setResult] = useState<AttendanceRecord | null>(null);
  const today = toDateInputValue(new Date());
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { attendanceScanner: true, today }],
    queryFn: () => scheduleApi.my({ from: today, to: today, published: true }),
  });
  const historyQuery = useQuery({
    queryKey: ["attendances", "my", { attendanceScanner: true, today }],
    queryFn: () => attendanceApi.history({ from: today, to: today, limit: 50 }),
  });
  const schedules = (schedulesQuery.data?.data ?? []).filter(isAttendanceEligibleSchedule);
  const attendances = historyQuery.data?.data ?? [];
  const attendanceByScheduleId = useMemo(() => new Map(attendances.map((attendance) => [attendance.scheduleId, attendance])), [attendances]);
  const selectedSchedule = schedules.find((schedule) => schedule.id === scheduleId) ?? chooseBestSchedule(schedules, attendanceByScheduleId);
  const submitMutation = useMutation({
    mutationFn: async (token: string) => {
      if (!selectedSchedule) {
        throw new Error("Select a shift before submitting attendance.");
      }
      await dailyQrApi.verify({ qrToken: token, branchId: selectedSchedule.branchId });
      return mode === "check-in"
        ? attendanceApi.checkIn({ qrToken: token, scheduleId: selectedSchedule.id })
        : attendanceApi.checkOut({ qrToken: token, scheduleId: selectedSchedule.id });
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });
  const submitToken = useCallback(
    (token: string) => {
      if (!token || submitMutation.isPending) return;
      submitMutation.mutate(token);
    },
    [submitMutation]
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
        {selectedSchedule ? `Scanning for shift ${selectedSchedule.shiftStartTime} - ${selectedSchedule.shiftEndTime}` : "No shift selected"}
      </div>
      <QrScanner active={entryMode === "scan"} className="flex min-h-[560px] flex-1 items-center justify-center" onScan={handleScan}>
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
          {entryMode === "scan" ? `Quét QR để ${mode === "check-in" ? "check-in" : "check-out"}` : `Nhập mã để ${mode === "check-in" ? "check-in" : "check-out"}`}
        </div>
      </QrScanner>
      <footer className="bg-white px-6 py-6">
        <div className="mx-auto max-w-md space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button className={mode === "check-in" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setMode("check-in")} type="button">Check In</button>
            <button className={mode === "check-out" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setMode("check-out")} type="button">Check Out</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className={entryMode === "scan" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setEntryMode("scan")} type="button">Quét QR</button>
            <button className={entryMode === "manual" ? "h-10 rounded-lg bg-black text-sm font-semibold text-white" : "h-10 rounded-lg border border-[#e5e7eb] text-sm font-semibold"} onClick={() => setEntryMode("manual")} type="button">Nhập mã</button>
          </div>
          <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none" onChange={(event) => setScheduleId(event.target.value)} value={selectedSchedule?.id ?? ""}>
            {schedules.length === 0 ? <option value="">Không có ca hôm nay</option> : null}
            {schedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{formatDateLabel(toDateInputValue(schedule.workDate))} · {schedule.shiftStartTime} - {schedule.shiftEndTime}</option>)}
          </select>
          {entryMode === "manual" ? (
            <input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setQrToken(event.target.value)} placeholder="Nhập mã QR thủ công" value={qrToken} />
          ) : null}
          {submitMutation.isError ? <ApiErrorMessage error={submitMutation.error} fallback="Unable to submit attendance." /> : null}
          {result ? <p className="rounded-lg bg-[#10b981]/10 px-3 py-2 text-sm font-semibold text-[#10b981]">{toAttendanceActionLabel(mode)} successful at {formatTime(mode === "check-in" ? result.checkInTime : result.checkOutTime)}</p> : null}
          <div className="flex items-center justify-center gap-8">
            <ScannerAction active={flashOn} icon={<Flashlight />} label="Flash" onClick={() => setFlashOn((value) => !value)} />
            <ScannerAction active={entryMode === "manual"} icon={<Keyboard />} label="Type Code" onClick={() => setEntryMode("manual")} />
            <ScannerAction icon={<History />} label="Lịch sử" />
          </div>
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-semibold text-white disabled:opacity-50" disabled={!qrToken || !selectedSchedule || submitMutation.isPending} onClick={() => submitToken(normalizeQrToken(qrToken))} type="button">
            {submitMutation.isPending ? "Đang gửi..." : "Gửi chấm công"}
            <ChevronRight className="h-4 w-4" />
          </button>
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
        <Link className="flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" to="/dashboard/attendance/history">Đi tới lịch sử chấm công</Link>
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
  const tone = status === "Đúng giờ" ? "bg-[#10b981]/10 text-[#10b981]" : status === "Đi muộn" || status === "Vắng" ? "bg-[#ef4444]/10 text-[#ef4444]" : status === "Hoàn thành" || status === "Tăng ca" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#444748]/10 text-[#444748]";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${tone}`}>{status}</span>;
};

const toDateInputValue = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekStartInputValue = (value: Date) => {
  const date = new Date(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return toDateInputValue(date);
};

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${toDateInputValue(value)}T00:00:00`));

const formatTime = (value?: string) =>
  value ? new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "--:--";

const getSecondsUntil = (value: string) => Math.max(0, Math.floor((new Date(value).getTime() - Date.now()) / 1000));

const getWorkedHours = (attendance: AttendanceRecord) => {
  if (!attendance.checkInTime || !attendance.checkOutTime) return 0;
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
  if (status === "on_time") return "Đúng giờ";
  if (status === "late") return "Đi muộn";
  if (status === "absent") return "Vắng";
  if (status === "early_leave") return "Early Leave";
  return "Tăng ca";
};

const toAttendanceActionLabel = (mode: "check-in" | "check-out") => mode === "check-in" ? "Check-in" : "Check-out";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";

const toRoleLabel = (employee: Employee) => {
  if (employee.role === "owner") return "Owner";
  if (employee.role === "manager") return "Manager";
  return "Nhân viên";
};

const ApiErrorMessage = ({ error, fallback }: { error: unknown; fallback: string }) => (
  <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(error, fallback)}</p>
);

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

const ActivityFeed = ({ attendances, employeesById }: { attendances: AttendanceRecord[]; employeesById: Map<string, Employee> }) => {
  const items = [...attendances]
    .filter((item) => item.checkInTime || item.checkOutTime)
    .sort((a, b) => (b.checkOutTime ?? b.checkInTime ?? "").localeCompare(a.checkOutTime ?? a.checkInTime ?? ""))
    .slice(0, 8);

  return (
  <aside className="hidden border-l border-[#e5e7eb] bg-white lg:flex lg:flex-col">
    <div className="border-b border-[#e5e7eb] p-6">
      <h3 className="text-2xl font-semibold tracking-tight text-black">Hoạt động gần đây</h3>
      <p className="text-xs text-[#444748]">Real-time check-in stream</p>
    </div>
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {items.length === 0 ? <p className="rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4 text-sm font-semibold text-[#444748]">Chưa có hoạt động chấm công hôm nay.</p> : items.map((item) => {
        const employee = employeesById.get(item.employeeId);
        const name = employee?.fullName ?? item.employeeId;
        const time = item.checkOutTime ?? item.checkInTime;
        return (
        <div className="rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4" key={item.id}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-xs font-bold">{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold text-black">{name}</p>
                <span className="shrink-0 text-[10px] text-[#444748]">{time ? formatTime(time) : "--"}</span>
              </div>
              <p className="text-xs text-[#444748]">{item.checkOutTime ? "Đã check-out" : "Đã check-in"} - {toAttendanceLabel(item.attendanceStatus)}</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase text-[#10b981]"><span className="h-2 w-2 rounded-full bg-[#10b981]" />Verified</p>
            </div>
          </div>
        </div>
      );})}
    </div>
    <div className="border-t border-[#e5e7eb] p-4">
      <Link className="flex h-10 w-full items-center justify-center rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/attendance/history">Xem toàn bộ lịch sử</Link>
    </div>
  </aside>
  );
};

const HistoryEntry = ({ entry }: { entry: AttendanceRecord }) => (
  <article className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4 transition hover:bg-[#f1edec]">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="mb-0.5 text-sm font-semibold text-black">{entry.scheduledStartTime} - {entry.scheduledEndTime}</p>
        <h3 className="text-lg font-bold text-black">{formatDateLabel(toDateInputValue(entry.workDate))}</h3>
      </div>
      <StatusBadge status={toAttendanceLabel(entry.attendanceStatus)} />
    </div>
    <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-4">
      <div className="flex gap-8">
        <TimeValue label="Check In" value={formatTime(entry.checkInTime)} />
        <TimeValue label="Check Out" value={formatTime(entry.checkOutTime)} />
      </div>
      <div className="text-right">
        <p className="text-xs text-[#444748]">Total</p>
        <p className="text-xl font-black text-black">{getWorkedHours(entry).toFixed(1)}h</p>
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
