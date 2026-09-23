export type MeridianDirection = 'north' | 'south' | 'overhead';

export interface SolarNoonObservation {
  timestampUtc: string;
  solarAltitudeDeg: number;
  meridianDirection: MeridianDirection;
  altitudeUncertaintyDeg?: number;
  timeUncertaintySeconds?: number;
}

export interface SolarEphemerisAtTime {
  declinationDeg: number;
  subsolarLongitudeDeg: number;
  equationOfTimeMinutes: number;
  nominalAngularAccuracyDeg: number;
  source: string;
}

export type ValidationSeverity = 'info' | 'warning' | 'error';

export interface ValidationMessage {
  code: string;
  severity: ValidationSeverity;
  field?: keyof SolarNoonObservation;
  message: string;
  resolution?: string;
}

export interface TraceStep {
  id: string;
  label: string;
  expression: string;
  substitution: string;
  result: string;
  glossaryTerms: string[];
}

export interface SolarNoonLocationResult {
  latitudeDeg: number;
  longitudeDeg: number;
  zenithDistanceDeg: number;
  declinationDeg: number;
  equationOfTimeMinutes: number;
  subsolarLongitudeDeg: number;
  longitudeFromEquationOfTimeDeg: number;
  utcMinutesAfterMidnight: number;
  trace: TraceStep[];
  warnings: ValidationMessage[];
}
