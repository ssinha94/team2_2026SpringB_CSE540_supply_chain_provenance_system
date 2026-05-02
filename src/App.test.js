import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock Login to isolate App's routing & state-sync mechanisms
jest.mock('./components/Login', () => {
  return function MockLogin({ onLoginSuccess }) {
    return (
      <div data-testid="login-mock">
        <button onClick={() => onLoginSuccess({ username: 'mock-super', role: 'superuser' })}>
          Trigger Login
        </button>
      </div>
    );
  };
});

describe('App Root Routing Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('forces unauthenticated users natively into the Login module view', () => {
    render(<App />);
    expect(screen.getByTestId('login-mock')).toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  test('unlocks tab navigation elements upon successful login payload', () => {
    render(<App />);
    // Fire the mock login mechanism simulating an auth loop completion 
    fireEvent.click(screen.getByText('Trigger Login'));

    expect(screen.getByText('mock-super')).toBeInTheDocument();
    
    // Assert navigation and logout controls render successfully
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /register asset/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /query asset/i })).toBeInTheDocument();
  });
});
