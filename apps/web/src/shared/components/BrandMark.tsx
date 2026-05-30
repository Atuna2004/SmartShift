import { Clock3 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type BrandMarkProps = {
  subtitle?: string;
  className?: string;
};

export const BrandMark = ({ className, subtitle = "Admin Console" }: BrandMarkProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <Clock3 className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold leading-5 text-ink">SmartShift</p>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{subtitle}</p>
      </div>
    </div>
  );
};
