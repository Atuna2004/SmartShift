import type { ComponentType } from "react";
import { cn } from "@/shared/utils/cn";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
  trendTone?: "up" | "down";
  icon: ComponentType<{ className?: string }>;
};

export const MetricCard = ({
  helper,
  icon: Icon,
  label,
  trend,
  trendTone = "up",
  value,
}: MetricCardProps) => {
  return (
    <section className="rounded-panel border border-border bg-white p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
        {trend ? (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              trendTone === "up"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-emerald-50 text-emerald-600"
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-3 text-sm text-subtle">{helper}</p>
    </section>
  );
};
