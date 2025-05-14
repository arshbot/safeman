
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeetingNotesModal } from '@/components/MeetingNotesModal';
import { useCRM } from '@/context/CRMContext';
import { VC, MeetingNote } from '@/types';

// A mock state to track changes
let mockMeetingNotes: MeetingNote[] = [
  {
    id: 'note-1',
    content: 'Test note 1',
    date: '2023-05-01T12:00:00.000Z'
  }
];

// Mock UUID for deterministic tests
vi.mock('uuid', () => ({
  v4: () => 'new-note-id'
}));

// Mock date for deterministic tests
const mockDate = new Date('2023-06-01T12:00:00.000Z');
vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

// Mock the CRM context
vi.mock('@/context/CRMContext', () => ({
  useCRM: () => ({
    addMeetingNote: vi.fn((vcId, content) => {
      const newNote = {
        id: 'new-note-id',
        content,
        date: new Date().toISOString()
      };
      mockMeetingNotes = [...mockMeetingNotes, newNote];
      return newNote;
    }),
    updateMeetingNote: vi.fn((vcId, note) => {
      mockMeetingNotes = mockMeetingNotes.map(n => 
        n.id === note.id ? note : n
      );
    }),
    deleteMeetingNote: vi.fn((vcId, noteId) => {
      mockMeetingNotes = mockMeetingNotes.filter(n => n.id !== noteId);
    })
  })
}));

describe('Meeting Notes CRUD Integration', () => {
  const testVC: VC = {
    id: 'test-vc-1',
    name: 'Test VC',
    get meetingNotes() {
      return mockMeetingNotes;
    }
  };
  
  const mockProps = {
    vc: testVC,
    open: true,
    onOpenChange: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock notes to initial state
    mockMeetingNotes = [
      {
        id: 'note-1',
        content: 'Test note 1',
        date: '2023-05-01T12:00:00.000Z'
      }
    ];
  });
  
  it('should add a new note', async () => {
    const { rerender } = render(<MeetingNotesModal {...mockProps} />);
    
    // Initial state should have 1 note
    expect(screen.getByText('Test note 1')).toBeInTheDocument();
    
    // Add a new note
    const textarea = screen.getByPlaceholderText('Enter meeting notes...');
    fireEvent.change(textarea, { target: { value: 'New test note' } });
    
    const addButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(addButton);
    
    // Re-render with updated notes
    rerender(<MeetingNotesModal {...mockProps} />);
    
    // Should now show both notes
    expect(screen.getByText('Test note 1')).toBeInTheDocument();
    expect(screen.getByText('New test note')).toBeInTheDocument();
  });
  
  it('should update an existing note', async () => {
    const { rerender } = render(<MeetingNotesModal {...mockProps} />);
    
    // Find and click edit button on the first note
    const noteContainer = screen.getByText('Test note 1').closest('div');
    const editButton = noteContainer!.querySelector('button');
    fireEvent.click(editButton!);
    
    // Edit the note content
    const editTextarea = screen.getByDisplayValue('Test note 1');
    fireEvent.change(editTextarea, { target: { value: 'Updated note content' } });
    
    // Save the changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Re-render with updated notes
    rerender(<MeetingNotesModal {...mockProps} />);
    
    // Should now show the updated note
    expect(screen.queryByText('Test note 1')).not.toBeInTheDocument();
    expect(screen.getByText('Updated note content')).toBeInTheDocument();
  });
  
  it('should delete an existing note', async () => {
    const { rerender } = render(<MeetingNotesModal {...mockProps} />);
    
    // Initial state should have 1 note
    expect(screen.getByText('Test note 1')).toBeInTheDocument();
    
    // Find and click delete button on the note
    const noteContainer = screen.getByText('Test note 1').closest('div');
    const buttons = noteContainer!.querySelectorAll('button');
    const deleteButton = buttons[1]; // Second button should be delete
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(confirmButton);
    
    // Re-render with updated notes
    rerender(<MeetingNotesModal {...mockProps} />);
    
    // The note should be gone
    expect(screen.queryByText('Test note 1')).not.toBeInTheDocument();
    expect(screen.getByText('No meeting notes yet')).toBeInTheDocument();
  });
  
  it('should handle cancelling operations', async () => {
    render(<MeetingNotesModal {...mockProps} />);
    
    // Start editing a note but cancel
    const noteContainer = screen.getByText('Test note 1').closest('div');
    const editButton = noteContainer!.querySelector('button');
    fireEvent.click(editButton!);
    
    // Make changes
    const editTextarea = screen.getByDisplayValue('Test note 1');
    fireEvent.change(editTextarea, { target: { value: 'Will be discarded' } });
    
    // Cancel the edit
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // The original note content should still be there
    expect(screen.getByText('Test note 1')).toBeInTheDocument();
    expect(screen.queryByText('Will be discarded')).not.toBeInTheDocument();
    
    // Start deletion but cancel
    const buttons = noteContainer!.querySelectorAll('button');
    const deleteButton = buttons[1]; // Second button should be delete
    fireEvent.click(deleteButton);
    
    // Cancel the deletion
    const cancelDeleteButton = screen.getByRole('button', { name: /cancel$/i });
    fireEvent.click(cancelDeleteButton);
    
    // The note should still be there
    expect(screen.getByText('Test note 1')).toBeInTheDocument();
  });
});
