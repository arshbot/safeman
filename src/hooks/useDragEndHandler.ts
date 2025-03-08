
import { useCRM } from "@/context/CRMContext";
import { DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";

export function useDragEndHandler() {
  const { 
    state, 
    reorderRounds, 
    reorderVCs, 
    addVCToRound,
    removeVCFromRound
  } = useCRM();

  // Handle drag end for rounds and VCs
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    
    // If there's no destination, the user dropped the item outside a droppable area
    if (!destination) return;
    
    // Handle round reordering
    if (type === 'ROUND') {
      const items = Array.from(state.rounds);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      // Update the order property for each round
      const updatedRounds = items.map((round, index) => ({
        ...round,
        order: index,
      }));
      
      reorderRounds(updatedRounds);
      return;
    }
    
    // Handle VC reordering within a round or moving VCs between containers
    if (type === 'VC') {
      const sourceRoundId = source.droppableId;
      const destRoundId = destination.droppableId;
      
      // If the VC is dragged over a round header (droppable with "round-" prefix)
      if (destRoundId.startsWith('round-')) {
        const actualRoundId = destRoundId.replace('round-', '');
        
        // If dragging from unsorted to a round header
        if (sourceRoundId === 'unsorted') {
          // Extract the VC ID from the draggableId (format is "unsorted-{vcId}")
          const vcId = draggableId.replace('unsorted-', '');
          addVCToRound(vcId, actualRoundId);
          toast.success(`VC moved to round successfully`);
          return;
        }
        
        return;
      }
      
      // Regular reordering within the same container
      if (sourceRoundId === destRoundId) {
        // Reordering within the same round
        const round = state.rounds.find(r => r.id === sourceRoundId);
        if (!round) return;
        
        const newVcIds = Array.from(round.vcs);
        const [movedVcId] = newVcIds.splice(source.index, 1);
        newVcIds.splice(destination.index, 0, movedVcId);
        
        reorderVCs(sourceRoundId, newVcIds);
      } else if (sourceRoundId !== 'unsorted' && destRoundId === 'unsorted') {
        // Moving VC from a round to unsorted
        // Extract the VC ID from the draggableId (format is "round-{roundId}-{vcId}")
        const parts = draggableId.split('-');
        const vcId = parts[2]; // Get the vcId from the third part
        
        // Now we can move the VC from the round to unsorted
        removeVCFromRound(vcId, sourceRoundId);
        toast.success(`VC moved to unsorted successfully`);
      } else if (sourceRoundId === 'unsorted' && destRoundId !== 'unsorted') {
        // Moving VC from unsorted to a round
        const vcId = draggableId.replace('unsorted-', '');
        addVCToRound(vcId, destRoundId);
        toast.success(`VC moved to round successfully`);
      } else if (sourceRoundId !== destRoundId) {
        // Moving between different rounds (not involving unsorted)
        // This would need additional logic if supported
        console.log('Moving between different rounds directly is not implemented');
      }
    }
  };

  return { handleDragEnd };
}
