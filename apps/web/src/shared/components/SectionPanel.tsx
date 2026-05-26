import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type SectionPanelProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export const SectionPanel = ({
  actions,
  children,
  className,
  description,
  title,
  ...props
}: SectionPanelProps) => {
  return (
    <section
      className={cn("rounded-panel border border-border bg-white shadow-panel", className)}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            {title ? <h2 className="text-lg font-bold text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
};
