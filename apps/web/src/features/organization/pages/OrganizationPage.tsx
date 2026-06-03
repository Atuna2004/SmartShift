import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Building2, CreditCard, Save, Settings2, ShieldCheck } from "lucide-react";
import { organizationApi } from "@/features/organization/organization.api";
import type { OrganizationBusinessType, OrganizationSubscriptionPlan, OrganizationSubscriptionStatus } from "@/features/organization/organization.types";
import { subscriptionApi } from "@/features/subscription/subscription.api";
import { getApiErrorMessage } from "@/shared/api";
import { useAuthStore } from "@/store";

export const OrganizationPage = () => {
  const queryClient = useQueryClient();
  const organizationId = useAuthStore((state) => state.user?.organizationId);
  const organizationQuery = useQuery({
    queryKey: ["organization", "me", organizationId],
    queryFn: () => organizationApi.me(organizationId),
  });
  const subscriptionQuery = useQuery({
    queryKey: ["subscription", "current", organizationId],
    queryFn: () => subscriptionApi.current(organizationId),
  });
  const organization = organizationQuery.data;
  const [profile, setProfile] = useState({
    name: "",
    slug: "",
    businessType: "other" as OrganizationBusinessType,
    phone: "",
    email: "",
    address: "",
    logo: "",
  });
  const [settings, setSettings] = useState({
    timezone: "Asia/Ho_Chi_Minh",
    defaultLateThresholdMinutes: 15,
    defaultQrExpiresInSeconds: 60,
    defaultRequireGps: true,
    defaultAllowEarlyCheckInMinutes: 0,
    defaultAllowLateCheckOutMinutes: 0,
  });
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    plan: "free" as OrganizationSubscriptionPlan,
    status: "trialing" as OrganizationSubscriptionStatus,
    maxBranches: 0,
    maxEmployees: 0,
  });

  useEffect(() => {
    if (!organization) return;
    setProfile({
      name: organization.name,
      slug: organization.slug ?? "",
      businessType: organization.businessType ?? "other",
      phone: organization.phone ?? "",
      email: organization.email ?? "",
      address: organization.address ?? "",
      logo: organization.logo ?? "",
    });
    setSettings(organization.settings);
    setSubscriptionInfo({
      plan: organization.subscription.plan,
      status: organization.subscription.status,
      maxBranches: organization.subscription.maxBranches ?? 0,
      maxEmployees: organization.subscription.maxEmployees ?? 0,
    });
  }, [organization]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["organization"] });
    void queryClient.invalidateQueries({ queryKey: ["subscription"] });
  };
  const profileMutation = useMutation({
    mutationFn: () =>
      organizationApi.updateProfile({
        name: profile.name,
        ...(profile.slug ? { slug: profile.slug } : {}),
        businessType: profile.businessType,
        ...(profile.phone ? { phone: profile.phone } : {}),
        ...(profile.email ? { email: profile.email } : {}),
        ...(profile.address ? { address: profile.address } : {}),
        ...(profile.logo ? { logo: profile.logo } : {}),
      }, organizationId),
    onSuccess: invalidate,
  });
  const settingsMutation = useMutation({
    mutationFn: () => organizationApi.updateSettings(settings, organizationId),
    onSuccess: invalidate,
  });
  const subscriptionMutation = useMutation({
    mutationFn: () => organizationApi.updateSubscriptionInfo(subscriptionInfo, organizationId),
    onSuccess: invalidate,
  });
  const error = organizationQuery.error ?? subscriptionQuery.error ?? profileMutation.error ?? settingsMutation.error ?? subscriptionMutation.error;

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">Thông tin doanh nghiệp</h1>
        <p className="text-sm text-[#444748]">Cập nhật hồ sơ, cài đặt vận hành và metadata gói đăng ký.</p>
      </header>
      {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{getApiErrorMessage(error, "Không thể lưu thông tin doanh nghiệp.")}</p> : null}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric icon={<Building2 />} label="Trạng thái" value={organization?.status ?? "--"} />
        <Metric icon={<CreditCard />} label="Gói active" value={subscriptionQuery.data?.planName ?? organization?.subscription.plan ?? "--"} />
        <Metric icon={<ShieldCheck />} label="GPS mặc định" value={settings.defaultRequireGps ? "Bật" : "Tắt"} />
      </section>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <form className="rounded-xl border border-[#e5e7eb] bg-white p-6" onSubmit={(event) => submit(event, profileMutation.mutate)}>
          <SectionTitle icon={<Building2 />} title="Hồ sơ doanh nghiệp" />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Tên" onChange={(value) => setProfile((current) => ({ ...current, name: value }))} required value={profile.name} />
            <TextField label="Mã định danh" onChange={(value) => setProfile((current) => ({ ...current, slug: value }))} value={profile.slug} />
            <SelectField label="Loại hình" onChange={(value) => setProfile((current) => ({ ...current, businessType: value as OrganizationBusinessType }))} options={["cafe", "restaurant", "retail", "service", "other"]} value={profile.businessType} />
            <TextField label="Số điện thoại" onChange={(value) => setProfile((current) => ({ ...current, phone: value }))} value={profile.phone} />
            <TextField label="Email" onChange={(value) => setProfile((current) => ({ ...current, email: value }))} type="email" value={profile.email} />
            <TextField label="Đường dẫn logo" onChange={(value) => setProfile((current) => ({ ...current, logo: value }))} value={profile.logo} />
            <div className="md:col-span-2"><TextField label="Địa chỉ" onChange={(value) => setProfile((current) => ({ ...current, address: value }))} value={profile.address} /></div>
          </div>
          <SubmitButton loading={profileMutation.isPending} />
        </form>
        <form className="rounded-xl border border-[#e5e7eb] bg-white p-6" onSubmit={(event) => submit(event, settingsMutation.mutate)}>
          <SectionTitle icon={<Settings2 />} title="Cài đặt vận hành" />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Múi giờ" onChange={(value) => setSettings((current) => ({ ...current, timezone: value }))} required value={settings.timezone} />
            <NumberField label="Ngưỡng đi muộn phút" onChange={(value) => setSettings((current) => ({ ...current, defaultLateThresholdMinutes: value }))} value={settings.defaultLateThresholdMinutes} />
            <NumberField label="QR hết hạn giây" onChange={(value) => setSettings((current) => ({ ...current, defaultQrExpiresInSeconds: value }))} value={settings.defaultQrExpiresInSeconds} />
            <NumberField label="Cho check-in sớm phút" onChange={(value) => setSettings((current) => ({ ...current, defaultAllowEarlyCheckInMinutes: value }))} value={settings.defaultAllowEarlyCheckInMinutes} />
            <NumberField label="Cho check-out muộn phút" onChange={(value) => setSettings((current) => ({ ...current, defaultAllowLateCheckOutMinutes: value }))} value={settings.defaultAllowLateCheckOutMinutes} />
            <label className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm font-semibold"><input checked={settings.defaultRequireGps} className="h-4 w-4" onChange={(event) => setSettings((current) => ({ ...current, defaultRequireGps: event.target.checked }))} type="checkbox" />Yêu cầu GPS mặc định</label>
          </div>
          <SubmitButton loading={settingsMutation.isPending} />
        </form>
      </div>
      <form className="rounded-xl border border-[#e5e7eb] bg-white p-6" onSubmit={(event) => submit(event, subscriptionMutation.mutate)}>
        <SectionTitle icon={<CreditCard />} title="Metadata gói đăng ký" />
        <div className="grid gap-4 md:grid-cols-4">
          <SelectField label="Gói" onChange={(value) => setSubscriptionInfo((current) => ({ ...current, plan: value as OrganizationSubscriptionPlan }))} options={["free", "basic", "pro"]} value={subscriptionInfo.plan} />
          <SelectField label="Trạng thái" onChange={(value) => setSubscriptionInfo((current) => ({ ...current, status: value as OrganizationSubscriptionStatus }))} options={["trialing", "active", "past_due", "cancelled"]} value={subscriptionInfo.status} />
          <NumberField label="Số chi nhánh tối đa" onChange={(value) => setSubscriptionInfo((current) => ({ ...current, maxBranches: value }))} value={subscriptionInfo.maxBranches} />
          <NumberField label="Số nhân viên tối đa" onChange={(value) => setSubscriptionInfo((current) => ({ ...current, maxEmployees: value }))} value={subscriptionInfo.maxEmployees} />
        </div>
        <SubmitButton loading={subscriptionMutation.isPending} />
      </form>
    </main>
  );
};

