
import { describe, it, expect } from 'vitest';
import { scratchpadReducers } from '@/context/reducers/scratchpadReducers';
import { CRMState, CRMAction } from '@/context/types';

describe('Scratchpad Reducers', () => {
  const initialState: CRMState = {
    rounds: [],
    vcs: {},
    unsortedVCs: [],
    scratchpadNotes: '',
    expandedRoundIds: [],
    expandedVCIds: []
  };

  it('should update scratchpad notes', () => {
    const testNotes = 'Test scratchpad content';
    const action = { type: 'SET_SCRATCHPAD_NOTES', payload: testNotes } as CRMAction;
    
    const newState = scratchpadReducers(initialState, action);
    
    expect(newState.scratchpadNotes).toBe(testNotes);
  });

  it('should not modify other state properties', () => {
    const testNotes = 'Test scratchpad content';
    const stateWithData: CRMState = {
      ...initialState,
      rounds: [{ id: 'test-round', name: 'Test Round', vcs: [] }],
      vcs: { 'test-vc': { id: 'test-vc', name: 'Test VC' } }
    };
    
    const action = { type: 'SET_SCRATCHPAD_NOTES', payload: testNotes } as CRMAction;
    
    const newState = scratchpadReducers(stateWithData, action);
    
    expect(newState.scratchpadNotes).toBe(testNotes);
    expect(newState.rounds).toEqual(stateWithData.rounds);
    expect(newState.vcs).toEqual(stateWithData.vcs);
  });

  it('should return unchanged state for unrelated actions', () => {
    const action = { type: 'UNRELATED_ACTION', payload: {} } as unknown as CRMAction;
    
    const newState = scratchpadReducers(initialState, action);
    
    expect(newState).toBe(initialState);
  });
});
