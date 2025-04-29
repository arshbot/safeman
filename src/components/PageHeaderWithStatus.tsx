
import { SaveStatusIndicator } from './SaveStatusIndicator';

type PageHeaderWithStatusProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeaderWithStatus({ title, description, className }: PageHeaderWithStatusProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className={className}>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      <SaveStatusIndicator className="ml-auto" />
    </div>
  );
}
