import { calculateSolarNoonLocation, normalizeLongitudeDeg } from './solarNoonLocation';
import type { SolarEphemerisAtTime, SolarNoonObservation } from './observation';

const kinglakeObservation: SolarNoonObservation = {
  timestampUtc: '2026-09-22T02:12:00Z',
  solarAltitudeDeg: 52.2,
  meridianDirection: 'north'
};

const kinglakeEphemeris: SolarEphemerisAtTime = {
  declinationDeg: 0.3557,
  subsolarLongitudeDeg: 145.215,
  equationOfTimeMinutes: 7.14,
  nominalAngularAccuracyDeg: 0.0167,
  source: 'locked test fixture'
};

describe('calculateSolarNoonLocation', () => {
  it('reproduces the Kinglake reference example from injected ephemeris values', () => {
    const result = calculateSolarNoonLocation(kinglakeObservation, kinglakeEphemeris);

    expect(result.zenithDistanceDeg).toBeCloseTo(37.8, 8);
    expect(result.latitudeDeg).toBeCloseTo(-37.4443, 4);
    expect(result.longitudeDeg).toBeCloseTo(145.215, 4);
    expect(result.subsolarLongitudeDeg).toBeCloseTo(145.215, 4);
    expect(result.equationOfTimeMinutes).toBeCloseTo(7.14, 3);
    expect(result.warnings).toEqual([]);
  });

  it('selects the south latitude branch when the Sun culminates south of the observer', () => {
    const result = calculateSolarNoonLocation(
      {
        timestampUtc: '2026-03-20T12:00:00Z',
        solarAltitudeDeg: 50,
        meridianDirection: 'south'
      },
      {
        declinationDeg: 0,
        subsolarLongitudeDeg: 0,
        equationOfTimeMinutes: 0,
        nominalAngularAccuracyDeg: 0.0167,
        source: 'test fixture'
      }
    );

    expect(result.zenithDistanceDeg).toBe(40);
    expect(result.latitudeDeg).toBe(40);
  });

  it('uses declination as latitude for an overhead transit and warns if zenith distance is not near zero', () => {
    const result = calculateSolarNoonLocation(
      {
        timestampUtc: '2026-03-20T12:00:00Z',
        solarAltitudeDeg: 89,
        meridianDirection: 'overhead'
      },
      {
        declinationDeg: -1.5,
        subsolarLongitudeDeg: 0,
        equationOfTimeMinutes: 0,
        nominalAngularAccuracyDeg: 0.0167,
        source: 'test fixture'
      }
    );

    expect(result.latitudeDeg).toBe(-1.5);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'DIRECTION_INCONSISTENT', severity: 'warning' })
    );
  });

  it('normalizes longitudes to the [-180, 180) range', () => {
    expect(normalizeLongitudeDeg(180)).toBe(-180);
    expect(normalizeLongitudeDeg(181)).toBe(-179);
    expect(normalizeLongitudeDeg(-181)).toBe(179);
    expect(normalizeLongitudeDeg(540)).toBe(-180);
  });
});
