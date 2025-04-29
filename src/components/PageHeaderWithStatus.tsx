
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { PageHeader } from './PageHeader';

type PageHeaderWithStatusProps = React.ComponentProps<typeof PageHeader>;

export function PageHeaderWithStatus(props: PageHeaderWithStatusProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <PageHeader {...props} />
      <SaveStatusIndicator className="ml-auto" />
    </div>
  );
}
