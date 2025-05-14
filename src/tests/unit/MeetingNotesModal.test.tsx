
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MeetingNotesModal } from '@/components/MeetingNotesModal';
import { VC, MeetingNote } from '@/types';

// Mock the CRM context
vi.mock('@/context/CRMContext', () => ({
  useCRM: () => ({
    addMeetingNote: vi.fn((vcId, content) => {
      mockAddNote(vcId, content);
    }),
    updateMeetingNote: vi.fn((vcId, note) => {
      mockUpdateNote(vcId, note);
    }),
    deleteMeetingNote: vi.fn((vcId, noteId) => {
      mockDeleteNote(vcId, noteId);
    })
  })
}));

const mockAddNote = vi.fn();
const mockUpdateNote = vi.fn();
const mockDeleteNote = vi.fn();

describe('MeetingNotesModal Component', () => {
  const testNotes: MeetingNote[] = [
    {
      id: 'note-1',
      content: 'This is test note 1',
      date: '2023-05-01T12:00:00.000Z'
    },
    {
      id: 'note-2',
      content: 'This is test note 2',
      date: '2023-05-02T14:30:00.000Z'
    }
  ];
  
  const testVC: VC = {
    id: 'test-vc-1',
    name: 'Test VC',
    meetingNotes: testNotes
  };
  
  const mockProps = {
    vc: testVC,
    open: true,
    onOpenChange: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the modal with existing notes', () => {
    render(<MeetingNotesModal {...mockProps} />);
    
    expect(screen.getByText(`Meeting Notes - ${testVC.name}`)).toBeInTheDocument();
    
    // Check that both notes are displayed
    expect(screen.getByText('This is test note 1')).toBeInTheDocument();
    expect(screen.getByText('This is test note 2')).toBeInTheDocument();
  });
  
  it('renders empty state when no notes exist', () => {
    const vcWithoutNotes = {
      ...testVC,
      meetingNotes: []
    };
    
    render(<MeetingNotesModal vc={vcWithoutNotes} open={true} onOpenChange={mockProps.onOpenChange} />);
    
    expect(screen.getByText('No meeting notes yet')).toBeInTheDocument();
  });
  
  it('handles null/undefined meetingNotes gracefully', () => {
    const vcWithUndefinedNotes = {
      ...testVC,
      meetingNotes: undefined
    };
    
    render(<MeetingNotesModal vc={vcWithUndefinedNotes} open={true} onOpenChange={mockProps.onOpenChange} />);
    
    expect(screen.getByText('No meeting notes yet')).toBeInTheDocument();
  });
  
  it('adds a new note', () => {
    render(<MeetingNotesModal {...mockProps} />);
    
    const newNoteText = 'This is a new test note';
    const textarea = screen.getByPlaceholderText('Enter meeting notes...');
    const addButton = screen.getByRole('button', { name: /add note/i });
    
    // Add note text and submit
    fireEvent.change(textarea, { target: { value: newNoteText } });
    fireEvent.click(addButton);
    
    // Verify the add function was called with correct parameters
    expect(mockAddNote).toHaveBeenCalledWith(testVC.id, newNoteText);
    
    // Textarea should be cleared after submission
    expect(textarea).toHaveValue('');
  });
  
  it('edits an existing note', () => {
    render(<MeetingNotesModal {...mockProps} />);
    
    // Find the first note and click its edit button
    const firstNoteContainer = screen.getByText('This is test note 1').closest('div');
    const editButton = within(firstNoteContainer!).getByRole('button', { name: '' });
    
    fireEvent.click(editButton);
    
    // Now there should be a textarea with the note content
    const editTextarea = screen.getByDisplayValue('This is test note 1');
    fireEvent.change(editTextarea, { target: { value: 'Updated note content' } });
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // The update function should be called with the updated note
    expect(mockUpdateNote).toHaveBeenCalledWith(
      testVC.id, 
      expect.objectContaining({
        id: 'note-1',
        content: 'Updated note content'
      })
    );
  });
  
  it('deletes a note', () => {
    render(<MeetingNotesModal {...mockProps} />);
    
    // Find the first note and click its delete button
    const firstNoteContainer = screen.getByText('This is test note 1').closest('div');
    const buttons = within(firstNoteContainer!).getAllByRole('button');
    const deleteButton = buttons[1]; // Second button should be delete
    
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmDeleteButton);
    
    // The delete function should be called with the correct note ID
    expect(mockDeleteNote).toHaveBeenCalledWith(testVC.id, 'note-1');
  });
  
  it('closes the modal', () => {
    render(<MeetingNotesModal {...mockProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
