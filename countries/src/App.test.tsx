import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders menu button', () => {
  render(<App />);
  const menuButton = screen.getByRole('button', { name: /meny|menu/i });
  expect(menuButton).toBeInTheDocument();
});
