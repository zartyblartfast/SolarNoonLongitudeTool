import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App progress page', () => {
  it('introduces the educational solar-noon location goal', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /find a location from a solar-noon observation/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/educational estimate/i)
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
      screen.getByText(/not replace the schematic diagrams/i)
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

    expect(screen.getByRole('heading', { name: /current result/i })).toBeInTheDocument();
    expect(screen.getByText(/37\.45° S, 145\.22° E/i)).toBeInTheDocument();
    expect(screen.getAllByText(/zenith distance/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/37\.8°/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/astronomy engine/i).length).toBeGreaterThan(0);
  });

  it('shows the first schematic latitude diagram slice', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /latitude: using the sun’s altitude/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /latitude diagram/i })).toBeInTheDocument();
  });

  it('shows the first schematic longitude diagram slice', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /longitude: using the utc time of solar noon/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /longitude diagram/i })).toBeInTheDocument();
  });

  it('recalculates the result and diagrams from edited observation inputs', async () => {
    const user = userEvent.setup();
    render(<App />);

    const altitudeInput = screen.getByRole('spinbutton', { name: /solar altitude at noon/i });
    await user.clear(altitudeInput);
    await user.type(altitudeInput, '50');
    await user.click(screen.getByRole('button', { name: /calculate location/i }));

    expect(screen.getByText(/39\.65° S, 145\.22° E/i)).toBeInTheDocument();
    expect(screen.getAllByText(/40\.0°/i).length).toBeGreaterThan(0);
  });

  it('shows UTC date, UTC time, and Sun direction controls', () => {
    render(<App />);

    expect(screen.getByLabelText(/date of solar noon \(utc\)/i)).toHaveValue('2026-09-22');
    expect(screen.getByLabelText(/time of solar noon \(utc\)/i)).toHaveValue('02:12');
    expect(screen.getByRole('radio', { name: /due north/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /due south/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /directly overhead/i })).toBeInTheDocument();
  });

  it('recalculates the latitude branch when Sun direction changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /due south/i }));
    await user.click(screen.getByRole('button', { name: /calculate location/i }));

    expect(screen.getByText(/38\.15° N, 145\.22° E/i)).toBeInTheDocument();
  });

  it('shows an altitude validation error and preserves the previous result', async () => {
    const user = userEvent.setup();
    render(<App />);

    const altitudeInput = screen.getByRole('spinbutton', { name: /solar altitude at noon/i });
    await user.clear(altitudeInput);
    await user.type(altitudeInput, '95');
    await user.click(screen.getByRole('button', { name: /calculate location/i }));

    expect(screen.getByText(/solar altitude must be between 0° and 90°/i)).toBeInTheDocument();
    expect(screen.getByText(/37\.45° S, 145\.22° E/i)).toBeInTheDocument();
  });

  it('shows geometry warnings returned by the calculation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /directly overhead/i }));
    await user.click(screen.getByRole('button', { name: /calculate location/i }));

    expect(screen.getByText(/not close enough to 90° for an overhead transit/i)).toBeInTheDocument();
  });
});
