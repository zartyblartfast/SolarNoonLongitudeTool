import { render, screen } from '@testing-library/react';
import App from './App';

describe('App progress page', () => {
  it('introduces the educational solar-noon location goal', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /solar noon location explorer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/educational tool/i)
    ).toBeInTheDocument();
  });

  it('shows the planned orthographic earth context without replacing the schematic diagrams', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /orthographic earth context/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/supporting context diagram/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not replace the latitude and longitude schematic diagrams/i)
    ).toBeInTheDocument();
  });

  it('shows implementation progress phases', () => {
    render(<App />);

    expect(screen.getByText(/phase 1/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByText(/phase 4/i)).toBeInTheDocument();
  });
});
