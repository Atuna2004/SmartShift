import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
import { api } from "@/services/api";
import { useAuthStore, type AuthUser } from "@/store";

type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

const inputClass =
  "h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black";
const iconInputClass =
  "h-12 w-full rounded-lg border border-[#e5e7eb] bg-white py-3 pl-12 pr-4 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black";

const toOrganizationBusinessType = (value: string) => {
  if (["cafe", "restaurant", "retail"].includes(value)) {
    return value;
  }

  if (value === "nail-salon" || value === "healthcare") {
    return "service";
  }

  return "other";
};

const toSubscriptionPlan = (value: "basic" | "organization" | "") => {
  if (value === "organization") {
    return "pro";
  }

  return value || "free";
};

const toMaxEmployees = (value: string) => {
  if (value === "1-5") return 5;
  if (value === "6-20") return 20;
  if (value === "21-50") return 50;
  if (value === "50+") return 0;
  return undefined;
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
  const [plan, setPlan] = useState<"basic" | "organization" | "">("");
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
      const result = await api.post<RegisterResponse>("/auth/register-owner", {
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
        subscription: {
          plan: toSubscriptionPlan(plan),
          status: "trialing",
          startedAt: new Date().toISOString(),
          maxBranches: plan === "organization" ? 0 : 1,
          ...(toMaxEmployees(employeeSize) !== undefined
            ? { maxEmployees: toMaxEmployees(employeeSize) }
            : {}),
        },
      });

      setAuth(result);
      window.location.assign("/dashboard");
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Unable to create account. Please try again.");
      } else {
        setError("Unable to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell mode="register">
      <div className="w-full max-w-lg">
        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleNext}>
            <ProgressHeader percent={25} stepLabel="Step 1 of 4: Personal Information" />
            <IconField icon={<User className="h-5 w-5" />} label="Full Name">
              <input
                className={iconInputClass}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Cooper"
                required
                value={fullName}
              />
            </IconField>
            <IconField icon={<Mail className="h-5 w-5" />} label="Email Address">
              <input
                className={iconInputClass}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                required
                type="email"
                value={email}
              />
            </IconField>
            <IconField icon={<Phone className="h-5 w-5" />} label="Phone Number">
              <input
                className={iconInputClass}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+84 900 000 000"
                required
                type="tel"
                value={phone}
              />
            </IconField>
            <IconField icon={<Lock className="h-5 w-5" />} label="Create Password">
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
            <PrimaryButton>Next Step</PrimaryButton>
            <p className="text-center text-xs leading-5 text-[#444748]">
              By continuing, you agree to our <a className="text-black underline" href="#terms">Terms of Service</a> and{" "}
              <a className="text-black underline" href="#privacy">Privacy Policy</a>.
            </p>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="space-y-6" onSubmit={handleNext}>
            <ProgressHeader percent={50} stepLabel="Step 2 of 4: Business Information" />
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
              <h2 className="mb-1 text-2xl font-semibold tracking-tight">Business Information</h2>
              <p className="mb-6 text-sm text-[#444748]">Configure your branch details.</p>
              <div className="space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold">Branch Name</span>
                  <input
                    className={inputClass}
                    onChange={(event) => setBranchName(event.target.value)}
                    placeholder="Downtown Flagship"
                    required
                    value={branchName}
                  />
                </label>
                <IconField icon={<MapPin className="h-5 w-5" />} label="Branch Address">
                  <input
                    className={iconInputClass}
                    onChange={(event) => setBranchAddress(event.target.value)}
                    placeholder="Start typing address..."
                    required
                    value={branchAddress}
                  />
                </IconField>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold">Business Type</span>
                    <select className={inputClass} onChange={(event) => setBusinessType(event.target.value)} required value={businessType}>
                      <option value="">Select Type</option>
                      <option value="cafe">Cafe</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="nail-salon">Nail Salon</option>
                      <option value="retail">Retail</option>
                      <option value="healthcare">Healthcare</option>
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold">Employee Size</span>
                    <select className={inputClass} onChange={(event) => setEmployeeSize(event.target.value)} required value={employeeSize}>
                      <option value="">Staff Count</option>
                      <option value="1-5">1-5 Employees</option>
                      <option value="6-20">6-20 Employees</option>
                      <option value="21-50">21-50 Employees</option>
                      <option value="50+">50+ Employees</option>
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
            <ProgressHeader percent={75} stepLabel="Step 3 of 4: Choose Plan" />
            <div className="text-center">
              <h1 className="mb-2 text-4xl font-semibold tracking-tight">Select Your Experience</h1>
              <p className="text-base leading-7 text-[#444748]">
                Flexible plans designed to scale with your business.
              </p>
            </div>
            <div className="grid gap-4">
              <PlanCard
                features={["Up to 10 staff members", "Basic automated scheduling", "Mobile app access for team", "Email support"]}
                label="FOR INDIVIDUALS"
                name="Basic Plan"
                price="$29"
                selected={plan === "basic"}
                onClick={() => setPlan("basic")}
              />
              <PlanCard
                badge="Most Popular"
                features={["Unlimited staff members", "AI-powered smart scheduling", "Advanced analytics dashboard", "Priority 24/7 support"]}
                label="FOR TEAMS"
                name="Organization Plan"
                price="$89"
                selected={plan === "organization"}
                onClick={() => setPlan("organization")}
              />
            </div>
            {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
            <div className="rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-4">
              <p className="mb-4 text-sm font-semibold text-[#444748]">
                {plan ? <>Selected: <span className="text-black">{plan === "basic" ? "Basic Plan" : "Organization Plan"}</span></> : "Please select a plan to continue"}
              </p>
              <StepActions
                disabled={!plan || isSubmitting}
                nextLabel={isSubmitting ? "Creating account..." : "Finish"}
                onBack={() => setStep(2)}
                submit
              />
            </div>
          </form>
        ) : null}

        <p className="mt-8 text-center text-sm text-[#444748] md:hidden">
          Already have an account?{" "}
          <Link className="font-semibold text-black underline" to="/login">
            Sign In
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
        <span className="text-sm font-semibold uppercase tracking-wider text-[#444748]">Onboarding</span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1c1b1b]">{stepLabel}</h1>
      </div>
      <span className="shrink-0 text-sm font-semibold text-black">{percent}% Complete</span>
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
  const labels = ["Weak", "Fair", "Good", "Strong"];
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
        {hasValue ? `Password strength: ${labels[Math.max(score - 1, 0)]}` : "Use 8 or more characters with a mix of letters, numbers & symbols."}
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
  nextLabel = "Next Step",
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
      Back
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
