import { generateSolarNoonObservationFromLocation } from './locationObservation';
import { calculateSolarNoonLocation } from './solarNoonLocation';
import { AstronomyEngineProvider } from '../ephemeris/AstronomyEngineProvider';

const ephemerisProvider = new AstronomyEngineProvider();

describe('generateSolarNoonObservationFromLocation', () => {
  it('generates the Kinglake worked observation from latitude, longitude, and date', () => {
    const observation = generateSolarNoonObservationFromLocation({
      dateUtc: '2026-09-22',
      latitudeDeg: -37.4451,
      longitudeDeg: 145.2185,
      ephemerisProvider
    });

    expect(observation.timestampUtc).toBe('2026-09-22T02:12:00Z');
    expect(observation.solarAltitudeDeg).toBeCloseTo(52.2, 1);
    expect(observation.meridianDirection).toBe('north');
  });

  it('round trips a generated observation through the existing location calculator', () => {
    const observation = generateSolarNoonObservationFromLocation({
      dateUtc: '2026-09-22',
      latitudeDeg: 51.5,
      longitudeDeg: -0.12,
      ephemerisProvider
    });
    const ephemeris = ephemerisProvider.at(observation.timestampUtc);
    const result = calculateSolarNoonLocation(observation, ephemeris);

    expect(observation.meridianDirection).toBe('south');
    expect(result.latitudeDeg).toBeCloseTo(51.5, 2);
    expect(result.longitudeDeg).toBeCloseTo(-0.12, 2);
  });
});
