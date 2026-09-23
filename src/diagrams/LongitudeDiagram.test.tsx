import { render, screen } from '@testing-library/react';
import { LongitudeDiagram } from './LongitudeDiagram';

describe('LongitudeDiagram', () => {
  it('renders an accessible SVG with stable longitude layers and time explanation', () => {
    render(
      <LongitudeDiagram
        longitudeDeg={145.215}
        utcMinutesAfterMidnight={132}
        equationOfTimeMinutes={7.14}
      />
    );

    expect(screen.getByRole('img', { name: /longitude diagram/i })).toBeInTheDocument();
    expect(screen.getByTestId('longitude-earth')).toBeInTheDocument();
    expect(screen.getByTestId('prime-meridian')).toBeInTheDocument();
    expect(screen.getByTestId('observer-meridian')).toBeInTheDocument();
    expect(screen.getByTestId('longitude-arc')).toBeInTheDocument();
    expect(screen.getAllByText(/145\.22° E/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/before Greenwich solar noon/i)).toBeInTheDocument();
  });
});
