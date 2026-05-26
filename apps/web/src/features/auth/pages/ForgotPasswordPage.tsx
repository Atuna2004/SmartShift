import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole, Mail, RotateCcw } from "lucide-react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { api } from "@/services/api";

type ForgotPasswordResponse = {
  resetToken?: string;
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await api.post<ForgotPasswordResponse>("/auth/forgot-password", {
        email,
      });

      setResetToken(result?.resetToken ?? "");
      setIsSent(true);
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Unable to send reset instructions. Please try again.");
      } else {
        setError("Unable to send reset instructions. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-[440px] space-y-8">
        <div className="text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#f5f5f5] text-black">
            <LockKeyhole className="h-8 w-8" />
          </div>
          {!isSent ? (
            <>
              <h1 className="mb-2 text-4xl font-semibold tracking-tight">Forgot password?</h1>
              <p className="text-base text-[#444748]">No worries, we&apos;ll send you reset instructions.</p>
            </>
          ) : null}
        </div>

        <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 transition">
          {!isSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block space-y-1" htmlFor="email">
                <span className="text-sm font-semibold">Email address</span>
                <span className="relative block">
                  <input
                    autoFocus
                    className="h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 pr-12 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black"
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={email}
                  />
                  <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c4c7c7]" />
                </span>
              </label>
              {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
                {isSubmitting ? "Sending..." : "Send reset link"}
                {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#10b981]/10 text-[#10b981]">
                <CheckCircle2 className="h-10 w-10 fill-current" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold tracking-tight">Check your email</h2>
              <p className="mb-6 text-base leading-7 text-[#444748]">
                We&apos;ve sent a password reset link to your inbox. Please follow the instructions to reset your password.
              </p>
              {resetToken ? (
                <Link
                  className="mb-6 flex h-12 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white"
                  to={`/reset-password?token=${resetToken}`}
                >
                  Open reset page
                </Link>
              ) : null}
              <button
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#444748] hover:text-black"
                onClick={() => setIsSent(false)}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                Click to retry
              </button>
            </div>
          )}
        </section>

        <div className="relative h-[200px] overflow-hidden rounded-2xl border border-[#e5e7eb] grayscale">
          <img
            alt=""
            className="h-full w-full object-cover opacity-30"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmLvI70DHHdu22plg0iTZA0IK8ZM_Sq2eiF9WFnLlPXNElWzgmHPxS0QO3_qGdTklt_FSolgmzR_Xdy5HXh6Z5wo4K4-Mx_yOtgIhkzojpEk-pk3lJ_1tlZKaxvyaMqyYviD3Kf5BPRcsefPqmDbx9ZJtbQ1s18BjrGpzakaLNu3Pk9d04t0_THYs8qd2-dghgFW52i3XacO4O6rtxfEPJmVa7KVv8gfB5iX_i5X4y9CUI0CI_dTbGWBfjOW4DPCFrLZWglymwHqAK"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </AuthShell>
  );
};
