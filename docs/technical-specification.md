# Technical Specification

## 1. Architecture summary

Solar Noon Location Explorer should be a static, client-side web application. Calculation, diagram rendering, validation, and URL-state serialization occur in the browser. A backend is not required for the MVP.

Recommended stack:

- React
- TypeScript with strict checking
- Vite
- Astronomy Engine through an internal ephemeris adapter
- Inline SVG React components
- Vitest
- Playwright
- Optional map adapter loaded separately from the calculation path

Versions should be selected and pinned when implementation begins rather than embedded in this specification.

## 2. Design principles

1. **Calculation before presentation:** Domain calculations must not depend on React, SVG, mapping, or formatting code.
2. **Auditable results:** Every output value must retain its source and formula trace.
3. **One sign convention:** North/east are positive throughout the domain layer.
4. **No hidden corrections:** Observation corrections are explicit inputs or explicit processing stages.
5. **Deterministic diagrams:** SVG geometry is calculated from state, not generated as an image.
6. **Progressive explanation:** The simple result appears first; technical detail remains available.
7. **Replaceable ephemeris:** Third-party astronomical code sits behind a small adapter.
8. **Offline core:** Calculation and diagrams work without network access after the application loads.

## 3. Proposed source structure

```text
src/
  app/
    App.tsx
  components/
    ObservationForm/
    ResultSummary/
    CalculationTrace/
    Glossary/
    MapPanel/
  diagrams/
    LatitudeDiagram.tsx
    LongitudeDiagram.tsx
    diagramGeometry.ts
    diagramTheme.ts
  domain/
    observation.ts
    solarNoonLocation.ts
    validation.ts
    uncertainty.ts
    coordinateFormatting.ts
  ephemeris/
    EphemerisProvider.ts
    AstronomyEngineProvider.ts
  state/
    observationState.ts
    urlState.ts
  content/
    glossary.ts
    explanations.ts
  styles/
  tests/
    fixtures/
    unit/
    e2e/
docs/
  product-specification.md
  calculation-model.md
  technical-specification.md
  ui-design-specification.md
```

The MVP is a single continuous page. Do not add a routing layer unless a later product decision introduces genuine separate routes; anchor links within the page are sufficient for the documented calculator journey.

## 4. Domain contracts

### 4.1 Observation

```ts
export type MeridianDirection = 'north' | 'south' | 'overhead';

export interface SolarNoonObservation {
  timestampUtc: string;
  solarAltitudeDeg: number;
  meridianDirection: MeridianDirection;
  altitudeUncertaintyDeg?: number;
  timeUncertaintySeconds?: number;
}
```

### 4.2 Ephemeris adapter

```ts
export interface SolarEphemerisAtTime {
  declinationDeg: number;
  subsolarLongitudeDeg: number;
  equationOfTimeMinutes: number;
  nominalAngularAccuracyDeg: number;
  source: string;
}

export interface EphemerisProvider {
  at(timestampUtc: string): SolarEphemerisAtTime;
}
```

The initial provider should use Astronomy Engine to obtain an apparent, equator-of-date Sun position and Greenwich apparent sidereal time, then derive subsolar longitude. Exact library calls must be isolated inside `AstronomyEngineProvider` and covered by reference tests.

### 4.3 Result and calculation trace

```ts
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
  uncertainty?: {
    latitudeDeg: number;
    longitudeDeg: number;
  };
  trace: TraceStep[];
  warnings: ValidationMessage[];
}
```

The trace is structured data, not a preformatted paragraph. This allows the same calculation to appear as accessible HTML, a compact copied summary, and SVG labels.

## 5. Calculation pipeline

```text
parse input
  -> validate syntax and ranges
  -> obtain ephemeris for UTC timestamp
  -> calculate zenith distance
  -> solve signed latitude using direction
  -> take subsolar longitude as primary longitude
  -> independently reconstruct longitude from UTC + equation of time
  -> verify agreement
  -> estimate uncertainty
  -> generate trace and warnings
  -> format for display
```

