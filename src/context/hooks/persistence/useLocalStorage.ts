
import { CRMState } from '@/types';

/**
 * Hook utilities for saving and loading data from localStorage
 */
export function useLocalStorage() {
  /**
   * Save data to localStorage for anonymous users
   */
  const saveToLocalStorage = (storageKey: string, state: CRMState): boolean => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      console.info("Data saved to localStorage successfully");
      return true;
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      return false;
    }
  };

  /**
   * Load data from localStorage for anonymous users
   */
  const loadFromLocalStorage = (storageKey: string): CRMState | null => {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        return JSON.parse(storedData) as CRMState;
      }
      return null;
    } catch (parseError) {
      console.error("Error parsing localStorage data:", parseError);
      return null;
    }
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage
  };
}
