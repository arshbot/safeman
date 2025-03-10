
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

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

  // Focus the delete button when the dialog opens
  useEffect(() => {
    if (isOpen && deleteButtonRef.current) {
      deleteButtonRef.current.focus();
    }
  }, [isOpen]);

  // This approach directly passes the delete function to the form's onSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDelete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Delete VC</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <p className="py-4">
            Are you sure you want to delete {vcName}? This action cannot be undone and will remove this VC from all rounds.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="destructive" 
              ref={deleteButtonRef}
              autoFocus
            >
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
