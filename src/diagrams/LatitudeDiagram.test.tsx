import { render, screen } from '@testing-library/react';
import { LatitudeDiagram } from './LatitudeDiagram';

describe('LatitudeDiagram', () => {
  it('renders an accessible SVG with stable educational layers and text alternative', () => {
    render(
      <LatitudeDiagram
        latitudeDeg={-37.4443}
        declinationDeg={0.3557}
        solarAltitudeDeg={52.2}
        zenithDistanceDeg={37.8}
      />
    );

    expect(screen.getByRole('img', { name: /latitude diagram/i })).toBeInTheDocument();
    expect(screen.getByText(/z = 90° - h/i)).toBeInTheDocument();
    expect(screen.getAllByText(/37\.8°/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('latitude-earth')).toBeInTheDocument();
    expect(screen.getByTestId('latitude-horizon')).toBeInTheDocument();
    expect(screen.getByTestId('latitude-sunlight')).toBeInTheDocument();
    expect(screen.getByTestId('latitude-observer')).toBeInTheDocument();
  });

  it('renders labelled angle arcs for the key latitude relationships', () => {
    render(
      <LatitudeDiagram
        latitudeDeg={-37.4443}
        declinationDeg={0.3557}
        solarAltitudeDeg={52.2}
        zenithDistanceDeg={37.8}
      />
    );

    expect(screen.getByTestId('latitude-arc')).toBeInTheDocument();
    expect(screen.getByTestId('declination-arc')).toBeInTheDocument();
    expect(screen.getByTestId('altitude-arc')).toBeInTheDocument();
    expect(screen.getByTestId('zenith-distance-arc')).toBeInTheDocument();
    expect(screen.getByText(/φ latitude/i)).toBeInTheDocument();
    expect(screen.getByText(/δ declination/i)).toBeInTheDocument();
    expect(screen.getByText(/h altitude/i)).toBeInTheDocument();
    expect(screen.getByText(/z zenith distance/i)).toBeInTheDocument();
  });
});
