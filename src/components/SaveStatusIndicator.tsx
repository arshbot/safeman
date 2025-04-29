
import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function SaveStatusIndicator({ className }: { className?: string }) {
  const { isSaving, saveError, retryCount, manualSave } = useCRM();

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isSaving ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Saving...</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your changes are being saved</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : saveError ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Save failed</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 ml-1"
                  onClick={() => manualSave()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{saveError}</p>
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Automatic retry attempts: {retryCount}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <span>Saved</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>All changes saved</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
