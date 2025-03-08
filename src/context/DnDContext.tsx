
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
  const { addVCToRound, removeVCFromRound } = useCRM();
  
  // Handle drag end - this is where we implement the drag logic
  const onDragEnd = (result: any) => {
    dispatch({ type: 'DRAG_END', payload: result });
    
    const { source, destination, type, draggableId } = result;
    
    // If there's no destination, the drag was cancelled
    if (!destination) return;
    
    // Handle VC drag operations
    if (type === 'VC') {
      const sourceId = source.droppableId;
      const destId = destination.droppableId;
      
      // VC being dragged from a round to unsorted section
      if (destId === 'unsorted' && sourceId !== 'unsorted') {
        // Extract the VC ID from the draggableId (format is "{roundId}-{vcId}")
        const vcId = draggableId.split('-')[1];
        removeVCFromRound(vcId, sourceId);
        return;
      }
      
      // VC being dragged to a round header
      if (destId.startsWith('round-') && sourceId === 'unsorted') {
        const actualRoundId = destId.replace('round-', '');
        const vcId = draggableId.replace('unsorted-', '');
        addVCToRound(vcId, actualRoundId);
      }
    }
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
