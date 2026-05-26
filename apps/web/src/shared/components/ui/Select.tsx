import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = ({ className, error, label, id, children, ...props }: SelectProps) => {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm text-ink" htmlFor={selectId}>
      {label ? <span className="font-semibold">{label}</span> : null}
      <select
        className={cn(
          "h-12 rounded-lg border border-border bg-field px-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "",
          className
        )}
        id={selectId}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
};
