import './App.css';
import { useState, type FormEvent } from 'react';
import { calculateSolarNoonLocation } from './domain/solarNoonLocation';
import { generateSolarNoonObservationFromLocation } from './domain/locationObservation';
import type { SolarNoonObservation } from './domain/observation';
import { LatitudeDiagram } from './diagrams/LatitudeDiagram';
import { LongitudeDiagram } from './diagrams/LongitudeDiagram';
import { EarthContextGlobe } from './diagrams/EarthContextGlobe';
import { AstronomyEngineProvider } from './ephemeris/AstronomyEngineProvider';
import { buildObservationQuery, parseObservationQuery } from './state/urlState';

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
    status: 'Completed',
    detail: 'Add a lightweight Earth-like SVG globe with continent outlines, the observer estimate, and the subsolar point.'
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

const ephemerisProvider = new AstronomyEngineProvider();

type CoordinateFormat = 'decimal' | 'dms';

export default function App() {
  const [observation, setObservation] = useState<SolarNoonObservation>(() => (
    parseObservationQuery(window.location.search, kinglakeObservation)
  ));
  const [dateInput, setDateInput] = useState(() => observation.timestampUtc.slice(0, 10));
  const [timeInput, setTimeInput] = useState(() => observation.timestampUtc.slice(11, 16));
  const [altitudeInput, setAltitudeInput] = useState(() => String(observation.solarAltitudeDeg));
  const [directionInput, setDirectionInput] = useState<SolarNoonObservation['meridianDirection']>(() => observation.meridianDirection);
  const [coordinateFormat, setCoordinateFormat] = useState<CoordinateFormat>('decimal');
  const [formError, setFormError] = useState<string | null>(null);
  const [knownLocationDateInput, setKnownLocationDateInput] = useState(() => observation.timestampUtc.slice(0, 10));
  const [knownLatitudeInput, setKnownLatitudeInput] = useState('-37.4451');
  const [knownLongitudeInput, setKnownLongitudeInput] = useState('145.2185');
  const [knownLocationError, setKnownLocationError] = useState<string | null>(null);
  const [generatedObservationMessage, setGeneratedObservationMessage] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const ephemeris = ephemerisProvider.at(observation.timestampUtc);
  const result = calculateSolarNoonLocation(observation, ephemeris);
  const submittedDate = observation.timestampUtc.slice(0, 10);
  const submittedTime = observation.timestampUtc.slice(11, 16);
  const isResultStale = dateInput !== submittedDate
    || timeInput !== submittedTime
    || Number(altitudeInput) !== observation.solarAltitudeDeg
    || directionInput !== observation.meridianDirection;
  const shareHref = `${window.location.origin}${window.location.pathname}${buildObservationQuery(observation)}`;

  function handleObservationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAltitude = Number(altitudeInput);
    if (!Number.isFinite(nextAltitude) || nextAltitude < 0 || nextAltitude > 90) {
      setFormError('Solar altitude must be between 0° and 90°.');
      return;
    }

    setFormError(null);
    const nextObservation = {
      ...observation,
      timestampUtc: `${dateInput}T${timeInput}:00Z`,
      solarAltitudeDeg: nextAltitude,
      meridianDirection: directionInput
    };
    setObservation(nextObservation);
    window.history.replaceState({}, '', buildObservationQuery(nextObservation));
    setShareStatus(null);
  }

  async function handleCopyShareLink() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareHref);
      setShareStatus('Share link copied.');
      return;
    }

    setShareStatus('Share link ready to copy from your browser address bar.');
  }

  function handleKnownLocationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const latitudeDeg = Number(knownLatitudeInput);
    const longitudeDeg = Number(knownLongitudeInput);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(knownLocationDateInput)) {
      setKnownLocationError('Choose a valid UTC date for the known location.');
      return;
    }

    if (!Number.isFinite(latitudeDeg) || latitudeDeg < -90 || latitudeDeg > 90) {
      setKnownLocationError('Known latitude must be between −90° and +90°.');
      return;
    }

    if (!Number.isFinite(longitudeDeg) || longitudeDeg < -180 || longitudeDeg > 180) {
      setKnownLocationError('Known longitude must be between −180° and +180°.');
      return;
    }

    const generatedObservation = generateSolarNoonObservationFromLocation({
      dateUtc: knownLocationDateInput,
      latitudeDeg,
      longitudeDeg,
      ephemerisProvider
    });

    setKnownLocationError(null);
    setGeneratedObservationMessage('Generated values are calculated for the known location and date, not measured in the field.');
    applyObservation(generatedObservation);
  }

  function applyObservation(nextObservation: SolarNoonObservation) {
    setObservation(nextObservation);
    setDateInput(nextObservation.timestampUtc.slice(0, 10));
    setTimeInput(nextObservation.timestampUtc.slice(11, 16));
    setAltitudeInput(String(nextObservation.solarAltitudeDeg));
    setDirectionInput(nextObservation.meridianDirection);
    window.history.replaceState({}, '', buildObservationQuery(nextObservation));
    setShareStatus(null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <span className="wordmark">Solar Noon Location Explorer</span>
        <span className="header-note">Educational estimate · browser-only calculation</span>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Altitude gives latitude · time gives longitude</p>
          <h1 id="page-title">Find a location from a solar-noon observation</h1>
          <p className="lede">
            Enter the UTC date and time of local solar noon, the Sun’s corrected altitude, and whether it
            was due north or due south. The app calculates an estimated position and explains each step with
            diagrams that update from the same inputs.
          </p>
        </div>
        <div className="hero-summary" aria-label="Worked example summary">
          <strong>Worked example</strong>
          <span>52.2° altitude → 37.45° S</span>
          <span>02:12 UTC → 145.22° E</span>
        </div>
      </section>

      <section className="calculator-grid" aria-label="Calculator workspace">
        <section className="panel input-panel" aria-labelledby="observation-form-title">
          <h2 id="observation-form-title">Your solar-noon observation</h2>
          <p>
            Start with the worked Kinglake example, then change the inputs and recalculate. UTC is used
            explicitly; the browser’s local time zone is not applied.
          </p>
          <form className="observation-form" noValidate onSubmit={handleObservationSubmit}>
            <label htmlFor="utc-date-input">Date of solar noon (UTC)</label>
            <input
              id="utc-date-input"
              className="plain-input"
              type="date"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
            />

            <label htmlFor="utc-time-input">Time of solar noon (UTC)</label>
            <input
              id="utc-time-input"
              className="plain-input"
              type="time"
              value={timeInput}
              onChange={(event) => setTimeInput(event.target.value)}
            />

            <label htmlFor="solar-altitude-input">Solar altitude at noon</label>
            <div className="input-with-unit">
              <input
                id="solar-altitude-input"
                type="number"
                min="0"
                max="90"
                step="0.1"
                value={altitudeInput}
                onChange={(event) => setAltitudeInput(event.target.value)}
              />
              <span aria-hidden="true">°</span>
            </div>
            <p className="field-helper">Corrected angle of the Sun’s centre above the true horizon.</p>
            {formError ? <p className="form-message form-message-error">{formError}</p> : null}

            <fieldset className="direction-fieldset">
              <legend>At solar noon, the Sun was:</legend>
              <label>
                <input
                  type="radio"
                  name="meridian-direction"
                  value="north"
                  checked={directionInput === 'north'}
                  onChange={() => setDirectionInput('north')}
                />
                Due north
              </label>
              <label>
                <input
                  type="radio"
                  name="meridian-direction"
                  value="south"
                  checked={directionInput === 'south'}
                  onChange={() => setDirectionInput('south')}
                />
                Due south
              </label>
              <label>
                <input
                  type="radio"
                  name="meridian-direction"
                  value="overhead"
                  checked={directionInput === 'overhead'}
                  onChange={() => setDirectionInput('overhead')}
                />
                Directly overhead
              </label>
            </fieldset>
            <button type="submit">Calculate location</button>
          </form>
          <form className="known-location-form" noValidate onSubmit={handleKnownLocationSubmit}>
            <div className="known-location-heading">
              <p className="eyebrow">Reverse example</p>
              <h3>Generate an observation from a known location</h3>
              <p>
                If you know a place and date, generate the UTC solar-noon time, altitude, and north/south
                direction that the observation form would need.
              </p>
            </div>
            <label htmlFor="known-location-date-input">Known-location date (UTC)</label>
            <input
              id="known-location-date-input"
              className="plain-input"
              type="date"
              value={knownLocationDateInput}
              onChange={(event) => setKnownLocationDateInput(event.target.value)}
            />
            <label htmlFor="known-latitude-input">Known latitude</label>
            <input
              id="known-latitude-input"
              className="plain-input"
              type="number"
              min="-90"
              max="90"
              step="0.0001"
              value={knownLatitudeInput}
              onChange={(event) => setKnownLatitudeInput(event.target.value)}
            />
            <label htmlFor="known-longitude-input">Known longitude</label>
            <input
              id="known-longitude-input"
              className="plain-input"
              type="number"
              min="-180"
              max="180"
              step="0.0001"
              value={knownLongitudeInput}
              onChange={(event) => setKnownLongitudeInput(event.target.value)}
            />
            {knownLocationError ? <p className="form-message form-message-error">{knownLocationError}</p> : null}
            <button type="submit">Generate observation</button>
            {generatedObservationMessage ? <p className="generated-observation-message">{generatedObservationMessage}</p> : null}
          </form>
        </section>

        <section className="panel result-panel" aria-labelledby="result-title">
          <p className="eyebrow">Estimated location</p>
          <h2 id="result-title">Current result</h2>
          {isResultStale ? (
            <p className="stale-result-message">Inputs changed — recalculate to update the result.</p>
          ) : null}
          <div className="coordinate-display" aria-label="Current coordinate estimate">
            {formatCoordinatePair(result.latitudeDeg, result.longitudeDeg, coordinateFormat)}
          </div>
          <fieldset className="coordinate-format-fieldset">
            <legend>Coordinate format</legend>
            <label>
              <input
                type="radio"
                name="coordinate-format"
                checked={coordinateFormat === 'decimal'}
                onChange={() => setCoordinateFormat('decimal')}
              />
              Decimal degrees
            </label>
            <label>
              <input
                type="radio"
                name="coordinate-format"
                checked={coordinateFormat === 'dms'}
                onChange={() => setCoordinateFormat('dms')}
              />
              Degrees minutes seconds
            </label>
          </fieldset>
          <button className="share-link" type="button" onClick={handleCopyShareLink}>Copy share link</button>
          {shareStatus ? <p className="share-status" aria-live="polite">{shareStatus}</p> : null}
          <dl className="result-metrics">
            <div>
              <dt>Zenith distance</dt>
              <dd>{formatDegrees(result.zenithDistanceDeg)}</dd>
            </div>
            <div>
              <dt>Solar declination</dt>
              <dd>{formatSignedDegrees(result.declinationDeg)}</dd>
            </div>
            <div>
              <dt>Equation of time</dt>
              <dd>{result.equationOfTimeMinutes.toFixed(2)} min</dd>
            </div>
            <div>
              <dt>Solar data</dt>
              <dd>{ephemeris.source}</dd>
            </div>
          </dl>
          {result.warnings.length > 0 ? (
            <div className="result-warnings" aria-label="Calculation warnings">
              {result.warnings.map((warning) => (
                <p key={warning.code} className={`form-message form-message-${warning.severity}`}>
                  {warning.message}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      </section>

      <section className="panel trace-panel" aria-labelledby="trace-title">
        <div className="trace-heading">
          <p className="eyebrow">Calculation trace</p>
          <h2 id="trace-title">How this answer was found</h2>
          <p>
            Each displayed value comes from the same domain result that drives the coordinate estimate and
            diagrams.
          </p>
        </div>
        <ol className="trace-list">
          {result.trace.map((step) => (
            <li key={step.id}>
              <h3>{step.label}</h3>
              <p className="trace-equation">{step.evaluatedExpression}</p>
              <dl>
                <div>
                  <dt>Formula</dt>
                  <dd>{step.expression}</dd>
                </div>
                <div>
                  <dt>Substitution</dt>
                  <dd>{step.substitution}</dd>
                </div>
                <div>
                  <dt>Result</dt>
                  <dd>{step.result}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </section>

      <section className="lesson-grid" aria-label="Calculation diagrams">
        <article className="panel lesson-card" aria-labelledby="latitude-diagram-section-title">
          <div className="lesson-copy">
            <p className="eyebrow">Latitude diagram</p>
            <h2 id="latitude-diagram-section-title">Latitude: using the Sun’s altitude</h2>
            <p>
              A meridian-section view shows the observer, true horizon, local vertical, parallel sunlight,
              subsolar point, and the altitude-to-zenith-distance relationship.
            </p>
          </div>
          <LatitudeDiagram
            latitudeDeg={result.latitudeDeg}
            declinationDeg={result.declinationDeg}
            solarAltitudeDeg={observation.solarAltitudeDeg}
            zenithDistanceDeg={result.zenithDistanceDeg}
          />
        </article>

        <article className="panel lesson-card" aria-labelledby="longitude-diagram-section-title">
          <div className="lesson-copy">
            <p className="eyebrow">Longitude diagram</p>
            <h2 id="longitude-diagram-section-title">Longitude: using the UTC time of solar noon</h2>
            <p>
              A polar view connects Greenwich, the observer meridian, the longitude angle, sunlight, and
              Earth’s 15°-per-hour rotation.
            </p>
          </div>
          <LongitudeDiagram
            longitudeDeg={result.longitudeDeg}
            utcMinutesAfterMidnight={result.utcMinutesAfterMidnight}
            equationOfTimeMinutes={result.equationOfTimeMinutes}
          />
        </article>
      </section>

      <section className="panel glossary-panel" aria-labelledby="glossary-title">
        <div className="glossary-heading">
          <p className="eyebrow">Reference</p>
          <h2 id="glossary-title">Glossary and assumptions</h2>
          <p>
            These are the core terms and limits behind the calculator. The result is an educational
            estimate, not a certified navigation fix.
          </p>
        </div>
        <div className="glossary-layout">
          <dl className="glossary-list">
            <div>
              <dt>Solar altitude</dt>
              <dd>Angle of the Sun above the true horizon.</dd>
            </div>
            <div>
              <dt>True horizon</dt>
              <dd>Plane perpendicular to the observer’s local vertical.</dd>
            </div>
            <div>
              <dt>Zenith distance</dt>
              <dd>Angle between the Sun and the point directly overhead; z = 90° − altitude.</dd>
            </div>
            <div>
              <dt>Solar declination</dt>
              <dd>The Sun’s angular position north or south of the celestial equator.</dd>
            </div>
            <div>
              <dt>Subsolar point</dt>
              <dd>Point on Earth where the Sun is directly overhead.</dd>
            </div>
            <div>
              <dt>Equation of time</dt>
              <dd>Difference between apparent solar time and uniform mean solar time.</dd>
            </div>
          </dl>
          <div className="assumptions-card">
            <h3>Method assumptions</h3>
            <ul>
              <li>The recorded time is local apparent solar noon.</li>
              <li>The timestamp is UTC.</li>
              <li>The altitude is the corrected altitude of the Sun’s centre above the true horizon.</li>
              <li>The stated north/south direction is correct.</li>
              <li>The result is educational rather than certified for navigation.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="support-grid" aria-label="Supporting information">
        <section className="panel compact-panel" aria-labelledby="earth-context-title">
          <div>
            <p className="eyebrow">Earth context layer</p>
            <h2 id="earth-context-title">Orthographic Earth context</h2>
            <p>
              The Earth-like globe is a supporting context diagram with continent outlines, the estimated
              observer location, and subsolar point, but it does not replace the schematic diagrams.
            </p>
          </div>
          <EarthContextGlobe
            observerLatitudeDeg={result.latitudeDeg}
            observerLongitudeDeg={result.longitudeDeg}
            subsolarLatitudeDeg={result.declinationDeg}
            subsolarLongitudeDeg={result.subsolarLongitudeDeg}
          />
        </section>

        <section className="panel compact-panel" aria-labelledby="progress-title">
          <div>
            <p className="eyebrow">Build status</p>
            <h2 id="progress-title">Implementation progress</h2>
          </div>
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
      </section>
    </main>
  );
}

function formatCoordinatePair(latitudeDeg: number, longitudeDeg: number, format: CoordinateFormat = 'decimal'): string {
  if (format === 'dms') {
    return `${formatDms(latitudeDeg, 'N', 'S')}, ${formatDms(longitudeDeg, 'E', 'W')}`;
  }

  return `${formatDecimalHemisphere(latitudeDeg, 'N', 'S')}, ${formatDecimalHemisphere(longitudeDeg, 'E', 'W')}`;
}

function formatDecimalHemisphere(valueDeg: number, positiveHemisphere: string, negativeHemisphere: string): string {
  const hemisphere = valueDeg >= 0 ? positiveHemisphere : negativeHemisphere;
  return `${Math.abs(valueDeg).toFixed(2)}° ${hemisphere}`;
}

function formatDms(valueDeg: number, positiveHemisphere: string, negativeHemisphere: string): string {
  const hemisphere = valueDeg >= 0 ? positiveHemisphere : negativeHemisphere;
  const absolute = Math.abs(valueDeg);
  let degrees = Math.floor(absolute);
  const minuteFloat = (absolute - degrees) * 60;
  let minutes = Math.floor(minuteFloat);
  let seconds = Math.round((minuteFloat - minutes) * 60);

  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }

  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }

  return `${degrees}° ${String(minutes).padStart(2, '0')}′ ${String(seconds).padStart(2, '0')}″ ${hemisphere}`;
}

function formatDegrees(valueDeg: number): string {
  return `${valueDeg.toFixed(1)}°`;
}

function formatSignedDegrees(valueDeg: number): string {
  return `${valueDeg >= 0 ? '+' : '−'}${Math.abs(valueDeg).toFixed(4)}°`;
}
