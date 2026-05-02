import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetTransfer from './AssetTransfer';

describe('AssetTransfer Ownership Form', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('authToken', 'mock-token');
  });

  test('dispatches correct block transaction and flushes state successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    const mockCompleter = jest.fn();
    render(<AssetTransfer assetId="DEMO-PART-1" onTransferComplete={mockCompleter} />);

    fireEvent.change(screen.getByPlaceholderText(/new owner/i), { target: { value: 'retailer-smith' } });
    fireEvent.click(screen.getByRole('button', { name: /transfer asset/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/transfer', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ assetId: 'DEMO-PART-1', newOwner: 'retailer-smith' })
      }));
      expect(screen.getByText(/transferred to retailer-smith successfully/i)).toBeInTheDocument();
      expect(mockCompleter).toHaveBeenCalledWith('DEMO-PART-1', 'retailer-smith');
    });
  });
});
