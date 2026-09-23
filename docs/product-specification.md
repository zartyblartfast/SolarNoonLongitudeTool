# Product Specification

## 1. Product summary

Solar Noon Location Explorer is an educational web application that calculates an observer's approximate latitude and longitude from a local-solar-noon observation. It combines a guided calculator, interactive vector diagrams, plain-language definitions, a map, and an auditable calculation trace.

The app should teach the reasoning rather than behave as a black-box coordinate converter.

## 2. Problem statement

The traditional solar-noon method is conceptually elegant but difficult for a newcomer because several ideas are introduced at once:

- altitude is measured from a local horizon;
- latitude depends on solar declination as well as the measured altitude;
- longitude depends on UTC time and the equation of time;
- the Sun can culminate north or south of the observer; and
- apparently small timing or angle errors can move the result significantly.

Existing solar calculators normally solve the forward problem: known latitude and longitude produce solar times and angles. This product solves and explains the inverse problem.

## 3. Goals

### 3.1 Primary goals

- Calculate latitude and longitude from a valid solar-noon observation.
- Explain every required term before or where it is first used.
- Make the geometry visible through accurate, interactive SVG diagrams.
- Show all intermediate values and sign conventions.
- Distinguish measured quantities from ephemeris-derived quantities.
- Communicate uncertainty and invalid or ambiguous observations honestly.
- Work well on desktop, tablet, and mobile without requiring an account.

### 3.2 Educational outcomes

After completing an example, a learner should be able to explain:

1. why zenith distance is `90° - solar altitude`;
2. why solar declination is needed to find latitude;
3. why the Sun's north/south direction resolves the latitude branch;
4. why UTC time at solar noon contains longitude information;
5. why the equation of time is necessary; and
6. why one minute of timing corresponds to 0.25° of longitude.

### 3.3 Non-goals for the MVP

- Certified marine or aviation navigation
- Automatic camera or image-based Sun measurement
- Device-compass calibration
- Full sextant sight reduction
- Offline gazetteer or worldwide reverse geocoding
- User accounts or cloud-saved observations
- A general-purpose sunrise, sunset, or Sun-path calculator

## 4. Intended audiences

- Learners interested in astronomy, geography, surveying, or navigation
- Teachers demonstrating how latitude and longitude can be observed
- Amateur celestial navigators
- Users comparing geometric Earth models with observations
- Developers wishing to reuse the diagrams or calculation trace

The default language must remain neutral, explanatory, and suitable for a non-specialist audience.

## 5. Required observation data

The basic calculation requires:

1. **UTC timestamp** — the exact UTC date and time of local apparent solar noon.
2. **Solar altitude** — the corrected angular altitude of the Sun's centre above the true horizon.
3. **Meridian direction** — whether the Sun was north, south, or directly overhead at culmination.

The interface must not use a negative altitude as a Southern Hemisphere indicator. Altitude and direction are separate inputs. Latitude is signed only in the result.

## 6. Primary user journey

### Step 1 — Enter the observation

The user enters:

- UTC date;
- UTC time;
- solar altitude in decimal degrees or degrees/minutes/seconds; and
- Sun direction: north, south, or overhead.

An optional example-data button loads the Kinglake demonstration.

### Step 2 — Validate the observation

The app checks ranges, required fields, date validity, and logical consistency. It explains problems next to the relevant input rather than displaying generic errors.

### Step 3 — Calculate and explain latitude

The app displays:

- solar declination;
- subsolar latitude;
- zenith distance;
- selected meridian direction;
- signed latitude result; and
- the substitution into the latitude formula.

The latitude SVG updates to show the same values.

### Step 4 — Calculate and explain longitude

The app displays:

- UTC minutes after midnight;
- equation of time;
- zero-meridian solar-noon reference;
- longitude in degrees; and
- why an earlier solar noon means east and a later solar noon means west.

The longitude SVG updates to show the prime meridian, observer meridian, and longitude angle.

### Step 4a — Place the result on an Earth context globe

The app may display a supporting orthographic Earth-context SVG once a result exists. This globe helps connect the schematic calculation to the real Earth, but it must not replace the latitude and longitude teaching diagrams.

The globe should show:

- the estimated observer location;
- the subsolar point at the observation timestamp;
- a graticule or equivalent latitude/longitude reference;
- the observer meridian or longitude reference where useful; and
- labels or a legend that connect the globe markers to the calculation trace.

The MVP globe is a deterministic, non-interactive educational diagram rather than a general-purpose map widget.

### Step 5 — Present and explore the result

The app displays:

- decimal coordinates;
- degrees-minutes-seconds coordinates;
- an interactive or linked map;
- estimated uncertainty;
- warnings and assumptions;
- a copyable calculation summary; and
- a shareable URL containing non-sensitive input state.

## 7. User-interface requirements

### 7.1 Page structure

Recommended desktop layout:

1. Introductory heading and one-sentence purpose
2. Guided input card
3. Result summary
4. Latitude explanation and SVG
5. Longitude explanation and SVG
6. Map and uncertainty
7. Glossary, method notes, and references

On narrow screens, inputs precede results and each diagram occupies the full content width.

### 7.2 Progressive disclosure

