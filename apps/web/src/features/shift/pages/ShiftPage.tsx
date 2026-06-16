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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { branchApi } from "@/features/employeeBranch/branch.api";
import type { Branch } from "@/features/employeeBranch/branch.types";
import { employeeApi } from "@/features/employeeBranch/employee.api";
import type { Employee } from "@/features/employeeBranch/employee.types";
import { scheduleApi } from "@/features/shift/schedule.api";
import type { AssignedShift } from "@/features/shift/schedule.types";
import { shiftApi } from "@/features/shift/shift.api";
import type { ShiftTemplate, ShiftTemplateStatus } from "@/features/shift/shift.types";
import { getApiErrorMessage } from "@/shared/api";

type LocalDraftAssignedShift = AssignedShift & {
  localDraft: true;
};

const workplaceImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBD10SV1xwMpHvBTCoOhsK582aHXZD8LoSqeVPXCAzw5JAsQR08dCikrDBtAf2rjpd6liDN_7ztKxjHKlm9PK49AvyvEnM0NsHz0jjpxDvt06fFUHTi3ABRZMictAYHjCaadXM4KGTCBLDBTNFKAg5xx2SwJiUwkx1agNSUZTx7GyA2VYAaQdyWDy-WuDg5J5CIGE-Rokg_ztAqFeNuHX8A-Q8LToLFfSTZ3Kb-lujwmGN1euRSd3LSyL0GZBjZJE89kfwOlAgVTD9d";

