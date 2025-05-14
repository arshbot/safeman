import { describe, it, expect, vi } from 'vitest';
import { vcReducers } from '@/context/reducers/vc';
import { CRMState, CRMAction } from '@/context/types';
import { v4 as uuidv4 } from 'uuid';

// Mock UUID for deterministic tests
vi.mock('uuid', () => ({
  v4: () => 'mocked-uuid'
}));

describe('VC Reducers', () => {
  const initialState: CRMState = {
    rounds: [
      { id: 'round-1', name: 'Round 1', vcs: ['vc-1'] },
      { id: 'round-2', name: 'Round 2', vcs: [] }
    ],
    vcs: {
      'vc-1': { id: 'vc-1', name: 'Test VC 1' },
      'vc-2': { id: 'vc-2', name: 'Test VC 2' }
    },
    unsortedVCs: ['vc-2'],
    scratchpadNotes: '',
    expandedRoundIds: [],
    expandedVCIds: []
  };

  describe('ADD_VC action', () => {
    it('should add a new VC to state', () => {
      const action: CRMAction = {
        type: 'ADD_VC',
        payload: {
          id: 'vc-3',
          vc: { name: 'Test VC 3', description: 'A new VC' }
        }
      };

      const newState = vcReducers(initialState, action);

      expect(newState.vcs['vc-3']).toBeDefined();
      expect(newState.vcs['vc-3'].name).toBe('Test VC 3');
      expect(newState.unsortedVCs).toContain('vc-3');
    });
  });

  describe('UPDATE_VC action', () => {
    it('should update an existing VC', () => {
      const action: CRMAction = {
        type: 'UPDATE_VC',
        payload: {
          id: 'vc-1',
          name: 'Updated VC 1',
          description: 'Updated description'
        }
      };

      const newState = vcReducers(initialState, action);

      expect(newState.vcs['vc-1'].name).toBe('Updated VC 1');
      expect(newState.vcs['vc-1'].description).toBe('Updated description');
    });
  });

  describe('DELETE_VC action', () => {
    it('should delete a VC and remove it from all rounds', () => {
      const action: CRMAction = {
        type: 'DELETE_VC',
        payload: 'vc-1'
      };

      const newState = vcReducers(initialState, action);

      expect(newState.vcs['vc-1']).toBeDefined();
      expect(newState.vcs['vc-1'].status).toBe('banished');
      expect(newState.rounds[0].vcs).not.toContain('vc-1');
    });

    it('should handle deleting a non-existent VC gracefully', () => {
      const action: CRMAction = {
        type: 'DELETE_VC',
        payload: 'non-existent-vc'
      };

      const newState = vcReducers(initialState, action);

      // State should be unchanged
      expect(newState).toEqual(initialState);
    });
  });

  describe('DUPLICATE_VC action', () => {
    it('should duplicate a VC and add it to the specified round', () => {
      const action: CRMAction = {
        type: 'DUPLICATE_VC',
        payload: { vcId: 'vc-1', roundId: 'round-2' }
      };

      const newState = vcReducers(initialState, action);
      
      // Check that the original VC still exists
      expect(newState.vcs['vc-1']).toBeDefined();
      
      // Check that a new VC was created with the mocked UUID
      expect(newState.vcs['mocked-uuid']).toBeDefined();
      expect(newState.vcs['mocked-uuid'].name).toBe('Test VC 1 (copy)');
      
      // Check that the new VC was added to the specified round
      expect(newState.rounds[1].vcs).toContain('mocked-uuid');
    });

    it('should handle duplicating a non-existent VC gracefully', () => {
      const action: CRMAction = {
        type: 'DUPLICATE_VC',
        payload: { vcId: 'non-existent-vc', roundId: 'round-2' }
      };

      const newState = vcReducers(initialState, action);

      // State should be unchanged
      expect(newState).toEqual(initialState);
    });
  });

  describe('Movement between rounds', () => {
    it('should move a VC from one round to another', () => {
      const action: CRMAction = {
        type: 'MOVE_VC_BETWEEN_ROUNDS',
        payload: { vcId: 'vc-1', sourceRoundId: 'round-1', destRoundId: 'round-2' }
      };

      const newState = vcReducers(initialState, action);

      expect(newState.rounds[0].vcs).not.toContain('vc-1');
      expect(newState.rounds[1].vcs).toContain('vc-1');
    });

    it('should move a VC from unsorted to a round', () => {
      const action: CRMAction = {
        type: 'MOVE_VC_BETWEEN_ROUNDS',
        payload: { vcId: 'vc-2', sourceRoundId: null, destRoundId: 'round-2' }
      };

      const newState = vcReducers(initialState, action);

      expect(newState.unsortedVCs).not.toContain('vc-2');
      expect(newState.rounds[1].vcs).toContain('vc-2');
    });

    it('should move a VC from a round to unsorted', () => {
      const action: CRMAction = {
        type: 'MOVE_VC_BETWEEN_ROUNDS',
        payload: { vcId: 'vc-1', sourceRoundId: 'round-1', destRoundId: null }
      };

      const newState = vcReducers(initialState, action);

      expect(newState.rounds[0].vcs).not.toContain('vc-1');
      expect(newState.unsortedVCs).toContain('vc-1');
    });
  });
});
