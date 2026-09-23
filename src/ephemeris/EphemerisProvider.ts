import type { SolarEphemerisAtTime } from '../domain/observation';

export interface EphemerisProvider {
  at(timestampUtc: string): SolarEphemerisAtTime;
}
