
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
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
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
      const sourceId = source.droppableId;
      const destId = destination.droppableId;
      
      // Extract VC ID from draggableId based on format
      let vcId: string;
      
      if (draggableId.startsWith('unsorted-')) {
        // Format: "unsorted-{vcId}"
        vcId = draggableId.replace('unsorted-', '');
      } else if (draggableId.startsWith('round-')) {
        // Format: "round-{roundId}-{vcId}"
        const parts = draggableId.split('-');
        vcId = parts[2]; // Get the vcId from the third part
      } else {
        console.error('Unknown draggableId format:', draggableId);
        return;
      }
      
      // If the VC is dragged over a round header (droppable with "round-" prefix)
      if (destId.startsWith('round-')) {
        const actualRoundId = destId.replace('round-', '');
        
        // If dragging from unsorted to a round header
        if (sourceId === 'unsorted') {
          addVCToRound(vcId, actualRoundId);
          toast.success(`VC moved to round successfully`);
          return;
        }
        
        // If dragging from a round to a round header
        if (sourceId !== 'unsorted' && sourceId !== actualRoundId) {
          removeVCFromRound(vcId, sourceId);
          addVCToRound(vcId, actualRoundId);
          toast.success(`VC moved between rounds successfully`);
          return;
        }
        
        return;
      }
      
      // Regular reordering within the same container
      if (sourceId === destId) {
        // Only reorder within rounds, not unsorted (which is sorted by status)
        if (sourceId !== 'unsorted') {
          const round = state.rounds.find(r => r.id === sourceId);
          if (!round) return;
          
          const newVcIds = Array.from(round.vcs);
          const [movedVcId] = newVcIds.splice(source.index, 1);
          newVcIds.splice(destination.index, 0, movedVcId);
          
          reorderVCs(sourceId, newVcIds);
        }
        return;
      }
      
      // Moving VC from a round to unsorted
      if (sourceId !== 'unsorted' && destId === 'unsorted') {
        removeVCFromRound(vcId, sourceId);
        toast.success(`VC moved to unsorted successfully`);
        return;
      }
      
      // Moving VC from unsorted to a round
      if (sourceId === 'unsorted' && destId !== 'unsorted') {
        addVCToRound(vcId, destId);
        toast.success(`VC moved to round successfully`);
        return;
      }
      
      // Moving between different rounds directly
      if (sourceId !== destId && sourceId !== 'unsorted' && destId !== 'unsorted') {
        removeVCFromRound(vcId, sourceId);
        addVCToRound(vcId, destId);
        toast.success(`VC moved between rounds successfully`);
        return;
      }
    }
  };

  return { handleDragEnd };
}
