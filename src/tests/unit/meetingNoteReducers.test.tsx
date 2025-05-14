import { describe, it, expect, vi } from 'vitest';
import { meetingNoteReducers } from '@/context/reducers/meetingNoteReducers';
import { CRMState, CRMAction } from '@/context/types';
import { MeetingNote, VC } from '@/types';

// Mock the toast function
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

describe('Meeting Note Reducers', () => {
  // Set up initial test state
  const testNote: MeetingNote = {
    id: 'test-note-1',
    content: 'Test meeting note content',
    date: '2023-05-01T12:00:00.000Z'
  };

  const testVC: VC = {
    id: 'test-vc-1',
    name: 'Test VC',
    meetingNotes: [testNote]
  };

  const initialState: CRMState = {
    rounds: [],
    vcs: {
      'test-vc-1': testVC
    },
    unsortedVCs: ['test-vc-1'],
    scratchpadNotes: '',
    expandedRoundIds: [],
    expandedVCIds: []
  };

  it('should add a meeting note to a VC', () => {
    const newNote: MeetingNote = {
      id: 'test-note-2',
      content: 'Another test note',
      date: '2023-05-02T12:00:00.000Z'
    };

    const action: CRMAction = { 
      type: 'ADD_MEETING_NOTE', 
      payload: { 
        vcId: 'test-vc-1', 
        note: newNote 
      } 
    };
    
    const newState = meetingNoteReducers(initialState, action);
    
    expect(newState.vcs['test-vc-1'].meetingNotes).toHaveLength(2);
    expect(newState.vcs['test-vc-1'].meetingNotes).toContainEqual(newNote);
  });

  it('should update an existing meeting note', () => {
    const updatedNote: MeetingNote = {
      ...testNote,
      content: 'Updated content'
    };

    const action: CRMAction = {
      type: 'UPDATE_MEETING_NOTE',
      payload: {
        vcId: 'test-vc-1',
        note: updatedNote
      }
    };
    
    const newState = meetingNoteReducers(initialState, action);
    
    expect(newState.vcs['test-vc-1'].meetingNotes![0].content).toBe('Updated content');
    expect(newState.vcs['test-vc-1'].meetingNotes![0].id).toBe(testNote.id);
  });

  it('should delete a meeting note', () => {
    const action: CRMAction = {
      type: 'DELETE_MEETING_NOTE',
      payload: {
        vcId: 'test-vc-1',
        noteId: testNote.id
      }
    };
    
    const newState = meetingNoteReducers(initialState, action);
    
    expect(newState.vcs['test-vc-1'].meetingNotes).toHaveLength(0);
  });

  it('should handle VC deletion and clean up meeting notes', () => {
    const action: CRMAction = {
      type: 'DELETE_VC',
      payload: 'test-vc-1'
    };
    
    const newState = meetingNoteReducers(initialState, action);
    
    expect(newState.vcs['test-vc-1']).toBeUndefined();
    expect(newState.unsortedVCs).not.toContain('test-vc-1');
  });

  it('should handle adding a note to a VC without existing notes', () => {
    const stateWithoutNotes: CRMState = {
      ...initialState,
      vcs: {
        'test-vc-1': {
          ...testVC,
          meetingNotes: undefined
        }
      }
    };

    const newNote: MeetingNote = {
      id: 'test-note-2',
      content: 'Another test note',
      date: '2023-05-02T12:00:00.000Z'
    };

    const action: CRMAction = { 
      type: 'ADD_MEETING_NOTE', 
      payload: { 
        vcId: 'test-vc-1', 
        note: newNote 
      } 
    };
    
    const newState = meetingNoteReducers(stateWithoutNotes, action);
    
    expect(newState.vcs['test-vc-1'].meetingNotes).toHaveLength(1);
    expect(newState.vcs['test-vc-1'].meetingNotes![0]).toEqual(newNote);
  });

  it('should gracefully handle actions on non-existent VCs', () => {
    const action: CRMAction = { 
      type: 'ADD_MEETING_NOTE', 
      payload: { 
        vcId: 'non-existent-vc', 
        note: testNote
      } 
    };
    
    const newState = meetingNoteReducers(initialState, action);
    
    // State should be unchanged
    expect(newState).toEqual(initialState);
  });
});
