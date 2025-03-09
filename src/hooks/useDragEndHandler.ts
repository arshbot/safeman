
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
    console.log(`[DEBUG] Extracting VC ID from draggableId: ${draggableId}`);
    
    if (draggableId.startsWith('unsorted-')) {
      // Format: "unsorted-{vcId}"
      const vcId = draggableId.replace('unsorted-', '');
      console.log(`[DEBUG] Extracted VC ID from unsorted format: ${vcId}`);
      return vcId;
    } else if (draggableId.startsWith('round-')) {
      // Format is "round-{roundId}-{vcId}"
      const lastDashIndex = draggableId.lastIndexOf('-');
      if (lastDashIndex === -1 || lastDashIndex <= 6) { // 'round-'.length = 6
        console.error('[DEBUG] Invalid draggableId format:', draggableId);
        return '';
      }

      // Get everything after the last dash for UUID-format VC IDs
      const vcIdParts = draggableId.substring(lastDashIndex + 1).split('-');
      
      // If we have multiple parts after splitting by '-', it means the vcId itself contains hyphens
      // In this case, we need to find where the roundId ends and vcId begins
      if (vcIdParts.length > 1) {
        // This is likely a UUID-format ID, find the full vcId in state.vcs
        for (const id of Object.keys(state.vcs)) {
          if (draggableId.endsWith(id)) {
            console.log(`[DEBUG] Found matching VC ID: ${id}`);
            return id;
          }
        }
      }
      
      // If we couldn't match the full ID, return the substring after the last hyphen
      const vcId = draggableId.substring(lastDashIndex + 1);
      console.log(`[DEBUG] Extracted VC ID from round format (last part): ${vcId}`);
      return vcId;
    }
    
    console.error('[DEBUG] Unknown draggableId format:', draggableId);
    return '';
  };

  // Extract roundId from draggableId
  const extractSourceRoundId = (draggableId: string): string | null => {
    console.log(`[DEBUG] Extracting source round ID from draggableId: ${draggableId}`);
    
    if (draggableId.startsWith('round-')) {
      // Get the part between 'round-' and the last '-'
      const start = 'round-'.length;
      const lastDashIndex = draggableId.lastIndexOf('-');
      
      if (lastDashIndex <= start) return null;
      
      // Find the last vcId in our state to determine where it begins
      const vcIds = Object.keys(state.vcs);
      for (const vcId of vcIds) {
        if (draggableId.endsWith(vcId)) {
          // The roundId is everything between 'round-' and the start of vcId
          const roundEndIndex = draggableId.length - vcId.length - 1; // -1 for the dash
          const roundId = draggableId.substring(start, roundEndIndex);
          console.log(`[DEBUG] Extracted source round ID: ${roundId}`);
          return roundId;
        }
      }
      
      // If no match found, use the part before the last dash
      const roundId = draggableId.substring(start, lastDashIndex);
      console.log(`[DEBUG] Extracted source round ID (fallback): ${roundId}`);
      return roundId;
    }
    
    console.log('[DEBUG] No round ID found in draggableId');
    return null;
  };

  // Handle drag end for rounds and VCs
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    
    console.log(`[DEBUG] Drag end: ${draggableId} from ${source.droppableId} to ${destination?.droppableId || 'nowhere'}`);
    console.log('[DEBUG] Full drag result:', result);
    
    // If there's no destination, the user dropped the item outside a droppable area
    if (!destination) {
      console.log('[DEBUG] No destination, ignoring drop');
      return;
    }
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log('[DEBUG] Same position, ignoring drop');
      return;
    }
    
    // Handle round reordering
    if (type === 'ROUND') {
      console.log('[DEBUG] Handling round reordering');
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
        console.error('[DEBUG] Failed to extract vcId from draggableId', draggableId);
        return;
      }

      // For debugging purposes
      const vc = state.vcs[vcId];
      if (vc) {
        console.log(`[DEBUG] Dragging VC: ${vc.name} (${vcId}) from ${sourceId} to ${destId}`);
      } else {
        console.log(`[DEBUG] Dragging VC: ${vcId} from ${sourceId} to ${destId} (VC not found in state)`);
        console.log('[DEBUG] Available VCs in state:', Object.keys(state.vcs));
        return; // Exit early if VC not found
      }
      
      // If the VC is dragged to the "unsorted" droppable
      if (destId === 'unsorted') {
        console.log(`[DEBUG] Moving VC ${vcId} to unsorted`);
        
        // If the source is a round, remove it from there
        if (sourceId !== 'unsorted') {
          console.log(`[DEBUG] Removing VC ${vcId} from round ${sourceId}`);
          removeVCFromRound(vcId, sourceId);
          toast.success(`VC moved to unsorted successfully`);
        }
        return;
      }
      
      // If the VC is dragged to a round droppable
      if (destId !== 'unsorted') {
        const actualRoundId = destId.startsWith('round-') ? destId.replace('round-', '') : destId;
        
        console.log(`[DEBUG] Moving VC ${vcId} to round ${actualRoundId}`);
        
        // If it's coming from unsorted
        if (sourceId === 'unsorted') {
          console.log(`[DEBUG] Before addVCToRound: Moving from unsorted to round ${actualRoundId}`);
          addVCToRound(vcId, actualRoundId);
          console.log(`[DEBUG] After addVCToRound: VC ${vcId} should now be in round ${actualRoundId}`);
          toast.success(`VC moved to round successfully`);
          return;
        }
        
        // If it's moving between rounds
        if (sourceId !== destId) {
          const sourceRoundId = sourceId.startsWith('round-') ? sourceId.replace('round-', '') : sourceId;
          
          console.log(`[DEBUG] Before removeVCFromRound: Moving between rounds from ${sourceRoundId} to ${actualRoundId}`);
          removeVCFromRound(vcId, sourceRoundId);
          console.log(`[DEBUG] Before addVCToRound: Adding VC ${vcId} to round ${actualRoundId}`);
          addVCToRound(vcId, actualRoundId);
          console.log(`[DEBUG] After addVCToRound: VC ${vcId} should now be in round ${actualRoundId}`);
          toast.success(`VC moved between rounds successfully`);
          return;
        }
        
        // Regular reordering within the same round
        if (sourceId === destId) {
          console.log(`[DEBUG] Reordering within round ${actualRoundId}`);
          const round = state.rounds.find(r => r.id === actualRoundId);
          if (!round) return;
          
          const newVcIds = Array.from(round.vcs);
          const [movedVcId] = newVcIds.splice(source.index, 1);
          newVcIds.splice(destination.index, 0, movedVcId);
          
          reorderVCs(actualRoundId, newVcIds);
        }
      }
    }
  };

  return { handleDragEnd };
}
