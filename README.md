# Solar Noon Location Explorer

> Working title for an educational web app that derives an observer's approximate latitude and longitude from a solar-noon observation, then shows exactly why the calculation works.

## Status

Specification stage. No application code has been committed yet.

## Purpose

Solar Noon Location Explorer turns a traditional celestial-navigation calculation into an interactive lesson. A user supplies:

- the exact UTC date and time of local solar noon;
- the Sun's altitude above the true horizon at that moment; and
- whether the Sun was north, south, or directly overhead.

The app calculates an estimated latitude and longitude, plots the result on a map, and explains every intermediate value with responsive SVG diagrams.

The central teaching idea is deliberately simple:

- **Altitude determines latitude.**
- **Time determines longitude.**

## What the user learns

The guided calculation explains:

- solar altitude and the true horizon;
- zenith and zenith distance;
- the local meridian and local solar noon;
- solar declination and the subsolar point;
- why the Sun may be north or south at noon;
- the equation of time;
- why Earth turns through 15° of longitude per hour, or 1° every four minutes; and
- how measurement precision affects the resulting position.

## Core calculation

Let:

- `h` be the corrected altitude of the Sun's centre in degrees;
- `z = 90° - h` be the zenith distance;
- `δ` be solar declination, positive north and negative south;
- `U` be the UTC observation time in minutes after midnight; and
- `E` be the equation of time in minutes, using the convention apparent solar time minus mean solar time.

Latitude is calculated from the Sun's direction at meridian transit:

```text
Sun north: latitude = δ - z
Sun south: latitude = δ + z
Sun overhead: latitude = δ
```

Longitude, positive east and negative west, is:

```text
longitude = (720 - U - E) / 4
```

The production calculation engine will obtain the Sun's declination and subsolar longitude from a tested astronomical ephemeris. The equation above is retained because it provides the clearest educational explanation of the longitude result.

## Planned experience

1. **Enter the observation** — UTC timestamp, solar altitude, and north/south direction.
2. **See the solar geometry** — an interactive meridian-section SVG explains altitude, zenith distance, declination, and latitude.
3. **See the time geometry** — a polar-view SVG explains the prime meridian, local meridian, equation of time, and longitude.
4. **Inspect the result** — decimal and degrees-minutes-seconds coordinates, a map marker, uncertainty, and a complete calculation trace.
5. **Explore** — adjust the date, time, or altitude and watch the diagrams and result update.

## Example

For an observation on 22 September 2026 at 02:12 UTC, with a corrected solar altitude of 52.2° and the Sun north of the observer:

```text
Solar declination     ≈ +0.356°
Zenith distance       = 90° - 52.2° = 37.8°
Latitude              ≈ +0.356° - 37.8° = -37.444°
Equation of time      ≈ +7.14 minutes
Longitude             ≈ (720 - 132 - 7.14) / 4 = +145.215°
Estimated coordinates ≈ 37.44° S, 145.22° E
```

This is near Kinglake National Park in Victoria, Australia. The example assumes that the date is correct and that 52.2° is the corrected altitude of the Sun's centre.

## Documentation

- [Product specification](docs/product-specification.md)
- [Calculation model](docs/calculation-model.md)
- [Technical specification](docs/technical-specification.md)
- [UI design specification](docs/ui-design-specification.md)

## Proposed implementation

- React and TypeScript
- Vite build tooling
- Astronomy Engine behind a small internal ephemeris adapter
- Inline, responsive SVG diagrams with stable element IDs
- Static client-side deployment; no application server required
- Vitest for calculation tests
- Playwright for end-to-end, accessibility, and visual-regression tests

The final dependency choices should be confirmed when implementation begins. The mathematical domain layer must remain isolated from the UI so that the ephemeris implementation can be replaced without changing the educational presentation.

## Scientific scope

The application is an educational position estimate, not a certified navigation instrument. Its usefulness depends on correct identification of local solar noon and accurate time and altitude measurements. Atmospheric refraction, horizon dip, solar limb choice, instrument error, and timestamp precision can all affect the answer.

The first release will accept a corrected altitude of the Sun's centre. A later measurement-assistant mode may apply common sextant corrections and display their individual effects.

## MVP roadmap

- Finalise mathematical conventions and reference test cases.
- Build and verify the latitude SVG.
- Build and verify the longitude SVG.
- Implement the calculation engine and trace output.
- Add the guided input flow, glossary, and validation.
- Add coordinate formatting, map presentation, and shareable URLs.
- Complete numerical, visual, responsive, and accessibility testing.

## Open decisions before implementation

- Final product and repository name.
- Whether this remains standalone or becomes part of SunpathLab.
- Initial supported date range.
- Mapping approach, tile provider, and fallback behaviour.
- Hosting target and deployment workflow.
- Project licence and third-party licence records.
- Whether the MVP includes only corrected centre altitude, as currently specified.

## Licence

To be decided before public release. Any third-party astronomical or mapping dependency must have its licence recorded in the repository.
