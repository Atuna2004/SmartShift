import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type BadgeTone = "default" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-brand-50 text-brand-700",
};

export const Badge = ({ className, tone = "default", ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
};
