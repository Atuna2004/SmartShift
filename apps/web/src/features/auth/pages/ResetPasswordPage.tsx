import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { authApi } from "@/features/auth/auth.api";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { getApiErrorMessage } from "@/shared/api";
import { cn } from "@/shared/utils/cn";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);

  const isLongEnough = newPassword.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(newPassword);
  const passwordsMatch = useMemo(
    () => !confirmPassword || confirmPassword === newPassword,
    [confirmPassword, newPassword]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        token,
        newPassword,
      });

      setIsDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể đặt lại mật khẩu. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-[440px]">
        {!isDone ? (
          <section className="animate-[fadeIn_0.4s_ease-out]">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-4xl font-semibold tracking-tight text-black">Đặt lại mật khẩu</h1>
              <p className="text-base leading-7 text-[#444748]">Vui lòng nhập mật khẩu mới cho tài khoản SmartShift của bạn.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block space-y-1">
                <span className="text-sm font-semibold">Mã đặt lại</span>
                <input
                  className="h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black"
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Dán mã đặt lại"
                  required
                  value={token}
                />
              </label>

              <PasswordField
                icon={<Lock className="h-5 w-5" />}
                label="Mật khẩu mới"
                onChange={setNewPassword}
                placeholder="Tối thiểu 8 ký tự"
                value={newPassword}
              />
              <div className="space-y-1">
                <ValidationHint active={isLongEnough}>Có từ 8 ký tự trở lên</ValidationHint>
                <ValidationHint active={hasNumberOrSymbol}>Có số hoặc ký tự đặc biệt</ValidationHint>
              </div>

              <PasswordField
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Xác nhận mật khẩu"
                onChange={setConfirmPassword}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
              />
              {!passwordsMatch ? <p className="text-xs text-[#ef4444]">Mật khẩu không khớp</p> : null}
              {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}

              <button
                className="h-12 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link className="text-sm font-semibold text-[#444748] hover:text-black" to="/login">
                Quay lại đăng nhập
              </Link>
            </div>
          </section>
        ) : (
          <section className="flex flex-col items-center py-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#10b981]/10 text-[#10b981]">
              <CheckCircle2 className="h-10 w-10 fill-current" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">Đặt lại mật khẩu thành công</h1>
            <p className="mb-8 text-base leading-7 text-[#444748]">
              Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng thông tin mới.
            </p>
            <Link className="flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" to="/login">
              Đăng nhập vào SmartShift
            </Link>
          </section>
        )}
      </div>
    </AuthShell>
  );
};

const PasswordField = ({
  icon,
  label,
  onChange,
  placeholder,
  value,
}: {
  icon: ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold">{label}</span>
    <span className="flex h-12 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 transition focus-within:border-black focus-within:ring-2 focus-within:ring-black">
      <span className="mr-3 text-[#444748]">{icon}</span>
      <input
        className="h-full min-w-0 flex-1 border-none bg-transparent text-base outline-none focus:ring-0"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        type="password"
        value={value}
      />
    </span>
  </label>
);

const ValidationHint = ({ active, children }: { active: boolean; children: ReactNode }) => (
  <div className={cn("flex items-center gap-1 text-xs transition", active ? "text-[#10b981]" : "text-[#444748]")}>
    <CheckCircle2 className="h-3.5 w-3.5" />
    {children}
  </div>
);
