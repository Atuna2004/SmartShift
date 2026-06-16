import {
  AlertTriangle,
  ArrowLeft,
  Badge,
  Bell,
  CalendarX,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  Filter,
  Grid3X3,
  List,
  MapPin,
  MoreVertical,
  Plus,
  Repeat,
  Search,
  Store,
  TrendingUp,
  UserCheck,
  UserMinus,
  UsersRound,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { branchApi } from "@/features/employeeBranch/branch.api";
import type { Branch, BranchStatus } from "@/features/employeeBranch/branch.types";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import type { EditableEmployeeRole, Employee, EmployeeRole, EmployeeStatus, EmployeeType } from "@/features/employeeBranch/employee.types";
import { getApiErrorMessage } from "@/shared/api";
import { useAuthStore } from "@/store";

const colors = {
  blue: "#0058be",
  border: "#e5e7eb",
  card: "#f5f5f5",
  container: "#f1edec",
  low: "#f7f3f2",
  muted: "#444748",
  success: "#10b981",
  error: "#ef4444",
};

const branchPhotos = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB91eGT71w3cE0MMjyUztefC1iVNXPHCAVUVWr1lamQsFCDUoQucRA5WVnaCDespI9peUQM6N1xyoEwgJbRQ323o05HvUrCsmvZgbP5pimBA44Oa3mG0F_vl0x7-MoU1ct9-SwJwOxbeE9mDcOS2rU_lPe2_GIU3MngfkjlbPexJ9XASAg21kgoywyFGNnp7LPIQmBoFJo_FD6RFIjhvLv-g761vpY5kbafmsHsUWmUSo_bOeYSgkwshrLKQDzt4Art8J5bsN3sc1rs",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQFht8xIXIRL2o2QvW6mmnZW-FMJYRBiurTSM8faQmA5aIt_tzEEXlA8neH7eQP-V1z2ACVLPJaSeRwl6GtKBZXQ4oui7Inh39mZvXCSe68WsFAXs-RSU-nBzmZvSGbacAuCl7G-CKq-nKZ8jBNPRr2jSWTYxl9jXxwPs396SfttvmarDbZOJBxFPORn2aVDrccsEI3jsB4Iymoqy_7STq6yiX_bbhyB_F5-aUu8UbzqyXYlEXnopEbbvs0xgr9iKJ0hmCg-R33ywj",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBfr-pKeV4u4T-63MXiTMDY5BtrJ7wdnjzzfEAfHyZI-HsxTiJWNeZgGEhem-jsOEGhlcX1L9DrCMT2qg1DcL5BfwH1-YN9a17xXxARq_lLKDECMpVpQLqA984PY4bpqK1QjocPQOV38YiPPGSNgcHFdgCKludKkfEs5xTf_l9EaMAC1svF-29NZ8-H9sym6-P6cC_Vo_jWG5ugeCpozF-2uGt3DgidPEF0MHvsVNHAyyMrl1Udx-v_B9b2CptafZUg0Jjnc0gWhh8t",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAOFcffqZjgEL63j4xlJ-FD3fgrAOLZHKGCsSROEPxPcO9o7iiQuk8iWwi_2s9_uzvOh-nVjkcr56C1wBUg8T86iBf-2Prmip3m7X7JZdN_teESrSrzbr1UMTmoAyYe8KhGB7roEf3iygNNqQNvlFgc7wTmO7cBfV3_xYEPlLCSbBspeFrzzINOkAt6oxzHHS6lar365ST2wvcCmApg3tO-dUL6axuCbDtYDjjBJK7xBM6eTpEHwvk2nU8pVxYNwpsIinmsQbfHjmfF",
];

export const EmployeeListPage = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<EditableEmployeeRole | "all">("all");
  const [status, setStatus] = useState<EmployeeStatus | "all">("all");
  const [branchId, setBranchId] = useState("all");
  const employeesQuery = useQuery({
    queryKey: ["employees", { branchId, role, search, status }],
    queryFn: () =>
      employeeApi.list({
        limit: 50,
        ...(search ? { search } : {}),
        ...(role !== "all" ? { role } : {}),
        ...(status !== "all" ? { status } : {}),
        ...(branchId !== "all" ? { branchId } : {}),
      }),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", { employeeFilter: true }],
    queryFn: () => branchApi.list({ limit: 100 }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ employeeId, nextStatus }: { employeeId: string; nextStatus: EmployeeStatus }) =>
      employeeApi.setStatus(employeeId, nextStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
  const employeeList = (employeesQuery.data?.data ?? []).filter((employee) => employee.role !== "owner");
  const branchesById = useMemo(
    () => new Map((branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch.name])),
    [branchesQuery.data?.data]
  );

  return (
    <ShellTopBar
      action={
        <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90" to="/dashboard/employees/new">
          <Plus className="h-5 w-5" />
          Thêm nhân viên
        </Link>
      }
      searchPlaceholder="Tìm theo tên, email, số điện thoại hoặc mã..."
      searchValue={search}
      onSearchChange={setSearch}
      title="Nhân viên"
    >
      <section className="p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => setRole(event.target.value as EditableEmployeeRole | "all")} value={role}>
              <option value="all">Tất cả vai trò</option>
              <option value="manager">Quản lý</option>
              <option value="staff">Nhân viên</option>
            </select>
            <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => setStatus(event.target.value as EmployeeStatus | "all")} value={status}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
            <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
              <option value="all">Tất cả chi nhánh</option>
              {(branchesQuery.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex w-fit items-center rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] p-1">
            <button className="flex h-8 w-8 items-center justify-center rounded bg-white text-black shadow-sm"><List className="h-4 w-4" /></button>
            <button className="flex h-8 w-8 items-center justify-center text-[#444748]"><Grid3X3 className="h-4 w-4" /></button>
          </div>
        </div>
        {employeesQuery.isLoading ? (
          <StatePanel title="Đang tải nhân viên..." description="Đang lấy danh sách nhân viên từ API." />
        ) : employeesQuery.isError ? (
          <StatePanel title="Không thể tải nhân viên" description={getApiErrorMessage(employeesQuery.error, "Vui lòng thử lại sau.")} />
        ) : employeeList.length === 0 ? (
          <StatePanel title="Không tìm thấy nhân viên" description="Hãy thêm nhân viên mới hoặc điều chỉnh bộ lọc hiện tại." />
        ) : (
            <EmployeeTable
              branchesById={branchesById}
              currentUserId={currentUser?.id}
              employees={employeeList}
              isUpdating={statusMutation.isPending}
            onToggleStatus={(employee) =>
              statusMutation.mutate({
                employeeId: employee.id,
                nextStatus: employee.status === "active" ? "inactive" : "active",
              })
            }
          />
        )}
        <EmployeeStatsGrid employees={employeeList} total={employeeList.length} />
      </section>
    </ShellTopBar>
  );
};

