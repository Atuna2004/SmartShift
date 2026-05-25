import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({ className, error, label, id, ...props }: InputProps) => {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm text-ink" htmlFor={inputId}>
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        className={cn(
          "h-10 rounded-md border border-border bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "",
          className
        )}
        id={inputId}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
};
