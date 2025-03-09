
import React, { createContext, useReducer, useContext } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

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
export const DnDProvider: React.FC<{ 
  children: React.ReactNode,
  onDragEnd: (result: DropResult) => void
}> = ({ children, onDragEnd }) => {
  const [state, dispatch] = useReducer(dndReducer, { lastDragResult: null });
  
  // Handle drag end - passes the result to the provided handler
  const handleDragEnd = (result: DropResult) => {
    dispatch({ type: 'DRAG_END', payload: result });
    onDragEnd(result);
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
export const useDnD = () => useContext(DnDContext);

export default DnDProvider;