The default view should explain the essential method without overwhelming the learner. Additional detail should be available through expandable sections:

- Show calculation
- What does this term mean?
- Measurement corrections
- Accuracy and uncertainty
- Technical method and references

### 7.3 Interactive SVG requirements

Both diagrams must:

- be inline SVG, not raster images;
- use a stable `viewBox` and responsive sizing;
- keep geometry, construction lines, angle arcs, labels, and values in separately named groups;
- retain text as text rather than paths;
- provide a text alternative and SVG `<title>` and `<desc>` elements;
- use the same symbol colours in the diagrams, formulas, and glossary;
- support a reduced-motion preference; and
- remain understandable without colour alone.

#### Latitude diagram

The meridian-section diagram must show:

- Earth as a simple circle;
- rotation axis and equatorial plane;
- observer and observer radius;
- true horizon tangent to Earth;
- local vertical and zenith;
- parallel sunlight;
- subsolar point;
- observer latitude `φ`;
- solar declination `δ`;
- solar altitude `h`; and
- zenith distance `z`.

The displayed geometry must satisfy `z = |φ - δ|` and `h = 90° - z`.

#### Longitude diagram

The polar-view diagram must show:

- Earth viewed along its rotation axis;
- prime meridian;
- observer's meridian;
- longitude angle `λ`;
- direction of rotation;
- direction of sunlight;
- `15° per hour`; and
- `1° per four minutes`.

The diagram should distinguish the equation-of-time correction from the longitude-related time difference.

## 8. Glossary content

The following definitions must be available in plain language:

- **Solar altitude:** Angle of the Sun above the true horizon.
- **True horizon:** Plane perpendicular to the observer's local vertical.
- **Zenith:** Point directly above the observer.
- **Zenith distance:** Angle between the Sun and the zenith; `90° - altitude`.
- **Meridian:** North-south great circle through the observer and both geographic poles.
- **Local solar noon:** Moment the Sun crosses the local meridian at its upper culmination.
- **Solar declination:** Sun's angular position north or south of the celestial equator.
- **Subsolar point:** Point on Earth where the Sun is directly overhead; its latitude is the solar declination.
- **Equation of time:** Difference between apparent solar time and uniform mean solar time caused mainly by axial tilt and orbital eccentricity.
- **Apparent solar time:** Time indicated by the actual Sun.
- **Mean solar time:** Uniform clock-like solar time based on an averaged Sun.

## 9. Validation and warning requirements

The app must identify:

- missing or invalid UTC timestamp;
- altitude outside the accepted range;
- a negative altitude entered in standard visible-observation mode;
- latitude result outside `-90°…+90°`;
- mismatch between the selected meridian direction and the solved geometry, limited to cases that can be checked independently, such as `overhead` selected when zenith distance is not close to zero or an impossible latitude branch;
- Sun below the horizon at upper culmination;
- observation close enough to the zenith that north/south direction is unstable;
- insufficient precision in the supplied time or altitude; and
- date ambiguity when a user supplies “today” rather than a complete UTC date.

Warnings should say how the user can correct the input.

## 10. Accuracy presentation

The result must not imply false precision. The number of displayed decimal places should respond to input precision.

The app should explain these useful rules:

- One minute of time corresponds to 0.25° of longitude.
- One second of time corresponds to 15 arcseconds of longitude.
- One arcminute of latitude is approximately one nautical mile.
- A 0.1° altitude error produces approximately a 0.1° latitude error.

An uncertainty control may allow users to state estimated timing and altitude errors and see a coordinate range or map ellipse.

## 11. Accessibility requirements

- Target WCAG 2.2 AA.
- All functionality must be keyboard accessible.
- Inputs require visible labels, units, examples, and associated errors.
- Diagrams require equivalent textual explanations.
- Colour contrast must meet AA requirements.
- Information may not depend on colour alone.
- Motion must be optional and subtle.
- Mathematical expressions must have readable text equivalents.

## 12. Privacy requirements

- Calculations run locally in the browser.
- The app must not request device location for the core experience.
- Observation inputs must not be transmitted to an application server.
- Shared links should encode only values the user deliberately entered.
- Analytics, if ever added, must not capture coordinate inputs by default.

## 13. MVP acceptance criteria

The MVP is complete when:

1. A valid observation produces signed latitude and longitude.
2. Results agree with locked reference cases within the declared tolerance.
3. Every result exposes its intermediate values and formula substitutions.
4. Both SVG diagrams update consistently with the calculation.
5. Invalid or contradictory inputs receive an understandable explanation.
6. The Kinglake example can be loaded and reproduced.
7. The experience works at 320 px width and at common desktop widths.
8. Keyboard, screen-reader, and reduced-motion checks pass.
9. No network connection is required for calculation or diagrams.
10. The limitations and non-navigation disclaimer are visible.

## 14. Later enhancements

- Measurement-correction assistant for sextant observations
- Interactive date and time sliders
- Analemma and subsolar-point exploration
- Compare apparent and mean solar time
- Save or export an observation report
- Additional celestial bodies for traditional navigation lessons
- Optional installable progressive web app
- Embeddable diagram-only mode for other educational sites
