import type { TableHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export const Table = ({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="overflow-x-auto rounded-panel border border-border bg-white shadow-panel">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
};

export const tableHeaderClass =
  "border-b border-border bg-white px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted";
export const tableCellClass = "border-b border-border px-6 py-4 text-ink";
