
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface RoundHeaderDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roundName: string;
  onDelete: () => void;
}

export function RoundHeaderDeleteDialog({
  isOpen,
  onOpenChange,
  roundName,
  onDelete
}: RoundHeaderDeleteDialogProps) {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the delete button when the delete dialog opens
  useEffect(() => {
    if (isOpen && deleteButtonRef.current) {
      deleteButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDelete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Delete Round</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The round will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <p className="py-4">
            Are you sure you want to delete the "{roundName}" round? This action cannot be undone.
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
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
