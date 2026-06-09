import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Eggcellent dashboard', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /eggcellent/i })).toBeInTheDocument();
});
