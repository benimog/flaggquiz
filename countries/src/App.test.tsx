import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders menu button', () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  const menuButton = screen.getByRole('button', { name: /meny|menu/i });
  expect(menuButton).toBeInTheDocument();
});

test('unknown route shows the 404 page', async () => {
  window.history.pushState({}, '', '/finns-inte');
  render(<App />);
  expect(await screen.findByText('404')).toBeInTheDocument();
});
