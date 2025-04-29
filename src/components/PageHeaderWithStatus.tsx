
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { PageHeader } from './PageHeader';

type PageHeaderWithStatusProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeaderWithStatus({ title, description, className }: PageHeaderWithStatusProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <PageHeader title={title} description={description} className={className} />
      <SaveStatusIndicator className="ml-auto" />
    </div>
  );
}
