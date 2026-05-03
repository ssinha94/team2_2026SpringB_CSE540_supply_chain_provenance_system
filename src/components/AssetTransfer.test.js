import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetTransfer from './AssetTransfer';

describe('AssetTransfer Ownership Form', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('authToken', 'mock-token');
  });

  test('dispatches correct block transaction and flushes state successfully', async () => {
    // First call: fetch assets owned by the user on mount
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assets: [{ ID: 'DEMO-PART-1', Status: 'ORIGINATED' }] })
    });

    // Second call: submit transfer request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Third call: refresh user's asset list after transfer
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assets: [] })
    });
    
    const mockCompleter = jest.fn();
    render(<AssetTransfer assetId="DEMO-PART-1" onTransferComplete={mockCompleter} />);

    await waitFor(() => expect(screen.getByText(/you own 1 asset/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/new owner username/i), { target: { value: 'retailer-smith' } });
    fireEvent.click(screen.getByRole('button', { name: /transfer asset/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenNthCalledWith(2, '/transfer', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ assetId: 'DEMO-PART-1', newOwner: 'retailer-smith' })
      }));
      expect(screen.getByText(/transferred to retailer-smith successfully/i)).toBeInTheDocument();
      expect(mockCompleter).toHaveBeenCalledWith('DEMO-PART-1', 'retailer-smith');
    });
  });
});
