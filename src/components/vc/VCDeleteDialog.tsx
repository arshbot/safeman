
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Delete VC</DialogTitle>
        </DialogHeader>
        <p className="py-4">
          Are you sure you want to delete {vcName}? This action cannot be undone and will remove this VC from all rounds.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
