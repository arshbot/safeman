
import { useState, useEffect, useRef } from 'react';
import { CRMState } from '@/types';

/**
 * Hook for debouncing save operations
 */
export function useDebounceSave(
  saveFunction: (state: CRMState) => Promise<boolean>,
  delay: number = 2000
) {
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  
  // Cancel any existing timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);
  
  /**
   * Debounce the save operation
   */
  const debounceSave = (state: CRMState) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = window.setTimeout(() => {
      saveFunction(state);
    }, delay);
    
    setDebounceTimer(timer as any);
  };
  
  return { debounceSave };
}
