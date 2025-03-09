
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
    console.log(`Extracting VC ID from draggableId: ${draggableId}`);
    
    if (draggableId.startsWith('unsorted-')) {
      // Format: "unsorted-{vcId}"
      const vcId = draggableId.replace('unsorted-', '');
      console.log(`Extracted VC ID from unsorted format: ${vcId}`);
      return vcId;
    } else if (draggableId.startsWith('round-')) {
      // Format: "round-{roundId}-{vcId}"
      // First, split by the first two hyphens to get the roundId
      const firstHyphen = draggableId.indexOf('-');
      if (firstHyphen === -1) return '';
      
      const secondHyphen = draggableId.indexOf('-', firstHyphen + 1);
      if (secondHyphen === -1) return '';
      
      // Everything after the second hyphen is the vcId
      const vcId = draggableId.substring(secondHyphen + 1);
      console.log(`Extracted VC ID from round format: ${vcId}`);
      return vcId;
    }
    
    console.error('Unknown draggableId format:', draggableId);
    return '';
  };

  // Extract roundId from draggableId
  const extractSourceRoundId = (draggableId: string): string | null => {
    console.log(`Extracting source round ID from draggableId: ${draggableId}`);
    
    if (draggableId.startsWith('round-')) {
      // Format: "round-{roundId}-{vcId}"
      // Get content between first and second hyphen
      const firstHyphen = draggableId.indexOf('-');
      if (firstHyphen === -1) return null;
      
      const secondHyphen = draggableId.indexOf('-', firstHyphen + 1);
      if (secondHyphen === -1) return null;
      
      const roundId = draggableId.substring(firstHyphen + 1, secondHyphen);
      console.log(`Extracted source round ID: ${roundId}`);
      return roundId;
    }
    
    console.log('No round ID found in draggableId');
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
      
      // If the VC is dragged to the "unsorted" droppable
      if (destId === 'unsorted') {
        console.log(`Moving VC ${vcId} to unsorted`);
        
        // If the source is a round, remove it from there
        if (sourceId !== 'unsorted') {
          console.log(`Removing VC ${vcId} from round ${sourceId}`);
          removeVCFromRound(vcId, sourceId);
          toast.success(`VC moved to unsorted successfully`);
        }
        return;
      }
      
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
      
      // Moving VC from a round to another round directly (not via header)
      if (sourceId !== destId && sourceId !== 'unsorted' && destId !== 'unsorted' && !destId.startsWith('round-')) {
        console.log(`Moving VC ${vcId} from round ${sourceId} to round ${destId}`);
        removeVCFromRound(vcId, sourceId);
        addVCToRound(vcId, destId);
        toast.success(`VC moved between rounds successfully`);
        return;
      }
      
      // Moving VC from unsorted to a round directly (not via header)
      if (sourceId === 'unsorted' && !destId.startsWith('round-') && destId !== 'unsorted') {
        console.log(`Adding VC ${vcId} to round ${destId} from unsorted`);
        addVCToRound(vcId, destId);
        toast.success(`VC moved to round successfully`);
        return;
      }
    }
  };

  return { handleDragEnd };
}
