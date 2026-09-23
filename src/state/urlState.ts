import type { MeridianDirection, SolarNoonObservation } from '../domain/observation';

export function parseObservationQuery(queryString: string, fallback: SolarNoonObservation): SolarNoonObservation {
  const params = new URLSearchParams(queryString);
  const date = params.get('date');
  const time = params.get('time');
  const altitude = params.get('alt');
  const direction = params.get('dir');

  if (!isValidDate(date) || !isValidTime(time) || !isValidAltitude(altitude) || !isValidDirection(direction)) {
    return fallback;
  }

  return {
    timestampUtc: `${date}T${time}:00Z`,
    solarAltitudeDeg: Number(altitude),
    meridianDirection: direction
  };
}

export function buildObservationQuery(observation: SolarNoonObservation): string {
  const params = new URLSearchParams();
  params.set('date', observation.timestampUtc.slice(0, 10));
  params.set('time', observation.timestampUtc.slice(11, 16));
  params.set('alt', formatAltitude(observation.solarAltitudeDeg));
  params.set('dir', observation.meridianDirection);
  return `?${params.toString()}`;
}

function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value: string | null): value is string {
  return Boolean(value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function isValidAltitude(value: string | null): value is string {
  if (value === null || value.trim() === '') return false;
  const altitude = Number(value);
  return Number.isFinite(altitude) && altitude >= 0 && altitude <= 90;
}

function isValidDirection(value: string | null): value is MeridianDirection {
  return value === 'north' || value === 'south' || value === 'overhead';
}

function formatAltitude(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace(/0+$/, '').replace(/\.$/, '');
}
