import type { SolarEphemerisAtTime } from '../domain/observation';
import type { EphemerisProvider } from './EphemerisProvider';

export class FixedEphemerisProvider implements EphemerisProvider {
  private readonly fixture: SolarEphemerisAtTime;

  constructor(fixture: SolarEphemerisAtTime) {
    this.fixture = { ...fixture };
  }

  at(_timestampUtc: string): SolarEphemerisAtTime {
    return { ...this.fixture };
  }
}
