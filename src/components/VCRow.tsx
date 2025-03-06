
import { VC, Status } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useCRM } from '@/context/CRMContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface VCRowProps {
  vc: VC;
  roundId?: string;
}

export function VCRow({ vc, roundId }: VCRowProps) {
  const { updateVC, deleteVC, removeVCFromRound, duplicateVC } = useCRM();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedVC, setEditedVC] = useState<VC>(vc);

  const handleEditClick = () => {
    setEditedVC(vc);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateClick = () => {
    if (roundId) {
      duplicateVC(vc.id, roundId);
    } else {
      toast.error("Cannot duplicate - VC is not in a round");
    }
  };

  const handleRemoveFromRound = () => {
    if (roundId) {
      removeVCFromRound(vc.id, roundId);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVC(editedVC);
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    deleteVC(vc.id);
    setIsDeleteDialogOpen(false);
  };

  const statusOptions: Status[] = ['notContacted', 'contacted', 'closeToBuying', 'sold'];

  return (
    <>
      <div className="flex items-center p-3 bg-white border border-gray-100 rounded mb-1 hover:bg-gray-50 transition-all animate-fade-in">
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium">{vc.name}</h4>
            {vc.website && (
              <a 
                href={vc.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-gray-500 hover:text-primary inline-flex items-center"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="text-sm text-gray-600">{vc.email}</div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={vc.status} />
          <div className="flex space-x-1">
            {roundId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDuplicateClick}
                title="Duplicate VC"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditClick}
              title="Edit VC"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDeleteClick}
              title="Delete VC"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit VC Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedVC.email}
                  onChange={(e) => setEditedVC({ ...editedVC, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={editedVC.website || ''}
                  onChange={(e) => setEditedVC({ ...editedVC, website: e.target.value })}
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
                  onChange={(e) => setEditedVC({ ...editedVC, notes: e.target.value })}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glassmorphism">
          <DialogHeader>
            <DialogTitle>Delete VC</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete {vc.name}? This action cannot be undone and will remove this VC from all rounds.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
