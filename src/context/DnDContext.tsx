
import React, { createContext, useReducer, useContext } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

// Define proper types for our state and actions
type DnDState = {
  lastDragResult: DropResult | null;
};

type DnDAction = {
  type: 'DRAG_END';
  payload: DropResult;
};

// Simple reducer to track drag state
const dndReducer = (state: DnDState, action: DnDAction): DnDState => {
  switch (action.type) {
    case 'DRAG_END':
      return { ...state, lastDragResult: action.payload };
    default:
      return state;
  }
};

// Create context with proper typing
const DnDContext = createContext<{
  state: DnDState;
  dispatch: React.Dispatch<DnDAction>;
} | null>(null);

// Provider component with optional onDragEnd prop
export const DnDProvider: React.FC<{ 
  children: React.ReactNode;
  onDragEnd?: (result: DropResult) => void;
}> = ({ children, onDragEnd }) => {
  const [state, dispatch] = useReducer(dndReducer, { lastDragResult: null });
  
  // Handle drag end - passes the result to the provided handler if it exists
  const handleDragEnd = (result: DropResult) => {
    console.log('DnDContext handleDragEnd called with result:', result);
    
    dispatch({ type: 'DRAG_END', payload: result });

    // Additional logging for debugging
    console.log(`Source droppableId: ${result.source.droppableId}, index: ${result.source.index}`);
    if (result.destination) {
      console.log(`Destination droppableId: ${result.destination.droppableId}, index: ${result.destination.index}`);
      
      // Log if this is the unsorted droppable
      if (result.destination.droppableId === 'unsorted') {
        console.log('Destination is UNSORTED - this should trigger moving VC to unsorted');
      } else if (result.destination.droppableId.startsWith('round-')) {
        console.log(`Destination is a round header: ${result.destination.droppableId}`);
      }
    } else {
      console.log('No destination - item was dropped outside a droppable area');
    }
    
    if (onDragEnd) {
      console.log('Calling provided onDragEnd handler');
      onDragEnd(result);
    }
  };

  return (
    <DnDContext.Provider value={{ state, dispatch }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {children}
      </DragDropContext>
    </DnDContext.Provider>
  );
};

// Hook to use the DnD context
export const useDnD = () => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error('useDnD must be used within a DnDProvider');
  }
  return context;
};

export default DnDProvider;
