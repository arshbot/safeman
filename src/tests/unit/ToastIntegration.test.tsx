
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { meetingNoteReducers } from '@/context/reducers/meetingNoteReducers';
import { CRMState, CRMAction } from '@/context/types';
import { toast } from '@/components/ui/use-toast';

// Mock the toast function
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('Toast Integration with Reducers', () => {
  const initialState: CRMState = {
    rounds: [],
    vcs: {
      'test-vc-1': {
        id: 'test-vc-1',
        name: 'Test VC',
        meetingNotes: [
          {
            id: 'test-note-1',
            content: 'Test note',
            date: '2023-01-01T12:00:00.000Z'
          }
        ]
      }
    },
    unsortedVCs: ['test-vc-1'],
    scratchpadNotes: '',
    expandedRoundIds: [],
    expandedVCIds: []
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should show toast when adding a meeting note', () => {
    const action: CRMAction = {
      type: 'ADD_MEETING_NOTE',
      payload: {
        vcId: 'test-vc-1',
        note: {
          id: 'new-note',
          content: 'New meeting note',
          date: '2023-01-02T12:00:00.000Z'
        }
      }
    };
    
    meetingNoteReducers(initialState, action);
    
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Meeting Note Added',
        description: expect.stringContaining('Test VC')
      })
    );
  });
  
  it('should show toast when updating a meeting note', () => {
    const action: CRMAction = {
      type: 'UPDATE_MEETING_NOTE',
      payload: {
        vcId: 'test-vc-1',
        note: {
          id: 'test-note-1',
          content: 'Updated content',
          date: '2023-01-01T12:00:00.000Z'
        }
      }
    };
    
    meetingNoteReducers(initialState, action);
    
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Meeting Note Updated',
        description: expect.stringContaining('Test VC')
      })
    );
  });
  
  it('should show toast when deleting a meeting note', () => {
    const action: CRMAction = {
      type: 'DELETE_MEETING_NOTE',
      payload: {
        vcId: 'test-vc-1',
        noteId: 'test-note-1'
      }
    };
    
    meetingNoteReducers(initialState, action);
    
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Meeting Note Deleted',
        description: expect.stringContaining('Test VC')
      })
    );
  });
  
  it('should not show toast for non-existent VCs', () => {
    const action: CRMAction = {
      type: 'ADD_MEETING_NOTE',
      payload: {
        vcId: 'non-existent-vc',
        note: {
          id: 'new-note',
          content: 'New meeting note',
          date: '2023-01-02T12:00:00.000Z'
        }
      }
    };
    
    meetingNoteReducers(initialState, action);
    
    expect(toast).not.toHaveBeenCalled();
  });
});
