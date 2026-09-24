import type { SolarNoonObservation } from './observation';
import { normalizeLongitudeDeg } from './solarNoonLocation';
import type { EphemerisProvider } from '../ephemeris/EphemerisProvider';

const SOLAR_NOON_ITERATIONS = 5;
const OVERHEAD_DIRECTION_TOLERANCE_DEG = 0.25;

export interface KnownLocationObservationInput {
  dateUtc: string;
  latitudeDeg: number;
  longitudeDeg: number;
  ephemerisProvider: EphemerisProvider;
}

export function generateSolarNoonObservationFromLocation({
  dateUtc,
  latitudeDeg,
  longitudeDeg,
  ephemerisProvider
}: KnownLocationObservationInput): SolarNoonObservation {
  validateDate(dateUtc);
  validateCoordinate('latitude', latitudeDeg, -90, 90);
  validateCoordinate('longitude', longitudeDeg, -180, 180);

  const normalizedLongitudeDeg = normalizeLongitudeDeg(longitudeDeg);
  let utcMinutes = normalizeMinutes(720 - 4 * normalizedLongitudeDeg);

  for (let index = 0; index < SOLAR_NOON_ITERATIONS; index += 1) {
    const ephemeris = ephemerisProvider.at(timestampFromDateAndMinutes(dateUtc, utcMinutes));
    utcMinutes = normalizeMinutes(720 - 4 * normalizedLongitudeDeg - ephemeris.equationOfTimeMinutes);
  }

  const timestampUtc = timestampFromDateAndMinutes(dateUtc, utcMinutes);
  const ephemeris = ephemerisProvider.at(timestampUtc);
  const zenithDistanceDeg = Math.abs(latitudeDeg - ephemeris.declinationDeg);
  const solarAltitudeDeg = 90 - zenithDistanceDeg;

  return {
    timestampUtc,
    solarAltitudeDeg: roundToDecimal(solarAltitudeDeg, 1),
    meridianDirection: determineMeridianDirection(latitudeDeg, ephemeris.declinationDeg)
  };
}

function determineMeridianDirection(latitudeDeg: number, declinationDeg: number): SolarNoonObservation['meridianDirection'] {
  const delta = latitudeDeg - declinationDeg;
  if (Math.abs(delta) <= OVERHEAD_DIRECTION_TOLERANCE_DEG) return 'overhead';
  return delta > 0 ? 'south' : 'north';
}

function timestampFromDateAndMinutes(dateUtc: string, minutesAfterMidnight: number): string {
  const wholeSeconds = Math.round(normalizeMinutes(minutesAfterMidnight) * 60);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;
  return `${dateUtc}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}Z`;
}

function normalizeMinutes(minutes: number): number {
  let normalized = minutes;
  while (normalized >= 1440) normalized -= 1440;
  while (normalized < 0) normalized += 1440;
  return normalized;
}

function validateDate(dateUtc: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateUtc) || Number.isNaN(new Date(`${dateUtc}T00:00:00Z`).getTime())) {
    throw new Error(`Invalid UTC date: ${dateUtc}`);
  }
}

function validateCoordinate(label: string, value: number, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function roundToDecimal(value: number, decimals: number): number {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}
