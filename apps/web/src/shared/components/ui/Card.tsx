import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <section
      className={cn("rounded-panel border border-border bg-white shadow-panel", className)}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("border-b border-border px-6 py-5", className)} {...props} />;
};

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("p-6", className)} {...props} />;
};
