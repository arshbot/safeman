
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Scratchpad } from '@/components/Scratchpad';
import { CRMProvider } from '@/context/CRMContext';
import { CRMState } from '@/types';

// Mock the CRMContext
vi.mock('@/context/CRMContext', () => ({
  useCRM: vi.fn(() => ({
    state: {
      scratchpadNotes: 'Initial notes'
    },
    setScratchpadNotes: vi.fn(),
    isSaving: false
  })),
  CRMProvider: ({ children }) => <>{children}</>
}));

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

describe('Scratchpad Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.resetAllMocks();
  });

  it('should render the scratchpad with initial notes', () => {
    render(<Scratchpad />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Initial notes');
  });

  it('should update notes when typing', () => {
    render(<Scratchpad />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New test notes' } });
    
    expect(textarea).toHaveValue('New test notes');
  });

  it('should save notes after debounce period', async () => {
    const setScratchpadNotes = vi.fn();
    vi.mocked(useCRM).mockReturnValue({
      state: { scratchpadNotes: 'Initial notes' },
      setScratchpadNotes,
      isSaving: false
    });
    
    render(<Scratchpad />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New test notes' } });
    
    // Fast-forward timers
    vi.advanceTimersByTime(2000);
    
    expect(setScratchpadNotes).toHaveBeenCalledWith('New test notes');
  });

  it('should show saving indicator when isSaving is true', () => {
    vi.mocked(useCRM).mockReturnValue({
      state: { scratchpadNotes: 'Initial notes' },
      setScratchpadNotes: vi.fn(),
      isSaving: true
    });
    
    render(<Scratchpad />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should toggle collapse state when toggle button is clicked', () => {
    render(<Scratchpad />);
    
    const toggleButton = screen.getByRole('button', { name: /collapse scratchpad/i });
    const scratchpadCard = document.querySelector('.w-72');
    
    expect(scratchpadCard).not.toHaveClass('translate-x-[calc(100%-12px)]');
    
    fireEvent.click(toggleButton);
    
    expect(scratchpadCard).toHaveClass('translate-x-[calc(100%-12px)]');
  });
});
