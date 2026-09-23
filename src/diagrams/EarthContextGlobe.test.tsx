import { render, screen } from '@testing-library/react';
import { EarthContextGlobe } from './EarthContextGlobe';

describe('EarthContextGlobe', () => {
  it('renders an accessible orthographic context globe with observer and subsolar markers', () => {
    render(
      <EarthContextGlobe
        observerLatitudeDeg={-37.4451}
        observerLongitudeDeg={145.2185}
        subsolarLatitudeDeg={0.3549}
        subsolarLongitudeDeg={145.2185}
      />
    );

    expect(screen.getByRole('img', { name: /earth context globe/i })).toBeInTheDocument();
    expect(screen.getByTestId('earth-context-outline')).toBeInTheDocument();
    expect(screen.getByTestId('earth-context-graticule')).toBeInTheDocument();
    expect(screen.getByTestId('earth-context-observer')).toBeInTheDocument();
    expect(screen.getByTestId('earth-context-subsolar')).toBeInTheDocument();
    expect(screen.getByText(/observer estimate/i)).toBeInTheDocument();
    expect(screen.getAllByText(/subsolar point/i).length).toBeGreaterThan(0);
  });
});
