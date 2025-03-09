
import { VC, Status } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';

interface VCEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editedVC: VC;
  setEditedVC: (vc: VC) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  handleRemoveFromRound: () => void;
  roundId?: string;
}

export function VCEditDialog({
  isOpen,
  onOpenChange,
  editedVC,
  setEditedVC,
  handleEditSubmit,
  handleRemoveFromRound,
  roundId,
}: VCEditDialogProps) {
  const statusOptions: Status[] = ['notContacted', 'contacted', 'closeToBuying', 'sold'];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Edit VC</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedVC.name}
                onChange={(e) => setEditedVC({ ...editedVC, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={editedVC.email || ''}
                onChange={(e) => setEditedVC({ ...editedVC, email: e.target.value || undefined })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={editedVC.website || ''}
                onChange={(e) => setEditedVC({ ...editedVC, website: e.target.value || undefined })}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editedVC.status}
                onValueChange={(value: Status) => setEditedVC({ ...editedVC, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">
                        <StatusBadge status={status} className="mr-2" />
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={editedVC.notes || ''}
                onChange={(e) => setEditedVC({ ...editedVC, notes: e.target.value || undefined })}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            {roundId && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleRemoveFromRound}
                className="mr-auto"
              >
                Remove from Round
              </Button>
            )}
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
