
import { vi } from 'vitest';
import { CRMState } from '@/types';

// Helper to mock local storage for persistence tests
export const mockLocalStorage = () => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    getStore: () => ({ ...store }),
    length: 0,
    key: vi.fn()
  };
};

// Helper to mock Supabase client for persistence tests
export const mockSupabaseClient = (options = { shouldSucceed: true }) => {
  return {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } },
        error: null 
      })),
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: { user: { id: 'test-user-id' } } },
        error: null 
      })),
      onAuthStateChange: vi.fn(() => ({
        subscription: {
          unsubscribe: vi.fn()
        }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: options.shouldSucceed ? { data: mockInitialState } : null,
            error: options.shouldSucceed ? null : new Error('Test error')
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({
        error: options.shouldSucceed ? null : new Error('Test insert error')
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          error: options.shouldSucceed ? null : new Error('Test update error')
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({
        error: options.shouldSucceed ? null : new Error('Test upsert error')
      }))
    }))
  };
};

// Mock initial state for persistence tests
export const mockInitialState: CRMState = {
  rounds: [
    {
      id: 'round-1',
      name: 'Seed Round',
      vcs: ['vc-1', 'vc-2']
    }
  ],
  vcs: {
    'vc-1': {
      id: 'vc-1',
      name: 'Venture A',
      status: 'contacted',
      meetingNotes: [
        {
          id: 'note-1',
          content: 'Initial meeting',
          date: '2023-01-01T12:00:00.000Z'
        }
      ]
    },
    'vc-2': {
      id: 'vc-2',
      name: 'Venture B',
      status: 'notContacted'
    }
  },
  unsortedVCs: [],
  scratchpadNotes: 'Test notes',
  expandedRoundIds: ['round-1'],
  expandedVCIds: []
};

// Helper to simulate persistence operations
export const simulatePersistenceOperations = async (
  initialState: CRMState,
  operations: Array<{ type: string; payload: any }>,
  storage: ReturnType<typeof mockLocalStorage>
) => {
  // Apply operations to the state
  let currentState = { ...initialState };
  
  for (const op of operations) {
    // Simulate reducer
    // This is just a mock implementation - in real tests you'd use the actual reducers
    if (op.type === 'ADD_VC') {
      const { id, vc } = op.payload;
      currentState = {
        ...currentState,
        vcs: {
          ...currentState.vcs,
          [id]: { id, ...vc }
        },
        unsortedVCs: [...currentState.unsortedVCs, id]
      };
    } else if (op.type === 'DELETE_VC') {
      const vcId = op.payload;
      const { [vcId]: _, ...remainingVCs } = currentState.vcs;
      currentState = {
        ...currentState,
        vcs: remainingVCs,
        unsortedVCs: currentState.unsortedVCs.filter(id => id !== vcId)
      };
    }
    // Add more operation types as needed
    
    // Simulate saving to storage
    storage.setItem('crm-state', JSON.stringify(currentState));
  }
  
  return currentState;
};
