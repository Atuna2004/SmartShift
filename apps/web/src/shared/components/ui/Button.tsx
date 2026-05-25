import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-brand-600 bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border-border bg-white text-ink hover:bg-slate-50",
  ghost: "border-transparent bg-transparent text-ink hover:bg-slate-100",
  danger: "border-red-600 bg-red-600 text-white hover:bg-red-700",
};

export const Button = ({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      type={type}
      {...props}
    />
  );
};
