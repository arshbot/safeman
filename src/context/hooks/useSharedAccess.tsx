
import { useState } from 'react';
import { User } from '@supabase/supabase-js';

// This hook now returns fixed values with no shared access functionality
export const useSharedAccess = (_user: User | null) => {
  // Returning fixed values as we're removing shared access functionality
  return { 
    isReadOnly: false, 
    sharedOwnerId: null 
  };
};
