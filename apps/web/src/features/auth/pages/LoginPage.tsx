import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { api } from "@/services/api";
import { useAuthStore, type AuthUser } from "@/store";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

const googleIcon =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDj6LOZrrBFXTVjwuVZTi4A0g3X4aBPW8bkCoiKKmSCCUaq3WhrgDKPebnBxv34_TDv935wOaIbNLs0Fl5A5tSeXvDGcVr8TtDCjikVRDsQVkGlhZlEezpUKUTbrL_fLpfXC8YB9pGO1MGjzJEwrhGdM9_0Bv5k3mcg3BcNp6EY8yMWhEFi0eb5TMaLJUyPK9avd5VQApc8_dwiEt4HkkwI79lSJ-FqeiJJOHduUzkbHsa7fQhLPe5JxY9V2qbgGr8w8BjWeEl2qnRY";

export const LoginPage = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      setAuth(result);
      window.location.assign("/dashboard");
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Invalid email or password. Please try again.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell mode="login">
      <div className="w-full max-w-[440px]">
        <div className="mb-12">
          <div className="mb-6 md:hidden">
            <Link className="text-2xl font-black tracking-tight text-black" to="/">
              SmartShift
            </Link>
          </div>
          <h1 className="mb-2 text-4xl font-semibold leading-tight tracking-tight text-[#1c1b1b]">Welcome back</h1>
          <p className="text-base leading-6 text-[#444748]">Please enter your details to sign in.</p>
        </div>

        {error ? (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/10 bg-[#ffdad6] p-4 text-sm font-semibold text-[#93000a]">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block space-y-1" htmlFor="email">
            <span className="text-sm font-semibold text-[#1c1b1b]">Email address</span>
            <input
              autoFocus
              className="h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block space-y-1" htmlFor="password">
            <span className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1c1b1b]">Password</span>
              <Link className="text-sm font-semibold text-[#0058be] hover:underline" to="/forgot-password">
                Forgot password?
              </Link>
            </span>
            <input
              className="h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </label>

          <label className="flex items-center gap-2 text-base text-[#444748]" htmlFor="remember">
            <input className="h-5 w-5 rounded border-[#e5e7eb] text-black focus:ring-black" id="remember" type="checkbox" />
            Remember for 30 days
          </label>

          <div className="space-y-4 pt-4">
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white text-sm font-semibold text-[#1c1b1b] transition hover:bg-[#f5f5f5] active:scale-[0.98]"
              type="button"
            >
              <img alt="Google" className="h-5 w-5" src={googleIcon} />
              Sign in with Google
            </button>
          </div>
        </form>

        <p className="mt-12 text-center text-base text-[#444748]">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-black hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};
