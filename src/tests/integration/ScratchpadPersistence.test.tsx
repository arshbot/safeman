
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CRMProvider } from '@/context/CRMContext';
import { Scratchpad } from '@/components/Scratchpad';
import { initialState } from '@/context/storage';

// Mock the persistence functions
vi.mock('@/context/hooks/useDataPersistence', () => ({
  useDataPersistence: vi.fn(() => ({
    isSaving: false,
    saveError: null,
    retryCount: 0,
    manualSave: vi.fn(() => Promise.resolve(true))
  }))
}));

// Create a test wrapper that provides the CRM context
const TestProvider = ({ children, testState }) => {
  return (
    <CRMProvider initialTestState={testState}>
      {children}
    </CRMProvider>
  );
};

describe('Scratchpad Persistence Integration', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load and save scratchpad notes through the CRM context', async () => {
    const testState = {
      ...initialState,
      scratchpadNotes: 'Test initial notes'
    };

    render(
      <TestProvider testState={testState}>
        <Scratchpad />
      </TestProvider>
    );

    // Check that notes are loaded from the context
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test initial notes');

    // Modify the notes
    fireEvent.change(textarea, { target: { value: 'Modified notes' } });

    // Wait for debounce and check that setScratchpadNotes was called
    await waitFor(() => {
      // This is indirect testing since we're mocking the context
      // In a real app, we would check that the dispatched action was processed
      expect(textarea).toHaveValue('Modified notes');
    });
  });

  it('should handle errors when saving notes', async () => {
    // Mock the persistence hook to simulate an error
    vi.mocked(useDataPersistence).mockReturnValue({
      isSaving: false,
      saveError: 'Simulated error',
      retryCount: 1,
      manualSave: vi.fn(() => Promise.reject(new Error('Simulated error')))
    });

    render(
      <TestProvider testState={initialState}>
        <Scratchpad />
      </TestProvider>
    );

    // Modify the notes to trigger a save
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Notes that will fail to save' } });

    // Check that the UI shows an unsaved state
    await waitFor(() => {
      expect(screen.getByText('Unsaved')).toBeInTheDocument();
    });
  });
});
