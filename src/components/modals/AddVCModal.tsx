
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { useCRM } from "@/context/CRMContext";
import { VCForm } from "../forms/VCForm";
import { toast } from "@/components/ui/use-toast";

interface AddVCModalProps {
  trigger?: React.ReactNode;
  roundId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVCModal({ trigger, roundId, open, onOpenChange }: AddVCModalProps) {
  const { addVC, addVCToRound, saveError } = useCRM();
  
  // Enhanced visibility tracking with additional safeguards
  const visibilityRef = useRef({
    wasOpen: false,
    documentHidden: false,
    preventClose: false,
    lastStateUpdate: 0
  });

  // Add enhanced visibility change event handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      
      if (document.hidden) {
        // Page is now hidden (tab switch)
        visibilityRef.current.documentHidden = true;
        visibilityRef.current.preventClose = true;
        visibilityRef.current.lastStateUpdate = now;
        
        if (open) {
          visibilityRef.current.wasOpen = true;
          // Force the dialog to stay open
          console.log("Tab hidden while modal open - marking for preservation");
        }
      } else {
        // Page is now visible again
        const wasHidden = visibilityRef.current.documentHidden;
        const wasOpen = visibilityRef.current.wasOpen;
        const currentlyClosed = !open;
        
        if (wasHidden && wasOpen && currentlyClosed) {
          console.log("Modal was open before tab switch but is now closed - reopening");
          // If the modal was open before tab switch and is now closed, reopen it
          // Use a longer timeout to ensure any state updates are complete
          setTimeout(() => {
            onOpenChange(true);
          }, 100);
        }
        
        // Extended prevention period to block any close attempts triggered by state persistence
        setTimeout(() => {
          visibilityRef.current.preventClose = false;
          console.log("Released preventClose lock after visibility change");
        }, 1000);
        
        visibilityRef.current.documentHidden = false;
        visibilityRef.current.wasOpen = false;
      }
    };

    // Listen for both visibility change and storage events which can happen
    // when localStorage is updated by data persistence mechanisms
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', () => {
      if (open && !visibilityRef.current.documentHidden) {
        visibilityRef.current.preventClose = true;
        setTimeout(() => {
          visibilityRef.current.preventClose = false;
        }, 500);
      }
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', () => {});
    };
  }, [open, onOpenChange]);

  // Add a safeguard against rapid state changes closing the modal
  useEffect(() => {
    if (open) {
      // When modal opens, set a temporary lock to prevent any automatic closing
      visibilityRef.current.preventClose = true;
      setTimeout(() => {
        visibilityRef.current.preventClose = false;
      }, 500);
    }
  }, [open]);

  // Watch for save errors and notify the user
  useEffect(() => {
    if (saveError) {
      toast({
        title: "Warning: Save failed",
        description: "Your new VC was created but we couldn't save all your data. Your changes might be lost if you close the app.",
        variant: "destructive",
        duration: 8000,
      });
    }
  }, [saveError]);

  const handleSubmit = (vcData: any) => {
    // Set a flag to prevent closing during the submission process
    visibilityRef.current.preventClose = true;
    
    // First close the modal to avoid DnD context issues
    onOpenChange(false);
    
    // Longer delay to ensure modal is completely closed before state updates
    setTimeout(() => {
      try {
        // Add the VC to get its ID
        const newVCId = addVC(vcData);
        
        // If roundId is provided, add the VC to that round
        if (roundId && newVCId) {
          addVCToRound(newVCId, roundId);
          
          // Show success message
          toast({
            title: "VC Added Successfully",
            description: roundId 
              ? "VC was added to your database and round." 
              : "VC was added to your database.",
          });
        }
      } catch (error) {
        console.error("Error adding VC:", error);
        
        // Show error message
        toast({
          title: "Error Adding VC",
          description: "There was a problem adding the VC. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Always release the lock after state updates
        setTimeout(() => {
          visibilityRef.current.preventClose = false;
        }, 500);
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Enhanced modal close prevention logic
      if (visibilityRef.current.preventClose && !newOpen) {
        console.log("Preventing modal close due to preventClose flag");
        return;
      }
      
      // Prevent modal from closing if we're in the middle of a state update
      const timeSinceLastStateUpdate = Date.now() - visibilityRef.current.lastStateUpdate;
      if (!newOpen && timeSinceLastStateUpdate < 1000) {
        console.log(`Preventing modal close, only ${timeSinceLastStateUpdate}ms since last state update`);
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
