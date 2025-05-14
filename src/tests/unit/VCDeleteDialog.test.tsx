
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VCDeleteDialog } from '@/components/vc/VCDeleteDialog';

// Mock the toast function
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('VCDeleteDialog Component', () => {
  const mockProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    vcName: 'Test VC',
    handleDelete: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the dialog with correct VC name', () => {
    render(<VCDeleteDialog {...mockProps} />);
    
    expect(screen.getByText('Delete VC')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete Test VC\?/)).toBeInTheDocument();
  });
  
  it('closes the dialog when cancel button is clicked', () => {
    render(<VCDeleteDialog {...mockProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });
  
  it('calls handleDelete when delete button is clicked', async () => {
    render(<VCDeleteDialog {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(deleteButton);
    
    expect(mockProps.handleDelete).toHaveBeenCalled();
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });
  
  it('shows loading state during deletion', async () => {
    // Mock an async deletion process
    const asyncHandleDelete = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<VCDeleteDialog {...{ ...mockProps, handleDelete: asyncHandleDelete }} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(deleteButton);
    
    // Button should show "Deleting..." and be disabled
    expect(screen.getByRole('button', { name: /deleting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    
    // Cancel button should also be disabled
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    
    // Wait for the deletion to complete
    await waitFor(() => expect(asyncHandleDelete).toHaveBeenCalled());
  });
  
  it('focuses on the delete button when opened', () => {
    render(<VCDeleteDialog {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete$/i });
    expect(document.activeElement).toBe(deleteButton);
  });
});
