import type { TableHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export const Table = ({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
};

export const tableHeaderClass = "border-b border-border bg-slate-50 px-4 py-3 font-medium text-muted";
export const tableCellClass = "border-b border-border px-4 py-3 text-ink";
