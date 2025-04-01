import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { useCRM } from "@/context/CRMContext";
import { VCForm } from "../forms/VCForm";

interface AddVCModalProps {
  trigger?: React.ReactNode;
  roundId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVCModal({ trigger, roundId, open, onOpenChange }: AddVCModalProps) {
  const { addVC, addVCToRound } = useCRM();
  
  // Create a ref to track visibility changes related to tab switching
  const visibilityRef = useRef({
    wasOpen: false,
    documentHidden: false,
    preventClose: false
  });

  // Add visibility change event handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden (tab switch)
        visibilityRef.current.documentHidden = true;
        visibilityRef.current.preventClose = true;
        if (open) {
          visibilityRef.current.wasOpen = true;
        }
      } else {
        // Page is now visible again
        if (visibilityRef.current.documentHidden && visibilityRef.current.wasOpen && !open) {
          // If the modal was open before tab switch and is now closed, reopen it
          // Use setTimeout to ensure this happens after any state updates
          setTimeout(() => {
            onOpenChange(true);
          }, 50);
        }
        
        // Keep preventClose true for a short while after becoming visible again
        // to block any immediate close attempts triggered by state saves
        setTimeout(() => {
          visibilityRef.current.preventClose = false;
        }, 500);
        
        visibilityRef.current.documentHidden = false;
        visibilityRef.current.wasOpen = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [open, onOpenChange]);

  const handleSubmit = (vcData: any) => {
    // First close the modal to avoid DnD context issues
    onOpenChange(false);
    
    // Small delay to ensure modal is completely closed before state updates
    setTimeout(() => {
      // Add the VC to get its ID
      const newVCId = addVC(vcData);
      
      // If roundId is provided, add the VC to that round
      if (roundId && newVCId) {
        addVCToRound(newVCId, roundId);
      }
    }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Block modal close attempts when switching tabs or right after becoming visible
      if (visibilityRef.current.preventClose && !newOpen) {
        console.log("Preventing modal close due to tab switching");
        return;
      }
      
      // Otherwise allow normal open/close behavior
      if (!visibilityRef.current.documentHidden || newOpen) {
        onOpenChange(newOpen);
      }
    }}>
      {trigger && (
        <DialogTrigger asChild>
          <div className="inline-flex items-center justify-center">{trigger}</div>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Add New VC</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the details to add a new VC to your database.
            {roundId ? ` This VC will be added to the round directly.` : ''}
          </DialogDescription>
        </DialogHeader>
        <VCForm onSubmit={handleSubmit} roundId={roundId} />
      </DialogContent>
    </Dialog>
  );
}
