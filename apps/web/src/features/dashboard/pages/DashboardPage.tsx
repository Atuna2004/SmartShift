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
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/features/attendance/attendance.api";
import { branchApi } from "@/features/employeeBranch/branch.api";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import { leaveRequestApi } from "@/features/requests/leaveRequest.api";
import { organizationApi } from "@/features/organization/organization.api";
import { paymentApi } from "@/features/payment/payment.api";
import { subscriptionApi } from "@/features/subscription/subscription.api";
import { scheduleApi } from "@/features/shift/schedule.api";
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

const ManagerDashboard = ({ managerName }: { managerName: string }) => {
  const today = new Date();
  const todayISO = toDateInputValue(today);
  const weekStart = toDateInputValue(getWeekStart(today));
  const monthStartISO = toDateInputValue(startOfMonth(today));
  const branchesQuery = useQuery({
    queryKey: ["branches", "managerDashboard"],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", "managerDashboard"],
    queryFn: () => employeeApi.list({ limit: 100, status: "active" }),
  });
  const scheduleQuery = useQuery({
    queryKey: ["schedules", "managerDashboard", { weekStart }],
    queryFn: () => scheduleApi.weekly({ weekStart, published: true }),
  });
  const attendanceQuery = useQuery({
    queryKey: ["attendances", "managerDashboard", { todayISO }],
    queryFn: () => attendanceApi.history({ from: todayISO, to: todayISO, limit: 100 }),
  });
  const leaveRequestsQuery = useQuery({
    queryKey: ["leave-requests", "managerDashboard", { monthStartISO, todayISO }],
    queryFn: () => leaveRequestApi.list({ from: monthStartISO, to: todayISO, limit: 20 }),
  });

  const employees = employeesQuery.data?.data ?? [];
  const employeeById = useMemo(() => new Map(employees.map((employee) => [employee.id, employee] as const)), [employees]);
  const branchesById = useMemo(() => new Map((branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch.name] as const)), [branchesQuery.data?.data]);
  const todaySchedules = (scheduleQuery.data?.data ?? []).filter((schedule) => toDateInputValue(schedule.workDate) === todayISO);
  const attendances = attendanceQuery.data?.data ?? [];
  const checkedIn = attendances.filter((attendance) => attendance.checkInTime && !attendance.checkOutTime).length;
  const lateAttendances = attendances.filter((attendance) => attendance.attendanceStatus === "late");
  const pendingLeave = (leaveRequestsQuery.data?.data ?? []).filter((request) => request.status === "pending");
  const totalScheduledHours = todaySchedules.reduce((sum, schedule) => sum + getShiftHours(schedule.shiftStartTime, schedule.shiftEndTime), 0);
  const recentActivity = [...attendances]
    .filter((attendance) => attendance.checkInTime || attendance.checkOutTime)
    .sort((a, b) => (b.checkOutTime ?? b.checkInTime ?? "").localeCompare(a.checkOutTime ?? a.checkInTime ?? ""))
    .slice(0, 4);

  return (
    <DashboardCanvas
      actions={
        <>
          <a className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold text-black transition hover:bg-[#f7f3f2]" href="/dashboard/attendance/qr">
            <QrCode className="h-4 w-4" />
            Tạo QR
          </a>
          <a className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90" href="/dashboard/shifts/new">
            <Plus className="h-4 w-4" />
            Tạo lịch
          </a>
        </>
      }
      eyebrow={`Chào mừng trở lại, ${managerName.split(" ")[0] ?? "Manager"}`}
      title="Bảng điều khiển quản lý"
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<CalendarDays />} label="Ca hôm nay" meta={`${todaySchedules.length} ca đã xuất bản`} metaTone="success" value={String(todaySchedules.length)} />
        <KpiCard icon={<BadgeCheck />} label="Đang trực" value={`${checkedIn}/${todaySchedules.length}`} avatars />
        <KpiCard icon={<AlertTriangle />} label="Cảnh báo chấm công" meta="Cần xử lý" metaTone="danger" value={String(lateAttendances.length)} danger />
        <KpiCard icon={<Clock3 />} label="Chờ phê duyệt" value={String(pendingLeave.length)} arrow />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel action={<a className="text-sm font-semibold text-[#0058be] hover:underline" href="/dashboard/attendance">Xem tất cả</a>} title="Nhân viên đi trễ">
            {lateAttendances.length === 0 ? <p className="p-4 text-sm font-semibold text-[#444748]">Không có bản ghi đi muộn hôm nay.</p> : lateAttendances.slice(0, 4).map((attendance) => {
              const employee = employeeById.get(attendance.employeeId);
              return <LateEmployee key={attendance.id} name={employee?.fullName ?? attendance.employeeId} photo={employee?.avatar ?? avatars.emp1} shift={branchesById.get(attendance.branchId) ?? attendance.branchId} time={`Trễ ${attendance.lateMinutes} phút`} />;
            })}
          </Panel>

          <Panel action={<span className="text-xs text-[#444748]">Dữ liệu hôm nay</span>} title={<span className="inline-flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981]" />Luồng ca làm trực tiếp</span>}>
            <div className="relative space-y-4 p-4 before:absolute before:bottom-6 before:left-[35px] before:top-6 before:w-px before:bg-[#e5e7eb]">
              {recentActivity.length === 0 ? <p className="text-sm font-semibold text-[#444748]">Chưa có hoạt động chấm công.</p> : recentActivity.map((attendance) => {
                const employee = employeeById.get(attendance.employeeId);
                const time = attendance.checkOutTime ?? attendance.checkInTime;
                return <FeedItem color={attendance.attendanceStatus === "late" ? "danger" : "success"} key={attendance.id} text={<><b>{employee?.fullName ?? attendance.employeeId}</b> {attendance.checkOutTime ? "đã check-out" : "đã check-in"}</>} time={time ? formatTime(time) : "--"} sub={`Chi nhánh: ${branchesById.get(attendance.branchId) ?? attendance.branchId}`} />;
              })}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-black p-6 text-white shadow-xl">
            <h3 className="mb-4 text-2xl font-semibold tracking-tight">Tổng quan ca làm</h3>
            <SummaryLine icon={<Timer />} label="Tổng giờ đã xếp" value={`${totalScheduledHours.toFixed(1)}h`} />
            <SummaryLine icon={<BarChart3 />} label="Nhân viên active" value={String(employees.length)} />
            <a className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-[#f1edec]" href="/dashboard/reports">Xem báo cáo chi tiết</a>
            <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
          </section>

          <Panel title="Yêu cầu nghỉ phép">
            <div className="space-y-4 p-4">
              {pendingLeave.length === 0 ? <p className="text-sm font-semibold text-[#444748]">Không có yêu cầu chờ duyệt.</p> : pendingLeave.slice(0, 3).map((request) => <LeaveItem date={request.schedule?.workDate ? formatDate(request.schedule.workDate) : formatDate(request.requestedAt)} key={request.id} name={request.employeeName ?? employeeById.get(request.employeeId)?.fullName ?? request.employeeId} photo={avatars.leave1} />)}
              <a className="flex h-10 w-full items-center justify-center rounded-lg bg-[#f7f3f2] text-xs font-semibold text-[#444748] transition hover:bg-[#f1edec]" href="/dashboard/leave-requests">Xem yêu cầu</a>
            </div>
          </Panel>

          <section className="rounded-xl border border-dashed border-[#e5e7eb] bg-[#f5f5f5] p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
              <QrCode className="h-10 w-10 text-black" />
            </div>
            <h4 className="text-sm font-bold text-black">{branchesQuery.data?.data[0]?.name ?? "Chi nhánh"}</h4>
            <p className="mb-4 mt-1 text-xs text-[#444748]">Đang hoạt động cho các ca hôm nay</p>
            <a className="text-sm font-semibold text-[#0058be] hover:underline" href="/dashboard/attendance/qr">Mở mã QR</a>
          </section>
        </div>
      </div>
    </DashboardCanvas>
  );
};

