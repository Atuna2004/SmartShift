import { PageHeader } from "@/shared/components/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";

const metrics = [
  { label: "Active branches", value: "0", tone: "info" as const },
  { label: "Employees", value: "0", tone: "success" as const },
  { label: "Today shifts", value: "0", tone: "warning" as const },
  { label: "Pending requests", value: "0", tone: "danger" as const },
];

export const DashboardPage = () => {
  return (
    <>
      <PageHeader
        description="Operational overview for branches, shifts, attendance, and requests."
        title="Dashboard"
      />
      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{metric.label}</p>
                <Badge tone={metric.tone}>Live</Badge>
              </div>
              <p className="mt-4 text-3xl font-semibold text-ink">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