export const EmployeeCreatePage = () => (
  <EmployeeListPageWithModal>
    <EmployeeCreateModal />
  </EmployeeListPageWithModal>
);

export const EmployeeDetailsPage = () => {
  const { employeeId } = useParams();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const employeeQuery = useQuery({
    enabled: Boolean(employeeId),
    queryKey: ["employee", employeeId],
    queryFn: () => employeeApi.detail(employeeId as string),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", { employeeDetail: true }],
    queryFn: () => branchApi.list({ limit: 100 }),
  });
  const branchesById = useMemo(
    () => new Map((branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch.name])),
    [branchesQuery.data?.data]
  );

  if (!employeeId) {
    return <Navigate replace to="/dashboard/employees" />;
  }

  return (
    <DetailFrame employeeName={employeeQuery.data?.fullName}>
      <section className="p-6">
        {employeeQuery.isLoading ? (
          <StatePanel title="Đang tải nhân viên..." description="Đang lấy hồ sơ nhân viên từ API." />
        ) : employeeQuery.isError ? (
          <StatePanel title="Không thể tải nhân viên" description={getApiErrorMessage(employeeQuery.error, "Vui lòng thử lại sau.")} />
        ) : employeeQuery.data ? (
          <>
            <EmployeeProfileHeader
              branchName={employeeQuery.data.branchId ? branchesById.get(employeeQuery.data.branchId) : undefined}
              currentUserId={currentUser?.id}
              employee={employeeQuery.data}
              onEdit={() => setIsEditing(true)}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-4">
                <Panel title="Trạng thái tài khoản" icon={<TrendingUp />}>
                  <KpiLine label="Trạng thái" value={toEmployeeStatusLabel(employeeQuery.data.status)} icon={<CheckCircle2 />} tone="success" />
                  <KpiLine label="Vai trò" value={toEmployeeRoleLabel(employeeQuery.data.role)} icon={<Badge />} tone="blue" />
                </Panel>
              </div>
              <div className="lg:col-span-5">
                <EmployeeInfoPanel employee={employeeQuery.data} branchName={employeeQuery.data.branchId ? branchesById.get(employeeQuery.data.branchId) : undefined} />
              </div>
              <div className="lg:col-span-3">
                <RecentActivityPanel />
              </div>
            </div>
          </>
        ) : null}
      </section>
      {isEditing && employeeQuery.data ? (
        <EmployeeEditModal
          branches={branchesQuery.data?.data ?? []}
          employee={employeeQuery.data}
          onClose={() => setIsEditing(false)}
          onSaved={() => {
            setIsEditing(false);
            void queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
            void queryClient.invalidateQueries({ queryKey: ["employees"] });
          }}
        />
      ) : null}
    </DetailFrame>
  );
};

