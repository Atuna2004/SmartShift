import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { Button } from "./ui/Button";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export const PlaceholderPage = ({ description, title }: PlaceholderPageProps) => {
  return (
    <>
      <PageHeader
        actions={<Button variant="secondary">New</Button>}
        description={description}
        title={title}
      />
      <div className="p-4 md:p-6">
        <EmptyState
          description="Màn hình này đã có route và layout nền. Gửi mockup hoặc yêu cầu chi tiết để triển khai UI và API integration."
          title={`${title} chưa có dữ liệu hiển thị`}
        />
      </div>
    </>
  );
};
