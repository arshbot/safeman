
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, FileText } from 'lucide-react';
import { VC } from '@/types';

interface VCActionsProps {
  vc: VC;
  roundId?: string;
  meetingNotesCount: number;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onDuplicateClick: () => void;
  onMeetingNotesClick: () => void;
}

export function VCActions({
  vc,
  roundId,
  meetingNotesCount,
  onEditClick,
  onDeleteClick,
  onDuplicateClick,
  onMeetingNotesClick,
}: VCActionsProps) {
  return (
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 relative"
        onClick={onMeetingNotesClick}
        title="Meeting Notes"
      >
        <FileText className="h-4 w-4" />
        {meetingNotesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center">
            {meetingNotesCount}
          </span>
        )}
      </Button>
      {roundId && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDuplicateClick}
          title="Duplicate VC"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEditClick}
        title="Edit VC"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onDeleteClick}
        title="Delete VC"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