export const EmployeeDeactivatePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const employeeQuery = useQuery({
    enabled: Boolean(employeeId),
    queryKey: ["employee", employeeId],
    queryFn: () => employeeApi.detail(employeeId as string),
  });
  const deactivateMutation = useMutation({
    mutationFn: () => employeeApi.setStatus(employeeId as string, "inactive"),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["employee", employeeId] }),
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
      ]);
      navigate(`/dashboard/employees/${employeeId}`, { replace: true });
    },
  });

  if (!employeeId) {
    return <Navigate replace to="/dashboard/employees" />;
  }

  if (employeeId === currentUser?.id) {
    return <Navigate replace to={`/dashboard/employees/${employeeId}`} />;
  }

  return (
    <EmployeeDetailsPageWithModal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-2xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ef4444]/10 text-[#ef4444]">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="mb-2 text-2xl font-semibold tracking-tight text-black">Ngừng kích hoạt nhân viên</h3>
          <p className="mb-8 text-base leading-6 text-[#444748]">
            Bạn có chắc muốn ngừng kích hoạt {employeeQuery.data?.fullName ?? "nhân viên này"} không? Thao tác này sẽ thu hồi quyền truy cập SmartShift.
          </p>
          {deactivateMutation.isError ? (
            <p className="mb-4 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">
              {getApiErrorMessage(deactivateMutation.error, "Không thể ngừng kích hoạt nhân viên.")}
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <Link className="rounded-lg px-4 py-2 text-center text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]" to={`/dashboard/employees/${employeeId}`}>Hủy</Link>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              disabled={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate()}
              type="button"
            >
              <UserMinus className="h-4 w-4" />
              {deactivateMutation.isPending ? "Đang ngừng kích hoạt..." : "Ngừng kích hoạt"}
            </button>
          </div>
        </div>
      </div>
    </EmployeeDetailsPageWithModal>
  );
};

export const BranchManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BranchStatus | "all">("all");
  const branchesQuery = useQuery({
    queryKey: ["branches", { search, status }],
    queryFn: () =>
      branchApi.list({
        limit: 50,
        ...(search ? { search } : {}),
        ...(status !== "all" ? { status } : {}),
      }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ branchId, nextStatus }: { branchId: string; nextStatus: BranchStatus }) =>
      branchApi.setStatus(branchId, nextStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });

  const branchList = branchesQuery.data?.data ?? [];
  const activeCount = branchList.filter((branch) => branch.status === "active").length;
  const disabledCount = branchList.filter((branch) => branch.status === "disabled").length;

  return (
    <BranchFrame search={search} onSearchChange={setSearch}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-black">Chi nhánh</h2>
            <p className="text-base text-[#444748]">Quản lý thông tin chi nhánh, thiết lập vận hành và chính sách chấm công.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-black"
              onChange={(event) => setStatus(event.target.value as BranchStatus | "all")}
              value={status}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="disabled">Vô hiệu</option>
            </select>
            <Link className="inline-flex h-10 items-center gap-1 rounded-lg bg-black px-4 text-sm font-semibold text-white shadow-sm hover:opacity-90" to="/dashboard/branches/new"><Plus className="h-4 w-4" />Thêm chi nhánh</Link>
          </div>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard icon={<Store />} label="Tổng chi nhánh" value={String(branchesQuery.data?.meta.total ?? branchList.length)} />
          <StatCard icon={<CheckCircle2 />} label="Chi nhánh hoạt động" value={String(activeCount)} meta="TRỰC TIẾP" />
          <StatCard icon={<AlertTriangle />} label="Chi nhánh vô hiệu" value={String(disabledCount)} />
          <StatCard icon={<Badge />} label="Trang hiện tại" value={`${branchesQuery.data?.meta.page ?? 1}/${branchesQuery.data?.meta.totalPages ?? 1}`} />
        </div>
        {branchesQuery.isLoading ? (
          <StatePanel title="Đang tải chi nhánh..." description="Đang lấy dữ liệu chi nhánh từ API." />
        ) : branchesQuery.isError ? (
          <StatePanel title="Không thể tải chi nhánh" description={getApiErrorMessage(branchesQuery.error, "Vui lòng thử lại sau.")} />
        ) : branchList.length === 0 ? (
          <StatePanel title="Không tìm thấy chi nhánh" description="Hãy tạo chi nhánh đầu tiên hoặc điều chỉnh bộ lọc hiện tại." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {branchList.map((branch, index) => (
              <BranchCard
                branch={branch}
                index={index}
                isUpdating={statusMutation.isPending}
                key={branch.id}
                onToggleStatus={() =>
                  statusMutation.mutate({
                    branchId: branch.id,
                    nextStatus: branch.status === "active" ? "disabled" : "active",
                  })
                }
              />
            ))}
            <Link
              className="group flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#f7f3f2] p-8 text-center transition duration-300 hover:border-black hover:bg-[#f1edec]"
              to="/dashboard/branches/new"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e5e7eb] bg-white transition group-hover:scale-110">
                <Plus className="h-8 w-8 text-[#444748] group-hover:text-black" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Đăng ký chi nhánh mới</p>
                <p className="text-xs text-[#444748]">Mở rộng hệ thống chi nhánh</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </BranchFrame>
  );
};

export const BranchCreatePage = () => (
  <BranchManagementPageWithModal>
    <BranchCreateModal />
  </BranchManagementPageWithModal>
);

export const BranchSettingsPage = () => {
  const { branchId } = useParams();
  const branchesQuery = useQuery({
    enabled: !branchId,
    queryKey: ["branches", { first: true }],
    queryFn: () => branchApi.list({ limit: 1 }),
  });
  const resolvedBranchId = branchId ?? branchesQuery.data?.data[0]?.id;

  if (!branchId && branchesQuery.isLoading) {
    return (
      <ShellTopBar breadcrumbs={["Cài đặt", "Cấu hình chi nhánh"]}>
        <main className="min-h-screen bg-white p-6">
          <StatePanel title="Đang tải cài đặt chi nhánh..." description="Đang tìm chi nhánh mặc định của bạn." />
        </main>
      </ShellTopBar>
    );
  }

  if (!resolvedBranchId) {
    return (
      <ShellTopBar breadcrumbs={["Cài đặt", "Cấu hình chi nhánh"]}>
        <main className="min-h-screen bg-white p-6">
          <StatePanel title="Chưa có chi nhánh" description="Hãy tạo chi nhánh trước khi cấu hình cài đặt chi nhánh." />
        </main>
      </ShellTopBar>
    );
  }

  if (!branchId) {
    return <Navigate replace to={`/dashboard/branches/${resolvedBranchId}/settings`} />;
  }

  return <BranchSettingsForm branchId={resolvedBranchId} />;
};

const EmployeeListPageWithModal = ({ children }: { children: ReactNode }) => <><EmployeeListPage />{children}</>;
const EmployeeDetailsPageWithModal = ({ children }: { children: ReactNode }) => <><EmployeeDetailsPage />{children}</>;
const BranchManagementPageWithModal = ({ children }: { children: ReactNode }) => <><BranchManagementPage />{children}</>;

const ShellTopBar = ({
  action,
  breadcrumbs,
  children,
  onSearchChange,
  searchPlaceholder,
  searchValue,
  title,
}: {
  action?: ReactNode;
  breadcrumbs?: string[];
  children: ReactNode;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  title?: string;
}) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-14 z-40 flex min-h-16 flex-col gap-3 border-b border-[#e5e7eb] bg-white px-4 py-3 shadow-sm md:top-0 md:h-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
        {title ? <h2 className="min-w-0 truncate text-xl font-semibold tracking-tight text-black md:shrink-0 md:text-2xl">{title}</h2> : null}
        {breadcrumbs ? <div className="flex min-w-0 items-center gap-2 truncate text-sm md:text-base"><b className="truncate">{breadcrumbs[0]}</b><span className="text-[#444748]">/</span><span className="truncate text-[#444748]">{breadcrumbs[1]}</span></div> : null}
        {searchPlaceholder ? (
          <div className="relative hidden w-96 lg:block">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
            <input
              className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 outline-none focus:ring-1 focus:ring-black"
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
            />
          </div>
        ) : null}
      </div>
      <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end md:gap-4">
        <button className="text-[#444748] hover:text-black"><Bell className="h-5 w-5" /></button>
        {action ? <><span className="hidden h-8 w-px bg-[#e5e7eb] md:block" />{action}</> : null}
      </div>
    </header>
    {children}
  </div>
);

const DetailFrame = ({ children, employeeName = "Nhân viên" }: { children: ReactNode; employeeName?: string }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-14 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 shadow-sm md:top-0 md:px-6">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <Link className="rounded-full p-2 hover:bg-[#f1edec]" to="/dashboard/employees"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold"><span className="text-[#444748]">Nhân viên</span><span className="text-[#c4c7c7]">/</span><b className="truncate">{employeeName}</b></div>
      </div>
      <Bell className="h-5 w-5 text-[#444748]" />
    </header>
    {children}
  </div>
);

const BranchFrame = ({
  children,
  onSearchChange,
  search,
}: {
  children: ReactNode;
  onSearchChange?: (value: string) => void;
  search?: string;
}) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-14 z-40 flex min-h-16 flex-col gap-3 border-b border-[#e5e7eb] bg-white px-4 py-3 shadow-sm md:top-0 md:h-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747878]" />
        <input
          className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] pl-10 pr-4 outline-none focus:ring-2 focus:ring-black"
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Tìm chi nhánh..."
          value={search ?? ""}
        />
      </div>
      <div className="flex w-full items-center justify-end gap-4 md:w-auto">
        <div className="hidden text-right md:block"><p className="text-sm font-semibold">Trung tâm Main St.</p><p className="text-xs text-[#444748]">Chuyển chi nhánh</p></div>
        <Bell className="h-5 w-5 text-[#444748]" />
      </div>
    </header>
    <main className="p-6">{children}</main>
  </div>
);

const EmployeeTable = ({
  branchesById,
  currentUserId,
  employees,
  isUpdating,
  onToggleStatus,
}: {
  branchesById: Map<string, string>;
  currentUserId?: string;
  employees: Employee[];
  isUpdating: boolean;
  onToggleStatus: (employee: Employee) => void;
}) => (
  <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-sm font-semibold text-[#444748]">
          <tr><th className="px-6 py-4">Ảnh & tên</th><th className="px-6 py-4">Vai trò</th><th className="px-6 py-4">Chi nhánh</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {employees.map((employee, index) => (
            <EmployeeRow
              branchName={employee.branchId ? branchesById.get(employee.branchId) : undefined}
              currentUserId={currentUserId}
              employee={employee}
              index={index}
              isUpdating={isUpdating}
              key={employee.id}
              onToggleStatus={() => onToggleStatus(employee)}
            />
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-6 py-4">
      <p className="text-xs text-[#444748]">Đang hiển thị {employees.length} nhân viên</p>
      <div className="flex items-center gap-1">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#444748] hover:bg-[#f5f5f5]">
          <ChevronRight className="h-4 w-4 rotate-180" />
        </button>
        {[1, 2, 3].map((page) => (
          <button className={page === 1 ? "flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" : "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-[#444748] hover:bg-[#f5f5f5]"} key={page}>
            {page}
          </button>
        ))}
        <span className="px-1 text-[#444748]">...</span>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-[#444748] hover:bg-[#f5f5f5]">9</button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#444748] hover:bg-[#f5f5f5]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

const EmployeeRow = ({
  branchName,
  currentUserId,
  employee,
  index,
  isUpdating,
  onToggleStatus,
}: {
  branchName?: string;
  currentUserId?: string;
  employee: Employee;
  index: number;
  isUpdating: boolean;
  onToggleStatus: () => void;
}) => (
  <tr className="hover:bg-[#fdf8f8]">
    <td className="px-6 py-4">
      <Link className="flex items-center gap-4" to={`/dashboard/employees/${employee.id}`}>
        {employee.avatar ? <img alt="" className="h-10 w-10 rounded-lg object-cover" src={employee.avatar} /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1edec] font-bold text-[#444748]">{getInitials(employee.fullName)}</div>}
        <div><p className="text-sm font-semibold text-black">{employee.fullName}</p><p className="text-xs text-[#444748]">{employee.email}</p></div>
      </Link>
    </td>
    <td className="px-6 py-4 text-base">{toEmployeeRoleLabel(employee.role)}</td>
    <td className="px-6 py-4 text-base">{branchName ?? "Chưa gán"}</td>
    <td className="px-6 py-4"><StatusBadge status={toEmployeeStatusLabel(employee.status)} /></td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        {employee.id === currentUserId ? (
          <span className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold text-[#747878]">Current user</span>
        ) : (
          <button
            className={employee.status === "active" ? "rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold text-[#ef4444] hover:bg-[#ef4444]/10" : "rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold text-[#10b981] hover:bg-[#10b981]/10"}
            disabled={isUpdating}
            onClick={onToggleStatus}
            type="button"
          >
            {employee.status === "active" ? "Ngừng kích hoạt" : "Kích hoạt"}
          </button>
        )}
        <Link className="rounded-lg p-2 text-[#444748] hover:bg-[#f1edec]" to={`/dashboard/employees/${employee.id}`}>
          <MoreVertical className="h-5 w-5" />
        </Link>
      </div>
    </td>
  </tr>
);

const StatusBadge = ({ status }: { status: string }) => {
  const tone = status === "Đang hoạt động" ? "bg-[#10b981]/10 text-[#10b981]" : status === "Đang nghỉ phép" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#c4c7c7]/30 text-[#444748]";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
};

const EmployeeStatsGrid = ({ employees, total }: { employees: Employee[]; total: number }) => {
  const active = employees.filter((employee) => employee.status === "active").length;
  const managers = employees.filter((employee) => employee.role === "manager").length;
  const staff = employees.filter((employee) => employee.role === "staff").length;
  const inactive = employees.filter((employee) => employee.status === "inactive").length;

  return (
  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
    <EmployeeStat label="Tổng nhân viên" value={String(total)} />
    <EmployeeStat label="Tài khoản hoạt động" meta={`${active} đang hiển thị`} value={String(active)} trend />
    <EmployeeStat label="Quản lý / Nhân viên" value={`${managers}/${staff}`} />
    <EmployeeStat label="Tài khoản ngừng hoạt động" meta={inactive ? "Cần xem lại" : "Ổn"} metaTone={inactive ? "danger" : "success"} value={String(inactive)} />
  </div>
  );
};

const EmployeeStat = ({
  label,
  meta,
  metaTone = "success",
  progress,
  trend,
  value,
}: {
  label: string;
  meta?: string;
  metaTone?: "success" | "danger";
  progress?: boolean;
  trend?: boolean;
  value: string;
}) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
    <p className="text-sm font-semibold text-[#444748]">{label}</p>
    <div className="mt-2 flex items-end justify-between">
      <p className="text-[32px] font-black leading-none text-black">{value}</p>
      {progress ? (
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e5e7eb]">
          <div className="h-full w-full bg-black" />
        </div>
      ) : meta ? (
        <span className={`flex items-center gap-1 text-xs font-bold ${metaTone === "danger" ? "text-[#ef4444]" : "text-[#10b981]"}`}>
          {trend ? <TrendingUp className="h-4 w-4" /> : null}
          {meta}
        </span>
      ) : null}
    </div>
  </div>
);

const Modal = ({ children, closeTo, subtitle, title }: { children: ReactNode; closeTo: string; subtitle?: string; title: string }) => (
  <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-4">
    <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
      <div className="border-b border-[#e5e7eb] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold tracking-tight text-black">{title}</h3>
          <Link className="text-[#444748] hover:text-black" to={closeTo}><X className="h-5 w-5" /></Link>
        </div>
        {subtitle ? <p className="mt-1 text-base text-[#444748]">{subtitle}</p> : null}
      </div>
      <div className="min-h-0 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const ModalFooter = ({ cancelTo, primary }: { cancelTo: string; primary: string }) => (
  <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] bg-[#f7f3f2] p-4 sm:flex-row sm:justify-end sm:p-6">
    <Link className="h-11 rounded-lg px-6 py-3 text-center text-sm font-semibold text-[#444748] hover:bg-white hover:text-black" to={cancelTo}>Hủy</Link>
    <button className="h-11 rounded-lg bg-black px-8 text-sm font-semibold text-white shadow-sm hover:opacity-90">{primary}</button>
  </div>
);

const EmployeeCreateModal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<EditableEmployeeRole>("staff");
  const [employeeType, setEmployeeType] = useState<EmployeeType>("full_time");
  const [branchId, setBranchId] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [error, setError] = useState("");
  const branchesQuery = useQuery({
    queryKey: ["branches", { employeeCreate: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const createMutation = useMutation({
    mutationFn: () =>
      employeeApi.create({
        fullName,
        email,
        password,
        role,
        employeeType,
        ...(phone ? { phone } : {}),
        ...(branchId ? { branchId } : {}),
        ...(employeeCode ? { employeeCode } : {}),
        ...(joinDate ? { joinDate } : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      navigate("/dashboard/employees", { replace: true });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể tạo nhân viên.")),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    createMutation.mutate();
  };

  const branchRequired = role === "staff";

  return (
    <Modal title="Tạo nhân viên mới" subtitle="Nhập thông tin để thêm thành viên mới vào đội ngũ." closeTo="/dashboard/employees">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-6">
          <InputField label="Họ và tên" onChange={setFullName} placeholder="Ví dụ: Nguyễn Văn An" required value={fullName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Email" onChange={setEmail} placeholder="john@company.com" required type="email" value={email} />
            <InputField label="Mật khẩu tạm thời" onChange={setPassword} placeholder="Tối thiểu 8 ký tự" required type="password" value={password} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Số điện thoại" onChange={setPhone} placeholder="+84 900 000 000" value={phone} />
            <InputField label="Mã nhân viên" onChange={setEmployeeCode} placeholder="EMP-001" value={employeeCode} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectControl label="Vai trò" onChange={(value) => setRole(value as EditableEmployeeRole)} value={role}>
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
            </SelectControl>
            <SelectControl label="Loại nhân viên" onChange={(value) => setEmployeeType(value as EmployeeType)} value={employeeType}>
              <option value="full_time">Toàn thời gian</option>
              <option value="part_time">Bán thời gian</option>
            </SelectControl>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectControl label={branchRequired ? "Chi nhánh" : "Chi nhánh được gán"} onChange={setBranchId} required={branchRequired} value={branchId}>
              <option value="">{branchRequired ? "Chọn chi nhánh" : "Chưa gán"}</option>
              {(branchesQuery.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </SelectControl>
            <InputField label="Ngày vào làm" onChange={setJoinDate} type="date" value={joinDate} />
          </div>
          {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] bg-[#f7f3f2] p-4 sm:flex-row sm:justify-end sm:p-6">
          <Link className="h-11 rounded-lg px-6 py-3 text-center text-sm font-semibold text-[#444748] hover:bg-white hover:text-black" to="/dashboard/employees">Hủy</Link>
          <button className="h-11 rounded-lg bg-black px-8 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50" disabled={createMutation.isPending} type="submit">
            {createMutation.isPending ? "Đang thêm..." : "Thêm nhân viên"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const BranchCreateModal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("18:00");
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(15);
  const [error, setError] = useState("");
  const createMutation = useMutation({
    mutationFn: () =>
      branchApi.create({
        name,
        ...(code ? { code } : {}),
        ...(address ? { address } : {}),
        ...(phone ? { phone } : {}),
        settings: {
          timezone,
          openingTime,
          closingTime,
          requireCheckout: true,
        },
        qrSettings: {
          enabled: true,
          requireGps: false,
          refreshIntervalSeconds: 60,
          qrExpiresInSeconds: 120,
        },
        attendanceSettings: {
          lateThresholdMinutes,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      navigate("/dashboard/branches", { replace: true });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể tạo chi nhánh.")),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    createMutation.mutate();
  };

  return (
    <Modal title="Đăng ký chi nhánh mới" closeTo="/dashboard/branches">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-6">
          <InputField label="Tên chi nhánh" onChange={setName} placeholder="Ví dụ: Chi nhánh chính Downtown" required value={name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Mã chi nhánh" onChange={setCode} placeholder="DOWNTOWN" value={code} />
            <InputField label="Số điện thoại" onChange={setPhone} placeholder="+84 900 000 000" value={phone} />
          </div>
          <InputField label="Địa chỉ" onChange={setAddress} placeholder="Nhập địa chỉ đầy đủ" value={address} />
          <div className="grid gap-4 sm:grid-cols-3">
            <InputField label="Múi giờ" onChange={setTimezone} required value={timezone} />
            <InputField label="Giờ mở cửa" onChange={setOpeningTime} required type="time" value={openingTime} />
            <InputField label="Giờ đóng cửa" onChange={setClosingTime} required type="time" value={closingTime} />
          </div>
          <InputField
            label="Số phút cho phép đi muộn"
            onChange={(value) => setLateThresholdMinutes(Number(value))}
            required
            type="number"
            value={String(lateThresholdMinutes)}
          />
          {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] bg-[#f7f3f2] p-4 sm:flex-row sm:justify-end sm:p-6">
          <Link className="h-11 rounded-lg px-6 py-3 text-center text-sm font-semibold text-[#444748] hover:bg-white hover:text-black" to="/dashboard/branches">Hủy</Link>
          <button
            className="h-11 rounded-lg bg-black px-8 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            disabled={createMutation.isPending}
            type="submit"
          >
            {createMutation.isPending ? "Đang đăng ký..." : "Đăng ký chi nhánh"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Field = ({ label, placeholder, type = "text", value }: { label: string; placeholder?: string; type?: string; value?: string }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
    <input className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 outline-none focus:border-black focus:ring-2 focus:ring-black/10" defaultValue={value} placeholder={placeholder} type={type} />
  </label>
);

const InputField = ({
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
    <input
      className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  </label>
);

const SelectControl = ({
  children,
  label,
  onChange,
  required,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
    <select
      className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
      onChange={(event) => onChange(event.target.value)}
      required={required}
      value={value}
    >
      {children}
    </select>
  </label>
);

const EmployeeProfileHeader = ({
  branchName,
  currentUserId,
  employee,
  onEdit,
}: {
  branchName?: string;
  currentUserId?: string;
  employee: Employee;
  onEdit: () => void;
}) => (
  <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
    <div className="flex items-start gap-6">
      <div className="relative">
        {employee.avatar ? (
          <img alt="" className="h-32 w-32 rounded-xl border border-[#e5e7eb] object-cover shadow-sm" src={employee.avatar} />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-[#e5e7eb] bg-[#f1edec] text-3xl font-black text-[#444748] shadow-sm">
            {getInitials(employee.fullName)}
          </div>
        )}
        <span className={employee.status === "active" ? "absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-[#10b981] shadow-sm" : "absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-[#c4c7c7] shadow-sm"} />
      </div>
      <div className="pt-2">
        <h1 className="mb-1 text-4xl font-semibold tracking-tight text-black">{employee.fullName}</h1>
        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-[#444748]">
          <span className="inline-flex items-center gap-1"><Badge className="h-4 w-4" />{toEmployeeRoleLabel(employee.role)}</span>
          <span className="h-1 w-1 rounded-full bg-[#c4c7c7]" />
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{branchName ?? "Chưa gán"}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={toEmployeeStatusLabel(employee.status)} />
          {employee.employeeCode ? <span className="text-xs text-[#444748]">ID: {employee.employeeCode}</span> : null}
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold text-black hover:bg-[#f7f3f2]" onClick={onEdit} type="button"><Edit3 className="h-4 w-4" />Chỉnh sửa hồ sơ</button>
      {employee.status === "active" && employee.id !== currentUserId ? (
        <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90" to={`/dashboard/employees/${employee.id}/deactivate`}><UserMinus className="h-4 w-4" />Ngừng kích hoạt</Link>
      ) : null}
    </div>
  </div>
);

const EmployeeInfoPanel = ({ branchName, employee }: { branchName?: string; employee: Employee }) => (
  <Panel title="Thông tin nhân viên" icon={<UserCheck />}>
    <InfoRow label="Email" value={employee.email} />
    <InfoRow label="Số điện thoại" value={employee.phone ?? "Chưa thiết lập"} />
    <InfoRow label="Chi nhánh" value={branchName ?? "Chưa gán"} />
    <InfoRow label="Loại nhân viên" value={employee.employeeType ? toEmployeeTypeLabel(employee.employeeType) : "Chưa thiết lập"} />
    <InfoRow label="Ngày vào làm" value={formatDate(employee.joinDate)} />
    <InfoRow label="Đăng nhập gần nhất" value={formatDate(employee.lastLoginAt)} />
  </Panel>
);

const EmployeeEditModal = ({
  branches,
  employee,
  onClose,
  onSaved,
}: {
  branches: Branch[];
  employee: Employee;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [fullName, setFullName] = useState(employee.fullName);
  const [phone, setPhone] = useState(employee.phone ?? "");
  const [role, setRole] = useState<EditableEmployeeRole>(employee.role === "manager" ? "manager" : "staff");
  const [employeeType, setEmployeeType] = useState<EmployeeType>(employee.employeeType ?? "full_time");
  const [branchId, setBranchId] = useState(employee.branchId ?? "");
  const [employeeCode, setEmployeeCode] = useState(employee.employeeCode ?? "");
  const [joinDate, setJoinDate] = useState(employee.joinDate ? employee.joinDate.slice(0, 10) : "");
  const [error, setError] = useState("");
  const updateMutation = useMutation({
    mutationFn: () =>
      employeeApi.update(employee.id, {
        fullName,
        role,
        employeeType,
        ...(phone ? { phone } : {}),
        ...(branchId ? { branchId } : {}),
        ...(employeeCode ? { employeeCode } : {}),
        ...(joinDate ? { joinDate } : {}),
      }),
    onSuccess: onSaved,
    onError: (err) => setError(getApiErrorMessage(err, "Không thể cập nhật nhân viên.")),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    updateMutation.mutate();
  };

  return (
    <Modal title="Chỉnh sửa nhân viên" closeTo={`/dashboard/employees/${employee.id}`}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-6">
          <InputField label="Họ và tên" onChange={setFullName} required value={fullName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Số điện thoại" onChange={setPhone} value={phone} />
            <InputField label="Mã nhân viên" onChange={setEmployeeCode} value={employeeCode} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectControl label="Vai trò" onChange={(value) => setRole(value as EditableEmployeeRole)} value={role}>
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
            </SelectControl>
            <SelectControl label="Loại nhân viên" onChange={(value) => setEmployeeType(value as EmployeeType)} value={employeeType}>
              <option value="full_time">Toàn thời gian</option>
              <option value="part_time">Bán thời gian</option>
            </SelectControl>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectControl label="Chi nhánh" onChange={setBranchId} required={role === "staff"} value={branchId}>
              <option value="">{role === "staff" ? "Chọn chi nhánh" : "Chưa gán"}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </SelectControl>
            <InputField label="Ngày vào làm" onChange={setJoinDate} type="date" value={joinDate} />
          </div>
          {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#e5e7eb] bg-[#f7f3f2] p-4 sm:flex-row sm:justify-end sm:p-6">
          <button className="h-11 rounded-lg px-6 py-3 text-sm font-semibold text-[#444748] hover:bg-white hover:text-black" onClick={onClose} type="button">Hủy</button>
          <button className="h-11 rounded-lg bg-black px-8 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50" disabled={updateMutation.isPending} type="submit">
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const toEmployeeRoleLabel = (role: EmployeeRole) => {
  if (role === "owner") return "Owner";
  if (role === "manager") return "Quản lý";
  return "Nhân viên";
};

const toEmployeeStatusLabel = (status: EmployeeStatus) => (status === "active" ? "Đang hoạt động" : "Ngừng hoạt động");
const toEmployeeTypeLabel = (type: EmployeeType) => (type === "full_time" ? "Toàn thời gian" : "Bán thời gian");

const formatDate = (value?: string) => {
  if (!value) return "Chưa thiết lập";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
};

const SelectField = ({ label, options }: { label: string; options: string[] }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
    <select className="h-11 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 outline-none focus:border-black focus:ring-2 focus:ring-black/10">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  </label>
);

const Panel = ({ action, children, icon, title }: { action?: ReactNode; children: ReactNode; icon?: ReactNode; title: string }) => (
  <section className="h-full rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
    <div className="mb-6 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-black">{icon}<span>{title}</span></h3>
      {action}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const KpiLine = ({ icon, label, tone, value }: { icon: ReactNode; label: string; tone: "success" | "blue"; value: string }) => (
  <div className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white p-4">
    <div><p className="mb-1 text-xs text-[#444748]">{label}</p><p className="text-2xl font-semibold">{value}</p></div>
    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone === "success" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#0058be]/10 text-[#0058be]"}`}>{icon}</div>
  </div>
);

const ShiftItem = ({ day, month, name, time }: { day: string; month: string; name: string; time: string }) => (
  <div className="flex gap-4 rounded-lg border border-[#e5e7eb] p-4 transition hover:border-[#747878]">
    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[#f1edec]"><b className="text-xs">{day}</b><span className="text-[10px] uppercase text-[#444748]">{month}</span></div>
    <div className="flex-1"><p className="text-sm font-semibold">{name}</p><p className="text-xs text-[#444748]">{time}</p></div>
    <span className="h-fit rounded bg-[#f1edec] px-2 py-1 text-[10px] font-bold text-[#444748]">Downtown</span>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => <div className="border-b border-[#e5e7eb] pb-3 last:border-0"><p className="text-xs text-[#444748]">{label}</p><p className="text-sm font-semibold">{value}</p></div>;

const RecentActivityPanel = () => (
  <section className="h-full rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
    <h3 className="mb-6 text-sm font-semibold text-black">Hoạt động gần đây</h3>
    <div className="relative space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-[#c4c7c7]">
      <ActivityNode icon={<UserCheck />} title="Đã check-in" time="Hôm nay, 15:58" detail="Xác thực qua QR: DT-Main-01" active />
      <ActivityNode icon={<CalendarX />} title="Yêu cầu nghỉ phép" time="Hôm qua, 14:15">
        <div className="mt-2 rounded border border-[#e5e7eb] bg-white p-2">
          <p className="text-[11px] font-bold uppercase text-[#10b981]">Đã duyệt</p>
          <p className="text-xs">12/06 - Nghỉ phép</p>
        </div>
      </ActivityNode>
      <ActivityNode icon={<Repeat />} title="Đã gửi đổi ca" time="21/05, 09:40" />
    </div>
  </section>
);

const ActivityNode = ({
  active,
  children,
  detail,
  icon,
  time,
  title,
}: {
  active?: boolean;
  children?: ReactNode;
  detail?: string;
  icon: ReactNode;
  time: string;
  title: string;
}) => (
  <div className="relative pl-10">
    <div className={`absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${active ? "border-black" : "border-[#e5e7eb]"} [&>svg]:h-3.5 [&>svg]:w-3.5`}>
      {icon}
    </div>
    <p className="text-sm font-semibold text-black">{title}</p>
    <p className="text-xs text-[#444748]">{time}</p>
    {detail ? <p className="mt-2 text-xs text-[#747878]">{detail}</p> : null}
    {children}
  </div>
);

const StatCard = ({ icon, label, meta, value }: { icon: ReactNode; label: string; meta?: string; value: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-black">{icon}</div>
      {meta ? <span className="rounded-full bg-[#10b981]/10 px-2 py-1 text-[10px] font-bold text-[#10b981]">{meta}</span> : null}
    </div>
    <p className="text-xs uppercase tracking-wider text-[#444748]">{label}</p>
    <h3 className="text-2xl font-black text-black">{value}</h3>
  </div>
);

const BranchCard = ({
  branch,
  index,
  isUpdating,
  onToggleStatus,
}: {
  branch: Branch;
  index: number;
  isUpdating: boolean;
  onToggleStatus: () => void;
}) => (
  <article className="group overflow-hidden rounded-xl border border-[#e5e7eb] bg-white transition hover:border-black">
    <div className="relative h-32 overflow-hidden bg-[#f1edec]">
      <img alt="" className="h-full w-full object-cover grayscale opacity-40 transition duration-700 group-hover:grayscale-0 group-hover:opacity-100" src={branchPhotos[index % branchPhotos.length]} />
      {branch.status === "disabled" ? (
        <span
          className="absolute right-4 top-4 rounded bg-[#ef4444]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-[#ef4444]"
        >
          Vô hiệu
        </span>
      ) : branch.code ? (
        <span className="absolute left-4 top-4 rounded bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-white">{branch.code}</span>
      ) : null}
      <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-white to-transparent" />
    </div>
    <div className="p-6 pt-0">
      <div className="mb-4 flex justify-between">
        <div><h4 className="text-sm font-bold">{branch.name}</h4><p className="flex items-center gap-1 text-xs text-[#444748]"><MapPin className="h-3 w-3" />{branch.address || "Chưa có địa chỉ"}</p></div>
        <button
          className="rounded-lg p-1 text-[#444748] hover:bg-[#f1edec] disabled:opacity-50"
          disabled={isUpdating}
          onClick={onToggleStatus}
          type="button"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 border-y border-[#e5e7eb] py-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-[#444748]">Số điện thoại</p>
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold">{branch.phone || "Chưa thiết lập"}</p>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-[#444748]">Chấm công QR</p>
          <p className={branch.qrSettings?.enabled ? "text-xs font-semibold text-[#10b981]" : "text-xs font-semibold text-[#444748]"}>{branch.qrSettings?.enabled ? "Bật" : "Tắt"}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          className={branch.status === "active" ? "rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold text-[#ef4444] hover:bg-[#ef4444]/10" : "rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold text-[#10b981] hover:bg-[#10b981]/10"}
          disabled={isUpdating}
          onClick={onToggleStatus}
          type="button"
        >
          {branch.status === "active" ? "Vô hiệu" : "Kích hoạt"}
        </button>
        <Link className="inline-flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:underline" to={`/dashboard/branches/${branch.id}/settings`}>Xem chi tiết <ChevronRight className="h-4 w-4" /></Link>
      </div>
    </div>
  </article>
);

const SettingsSection = ({ children, icon, title, toggle }: { children: ReactNode; icon: ReactNode; title: string; toggle?: boolean }) => (
  <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-8">
    <div className="mb-6 flex items-start justify-between">
      <h3 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-black">{icon}{title}</h3>
      {toggle ? <span className="relative h-6 w-12 rounded-full bg-black"><span className="absolute right-0 top-0 h-6 w-6 rounded-full border-4 border-black bg-white" /></span> : null}
    </div>
    {children}
  </section>
);

const BranchSettingsForm = ({ branchId }: { branchId: string }) => {
  const queryClient = useQueryClient();
  const branchQuery = useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => branchApi.detail(branchId),
  });
  const branch = branchQuery.data;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [qrEnabled, setQrEnabled] = useState(true);
  const [requireGps, setRequireGps] = useState(false);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState("60");
  const [qrExpiresInSeconds, setQrExpiresInSeconds] = useState("120");
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState("15");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!branch) return;
    setName(branch.name);
    setCode(branch.code ?? "");
    setAddress(branch.address ?? "");
    setPhone(branch.phone ?? "");
    setTimezone(branch.settings?.timezone ?? "Asia/Ho_Chi_Minh");
    setOpeningTime(branch.settings?.openingTime ?? "08:00");
    setClosingTime(branch.settings?.closingTime ?? "18:00");
    setQrEnabled(branch.qrSettings?.enabled ?? true);
    setRequireGps(branch.qrSettings?.requireGps ?? false);
    setRefreshIntervalSeconds(String(branch.qrSettings?.refreshIntervalSeconds ?? 60));
    setQrExpiresInSeconds(String(branch.qrSettings?.qrExpiresInSeconds ?? 120));
    setLateThresholdMinutes(String(branch.attendanceSettings?.lateThresholdMinutes ?? 15));
  }, [branch]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updatedBranch = await branchApi.update(branchId, {
        name,
        ...(code ? { code } : {}),
        ...(address ? { address } : {}),
        ...(phone ? { phone } : {}),
      });
      await branchApi.configureSettings(branchId, {
        timezone,
        openingTime,
        closingTime,
        requireCheckout: true,
      });
      await branchApi.configureQrSettings(branchId, {
        enabled: qrEnabled,
        requireGps,
        refreshIntervalSeconds: Number(refreshIntervalSeconds),
        qrExpiresInSeconds: Number(qrExpiresInSeconds),
      });
      await branchApi.configureLateThreshold(branchId, Number(lateThresholdMinutes));
      return updatedBranch;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["branch", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["branches"] }),
      ]);
      setSuccess("Đã lưu cài đặt chi nhánh.");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể lưu cài đặt chi nhánh.")),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    saveMutation.mutate();
  };

  return (
      <ShellTopBar breadcrumbs={["Cài đặt", "Cấu hình chi nhánh"]}>
      <main className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-3xl py-8">
          <header className="mb-12">
            <div className="mb-4">
              <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#444748] hover:text-black" to="/dashboard/branches">
                <ArrowLeft className="h-4 w-4" />
                Quay lại chi nhánh
              </Link>
            </div>
            <h2 className="mb-2 text-4xl font-semibold tracking-tight text-black">Cấu hình chi nhánh</h2>
            <p className="text-base text-[#444748]">Manage branch details, QR check-in preferences, and attendance policies.</p>
          </header>
          {branchQuery.isLoading ? (
            <StatePanel title="Đang tải chi nhánh..." description="Đang lấy cấu hình chi nhánh." />
          ) : branchQuery.isError ? (
            <StatePanel title="Không thể tải chi nhánh" description={getApiErrorMessage(branchQuery.error, "Vui lòng thử lại sau.")} />
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              <SettingsSection icon={<Store />} title="Thông tin chi nhánh">
                <div className="grid gap-6 md:grid-cols-2">
                  <InputField label="Tên chi nhánh" onChange={setName} required value={name} />
                  <InputField label="Mã chi nhánh" onChange={setCode} value={code} />
                  <InputField label="Số điện thoại" onChange={setPhone} value={phone} />
                  <InputField label="Múi giờ" onChange={setTimezone} required value={timezone} />
                  <div className="md:col-span-2"><InputField label="Địa chỉ" onChange={setAddress} value={address} /></div>
                </div>
              </SettingsSection>
              <SettingsSection icon={<Badge />} title="Chấm công QR">
                <div className="grid gap-6 md:grid-cols-2">
                  <ToggleField checked={qrEnabled} label="Bật chấm công QR" onChange={setQrEnabled} />
                  <ToggleField checked={requireGps} label="Yêu cầu xác thực GPS" onChange={setRequireGps} />
                  <InputField label="Chu kỳ làm mới QR (giây)" onChange={setRefreshIntervalSeconds} required type="number" value={refreshIntervalSeconds} />
                  <InputField label="Thời gian hết hạn QR (giây)" onChange={setQrExpiresInSeconds} required type="number" value={qrExpiresInSeconds} />
                </div>
              </SettingsSection>
              <SettingsSection icon={<Clock3 />} title="Chính sách chấm công">
                <div className="grid gap-6 md:grid-cols-3">
                  <InputField label="Giờ mở cửa" onChange={setOpeningTime} required type="time" value={openingTime} />
                  <InputField label="Giờ đóng cửa" onChange={setClosingTime} required type="time" value={closingTime} />
                  <InputField label="Số phút cho phép đi muộn" onChange={setLateThresholdMinutes} required type="number" value={lateThresholdMinutes} />
                </div>
              </SettingsSection>
              {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
              {success ? <p className="rounded-lg bg-[#10b981]/10 px-4 py-3 text-sm font-semibold text-[#047857]">{success}</p> : null}
              <footer className="flex flex-col items-center justify-end gap-4 border-t border-[#e5e7eb] pt-8 sm:flex-row">
                <Link className="w-full rounded-lg px-8 py-3 text-center text-sm font-semibold text-[#444748] hover:bg-[#f1edec] sm:w-auto" to="/dashboard/branches">Hủy</Link>
                <button className="w-full rounded-lg bg-black px-12 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 sm:w-auto" disabled={saveMutation.isPending} type="submit">
                  {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </footer>
            </form>
          )}
        </div>
      </main>
    </ShellTopBar>
  );
};

const ToggleField = ({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) => (
  <label className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
    <input checked={checked} className="h-5 w-5 rounded border-[#e5e7eb] text-black focus:ring-black" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
  </label>
);

const StatePanel = ({ description, title }: { description: string; title: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-10 text-center">
    <p className="text-lg font-semibold text-black">{title}</p>
    <p className="mt-2 text-sm text-[#444748]">{description}</p>
  </div>
);
