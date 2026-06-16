import {
  Archive,
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
  Send,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { branchApi } from "@/features/employeeBranch/branch.api";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import { leaveRequestApi } from "@/features/requests/leaveRequest.api";
import type { LeaveRequest, LeaveRequestStatus } from "@/features/requests/leaveRequest.types";
import { notificationApi } from "@/features/notification/notification.api";
import type { Notification, NotificationListQuery, NotificationType } from "@/features/notification/notification.types";
import { scheduleApi } from "@/features/shift/schedule.api";
import type { AssignedShift } from "@/features/shift/schedule.types";
import { shiftSwapApi } from "@/features/requests/shiftSwap.api";
import type { ShiftSwapFinalStatus, ShiftSwapRequest } from "@/features/requests/shiftSwap.types";
import { getApiErrorMessage } from "@/shared/api";
import { useAuthStore } from "@/store";

type ShiftSwapAction = "accept" | "rejectReceiver" | "approve" | "rejectManager" | "cancel";
type StaffShiftSwapView = "needs_response" | "pending_manager" | "my_requests" | "history";
type NotificationTab = "all" | "unread" | "requests" | "alerts" | "schedule" | "system";
type NotificationRecipientMode = "all_staff" | "branch" | "employees";

const notificationTemplates: Array<{ label: string; type: NotificationType; title: string; message: string }> = [
  {
    label: "Lịch làm mới",
    type: "schedule_published",
    title: "Lịch làm việc mới đã được công bố",
    message: "Vui lòng kiểm tra lịch làm việc mới và phản hồi sớm nếu có vướng mắc.",
  },
  {
    label: "Nhắc chấm công",
    type: "checkin_reminder",
    title: "Nhắc chấm công đúng giờ",
    message: "Mọi người lưu ý chấm công khi bắt đầu và kết thúc ca để dữ liệu công được ghi nhận chính xác.",
  },
  {
    label: "Họp nhân viên",
    type: "system",
    title: "Thông báo họp nhân viên",
    message: "Quán sẽ có buổi họp nhân viên. Vui lòng sắp xếp thời gian tham gia đầy đủ.",
  },
  {
    label: "Cảnh báo vận hành",
    type: "attendance_warning",
    title: "Cần lưu ý về vận hành ca",
    message: "Vui lòng kiểm tra lại phân công ca và tuân thủ quy định vận hành trong ngày.",
  },
];

export const ShiftSwapPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [staffView, setStaffView] = useState<StaffShiftSwapView>("needs_response");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    branchId: "",
    employeeId: "",
    fromEmployeeId: "",
    toEmployeeId: "",
    finalStatus: "" as "" | ShiftSwapFinalStatus,
    receiverStatus: "",
    managerStatus: "",
    createdFrom: "",
    createdTo: "",
    respondedFrom: "",
    respondedTo: "",
  });
  const canCreate = user?.role === "staff";
  const query = useMemo(
    () => ({
      page,
      limit: 10,
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.fromEmployeeId ? { fromEmployeeId: filters.fromEmployeeId } : {}),
      ...(filters.toEmployeeId ? { toEmployeeId: filters.toEmployeeId } : {}),
      ...(filters.finalStatus ? { finalStatus: filters.finalStatus } : {}),
      ...(filters.receiverStatus ? { receiverStatus: filters.receiverStatus as "pending" | "accepted" | "rejected" } : {}),
      ...(filters.managerStatus ? { managerStatus: filters.managerStatus as "pending" | "approved" | "rejected" } : {}),
      ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
      ...(filters.createdTo ? { createdTo: endOfDateInput(filters.createdTo) } : {}),
      ...(filters.respondedFrom ? { respondedFrom: filters.respondedFrom } : {}),
      ...(filters.respondedTo ? { respondedTo: endOfDateInput(filters.respondedTo) } : {}),
    }),
    [filters, page]
  );
  const swapsQuery = useQuery({
    queryKey: ["shift-swaps", query],
    queryFn: () => shiftSwapApi.list(query),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", { shiftSwapFilter: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { shiftSwapFilter: true, branchId: filters.branchId }],
    queryFn: () =>
      employeeApi.list({
        limit: 100,
        role: "staff",
        status: "active",
        ...(filters.branchId ? { branchId: filters.branchId } : {}),
      }),
  });
  const employees = employeesQuery.data?.data ?? [];
  const employeeById = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees]);
  const allSwaps = swapsQuery.data?.data ?? [];
  const staffVisibleSwaps = user?.role === "staff"
    ? allSwaps.filter((request) => {
        if (staffView === "needs_response") {
          return request.toEmployeeId === user.id && request.finalStatus === "pending_receiver";
        }

        if (staffView === "pending_manager") {
          return request.finalStatus === "pending_manager";
        }

        if (staffView === "my_requests") {
          return request.fromEmployeeId === user.id && request.finalStatus === "pending_receiver";
        }

        return ["approved", "rejected", "cancelled"].includes(request.finalStatus);
      })
    : allSwaps;
  const visibleSwaps = staffVisibleSwaps.filter((request) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [employeeById.get(request.fromEmployeeId)?.fullName, employeeById.get(request.toEmployeeId)?.fullName, request.id, request.reason]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(term));
  });
  const staffCounts = {
    needsResponse: allSwaps.filter((request) => request.toEmployeeId === user?.id && request.finalStatus === "pending_receiver").length,
    pendingManager: allSwaps.filter((request) => request.finalStatus === "pending_manager").length,
    myRequests: allSwaps.filter((request) => request.fromEmployeeId === user?.id && request.finalStatus === "pending_receiver").length,
    history: allSwaps.filter((request) => ["approved", "rejected", "cancelled"].includes(request.finalStatus)).length,
  };
  const decisionMutation = useMutation({
    mutationFn: ({ action, id }: { action: ShiftSwapAction; id: string }) => {
      if (action === "accept") return shiftSwapApi.accept(id);
      if (action === "rejectReceiver") return shiftSwapApi.rejectReceiver(id);
      if (action === "approve") return shiftSwapApi.approve(id);
      if (action === "rejectManager") return shiftSwapApi.rejectManager(id);
      return shiftSwapApi.cancel(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shift-swaps"] });
      void queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
  const resetFilters = () => {
    setPage(1);
    setFilters({
      branchId: "",
      employeeId: "",
      fromEmployeeId: "",
      toEmployeeId: "",
      finalStatus: "",
      receiverStatus: "",
      managerStatus: "",
      createdFrom: "",
      createdTo: "",
      respondedFrom: "",
      respondedTo: "",
    });
  };

  return (
    <RequestShell title="Đổi ca" search="Tìm theo tên nhân viên...">
      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <PageTitle
          title="Đổi ca"
          description="Quản lý và xem xét các yêu cầu đổi ca của nhân viên."
          action={canCreate ? <Link className="inline-flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:opacity-90" to="/dashboard/shift-swaps/new"><Plus className="h-4 w-4" />Yêu cầu đổi ca mới</Link> : null}
        />
        {user?.role === "staff" ? (
          <section className="flex flex-wrap gap-2 rounded-xl border border-[#e5e7eb] bg-white p-2">
            <StaffSwapTab active={staffView === "needs_response"} count={staffCounts.needsResponse} label="Cần tôi phản hồi" onClick={() => setStaffView("needs_response")} />
            <StaffSwapTab active={staffView === "pending_manager"} count={staffCounts.pendingManager} label="Chờ quản lý" onClick={() => setStaffView("pending_manager")} />
            <StaffSwapTab active={staffView === "my_requests"} count={staffCounts.myRequests} label="Yêu cầu của tôi" onClick={() => setStaffView("my_requests")} />
            <StaffSwapTab active={staffView === "history"} count={staffCounts.history} label="Lịch sử" onClick={() => setStaffView("history")} />
          </section>
        ) : null}
        <section className="space-y-3 rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="relative lg:col-span-4">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
              <input className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-4 outline-none focus:ring-1 focus:ring-black" onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo nhân viên hoặc lý do..." value={search} />
            </div>
            <select className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold lg:col-span-2" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, finalStatus: event.target.value as typeof filters.finalStatus })); }} value={filters.finalStatus}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending_receiver">Chờ người nhận</option>
              <option value="pending_manager">Chờ quản lý</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <select className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold lg:col-span-3" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, branchId: event.target.value, employeeId: "", fromEmployeeId: "", toEmployeeId: "" })); }} value={filters.branchId}>
              <option value="">Tất cả chi nhánh</option>
              {(branchesQuery.data?.data ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <FilterSelect label="Tất cả nhân viên" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, employeeId: value })); }} options={employees.map((employee) => [employee.id, employee.fullName])} value={filters.employeeId} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <DateFilter label="Tạo từ" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, createdFrom: value })); }} value={filters.createdFrom} />
            <DateFilter label="Tạo đến" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, createdTo: value })); }} value={filters.createdTo} />
            <div className="flex gap-2">
              <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#ebe7e6]" onClick={() => setShowAdvancedFilters((value) => !value)} type="button"><Filter className="h-4 w-4" />Bộ lọc thêm</button>
              <button className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#ebe7e6]" onClick={resetFilters} type="button">Xóa lọc</button>
            </div>
          </div>
          {showAdvancedFilters ? (
            <div className="grid grid-cols-1 gap-3 border-t border-[#e5e7eb] pt-3 md:grid-cols-3">
              <FilterSelect label="Người yêu cầu" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, fromEmployeeId: value })); }} options={employees.map((employee) => [employee.id, employee.fullName])} value={filters.fromEmployeeId} />
              <FilterSelect label="Người nhận" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, toEmployeeId: value })); }} options={employees.map((employee) => [employee.id, employee.fullName])} value={filters.toEmployeeId} />
              <FilterSelect label="Trạng thái người nhận" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, receiverStatus: value })); }} options={[["pending", "Chờ"], ["accepted", "Đã nhận"], ["rejected", "Từ chối"]]} value={filters.receiverStatus} />
              <FilterSelect label="Trạng thái quản lý" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, managerStatus: value })); }} options={[["pending", "Chờ"], ["approved", "Đã duyệt"], ["rejected", "Từ chối"]]} value={filters.managerStatus} />
              <DateFilter label="Phản hồi từ" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, respondedFrom: value })); }} value={filters.respondedFrom} />
              <DateFilter label="Phản hồi đến" onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, respondedTo: value })); }} value={filters.respondedTo} />
            </div>
          ) : null}
        </section>
        {decisionMutation.isError ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(decisionMutation.error, "Không thể cập nhật yêu cầu đổi ca.")}</p> : null}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {swapsQuery.isLoading ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm font-semibold text-[#444748] lg:col-span-2">Đang tải yêu cầu đổi ca...</p> : null}
          {swapsQuery.isError ? <p className="rounded-xl bg-[#ffdad6] p-6 text-sm font-semibold text-[#93000a] lg:col-span-2">{getApiErrorMessage(swapsQuery.error, "Không thể tải yêu cầu đổi ca.")}</p> : null}
          {!swapsQuery.isLoading && !swapsQuery.isError && visibleSwaps.length === 0 ? <p className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm font-semibold text-[#444748] lg:col-span-2">Không có yêu cầu đổi ca nào khớp bộ lọc.</p> : null}
          {visibleSwaps.map((request) => <SwapCard key={request.id} currentUserId={user?.id} currentUserRole={user?.role} employeeById={employeeById} onAction={(action) => decisionMutation.mutate({ action, id: request.id })} onViewHistory={() => setStaffView("history")} pending={decisionMutation.isPending} request={request} />)}
        </section>
        <div className="flex flex-col items-center gap-4 border-t border-[#e5e7eb] py-8">
          <p className="text-xs text-[#444748]">Đang hiển thị {visibleSwaps.length} trong {swapsQuery.data?.meta.total ?? 0} yêu cầu</p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-bold disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">Trước</button>
            <button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-bold disabled:opacity-50" disabled={!swapsQuery.data || page >= swapsQuery.data.meta.totalPages} onClick={() => setPage((value) => value + 1)} type="button">Sau</button>
          </div>
        </div>
      </main>
    </RequestShell>
  );
};

export const CreateShiftSwapPage = () => (
  <>
    <ShiftSwapPage />
    <ShiftSwapModal />
  </>
);

export const LeaveRequestsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    branchId: "",
    employeeId: "",
    status: "" as "" | LeaveRequestStatus,
    from: "",
    to: "",
  });

  const query = useMemo(
    () => ({
      page,
      limit: 10,
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: endOfDateInput(filters.to) } : {}),
    }),
    [filters, page]
  );

  const leaveRequestsQuery = useQuery({
    queryKey: ["leave-requests", query],
    queryFn: () => leaveRequestApi.list(query),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", { leaveRequests: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { leaveRequests: true, branchId: filters.branchId }],
    queryFn: () =>
      employeeApi.list({
        limit: 100,
        status: "active",
        ...(filters.branchId ? { branchId: filters.branchId } : {}),
      }),
  });

  const requests = leaveRequestsQuery.data?.data ?? [];
  const employeeById = useMemo(
    () => new Map((employeesQuery.data?.data ?? []).map((employee) => [employee.id, employee] as const)),
    [employeesQuery.data?.data]
  );
  const branchById = useMemo(
    () => new Map((branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch] as const)),
    [branchesQuery.data?.data]
  );
  const visibleRequests = requests.filter((request) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [
      request.employeeName,
      employeeById.get(request.employeeId)?.fullName,
      request.branchName,
      request.schedule?.branchName,
      branchById.get(request.branchId)?.name,
      request.reason,
      formatLeaveSchedule(request),
      toLeaveRequestStatusLabel(request.status),
    ]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(term));
  });

  const summary = useMemo(
    () => ({
      pending: requests.filter((request) => request.status === "pending").length,
      approved: requests.filter((request) => request.status === "approved").length,
      rejected: requests.filter((request) => request.status === "rejected").length,
      cancelled: requests.filter((request) => request.status === "cancelled").length,
    }),
    [requests]
  );

  const actionMutation = useMutation({
    mutationFn: ({ action, id }: { action: "approve" | "reject"; id: string }) =>
      action === "approve" ? leaveRequestApi.approve(id) : leaveRequestApi.reject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setFilters({ branchId: "", employeeId: "", status: "", from: "", to: "" });
  };

  return (
    <RequestShell title="Nghỉ phép" search="Tìm theo nhân viên hoặc lý do...">
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <PageTitle
          title="Nghỉ phép"
          description="Xem và xử lý các yêu cầu nghỉ phép của nhân viên."
          action={<button className="inline-flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:opacity-90" onClick={() => void queryClient.invalidateQueries({ queryKey: ["leave-requests"] })} type="button"><Download className="h-4 w-4" />Làm mới</button>}
        />
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard icon={<CalendarDays />} label="Chờ duyệt" value={String(summary.pending)} tone="secondary" />
          <StatCard icon={<CheckCircle2 />} label="Đã duyệt" value={String(summary.approved)} />
          <StatCard icon={<X />} label="Từ chối" value={String(summary.rejected)} />
          <StatCard icon={<Info />} label="Đã hủy" value={String(summary.cancelled)} />
        </section>
        <section className="space-y-3 rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="relative lg:col-span-4">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
              <input
                className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-4 outline-none focus:ring-1 focus:ring-black"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo nhân viên, lý do hoặc mã ca..."
                value={search}
              />
            </div>
            <select
              className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold lg:col-span-2"
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, status: event.target.value as typeof filters.status }));
              }}
              value={filters.status}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <select
              className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold lg:col-span-3"
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, branchId: event.target.value, employeeId: "" }));
              }}
              value={filters.branchId}
            >
              <option value="">Tất cả chi nhánh</option>
              {(branchesQuery.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <FilterSelect
              label="Tất cả nhân viên"
              onChange={(value) => {
                setPage(1);
                setFilters((current) => ({ ...current, employeeId: value }));
              }}
              options={(employeesQuery.data?.data ?? []).map((employee) => [employee.id, employee.fullName])}
              value={filters.employeeId}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <DateFilter
              label="Tạo từ"
              onChange={(value) => {
                setPage(1);
                setFilters((current) => ({ ...current, from: value }));
              }}
              value={filters.from}
            />
            <DateFilter
              label="Tạo đến"
              onChange={(value) => {
                setPage(1);
                setFilters((current) => ({ ...current, to: value }));
              }}
              value={filters.to}
            />
            <div className="flex gap-2">
              <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#ebe7e6]" onClick={() => setShowAdvancedFilters((value) => !value)} type="button">
                <Filter className="h-4 w-4" />
                {showAdvancedFilters ? "Ẩn bộ lọc thêm" : "Bộ lọc thêm"}
              </button>
              <button className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#ebe7e6]" onClick={resetFilters} type="button">
                Xóa lọc
              </button>
            </div>
          </div>
          {showAdvancedFilters ? (
            <div className="grid grid-cols-1 gap-3 border-t border-[#e5e7eb] pt-3 md:grid-cols-2">
              <DateFilter
                label="Nộp từ"
                onChange={(value) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, from: value }));
                }}
                value={filters.from}
              />
              <DateFilter
                label="Nộp đến"
                onChange={(value) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, to: value }));
                }}
                value={filters.to}
              />
            </div>
          ) : null}
        </section>
        {actionMutation.isError ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(actionMutation.error, "Không thể cập nhật yêu cầu nghỉ phép.")}</p> : null}
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-sm font-semibold text-[#444748]">
                <tr>
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4">Chi nhánh</th>
                  <th className="px-6 py-4">Ca nghỉ</th>
                  <th className="px-6 py-4">Lý do</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {leaveRequestsQuery.isLoading || branchesQuery.isLoading || employeesQuery.isLoading ? (
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-[#444748]" colSpan={6}>
                      Đang tải yêu cầu nghỉ phép...
                    </td>
                  </tr>
                ) : leaveRequestsQuery.isError ? (
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-[#93000a]" colSpan={6}>
                      {getApiErrorMessage(leaveRequestsQuery.error, "Không thể tải yêu cầu nghỉ phép.")}
                    </td>
                  </tr>
                ) : visibleRequests.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-[#444748]" colSpan={6}>
                      Không có yêu cầu nghỉ phép nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  visibleRequests.map((request) => (
                    <LeaveRow
                      key={request.id}
                      employeeName={request.employeeName ?? employeeById.get(request.employeeId)?.fullName ?? request.employeeId}
                      branchName={request.branchName ?? request.schedule?.branchName ?? branchById.get(request.branchId)?.name ?? request.branchId}
                      onApprove={() => actionMutation.mutate({ action: "approve", id: request.id })}
                      onReject={() => actionMutation.mutate({ action: "reject", id: request.id })}
                      pending={actionMutation.isPending}
                      request={request}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
            <p className="text-xs text-[#444748]">
              Đang hiển thị {visibleRequests.length} trong {leaveRequestsQuery.data?.meta.total ?? 0} yêu cầu
            </p>
            <div className="flex gap-2">
              <button className="rounded-lg border border-[#e5e7eb] p-1.5 opacity-50" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {[page].map((currentPage) => (
                <button className="rounded-lg bg-black px-3 py-1 text-sm font-semibold text-white" key={currentPage}>
                  {currentPage}
                </button>
              ))}
              <button
                className="rounded-lg border border-[#e5e7eb] p-1.5 hover:bg-white"
                disabled={!leaveRequestsQuery.data || page >= leaveRequestsQuery.data.meta.totalPages}
                onClick={() => setPage((value) => value + 1)}
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </RequestShell>
  );
};

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canSendNotifications = user?.role === "owner" || user?.role === "manager";
  const [tab, setTab] = useState<NotificationTab>("all");
  const [recipientMode, setRecipientMode] = useState<NotificationRecipientMode>("all_staff");
  const [branchId, setBranchId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [type, setType] = useState<NotificationType>("system");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const query = useMemo<NotificationListQuery>(() => ({
    page: 1,
    limit: 50,
    ...(tab === "unread" ? { isRead: false } : {}),
    ...(tab === "requests" ? { type: "shift_swap_requested" as NotificationType } : {}),
    ...(tab === "alerts" ? { type: "attendance_warning" as NotificationType } : {}),
    ...(tab === "schedule" ? { type: "schedule_published" as NotificationType } : {}),
    ...(tab === "system" ? { type: "system" as NotificationType } : {}),
  }), [tab]);
  const notificationsQuery = useQuery({
    queryKey: ["notifications", query],
    queryFn: () => notificationApi.list(query),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", { notificationCompose: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
    enabled: canSendNotifications,
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { notificationCompose: true }],
    queryFn: () => employeeApi.list({ limit: 100 }),
    enabled: canSendNotifications,
  });
  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markUnreadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsUnread(notificationId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const archiveMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.archive(notificationId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const createMutation = useMutation({
    mutationFn: () => {
      const staffIds = (employeesQuery.data?.data ?? [])
        .filter((employee) => employee.role !== "owner" && employee.role !== "admin" && employee.status === "active")
        .map((employee) => employee.id);
      const userIds = recipientMode === "all_staff" ? staffIds : selectedUserIds;

      return notificationApi.create({
        title: title.trim(),
        message: message.trim(),
        type,
        ...(recipientMode === "branch" ? { branchId } : { userIds }),
      });
    },
    onSuccess: () => {
      setTitle("");
      setMessage("");
      setSelectedUserIds([]);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const visible = notificationsQuery.data?.data ?? [];
  const employees = (employeesQuery.data?.data ?? []).filter((employee) => employee.role !== "owner" && employee.role !== "admin");
  const activeEmployeeCount = employees.filter((employee) => employee.status === "active").length;
  const selectedActiveRecipientCount =
    recipientMode === "branch"
      ? 0
      : recipientMode === "all_staff"
        ? activeEmployeeCount
        : employees.filter((employee) => selectedUserIds.includes(employee.id) && employee.status === "active").length;
  const canSubmit =
    canSendNotifications &&
    title.trim().length >= 3 &&
    message.trim().length >= 3 &&
    (recipientMode === "branch" ? Boolean(branchId) : selectedActiveRecipientCount > 0);
  const anyError =
    notificationsQuery.error ??
    markAllMutation.error ??
    markReadMutation.error ??
    markUnreadMutation.error ??
    archiveMutation.error ??
    employeesQuery.error ??
    branchesQuery.error ??
    createMutation.error;

  const applyTemplate = (template: (typeof notificationTemplates)[number]) => {
    setType(template.type);
    setTitle(template.title);
    setMessage(template.message);
  };

  const toggleRecipient = (employeeId: string) => {
    setSelectedUserIds((current) =>
      current.includes(employeeId) ? current.filter((id) => id !== employeeId) : [...current, employeeId]
    );
  };

  return (
    <RequestShell title="Thông báo" search="Tìm thông báo...">
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <PageTitle title="Thông báo" description="Quản lý cảnh báo hệ thống, đổi ca, nghỉ phép và nhắc chấm công." action={<button className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f3f2] disabled:opacity-50" disabled={markAllMutation.isPending} onClick={() => markAllMutation.mutate()} type="button">Đánh dấu tất cả đã đọc</button>} />
        {anyError ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(anyError, "Không thể xử lý thông báo.")}</p> : null}
        {createMutation.isSuccess ? <p className="rounded-lg bg-[#10b981]/10 px-4 py-3 text-sm font-semibold text-[#10b981]">Đã gửi {createMutation.data.total} thông báo đến nhân viên.</p> : null}
        {canSendNotifications ? (
          <section className="grid gap-4 rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <div>
                <p className="text-sm font-semibold text-black">Gửi thông báo cho nhân viên</p>
                <p className="text-xs text-[#444748]">Chọn người nhận, dùng mẫu nhanh hoặc nhập nội dung riêng.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {notificationTemplates.map((template) => (
                  <button className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-semibold text-[#444748] hover:border-black hover:text-black" key={template.label} onClick={() => applyTemplate(template)} type="button">
                    {template.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-black">Nhóm nhận</span>
                  <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setRecipientMode(event.target.value as NotificationRecipientMode)} value={recipientMode}>
                    <option value="all_staff">Tất cả nhân viên</option>
                    <option value="branch">Theo chi nhánh</option>
                    <option value="employees">Chọn từng nhân viên</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-black">Loại thông báo</span>
                  <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setType(event.target.value as NotificationType)} value={type}>
                    <option value="system">Thông báo chung</option>
                    <option value="schedule_published">Lịch làm</option>
                    <option value="shift_changed">Đổi lịch/đổi ca</option>
                    <option value="checkin_reminder">Nhắc check-in</option>
                    <option value="checkout_reminder">Nhắc check-out</option>
                    <option value="attendance_warning">Cảnh báo chấm công</option>
                  </select>
                </label>
              </div>
              {recipientMode === "branch" ? (
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-black">Chi nhánh</span>
                  <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
                    <option value="">Chọn chi nhánh...</option>
                    {(branchesQuery.data?.data ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                  </select>
                </label>
              ) : null}
              {recipientMode === "employees" ? (
                <div className="max-h-52 space-y-2 overflow-auto rounded-lg border border-[#e5e7eb] bg-white p-3">
                  {employees.length === 0 ? <p className="text-sm font-semibold text-[#444748]">Chưa có nhân viên trong phạm vi của bạn để gửi.</p> : null}
                  {employees.map((employee) => (
                    <label className={employee.status === "active" ? "flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-[#f7f3f2]" : "flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm opacity-60"} key={employee.id}>
                      <span>
                        <span className="block font-semibold text-black">{employee.fullName}</span>
                        <span className="text-xs text-[#444748]">{employee.email} - {employee.status === "active" ? "Tài khoản hoạt động" : "Tài khoản ngừng hoạt động"}</span>
                      </span>
                      <input checked={selectedUserIds.includes(employee.id)} className="h-4 w-4" disabled={employee.status !== "active"} onChange={() => toggleRecipient(employee.id)} type="checkbox" />
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="space-y-3 lg:col-span-7">
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-black">Tiêu đề</span>
                <input className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:ring-1 focus:ring-black" onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tiêu đề thông báo..." value={title} />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-black">Nội dung</span>
                <textarea className="min-h-32 w-full resize-none rounded-lg border border-[#e5e7eb] bg-white p-4 outline-none focus:ring-1 focus:ring-black" onChange={(event) => setMessage(event.target.value)} placeholder="Nhập nội dung cần gửi cho nhân viên..." value={message} />
              </label>
              <div className="flex flex-col justify-between gap-3 rounded-lg border border-[#e5e7eb] bg-white p-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#444748]">
                  <Users className="h-4 w-4" />
                  {recipientMode === "branch" ? "Gửi đến toàn bộ tài khoản hoạt động trong chi nhánh đã chọn" : `${selectedActiveRecipientCount} nhân viên có tài khoản hoạt động sẽ nhận thông báo`}
                </div>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" disabled={!canSubmit || createMutation.isPending} onClick={() => createMutation.mutate()} type="button">
                  <Send className="h-4 w-4" />{createMutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
                </button>
              </div>
            </div>
          </section>
        ) : null}
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="flex overflow-x-auto border-b border-[#e5e7eb] bg-[#f7f3f2] px-4">
            {[
              ["all", "Tất cả"],
              ["unread", `Chưa đọc${notificationsQuery.data ? ` (${notificationsQuery.data.meta.unreadCount})` : ""}`],
              ["requests", "Yêu cầu"],
              ["alerts", "Cảnh báo"],
              ["schedule", "Lịch làm"],
              ["system", "Hệ thống"],
            ].map(([value, label]) => (
              <button className={tab === value ? "border-b-2 border-black px-6 py-4 text-sm font-semibold text-black" : "border-b-2 border-transparent px-6 py-4 text-sm font-semibold text-[#444748] hover:text-black"} key={value} onClick={() => setTab(value as NotificationTab)} type="button">
                {label}
              </button>
            ))}
          </div>
          {notificationsQuery.isLoading ? (
            <div className="p-8 text-sm font-semibold text-[#444748]">Đang tải thông báo...</div>
          ) : visible.length === 0 ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f1edec]"><Bell className="h-16 w-16 text-black/20" /></div>
              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-black">Không còn gì mới!</h2>
              <p className="max-w-md text-base text-[#444748]">Hiện chưa có thông báo phù hợp bộ lọc. Khi có cập nhật lịch, đổi ca hoặc cảnh báo vận hành, thông báo sẽ xuất hiện ở đây.</p>
              <button className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white" onClick={() => setTab("all")} type="button">Xem tất cả thông báo</button>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {visible.map((item) => (
                <NotificationItem
                  item={item}
                  key={item.id}
                  onArchive={() => archiveMutation.mutate(item.id)}
                  onRead={() => markReadMutation.mutate(item.id)}
                  onUnread={() => markUnreadMutation.mutate(item.id)}
                  pending={markReadMutation.isPending || markUnreadMutation.isPending || archiveMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>
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
  const tone = status.includes("Chờ") ? "bg-amber-100 text-amber-800" : status === "Đã duyệt" ? "bg-green-100 text-green-800" : status === "Từ chối" || status === "Đã hủy" ? "bg-red-100 text-red-800" : "bg-[#f1edec] text-[#444748]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>;
};

const StaffSwapTab = ({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) => (
  <button
    className={active ? "inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" : "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]"}
    onClick={onClick}
    type="button"
  >
    {label}
    <span className={active ? "rounded-full bg-white/20 px-2 py-0.5 text-xs" : "rounded-full bg-[#f1edec] px-2 py-0.5 text-xs text-black"}>{count}</span>
  </button>
);

const SwapCard = ({
  currentUserId,
  currentUserRole,
  employeeById,
  onAction,
  onViewHistory,
  pending,
  request,
}: {
  currentUserId?: string;
  currentUserRole?: string;
  employeeById: Map<string, { fullName: string }>;
  onAction: (action: ShiftSwapAction) => void;
  onViewHistory: () => void;
  pending: boolean;
  request: ShiftSwapRequest;
}) => {
  const from = employeeById.get(request.fromEmployeeId)?.fullName ?? request.fromEmployeeId;
  const to = employeeById.get(request.toEmployeeId)?.fullName ?? request.toEmployeeId;
  const isRequester = request.fromEmployeeId === currentUserId;
  const isReceiver = request.toEmployeeId === currentUserId;
  const canReceiverReview = currentUserRole === "staff" && isReceiver && request.finalStatus === "pending_receiver";
  const canRequesterHủy = currentUserRole === "staff" && isRequester && ["pending_receiver", "pending_manager"].includes(request.finalStatus);
  const canManagerReview = currentUserRole !== "staff" && request.finalStatus === "pending_manager";

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-transparent bg-[#f5f5f5] p-6 transition hover:border-[#e5e7eb] hover:bg-white hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <AvatarPair a={from} b={to} />
          <div>
            <p className="text-sm font-bold">{from} <span className="font-normal text-[#444748]">đổi với</span> {to}</p>
            <p className="text-xs text-[#444748]">Mã yêu cầu: {request.id}</p>
          </div>
        </div>
        <StatusBadge status={toShiftSwapStatusLabel(request.finalStatus)} />
      </div>
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
        <Meta label="Ca yêu cầu" value={formatSwapSchedule(request.fromSchedule, request.fromScheduleId)} />
        <Meta label="Ca nhận" value={request.toSchedule ? formatSwapSchedule(request.toSchedule, request.toScheduleId) : "Phủ ca yêu cầu"} />
        <Meta label="Trạng thái người nhận" value={toReceiverStatusLabel(request.receiverStatus)} />
        <Meta label="Trạng thái quản lý" value={toManagerStatusLabel(request.managerStatus)} />
        <Meta label="Thời gian yêu cầu" value={formatDateTime(request.createdAt)} />
        <Meta label="Chi nhánh" value={request.fromSchedule?.branchName ?? request.branchName ?? request.fromSchedule?.branchId ?? request.branchId} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-[#444748]">Lý do</p>
        <p className="text-base italic text-black">"{request.reason || "Không có lý do."}"</p>
      </div>
      {request.note ? <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700"><b>Ghi chú:</b> {request.note}</div> : null}
      {canReceiverReview ? (
        <div className="mt-auto flex gap-2">
          <button className="flex-1 rounded-lg bg-black py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50" disabled={pending} onClick={() => onAction("accept")} type="button">Chấp nhận</button>
          <button className="flex-1 rounded-lg border border-[#e5e7eb] py-2 text-sm font-bold text-[#444748] hover:bg-[#f7f3f2] disabled:opacity-50" disabled={pending} onClick={() => onAction("rejectReceiver")} type="button">Từ chối</button>
        </div>
      ) : canManagerReview ? (
        <div className="mt-auto flex gap-2">
          <button className="flex-1 rounded-lg bg-black py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50" disabled={pending} onClick={() => onAction("approve")} type="button">Phê duyệt</button>
          <button className="flex-1 rounded-lg border border-[#e5e7eb] py-2 text-sm font-bold text-[#444748] hover:bg-[#f7f3f2] disabled:opacity-50" disabled={pending} onClick={() => onAction("rejectManager")} type="button">Từ chối</button>
        </div>
      ) : canRequesterHủy ? (
        <button className="mt-auto rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] py-2 text-sm font-bold text-[#444748] disabled:opacity-50" disabled={pending} onClick={() => onAction("cancel")} type="button">Hủy yêu cầu</button>
      ) : (
        <button className="mt-auto rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] py-2 text-sm font-bold text-[#444748]" onClick={onViewHistory} type="button">Xem lịch sử</button>
      )}
    </article>
  );
};

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

const FilterSelect = ({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[][]; value: string }) => (
  <select className="h-10 min-w-[150px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => onChange(event.target.value)} value={value}>
    <option value="">{label}</option>
    {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
  </select>
);

const DateFilter = ({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) => (
  <label className="grid gap-1 text-xs font-semibold text-[#444748]">
    {label}
    <input className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-black" onChange={(event) => onChange(event.target.value)} type="date" value={value} />
  </label>
);

const toShiftSwapStatusLabel = (status: ShiftSwapFinalStatus) => {
  if (status === "pending_receiver") return "Chờ người nhận";
  if (status === "pending_manager") return "Chờ quản lý";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  return "Đã hủy";
};

const toReceiverStatusLabel = (status: string) => {
  if (status === "pending") return "Chờ";
  if (status === "accepted") return "Đã nhận";
  if (status === "rejected") return "Từ chối";
  return status;
};
const toManagerStatusLabel = (status: string) => {
  if (status === "pending") return "Chờ";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  return status;
};
const formatDateTime = (value?: string) => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "--";
const endOfDateInput = (value: string) => `${value}T23:59:59.999`;
const formatSwapSchedule = (
  schedule: ShiftSwapRequest["fromSchedule"],
  fallbackId?: string
) => {
  if (!schedule) {
    return fallbackId ? `Ca ${fallbackId}` : "--";
  }

  const date = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(schedule.workDate));

  return `${date}, ${schedule.shiftStartTime} - ${schedule.shiftEndTime} (${toScheduleStatusLabel(schedule.status)})`;
};
const toScheduleStatusLabel = (status: string) =>
  status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .replace("Scheduled", "Đã xếp")
    .replace("Published", "Đã xuất bản");

const StatCard = ({ icon, label, tone, value }: { icon: ReactNode; label: string; tone?: "secondary"; value: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[#444748] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <span className={tone === "secondary" ? "text-xs text-[#0058be]" : "text-xs text-[#444748]"}>{label}</span>
    </div>
    <p className="text-2xl font-semibold text-black">{value}</p>
  </div>
);

const toLeaveRequestStatusLabel = (status: LeaveRequestStatus) => {
  if (status === "pending") return "Chờ duyệt";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  return "Đã hủy";
};

const formatLeaveSchedule = (request: LeaveRequest) => {
  if (!request.schedule) {
    return request.scheduleId ? `Ca ${request.scheduleId}` : "--";
  }

  const date = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(request.schedule.workDate));

  return `${date}, ${request.schedule.shiftStartTime} - ${request.schedule.shiftEndTime} (${toScheduleStatusLabel(request.schedule.status)})`;
};

const LeaveRow = ({
  branchName,
  employeeName,
  onApprove,
  onReject,
  pending,
  request,
}: {
  branchName: string;
  employeeName: string;
  onApprove: () => void;
  onReject: () => void;
  pending: boolean;
  request: LeaveRequest;
}) => (
  <tr className="group hover:bg-[#f7f3f2]">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f1edec] text-xs font-bold">
          {employeeName.split(" ").map((part) => part[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-semibold text-black">{employeeName}</p>
          <p className="text-xs text-[#444748]">Gửi lúc {formatDateTime(request.requestedAt)}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <p className="font-semibold text-black">{branchName}</p>
      {request.schedule?.branchName && request.schedule.branchName !== branchName ? <p className="text-xs text-[#444748]">{request.schedule.branchName}</p> : null}
    </td>
    <td className="px-6 py-4">
      <p className="font-semibold text-black">{formatLeaveSchedule(request)}</p>
      <p className="text-xs text-[#444748]">{request.schedule?.branchName ?? branchName}</p>
    </td>
    <td className="px-6 py-4">
      <p className="line-clamp-2 text-sm text-black">{request.reason}</p>
    </td>
    <td className="px-6 py-4">
      <StatusBadge status={toLeaveRequestStatusLabel(request.status)} />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
        {request.status === "pending" ? (
          <>
            <button className="rounded-lg p-2 text-[#10b981] hover:bg-green-50 disabled:opacity-50" disabled={pending} onClick={onApprove} type="button">
              <CheckCircle2 className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-[#ef4444] hover:bg-red-50 disabled:opacity-50" disabled={pending} onClick={onReject} type="button">
              <X className="h-5 w-5" />
            </button>
          </>
        ) : (
          <button className="rounded-lg p-2 text-[#444748] hover:bg-[#ebe7e6]">
            <Info className="h-5 w-5" />
          </button>
        )}
        <button className="rounded-lg p-2 text-[#444748] hover:bg-[#ebe7e6]"><MoreVertical className="h-5 w-5" /></button>
      </div>
    </td>
  </tr>
);

const NotificationItem = ({
  item,
  onArchive,
  onRead,
  onUnread,
  pending,
}: {
  item: Notification;
  onArchive: () => void;
  onRead: () => void;
  onUnread: () => void;
  pending: boolean;
}) => {
  const isRequest = item.type.includes("requested") || item.type.includes("leave_");
  const isAlert = item.type === "attendance_warning" || item.type === "system";
  const icon = isRequest ? <Repeat /> : isAlert ? <AlertTriangle /> : <BarChart3 />;
  const tone = isRequest ? "bg-[#0058be]/10 text-[#0058be]" : isAlert ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-[#f1edec] text-black";

  return (
    <div className="relative flex items-start gap-4 p-6 transition hover:bg-[#f7f3f2]">
      {!item.isRead ? <span className="absolute left-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-[#0058be]" /> : null}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tone}`}>{icon}</div>
      <div className="flex-1">
        <div className="mb-1 flex items-start justify-between gap-4">
          <h3 className="text-sm font-bold text-black">{item.title}</h3>
          <span className="shrink-0 text-xs text-[#444748]">{formatDateTime(item.createdAt)}</span>
        </div>
        <p className="mb-4 text-base text-[#444748]">{item.message}</p>
        <div className="flex flex-wrap gap-2">
          {!item.isRead ? (
            <button className="rounded-lg border border-[#e5e7eb] px-4 py-1.5 text-sm font-semibold hover:bg-white disabled:opacity-50" disabled={pending} onClick={onRead} type="button">Đánh dấu đã đọc</button>
          ) : (
            <button className="rounded-lg border border-[#e5e7eb] px-4 py-1.5 text-sm font-semibold hover:bg-white disabled:opacity-50" disabled={pending} onClick={onUnread} type="button">Đánh dấu chưa đọc</button>
          )}
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 py-1.5 text-sm font-semibold text-[#444748] hover:bg-white disabled:opacity-50" disabled={pending} onClick={onArchive} type="button">
            <Archive className="h-4 w-4" />Lưu trữ
          </button>
        </div>
      </div>
      {!item.isRead ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0058be]" /> : null}
    </div>
  );
};

const ShiftSwapModal = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const today = toDateInputValue(new Date());
  const inThirtyDays = toDateInputValue(addDays(new Date(), 30));
  const [fromScheduleId, setFromScheduleId] = useState("");
  const [toEmployeeId, setToEmployeeId] = useState("");
  const [toScheduleId, setToScheduleId] = useState("");
  const [swapMode, setSwapMode] = useState<"cover" | "swap">("cover");
  const [reason, setReason] = useState("");
  const schedulesQuery = useQuery({
    queryKey: ["schedules", "my", { shiftSwapCreate: true, today, inThirtyDays }],
    queryFn: () => scheduleApi.my({ from: today, to: inThirtyDays, published: true }),
    enabled: user?.role === "staff",
  });
  const futureMySchedules = (schedulesQuery.data?.data ?? []).filter(isSelectableSwapShift);
  const selectedSchedule = futureMySchedules.find((schedule) => schedule.id === fromScheduleId);
  const employeesQuery = useQuery({
    queryKey: ["employees", { shiftSwapCreate: true, branchId: selectedSchedule?.branchId }],
    queryFn: () =>
      employeeApi.list({
        limit: 100,
        role: "staff",
        status: "active",
        ...(selectedSchedule?.branchId ? { branchId: selectedSchedule.branchId } : {}),
      }),
    enabled: Boolean(selectedSchedule?.branchId),
  });
  const receiverSchedulesQuery = useQuery({
    queryKey: ["schedules", "weekly", { shiftSwapReceiver: true, toEmployeeId, workDate: selectedSchedule?.workDate }],
    queryFn: () =>
      scheduleApi.weekly({
        weekStart: toWeekStart(selectedSchedule?.workDate ?? today),
        employeeId: toEmployeeId,
        branchId: selectedSchedule?.branchId,
        published: true,
      }),
    enabled: Boolean(toEmployeeId && selectedSchedule?.branchId),
  });
  const createMutation = useMutation({
    mutationFn: () =>
      shiftSwapApi.create({
        fromScheduleId,
        toEmployeeId,
        ...(toScheduleId ? { toScheduleId } : {}),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shift-swaps"] });
      setFromScheduleId("");
      setToEmployeeId("");
      setToScheduleId("");
      setSwapMode("cover");
      setReason("");
    },
  });
  const colleagues = (employeesQuery.data?.data ?? []).filter((employee) => employee.id !== user?.id);
  const receiverSchedules = (receiverSchedulesQuery.data?.data ?? []).filter((schedule) => schedule.employeeId === toEmployeeId && isSelectableSwapShift(schedule));
  const coverHasOverlap = selectedSchedule ? hasAnyScheduleOverlap(selectedSchedule, receiverSchedules, []) : false;
  const selectedReceiverSchedule = receiverSchedules.find((schedule) => schedule.id === toScheduleId);
  const selectedSwapHasOverlap =
    selectedSchedule && selectedReceiverSchedule
      ? !isValidSwapTarget({
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

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
          <h2 className="text-2xl font-semibold tracking-tight text-black">Yêu cầu đổi ca</h2>
          <Link className="text-[#444748] hover:text-black" to="/dashboard/shift-swaps"><X className="h-5 w-5" /></Link>
        </div>
        <div className="space-y-6 p-6">
          {user?.role !== "staff" ? <p className="rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">Chỉ tài khoản nhân viên mới có thể tạo yêu cầu đổi ca.</p> : null}
          {createMutation.isSuccess ? <p className="rounded-lg bg-[#10b981]/10 p-3 text-sm font-semibold text-[#10b981]">Đã gửi yêu cầu đổi ca.</p> : null}
          {createMutation.isError ? <p className="rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(createMutation.error, "Không thể tạo yêu cầu đổi ca.")}</p> : null}
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-black">Chọn ca của bạn</span>
            <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:ring-1 focus:ring-black" onChange={(event) => { setFromScheduleId(event.target.value); setToEmployeeId(""); setToScheduleId(""); setSwapMode("cover"); }} value={fromScheduleId}>
              <option value="">Chọn ca sắp tới...</option>
              {futureMySchedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{formatShift(schedule.workDate, schedule.shiftStartTime, schedule.shiftEndTime)}</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-black">Chọn đồng nghiệp</span>
            <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:ring-1 focus:ring-black" disabled={!selectedSchedule} onChange={(event) => { setToEmployeeId(event.target.value); setToScheduleId(""); setSwapMode("cover"); }} value={toEmployeeId}>
              <option value="">Chọn đồng nghiệp...</option>
              {colleagues.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
            </select>
          </label>
          <section className="space-y-3 rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-4">
            <div>
              <p className="text-sm font-semibold text-black">Chế độ đổi</p>
              <p className="text-xs text-[#444748]">Chọn xem đồng nghiệp chỉ nhận ca của bạn hay đổi lại một ca của họ với bạn.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                className={swapMode === "cover" ? "rounded-lg border border-black bg-white px-3 py-3 text-left text-sm font-semibold text-black shadow-sm" : "rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 text-left text-sm font-semibold text-[#444748] hover:border-black/30"}
                disabled={!toEmployeeId || coverHasOverlap}
                onClick={() => { setSwapMode("cover"); setToScheduleId(""); }}
                type="button"
              >
                Chỉ phủ ca
                <span className="mt-1 block text-xs font-normal text-[#747878]">{coverHasOverlap ? "Không khả dụng vì đồng nghiệp này có ca bị trùng giờ." : "Đồng nghiệp sẽ nhận ca bạn đã chọn."}</span>
              </button>
              <button
                className={swapMode === "swap" ? "rounded-lg border border-black bg-white px-3 py-3 text-left text-sm font-semibold text-black shadow-sm" : "rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 text-left text-sm font-semibold text-[#444748] hover:border-black/30 disabled:opacity-50"}
                disabled={!toEmployeeId}
                onClick={() => setSwapMode("swap")}
                type="button"
              >
                Đổi với ca của đồng nghiệp
                <span className="mt-1 block text-xs font-normal text-[#747878]">Bạn sẽ nhận lại một ca của họ.</span>
              </button>
            </div>
            {swapMode === "swap" ? (
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-black">Ca của đồng nghiệp sẽ nhận</span>
                <select className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:ring-1 focus:ring-black" disabled={!toEmployeeId || receiverSchedulesQuery.isLoading || receiverSchedules.length === 0} onChange={(event) => setToScheduleId(event.target.value)} value={toScheduleId}>
                  <option value="">{receiverSchedulesQuery.isLoading ? "Đang tải ca của đồng nghiệp..." : "Chọn ca của đồng nghiệp..."}</option>
                  {receiverSchedules.map((schedule) => {
                    const conflictsAfterSwap =
                      selectedSchedule
                        ? !isValidSwapTarget({
                            actorSchedules: futureMySchedules,
                            fromSchedule: selectedSchedule,
                            receiverSchedules,
                            toSchedule: schedule,
                          })
                        : false;

                    return (
                      <option disabled={conflictsAfterSwap} key={schedule.id} value={schedule.id}>
                        {formatShift(schedule.workDate, schedule.shiftStartTime, schedule.shiftEndTime)}{conflictsAfterSwap ? " (trùng ca sau khi đổi)" : ""}
                      </option>
                    );
                  })}
                </select>
                {toEmployeeId && !receiverSchedulesQuery.isLoading && receiverSchedules.length === 0 ? <p className="text-xs font-semibold text-[#93000a]">Đồng nghiệp này không có ca đã công bố trong tuần đã chọn để đổi.</p> : null}
                {toEmployeeId && toScheduleId && selectedSwapHasOverlap ? <p className="text-xs font-semibold text-[#93000a]">Yêu cầu đổi ca này sẽ tạo ca trùng giờ sau khi đổi.</p> : null}
              </label>
            ) : null}
          </section>
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-black">Lý do đổi ca</span>
            <textarea className="min-h-28 w-full resize-none rounded-lg border border-[#e5e7eb] p-4 outline-none focus:ring-1 focus:ring-black" onChange={(event) => setReason(event.target.value)} placeholder="Nhập ngắn gọn lý do yêu cầu..." value={reason} />
          </label>
          <div className="flex gap-3 rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-4">
            <Info className="h-5 w-5 text-[#0058be]" />
            <p className="text-xs leading-5 text-[#444748]">Người nhận sẽ nhận thông báo và phải chấp thuận trước khi yêu cầu được gửi lên quản lý phê duyệt cuối cùng.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e5e7eb] bg-white px-6 py-4">
          <Link className="rounded-lg px-5 py-2 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]" to="/dashboard/shift-swaps">Hủy</Link>
          <button className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" disabled={!fromScheduleId || !toEmployeeId || (swapMode === "cover" && coverHasOverlap) || (swapMode === "swap" && (!toScheduleId || selectedSwapHasOverlap)) || createMutation.isPending || user?.role !== "staff"} onClick={() => createMutation.mutate()} type="button">
            {createMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
};

const toDateInputValue = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getShiftInterval = (schedule: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">) => {
  const dayStart = new Date(`${toDateInputValue(schedule.workDate)}T00:00:00`).getTime();
  const startMinutes = timeToMinutes(schedule.shiftStartTime);
  const endMinutes = timeToMinutes(schedule.shiftEndTime);
  const endOffset = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

  return {
    start: dayStart + startMinutes * 60 * 1000,
    end: dayStart + endOffset * 60 * 1000,
  };
};

const isFutureAssignedShift = (schedule: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">) =>
  getShiftInterval(schedule).start >= Date.now();

const isSelectableSwapShift = (schedule: AssignedShift) =>
  isFutureAssignedShift(schedule) && ["scheduled", "swapped"].includes(schedule.status);

const schedulesOverlap = (
  first: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">,
  second: Pick<AssignedShift, "workDate" | "shiftStartTime" | "shiftEndTime">
) => {
  const firstInterval = getShiftInterval(first);
  const secondInterval = getShiftInterval(second);
  return firstInterval.start < secondInterval.end && secondInterval.start < firstInterval.end;
};

const hasAnyScheduleOverlap = (
  proposed: AssignedShift,
  schedules: AssignedShift[],
  excludeIds: string[]
) => schedules.some((schedule) => !excludeIds.includes(schedule.id) && schedulesOverlap(proposed, schedule));

const isValidSwapTarget = ({
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
  !schedulesOverlap(fromSchedule, toSchedule) &&
  !hasAnyScheduleOverlap(fromSchedule, receiverSchedules, [toSchedule.id]) &&
  !hasAnyScheduleOverlap(toSchedule, actorSchedules, [fromSchedule.id]);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toWeekStart = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return toDateInputValue(start);
};

const formatShift = (workDate: string, startTime: string, endTime: string) =>
  `${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(workDate))}: ${startTime} - ${endTime}`;

