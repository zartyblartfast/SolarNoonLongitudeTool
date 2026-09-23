import {
  buildObservationQuery,
  parseObservationQuery
} from './urlState';
import type { SolarNoonObservation } from '../domain/observation';

const fallback: SolarNoonObservation = {
  timestampUtc: '2026-09-22T02:12:00Z',
  solarAltitudeDeg: 52.2,
  meridianDirection: 'north'
};

describe('urlState', () => {
  it('parses date, time, altitude, and direction from a query string', () => {
    const observation = parseObservationQuery('?date=2027-01-02&time=03:04&alt=48.5&dir=south', fallback);

    expect(observation).toEqual({
      timestampUtc: '2027-01-02T03:04:00Z',
      solarAltitudeDeg: 48.5,
      meridianDirection: 'south'
    });
  });

  it('falls back for invalid query values', () => {
    const observation = parseObservationQuery('?date=nope&time=25:99&alt=bad&dir=east', fallback);

    expect(observation).toEqual(fallback);
  });

  it('builds a stable share query from an observation', () => {
    expect(buildObservationQuery({
      timestampUtc: '2027-01-02T03:04:00Z',
      solarAltitudeDeg: 48.5,
      meridianDirection: 'south'
    })).toBe('?date=2027-01-02&time=03%3A04&alt=48.5&dir=south');
  });
});
