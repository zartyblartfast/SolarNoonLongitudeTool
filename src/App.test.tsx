import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';

describe('App progress page', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

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
    expect(screen.getByRole('img', { name: /earth context globe/i })).toBeInTheDocument();
    expect(screen.getByTestId('earth-context-observer')).toBeInTheDocument();
    expect(screen.getByTestId('earth-context-subsolar')).toBeInTheDocument();
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

  it('marks the current result stale after editing and clears the notice after recalculation', async () => {
    const user = userEvent.setup();
    render(<App />);

    const altitudeInput = screen.getByRole('spinbutton', { name: /solar altitude at noon/i });
    await user.clear(altitudeInput);
    await user.type(altitudeInput, '50');

    expect(screen.getByText(/inputs changed — recalculate to update the result/i)).toBeInTheDocument();
    expect(screen.getByText(/37\.45° S, 145\.22° E/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /calculate location/i }));

    expect(screen.queryByText(/inputs changed — recalculate to update the result/i)).not.toBeInTheDocument();
    expect(screen.getByText(/39\.65° S, 145\.22° E/i)).toBeInTheDocument();
  });

  it('shows the five-step calculation trace from the domain result', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /how this answer was found/i })).toBeInTheDocument();
    expect(screen.getByText(/find the sun’s declination/i)).toBeInTheDocument();
    expect(screen.getByText(/convert altitude to zenith distance/i)).toBeInTheDocument();
    expect(screen.getByText(/calculate latitude/i)).toBeInTheDocument();
    expect(screen.getByText(/find the equation of time/i)).toBeInTheDocument();
    expect(screen.getByText(/convert solar-noon time to longitude/i)).toBeInTheDocument();
    expect(screen.getAllByText(/z = 90° - h/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/λ = \(720 - U - E\) \/ 4/i)).toBeInTheDocument();
  });

  it('switches the coordinate display between decimal and DMS formats', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/37\.45° S, 145\.22° E/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /degrees minutes seconds/i }));

    expect(screen.getByText(/37° 26′ 42″ S, 145° 13′ 07″ E/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /decimal degrees/i }));

    expect(screen.getByText(/37\.45° S, 145\.22° E/i)).toBeInTheDocument();
  });

  it('initializes the form and result from supported URL query parameters', () => {
    window.history.pushState({}, '', '?date=2027-01-02&time=03:04&alt=50&dir=south');

    render(<App />);

    expect(screen.getByLabelText(/date of solar noon \(utc\)/i)).toHaveValue('2027-01-02');
    expect(screen.getByLabelText(/time of solar noon \(utc\)/i)).toHaveValue('03:04');
    expect(screen.getByRole('spinbutton', { name: /solar altitude at noon/i })).toHaveValue(50);
    expect(screen.getByRole('radio', { name: /due south/i })).toBeChecked();
    expect(screen.getByText(/17\.06° N, 134\.94° E/i)).toBeInTheDocument();
  });

  it('copies the share link after recalculation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    });
    window.history.pushState({}, '', '/');
    render(<App />);

    const altitudeInput = screen.getByRole('spinbutton', { name: /solar altitude at noon/i });
    await user.clear(altitudeInput);
    await user.type(altitudeInput, '50');
    await user.click(screen.getByRole('button', { name: /calculate location/i }));
    await user.click(screen.getByRole('button', { name: /copy share link/i }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('?date=2026-09-22&time=02%3A12&alt=50&dir=north')
    );
    expect(screen.getByText(/share link copied/i)).toBeInTheDocument();
  });
});
