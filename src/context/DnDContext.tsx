
import React, { createContext, useReducer, useContext } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useCRM } from './CRMContext';

// Simple reducer to track drag state
const dndReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'DRAG_END':
      return { ...state, lastDragResult: action.payload };
    default:
      return state;
  }
};

// Create context
const DnDContext = createContext<any>(null);

// Provider component
export const DnDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dndReducer, { lastDragResult: null });
  const { addVCToRound, removeVCFromRound, reorderVCs } = useCRM();
  
  // Handle drag end - this is where we implement the drag logic
  const onDragEnd = (result: any) => {
    dispatch({ type: 'DRAG_END', payload: result });
    
    const { source, destination, type, draggableId } = result;
    
    // If there's no destination, the drag was cancelled
    if (!destination) return;
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    // Handle VC drag operations
    if (type === 'VC') {
      const sourceId = source.droppableId;
      const destId = destination.droppableId;
      
      // Extract VC ID and round ID from draggableId format
      let vcId: string;
      let sourceRoundId: string | null = null;
      
      if (draggableId.startsWith('unsorted-')) {
        // Format: "unsorted-{vcId}"
        vcId = draggableId.replace('unsorted-', '');
      } else if (draggableId.startsWith('round-')) {
        // Format: "round-{roundId}-{vcId}"
        const parts = draggableId.split('-');
        sourceRoundId = parts[1];
        vcId = parts[2];
      } else {
        console.error('Unknown draggableId format:', draggableId);
        return;
      }
      
      // Handle different drag scenarios
      
      // 1. Reordering within the same container
      if (sourceId === destId) {
        // Don't reorder unsorted for now as it's sorted by status
        if (sourceId !== 'unsorted') {
          reorderVCs(sourceId, getReorderedItems(sourceId, source.index, destination.index));
        }
        return;
      }
      
      // 2. Moving from a round to unsorted
      if (sourceId !== 'unsorted' && destId === 'unsorted') {
        removeVCFromRound(vcId, sourceId);
        return;
      }
      
      // 3. Moving from unsorted to a round
      if (sourceId === 'unsorted' && destId !== 'unsorted') {
        addVCToRound(vcId, destId);
        return;
      }
      
      // 4. Moving between different rounds
      if (sourceId !== 'unsorted' && destId !== 'unsorted' && sourceId !== destId) {
        // First remove from source round
        removeVCFromRound(vcId, sourceId);
        // Then add to destination round
        addVCToRound(vcId, destId);
        return;
      }
    }
  };
  
  // Helper function to get reordered items
  const getReorderedItems = (roundId: string, sourceIndex: number, destIndex: number) => {
    const { state } = useCRM();
    const round = state.rounds.find(r => r.id === roundId);
    if (!round) return [];
    
    const newItems = Array.from(round.vcs);
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destIndex, 0, movedItem);
    
    return newItems;
  };

  return (
    <DnDContext.Provider value={{ state, dispatch }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {children}
      </DragDropContext>
    </DnDContext.Provider>
  );
};

// Hook to use the DnD context
export const useDnD = () => useContext(DnDContext);

export default DnDProvider;
