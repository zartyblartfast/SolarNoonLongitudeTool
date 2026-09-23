import type {
  SolarEphemerisAtTime,
  SolarNoonLocationResult,
  SolarNoonObservation,
  TraceStep,
  ValidationMessage
} from './observation';

const OVERHEAD_TOLERANCE_DEG = 0.25;
const LONGITUDE_CROSSCHECK_TOLERANCE_DEG = 0.01;

export function normalizeLongitudeDeg(longitudeDeg: number): number {
  let normalized = longitudeDeg;
  while (normalized >= 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

export function utcMinutesAfterMidnight(timestampUtc: string): number {
  const date = new Date(timestampUtc);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid UTC timestamp: ${timestampUtc}`);
  }

  return date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000;
}

export function calculateSolarNoonLocation(
  observation: SolarNoonObservation,
  ephemeris: SolarEphemerisAtTime
): SolarNoonLocationResult {
  const zenithDistanceDeg = 90 - observation.solarAltitudeDeg;
  const latitudeDeg = calculateLatitudeDeg(
    ephemeris.declinationDeg,
    zenithDistanceDeg,
    observation.meridianDirection
  );
  const utcMinutes = utcMinutesAfterMidnight(observation.timestampUtc);
  const longitudeFromEquationOfTimeDeg = normalizeLongitudeDeg(
    (720 - utcMinutes - ephemeris.equationOfTimeMinutes) / 4
  );
  const longitudeDeg = normalizeLongitudeDeg(ephemeris.subsolarLongitudeDeg);
  const warnings = collectWarnings(
    observation,
    latitudeDeg,
    zenithDistanceDeg,
    longitudeDeg,
    longitudeFromEquationOfTimeDeg
  );

  return {
    latitudeDeg,
    longitudeDeg,
    zenithDistanceDeg,
    declinationDeg: ephemeris.declinationDeg,
    equationOfTimeMinutes: ephemeris.equationOfTimeMinutes,
    subsolarLongitudeDeg: longitudeDeg,
    longitudeFromEquationOfTimeDeg,
    utcMinutesAfterMidnight: utcMinutes,
    trace: buildTrace(observation, ephemeris, zenithDistanceDeg, latitudeDeg, utcMinutes, longitudeFromEquationOfTimeDeg),
    warnings
  };
}

function calculateLatitudeDeg(declinationDeg: number, zenithDistanceDeg: number, direction: SolarNoonObservation['meridianDirection']): number {
  if (direction === 'north') return declinationDeg - zenithDistanceDeg;
  if (direction === 'south') return declinationDeg + zenithDistanceDeg;
  return declinationDeg;
}

function collectWarnings(
  observation: SolarNoonObservation,
  latitudeDeg: number,
  zenithDistanceDeg: number,
  longitudeDeg: number,
  longitudeFromEquationOfTimeDeg: number
): ValidationMessage[] {
  const warnings: ValidationMessage[] = [];

  if (latitudeDeg < -90 || latitudeDeg > 90) {
    warnings.push({
      code: 'LATITUDE_OUT_OF_RANGE',
      severity: 'error',
      field: 'solarAltitudeDeg',
      message: 'These values would place the latitude beyond a pole.',
      resolution: 'Check the altitude and Sun direction.'
    });
  }

  if (observation.meridianDirection === 'overhead' && Math.abs(zenithDistanceDeg) > OVERHEAD_TOLERANCE_DEG) {
    warnings.push({
      code: 'DIRECTION_INCONSISTENT',
      severity: 'warning',
      field: 'meridianDirection',
      message: 'Directly overhead was selected, but the altitude is not close enough to 90° for an overhead transit.',
      resolution: 'Check the altitude or choose whether the Sun was due north or due south.'
    });
  }

  const longitudeDelta = Math.abs(normalizeLongitudeDeg(longitudeDeg - longitudeFromEquationOfTimeDeg));
  if (longitudeDelta > LONGITUDE_CROSSCHECK_TOLERANCE_DEG) {
    warnings.push({
      code: 'LONGITUDE_CROSSCHECK_FAILED',
      severity: 'warning',
      message: 'The ephemeris subsolar longitude and equation-of-time longitude do not agree within tolerance.',
      resolution: 'Check the ephemeris source and equation-of-time convention.'
    });
  }

  return warnings;
}

function buildTrace(
  observation: SolarNoonObservation,
  ephemeris: SolarEphemerisAtTime,
  zenithDistanceDeg: number,
  latitudeDeg: number,
  utcMinutes: number,
  longitudeFromEquationOfTimeDeg: number
): TraceStep[] {
  const latitudeExpression = observation.meridianDirection === 'north'
    ? 'φ = δ - z'
    : observation.meridianDirection === 'south'
      ? 'φ = δ + z'
      : 'φ = δ';

  const latitudeSubstitution = observation.meridianDirection === 'north'
    ? `φ = ${formatSigned(ephemeris.declinationDeg)}° - ${formatNumber(zenithDistanceDeg)}°`
    : observation.meridianDirection === 'south'
      ? `φ = ${formatSigned(ephemeris.declinationDeg)}° + ${formatNumber(zenithDistanceDeg)}°`
      : `φ = ${formatSigned(ephemeris.declinationDeg)}°`;

  const latitudeEvaluatedExpression = observation.meridianDirection === 'north'
    ? `φ = ${formatSigned(ephemeris.declinationDeg)}° - ${formatNumber(zenithDistanceDeg)}° = ${formatSigned(latitudeDeg)}°`
    : observation.meridianDirection === 'south'
      ? `φ = ${formatSigned(ephemeris.declinationDeg)}° + ${formatNumber(zenithDistanceDeg)}° = ${formatSigned(latitudeDeg)}°`
      : `φ = ${formatSigned(ephemeris.declinationDeg)}° = ${formatSigned(latitudeDeg)}°`;

  return [
    {
      id: 'solar-declination',
      label: 'Find the Sun’s declination',
      expression: 'δ from ephemeris',
      substitution: `δ = ${formatSigned(ephemeris.declinationDeg)}°`,
      result: `${formatSigned(ephemeris.declinationDeg)}°`,
      evaluatedExpression: `δ = ${formatSigned(ephemeris.declinationDeg)}°`,
      glossaryTerms: ['solar declination', 'subsolar point']
    },
    {
      id: 'zenith-distance',
      label: 'Convert altitude to zenith distance',
      expression: 'z = 90° - h',
      substitution: `z = 90° - ${formatNumber(observation.solarAltitudeDeg)}°`,
      result: `z = ${formatNumber(zenithDistanceDeg)}°`,
      evaluatedExpression: `z = 90° - ${formatNumber(observation.solarAltitudeDeg)}° = ${formatNumber(zenithDistanceDeg)}°`,
      glossaryTerms: ['solar altitude', 'zenith distance']
    },
    {
      id: 'latitude',
      label: 'Calculate latitude',
      expression: latitudeExpression,
      substitution: latitudeSubstitution,
      result: `φ = ${formatSigned(latitudeDeg)}°`,
      evaluatedExpression: latitudeEvaluatedExpression,
      glossaryTerms: ['latitude', 'meridian']
    },
    {
      id: 'equation-of-time',
      label: 'Find the equation of time',
      expression: 'E from ephemeris',
      substitution: `E = ${formatSigned(ephemeris.equationOfTimeMinutes)} minutes`,
      result: `${formatSigned(ephemeris.equationOfTimeMinutes)} minutes`,
      evaluatedExpression: `E = ${formatSigned(ephemeris.equationOfTimeMinutes)} minutes`,
      glossaryTerms: ['equation of time']
    },
    {
      id: 'longitude',
      label: 'Convert solar-noon time to longitude',
      expression: 'λ = (720 - U - E) / 4',
      substitution: `λ = (720 - ${formatNumber(utcMinutes)} - ${formatNumber(ephemeris.equationOfTimeMinutes)}) / 4`,
      result: `λ = ${formatSigned(longitudeFromEquationOfTimeDeg)}°`,
      evaluatedExpression: `λ = (720 - ${formatNumber(utcMinutes)} - ${formatNumber(ephemeris.equationOfTimeMinutes)}) / 4 = ${formatSigned(longitudeFromEquationOfTimeDeg)}°`,
      glossaryTerms: ['longitude', 'local solar noon']
    }
  ];
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function formatSigned(value: number): string {
  const formatted = formatNumber(Math.abs(value));
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}
