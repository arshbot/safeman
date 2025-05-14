
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VCRow } from '@/components/VCRow';
import { CRMProvider } from '@/context/CRMContext';

// Mock the context to track delete operations
const mockDeleteVC = vi.fn();
const mockUpdateVC = vi.fn();
const mockRemoveVCFromRound = vi.fn();
const mockDuplicateVC = vi.fn();

// Mock the toast function
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock the CRM context
vi.mock('@/context/CRMContext', () => {
  const actual = vi.importActual('@/context/CRMContext');
  return {
    ...actual,
    useCRM: () => ({
      deleteVC: mockDeleteVC,
      updateVC: mockUpdateVC,
      removeVCFromRound: mockRemoveVCFromRound,
      duplicateVC: mockDuplicateVC,
      isReadOnly: false
    }),
    CRMProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

describe('VC Deletion Integration', () => {
  const testVC = {
    id: 'test-vc-1',
    name: 'Test VC',
    status: 'contacted' as const,
    meetingNotes: [
      { id: 'note-1', content: 'Test note', date: '2023-05-01T12:00:00.000Z' }
    ]
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should handle complete VC deletion flow', async () => {
    render(
      <CRMProvider>
        <VCRow vc={testVC} roundId="round-1" />
      </CRMProvider>
    );
    
    // Verify the VC is rendered
    expect(screen.getByText('Test VC')).toBeInTheDocument();
    
    // Find and click the delete button
    const deleteButton = screen.getAllByRole('button')[3]; // Assuming it's the 4th button
    fireEvent.click(deleteButton);
    
    // Verify the delete dialog is shown
    expect(screen.getByText(/Are you sure you want to delete Test VC\?/)).toBeInTheDocument();
    
    // Confirm deletion
    const confirmDeleteButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(confirmDeleteButton);
    
    // Verify the deleteVC function was called with the correct ID
    expect(mockDeleteVC).toHaveBeenCalledWith('test-vc-1');
    
    // Wait for any async operations to complete
    await waitFor(() => {
      // Dialog should be closed
      expect(screen.queryByText(/Are you sure you want to delete Test VC\?/)).not.toBeInTheDocument();
    });
  });
  
  it('handles cancellation of deletion', async () => {
    render(
      <CRMProvider>
        <VCRow vc={testVC} roundId="round-1" />
      </CRMProvider>
    );
    
    // Find and click the delete button
    const deleteButton = screen.getAllByRole('button')[3]; // Assuming it's the 4th button
    fireEvent.click(deleteButton);
    
    // Verify the delete dialog is shown
    expect(screen.getByText(/Are you sure you want to delete Test VC\?/)).toBeInTheDocument();
    
    // Cancel deletion
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Verify the deleteVC function was NOT called
    expect(mockDeleteVC).not.toHaveBeenCalled();
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText(/Are you sure you want to delete Test VC\?/)).not.toBeInTheDocument();
    });
    
    // VC should still be rendered
    expect(screen.getByText('Test VC')).toBeInTheDocument();
  });
  
  it('handles error cases during deletion', async () => {
    // Mock the deleteVC function to throw an error
    mockDeleteVC.mockImplementation(() => {
      throw new Error('Deletion failed');
    });
    
    render(
      <CRMProvider>
        <VCRow vc={testVC} roundId="round-1" />
      </CRMProvider>
    );
    
    // Find and click the delete button
    const deleteButton = screen.getAllByRole('button')[3]; // Assuming it's the 4th button
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmDeleteButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(confirmDeleteButton);
    
    // Verify the deleteVC function was called
    expect(mockDeleteVC).toHaveBeenCalled();
    
    // We should see an error message (this would typically be handled by the toast, but we're just checking the flow)
    await waitFor(() => {
      // Dialog should still be open in case of an error
      expect(screen.queryByText(/Are you sure you want to delete Test VC\?/)).toBeInTheDocument();
    });
  });
});
