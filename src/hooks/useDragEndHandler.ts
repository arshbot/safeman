
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

  // Extracts VC ID from draggableId
  const extractVcId = (draggableId: string): string => {
    if (draggableId.startsWith('unsorted-')) {
      // Format: "unsorted-{vcId}"
      return draggableId.replace('unsorted-', '');
    } else if (draggableId.startsWith('round-')) {
      // Format: "round-{roundId}-{vcId}"
      const parts = draggableId.split('-');
      // We need to remove the first two parts (round- and roundId) and join the rest
      // This handles vcIds that might contain hyphens
      return parts.slice(2).join('-');
    }
    console.error('Unknown draggableId format:', draggableId);
    return '';
  };

  // Extract roundId from draggableId
  const extractSourceRoundId = (draggableId: string): string | null => {
    if (draggableId.startsWith('round-')) {
      // Format: "round-{roundId}-{vcId}"
      const parts = draggableId.split('-');
      if (parts.length >= 2) {
        return parts[1];
      }
    }
    return null;
  };

  // Handle drag end for rounds and VCs
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    
    console.log(`Drag end: ${draggableId} from ${source.droppableId} to ${destination?.droppableId || 'nowhere'}`);
    console.log('Full drag result:', result);
    
    // If there's no destination, the user dropped the item outside a droppable area
    if (!destination) {
      console.log('No destination, ignoring drop');
      return;
    }
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log('Same position, ignoring drop');
      return;
    }
    
    // Handle round reordering
    if (type === 'ROUND') {
      console.log('Handling round reordering');
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
      
      // Extract VC ID from draggableId
      const vcId = extractVcId(draggableId);
      if (!vcId) {
        console.error('Failed to extract vcId from draggableId', draggableId);
        return;
      }
      
      console.log(`Dragging VC: ${vcId} from ${sourceId} to ${destId}`);
      
      // If the VC is dragged over a round header (droppable with "round-" prefix)
      if (destId.startsWith('round-')) {
        const actualRoundId = destId.replace('round-', '');
        
        // If dragging from unsorted to a round header
        if (sourceId === 'unsorted') {
          console.log(`Moving from unsorted to round ${actualRoundId}`);
          addVCToRound(vcId, actualRoundId);
          toast.success(`VC moved to round successfully`);
          return;
        }
        
        // If dragging from a round to another round header
        if (sourceId !== destId) {
          console.log(`Moving between rounds from ${sourceId} to ${actualRoundId}`);
          // Extract the source round ID if dragging from a round
          const sourceRoundId = extractSourceRoundId(draggableId);
          
          if (sourceRoundId) {
            console.log(`Extracted source round ID from draggableId: ${sourceRoundId}`);
            removeVCFromRound(vcId, sourceRoundId);
            addVCToRound(vcId, actualRoundId);
            toast.success(`VC moved between rounds successfully`);
          } else {
            // Fallback to using the droppable ID if we can't extract from draggableId
            console.log(`Using droppable ID as source round ID: ${sourceId}`);
            removeVCFromRound(vcId, sourceId);
            addVCToRound(vcId, actualRoundId);
            toast.success(`VC moved between rounds successfully`);
          }
          return;
        }
        
        return;
      }
      
      // Regular reordering within the same container
      if (sourceId === destId) {
        // Only reorder within rounds, not unsorted (which is sorted by status)
        if (sourceId !== 'unsorted') {
          console.log(`Reordering within round ${sourceId}`);
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
        console.log(`Removing VC ${vcId} from round ${sourceId} and moving to unsorted`);
        const sourceRoundId = extractSourceRoundId(draggableId);
        if (sourceRoundId) {
          console.log(`Using extracted source round ID: ${sourceRoundId}`);
          removeVCFromRound(vcId, sourceRoundId);
        } else {
          console.log(`Using droppable ID as source round ID: ${sourceId}`);
          removeVCFromRound(vcId, sourceId);
        }
        toast.success(`VC moved to unsorted successfully`);
        return;
      }
      
      // Moving VC from unsorted to a round
      if (sourceId === 'unsorted' && destId !== 'unsorted' && !destId.startsWith('round-')) {
        console.log(`Adding VC ${vcId} to round ${destId} from unsorted`);
        addVCToRound(vcId, destId);
        toast.success(`VC moved to round successfully`);
        return;
      }
      
      // Moving between different rounds directly
      if (sourceId !== destId && sourceId !== 'unsorted' && destId !== 'unsorted') {
        console.log(`Moving VC ${vcId} from round ${sourceId} to round ${destId}`);
        removeVCFromRound(vcId, sourceId);
        addVCToRound(vcId, destId);
        toast.success(`VC moved between rounds successfully`);
        return;
      }
    }
  };

  return { handleDragEnd };
}
