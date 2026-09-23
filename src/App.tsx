import './App.css';
import { calculateSolarNoonLocation } from './domain/solarNoonLocation';
import type { SolarEphemerisAtTime, SolarNoonObservation } from './domain/observation';
import { LatitudeDiagram } from './diagrams/LatitudeDiagram';

const phases = [
  {
    id: 'Phase 1',
    title: 'Foundation and progress preview',
    status: 'Completed',
    detail: 'Create the React/Vite app shell and keep a visible progress page available on a local server.'
  },
  {
    id: 'Phase 2',
    title: 'Solar-noon calculation engine',
    status: 'Completed',
    detail: 'Implement the pure domain model, validation, trace output, and the Kinglake reference case.'
  },
  {
    id: 'Phase 3',
    title: 'Schematic latitude and longitude diagrams',
    status: 'In progress',
    detail: 'Build the main educational SVGs for altitude-to-latitude and time-to-longitude reasoning.'
  },
  {
    id: 'Phase 4',
    title: 'Earth-like context globe',
    status: 'Planned',
    detail: 'Add a lightweight Earth-like SVG globe showing the observer estimate and subsolar point.'
  },
  {
    id: 'Phase 5',
    title: 'Guided UI and verification',
    status: 'Planned',
    detail: 'Connect the form, results, diagrams, accessibility checks, browser tests, and responsive review.'
  }
];

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
  source: 'locked reference fixture'
};

const kinglakeResult = calculateSolarNoonLocation(kinglakeObservation, kinglakeEphemeris);

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Educational tool · specification-to-build progress</p>
        <h1 id="page-title">Solar Noon Location Explorer</h1>
        <p className="lede">
          This app explores the inverse solar-noon problem: given the UTC time of local solar noon,
          the Sun&apos;s corrected altitude, and whether the Sun was due north or due south, estimate
          the observer&apos;s latitude and longitude while showing why the calculation works.
        </p>
      </section>

      <section className="panel" aria-labelledby="current-goal-title">
        <h2 id="current-goal-title">Current build goal</h2>
        <p>
          Build a clear single-page educational calculator first, then add diagrams that respond to the
          same inputs. The diagrams should provide feedback to the user as values change rather than act
          as decorative illustrations.
        </p>
      </section>

      <section className="panel" aria-labelledby="earth-context-title">
        <div className="split">
          <div>
            <h2 id="earth-context-title">Orthographic Earth context</h2>
            <p>
              The Earth-like globe will be a supporting context diagram. It will show the estimated
              observer location, the subsolar point, and simple latitude/longitude references.
            </p>
            <p>
              It will not replace the latitude and longitude schematic diagrams, because those remain the
              clearest way to explain the terms, symbols, and calculation steps.
            </p>
          </div>
          <div className="globe-placeholder" role="img" aria-label="Placeholder for a future orthographic Earth context globe">
            <svg viewBox="0 0 220 220" aria-hidden="true">
              <circle className="globe-water" cx="110" cy="110" r="92" />
              <ellipse className="globe-graticule" cx="110" cy="110" rx="92" ry="36" />
              <path className="globe-graticule" d="M110 18 C76 48 76 172 110 202 C144 172 144 48 110 18" />
              <path className="globe-graticule" d="M18 110 H202" />
              <circle className="observer-dot" cx="151" cy="151" r="5" />
              <circle className="sun-dot" cx="112" cy="109" r="5" />
            </svg>
            <p>Placeholder: observer and subsolar points will be projected from the calculation.</p>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="kinglake-title">
        <h2 id="kinglake-title">Kinglake reference calculation</h2>
        <p>
          The first domain slice reproduces the locked 22 September 2026 worked example using injected
          ephemeris values. This proves the latitude branch, zenith-distance calculation, longitude
          equation, and trace structure before the production ephemeris adapter is added.
        </p>
        <div className="reference-result" aria-label="Kinglake worked example result">
          <strong>{formatCoordinatePair(kinglakeResult.latitudeDeg, kinglakeResult.longitudeDeg)}</strong>
          <span>Zenith distance: {formatDegrees(kinglakeResult.zenithDistanceDeg)}</span>
          <span>Solar declination: {formatSignedDegrees(kinglakeResult.declinationDeg)}</span>
          <span>Equation of time: {kinglakeResult.equationOfTimeMinutes.toFixed(2)} minutes</span>
        </div>
      </section>

      <section className="panel" aria-labelledby="latitude-diagram-section-title">
        <div className="split lesson-split">
          <div>
            <h2 id="latitude-diagram-section-title">Latitude: using the Sun’s altitude</h2>
            <p>
              This first schematic SVG connects the calculated numbers to the meridian-section geometry.
              It shows Earth, the observer, true horizon, local vertical, parallel sunlight, the subsolar
              point, and the key relationship between altitude and zenith distance.
            </p>
          </div>
          <LatitudeDiagram
            latitudeDeg={kinglakeResult.latitudeDeg}
            declinationDeg={kinglakeResult.declinationDeg}
            solarAltitudeDeg={kinglakeObservation.solarAltitudeDeg}
            zenithDistanceDeg={kinglakeResult.zenithDistanceDeg}
          />
        </div>
      </section>

      <section className="panel" aria-labelledby="progress-title">
        <h2 id="progress-title">Implementation progress</h2>
        <ol className="phase-list">
          {phases.map((phase) => (
            <li key={phase.id}>
              <div className="phase-header">
                <span className="phase-id">{phase.id}</span>
                <span className="phase-status">{phase.status}</span>
              </div>
              <h3>{phase.title}</h3>
              <p>{phase.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function formatCoordinatePair(latitudeDeg: number, longitudeDeg: number): string {
  return `${formatHemisphere(latitudeDeg, 'N', 'S')}, ${formatHemisphere(longitudeDeg, 'E', 'W')}`;
}

function formatHemisphere(valueDeg: number, positiveHemisphere: string, negativeHemisphere: string): string {
  const hemisphere = valueDeg >= 0 ? positiveHemisphere : negativeHemisphere;
  return `${Math.abs(valueDeg).toFixed(2)}° ${hemisphere}`;
}

function formatDegrees(valueDeg: number): string {
  return `${valueDeg.toFixed(1)}°`;
}

function formatSignedDegrees(valueDeg: number): string {
  return `${valueDeg >= 0 ? '+' : '−'}${Math.abs(valueDeg).toFixed(4)}°`;
}