const OwnerDashboard = ({ ownerName }: { ownerName: string }) => {
  const user = useAuthStore((state) => state.user);
  const organizationId = user?.organizationId;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(addMonths(now, -1));
  const nextMonthStart = startOfMonth(addMonths(now, 1));
  const todayISO = toDateInputValue(now);
  const monthStartISO = toDateInputValue(monthStart);
  const prevMonthStartISO = toDateInputValue(prevMonthStart);
  const nextMonthStartISO = toDateInputValue(nextMonthStart);

  const organizationQuery = useQuery({
    queryKey: ["organization", "me"],
    queryFn: () => organizationApi.me(organizationId),
  });
  const subscriptionQuery = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => subscriptionApi.current(organizationId),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", "ownerDashboard"],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", "ownerDashboard"],
    queryFn: () => employeeApi.list({ limit: 100, status: "active" }),
  });
  const attendanceQuery = useQuery({
    queryKey: ["attendances", "ownerDashboard", { from: prevMonthStartISO, to: todayISO }],
    queryFn: () => attendanceApi.history({ from: prevMonthStartISO, to: todayISO, limit: 100 }),
  });
  const leaveRequestsQuery = useQuery({
    queryKey: ["leave-requests", "ownerDashboard", { from: monthStartISO, to: todayISO }],
    queryFn: () => leaveRequestApi.list({ from: monthStartISO, to: todayISO, limit: 100 }),
  });
  const paymentsQuery = useQuery({
    queryKey: ["payments", "ownerDashboard"],
    queryFn: () => paymentApi.list({ limit: 100, paymentStatus: "paid" }),
  });

  const branches = branchesQuery.data?.data ?? [];
  const employees = employeesQuery.data?.data ?? [];
  const employeeById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee] as const)),
    [employees]
  );
  const attendanceRecords = attendanceQuery.data?.data ?? [];
  const leaveRequests = leaveRequestsQuery.data?.data ?? [];
  const payments = paymentsQuery.data?.data ?? [];
  const organization = organizationQuery.data;
  const fallbackSubscription = organization?.subscription
    ? {
        id: "organization-subscription",
        organizationId: organization.id,
        ownerId: organization.ownerId,
        planId: "organization-plan",
        planCode: organization.subscription.plan,
        planName: capitalize(organization.subscription.plan),
        priceMonthly: 0,
        currency: "VND" as const,
        limits: {
          maxBranches: organization.subscription.maxBranches ?? 0,
          maxEmployees: organization.subscription.maxEmployees ?? 0,
          maxManagers: 0,
        },
        features: {
          qrCheckIn: true,
          gpsValidation: true,
          attendanceReports: true,
          shiftSwap: true,
          payroll: true,
        },
        startDate: organization.subscription.startedAt ?? nextMonthStart.toISOString(),
        endDate: organization.subscription.expiredAt ?? nextMonthStart.toISOString(),
        status: organization.subscription.status,
        autoRenew: false,
      }
    : undefined;
  const subscription = subscriptionQuery.data ?? fallbackSubscription;

  const currentMonthAttendance = attendanceRecords.filter((record) => record.workDate >= monthStartISO);
  const prevMonthAttendance = attendanceRecords.filter((record) => record.workDate >= prevMonthStartISO && record.workDate < monthStartISO);
  const currentMonthRevenuePayments = payments.filter((payment) => payment.paidAt && payment.paidAt >= monthStartISO && payment.paidAt < nextMonthStartISO);
  const prevMonthRevenuePayments = payments.filter((payment) => payment.paidAt && payment.paidAt >= prevMonthStartISO && payment.paidAt < monthStartISO);

  const currentAttendanceRate = percent(currentMonthAttendance.filter((record) => record.attendanceStatus === "on_time").length, currentMonthAttendance.length);
  const prevAttendanceRate = percent(prevMonthAttendance.filter((record) => record.attendanceStatus === "on_time").length, prevMonthAttendance.length);
  const attendanceChange = currentAttendanceRate - prevAttendanceRate;

  const currentRevenue = currentMonthRevenuePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const prevRevenue = prevMonthRevenuePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  const newEmployees = employees.filter((employee) => employee.joinDate && employee.joinDate >= monthStartISO).length;
  const activeBranchCount = branches.length;
  const pendingLeaveCount = leaveRequests.filter((request) => request.status === "pending").length;
  const recentPayments = [...payments]
    .filter((payment) => payment.paidAt)
    .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""))
    .slice(0, 5);

  const branchRows = branches.slice(0, 5).map((branch) => {
    const branchEmployees = employees.filter((employee) => employee.branchId === branch.id).length;
    const branchAttendance = attendanceRecords.filter((record) => record.branchId === branch.id && record.workDate >= monthStartISO);
    const onTimeRate = percent(
      branchAttendance.filter((record) => record.attendanceStatus === "on_time").length,
      branchAttendance.length
    );
    const status = onTimeRate >= 90 ? "Tốt" : onTimeRate >= 80 ? "Theo dõi" : "Cần xem";
    const tone = onTimeRate >= 90 ? "success" : "secondary";

    return {
      branch: branch.name,
      coverage: `${branchEmployees} nhân viên`,
      efficiency: `${Math.round(onTimeRate)}% đúng giờ`,
      status,
      tone,
    } as const;
  });

  const revenueSeries = buildDailyRevenueSeries(payments, monthStartISO, todayISO);
  const planName = subscription?.planName ?? "Chưa xác định";
  const subscriptionEnd = subscription?.endDate;

  return (
    <DashboardCanvas
      actions={
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" />
          Tạo ca làm
        </button>
      }
      eyebrow={`Chào mừng trở lại, ${ownerName.split(" ")[0] ?? "Owner"}`}
      title="Tổng quan"
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OwnerKpi icon={<UsersRound />} label="Tổng nhân viên" trend={`+${newEmployees} mới trong tháng`} trendIcon={<TrendingUp />} value={String(employeesQuery.data?.meta.total ?? employees.length)} />
        <OwnerKpi icon={<CheckCircle2 />} label="Tỷ lệ chấm công" trend={`${attendanceChange >= 0 ? "+" : ""}${attendanceChange.toFixed(1)}% so với tháng trước`} trendIcon={<CheckCircle2 />} value={`${currentAttendanceRate.toFixed(1)}%`} />
        <OwnerKpi icon={<Store />} label="Chi nhánh đang hoạt động" trend="Đang hoạt động" value={String(branchesQuery.data?.meta.total ?? activeBranchCount)} />
        <OwnerKpi icon={<BarChart3 />} label="Doanh thu tháng này" trend={`${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}% so với tháng trước`} trendIcon={revenueChange >= 0 ? <TrendingUp /> : <TrendingDown />} trendTone={revenueChange >= 0 ? "success" : "danger"} value={formatCurrency(currentRevenue, payments[0]?.currency ?? "VND")} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel
            action={
              <div className="flex gap-2">
                <button className="rounded-lg bg-[#f1edec] px-3 py-1 text-sm font-semibold">Theo tháng</button>
                <button className="px-3 py-1 text-sm font-semibold text-[#444748]">Theo ngày</button>
              </div>
            }
            title="Doanh thu gần đây"
          >
            <div className="p-6">
              <RevenueBars points={revenueSeries} />
            </div>
          </Panel>

          <Panel title="Hiệu suất chi nhánh">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-y border-[#e5e7eb] bg-[#f5f5f5] text-sm font-semibold text-[#444748]">
                  <tr>
                    <th className="px-6 py-3">Tên chi nhánh</th>
                    <th className="px-6 py-3">Nhân sự</th>
                    <th className="px-6 py-3">Chấm công đúng giờ</th>
                    <th className="px-6 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {branchRows.length === 0 ? (
                    <tr>
                      <td className="px-6 py-4 text-sm text-[#444748]" colSpan={4}>
                        Chưa có chi nhánh nào để hiển thị.
                      </td>
                    </tr>
                  ) : (
                    branchRows.map((row) => <BranchRow key={row.branch} branch={row.branch} coverage={row.coverage} efficiency={row.efficiency} status={row.status} tone={row.tone} />)
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 text-center">
              <button className="text-sm font-semibold text-[#444748] hover:text-black">Xem tất cả chi nhánh -&gt;</button>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#444748]">Gói hiện tại</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight">{planName}</h3>
              </div>
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                {organization?.subscription?.status ?? subscription?.status ?? "trialing"}
              </span>
            </div>
            <p className="text-sm text-[#444748]">
              {subscription?.limits
                ? `Tối đa ${subscription.limits.maxBranches} chi nhánh và ${subscription.limits.maxEmployees} nhân viên.`
                : "Đang lấy thông tin gói đăng ký."}
            </p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span className="text-[#444748]">Gia hạn tiếp theo</span>
                <span>{subscriptionEnd ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(subscriptionEnd)) : "--"}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-black/10">
                <div className="h-full w-3/4 bg-black" />
              </div>
            </div>
            <button className="mt-6 h-12 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:opacity-90">
              Quản lý gói đăng ký
            </button>
          </section>

          <Panel title="Yêu cầu nghỉ phép">
            <div className="space-y-4 p-4">
              {leaveRequests.slice(0, 3).length === 0 ? (
                <p className="text-sm text-[#444748]">Chưa có yêu cầu nghỉ phép trong giai đoạn này.</p>
              ) : (
                leaveRequests
                  .slice(0, 3)
                  .map((request) => (
                    <LeaveItem
                      key={request.id}
                      date={`${formatDate(request.requestedAt)} - ${request.status === "pending" ? "Chờ duyệt" : request.status === "approved" ? "Đã duyệt" : request.status === "rejected" ? "Từ chối" : "Đã hủy"}`}
                      name={employeeById.get(request.employeeId)?.fullName ?? request.employeeId}
                      photo={avatars.leave1}
                    />
                  ))
              )}
              <button className="h-10 w-full rounded-lg bg-[#f7f3f2] text-xs font-semibold text-[#444748] transition hover:bg-[#f1edec]">
                Xem {pendingLeaveCount} yêu cầu chờ xử lý
              </button>
            </div>
          </Panel>

          <Panel title="Hoạt động gần đây">
            <div className="space-y-5 p-4">
              {recentPayments[0] ? (
                <ActivityItem
                  icon={<BarChart3 />}
                  title="Thanh toán gần nhất"
                  detail={`${formatCurrency(recentPayments[0].amount, recentPayments[0].currency)} cho ${recentPayments[0].purpose}`}
                  time={recentPayments[0].paidAt ? formatDate(recentPayments[0].paidAt) : "Mới đây"}
                />
              ) : null}
              {leaveRequests[0] ? (
                <ActivityItem
                  icon={<CalendarDays />}
                  title="Yêu cầu nghỉ mới"
                  detail={`Nhân viên ${employeeById.get(leaveRequests[0].employeeId)?.fullName ?? leaveRequests[0].employeeId} vừa gửi yêu cầu nghỉ.`}
                  time={formatDate(leaveRequests[0].requestedAt)}
                  tone="secondary"
                />
              ) : null}
              {attendanceRecords.find((record) => record.attendanceStatus === "late") ? (
                <ActivityItem
                  icon={<AlertTriangle />}
                  title="Đi trễ"
                  detail={`Có ${attendanceRecords.filter((record) => record.attendanceStatus === "late").length} bản ghi đi trễ trong giai đoạn này.`}
                  time="Hôm nay"
                  tone="danger"
                />
              ) : null}
              <button className="h-10 w-full rounded-lg border border-[#e5e7eb] text-sm font-semibold text-[#444748] transition hover:bg-[#f5f5f5]">
                Xem tất cả hoạt động
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardCanvas>
  );
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};
const getWeekStart = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};
const toDateInputValue = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const percent = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
const formatTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const formatCurrency = (value: number, currency: "VND" | "USD") =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: currency === "VND" ? 0 : 2 }).format(value);
const getShiftHours = (start: string, end: string) => {
  const [startHour = 0, startMinute = 0] = start.split(":").map(Number);
  const [endHour = 0, endMinute = 0] = end.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return (endMinutes - startMinutes) / 60;
};
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const buildDailyRevenueSeries = (payments: { amount: number; paidAt?: string }[], from: string, to: string) => {
  const points: Array<{ date: string; value: number }> = [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  for (const payment of payments) {
    if (!payment.paidAt) continue;
    const paidAt = new Date(payment.paidAt);
    if (paidAt < start || paidAt > end) continue;
    const dateKey = toDateInputValue(paidAt);
    const existing = points.find((point) => point.date === dateKey);
    if (existing) {
      existing.value += payment.amount;
    } else {
      points.push({ date: dateKey, value: payment.amount });
    }
  }
  return points.sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
};
const RevenueBars = ({ points }: { points: Array<{ date: string; value: number }> }) => {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="grid min-h-64 grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
      <div className="flex min-h-64 items-end gap-3 overflow-hidden rounded-lg bg-[#f5f5f5] px-4 pb-4">
        {points.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#444748]">Chưa có thanh toán trong tháng này.</div>
        ) : (
          points.map((point) => (
            <div className="flex min-h-48 flex-1 flex-col justify-end" key={point.date}>
              <div className="mb-2 text-center text-[10px] font-semibold text-[#444748]">{formatDate(point.date)}</div>
              <div className="rounded-t-sm bg-black" style={{ height: `${Math.max(12, (point.value / max) * 100)}%` }} />
            </div>
          ))
        )}
      </div>
      <div className="flex flex-col justify-between rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#444748]">Tổng 7 ngày gần nhất</p>
          <p className="mt-2 text-3xl font-black">{formatCurrency(points.reduce((sum, point) => sum + point.value, 0), "VND")}</p>
        </div>
        <p className="text-xs text-[#444748]">Biểu đồ lấy từ các khoản thanh toán đã ghi nhận trong tháng hiện tại.</p>
      </div>
    </div>
  );
};

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


