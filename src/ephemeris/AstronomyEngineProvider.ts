import {
  Body,
  Equator,
  Observer,
  SiderealTime
} from 'astronomy-engine';
import type { SolarEphemerisAtTime } from '../domain/observation';
import type { EphemerisProvider } from './EphemerisProvider';

export class AstronomyEngineProvider implements EphemerisProvider {
  at(timestampUtc: string): SolarEphemerisAtTime {
    const date = new Date(timestampUtc);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid UTC timestamp: ${timestampUtc}`);
    }

    const geocentricObserver = new Observer(0, 0, 0);
    const sunEquatorOfDate = Equator(Body.Sun, date, geocentricObserver, true, true);
    const greenwichApparentSiderealHours = SiderealTime(date);
    const subsolarLongitudeDeg = normalizeLongitudeDeg(
      (sunEquatorOfDate.ra - greenwichApparentSiderealHours) * 15
    );
    const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000;
    const equationOfTimeMinutes = normalizeEquationOfTimeMinutes(
      720 - utcMinutes - 4 * subsolarLongitudeDeg
    );

    return {
      declinationDeg: sunEquatorOfDate.dec,
      subsolarLongitudeDeg,
      equationOfTimeMinutes,
      nominalAngularAccuracyDeg: 1 / 60,
      source: 'Astronomy Engine 2.1.19'
    };
  }
}

function normalizeLongitudeDeg(longitudeDeg: number): number {
  let normalized = longitudeDeg;
  while (normalized >= 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function normalizeEquationOfTimeMinutes(minutes: number): number {
  let normalized = minutes;
  while (normalized >= 720) normalized -= 1440;
  while (normalized < -720) normalized += 1440;
  return normalized;
}
