import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type BadgeTone = "default" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  default: "bg-field text-slate-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-brand-100 text-brand-700",
};

export const Badge = ({ className, tone = "default", ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold uppercase tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
};
