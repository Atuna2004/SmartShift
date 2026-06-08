import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { cn } from "@/shared/utils/cn";
import { getApiErrorMessage } from "@/shared/api";
import { authApi } from "@/features/auth/auth.api";
import { paymentApi } from "@/features/payment/payment.api";
import { useAuthStore } from "@/store";

const inputClass =
  "h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black";
const iconInputClass =
  "h-12 w-full rounded-lg border border-[#e5e7eb] bg-white py-3 pl-12 pr-4 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black";

const toOrganizationBusinessType = (value: string): "cafe" | "restaurant" | "retail" | "service" | "other" => {
  if (value === "cafe" || value === "restaurant" || value === "retail") return value;
  if (value === "nail-salon" || value === "healthcare") return "service";
  return "other";
};

export const RegisterPage = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [employeeSize, setEmployeeSize] = useState("");
  const [plan, setPlan] = useState<"trial" | "basic" | "organization" | "">("trial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStep((current) => Math.min(current + 1, 3));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (plan === "trial") {
        const result = await authApi.registerOwner({
          fullName,
          email,
          password,
          ...(phone ? { phone } : {}),
          organization: {
            name: branchName,
            businessType: toOrganizationBusinessType(businessType),
            email,
            ...(phone ? { phone } : {}),
            ...(branchAddress ? { address: branchAddress } : {}),
          },
          branch: {
            name: branchName,
            ...(branchAddress ? { address: branchAddress } : {}),
            ...(phone ? { phone } : {}),
          },
        });

        setAuth(result);
        window.location.assign("/dashboard");
        return;
      }

      const result = await paymentApi.createRegistrationCheckout({
        fullName,
        email,
        password,
        ...(phone ? { phone } : {}),
        planCode: plan === "organization" ? "pro_99k" : "basic_49k",
        organization: {
          name: branchName,
          businessType: toOrganizationBusinessType(businessType),
          email,
          ...(phone ? { phone } : {}),
          ...(branchAddress ? { address: branchAddress } : {}),
        },
        branch: {
          name: branchName,
          ...(branchAddress ? { address: branchAddress } : {}),
          ...(phone ? { phone } : {}),
        },
      });

      sessionStorage.setItem("registrationIntentId", result.intentId);
      sessionStorage.setItem("registrationCompletionToken", result.completionToken);
      window.location.assign(result.checkoutUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo tài khoản. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell mode="register">
      <div className="w-full max-w-lg">
        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleNext}>
            <ProgressHeader percent={25} stepLabel="Bước 1/4: Thông tin cá nhân" />
            <IconField icon={<User className="h-5 w-5" />} label="Họ và tên">
              <input
                className={iconInputClass}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Cooper"
                required
                value={fullName}
              />
            </IconField>
            <IconField icon={<Mail className="h-5 w-5" />} label="Địa chỉ email">
              <input
                className={iconInputClass}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                required
                type="email"
                value={email}
              />
            </IconField>
            <IconField icon={<Phone className="h-5 w-5" />} label="Số điện thoại">
              <input
                className={iconInputClass}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+84 900 000 000"
                required
                type="tel"
                value={phone}
              />
            </IconField>
            <IconField icon={<Lock className="h-5 w-5" />} label="Tạo mật khẩu">
              <input
                className={iconInputClass}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </IconField>
            <PasswordStrength score={strength} hasValue={password.length > 0} />
            <PrimaryButton>Bước tiếp theo</PrimaryButton>
            <p className="text-center text-xs leading-5 text-[#444748]">
              Bằng cách tiếp tục, bạn đồng ý với <a className="text-black underline" href="#terms">Điều khoản dịch vụ</a> và{" "}
              <a className="text-black underline" href="#privacy">Chính sách quyền riêng tư</a>.
            </p>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="space-y-6" onSubmit={handleNext}>
            <ProgressHeader percent={50} stepLabel="Bước 2/4: Thông tin doanh nghiệp" />
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
              <h2 className="mb-1 text-2xl font-semibold tracking-tight">Thông tin doanh nghiệp</h2>
              <p className="mb-6 text-sm text-[#444748]">Thiết lập thông tin chi nhánh của bạn.</p>
              <div className="space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold">Tên chi nhánh</span>
                  <input
                    className={inputClass}
                    onChange={(event) => setBranchName(event.target.value)}
                    placeholder="Chi nhánh trung tâm"
                    required
                    value={branchName}
                  />
                </label>
                <IconField icon={<MapPin className="h-5 w-5" />} label="Địa chỉ chi nhánh">
                  <input
                    className={iconInputClass}
                    onChange={(event) => setBranchAddress(event.target.value)}
                    placeholder="Bắt đầu nhập địa chỉ..."
                    required
                    value={branchAddress}
                  />
                </IconField>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold">Loại hình kinh doanh</span>
                    <select className={inputClass} onChange={(event) => setBusinessType(event.target.value)} required value={businessType}>
                      <option value="">Chọn loại hình</option>
                      <option value="cafe">Quán cà phê</option>
                      <option value="restaurant">Nhà hàng</option>
                      <option value="nail-salon">Tiệm nail</option>
                      <option value="retail">Bán lẻ</option>
                      <option value="healthcare">Y tế</option>
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold">Quy mô nhân sự</span>
                    <select className={inputClass} onChange={(event) => setEmployeeSize(event.target.value)} required value={employeeSize}>
                      <option value="">Chọn quy mô</option>
                      <option value="1-5">1-5 nhân viên</option>
                      <option value="6-20">6-20 nhân viên</option>
                      <option value="21-50">21-50 nhân viên</option>
                      <option value="50+">Từ 50 nhân viên trở lên</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <StepActions onBack={() => setStep(1)} />
          </form>
        ) : null}

        {step === 3 ? (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <ProgressHeader percent={75} stepLabel="Bước 3/4: Chọn gói" />
            <div className="text-center">
              <h1 className="mb-2 text-4xl font-semibold tracking-tight">Chọn gói phù hợp</h1>
              <p className="text-base leading-7 text-[#444748]">
                Các gói linh hoạt được thiết kế để phát triển cùng doanh nghiệp của bạn.
              </p>
            </div>
            <div className="grid gap-4">
              <PlanCard
                badge="14 ngày"
                features={["Dùng thử đầy đủ tính năng", "Không cần thanh toán ngay", "Tạo chi nhánh và nhân viên để trải nghiệm", "Nâng cấp bất cứ lúc nào"]}
                label="Bắt đầu nhanh"
                name="Dùng thử miễn phí"
                price="0đ"
                selected={plan === "trial"}
                onClick={() => setPlan("trial")}
              />
              <PlanCard
                features={["Tối đa 10 nhân viên", "Lập lịch tự động cơ bản", "Truy cập ứng dụng di động cho đội ngũ", "Hỗ trợ qua email"]}
                label="Dành cho cá nhân"
                name="Gói cơ bản"
                price="49.000đ"
                selected={plan === "basic"}
                onClick={() => setPlan("basic")}
              />
              <PlanCard
                badge="Most Popular"
                features={["Không giới hạn nhân viên", "Lập lịch thông minh bằng AI", "Bảng phân tích nâng cao", "Hỗ trợ ưu tiên 24/7"]}
                label="Dành cho đội nhóm"
                name="Gói tổ chức"
                price="99.000đ"
                selected={plan === "organization"}
                onClick={() => setPlan("organization")}
              />
            </div>
            {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
            <div className="rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4">
              <p className="mb-4 text-sm font-semibold text-[#444748]">
                {plan ? <>Đã chọn: <span className="text-black">{plan === "trial" ? "Dùng thử miễn phí 14 ngày" : plan === "basic" ? "Gói cơ bản" : "Gói tổ chức"}</span></> : "Vui lòng chọn một gói để tiếp tục"}
              </p>
              <StepActions
                disabled={!plan || isSubmitting}
                nextLabel={isSubmitting ? "Đang tạo tài khoản..." : plan === "trial" ? "Bắt đầu dùng thử" : "Thanh toán và hoàn tất"}
                onBack={() => setStep(2)}
                submit
              />
            </div>
          </form>
        ) : null}

        <p className="mt-8 text-center text-sm text-[#444748] md:hidden">
          Bạn đã có tài khoản?{" "}
          <Link className="font-semibold text-black underline" to="/login">
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

const ProgressHeader = ({ percent, stepLabel }: { percent: number; stepLabel: string }) => (
  <div className="mb-8">
    <div className="mb-2 flex items-end justify-between gap-4">
      <div>
        <span className="text-sm font-semibold uppercase tracking-wider text-[#444748]">Thiết lập ban đầu</span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1b1b]">{stepLabel}</h1>
      </div>
      <span className="shrink-0 text-sm font-semibold text-black">{percent}% hoàn tất</span>
    </div>
    <div className="h-1 w-full overflow-hidden rounded-full bg-[#f1edec]">
      <div className="h-full rounded-full bg-black transition-all" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const IconField = ({ children, icon, label }: { children: ReactNode; icon: ReactNode; label: string }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-[#1c1b1b]">{label}</span>
    <span className="relative block">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444748]">{icon}</span>
      {children}
    </span>
  </label>
);

const PasswordStrength = ({ hasValue, score }: { hasValue: boolean; score: number }) => {
  const colors = ["bg-[#ef4444]", "bg-orange-500", "bg-yellow-500", "bg-[#10b981]"];
  const labels = ["Yếu", "Trung bình", "Tốt", "Mạnh"];
  return (
    <div>
      <div className="flex h-1 gap-1">
        {[0, 1, 2, 3].map((index) => (
          <span
            className={cn("flex-1 rounded-full", index < score ? colors[Math.max(score - 1, 0)] : "bg-[#f1edec]")}
            key={index}
          />
        ))}
      </div>
      <p className={cn("mt-1 text-xs", score > 2 ? "text-[#10b981]" : score === 1 ? "text-[#ef4444]" : "text-[#444748]")}>
        {hasValue ? `Độ mạnh mật khẩu: ${labels[Math.max(score - 1, 0)]}` : "Dùng từ 8 ký tự trở lên, kết hợp chữ, số và ký hiệu."}
      </p>
    </div>
  );
};

const PrimaryButton = ({ children, disabled }: { children: ReactNode; disabled?: boolean }) => (
  <button
    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black px-6 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    disabled={disabled}
    type="submit"
  >
    {children}
    <ArrowRight className="h-4 w-4" />
  </button>
);

const StepActions = ({
  disabled,
  nextLabel = "Bước tiếp theo",
  onBack,
  submit = false,
}: {
  disabled?: boolean;
  nextLabel?: string;
  onBack: () => void;
  submit?: boolean;
}) => (
  <div className="flex flex-col-reverse gap-4 md:flex-row">
    <button
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-6 text-sm font-semibold text-[#1c1b1b] transition hover:bg-[#f5f5f5] md:w-1/3"
      onClick={onBack}
      type="button"
    >
      <ArrowLeft className="h-4 w-4" />
      Quay lại
    </button>
    <button
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black px-6 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:flex-1"
      disabled={disabled}
      type={submit ? "submit" : "submit"}
    >
      {nextLabel}
      <ArrowRight className="h-4 w-4" />
    </button>
  </div>
);

const PlanCard = ({
  badge,
  features,
  label,
  name,
  onClick,
  price,
  selected,
}: {
  badge?: string;
  features: string[];
  label: string;
  name: string;
  onClick: () => void;
  price: string;
  selected: boolean;
}) => (
  <button
    className={cn(
      "relative w-full rounded-xl border-2 p-6 text-left transition hover:-translate-y-1",
      selected ? "border-black bg-white shadow-lg" : "border-[#e5e7eb] bg-[#f5f5f5] hover:border-[#c4c7c7]"
    )}
    onClick={onClick}
    type="button"
  >
    {badge ? (
      <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-black px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
        {badge}
      </span>
    ) : null}
    <div className="mb-4 flex items-start justify-between">
      <div>
        <p className="mb-1 text-sm font-semibold text-[#0058be]">{label}</p>
        <h2 className="text-2xl font-semibold">{name}</h2>
      </div>
      <CheckCircle2 className={cn("h-8 w-8 text-black transition", selected ? "opacity-100" : "opacity-0")} />
    </div>
    <div className="mb-6">
      <span className="text-4xl font-semibold tracking-tight">{price}</span>
      <span className="text-[#444748]">/month</span>
    </div>
    <ul className="space-y-3">
      {features.map((feature) => (
        <li className="flex items-center gap-2 text-base" key={feature}>
          <Check className="h-5 w-5 text-[#10b981]" />
          {feature}
        </li>
      ))}
    </ul>
  </button>
);
