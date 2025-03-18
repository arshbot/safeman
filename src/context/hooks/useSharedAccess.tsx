// This hook is now a placeholder since sharing functionality has been removed
export const useSharedAccess = () => {
  // Return fixed values as sharing access has been removed
  return { 
    isReadOnly: false, 
    sharedOwnerId: null 
  };
};
