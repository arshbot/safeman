
import React, { ReactNode } from 'react';
import { CRMProvider } from '@/context/CRMContext';
import { CRMState } from '@/types';
import { vi } from 'vitest';

// Mock for the toast functionality
export const mockToast = () => {
  const mock = vi.fn();
  vi.mock('@/hooks/use-toast', () => ({
    toast: mock,
    useToast: () => ({ toast: mock })
  }));
  return mock;
};

// Create a test VC with optional overrides
export const createTestVC = (overrides = {}) => ({
  id: 'test-vc-id',
  name: 'Test VC',
  description: 'A test VC',
  status: 'notContacted',
  meetingNotes: [],
  ...overrides
});

// Create a test meeting note with optional overrides
export const createTestMeetingNote = (overrides = {}) => ({
  id: 'test-note-id',
  content: 'Test meeting note content',
  date: new Date().toISOString(),
  ...overrides
});

// Create a test round with optional overrides
export const createTestRound = (overrides = {}) => ({
  id: 'test-round-id',
  name: 'Test Round',
  vcs: [],
  ...overrides
});

// Create initial test state for the CRM context
export const createTestCRMState = (overrides: Partial<CRMState> = {}): CRMState => ({
  rounds: [],
  vcs: {},
  unsortedVCs: [],
  scratchpadNotes: '',
  expandedRoundIds: [],
  expandedVCIds: [],
  ...overrides
});

// A wrapper component to provide mocked CRM context for tests
export const TestCRMProvider = ({ 
  children, 
  initialState = createTestCRMState(),
  mockHandlers = {}
}: { 
  children: ReactNode;
  initialState?: CRMState;
  mockHandlers?: Record<string, any>;
}) => {
  // Mock implementation of CRM context for testing
  vi.mock('@/context/CRMContext', () => ({
    ...vi.importActual('@/context/CRMContext'),
    useCRM: () => ({
      state: initialState,
      isReadOnly: false,
      isSaving: false,
      saveError: null,
      retryCount: 0,
      // Default mock implementations for common actions
      addVC: vi.fn(),
      updateVC: vi.fn(),
      deleteVC: vi.fn(),
      duplicateVC: vi.fn(),
      addRound: vi.fn(),
      updateRound: vi.fn(),
      deleteRound: vi.fn(),
      addMeetingNote: vi.fn(),
      updateMeetingNote: vi.fn(),
      deleteMeetingNote: vi.fn(),
      // Override with any provided mock handlers
      ...mockHandlers
    })
  }));
  
  return <>{children}</>;
};

// Helper to create a full test environment
export const renderWithCRM = (
  ui: React.ReactElement,
  options: {
    initialState?: CRMState;
    mockHandlers?: Record<string, any>;
  } = {}
) => {
  return render(
    <TestCRMProvider 
      initialState={options.initialState} 
      mockHandlers={options.mockHandlers}
    >
      {ui}
    </TestCRMProvider>
  );
};
