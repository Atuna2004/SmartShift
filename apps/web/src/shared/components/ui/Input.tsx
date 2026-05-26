import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Input = ({
  className,
  error,
  label,
  id,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) => {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm text-ink" htmlFor={inputId}>
      {label ? <span className="font-semibold">{label}</span> : null}
      <span
        className={cn(
          "flex h-12 items-center rounded-lg border border-border bg-field px-3 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100",
          error ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100" : ""
        )}
      >
        {leftIcon ? <span className="mr-3 text-subtle">{leftIcon}</span> : null}
        <input
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400",
            className
          )}
          id={inputId}
          {...props}
        />
        {rightIcon ? <span className="ml-3 text-subtle">{rightIcon}</span> : null}
      </span>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
};
