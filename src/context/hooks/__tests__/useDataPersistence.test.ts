
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataPersistence } from '../useDataPersistence';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    upsert: vi.fn().mockReturnThis(),
  }
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('useDataPersistence', () => {
  // Sample test data
  const mockUser = { id: 'user123' };
  const mockDispatch = vi.fn();
  const mockSetIsLoading = vi.fn();
  const mockState = {
    vcs: { vc1: { id: 'vc1', name: 'VC One', status: 'notContacted' } },
    rounds: [],
    unsortedVCs: [],
    expandedRoundIds: [],
    expandedVCIds: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Setup default supabase mocks
    supabase.from = vi.fn().mockReturnThis();
    supabase.select = vi.fn().mockReturnThis();
    supabase.eq = vi.fn().mockReturnThis();
    supabase.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    supabase.upsert = vi.fn().mockReturnThis();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load data from Supabase when user is authenticated', async () => {
    // Mock successful data load
    const mockData = {
      vcs: { vc1: { id: 'vc1', name: 'Test VC', status: 'notContacted' } },
      rounds: [{ id: 'round1', name: 'Seed', vcs: [] }],
      unsortedVCs: ['vc1'],
      expandedRoundIds: [],
      expandedVCIds: [],
    };
    
    supabase.maybeSingle = vi.fn().mockResolvedValue({ 
      data: { data: mockData },
      error: null 
    });

    // Render the hook
    await act(async () => {
      renderHook(() => useDataPersistence(
        mockUser,
        false,
        mockDispatch,
        mockState,
        mockSetIsLoading
      ));
    });

    // Check that data was loaded and dispatch was called
    expect(supabase.from).toHaveBeenCalledWith('user_crm_data');
    expect(supabase.eq).toHaveBeenCalledWith('user_id', 'user123');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'INITIALIZE_STATE',
      payload: mockData
    });
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Data loaded successfully'
    }));
  });

  it('should handle Supabase fetch errors gracefully', async () => {
    // Mock Supabase error
    supabase.maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' }
    });

    // Render the hook
    await act(async () => {
      renderHook(() => useDataPersistence(
        mockUser,
        false,
        mockDispatch,
        mockState,
        mockSetIsLoading
      ));
    });

    // Check error handling
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Failed to load your data',
      variant: 'destructive'
    }));
    expect(mockDispatch).not.toHaveBeenCalled(); // Should not dispatch with bad data
  });

  it('should load data from localStorage when user is not authenticated', async () => {
    // Mock localStorage data
    const mockLocalData = {
      vcs: { vc2: { id: 'vc2', name: 'Local VC', status: 'contacted' } },
      rounds: [],
      unsortedVCs: ['vc2'],
      expandedRoundIds: [],
      expandedVCIds: [],
    };

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockLocalData));

    // Render the hook with no user (anonymous mode)
    await act(async () => {
      renderHook(() => useDataPersistence(
        null,
        false,
        mockDispatch,
        mockState,
        mockSetIsLoading
      ));
    });

    // Check localStorage was used
    expect(window.localStorage.getItem).toHaveBeenCalledWith('crmState-anonymous');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'INITIALIZE_STATE',
      payload: mockLocalData
    });
  });

  it('should save data to Supabase when state changes for authenticated users', async () => {
    // Mock successful save
    supabase.upsert = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: {}, error: null })
    });
    
    // Setup timer mocks
    vi.useFakeTimers();
    
    // Render the hook
    let result;
    await act(async () => {
      result = renderHook(() => useDataPersistence(
        mockUser,
        false,
        mockDispatch,
        mockState,
        mockSetIsLoading
      )).result;
    });
    
    // Trigger a state change
    await act(async () => {
      vi.advanceTimersByTime(2500); // Advance past debounce timer
    });
    
    // Check that save was attempted
    expect(supabase.from).toHaveBeenCalledWith('user_crm_data');
    expect(supabase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user123',
        data: expect.anything()
      }),
      { onConflict: 'user_id' }
    );
    
    vi.useRealTimers();
  });
});
