
import { VC } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useCRM } from '@/context/CRMContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
      toast.error("Cannot duplicate - VC is not in a round");
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
    deleteVC(vc.id);
    setIsDeleteDialogOpen(false);
  };

  const meetingNotesCount = vc.meetingNotes?.length || 0;
  
  console.log(`VCRow for ${vc.name}, meetingNotes:`, vc.meetingNotes);
  console.log(`Meeting notes count: ${meetingNotesCount}`);

  return (
    <>
      <div className="flex items-center p-4 bg-white rounded-md mb-1 hover:bg-gray-50 transition-all animate-fade-in">
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
