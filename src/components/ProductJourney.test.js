import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProductJourney from './ProductJourney';

describe('ProductJourney Tracer Visualizations', () => {
  beforeEach(() => fetch.mockClear());

  test('seamlessly renders trace history array dynamically mapped from native server log', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        history: [
          { ID: 'AST1', Owner: 'ManufacturerX', Status: 'REGISTERED' },
          { ID: 'AST1', Owner: 'DistributorY', Status: 'IN_STORAGE' }
        ]
      })
    });

    render(<ProductJourney assetId="AST1" />);

    await waitFor(() => {
      // Step 1 check
      expect(screen.getByText('Asset Created')).toBeInTheDocument();
      expect(screen.getAllByText(/ManufacturerX/i)[0]).toBeInTheDocument();
      
      // Step 2 transfer propagation mapping properly with role-defined status
      expect(screen.getByText('Lifecycle Event')).toBeInTheDocument();
      expect(screen.getAllByText(/DistributorY/i)[0]).toBeInTheDocument();
      expect(screen.getByText('IN_STORAGE')).toBeInTheDocument();
    });
  });
});
