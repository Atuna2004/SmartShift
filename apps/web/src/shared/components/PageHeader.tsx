import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const PageHeader = ({ actions, description, title }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 px-4 py-8 md:flex-row md:items-start md:justify-between md:px-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        {description ? <p className="mt-2 text-base text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
};
