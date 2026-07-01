import {
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Filter,
  MinusCircle,
  Plus,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compensationApi } from "@/features/compensation/compensation.api";
import type { CompensationAdjustmentType, OvertimeRequestStatus } from "@/features/compensation/compensation.types";
import { branchApi } from "@/features/employeeBranch/branch.api";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import { getApiErrorMessage } from "@/shared/api";
import { Button } from "@/shared/components/ui/Button";
import { useAuthStore } from "@/store";

type Tab = "overtime" | "adjustments";

const todayInput = () => toDateInputValue(new Date());
const monthStartInput = () => {
  const now = new Date();
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1));
};

export const CompensationPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<Tab>("overtime");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    branchId: "",
    employeeId: "",
    status: "" as "" | OvertimeRequestStatus,
    type: "" as "" | CompensationAdjustmentType,
    from: monthStartInput(),
    to: todayInput(),
  });
  const [overtimeForm, setOvertimeForm] = useState({
    employeeId: "",
    workDate: todayInput(),
    startTime: "18:00",
    endTime: "20:00",
    hourlyRate: "",
    reason: "",
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    employeeId: "",
    type: "bonus" as CompensationAdjustmentType,
    amount: "",
    effectiveDate: todayInput(),
    reason: "",
    note: "",
  });

  const baseQuery = useMemo(
    () => ({
      page,
      limit: 10,
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: endOfDateInput(filters.to) } : {}),
    }),
    [filters.branchId, filters.employeeId, filters.from, filters.to, page]
  );

  const overtimeQuery = useQuery({
    queryKey: ["compensations", "overtime", { ...baseQuery, status: filters.status }],
    queryFn: () =>
      compensationApi.overtime.list({
        ...baseQuery,
        ...(filters.status ? { status: filters.status } : {}),
      }),
  });
  const adjustmentsQuery = useQuery({
    queryKey: ["compensations", "adjustments", { ...baseQuery, type: filters.type }],
    queryFn: () =>
      compensationApi.adjustments.list({
        ...baseQuery,
        ...(filters.type ? { type: filters.type } : {}),
      }),
  });
  const summaryQuery = useQuery({
    queryKey: ["compensations", "summary", baseQuery],
    queryFn: () => compensationApi.summary(baseQuery),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", { compensation: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { compensation: true, branchId: filters.branchId }],
    queryFn: () =>
      employeeApi.list({
        limit: 100,
        status: "active",
        ...(filters.branchId ? { branchId: filters.branchId } : {}),
      }),
  });

  const employees = employeesQuery.data?.data ?? [];
  const canManage = user?.role === "owner" || user?.role === "manager";

  const invalidateCompensation = () => {
    void queryClient.invalidateQueries({ queryKey: ["compensations"] });
  };

  const createOvertimeMutation = useMutation({
    mutationFn: () =>
      compensationApi.overtime.create({
        ...(canManage && overtimeForm.employeeId ? { employeeId: overtimeForm.employeeId } : {}),
        ...(filters.branchId ? { branchId: filters.branchId } : {}),
        workDate: overtimeForm.workDate,
        startTime: overtimeForm.startTime,
        endTime: overtimeForm.endTime,
        ...(overtimeForm.hourlyRate ? { hourlyRate: Number(overtimeForm.hourlyRate) } : {}),
        reason: overtimeForm.reason.trim(),
      }),
    onSuccess: () => {
      setOvertimeForm((current) => ({ ...current, reason: "" }));
      invalidateCompensation();
    },
  });

  const reviewOvertimeMutation = useMutation({
    mutationFn: ({ action, id }: { action: "approve" | "reject" | "cancel"; id: string }) => {
      if (action === "approve") return compensationApi.overtime.approve(id);
      if (action === "reject") return compensationApi.overtime.reject(id);
      return compensationApi.overtime.cancel(id);
    },
    onSuccess: invalidateCompensation,
  });

  const createAdjustmentMutation = useMutation({
    mutationFn: () =>
      compensationApi.adjustments.create({
        employeeId: adjustmentForm.employeeId,
        ...(filters.branchId ? { branchId: filters.branchId } : {}),
        type: adjustmentForm.type,
        amount: Number(adjustmentForm.amount),
        effectiveDate: adjustmentForm.effectiveDate,
        reason: adjustmentForm.reason.trim(),
        ...(adjustmentForm.note.trim() ? { note: adjustmentForm.note.trim() } : {}),
      }),
    onSuccess: () => {
      setAdjustmentForm((current) => ({ ...current, amount: "", reason: "", note: "" }));
      invalidateCompensation();
    },
  });

  const deleteAdjustmentMutation = useMutation({
    mutationFn: compensationApi.adjustments.delete,
    onSuccess: invalidateCompensation,
  });

  const activeMeta = tab === "overtime" ? overtimeQuery.data?.meta : adjustmentsQuery.data?.meta;
  const summary = summaryQuery.data?.totals;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-[#444748]">Chi phí nhân sự</p>
          <h1 className="text-4xl font-semibold tracking-tight text-black">Tăng ca, thưởng và phạt</h1>
        </div>
        <div className="flex rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-1">
          <TabButton active={tab === "overtime"} label="Tăng ca" onClick={() => { setTab("overtime"); setPage(1); }} />
          <TabButton active={tab === "adjustments"} label="Thưởng/phạt" onClick={() => { setTab("adjustments"); setPage(1); }} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Clock3 />} label="Giờ tăng ca" value={`${summary?.overtimeHours ?? 0}h`} />
        <Metric icon={<CircleDollarSign />} label="Tiền tăng ca" value={formatCurrency(summary?.overtimeAmount ?? 0)} />
        <Metric icon={<PlusCircle />} label="Thưởng" value={formatCurrency(summary?.bonusAmount ?? 0)} />
        <Metric danger icon={<MinusCircle />} label="Phạt" value={formatCurrency(summary?.penaltyAmount ?? 0)} />
      </section>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4 md:grid-cols-2 xl:grid-cols-6">
        <select className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, branchId: event.target.value, employeeId: "" })); }} value={filters.branchId}>
          <option value="">Tất cả chi nhánh</option>
          {(branchesQuery.data?.data ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
        <select className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, employeeId: event.target.value })); }} value={filters.employeeId}>
          <option value="">Tất cả nhân viên</option>
          {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
        </select>
        {tab === "overtime" ? (
          <select className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, status: event.target.value as typeof filters.status })); }} value={filters.status}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        ) : (
          <select className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, type: event.target.value as typeof filters.type })); }} value={filters.type}>
            <option value="">Thưởng và phạt</option>
            <option value="bonus">Thưởng</option>
            <option value="penalty">Phạt</option>
          </select>
        )}
        <input className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, from: event.target.value })); }} type="date" value={filters.from} />
        <input className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, to: event.target.value })); }} type="date" value={filters.to} />
        <Button className="h-11 bg-white" onClick={() => setFilters({ branchId: "", employeeId: "", status: "", type: "", from: monthStartInput(), to: todayInput() })} variant="secondary">
          <Filter className="h-4 w-4" />
          Đặt lại
        </Button>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4">
            <h2 className="text-2xl font-semibold tracking-tight">{tab === "overtime" ? "Yêu cầu tăng ca" : "Khoản thưởng/phạt"}</h2>
            <span className="text-xs font-semibold text-[#444748]">{activeMeta?.total ?? 0} bản ghi</span>
          </div>
          {tab === "overtime" ? (
            <OvertimeTable
              canManage={canManage}
              items={overtimeQuery.data?.data ?? []}
              loading={overtimeQuery.isLoading}
              onAction={(action, id) => reviewOvertimeMutation.mutate({ action, id })}
              pending={reviewOvertimeMutation.isPending}
            />
          ) : (
            <AdjustmentTable
              canManage={canManage}
              items={adjustmentsQuery.data?.data ?? []}
              loading={adjustmentsQuery.isLoading}
              onDelete={(id) => deleteAdjustmentMutation.mutate(id)}
              pending={deleteAdjustmentMutation.isPending}
            />
          )}
          <div className="flex items-center justify-between border-t border-[#e5e7eb] p-4">
            <p className="text-xs text-[#444748]">Trang {activeMeta?.page ?? page} / {Math.max(activeMeta?.totalPages ?? 1, 1)}</p>
            <div className="flex gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} variant="secondary">Trước</Button>
              <Button disabled={!activeMeta || page >= activeMeta.totalPages} onClick={() => setPage((value) => value + 1)} variant="secondary">Sau</Button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
            <h3 className="mb-4 text-lg font-bold">{tab === "overtime" ? "Tạo yêu cầu tăng ca" : "Thêm thưởng/phạt"}</h3>
            {tab === "overtime" ? (
              <div className="space-y-3">
                {canManage ? <EmployeeSelect employees={employees} onChange={(value) => setOvertimeForm((current) => ({ ...current, employeeId: value }))} value={overtimeForm.employeeId} /> : null}
                <input className={fieldClassName} onChange={(event) => setOvertimeForm((current) => ({ ...current, workDate: event.target.value }))} type="date" value={overtimeForm.workDate} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={fieldClassName} onChange={(event) => setOvertimeForm((current) => ({ ...current, startTime: event.target.value }))} type="time" value={overtimeForm.startTime} />
                  <input className={fieldClassName} onChange={(event) => setOvertimeForm((current) => ({ ...current, endTime: event.target.value }))} type="time" value={overtimeForm.endTime} />
                </div>
                {canManage ? (
                  <input className={fieldClassName} min="0" onChange={(event) => setOvertimeForm((current) => ({ ...current, hourlyRate: event.target.value }))} placeholder="Đơn giá/giờ" type="number" value={overtimeForm.hourlyRate} />
                ) : null}
                <textarea className="min-h-24 w-full resize-none rounded-lg border border-[#e5e7eb] p-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setOvertimeForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Lý do tăng ca" value={overtimeForm.reason} />
                {createOvertimeMutation.isError ? <ErrorText error={createOvertimeMutation.error} fallback="Không thể tạo yêu cầu tăng ca." /> : null}
                <Button className="w-full" disabled={!overtimeForm.workDate || !overtimeForm.startTime || !overtimeForm.endTime || !overtimeForm.reason.trim() || (canManage && !overtimeForm.employeeId) || createOvertimeMutation.isPending} onClick={() => createOvertimeMutation.mutate()}>
                  <Plus className="h-4 w-4" />
                  {createOvertimeMutation.isPending ? "Đang lưu..." : "Lưu tăng ca"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <EmployeeSelect employees={employees} onChange={(value) => setAdjustmentForm((current) => ({ ...current, employeeId: value }))} value={adjustmentForm.employeeId} />
                <select className={fieldClassName} onChange={(event) => setAdjustmentForm((current) => ({ ...current, type: event.target.value as CompensationAdjustmentType }))} value={adjustmentForm.type}>
                  <option value="bonus">Thưởng</option>
                  <option value="penalty">Phạt</option>
                </select>
                <input className={fieldClassName} min="0" onChange={(event) => setAdjustmentForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Số tiền" type="number" value={adjustmentForm.amount} />
                <input className={fieldClassName} onChange={(event) => setAdjustmentForm((current) => ({ ...current, effectiveDate: event.target.value }))} type="date" value={adjustmentForm.effectiveDate} />
                <input className={fieldClassName} onChange={(event) => setAdjustmentForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Lý do" value={adjustmentForm.reason} />
                <textarea className="min-h-20 w-full resize-none rounded-lg border border-[#e5e7eb] p-3 text-sm outline-none focus:ring-1 focus:ring-black" onChange={(event) => setAdjustmentForm((current) => ({ ...current, note: event.target.value }))} placeholder="Ghi chú nội bộ" value={adjustmentForm.note} />
                {createAdjustmentMutation.isError ? <ErrorText error={createAdjustmentMutation.error} fallback="Không thể thêm khoản thưởng/phạt." /> : null}
                <Button className="w-full" disabled={!canManage || !adjustmentForm.employeeId || !adjustmentForm.amount || !adjustmentForm.reason.trim() || createAdjustmentMutation.isPending} onClick={() => createAdjustmentMutation.mutate()}>
                  <BadgeDollarSign className="h-4 w-4" />
                  {createAdjustmentMutation.isPending ? "Đang lưu..." : "Lưu khoản"}
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
            <h3 className="mb-3 text-lg font-bold">Tổng theo nhân viên</h3>
            <div className="space-y-3">
              {(summaryQuery.data?.employees ?? []).slice(0, 6).map((row) => (
                <div className="rounded-lg border border-[#e5e7eb] bg-white p-3" key={row.employeeId}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{row.employeeName}</p>
                    <p className={row.netAmount >= 0 ? "font-bold text-[#10b981]" : "font-bold text-[#ef4444]"}>{formatCurrency(row.netAmount)}</p>
                  </div>
                  <p className="mt-1 text-xs text-[#444748]">{row.overtimeHours}h tăng ca - Thưởng {formatCurrency(row.bonusAmount)} - Phạt {formatCurrency(row.penaltyAmount)}</p>
                </div>
              ))}
              {!summaryQuery.isLoading && (summaryQuery.data?.employees ?? []).length === 0 ? <p className="text-sm font-semibold text-[#444748]">Chưa có dữ liệu trong kỳ lọc.</p> : null}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};

const TabButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button className={active ? "h-10 rounded-md bg-white px-4 text-sm font-bold shadow-sm" : "h-10 rounded-md px-4 text-sm font-semibold text-[#444748]"} onClick={onClick} type="button">
    {label}
  </button>
);

const fieldClassName = "h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-black";

const Metric = ({ danger, icon, label, value }: { danger?: boolean; icon: ReactNode; label: string; value: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
    <div className={danger ? "mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef4444]/10 text-[#ef4444]" : "mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black/5 text-black"}>{icon}</div>
    <p className="text-sm font-semibold text-[#444748]">{label}</p>
    <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>
  </div>
);

const EmployeeSelect = ({ employees, onChange, value }: { employees: Array<{ id: string; fullName: string }>; onChange: (value: string) => void; value: string }) => (
  <select className={fieldClassName} onChange={(event) => onChange(event.target.value)} value={value}>
    <option value="">Chọn nhân viên</option>
    {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
  </select>
);

const OvertimeTable = ({
  canManage,
  items,
  loading,
  onAction,
  pending,
}: {
  canManage: boolean;
  items: Awaited<ReturnType<typeof compensationApi.overtime.list>>["data"];
  loading: boolean;
  onAction: (action: "approve" | "reject" | "cancel", id: string) => void;
  pending: boolean;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[900px] text-left">
      <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-sm text-[#444748]">
        <tr>
          <th className="px-4 py-3">Nhân viên</th>
          <th className="px-4 py-3">Ngày</th>
          <th className="px-4 py-3">Giờ</th>
          <th className="px-4 py-3">Chi phí</th>
          <th className="px-4 py-3">Lý do</th>
          <th className="px-4 py-3">Trạng thái</th>
          <th className="px-4 py-3 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#e5e7eb]">
        {loading ? <EmptyRow text="Đang tải tăng ca..." /> : null}
        {!loading && items.length === 0 ? <EmptyRow text="Chưa có yêu cầu tăng ca." /> : null}
        {items.map((item) => (
          <tr className="hover:bg-[#f7f3f2]" key={item.id}>
            <td className="px-4 py-3">
              <p className="font-semibold">{item.employeeName ?? item.employeeId}</p>
              <p className="text-xs text-[#444748]">{item.branchName ?? item.branchId}</p>
            </td>
            <td className="px-4 py-3">{formatDate(item.workDate)}</td>
            <td className="px-4 py-3">{item.startTime} - {item.endTime}<p className="text-xs text-[#444748]">{item.hours} giờ</p></td>
            <td className="px-4 py-3">{formatCurrency(item.amount)}<p className="text-xs text-[#444748]">{formatCurrency(item.hourlyRate)}/giờ</p></td>
            <td className="max-w-xs px-4 py-3"><p className="line-clamp-2 text-sm">{item.reason}</p></td>
            <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-2">
                {item.status === "pending" && canManage ? (
                  <>
                    <IconButton disabled={pending} label="Duyệt" onClick={() => onAction("approve", item.id)}><CheckCircle2 className="h-4 w-4" /></IconButton>
                    <IconButton danger disabled={pending} label="Từ chối" onClick={() => onAction("reject", item.id)}><X className="h-4 w-4" /></IconButton>
                  </>
                ) : null}
                {item.status === "pending" ? <IconButton disabled={pending} label="Hủy" onClick={() => onAction("cancel", item.id)}><Trash2 className="h-4 w-4" /></IconButton> : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AdjustmentTable = ({
  canManage,
  items,
  loading,
  onDelete,
  pending,
}: {
  canManage: boolean;
  items: Awaited<ReturnType<typeof compensationApi.adjustments.list>>["data"];
  loading: boolean;
  onDelete: (id: string) => void;
  pending: boolean;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[780px] text-left">
      <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-sm text-[#444748]">
        <tr>
          <th className="px-4 py-3">Nhân viên</th>
          <th className="px-4 py-3">Loại</th>
          <th className="px-4 py-3">Số tiền</th>
          <th className="px-4 py-3">Ngày hiệu lực</th>
          <th className="px-4 py-3">Lý do</th>
          <th className="px-4 py-3 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#e5e7eb]">
        {loading ? <EmptyRow text="Đang tải thưởng/phạt..." /> : null}
        {!loading && items.length === 0 ? <EmptyRow text="Chưa có khoản thưởng/phạt." /> : null}
        {items.map((item) => (
          <tr className="hover:bg-[#f7f3f2]" key={item.id}>
            <td className="px-4 py-3">
              <p className="font-semibold">{item.employeeName ?? item.employeeId}</p>
              <p className="text-xs text-[#444748]">{item.branchName ?? item.branchId}</p>
            </td>
            <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
            <td className="px-4 py-3 font-bold">{formatCurrency(item.amount)}</td>
            <td className="px-4 py-3">{formatDate(item.effectiveDate)}</td>
            <td className="max-w-xs px-4 py-3"><p className="line-clamp-2 text-sm">{item.reason}</p></td>
            <td className="px-4 py-3 text-right">
              {canManage ? <IconButton danger disabled={pending} label="Xóa" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4" /></IconButton> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EmptyRow = ({ text }: { text: string }) => (
  <tr>
    <td className="px-4 py-8 text-center text-sm font-semibold text-[#444748]" colSpan={7}>{text}</td>
  </tr>
);

const IconButton = ({ children, danger, disabled, label, onClick }: { children: ReactNode; danger?: boolean; disabled?: boolean; label: string; onClick: () => void }) => (
  <button aria-label={label} className={danger ? "rounded-lg p-2 text-[#ef4444] hover:bg-red-50 disabled:opacity-50" : "rounded-lg p-2 text-[#444748] hover:bg-[#ebe7e6] disabled:opacity-50"} disabled={disabled} onClick={onClick} title={label} type="button">
    {children}
  </button>
);

const StatusBadge = ({ status }: { status: OvertimeRequestStatus }) => {
  const label = status === "pending" ? "Chờ duyệt" : status === "approved" ? "Đã duyệt" : status === "rejected" ? "Từ chối" : "Đã hủy";
  const tone = status === "approved" ? "bg-[#10b981]/10 text-[#10b981]" : status === "pending" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#ffdad6] text-[#93000a]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{label}</span>;
};

const TypeBadge = ({ type }: { type: CompensationAdjustmentType }) => (
  <span className={type === "bonus" ? "rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold text-[#10b981]" : "rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-bold text-[#93000a]"}>
    {type === "bonus" ? "Thưởng" : "Phạt"}
  </span>
);

const ErrorText = ({ error, fallback }: { error: unknown; fallback: string }) => (
  <p className="rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(error, fallback)}</p>
);

const toDateInputValue = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const endOfDateInput = (value: string) => `${value}T23:59:59`;
const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
