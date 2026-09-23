import { AstronomyEngineProvider } from './AstronomyEngineProvider';

describe('AstronomyEngineProvider', () => {
  it('returns solar ephemeris values close to the locked Kinglake reference timestamp', () => {
    const provider = new AstronomyEngineProvider();

    const ephemeris = provider.at('2026-09-22T02:12:00Z');

    expect(ephemeris.declinationDeg).toBeCloseTo(0.3557, 1);
    expect(ephemeris.subsolarLongitudeDeg).toBeCloseTo(145.215, 0);
    expect(ephemeris.equationOfTimeMinutes).toBeCloseTo(7.14, 0);
    expect(ephemeris.source).toMatch(/astronomy engine/i);
    expect(ephemeris.nominalAngularAccuracyDeg).toBeGreaterThan(0);
  });
});