export const ShiftPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [status, setStatus] = useState<ShiftTemplateStatus | "all">("all");
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const templatesQuery = useQuery({
    queryKey: ["shift-templates", { branchId, search, status }],
    queryFn: () =>
      shiftApi.list({
        limit: 50,
        ...(search ? { search } : {}),
        ...(branchId !== "all" ? { branchId } : {}),
        ...(status !== "all" ? { status } : {}),
      }),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", { shiftTemplates: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ shiftTemplateId, status }: { shiftTemplateId: string; status: ShiftTemplateStatus }) =>
      status === "active" ? shiftApi.enable(shiftTemplateId) : shiftApi.disable(shiftTemplateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shift-templates"] });
    },
  });
  const shiftTemplates = templatesQuery.data?.data ?? [];
  const activeTemplates = shiftTemplates.filter((template) => template.status === "active").length;
  const branchesById = useMemo(
    () => new Map((branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch.name])),
    [branchesQuery.data?.data]
  );

  return (
  <ShiftShell
    action={<Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" to="/dashboard/shifts/new"><Plus className="h-4 w-4" />Ca mới</Link>}
    onSearchChange={setSearch}
    search="Tìm mẫu ca..."
    searchValue={search}
    title="Mẫu ca làm"
  >
    <main className="p-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-1 text-4xl font-semibold tracking-tight text-black">Mẫu ca làm</h1>
          <p className="text-base text-[#444748]">Quản lý các mẫu ca lặp lại theo chi nhánh trước khi gán vào lịch.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
            <option value="all">Tất cả chi nhánh</option>
            {(branchesQuery.data?.data ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold" onChange={(event) => setStatus(event.target.value as ShiftTemplateStatus | "all")} value={status}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="disabled">Vô hiệu</option>
          </select>
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90" to="/dashboard/shifts/new">
            <Plus className="h-4 w-4" />
            Tạo mẫu
          </Link>
        </div>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <MetricCard icon={<CheckCircle2 />} label="Mẫu đang hoạt động" value={String(activeTemplates)} />
        <MetricCard icon={<Clock3 />} label="Tổng mẫu" value={String(templatesQuery.data?.meta.total ?? shiftTemplates.length)} tone="secondary" />
        <MetricCard icon={<Sparkles />} label="Chi nhánh đã tải" value={String(branchesQuery.data?.data.length ?? 0)} tone="success" />
        <MetricCard icon={<AlertTriangle />} label="Đã vô hiệu" value={String(shiftTemplates.filter((template) => template.status === "disabled").length)} tone="danger" />
      </div>
      <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f3f2] px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-black">Mẫu dùng lại</h3>
          <Filter className="h-5 w-5 text-[#444748]" />
        </div>
        {templatesQuery.isLoading ? (
          <StatePanel title="Đang tải mẫu ca..." description="Đang lấy các mẫu dùng lại từ API." />
        ) : templatesQuery.isError ? (
          <StatePanel title="Không thể tải mẫu ca" description={getApiErrorMessage(templatesQuery.error, "Vui lòng thử lại sau.")} />
        ) : shiftTemplates.length === 0 ? (
          <StatePanel title="Không tìm thấy mẫu ca" description="Hãy tạo mẫu đầu tiên hoặc chỉnh bộ lọc hiện tại." />
        ) : (
          <div className="divide-y divide-[#e5e7eb]">
            {shiftTemplates.map((template) => (
              <TemplateRow
                branchName={branchesById.get(template.branchId)}
                isUpdatingStatus={statusMutation.isPending}
                key={template.id}
                onEdit={() => setEditingTemplate(template)}
                onToggleStatus={() =>
                  statusMutation.mutate({
                    shiftTemplateId: template.id,
                    status: template.status === "active" ? "disabled" : "active",
                  })
                }
                template={template}
              />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between bg-[#f7f3f2] px-6 py-4">
          <span className="text-xs text-[#444748]">Đang hiển thị {shiftTemplates.length} trong {templatesQuery.data?.meta.total ?? shiftTemplates.length} mẫu</span>
        </div>
      </section>
      <div className="mt-12 grid h-auto grid-cols-1 gap-6 md:grid-cols-3 xl:h-[400px]">
        <section className="group relative col-span-1 min-h-[320px] overflow-hidden rounded-2xl md:col-span-2">
          <img alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={workplaceImage} />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8">
            <h4 className="text-4xl font-semibold tracking-tight text-white">AI lập lịch thông minh</h4>
            <p className="mt-2 max-w-md text-lg text-white/80">Để AI tối ưu việc gán mẫu ca dựa trên lưu lượng cao điểm lịch sử và tình trạng sẵn sàng của nhân viên.</p>
            <button className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black">Xem thông tin <ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>
        <section className="flex flex-col justify-between rounded-2xl bg-black p-8 text-white">
          <div>
            <Wand2 className="mb-4 h-12 w-12" />
            <h4 className="mb-2 text-2xl font-semibold tracking-tight">Điền nhanh</h4>
            <p className="text-base text-white/70">Tạo ngay lịch tháng đầy đủ chỉ với một lần nhấp bằng các mẫu bạn thường dùng.</p>
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-white/10 p-4">
            <div className="mb-1 flex justify-between text-xs"><span>Trạng thái tích hợp</span><span className="text-[#10b981]">Đang hoạt động</span></div>
            <div className="h-1 overflow-hidden rounded-full bg-white/20"><div className="h-full w-4/5 bg-white" /></div>
          </div>
        </section>
      </div>
      {editingTemplate ? (
        <ShiftTemplateModal
          branches={branchesQuery.data?.data ?? []}
          closeTo="/dashboard/shifts"
          mode="edit"
          onClose={() => setEditingTemplate(null)}
          template={editingTemplate}
        />
      ) : null}
    </main>
  </ShiftShell>
  );
};

export const ShiftCreatePage = () => (
  <>
    <ShiftPage />
    <ShiftCreateTemplateOverlay />
  </>
);

export const SchedulePage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [weekStart, setWeekStart] = useState(getWeekStartInputValue(new Date()));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localDrafts, setLocalDrafts] = useState<LocalDraftAssignedShift[]>(loadLocalDrafts);
  const [error, setError] = useState("");

  useEffect(() => {
    saveLocalDrafts(localDrafts);
  }, [localDrafts]);

  const branchesQuery = useQuery({
    queryKey: ["branches", { schedule: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { schedule: true, branchId, search }],
    queryFn: () =>
      employeeApi.list({
        limit: 100,
        status: "active",
        ...(branchId !== "all" ? { branchId } : {}),
        ...(search ? { search } : {}),
      }),
  });
  const templatesQuery = useQuery({
    queryKey: ["shift-templates", { schedule: true, branchId }],
    queryFn: () =>
      shiftApi.list({
        limit: 100,
        status: "active",
        ...(branchId !== "all" ? { branchId } : {}),
      }),
  });
  const scheduleQuery = useQuery({
    queryKey: ["schedules", "weekly", { branchId, weekStart }],
    queryFn: () =>
      scheduleApi.weekly({
        weekStart,
        ...(branchId !== "all" ? { branchId } : {}),
      }),
  });
  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const employees = employeesQuery.data?.data ?? [];
  const serverSchedules = scheduleQuery.data?.data ?? [];
  const branches = branchesQuery.data?.data ?? [];
  const templates = templatesQuery.data?.data ?? [];
  const templatesById = useMemo(() => new Map(templates.map((template) => [template.id, template])), [templates]);
  const visibleEmployees = employees.filter((employee) => employee.role !== "owner");
  const visibleLocalDrafts = useMemo(
    () =>
      localDrafts.filter((item) => {
        const date = toDateInputValue(item.workDate);
        return date >= weekStart && date <= addDaysInputValue(weekStart, 6) && (branchId === "all" || item.branchId === branchId);
      }),
    [branchId, localDrafts, weekStart]
  );
  const schedules = useMemo(
    () => [...serverSchedules, ...visibleLocalDrafts],
    [serverSchedules, visibleLocalDrafts]
  );
  const duplicatePreviousMutation = useMutation({
    mutationFn: async () => {
      const previousWeekStart = addDaysInputValue(weekStart, -7);
      const previousSchedule = await scheduleApi.weekly({
        weekStart: previousWeekStart,
        ...(branchId !== "all" ? { branchId } : {}),
      });
      const existingKeys = new Set(
        schedules.map((item) =>
          [item.employeeId, toDateInputValue(item.workDate), item.shiftTemplateId, item.shiftStartTime, item.shiftEndTime].join("|")
        )
      );
      const copies = previousSchedule.data
        .map((item) => ({
          branchId: item.branchId,
          employeeId: item.employeeId,
          shiftTemplateId: item.shiftTemplateId,
          workDate: addDaysInputValue(toDateInputValue(item.workDate), 7),
          shiftStartTime: item.shiftStartTime,
          shiftEndTime: item.shiftEndTime,
          published: false,
          status: "scheduled" as const,
          organizationId: item.organizationId,
          ...(item.note ? { note: item.note } : {}),
        }))
        .filter((item) => item.workDate >= toDateInputValue(new Date()))
        .filter((item) => !existingKeys.has([item.employeeId, item.workDate, item.shiftTemplateId, item.shiftStartTime, item.shiftEndTime].join("|")));

      if (copies.length === 0) {
        throw new Error("Không có ca tuần trước phù hợp để sao chép.");
      }

      return copies.map((item) => ({
        ...item,
        id: createLocalDraftId(),
        localDraft: true as const,
      }));
    },
    onSuccess: (drafts) => {
      setLocalDrafts((current) => [...current, ...drafts]);
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể sao chép tuần trước.")),
  });
  const bulkAutoAssignMutation = useMutation({
    mutationFn: async () => {
      const existingEmployeeDays = new Set(
        schedules.map((item) => [item.employeeId, toDateInputValue(item.workDate)].join("|"))
      );
      const templatesByBranch = new Map<string, ShiftTemplate>();
      templates.forEach((template) => {
        if (!templatesByBranch.has(template.branchId)) {
          templatesByBranch.set(template.branchId, template);
        }
      });
      const assignments = weekDays
        .flatMap((day) =>
          day.date < toDateInputValue(new Date())
            ? []
            :
          visibleEmployees
            .filter((employee) => !existingEmployeeDays.has([employee.id, day.date].join("|")))
            .map((employee) => {
              if (!employee.branchId) {
                return null;
              }

              const template = templatesByBranch.get(employee.branchId);
                  return template
                ? {
                    branchId: employee.branchId,
                    employeeId: employee.id,
                    shiftTemplateId: template.id,
                    workDate: day.date,
                    shiftStartTime: template.startTime,
                    shiftEndTime: template.endTime,
                    status: "scheduled" as const,
                    published: false,
                    organizationId: template.organizationId,
                    note: "Auto-assigned",
                  }
                : null;
            })
        )
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

      if (assignments.length === 0) {
        throw new Error("Không còn ngày trống trong tương lai với mẫu ca đang hoạt động.");
      }

      return assignments.map((item) => ({
        ...item,
        id: createLocalDraftId(),
        localDraft: true as const,
      }));
    },
    onSuccess: (drafts) => {
      setLocalDrafts((current) => [...current, ...drafts]);
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể tự động gán ca.")),
  });
  const publishMutation = useMutation({
    mutationFn: async () => {
      const savedDrafts = serverSchedules.filter((item) => !item.published);
      const createdDrafts = visibleLocalDrafts.map((item) =>
        scheduleApi.create({
          branchId: item.branchId,
          employeeId: item.employeeId,
          shiftTemplateId: item.shiftTemplateId,
          workDate: toDateInputValue(item.workDate),
          shiftStartTime: item.shiftStartTime,
          shiftEndTime: item.shiftEndTime,
          published: true,
          ...(item.note ? { note: item.note } : {}),
        })
      );

      return Promise.all([
        ...savedDrafts.map((item) => scheduleApi.update(item.id, { published: true })),
        ...createdDrafts,
      ]);
    },
    onSuccess: () => {
      setLocalDrafts((current) => current.filter((item) => !visibleLocalDrafts.some((draft) => draft.id === item.id)));
      void queryClient.invalidateQueries({ queryKey: ["schedules", "weekly"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể xuất bản lịch.")),
  });
  const deleteMutation = useMutation({
    mutationFn: (assignedShiftId: string) => scheduleApi.delete(assignedShiftId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["schedules", "weekly"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể xóa ca đã gán.")),
  });
  const totalHours = useMemo(
    () => schedules.reduce((sum, item) => sum + getShiftHours(item.shiftStartTime, item.shiftEndTime), 0),
    [schedules]
  );
  const weekEnd = weekDays[6]?.date ?? weekStart;
  const draftCount = schedules.filter((item) => !item.published).length;

  const deleteAssignedShift = (assignedShiftId: string) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa ca làm này không?");
    if (!confirmed) {
      return;
    }

    if (isLocalDraftId(assignedShiftId)) {
      setLocalDrafts((current) => current.filter((item) => item.id !== assignedShiftId));
      return;
    }

    deleteMutation.mutate(assignedShiftId);
  };

  const addLocalDrafts = (drafts: LocalDraftAssignedShift[]) => {
    setLocalDrafts((current) => [...current, ...drafts]);
  };

  const clearLocalDrafts = () => {
    setLocalDrafts([]);
  };

  const goToPreviousWeek = () => {
    setWeekStart((current) => addDaysInputValue(current, -7));
  };

  const goToNextWeek = () => {
    setWeekStart((current) => addDaysInputValue(current, 7));
  };

  return (
    <ShiftShell
      action={<button className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" onClick={() => setIsCreateOpen(true)} type="button"><Plus className="h-4 w-4" />Gán ca</button>}
      onSearchChange={setSearch}
      search="Tìm ca, nhân viên..."
      searchValue={search}
      title="Lịch làm việc"
    >
      <main className="min-h-screen bg-white">
        <div className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-white/95 px-6 py-5 backdrop-blur">
          <div className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-black">Lịch tuần</h1>
              <p className="text-base text-[#444748]">{formatDateLabel(weekStart)} - {formatDateLabel(weekEnd)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2] disabled:text-[#747878] disabled:opacity-60"
                disabled={duplicatePreviousMutation.isPending}
                onClick={() => duplicatePreviousMutation.mutate()}
                type="button"
              >
                <Copy className="h-4 w-4" />
                {duplicatePreviousMutation.isPending ? "Đang sao chép..." : "Sao chép tuần trước"}
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2] disabled:text-[#747878] disabled:opacity-60"
                disabled={bulkAutoAssignMutation.isPending || visibleEmployees.length === 0 || templates.length === 0}
                onClick={() => bulkAutoAssignMutation.mutate()}
                type="button"
              >
                <Sparkles className="h-4 w-4" />
                {bulkAutoAssignMutation.isPending ? "Đang gán..." : "Gán tự động hàng loạt"}
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#ef4444]/30 px-4 text-sm font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 disabled:text-[#747878] disabled:opacity-60"
                disabled={localDrafts.length === 0}
                onClick={() => {
                  if (window.confirm("Bạn có chắc muốn xóa toàn bộ bản nháp đang hiển thị không?")) {
                    clearLocalDrafts();
                  }
                }}
                type="button"
              >
                <X className="h-4 w-4" />
                Xóa bản nháp
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={publishMutation.isPending || draftCount === 0}
                onClick={() => publishMutation.mutate()}
                type="button"
              >
                <ArrowRight className="h-4 w-4" />
                {publishMutation.isPending ? "Đang xuất bản..." : "Xuất bản lịch"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
              <button className="bg-[#ebe7e6] px-4 py-2 text-sm font-semibold" type="button">Tuần</button>
              <Link className="border-l border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/schedule/monthly">Tháng</Link>
              <Link className="border-l border-[#e5e7eb] px-4 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" to="/dashboard/schedule/daily">Ngày</Link>
            </div>
            <span className="mx-1 h-8 w-px bg-[#e5e7eb]" />
            <select className="h-10 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#444748]" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
              <option value="all">Tất cả chi nhánh</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <div className="flex items-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
              <button
                aria-label="Tuần trước"
                className="flex h-10 w-10 items-center justify-center border-r border-[#e5e7eb] text-[#444748] hover:bg-[#f7f3f2]"
                onClick={goToPreviousWeek}
                title="Tuần trước"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <input className="h-10 border-0 bg-white px-3 text-sm font-semibold text-[#444748] outline-none" onChange={(event) => setWeekStart(event.target.value)} type="date" value={weekStart} />
              <button
                aria-label="Tuần sau"
                className="flex h-10 w-10 items-center justify-center border-l border-[#e5e7eb] text-[#444748] hover:bg-[#f7f3f2]"
                onClick={goToNextWeek}
                title="Tuần sau"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="ml-auto text-xs italic text-[#444748]">Đang hiển thị {visibleEmployees.length} nhân viên - {schedules.length} ca đã gán</span>
          </div>
          {error ? <p className="mt-4 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
        </div>
        {scheduleQuery.isLoading || employeesQuery.isLoading || templatesQuery.isLoading ? (
          <StatePanel title="Đang tải lịch tuần..." description="Đang lấy ca đã gán, nhân viên và mẫu từ API." />
        ) : scheduleQuery.isError ? (
          <StatePanel title="Không thể tải lịch tuần" description={getApiErrorMessage(scheduleQuery.error, "Vui lòng thử lại sau.")} />
        ) : (
          <WeeklyBoard
            employees={visibleEmployees}
            onDeleteShift={deleteAssignedShift}
            schedules={schedules}
            templatesById={templatesById}
            weekDays={weekDays}
          />
        )}
        <ScheduleSummary assignedCount={schedules.length} draftCount={draftCount} totalHours={totalHours} />
        <button className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition active:scale-90" onClick={() => setIsCreateOpen(true)} type="button">
          <Plus className="h-7 w-7" />
        </button>
        {isCreateOpen ? (
          <AssignedShiftModal
            branchId={branchId}
            branches={branches}
            employees={employees.filter((employee) => employee.role !== "owner")}
            onCreateDrafts={addLocalDrafts}
            onClose={() => setIsCreateOpen(false)}
            templates={templates}
            weekStart={weekStart}
          />
        ) : null}
      </main>
    </ShiftShell>
  );
};

export const MonthlySchedulePage = () => {
  const [branchId, setBranchId] = useState("all");
  const [monthStart, setMonthStart] = useState(getMonthStartInputValue(new Date()));
  const [search, setSearch] = useState("");
  const branchesQuery = useQuery({
    queryKey: ["branches", { scheduleMonthly: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { scheduleMonthly: true, branchId, search }],
    queryFn: () =>
      employeeApi.list({
        limit: 100,
        status: "active",
        ...(branchId !== "all" ? { branchId } : {}),
        ...(search ? { search } : {}),
      }),
  });
  const templatesQuery = useQuery({
    queryKey: ["shift-templates", { scheduleMonthly: true, branchId }],
    queryFn: () => shiftApi.list({ limit: 100, status: "active", ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const monthWeeks = useMemo(() => buildCalendarWeekStarts(monthStart), [monthStart]);
  const monthQuery = useQuery({
    queryKey: ["schedules", "monthly", { branchId, monthStart }],
    queryFn: async () => {
      const weeks = await Promise.all(
        monthWeeks.map((weekStart) => scheduleApi.weekly({ weekStart, ...(branchId !== "all" ? { branchId } : {}) }))
      );
      return weeks.flatMap((week) => week.data);
    },
  });
  const employeesById = useMemo(() => new Map((employeesQuery.data?.data ?? []).map((employee) => [employee.id, employee])), [employeesQuery.data?.data]);
  const templatesById = useMemo(() => new Map((templatesQuery.data?.data ?? []).map((template) => [template.id, template])), [templatesQuery.data?.data]);
  const schedules = useMemo(() => {
    const unique = new Map<string, AssignedShift>();
    (monthQuery.data ?? []).forEach((item) => {
      if (!search || employeesById.get(item.employeeId)?.fullName.toLowerCase().includes(search.toLowerCase())) {
        unique.set(item.id, item);
      }
    });
    return [...unique.values()];
  }, [employeesById, monthQuery.data, search]);
  const cells = useMemo(() => buildMonthCells(monthStart, schedules), [monthStart, schedules]);
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${monthStart}T00:00:00`));
  const monthSchedules = schedules.filter((item) => toDateInputValue(item.workDate).startsWith(monthStart.slice(0, 7)));
  const draftCount = monthSchedules.filter((item) => !item.published).length;

  return (
    <ShiftShell
      action={<Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" to="/dashboard/schedule"><Plus className="h-4 w-4" />Gán ca</Link>}
      onSearchChange={setSearch}
      search="Tìm ca hoặc nhân viên..."
      searchValue={search}
      title="Lịch làm việc"
    >
      <main className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard icon={<Clock3 />} label="Tổng giờ làm" value={monthSchedules.reduce((sum, item) => sum + getShiftHours(item.shiftStartTime, item.shiftEndTime), 0).toFixed(1)} sub="đã lên lịch trong tháng" tone="success" tall />
          <MetricCard icon={<UsersRound />} label="Nhân viên" value={String(employeesQuery.data?.data.filter((employee) => employee.role !== "owner").length ?? 0)} sub="theo bộ lọc" tall />
          <MetricCard icon={<CalendarDays />} label="Ca đã gán" value={String(monthSchedules.length)} sub="trong tháng đã chọn" tall />
        <MetricCard icon={<Sparkles />} label="Ca nháp" value={String(draftCount)} sub="chờ xuất bản" tone={draftCount > 0 ? "danger" : "secondary"} tall />
        </div>
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e5e7eb] p-4 xl:flex-row xl:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{monthLabel}</h2>
              <div className="flex gap-1">
                <button className="rounded-lg border border-[#e5e7eb] p-1 hover:bg-[#f7f3f2]" onClick={() => setMonthStart(addMonthsInputValue(monthStart, -1))} type="button"><ChevronLeft className="h-5 w-5" /></button>
                <button className="rounded-lg border border-[#e5e7eb] p-1 hover:bg-[#f7f3f2]" onClick={() => setMonthStart(addMonthsInputValue(monthStart, 1))} type="button"><ChevronRight className="h-5 w-5" /></button>
                <button className="ml-2 rounded-lg border border-[#e5e7eb] px-4 py-1 text-sm font-semibold hover:bg-[#f7f3f2]" onClick={() => setMonthStart(getMonthStartInputValue(new Date()))} type="button">Hôm nay</button>
              </div>
              <select className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#444748]" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
                <option value="all">Tất cả chi nhánh</option>
                {(branchesQuery.data?.data ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </div>
            <ViewSwitcher active="month" />
          </div>
          {monthQuery.isLoading || employeesQuery.isLoading || templatesQuery.isLoading ? (
            <StatePanel title="Đang tải lịch tháng..." description="Đang lấy dữ liệu lịch cho календар." />
          ) : (
            <MonthlyCalendar cells={cells} employeesById={employeesById} templatesById={templatesById} />
          )}
        </section>
      </main>
    </ShiftShell>
  );
};

export const DailySchedulePage = () => {
  const [branchId, setBranchId] = useState("all");
  const [workDate, setWorkDate] = useState(toDateInputValue(new Date()));
  const [search, setSearch] = useState("");
  const weekStart = getWeekStartInputValue(new Date(`${workDate}T00:00:00`));
  const branchesQuery = useQuery({
    queryKey: ["branches", { scheduleDaily: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", { scheduleDaily: true, branchId, search }],
    queryFn: () =>
      employeeApi.list({
        limit: 100,
        status: "active",
        ...(branchId !== "all" ? { branchId } : {}),
        ...(search ? { search } : {}),
      }),
  });
  const templatesQuery = useQuery({
    queryKey: ["shift-templates", { scheduleDaily: true, branchId }],
    queryFn: () => shiftApi.list({ limit: 100, status: "active", ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const scheduleQuery = useQuery({
    queryKey: ["schedules", "daily", { branchId, workDate }],
    queryFn: () => scheduleApi.weekly({ weekStart, ...(branchId !== "all" ? { branchId } : {}) }),
  });
  const employeesById = useMemo(() => new Map((employeesQuery.data?.data ?? []).map((employee) => [employee.id, employee])), [employeesQuery.data?.data]);
  const templatesById = useMemo(() => new Map((templatesQuery.data?.data ?? []).map((template) => [template.id, template])), [templatesQuery.data?.data]);
  const daySchedules = (scheduleQuery.data?.data ?? [])
    .filter((item) => toDateInputValue(item.workDate) === workDate)
    .filter((item) => !search || employeesById.get(item.employeeId)?.fullName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.shiftStartTime.localeCompare(b.shiftStartTime));

  return (
    <ShiftShell
      action={<Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white" to="/dashboard/schedule"><Plus className="h-4 w-4" />Gán ca</Link>}
      onSearchChange={setSearch}
      search="Tìm ca hoặc nhân viên..."
      searchValue={search}
      title="Lịch làm việc"
    >
      <main className="space-y-6 p-6">
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e5e7eb] p-4 xl:flex-row xl:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{formatDateLabel(workDate)}</h2>
              <input className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#444748]" onChange={(event) => setWorkDate(event.target.value)} type="date" value={workDate} />
              <select className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#444748]" onChange={(event) => setBranchId(event.target.value)} value={branchId}>
                <option value="all">Tất cả chi nhánh</option>
                {(branchesQuery.data?.data ?? []).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </div>
            <ViewSwitcher active="day" />
          </div>
          {scheduleQuery.isLoading || employeesQuery.isLoading || templatesQuery.isLoading ? (
            <StatePanel title="Đang tải lịch ngày..." description="Đang lấy các ca đã gán cho ngày đã chọn." />
          ) : daySchedules.length === 0 ? (
            <StatePanel title="Chưa có ca nào" description="Không có ca đã gán cho ngày và bộ lọc hiện tại." />
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {daySchedules.map((schedule) => {
                const employee = employeesById.get(schedule.employeeId);
                const template = templatesById.get(schedule.shiftTemplateId);
                return (
                  <div className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between" key={schedule.id}>
                    <div className="flex items-center gap-3">
                      {employee ? <StaffAvatar employee={employee} /> : null}
                      <div>
                        <p className="font-semibold text-black">{employee?.fullName ?? "Nhân viên chưa rõ"}</p>
                        <p className="text-xs text-[#444748]">{template?.name ?? "Ca đã gán"}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                      <span>{schedule.shiftStartTime} - {schedule.shiftEndTime}</span>
                      <span className={schedule.published ? "rounded-full bg-[#dcfce7] px-3 py-1 text-xs text-[#166534]" : "rounded-full bg-[#ffedd5] px-3 py-1 text-xs text-[#9a3412]"}>
                        {schedule.published ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </ShiftShell>
  );
};

const ShiftShell = ({
  action,
  children,
  onSearchChange,
  search,
  searchValue,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  onSearchChange?: (value: string) => void;
  search: string;
  searchValue?: string;
  title: string;
}) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-6">
      <div className="flex min-w-0 items-center gap-6">
        <h2 className="shrink-0 text-2xl font-semibold tracking-tight text-black">{title}</h2>
        <div className="relative hidden w-96 lg:block">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
          <input
            className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 outline-none focus:ring-1 focus:ring-black"
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={search}
            value={searchValue ?? ""}
          />
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

const toDateInputValue = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDaysInputValue = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
};

const localDraftIdPrefix = "local-draft-";
const localDraftStorageKey = "smartshift:schedule:local-drafts";

const createLocalDraftId = () =>
  `${localDraftIdPrefix}${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;

const isLocalDraftId = (id: string) => id.startsWith(localDraftIdPrefix);

const isLocalDraftAssignedShift = (value: unknown): value is LocalDraftAssignedShift => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<LocalDraftAssignedShift>;
  return (
    draft.localDraft === true &&
    typeof draft.id === "string" &&
    isLocalDraftId(draft.id) &&
    typeof draft.organizationId === "string" &&
    typeof draft.branchId === "string" &&
    typeof draft.employeeId === "string" &&
    typeof draft.shiftTemplateId === "string" &&
    typeof draft.workDate === "string" &&
    typeof draft.shiftStartTime === "string" &&
    typeof draft.shiftEndTime === "string" &&
    draft.status === "scheduled" &&
    draft.published === false
  );
};

const loadLocalDrafts = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(localDraftStorageKey);
    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isLocalDraftAssignedShift) : [];
  } catch {
    return [];
  }
};

const saveLocalDrafts = (drafts: LocalDraftAssignedShift[]) => {
  if (typeof window === "undefined") {
    return;
  }

  if (drafts.length === 0) {
    window.localStorage.removeItem(localDraftStorageKey);
    return;
  }

  window.localStorage.setItem(localDraftStorageKey, JSON.stringify(drafts));
};

const getMonthStartInputValue = (value: Date) => toDateInputValue(new Date(value.getFullYear(), value.getMonth(), 1));

const addMonthsInputValue = (value: string, months: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setMonth(date.getMonth() + months, 1);
  return getMonthStartInputValue(date);
};

const getWeekStartInputValue = (value: Date) => {
  const date = new Date(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return toDateInputValue(date);
};

const buildCalendarWeekStarts = (monthStart: string) => {
  const first = new Date(`${monthStart}T00:00:00`);
  const calendarStart = getWeekStartInputValue(first);
  return Array.from({ length: 6 }, (_, index) => addDaysInputValue(calendarStart, index * 7));
};

const buildMonthCells = (monthStart: string, schedules: AssignedShift[]): MonthCell[] => {
  const first = new Date(`${monthStart}T00:00:00`);
  const calendarStart = getWeekStartInputValue(first);
  const monthKey = monthStart.slice(0, 7);
  const today = toDateInputValue(new Date());
  const schedulesByDate = new Map<string, AssignedShift[]>();

  schedules.forEach((schedule) => {
    const date = toDateInputValue(schedule.workDate);
    schedulesByDate.set(date, [...(schedulesByDate.get(date) ?? []), schedule]);
  });

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDaysInputValue(calendarStart, index);
    return {
      date,
      day: new Date(`${date}T00:00:00`).getDate(),
      inMonth: date.startsWith(monthKey),
      isToday: date === today,
      shifts: schedulesByDate.get(date) ?? [],
    };
  });
};

const buildWeekDays = (weekStart: string) => {
  const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  const nameFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
  const start = new Date(`${weekStart}T00:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: toDateInputValue(date),
      dateLabel: formatter.format(date),
      name: nameFormatter.format(date),
    };
  });
};

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));

const getShiftHours = (start: string, end: string) => {
  const [startHour = 0, startMinute = 0] = start.split(":").map(Number);
  const [endHour = 0, endMinute = 0] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;

  if (endTotal <= startTotal) {
    endTotal += 24 * 60;
  }

  return (endTotal - startTotal) / 60;
};

const TemplateRow = ({
  branchName,
  isUpdatingStatus,
  onEdit,
  onToggleStatus,
  template,
}: {
  branchName?: string;
  isUpdatingStatus: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  template: ShiftTemplate;
}) => (
  <div className="flex items-center px-6 py-4 transition hover:bg-[#fdf8f8]">
    <div className="flex flex-1 items-center gap-6">
      <div className="h-12 w-1 rounded-full" style={{ backgroundColor: template.color ?? "#000000" }} />
      <div className="flex-1">
        <h4 className="font-bold text-black">{template.name}</h4>
        <p className="text-xs text-[#444748]">{template.description || branchName || "No description"}</p>
      </div>
      <div className="hidden w-48 items-center gap-1 text-sm font-semibold md:flex"><Clock3 className="h-4 w-4" />{template.startTime} - {template.endTime}</div>
      <div className="hidden w-40 items-center gap-1 text-sm md:flex"><UsersRound className="h-4 w-4 text-[#444748]" />Break: <b>{template.breakMinutes}m</b></div>
      <div className="w-20">
        <span className={`block h-5 w-10 rounded-full p-0.5 ${template.status === "active" ? "bg-black" : "bg-[#e5e2e1]"}`}>
          <span className={`block h-4 w-4 rounded-full bg-white transition ${template.status === "active" ? "translate-x-5" : ""}`} />
        </span>
      </div>
      <button className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold hover:bg-[#f7f3f2]" onClick={onEdit} type="button">Edit</button>
      <button
        className={
          template.status === "active"
            ? "rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold text-[#ef4444] hover:bg-[#ef4444]/10 disabled:opacity-50"
            : "rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs font-bold text-[#10b981] hover:bg-[#10b981]/10 disabled:opacity-50"
        }
        disabled={isUpdatingStatus}
        onClick={onToggleStatus}
        type="button"
      >
        {template.status === "active" ? "Vô hiệu" : "Kích hoạt"}
      </button>
    </div>
  </div>
);

const WeeklyBoard = ({
  employees,
  onDeleteShift,
  schedules,
  templatesById,
  weekDays,
}: {
  employees: Employee[];
  onDeleteShift: (assignedShiftId: string) => void;
  schedules: AssignedShift[];
  templatesById: Map<string, ShiftTemplate>;
  weekDays: Array<{ date: string; dateLabel: string; name: string }>;
}) => {
  const schedulesByEmployeeDay = useMemo(() => {
    const next = new Map<string, AssignedShift[]>();
    schedules.forEach((schedule) => {
      const key = `${schedule.employeeId}-${toDateInputValue(schedule.workDate)}`;
      next.set(key, [...(next.get(key) ?? []), schedule]);
    });

    next.forEach((daySchedules) => {
      daySchedules.sort((a, b) => a.shiftStartTime.localeCompare(b.shiftStartTime));
    });

    return next;
  }, [schedules]);

  return (
    <div className="isolate overflow-x-auto">
      <table className="w-full min-w-[1200px] table-fixed border-collapse">
        <thead className="bg-white">
          <tr>
            <th className="sticky left-0 z-50 w-64 border-b border-r border-[#e5e7eb] bg-white p-0"><div className="flex h-16 items-center px-6 text-sm font-semibold text-[#444748]">Staff Member</div></th>
            {weekDays.map((day) => {
              const isToday = day.date === toDateInputValue(new Date());
              return <th className="h-16 border-b border-[#e5e7eb] bg-white p-0" key={day.date}><div className={isToday ? "flex flex-col items-center justify-center text-black" : "flex flex-col items-center justify-center"}><span className="text-sm font-semibold">{day.name}</span><span className="text-xs text-[#444748]">{day.dateLabel}</span>{isToday ? <span className="mt-1 h-1 w-1 rounded-full bg-black" /> : null}</div></th>;
            })}
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td className="p-10 text-center text-sm font-semibold text-[#444748]" colSpan={8}>Không có nhân viên đang hoạt động theo bộ lọc hiện tại.</td>
            </tr>
          ) : (
            employees.map((employee) => (
              <ScheduleRow
                employee={employee}
                key={employee.id}
                onDeleteShift={onDeleteShift}
                schedulesByEmployeeDay={schedulesByEmployeeDay}
                templatesById={templatesById}
                weekDays={weekDays}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const ScheduleRow = ({
  employee,
  onDeleteShift,
  schedulesByEmployeeDay,
  templatesById,
  weekDays,
}: {
  employee: Employee;
  onDeleteShift: (assignedShiftId: string) => void;
  schedulesByEmployeeDay: Map<string, AssignedShift[]>;
  templatesById: Map<string, ShiftTemplate>;
  weekDays: Array<{ date: string; dateLabel: string; name: string }>;
}) => (
  <tr className="group relative z-0">
    <td className="sticky left-0 z-10 border-b border-r border-[#e5e7eb] bg-white p-0 align-top transition group-hover:bg-[#f7f3f2]">
      <div className="flex min-h-28 items-start gap-4 px-6 py-4">
        <StaffAvatar employee={employee} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold leading-5">{employee.fullName}</p>
          <p className="truncate text-xs text-[#444748]">{toEmployeeRoleLabel(employee.role)}</p>
        </div>
      </div>
    </td>
    {weekDays.map((day, index) => {
      const assignedShifts = schedulesByEmployeeDay.get(`${employee.id}-${day.date}`) ?? [];
      return (
        <ScheduleCell
          assignedShifts={assignedShifts}
          employee={employee}
          key={`${employee.id}-${day.date}`}
          onDeleteShift={onDeleteShift}
          templatesById={templatesById}
          weekend={index > 4}
        />
      );
    })}
  </tr>
);

const ScheduleCell = ({
  assignedShifts,
  employee,
  onDeleteShift,
  templatesById,
  weekend,
}: {
  assignedShifts: AssignedShift[];
  employee: Employee;
  onDeleteShift: (assignedShiftId: string) => void;
  templatesById: Map<string, ShiftTemplate>;
  weekend?: boolean;
}) => (
  <td className={`relative z-0 border-b border-r border-[#e5e7eb]/70 p-2 align-top ${weekend ? "bg-[#f7f3f2]/60" : ""}`}>
    {assignedShifts.length > 0 ? (
      <div className="space-y-2">
        {assignedShifts.map((assignedShift) => (
          <ShiftPill
            assignedShift={assignedShift}
            employee={employee}
            key={assignedShift.id}
            onDeleteShift={onDeleteShift}
            shiftTemplate={templatesById.get(assignedShift.shiftTemplateId)}
          />
        ))}
      </div>
    ) : (
      <div className="flex h-full min-h-20 items-center justify-center rounded-lg border border-dashed border-transparent text-xs text-[#747878] opacity-0 transition hover:border-[#e5e7eb] hover:opacity-100">Open</div>
    )}
  </td>
);

const ShiftPill = ({
  assignedShift,
  employee,
  onDeleteShift,
  shiftTemplate,
}: {
  assignedShift: AssignedShift;
  employee: Employee;
  onDeleteShift: (assignedShiftId: string) => void;
  shiftTemplate?: ShiftTemplate;
}) => {
  const name = shiftTemplate?.name ?? "Ca đã gán";
  const primary = assignedShift.published;
  const muted = assignedShift.status !== "scheduled";
  const accent = shiftTemplate?.color ?? (primary ? "#111111" : "#0058be");
  return (
    <div className={muted ? "group/pill min-w-0 rounded-lg border-l-4 border-[#747878] bg-[#e5e2e1] p-2" : primary ? "group/pill min-w-0 rounded-lg border-l-4 bg-[#e6e1df] p-2" : "group/pill min-w-0 rounded-lg border-l-4 bg-[#d8e2ff]/30 p-2"} style={{ borderLeftColor: accent }}>
      <div className="flex items-start justify-between gap-2">
        <span className={primary ? "min-w-0 text-xs font-bold text-black" : muted ? "min-w-0 text-xs font-bold text-[#1c1b1b]" : "min-w-0 text-xs font-bold text-[#0058be]"}>{assignedShift.shiftStartTime} - {assignedShift.shiftEndTime}</span>
        <button className="shrink-0 opacity-0 transition hover:text-[#ef4444] group-hover/pill:opacity-100" onClick={() => onDeleteShift(assignedShift.id)} title="Xóa ca đã gán" type="button"><X className="h-3.5 w-3.5" /></button>
      </div>
      <p className="mt-1 break-words text-[11px] font-medium leading-4">{name}</p>
      <div className="mt-2 flex min-w-0 items-center gap-2 border-t border-black/5 pt-2">
        <StaffAvatar employee={employee} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="break-words text-[11px] font-bold leading-4 text-black">{employee.fullName}</p>
          <p className="truncate text-[10px] font-medium text-[#747878]">{toEmployeeRoleLabel(employee.role)}</p>
        </div>
      </div>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#747878]">{assignedShift.published ? "Đã xuất bản" : "Bản nháp"}</p>
    </div>
  );
};

const ScheduleSummary = ({ assignedCount, draftCount, totalHours }: { assignedCount: number; draftCount: number; totalHours: number }) => (
  <footer className="border-t border-[#e5e7eb] bg-white p-6">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <SummaryItem label="Tổng giờ" value={totalHours.toFixed(1)} meta="đã lên lịch trong tuần" tone="success" />
      <SummaryItem label="Ca đã gán" value={String(assignedCount)} meta="từ dữ liệu lịch" />
      <SummaryItem label="Ca nháp" value={String(draftCount)} meta="chờ xuất bản" tone={draftCount > 0 ? "danger" : undefined} />
      <div><span className="text-xs font-bold uppercase tracking-wider text-[#444748]">Trạng thái</span><div className="mt-2 flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${draftCount > 0 ? "bg-[#ef4444]" : "bg-[#10b981]"}`} /><b>{draftCount > 0 ? "Còn bản nháp" : "Đã xuất bản"}</b></div></div>
    </div>
  </footer>
);

const SummaryItem = ({ label, meta, tone, value }: { label: string; meta: string; tone?: "success" | "danger"; value: string }) => (
  <div><span className="text-xs font-bold uppercase tracking-wider text-[#444748]">{label}</span><div className="flex items-end gap-2"><span className={tone === "danger" ? "text-2xl font-semibold text-[#ef4444]" : "text-2xl font-semibold"}>{value}</span><span className={tone === "success" ? "pb-1 text-xs font-bold text-[#10b981]" : "pb-1 text-xs text-[#444748]"}>{meta}</span></div></div>
);

const StaffAvatar = ({ employee, size = "md" }: { employee: Employee; size?: "md" | "sm" }) => {
  const className =
    size === "sm"
      ? "h-6 w-6 rounded-full border border-white object-cover"
      : "h-10 w-10 rounded-full border border-[#e5e7eb] object-cover";
  const initialsClassName =
    size === "sm"
      ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-[#f1edec] text-[9px] font-bold text-black"
      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f1edec] text-xs font-bold text-black";

  return employee.avatar ? (
    <img alt={employee.fullName} className={className} src={employee.avatar} />
  ) : (
    <div className={initialsClassName}>{getInitials(employee.fullName)}</div>
  );
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";

const toEmployeeRoleLabel = (role: Employee["role"]) => {
  if (role === "owner") return "Owner";
  if (role === "manager") return "Manager";
  return "Staff";
};

const AssignedShiftModal = ({
  branchId,
  branches,
  employees,
  onCreateDrafts,
  onClose,
  templates,
  weekStart,
}: {
  branchId: string;
  branches: Branch[];
  employees: Employee[];
  onCreateDrafts: (drafts: LocalDraftAssignedShift[]) => void;
  onClose: () => void;
  templates: ShiftTemplate[];
  weekStart: string;
}) => {
  const defaultBranchId = branchId !== "all" ? branchId : branches[0]?.id ?? "";
  const [selectedBranchId, setSelectedBranchId] = useState(defaultBranchId);
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [shiftTemplateId, setShiftTemplateId] = useState("");
  const [workDate, setWorkDate] = useState(weekStart < toDateInputValue(new Date()) ? toDateInputValue(new Date()) : weekStart);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const branchEmployees = employees.filter((employee) => !selectedBranchId || employee.branchId === selectedBranchId);
  const branchTemplates = templates.filter((template) => !selectedBranchId || template.branchId === selectedBranchId);
  const selectedTemplate = branchTemplates.find((template) => template.id === shiftTemplateId);

  useEffect(() => {
    setEmployeeIds((current) => {
      const availableIds = new Set(branchEmployees.map((employee) => employee.id));
      return current.filter((id) => availableIds.has(id));
    });
    setShiftTemplateId((current) => (branchTemplates.some((template) => template.id === current) ? current : branchTemplates[0]?.id ?? ""));
  }, [branchEmployees, branchTemplates]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!selectedTemplate) {
      setError("Vui lòng chọn mẫu ca đang hoạt động trước khi gán ca.");
      return;
    }

    const selectedBranch = branches.find((branch) => branch.id === selectedBranchId);
    const drafts = employeeIds.map((employeeId) => ({
      id: createLocalDraftId(),
      organizationId: selectedBranch?.organizationId ?? selectedTemplate.organizationId,
      branchId: selectedBranchId,
      employeeId,
      shiftTemplateId,
      workDate,
      shiftStartTime: selectedTemplate.startTime,
      shiftEndTime: selectedTemplate.endTime,
      status: "scheduled" as const,
      published: false,
      localDraft: true as const,
      ...(note ? { note } : {}),
    }));

    onCreateDrafts(drafts);
    onClose();
  };

  const toggleEmployee = (employeeId: string) => {
    setEmployeeIds((current) =>
      current.includes(employeeId) ? current.filter((id) => id !== employeeId) : [...current, employeeId]
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-[#fdf8f8] px-5 py-3">
          <div><h2 className="text-xl font-semibold tracking-tight text-black">Gán ca</h2><p className="text-xs text-[#444748]">Tạo một lịch ca từ mẫu ca đang hoạt động.</p></div>
          <button className="rounded-full p-2 hover:bg-[#ebe7e6]" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            {branches.length === 0 ? <div className="rounded-lg border border-[#ef4444]/20 bg-[#ffdad6]/40 p-4 text-sm font-semibold text-[#93000a]">Hãy tạo chi nhánh đang hoạt động trước khi gán ca.</div> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2"><span className="text-sm font-semibold">Chi nhánh</span><select className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none" onChange={(event) => setSelectedBranchId(event.target.value)} required value={selectedBranchId}><option value="">Chọn chi nhánh</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
              <label className="space-y-2"><span className="text-sm font-semibold">Ngày làm việc</span><input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-4 outline-none" min={toDateInputValue(new Date())} onChange={(event) => setWorkDate(event.target.value)} required type="date" value={workDate} /></label>
              <label className="space-y-2"><span className="text-sm font-semibold">Mẫu ca</span><select className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none" onChange={(event) => setShiftTemplateId(event.target.value)} required value={shiftTemplateId}><option value="">Chọn mẫu</option>{branchTemplates.map((template) => <option key={template.id} value={template.id}>{template.name} ({template.startTime} - {template.endTime})</option>)}</select></label>
              <div className="col-span-full space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">Nhân viên</span>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-[#e5e7eb] px-3 py-1 text-xs font-semibold hover:bg-[#f7f3f2]" onClick={() => setEmployeeIds(branchEmployees.map((employee) => employee.id))} type="button">Chọn tất cả</button>
                    <button className="rounded-lg border border-[#e5e7eb] px-3 py-1 text-xs font-semibold hover:bg-[#f7f3f2]" onClick={() => setEmployeeIds([])} type="button">Bỏ chọn</button>
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white p-2">
                  {branchEmployees.length === 0 ? (
                    <p className="px-2 py-3 text-sm font-semibold text-[#747878]">Không có nhân viên đang hoạt động trong chi nhánh này.</p>
                  ) : (
                    <div className="grid gap-1 md:grid-cols-2">
                      {branchEmployees.map((employee) => (
                        <label className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#f7f3f2]" key={employee.id}>
                          <input checked={employeeIds.includes(employee.id)} className="h-4 w-4 shrink-0 rounded border-[#e5e7eb]" onChange={() => toggleEmployee(employee.id)} type="checkbox" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-black">{employee.fullName}</span>
                            <span className="block truncate text-xs text-[#747878]">{toEmployeeRoleLabel(employee.role)}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#444748]">Đã chọn {employeeIds.length} nhân viên</p>
              </div>
              <div className="col-span-full grid grid-cols-2 gap-4 rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] p-3"><div><span className="text-xs text-[#444748]">Giờ bắt đầu</span><p className="text-xl font-semibold">{selectedTemplate?.startTime ?? "--:--"}</p></div><div><span className="text-xs text-[#444748]">Giờ kết thúc</span><p className="text-xl font-semibold">{selectedTemplate?.endTime ?? "--:--"}</p></div></div>
              <label className="col-span-full space-y-2"><span className="text-sm font-semibold">Ghi chú ca</span><textarea className="min-h-20 w-full resize-none rounded-lg border border-[#e5e7eb] px-4 py-2 outline-none" onChange={(event) => setNote(event.target.value)} placeholder="Nhiệm vụ cụ thể, yêu cầu phủ ca hoặc nhắc nhở..." value={note} /></label>
            </div>
            {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e5e7eb] bg-[#fdf8f8] px-5 py-3">
            <button className="rounded-lg border border-[#e5e7eb] px-6 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" onClick={onClose} type="button">Hủy</button>
            <button className="rounded-lg bg-black px-8 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!selectedBranchId || employeeIds.length === 0 || !shiftTemplateId} type="submit">{`Thêm ${employeeIds.length} bản nháp`}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShiftCreateTemplateOverlay = () => {
  const branchesQuery = useQuery({
    queryKey: ["branches", { shiftCreate: true }],
    queryFn: () => branchApi.list({ limit: 100, status: "active" }),
  });

  return (
    <ShiftTemplateModal
      branches={branchesQuery.data?.data ?? []}
      closeTo="/dashboard/shifts"
      mode="create"
    />
  );
};

const ShiftTemplateModal = ({
  branches,
  closeTo,
  mode,
  onClose,
  template,
}: {
  branches: Branch[];
  closeTo: string;
  mode: "create" | "edit";
  onClose?: () => void;
  template?: ShiftTemplate;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState(template?.branchId ?? branches[0]?.id ?? "");
  const [name, setName] = useState(template?.name ?? "");
  const [startTime, setStartTime] = useState(template?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(template?.endTime ?? "16:00");
  const [breakMinutes, setBreakMinutes] = useState(String(template?.breakMinutes ?? 0));
  const [description, setDescription] = useState(template?.description ?? "");
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        startTime,
        endTime,
        breakMinutes: Number(breakMinutes),
        ...(description ? { description } : {}),
      };

      if (mode === "edit" && template) {
        return shiftApi.update(template.id, payload);
      }

      return shiftApi.create({
        branchId,
        ...payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shift-templates"] });
      if (onClose) {
        onClose();
      } else {
        navigate(closeTo, { replace: true });
      }
    },
    onError: (err) => setError(getApiErrorMessage(err, "Không thể lưu mẫu ca.")),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    saveMutation.mutate();
  };

  const closeControl = onClose ? (
    <button className="rounded-full p-2 hover:bg-[#ebe7e6]" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
  ) : (
    <Link className="rounded-full p-2 hover:bg-[#ebe7e6]" to={closeTo}><X className="h-5 w-5" /></Link>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fdf8f8] px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-black">{mode === "edit" ? "Chỉnh sửa mẫu ca" : "Tạo mẫu ca"}</h2>
            <p className="text-xs text-[#444748]">Mẫu ca dùng để gán nhanh vào lịch làm việc.</p>
          </div>
          {closeControl}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            {branches.length === 0 && mode === "create" ? (
              <div className="rounded-lg border border-[#ef4444]/20 bg-[#ffdad6]/40 p-4 text-sm font-semibold text-[#93000a]">
                Hãy tạo chi nhánh đang hoạt động trước khi thêm mẫu ca.
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Chi nhánh</span>
                <select
                  className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none"
                  disabled={mode === "edit"}
                  onChange={(event) => setBranchId(event.target.value)}
                  required
                  value={branchId}
                >
                  <option value="">Chọn chi nhánh</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Tên mẫu ca</span>
                <input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-4 outline-none" onChange={(event) => setName(event.target.value)} required value={name} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Giờ bắt đầu</span>
                <input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-4 outline-none" onChange={(event) => setStartTime(event.target.value)} required type="time" value={startTime} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Giờ kết thúc</span>
                <input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-4 outline-none" onChange={(event) => setEndTime(event.target.value)} required type="time" value={endTime} />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold">Số phút nghỉ</span>
                <input className="h-10 w-full rounded-lg border border-[#e5e7eb] px-4 outline-none" min={0} onChange={(event) => setBreakMinutes(event.target.value)} required type="number" value={breakMinutes} />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold">Mô tả</span>
                <textarea className="min-h-[90px] w-full resize-none rounded-lg border border-[#e5e7eb] px-4 py-2 outline-none" onChange={(event) => setDescription(event.target.value)} value={description} />
              </label>
            </div>
            {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-[#e5e7eb] bg-[#fdf8f8] px-6 py-4">
            {onClose ? <button className="rounded-lg border border-[#e5e7eb] px-6 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" onClick={onClose} type="button">Hủy</button> : <Link className="rounded-lg border border-[#e5e7eb] px-6 py-2 text-sm font-semibold hover:bg-[#f7f3f2]" to={closeTo}>Hủy</Link>}
            <button className="rounded-lg bg-black px-8 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={saveMutation.isPending || (mode === "create" && !branchId)} type="submit">
              {saveMutation.isPending ? "Đang lưu..." : mode === "edit" ? "Lưu thay đổi" : "Tạo mẫu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatePanel = ({ description, title }: { description: string; title: string }) => (
  <div className="p-10 text-center">
    <p className="text-lg font-semibold text-black">{title}</p>
    <p className="mt-2 text-sm text-[#444748]">{description}</p>
  </div>
);

const ViewSwitcher = ({ active }: { active: "day" | "week" | "month" }) => (
  <div className="rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-1">
    <Link className={active === "day" ? "inline-block rounded-md bg-white px-4 py-1 text-sm font-semibold shadow-sm" : "inline-block px-4 py-1 text-sm font-semibold text-[#444748]"} to="/dashboard/schedule/daily">Ngày</Link>
    <Link className={active === "week" ? "inline-block rounded-md bg-white px-4 py-1 text-sm font-semibold shadow-sm" : "inline-block px-4 py-1 text-sm font-semibold text-[#444748]"} to="/dashboard/schedule">Tuần</Link>
    <Link className={active === "month" ? "inline-block rounded-md bg-white px-4 py-1 text-sm font-semibold shadow-sm" : "inline-block px-4 py-1 text-sm font-semibold text-[#444748]"} to="/dashboard/schedule/monthly">Tháng</Link>
  </div>
);

type MonthCell = {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  shifts: AssignedShift[];
};

const MonthlyCalendar = ({
  cells,
  employeesById,
  templatesById,
}: {
  cells: MonthCell[];
  employeesById: Map<string, Employee>;
  templatesById: Map<string, ShiftTemplate>;
}) => {
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <>
      <div className="grid grid-cols-7 border-b border-[#e5e7eb] bg-[#f7f3f2]">
        {labels.map((label) => <div className="px-4 py-2 text-center text-sm font-semibold text-[#444748]" key={label}>{label}</div>)}
      </div>
      <div className="grid min-h-[720px] grid-cols-7 grid-rows-6">
        {cells.map((cell) => (
          <CalendarCell cell={cell} employeesById={employeesById} key={cell.date} templatesById={templatesById} />
        ))}
      </div>
    </>
  );
};

const CalendarCell = ({
  cell,
  employeesById,
  templatesById,
}: {
  cell: MonthCell;
  employeesById: Map<string, Employee>;
  templatesById: Map<string, ShiftTemplate>;
}) => (
  <div className={`relative border-b border-r border-[#e5e7eb] p-2 transition hover:bg-[#f7f3f2] ${cell.inMonth ? "" : "bg-[#f7f3f2] opacity-50"} ${cell.isToday ? "bg-black/5 ring-1 ring-inset ring-black/20" : ""}`}>
    <span className={cell.isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white" : "text-xs font-semibold"}>{cell.day}</span>
    <div className="mt-1 space-y-1">
      {cell.shifts.slice(0, 3).map((shift) => {
        const template = templatesById.get(shift.shiftTemplateId);
        const employee = employeesById.get(shift.employeeId);
        return (
          <div className="rounded-sm border-l-2 bg-[#0058be]/10 px-1 py-0.5" key={shift.id} style={{ borderLeftColor: template?.color ?? "#0058be" }}>
            <p className="truncate text-[10px] font-bold text-[#0058be]">{shift.shiftStartTime} {employee?.fullName ?? template?.name ?? "Ca làm"}</p>
          </div>
        );
      })}
      {cell.shifts.length > 3 ? (
        <div className="rounded-sm border-l-2 border-black bg-black/5 px-1 py-0.5">
          <p className="truncate text-[10px] font-bold text-black">+{cell.shifts.length - 3} ca</p>
        </div>
      ) : null}
    </div>
  </div>
);
