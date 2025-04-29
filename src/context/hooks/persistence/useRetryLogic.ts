
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CRMState } from '@/types';

interface RetryOptions {
  maxRetries: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}

/**
 * Hook for handling retry logic when saving fails
 */
export function useRetryLogic(options: RetryOptions = { maxRetries: 3 }) {
  const [retryCount, setRetryCount] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  /**
   * Reset the retry state
   */
  const resetRetryState = () => {
    setSaveError(null);
    setRetryCount(0);
  };

  /**
   * Handle retry logic for save operations
   */
  const handleRetry = async (
    saveFn: () => Promise<boolean>,
    state: CRMState,
    attempt = 0
  ): Promise<boolean> => {
    try {
      const success = await saveFn();
      
      if (success) {
        // Only show toast if we had errors before that are now resolved
        if (saveError) {
          toast({
            title: "Data saved successfully",
            description: "Your changes have been saved.",
          });
          resetRetryState();
        }
        options.onSuccess?.();
        return true;
      } else {
        throw new Error("Save operation failed");
      }
    } catch (error) {
      setSaveError(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // If we haven't reached max retries, try again
      if (attempt < options.maxRetries) {
        setRetryCount(attempt + 1);
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.pow(2, attempt) * 1000;
        
        console.info(`Retrying in ${backoffTime}ms (attempt ${attempt + 1}/${options.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return handleRetry(saveFn, state, attempt + 1);
      } else {
        toast({
          title: "Failed to save your data",
          description: (
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p>Your changes could not be saved after multiple attempts.</p>
                <button 
                  onClick={() => handleRetry(saveFn, state, 0)}
                  className="text-primary underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          ),
          variant: "destructive",
          duration: 10000, // longer duration for error messages
        });
        options.onFailure?.();
        return false;
      }
    }
  };

  return {
    retryCount,
    saveError,
    handleRetry,
    resetRetryState
  };
}