const submit = (event: FormEvent<HTMLFormElement>, action: () => void) => {
  event.preventDefault();
  action();
};

const SectionTitle = ({ icon, title }: { icon: ReactNode; title: string }) => <div className="mb-5 flex items-center gap-2 text-xl font-semibold">{icon}{title}</div>;
const TextField = ({ label, onChange, required, type = "text", value }: { label: string; onChange: (value: string) => void; required?: boolean; type?: string; value: string }) => <label className="block space-y-1"><span className="text-sm font-semibold">{label}</span><input className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3 outline-none focus:ring-1 focus:ring-black" onChange={(event) => onChange(event.target.value)} required={required} type={type} value={value} /></label>;
const NumberField = ({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) => <TextField label={label} onChange={(next) => onChange(Number(next))} type="number" value={String(value)} />;
const SelectField = ({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) => <label className="block space-y-1"><span className="text-sm font-semibold">{label}</span><select className="h-11 w-full rounded-lg border border-[#e5e7eb] px-3 outline-none focus:ring-1 focus:ring-black" onChange={(event) => onChange(event.target.value)} value={value}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
const SubmitButton = ({ loading }: { loading: boolean }) => <button className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} type="submit"><Save className="h-4 w-4" />{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>;
const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <div className="rounded-xl border border-[#e5e7eb] bg-white p-5"><div className="mb-3 text-[#444748]">{icon}</div><p className="text-xs font-bold uppercase text-[#444748]">{label}</p><p className="text-2xl font-semibold">{value}</p></div>;
