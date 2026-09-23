import { FixedEphemerisProvider } from './FixedEphemerisProvider';
import type { SolarEphemerisAtTime } from '../domain/observation';

const fixture: SolarEphemerisAtTime = {
  declinationDeg: 0.3557,
  subsolarLongitudeDeg: 145.215,
  equationOfTimeMinutes: 7.14,
  nominalAngularAccuracyDeg: 0.0167,
  source: 'locked reference fixture'
};

describe('FixedEphemerisProvider', () => {
  it('returns the configured ephemeris for a UTC timestamp', () => {
    const provider = new FixedEphemerisProvider(fixture);

    expect(provider.at('2026-09-22T02:12:00Z')).toEqual(fixture);
  });

  it('returns a defensive copy so callers cannot mutate the fixture', () => {
    const provider = new FixedEphemerisProvider(fixture);
    const ephemeris = provider.at('2026-09-22T02:12:00Z');

    ephemeris.declinationDeg = 99;

    expect(provider.at('2026-09-22T02:12:00Z').declinationDeg).toBe(0.3557);
  });
});
