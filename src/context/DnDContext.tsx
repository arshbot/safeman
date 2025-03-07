
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
  
  // Handle drag end - this is where we implement the drag logic
  const onDragEnd = (result: any) => {
    dispatch({ type: 'DRAG_END', payload: result });
    
    // We'll handle the drag logic in the CRM Dashboard component
    // This provider just manages the DragDropContext
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
