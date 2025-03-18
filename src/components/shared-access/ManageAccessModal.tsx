
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Share2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SharedAccessList } from "./SharedAccessList";
import { useSharedAccess } from "@/hooks/use-shared-access";
import { ShareAccessModal } from "../ShareAccessModal";

interface ManageAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageAccessModal({ open, onOpenChange }: ManageAccessModalProps) {
  const { user } = useAuth();
  const { 
    sharedAccess,
    isLoading,
    activeShareId,
    error,
    loadSharedAccess,
    toggleEditPermission,
    toggleActiveStatus,
    deleteAccess
  } = useSharedAccess();
  
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share2 className="mr-2 h-5 w-5" />
              Manage Shared Access
            </DialogTitle>
            <DialogDescription>
              Control who has access to your SAFEMAN data.
            </DialogDescription>
          </DialogHeader>
          
          {!user ? (
            <Alert variant="destructive">
              <AlertDescription>
                You need to be logged in to manage shared access.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowShareModal(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share with New User
                </Button>
              </div>
              
              <SharedAccessList
                isLoading={isLoading}
                error={error}
                sharedAccess={sharedAccess}
                activeShareId={activeShareId}
                onToggleEditPermission={toggleEditPermission}
                onToggleActiveStatus={toggleActiveStatus}
                onDeleteAccess={deleteAccess}
                onShareClick={() => setShowShareModal(true)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <ShareAccessModal
        open={showShareModal}
        onOpenChange={(open) => {
          setShowShareModal(open);
          if (!open) {
            loadSharedAccess();
          }
        }}
      />
    </>
  );
}
