
import { VC } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useCRM } from '@/context/CRMContext';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { MeetingNotesModal } from './MeetingNotesModal';
import { VCDetails } from './vc/VCDetails';
import { VCActions } from './vc/VCActions';
import { VCEditDialog } from './vc/VCEditDialog';
import { VCDeleteDialog } from './vc/VCDeleteDialog';

interface VCRowProps {
  vc: VC;
  roundId?: string;
}

export function VCRow({ vc, roundId }: VCRowProps) {
  const { updateVC, deleteVC, removeVCFromRound, duplicateVC } = useCRM();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMeetingNotesOpen, setIsMeetingNotesOpen] = useState(false);
  const [editedVC, setEditedVC] = useState<VC>(vc);

  // Make sure we refresh editedVC when the VC prop changes
  useEffect(() => {
    setEditedVC(vc);
  }, [vc]);

  const handleEditClick = () => {
    setEditedVC(vc);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateClick = () => {
    if (roundId) {
      duplicateVC(vc.id, roundId);
    } else {
      toast({
        title: "Cannot duplicate",
        description: "VC is not in a round",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromRound = () => {
    if (roundId) {
      removeVCFromRound(vc.id, roundId);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure meetingNotes are preserved when updating
    const updatedVC = {
      ...editedVC,
      meetingNotes: vc.meetingNotes // Preserve the original meeting notes
    };
    updateVC(updatedVC);
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    try {
      deleteVC(vc.id);
      // No need to close the dialog here, it will be handled by the VCDeleteDialog component
    } catch (error) {
      console.error("Error deleting VC:", error);
      toast({
        title: "Error",
        description: "Failed to delete VC. Please try again.",
        variant: "destructive"
      });
    }
  };

  const meetingNotesCount = vc.meetingNotes?.length || 0;

  return (
    <>
      <div className="flex items-center p-4 bg-white border border-gray-100 rounded-md hover:bg-gray-50 transition-all animate-fade-in">
        <VCDetails vc={vc} />
        <div className="flex items-center space-x-2">
          <StatusBadge status={vc.status} />
          <VCActions
            vc={vc}
            roundId={roundId}
            meetingNotesCount={meetingNotesCount}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onDuplicateClick={handleDuplicateClick}
            onMeetingNotesClick={() => setIsMeetingNotesOpen(true)}
          />
        </div>
      </div>

      {/* Edit VC Dialog */}
      <VCEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editedVC={editedVC}
        setEditedVC={setEditedVC}
        handleEditSubmit={handleEditSubmit}
        handleRemoveFromRound={handleRemoveFromRound}
        roundId={roundId}
      />

      {/* Delete Confirmation Dialog */}
      <VCDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        vcName={vc.name}
        handleDelete={handleDelete}
      />

      {/* Meeting Notes Modal */}
      <MeetingNotesModal 
        vc={vc} 
        open={isMeetingNotesOpen} 
        onOpenChange={setIsMeetingNotesOpen} 
      />
    </>
  );
}
