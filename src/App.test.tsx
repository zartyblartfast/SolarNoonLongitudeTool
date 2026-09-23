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
    expect(screen.getAllByText(/completed/i)).toHaveLength(2);
    expect(screen.getByText(/phase 4/i)).toBeInTheDocument();
  });

  it('shows the Kinglake reference calculation from the domain engine', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /kinglake reference calculation/i })).toBeInTheDocument();
    expect(screen.getByText(/37\.44° S, 145\.22° E/i)).toBeInTheDocument();
    expect(screen.getByText(/zenith distance: 37\.8°/i)).toBeInTheDocument();
  });

  it('shows the first schematic latitude diagram slice', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /latitude: using the sun’s altitude/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /latitude diagram/i })).toBeInTheDocument();
  });
});