Calculations must use JavaScript `number` values in degrees and minutes. Convert to radians only at trigonometric boundaries. Centralize conversions to avoid mixed-unit errors.

## 6. Validation model

Validation messages require a stable code, severity, field association, and plain-language explanation:

```ts
export interface ValidationMessage {
  code: string;
  severity: 'info' | 'warning' | 'error';
  field?: keyof SolarNoonObservation;
  message: string;
  resolution?: string;
}
```

Errors prevent a result. Warnings permit a result but qualify it. Informational messages explain assumptions.

Required validation codes include:

- `INVALID_TIMESTAMP`
- `TIMESTAMP_NOT_UTC`
- `ALTITUDE_OUT_OF_RANGE`
- `NEGATIVE_VISIBLE_ALTITUDE`
- `DIRECTION_INCONSISTENT`
- `LATITUDE_OUT_OF_RANGE`
- `NEAR_ZENITH_DIRECTION_UNSTABLE`
- `NOON_BELOW_HORIZON`
- `EPHEMERIS_FAILURE`
- `LONGITUDE_CROSSCHECK_FAILED`
- `INPUT_PRECISION_LOW`

`DIRECTION_INCONSISTENT` is reserved for cases where the selected direction cannot be reconciled with the solved geometry, such as `overhead` selected when `z` is not close to zero, an impossible latitude branch outside `[-90°, +90°]`, or a future workflow that compares against an independent approximate location. The normal `north` and `south` choices select the latitude branch and should not be treated as contradictory merely because no separate known latitude was supplied.

## 7. State and URL design

The canonical application state is the validated observation. Derived values are recalculated rather than stored.

Suggested query parameters:

```text
?date=2026-09-22&time=02:12:00&alt=52.2&dir=north
```

Rules:

- Query state is optional.
- Invalid values are not executed silently.
- Updating inputs may replace browser history; an explicit example or shared link may push history.
- Coordinates are outputs and need not be embedded in the URL.
- No device location or hidden identifier is included.

## 8. SVG implementation

### 8.1 General requirements

Each diagram is an inline component with:

- a fixed coordinate system through `viewBox`;
- responsive CSS sizing;
- deterministic geometry functions;
- stable IDs and named `<g>` layers;
- text retained as SVG `<text>`;
- `<title>` and `<desc>` linked through ARIA;
- a textual HTML equivalent adjacent to the SVG; and
- no dependence on external raster assets.

Suggested group names:

```text
geometry
sun-rays
construction-lines
angle-arcs
markers
labels
values
```

### 8.2 Latitude diagram geometry

Use a two-dimensional meridian cross-section, not a perspective globe.

Required invariants:

- observer radius passes through Earth's centre;
- true horizon is exactly tangent at the observer and perpendicular to the radius;
- sunlight rays are parallel;
- subsolar radius is parallel to the sunlight direction;
- latitude arc is measured from the equatorial plane to the observer radius;
- declination arc is measured from the equatorial plane to the subsolar radius;
- zenith-distance arc is between local vertical and Sun direction; and
- altitude arc is between horizon and Sun direction.

Do not label the diagram until geometry tests and a visual review pass.

### 8.3 Longitude diagram geometry

Use a polar view with two radial meridians. The angular separation must be the normalized longitude. Rotation and sunlight arrows must not obscure the angle arc.

The diagram should have two presentation states:

- **Clock explanation:** UTC, Greenwich solar-noon reference, and time difference.
- **Angle explanation:** time difference converted using 15° per hour.

### 8.4 Diagram testing

- Unit-test computed coordinates and angle relationships.
- Assign data attributes to important elements for end-to-end assertions.
- Capture visual-regression snapshots at representative values.
- Include cases that change the Sun from north to south and cross ±180° longitude.
- Test at mobile and desktop viewports.

## 9. Mapping

The calculation must not depend on a map service.

