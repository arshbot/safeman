
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface VCDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vcName: string;
  handleDelete: () => void;
}

export function VCDeleteDialog({ 
  isOpen, 
  onOpenChange, 
  vcName, 
  handleDelete 
}: VCDeleteDialogProps) {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Focus the delete button when the dialog opens
  useEffect(() => {
    if (isOpen && deleteButtonRef.current) {
      deleteButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle the deletion with proper error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsDeleting(true);
      // Call the delete handler
      handleDelete();
      
      // Close the dialog
      onOpenChange(false);
      
      // Show toast notification
      toast({
        title: "VC deleted successfully",
        description: `${vcName} has been removed.`
      });
    } catch (error) {
      console.error('Error deleting VC:', error);
      toast({
        title: "Error deleting VC",
        description: "There was a problem deleting the VC. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if we're not in the middle of deleting
      if (!isDeleting || !open) {
        onOpenChange(open);
      }
    }}>
      <DialogContent className="sm:max-w-[425px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Delete VC</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This VC will be removed from all rounds.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <p className="py-4">
            Are you sure you want to delete {vcName}? This action cannot be undone and will remove this VC from all rounds.
          </p>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="destructive" 
              ref={deleteButtonRef}
              autoFocus
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
