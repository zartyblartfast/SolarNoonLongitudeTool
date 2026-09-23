# Orthographic Earth Context Implementation Plan

> **For Hermes:** Implement this plan in small verified slices. Use tests before custom production code and keep a local preview server running once the app shell exists.

**Goal:** Build Solar Noon Location Explorer as an educational, single-page React app whose calculation, explanatory SVG diagrams, and optional orthographic Earth context globe update from the same solar-noon observation.

**Architecture:** Keep the domain calculation layer independent from React and diagrams. Build the interface as one continuous page. Use schematic SVGs for the core latitude and longitude lessons, with a lightweight orthographic SVG globe as supporting context rather than a full map widget.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright later, `d3-geo` for projection math, optional `topojson-client`/`world-atlas` later for simplified land shapes.

---

## Phase 1: App foundation and visible progress page

### Task 1: Create the project shell

**Objective:** Establish a testable React/Vite/TypeScript application without implementing the solar calculation yet.

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`

**Acceptance:**
- `npm test -- --run` passes.
- `npm run build` passes.
- `npm run dev -- --host 127.0.0.1` serves a page showing the project purpose and current implementation phases.

### Task 2: Add a progress-first app page

**Objective:** Show a live, non-final page that makes progress visible while implementation continues.

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Acceptance:**
- The page identifies the app as an educational solar-noon location explorer.
- The page lists the planned implementation phases.
- The page contains a placeholder area for the future orthographic Earth context globe.
- The page states that the globe will support, not replace, the schematic diagrams.

---

## Phase 2: Domain model and reference calculation

### Task 3: Define observation and result types

**Objective:** Create stable domain contracts matching the specs.

**Files:**
- Create: `src/domain/observation.ts`
- Create: `src/domain/solarNoonLocation.ts`
- Create: `src/domain/solarNoonLocation.test.ts`

**Acceptance:**
- Types include timestamp, corrected centre altitude, meridian direction, optional uncertainty.
- Result includes latitude, longitude, zenith distance, declination, equation of time, subsolar longitude, trace, and warnings.

### Task 4: Implement pure calculation with fixture ephemeris

**Objective:** Reproduce the Kinglake example using injected ephemeris values before adding Astronomy Engine.

**Files:**
- Modify: `src/domain/solarNoonLocation.ts`
- Modify: `src/domain/solarNoonLocation.test.ts`

**Acceptance:**
- Kinglake example returns approximately `37.44° S, 145.22° E`.
- Latitude branch tests cover north, south, and overhead.
- Longitude normalization tests cover ±180° wrapping.

---

## Phase 3: Schematic educational diagrams

### Task 5: Build latitude diagram geometry helpers

**Objective:** Test the mathematical relationships behind the meridian-section SVG before rendering labels.

**Files:**
- Create: `src/diagrams/latitudeGeometry.ts`
- Create: `src/diagrams/latitudeGeometry.test.ts`

**Acceptance:**
- Geometry preserves `z = |φ - δ|` and `h = 90° - z`.
- Horizon is perpendicular to the observer radius in diagram coordinates.

### Task 6: Render the latitude SVG

**Objective:** Display the altitude/zenith/declination/latitude lesson as an accessible inline SVG.

**Files:**
- Create: `src/diagrams/LatitudeDiagram.tsx`
- Create: `src/diagrams/LatitudeDiagram.test.tsx`

**Acceptance:**
- SVG has `<title>` and `<desc>`.
- Major elements have stable data attributes.
- A text alternative communicates the same result-bearing information.

### Task 7: Build longitude diagram geometry and SVG

**Objective:** Show UTC time, Greenwich reference, equation of time, and longitude conversion.

**Files:**
- Create: `src/diagrams/longitudeGeometry.ts`
- Create: `src/diagrams/LongitudeDiagram.tsx`
- Create: corresponding tests

**Acceptance:**
- Time and angle views are present.
- Date wrapping near midnight is handled in the explanatory text.

---

## Phase 4: Orthographic Earth context globe

### Task 8: Add orthographic projection helpers

**Objective:** Use `d3-geo` projection math to convert observer and subsolar coordinates into SVG coordinates.

**Files:**
- Create: `src/diagrams/orthographicGlobeGeometry.ts`
- Create: `src/diagrams/orthographicGlobeGeometry.test.ts`

**Acceptance:**
- Projection centres can be computed from observer/subsolar coordinates.
- Observer and subsolar points return finite SVG coordinates for the Kinglake example.
- Hidden far-side points are not labelled as visible.

### Task 9: Render a lightweight Earth context globe

**Objective:** Display an SVG globe that supports the lesson without becoming a full map widget.

**Files:**
- Create: `src/diagrams/EarthContextGlobe.tsx`
- Create: `src/diagrams/EarthContextGlobe.test.tsx`

**Acceptance:**
- Shows Earth outline, graticule, observer estimate, subsolar point, and relevant meridian/reference lines.
- Uses accessible title/description and visible labels or legend.
- Does not include pan/zoom/projection switching in the MVP.

### Task 10: Optionally add simplified land shapes

**Objective:** Make the globe more Earth-like only if bundle size and clarity remain acceptable.

**Files:**
- Add package: `world-atlas` and `topojson-client`, or a checked-in simplified GeoJSON asset.
- Modify: `EarthContextGlobe.tsx`

**Acceptance:**
- Land layer is visually subtle.
- Core labels remain readable.
- Calculation and schematic diagrams still work without the land layer.

---

## Phase 5: Guided UI and verification

### Task 11: Build the observation form and result summary

**Objective:** Connect user inputs to the domain model and calculation trace.

**Files:**
- Create: `src/components/ObservationForm/`
- Create: `src/components/ResultSummary/`
- Add tests

**Acceptance:**
- UTC is explicit.
- Altitude and Sun direction are separate inputs.
- Editing after calculation marks the result stale.

### Task 12: Add browser and accessibility checks

**Objective:** Verify the app works as an educational tool across viewports and input modes.

**Files:**
- Create: `tests/e2e/`
- Create: Playwright config

**Acceptance:**
- Kinglake flow passes.
- 320 px, 768 px, 1024 px, and 1440 px screenshots can be reviewed.
- Keyboard navigation and reduced-motion checks pass.

---

## Progress-preview rule

After every phase that changes UI, run the local server and inspect the page. Keep the page honest: show placeholders as placeholders, completed items as completed, and blocked decisions as blocked.
