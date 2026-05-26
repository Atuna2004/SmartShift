import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Check, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type AuthShellProps = {
  children: ReactNode;
  mode?: "login" | "register" | "simple";
};

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBABN4ZS1tAcIgiSRV8wn2I5vUK9I8s23SfEpozbk6w513XHqcVBmQwXvC5Oqtd0BeD_ZA5snQdCJzRMhmKqgbC1YJp5KaQDMjFsoLC9f_W0fZ-T6T8fv2OEA7WSv5A4DRJM0M3LoCCTbKe4_2hfniMzcxJbk_6R-GA9A-xT9F6DUtTSHAogRsEhGxxLCa9VE2MsCLhFN4K2ZktHT03wLWTH1JJ-GXovlrAUGFgHiXcWYZ_NqgjuS_jvSMBqmUC5C8lXWKnXDMaIAoE";

const registerImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB921j7c2Vg-2pJLRIFNjySlooAx2W1UeO8WtIxWjhQ2L764ZBEUjhnH1C-1jpoX4mEYgQUVTe9plT6NVGtFVVABzW680DZCuIcR0NboNwG0mPyG99b6GJd1KCBk3U9Rp-tfuxyr5A_EnS_khpJ-emupFT5OWD2DdZ3zsoNqvK0w19MqZJyegVeggf_UdfoPpLQd6UPa6FlsEHxncYcaXd5XJUDlGp3uzzAXJg8LzL6bKXDfJ9N8x6BJkGEWi1myTMGkkLDxgbDQGks";

export const AuthBrand = ({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) => (
  <Link className="inline-flex items-center gap-2" to="/">
    <span
      className={cn(
        "flex items-center justify-center rounded-lg",
        inverse ? "bg-white text-black" : "bg-[#111111] text-white",
        compact ? "h-7 w-7" : "h-8 w-8"
      )}
    >
      <Zap className={cn("fill-current", compact ? "h-4 w-4" : "h-5 w-5")} />
    </span>
    <span className={cn("font-black", inverse ? "text-white" : "text-[#1c1b1b]", compact ? "text-sm" : "text-2xl")}>
      SmartShift
    </span>
  </Link>
);

export const AuthFooter = () => (
  <footer className="w-full border-t border-[#e5e7eb] bg-white px-6 py-8">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-[#444748] md:flex-row">
      <Link className="text-sm font-bold text-[#1c1b1b]" to="/">
        SmartShift
      </Link>
      <div className="flex gap-6">
        <a className="transition hover:text-black" href="#terms">
          Terms
        </a>
        <a className="transition hover:text-black" href="#privacy">
          Privacy
        </a>
        <a className="transition hover:text-black" href="#support">
          Support
        </a>
      </div>
      <span>© 2024 SmartShift. All rights reserved.</span>
    </div>
  </footer>
);

export const AuthTopBar = ({
  actionLabel,
  actionTo,
  backTo,
}: {
  actionLabel?: string;
  actionTo?: string;
  backTo?: string;
}) => (
  <header className="fixed left-0 top-0 z-50 w-full border-b border-[#e5e7eb] bg-white/95 px-6 py-4 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between">
      <AuthBrand />
      {backTo ? (
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#444748] hover:text-black" to={backTo}>
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      ) : null}
      {actionLabel && actionTo ? (
        <div className="hidden items-center gap-6 md:flex">
          <span className="text-sm font-semibold text-[#444748]">
            {actionLabel === "Sign In" ? "Already have an account?" : "New to SmartShift?"}
          </span>
          <Link
            className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#1c1b1b] transition hover:bg-[#f5f5f5]"
            to={actionTo}
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  </header>
);

export const AuthShell = ({ children, mode = "simple" }: AuthShellProps) => {
  if (mode === "login") {
    return (
      <div className="min-h-screen bg-white text-[#1c1b1b]">
        <main className="flex min-h-screen flex-col md:flex-row">
          <section className="relative hidden w-1/2 overflow-hidden bg-[#1c1b1b] md:flex">
            <img className="absolute inset-0 h-full w-full object-cover opacity-100" src={heroImage} alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 text-white">
              <Link className="text-2xl font-black tracking-tight text-white" to="/">
                SmartShift
              </Link>
              <div className="max-w-md">
                <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-white">
                  Manage your team with precision.
                </h1>
                <p className="text-lg leading-8 text-white/80">
                  The high-utility toolkit for service industry owners. Streamline schedules, track performance, and grow your business.
                </p>
              </div>
            </div>
          </section>
          <section className="flex flex-1 items-center justify-center bg-white p-6 md:p-16">{children}</section>
        </main>
      </div>
    );
  }

  if (mode === "register") {
    return (
      <div className="min-h-screen bg-white text-[#1c1b1b]">
        <AuthTopBar actionLabel="Sign In" actionTo="/login" />
        <main className="flex min-h-screen flex-col pt-[73px] md:flex-row">
          <section className="relative flex w-full flex-col justify-center overflow-hidden bg-[#f1edec] p-6 md:w-5/12 md:p-16">
            <img className="absolute inset-0 h-full w-full object-cover opacity-5" src={registerImage} alt="" />
            <div className="relative z-10 max-w-md space-y-6">
              <span className="inline-flex rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                Growth Engine
              </span>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Join SmartShift to streamline your workforce.
              </h1>
              <p className="text-lg leading-8 text-[#444748]">
                Experience the next generation of staff scheduling, real-time analytics, and automated compliance.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
                  <BriefcaseBusiness className="mb-2 h-6 w-6 text-[#0058be]" />
                  <p className="text-sm font-semibold">99.9% Uptime</p>
                </div>
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
                  <ShieldCheck className="mb-2 h-6 w-6 text-[#0058be]" />
                  <p className="text-sm font-semibold">Enterprise Security</p>
                </div>
              </div>
            </div>
          </section>
          <section className="flex w-full items-center justify-center bg-white p-6 md:w-7/12 md:p-16">{children}</section>
        </main>
        <AuthFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1c1b1b]">
      <AuthTopBar backTo="/login" />
      <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-32">{children}</main>
      <AuthFooter />
    </div>
  );
};

export const StepItem = ({ active, done, label }: { active?: boolean; done?: boolean; label: string }) => (
  <div className={cn("flex items-center gap-3", !active && !done ? "opacity-50" : "")}>
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
        active ? "border-black bg-black text-white" : "border-[#e5e7eb] bg-white text-[#444748]",
        done ? "border-[#e5e7eb] bg-white text-[#10b981]" : ""
      )}
    >
      {done ? <Check className="h-4 w-4" /> : null}
      {!done ? label[0] : null}
    </div>
    <span className={cn("text-sm", active ? "font-bold text-[#1c1b1b]" : "font-semibold text-[#444748]")}>{label}</span>
  </div>
);
