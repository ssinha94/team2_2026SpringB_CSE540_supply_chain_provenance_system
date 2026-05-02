import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetRegistration from './AssetRegistration';

describe('AssetRegistration Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('authToken', 'mock-token');
  });

  test('successfully registers asset sequentially bridging IPFS and Blockchain mock', async () => {
    // 1. Mock IPFS returns fake CID
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cid: 'bafy-mock-cid' })
    });

    // 2. Mock Register returns success
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    const mockOnRegister = jest.fn();
    render(<AssetRegistration onAssetRegistered={mockOnRegister} />);

    fireEvent.change(screen.getByLabelText(/asset id/i), { target: { value: 'BATCH123' } });
    fireEvent.change(screen.getByLabelText(/document metadata/i), { target: { value: 'Vaccines at -20C' } });
    
    fireEvent.click(screen.getByRole('button', { name: /register asset/i }));

    await waitFor(() => {
      // Validate IPFS routing
      expect(fetch).toHaveBeenNthCalledWith(1, '/ipfs/upload', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' }
      }));
    });

    await waitFor(() => {
      // Validate Registry routing payload injection of new CID
      expect(fetch).toHaveBeenNthCalledWith(2, '/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ assetId: 'BATCH123', docHash: 'bafy-mock-cid' })
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('✅ Asset BATCH123 registered successfully!')).toBeInTheDocument();
      expect(mockOnRegister).toHaveBeenCalledWith('BATCH123');
    });
  });
});
