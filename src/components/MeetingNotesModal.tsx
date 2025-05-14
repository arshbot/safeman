
import { useState } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { MeetingNote, VC } from '@/types';
import { useCRM } from '@/context/CRMContext';
import { CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface MeetingNotesModalProps {
  vc: VC;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeetingNotesModal({ vc, open, onOpenChange }: MeetingNotesModalProps) {
  const { addMeetingNote, updateMeetingNote, deleteMeetingNote } = useCRM();
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Defensive programming - ensure meetingNotes exists and is an array
  const meetingNotes = Array.isArray(vc.meetingNotes) ? vc.meetingNotes : [];
  
  // Sort notes by date, newest first
  const sortedNotes = [...meetingNotes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddNote = () => {
    if (newNote.trim()) {
      addMeetingNote(vc.id, newNote.trim());
      setNewNote('');
    }
  };

  const handleUpdateNote = () => {
    if (editingNote && editingNote.content.trim()) {
      updateMeetingNote(vc.id, editingNote);
      setEditingNote(null);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    deleteMeetingNote(vc.id, noteId);
    setConfirmDelete(null);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p'); // e.g., "Apr 29, 2023, 3:24 PM"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Meeting Notes - {vc.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-grow">
          {/* Add new note section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add New Note</h3>
            <Textarea 
              value={newNote} 
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter meeting notes..."
              className="min-h-[80px]"
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </div>
          
          {/* Notes list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Meeting History</h3>
            
            {sortedNotes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No meeting notes yet</p>
            ) : (
              <ScrollArea className="h-[40vh]">
                <AnimatePresence>
                  {sortedNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border rounded-md p-3 mb-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {formatDate(note.date)}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setEditingNote(note)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setConfirmDelete(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingNote?.id === note.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingNote.content}
                            onChange={(e) => setEditingNote({
                              ...editingNote,
                              content: e.target.value
                            })}
                            className="min-h-[80px]"
                          />
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={handleUpdateNote}
                              disabled={!editingNote.content.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingNote(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </div>
                      )}
                      
                      {confirmDelete === note.id && (
                        <div className="mt-2 p-2 bg-muted/50 rounded border">
                          <p className="text-sm mb-2">Delete this note?</p>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
