import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test('renders login form properly', () => {
    render(<Login onLoginSuccess={() => {}} />);
    expect(screen.getByText(/Supply Chain Provenance System/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('calls login API and processes valid callbacks', async () => {
    const mockOnLogin = jest.fn();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'mock-token', user: { username: 'testuser', role: 'manufacturer' } })
    });

    render(<Login onLoginSuccess={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password123' })
      }));
    });

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('mock-token');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('userRole')).toBe('manufacturer');
      expect(mockOnLogin).toHaveBeenCalledWith({ username: 'testuser', role: 'manufacturer' });
    });
  });

  test('displays error message on failed login', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials provided test validation' })
    });

    render(<Login onLoginSuccess={() => {}} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials provided test validation')).toBeInTheDocument();
    });
  });
});
