
import { describe, it, expect, vi } from 'vitest';
import { crmReducer } from '@/context/reducers';
import { CRMState, CRMAction } from '@/context/types';

// Mock the toast function since the reducers import it
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('CRM Main Reducer', () => {
  const initialState: CRMState = {
    rounds: [
      { id: 'round-1', name: 'Test Round', vcs: ['vc-1'] }
    ],
    vcs: {
      'vc-1': {
        id: 'vc-1',
        name: 'Test VC',
        meetingNotes: [
          { id: 'note-1', content: 'Test note', date: '2023-01-01T12:00:00.000Z' }
        ]
      }
    },
    unsortedVCs: [],
    scratchpadNotes: '',
    expandedRoundIds: [],
    expandedVCIds: ['vc-1']
  };

  it('should handle DELETE_VC action in both VC and meeting note reducers', () => {
    const action: CRMAction = {
      type: 'DELETE_VC',
      payload: 'vc-1'
    };
    
    const newState = crmReducer(initialState, action);
    
    // Check that the VC is removed from the state
    expect(newState.vcs['vc-1']).toBeUndefined();
    
    // Check that the VC is removed from rounds
    expect(newState.rounds[0].vcs).not.toContain('vc-1');
    
    // Check that the VC ID is removed from expandedVCIds
    expect(newState.expandedVCIds).not.toContain('vc-1');
  });

  it('should initialize state', () => {
    const newState: CRMState = {
      rounds: [{ id: 'new-round', name: 'New Round', vcs: [] }],
      vcs: {},
      unsortedVCs: [],
      scratchpadNotes: 'New notes',
      expandedRoundIds: [],
      expandedVCIds: []
    };
    
    const action: CRMAction = {
      type: 'INITIALIZE_STATE',
      payload: newState
    };
    
    const result = crmReducer(initialState, action);
    
    expect(result).toEqual(newState);
  });

  it('should delegate to appropriate reducer based on action type', () => {
    // Test round reducer
    const roundAction: CRMAction = {
      type: 'ADD_ROUND',
      payload: { id: 'new-round', name: 'New Round' }
    };
    
    const stateAfterRoundAction = crmReducer(initialState, roundAction);
    expect(stateAfterRoundAction.rounds).toHaveLength(2);
    expect(stateAfterRoundAction.rounds[1].name).toBe('New Round');
    
    // Test VC reducer
    const vcAction: CRMAction = {
      type: 'ADD_VC',
      payload: { id: 'new-vc', vc: { name: 'New VC' } }
    };
    
    const stateAfterVCAction = crmReducer(initialState, vcAction);
    expect(stateAfterVCAction.vcs['new-vc']).toBeDefined();
    expect(stateAfterVCAction.vcs['new-vc'].name).toBe('New VC');
    
    // Test meeting note reducer
    const noteAction: CRMAction = {
      type: 'ADD_MEETING_NOTE',
      payload: {
        vcId: 'vc-1',
        note: { id: 'new-note', content: 'New note', date: '2023-01-02T12:00:00.000Z' }
      }
    };
    
    const stateAfterNoteAction = crmReducer(initialState, noteAction);
    expect(stateAfterNoteAction.vcs['vc-1'].meetingNotes).toHaveLength(2);
  });
});
