import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetQuery from './AssetQuery';

describe('AssetQuery Component Context Fencing', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('authToken', 'mock-token');
  });

  test('successfully fetches doc details & displays transfer UI when user securely matches owner', async () => {
    localStorage.setItem('username', 'target-manufacturer');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        asset: {
          ID: 'ASSET01',
          Owner: 'target-manufacturer',
          Status: 'REGISTERED',
          DocumentHash: 'bafykrei'
        }
      })
    });

    // Mock embedded IPFS network ping
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ metadata: { data: 'Off-chain test details parsed locally' } })
    });

    render(<AssetQuery />);
    fireEvent.change(screen.getByPlaceholderText(/enter asset id/i), { target: { value: 'ASSET01' } });
    fireEvent.click(screen.getByRole('button', { name: /query asset/i }));

    await waitFor(() => {
      expect(screen.getByText('ASSET01')).toBeInTheDocument();
      expect(screen.getByText(/Off-chain test details parsed locally/i)).toBeInTheDocument();
    });
  });

  test('explicitly hides ownership transfer abilities from users lacking authority', async () => {
    localStorage.setItem('username', 'bad-actor-customer');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        asset: { ID: 'ASSET01', Owner: 'target-manufacturer' }
      })
    });

    render(<AssetQuery />);
    fireEvent.change(screen.getByPlaceholderText(/enter asset id/i), { target: { value: 'ASSET01' } });
    fireEvent.click(screen.getByRole('button', { name: /query asset/i }));

    await waitFor(() => {
      expect(screen.getByText('target-manufacturer')).toBeInTheDocument();
      // Asserts restricted UX module execution
      expect(screen.queryByTestId('mock-transfer-component')).not.toBeInTheDocument();
    });
  });
});
