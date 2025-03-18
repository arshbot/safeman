
import { Spinner } from "@/components/ui/spinner";
import { SharedAccessRow } from "./SharedAccessRow";
import { EmptyAccessState } from "./EmptyAccessState";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SharedAccess {
  id: string;
  shared_with_email: string;
  can_edit: boolean;
  created_at: string;
  is_active: boolean;
}

interface SharedAccessListProps {
  isLoading: boolean;
  error: string | null;
  sharedAccess: SharedAccess[];
  activeShareId: string | null;
  onToggleEditPermission: (id: string, currentValue: boolean) => Promise<void>;
  onToggleActiveStatus: (id: string, currentValue: boolean) => Promise<void>;
  onDeleteAccess: (id: string) => Promise<void>;
  onShareClick: () => void;
}

export function SharedAccessList({
  isLoading,
  error,
  sharedAccess,
  activeShareId,
  onToggleEditPermission,
  onToggleActiveStatus,
  onDeleteAccess,
  onShareClick
}: SharedAccessListProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }
  
  if (sharedAccess.length === 0) {
    return <EmptyAccessState onShareClick={onShareClick} />;
  }

  return (
    <div className="space-y-4">
      {sharedAccess.map((share) => (
        <SharedAccessRow
          key={share.id}
          id={share.id}
          email={share.shared_with_email}
          canEdit={share.can_edit}
          isActive={share.is_active}
          activeShareId={activeShareId}
          onToggleEdit={onToggleEditPermission}
          onToggleActive={onToggleActiveStatus}
          onDelete={onDeleteAccess}
        />
      ))}
    </div>
  );
}