Implement a `MapAdapter` so the first release can choose between:

- a simple “open coordinates in map” link;
- a lightweight Leaflet or MapLibre map; or
- no map when offline.

Any tile provider must be configurable, attributed correctly, and reviewed for production usage limits. Reverse geocoding is optional and must fail gracefully.

## 10. Formatting

Coordinate output formats:

- signed decimal degrees;
- hemisphere decimal degrees; and
- degrees, minutes, and seconds.

Formatting is presentation-only. Do not round values before calculations finish.

Use the Unicode degree symbol in rendered output but plain serializable numbers in application state.

## 11. Accessibility

- Use native date, time, and numeric inputs where they provide a good experience.
- Ensure each input has a visible label and unit.
- Announce calculation results through a restrained `aria-live` region.
- Do not announce every slider movement during exploration.
- Provide keyboard-operable direction controls.
- Keep formulas selectable and readable outside SVG.
- Provide a “show as text” equivalent for both diagrams.
- Respect `prefers-reduced-motion`.
- Meet WCAG 2.2 AA contrast and focus requirements.

## 12. Performance and resilience

- Initial calculation should complete within 50 ms on a typical modern device after code load.
- Diagram updates should avoid layout thrashing.
- The ephemeris package may be code-split if it materially improves first load without delaying the primary interaction.
- A map must load after the result and must not block the calculator.
- The core calculator remains usable if mapping, analytics, or reverse geocoding fails.

## 13. Security and privacy

- No `eval` or dynamic code execution.
- Treat URL parameters as untrusted input.
- Escape copied and rendered text.
- Do not transmit observations unless the user invokes a clearly labelled external-map or sharing action.
- Use a restrictive Content Security Policy where hosting permits.
- Audit dependencies and commit the lockfile.

## 14. Testing strategy

### 14.1 Unit tests

- time parsing and UTC enforcement;
- angle and longitude normalization;
- latitude branch selection;
- equation-of-time reconstruction;
- coordinate formatting;
- uncertainty propagation;
- all validation codes; and
- fixed ephemeris adapter fixtures.

### 14.2 Reference tests

- Compare locked timestamps against NREL SPA or its official calculator.
- Compare selected results against a second independent ephemeris.
- Record source, timestamp, inputs, expected values, and tolerance in each fixture.
- Never update reference values merely to make a failing test pass.

### 14.3 Property tests

- forward altitude reconstruction;
- direction consistency;
- normalized coordinate ranges;
- equivalence of subsolar-longitude and equation-of-time methods; and
- round-trip decimal/DMS formatting within tolerance.

### 14.4 Browser tests

- complete guided calculation;
- load example;
- invalid-input recovery;
- shareable URL;
- keyboard-only use;
- responsive layouts;
- reduced motion; and
- SVG visual regression.

## 15. Build and deployment

The app should compile to static assets suitable for GitHub Pages or another static host.

Required CI stages:

```text
install with locked dependencies
type-check
lint
unit and reference tests
production build
browser tests
accessibility checks
```

Deployment must publish only after all required checks pass. The build should expose a version or commit identifier in an unobtrusive “About” section to make numerical results reproducible.

## 16. Implementation sequence

1. Establish repository, linting, tests, and CI.
2. Implement domain types and normalization utilities.
3. Implement and validate the ephemeris adapter.
4. Implement the calculation pipeline and reference fixtures.
5. Build the unlabelled latitude SVG and verify geometry.
6. Add latitude labels and textual explanation.
7. Build and verify the longitude SVG.
8. Implement the guided input and result flow.
9. Add uncertainty, glossary, URL state, and map adapter.
10. Complete visual, accessibility, and cross-browser testing.

## 17. Decisions to confirm before coding

- Final product name and repository name
- Whether this is standalone or a module within SunpathLab
- Mapping approach and tile provider
- Initial supported date range
- Whether the MVP accepts only corrected centre altitude
- Licence for the project
- Hosting target
