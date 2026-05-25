import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = ({ className, error, label, id, children, ...props }: SelectProps) => {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm text-ink" htmlFor={selectId}>
      {label ? <span className="font-medium">{label}</span> : null}
      <select
        className={cn(
          "h-10 rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
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
