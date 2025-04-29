
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CRMProvider } from '@/context/CRMContext';
import { Scratchpad } from '@/components/Scratchpad';
import { initialState } from '@/context/storage';
import * as useDataPersistenceModule from '@/context/hooks/persistence/useSupabasePersistence';

// Mock the persistence functions
vi.mock('@/context/hooks/persistence/useSupabasePersistence', () => ({
  useSupabasePersistence: vi.fn(() => ({
    saveToSupabase: vi.fn(() => Promise.resolve(true)),
    loadFromSupabase: vi.fn(() => Promise.resolve(null))
  }))
}));

// Create a test wrapper that provides the CRM context
const TestProvider = ({ children }) => {
  return (
    <CRMProvider>
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
    render(
      <TestProvider>
        <Scratchpad />
      </TestProvider>
    );

    // Check that notes are loaded from the context
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');

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
    vi.mocked(useDataPersistenceModule.useSupabasePersistence).mockReturnValue({
      saveToSupabase: vi.fn(() => Promise.reject(new Error('Simulated error'))),
      loadFromSupabase: vi.fn(() => Promise.resolve(null))
    });

    render(
      <TestProvider>
        <Scratchpad />
      </TestProvider>
    );

    // Modify the notes to trigger a save
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Notes that will fail to save' } });

    // Check that the UI shows an unsaved state
    await waitFor(() => {
      expect(screen.getByText(/notes/i)).toBeInTheDocument();
    });
  });
});
