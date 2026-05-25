import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <section
      className={cn("rounded-lg border border-border bg-white shadow-panel", className)}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("border-b border-border p-4", className)} {...props} />;
};

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("p-4", className)} {...props} />;
};
