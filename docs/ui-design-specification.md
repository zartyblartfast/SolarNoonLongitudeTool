# UI Design Specification

## 1. Document purpose

This document defines the user-interface architecture, visual system, responsive behaviour, component rules, content style, interaction states, and acceptance criteria for **Solar Noon Location Explorer**.

It is intended to remove subjective design decisions from implementation. A developer or coding agent should be able to build the interface from this document without inventing a dashboard layout, choosing an unrelated visual style, or changing the educational sequence.

This specification complements:

- `product-specification.md`, which defines the product and user journey;
- `calculation-model.md`, which defines the mathematical model and conventions; and
- `technical-specification.md`, which defines application architecture and testing.

If this document conflicts with the calculation model, the calculation model takes precedence for scientific behaviour. If it conflicts with the product specification, the product specification takes precedence for scope.

The terms **must**, **should**, and **may** indicate required, recommended, and optional behaviour respectively.

## 2. Experience objective

The interface should feel like a clear scientific worksheet with an accompanying visual lesson. It must not feel like:

- an administration dashboard;
- a marketing landing page;
- a generic collection of cards;
- a dense professional navigation instrument; or
- a black-box coordinate converter.

A first-time user should be able to understand what to enter, obtain a result, and see the basic reasoning without reading a manual.

The central visual and verbal message is:

> **The Sun's altitude at solar noon helps determine latitude. The UTC time of solar noon helps determine longitude.**

## 3. Reference character

The application should retain the direct, single-purpose character of the creator's existing tools:

- [Beyond Horizon Calculator](https://beyondhorizoncalc.com/)
- [Great Circle Visualizer](https://greatcirclevisualizer.com/)

The useful qualities to retain are:

- the purpose is apparent immediately;
- the principal controls are visible without searching through menus;
- the calculation and visualization are the focus;
- explanatory material is available on the same page; and
- the user is not required to create an account.

This application should improve on that pattern with stronger spacing consistency, a clearer visual hierarchy, better mobile behaviour, accessible component states, and a more explicit learning sequence. It should not attempt to visually clone either existing application.

## 4. Approved UI framework

### 4.1 Application layer

Use:

- React;
- TypeScript with strict type checking; and
- Vite.

This matches the technical specification and suits a client-side calculator whose forms, results, formulas, diagrams, and URL state all respond to the same observation data.

### 4.2 Styling layer

Use Tailwind CSS as the styling engine, with all important colours, type sizes, spacing values, radii, shadows, and content widths mapped to named design tokens.

Rules:

- Do not scatter arbitrary hexadecimal colours or arbitrary spacing values through components.
- Do not use long utility-class strings repeatedly; extract recurring component patterns.
- Keep a small global stylesheet for tokens, typography, focus treatment, print rules, and diagram variables.
- Pin the selected Tailwind version when implementation begins.
- Do not fetch fonts or critical styles from a third-party CDN.

### 4.3 Accessible UI primitives

Use a restrained subset of shadcn/ui components, backed by Radix UI primitives where appropriate. Components are source-owned and must be adapted to the application's design tokens.

Approved component types are:

- Button;
- Input;
- Label;
- Radio Group;
- Accordion or Collapsible;
- Alert;
- Tooltip or Popover;
- Tabs, only for a genuine switch between two related views; and
- Dialog, only when an inline presentation would be materially worse.

Do not import a full component catalogue. Do not retain default component styling merely because it is supplied by the library.

### 4.4 Purpose-built elements

Use purpose-built React components for:

- the observation form;
- coordinate results;
- calculation steps;
- uncertainty presentation;
- inline term explanations;
- the map adapter; and
- both SVG diagrams.

Diagrams must be inline SVG generated from deterministic geometry. They must not be AI-generated raster illustrations.

### 4.5 Frameworks not required

Do not add Next.js, Material UI, Bootstrap, a dashboard template, a CSS-in-JS runtime, or a site-builder theme unless the architecture is deliberately reconsidered. The MVP has no server-rendering or application-server requirement.

## 5. Information architecture

The MVP is one continuous page. Do not divide the core journey into separate routes or a modal wizard.

The content order is:

1. Compact application header
2. Introductory title and purpose
3. Observation and result workspace
4. Calculation explanation
5. Latitude lesson and diagram
6. Longitude lesson and diagram
7. Map and uncertainty
8. Glossary, assumptions, references, and footer

Anchor links to **Calculator**, **How it works**, and **Glossary** may appear as quiet text links on larger screens. Do not introduce a hamburger menu solely for these links.

## 6. Desktop page layout

Use a centred content container with a maximum width of `1180px`. The page background is neutral; primary content sits on white or near-white surfaces.

At widths of approximately `900px` and above, use this twelve-column structure:

| Page row | Left region | Right region |
| --- | --- | --- |
| Introduction | Full width | Full width |
| Main workspace | Observation form, 5 columns | Result summary, 7 columns |
| Calculation explanation | Full width | Full width |
| Latitude lesson | Explanatory text, 5 columns | Latitude SVG, 7 columns |
| Longitude lesson | Explanatory text, 5 columns | Longitude SVG, 7 columns |
| Location context | Map, 7 columns | Accuracy and assumptions, 5 columns |
| Glossary and references | Full width | Full width |

Use a `24px` column gap and `48px` to `64px` vertical separation between major teaching sections. The observation form and result summary should read as two halves of one workspace rather than two unrelated floating cards.

The complete input form and principal result should fit within the first viewport on a typical desktop display where practical. The introductory area must therefore remain compact.

## 7. Responsive layout

### 7.1 Breakpoint behaviour

| Width | Required behaviour |
| --- | --- |
| Below `640px` | Single column; full-width controls; compact page padding; all diagrams below their explanatory text |
| `640px` to `899px` | Single-column content; related short fields may share a row; larger diagram labels allowed |
| `900px` and above | Twelve-column desktop composition described above |
| Above `1180px` | Content width remains capped; extra viewport width becomes outer margin |

### 7.2 Mobile content order

Mobile order must be:

1. Purpose
2. Observation form
3. Result
4. Calculation steps
5. Latitude explanation
6. Latitude diagram
7. Longitude explanation
8. Longitude diagram
9. Map
10. Accuracy and assumptions
11. Glossary and references

Do not place a diagram before the corresponding textual explanation on a narrow screen.

### 7.3 Mobile constraints

- Support a viewport width of `320px` without horizontal page scrolling.
- Keep tap targets at least `44px` high and wide where applicable.
- Do not place more than two compact numeric fields on one row.
- Stack primary and secondary actions if their labels would wrap.
- Let SVG diagrams use the full available content width.
- Move crowded diagram labels into a keyed legend below the SVG rather than shrinking them until unreadable.

## 8. Header and introduction

### 8.1 Header

Use a compact wordmark-style header. A bespoke logo is not required for the MVP.

Required elements:

- product name: **Solar Noon Location Explorer**;
- optional small Sun-and-meridian mark; and
- an unobtrusive **About this method** anchor link.

Do not add account controls, a search field, social links, theme controls, or an empty navigation bar.

### 8.2 Introduction

Use the following content hierarchy:

**Page title**

> Find your location from a solar-noon observation

**Introductory sentence**

> Enter the UTC date and time of local solar noon, the Sun's altitude, and whether it was north or south to estimate your latitude and longitude.

**Supporting note**

> This is an educational estimate, not a certified navigation result.

Provide a secondary action labelled **Load the worked example**. It loads and calculates the 22 September 2026 example immediately.

Avoid promotional slogans, stock illustrations, large decorative hero graphics, or a hero area taller than the calculator workspace.

## 9. Observation form

### 9.1 Section heading

Use:

> **Your solar-noon observation**

Supporting text:

> Use the moment the Sun crossed your local meridian and reached its highest altitude for that day.

### 9.2 Field sequence and wording

Fields must appear in this order:

#### UTC date

- Label: **Date of solar noon (UTC)**
- Control: native date input where practical
- Helper text: **Use the calendar date at the stated UTC time.**
- Domain value: ISO date portion of `timestampUtc`

#### UTC time

- Label: **Time of solar noon (UTC)**
- Control: time input supporting hours, minutes, and optional seconds
- Helper text: **Enter UTC, not local civil time.**
- Domain value: time portion of `timestampUtc`

The interface must always display `UTC` beside or within immediate reading distance of this field. It must not silently convert from the browser's local time zone.

#### Solar altitude

- Label: **Solar altitude at noon**
- Default control: decimal numeric input
- Unit suffix: `°`
- Default step: `0.1`
- Accepted range: `0°` through `90°`
- Helper text: **The angle of the Sun's centre above the true horizon.**

Provide a quiet format switch:

- **Decimal degrees**
- **Degrees, minutes, seconds**

Changing format must preserve the underlying value. In degrees-minutes-seconds mode, validate degrees, minutes, and seconds independently.

#### Sun direction

- Group label: **At solar noon, the Sun was:**
- Control: visible radio group or segmented radio group
- Choices:
  - **Due north**
  - **Due south**
  - **Directly overhead**
- Helper text: **This selects the correct latitude solution; it does not ask which hemisphere you were in.**

Do not use a negative altitude to represent the Southern Hemisphere. Do not label this field **Hemisphere**.

### 9.3 Optional accuracy inputs

Place optional measurement precision under an initially collapsed section labelled:

> **Add measurement uncertainty**

It may contain:

- estimated altitude uncertainty in degrees; and
- estimated timing uncertainty in seconds.

Explain that these values widen the estimated location range; they do not change the central coordinate.

Do not place sextant dip, refraction, semidiameter, pressure, temperature, or height-of-eye corrections in the MVP form. The MVP accepts a corrected centre altitude.

### 9.4 Form actions

Action order:

1. **Calculate location** — primary button
2. **Load worked example** — secondary button or text button
3. **Reset** — quiet text action

There must be only one visually dominant action.

Pressing Enter from a valid field should submit the form. Submission must not reload the page.

The worked-example action must:

1. populate `2026-09-22`, `02:12 UTC`, `52.2°`, and **Due north**;
2. calculate immediately;
3. retain normal editable fields; and
4. identify the values as an example in a short, dismissible note.

### 9.5 Recalculation behaviour

Use explicit calculation for the MVP:

- Before the first calculation, show the primary **Calculate location** action.
- After a result exists, editing a field marks the result as out of date.
- Show **Inputs changed — recalculate to update the result.** near the result and primary action.
- Do not silently leave an old result appearing current.
- Do not recalculate on every keystroke.

This behaviour can be reconsidered if a later exploration mode adds sliders.

## 10. Validation and form states

Validation occurs on submission and when leaving a field that has been edited. Do not show red errors before the user interacts with the form.

Every error must include:

- an error style on the field or group;
- a short message immediately below it;
- an accessible association such as `aria-describedby`; and
- a useful correction, not only the word **Invalid**.

Preferred messages include:

| Condition | Message |
| --- | --- |
| Missing date | **Enter the UTC date of the observation.** |
| Missing time | **Enter the UTC time of solar noon.** |
| Invalid altitude | **Solar altitude must be between 0° and 90°.** |
| Negative altitude | **Enter altitude as a positive angle. Use the direction choice below to describe which side of the sky the Sun was on.** |
| Missing direction | **Choose whether the Sun was due north, due south, or overhead.** |
| Impossible latitude | **These values would place the latitude beyond a pole. Check the altitude and Sun direction.** |
| Near-overhead ambiguity | **The Sun was very close to the zenith, so north-versus-south direction is difficult to distinguish.** |
| Low input precision | **The result may cover a broad area because the observation was entered with limited precision.** |

For multiple errors, focus the first invalid field and show a restrained summary above the form. The summary must link to each affected field.

Warnings do not prevent a result. Errors do.

## 11. Result summary

### 11.1 Section heading

Use:

> **Estimated location**

### 11.2 Empty state

Before calculation, the result region should not appear broken or vacant. Show:

> Enter your observation, then select **Calculate location**. Your coordinates and the reasoning behind them will appear here.

A small neutral line illustration may appear, but it must not compete with the form.

### 11.3 Successful result

Present information in this hierarchy:

1. Principal coordinate pair in hemisphere notation
2. Latitude and longitude as separately labelled values
3. Decimal and degrees-minutes-seconds format choice
4. Estimated uncertainty, if supplied
5. Copy actions
6. Educational-use qualification

Example principal display:

> **37.44° S, 145.22° E**

Supporting values:

| Label | Example |
| --- | --- |
| Latitude from solar altitude | `37.4443° S` |
| Longitude from UTC time | `145.2150° E` |

Copy actions:

- **Copy coordinates**
- **Copy calculation summary**
- **Copy share link**, once URL state is implemented

Copy confirmation should be a brief inline status or accessible toast. Do not use a modal dialog merely to say that text was copied.

### 11.4 Precision

Do not imply accuracy unsupported by the inputs. Internally computed digits may appear in the expanded trace, but the principal result must be rounded according to input precision or stated uncertainty.

When no uncertainty is supplied, show:

> **Approximate result:** actual accuracy depends on identifying solar noon and measuring the Sun's corrected altitude accurately.

### 11.5 Result states

| State | Presentation |
| --- | --- |
| Empty | Neutral instruction; no placeholder coordinate |
| Calculating | Preserve layout; show progress only if calculation exceeds about `150ms` |
| Valid | Coordinate pair, supporting values, trace link, and copy actions |
| Valid with warning | Result plus an amber warning immediately below the affected value |
| Invalid | Keep prior result visually unavailable; direct attention to form errors |
| Stale after editing | Dim qualification text, show stale notice, and retain the prior values only if clearly marked **Previous result** |
| Ephemeris failure | Explain that the solar data could not be calculated; preserve the user's inputs |

Avoid skeleton screens for a calculation expected to complete locally and almost immediately.

## 12. Calculation explanation

### 12.1 Section heading

Use:

> **How this answer was found**

Supporting sentence:

> The app combines your observation with the Sun's calculated position at that UTC moment.

### 12.2 Step structure

Display five numbered steps:

1. Find the Sun's declination
2. Convert altitude to zenith distance
3. Calculate latitude
4. Find the equation of time
5. Convert solar-noon time to longitude

Each step must contain:

- a plain-language explanation;
- the relevant term and symbol;
- the formula;
- substituted values; and
- the result with units.

On mobile, steps stack vertically. On desktop, they may use a vertical sequence or a responsive grid, but must not become five narrow cards in one row.

The concise explanation is visible by default. Additional detail is available through **Show full calculation**.

### 12.3 Formula presentation

- Render formulas as accessible HTML or an accessibility-tested mathematics renderer, never as images.
- Keep variables selectable and copyable.
- Provide a plain-text reading for formulas where needed.
- Use the same variable names and sign conventions as `calculation-model.md`.
- Colour may associate variables with diagrams, but ordinary text and mathematical structure must remain understandable without colour.

Example:

```text
Zenith distance: z = 90° - h
Substitution:     z = 90° - 52.2°
Result:           z = 37.8°
```

### 12.4 Term help

The first occurrence of a technical term may include a small **What is this?** control.

- On pointer devices, it may open a tooltip or popover.
- On touch devices, it must work by tapping.
- On keyboard, it must work by focus and activation.
- Essential instructions must never exist only inside a tooltip.
- Every short definition should link to the full glossary entry.

## 13. Latitude lesson and diagram

### 13.1 Text sequence

Explain the latitude calculation in this order:

1. Solar altitude is measured upward from the true horizon.
2. Zenith distance is the remaining angle to the point directly overhead.
3. Solar declination states how far north or south of the equator the overhead Sun is.
4. The Sun's north/south direction selects the correct latitude branch.
5. The resulting latitude is plotted in the diagram.

Do not begin with a dense symbolic formula before these relationships are introduced.

### 13.2 Diagram placement

On desktop, place explanatory text to the left and the SVG to the right. On mobile, place the SVG immediately after the explanation.

Use the heading:

> **Latitude: using the Sun's altitude**

### 13.3 Diagram controls

Provide only these diagram controls for the MVP:

- label mode: **Plain-language labels** or **Symbols**;
- toggle: **Show construction lines**; and
- action: **Show diagram as text**.

Plain-language labels are the default. The symbols mode uses `φ`, `δ`, `h`, and `z` while retaining an adjacent key.

Do not allow the user to drag geometrically significant points into an invalid configuration. Values change through the observation form.

### 13.4 SVG requirements

The diagram must follow the geometry invariants in `technical-specification.md` and include:

- Earth cross-section;
- equator and rotation axis;
- observer radius and local vertical;
- true horizon tangent;
- zenith;
- parallel sunlight;
- subsolar point;
- latitude arc;
- declination arc;
- altitude arc; and
- zenith-distance arc.

Labels must be data-driven. Do not bake wording into paths or raster assets. Label strings should reside in a dedicated content object so they can be revised or localized without changing geometry.

At small widths, use leader lines and an external legend when direct labels would overlap. Never solve overlap by making labels smaller than the normal supporting-text size.

## 14. Longitude lesson and diagram

### 14.1 Text sequence

Explain longitude in this order:

1. Local solar noon occurs when the Sun crosses the observer's meridian.
2. Earth turns through `360°` in approximately `24` hours.
3. This is `15°` per hour or `1°` every four minutes.
4. The equation of time corrects the difference between the real Sun and a uniform mean Sun.
5. Earlier UTC solar noon indicates east longitude; later UTC solar noon indicates west longitude.

Use the heading:

> **Longitude: using the UTC time of solar noon**

### 14.2 Diagram views

Use two tabs or a two-option segmented control:

- **Time view** — shows UTC, the Greenwich reference, solar-noon time difference, and equation-of-time correction.
- **Angle view** — shows the prime meridian, observer meridian, longitude angle, sunlight direction, and Earth's rotation.

The selected view must not reset when unrelated page controls change.

### 14.3 Direction language

Display a short interpretation beside the result:

- **Your solar noon occurred before Greenwich solar noon, placing you east of Greenwich**, or
- **Your solar noon occurred after Greenwich solar noon, placing you west of Greenwich.**

Account for date wrapping near midnight. Do not derive east/west from a naive same-date clock comparison when normalization changes the interpretation.

## 15. Map and uncertainty

### 15.1 Map behaviour

The map is supporting context, not part of the calculation.

- Load it after the result.
- Do not block or delay coordinate calculation while loading map code or tiles.
- Place one clear marker at the central estimate.
- Show an uncertainty region only when uncertainty inputs exist.
- Fit the view conservatively; do not zoom so tightly that the surrounding geography is unrecognizable.
- Include provider attribution where required.
- If mapping is unavailable, retain the coordinates and provide an **Open in map** link where configured.

Do not request device location.

### 15.2 Accuracy explanation

Place an adjacent section headed:

> **How accurate is this estimate?**

Show the most relevant rules:

- `0.1°` of altitude error produces approximately `0.1°` of latitude error.
- One minute of timing error produces `0.25°` of longitude error.
- One second of timing error produces `15` arcseconds of longitude error.

Use an uncertainty ellipse or range only when it is supported by stated input uncertainty. Do not invent a confidence level.

## 16. Glossary, assumptions, and references

### 16.1 Glossary

Use an alphabetical definition list or accessible accordion. Terms required by the product specification must be present.

Each entry contains:

- term;
- symbol where relevant;
- one-sentence plain-language definition; and
- optional expanded explanation.

Do not make the entire glossary one uninterrupted wall of text on mobile.

### 16.2 Assumptions

Display these assumptions prominently enough to be found without opening developer documentation:

- the recorded time is upper meridian transit;
- the timestamp is UTC;
- the altitude is the corrected altitude of the Sun's centre above the true horizon;
- the stated north/south direction is correct; and
- the result is educational rather than certified for navigation.

### 16.3 References

Technical references should appear after the plain-language material. External links must identify their destination and open according to the application's consistent link policy.

## 17. Visual design system

### 17.1 Overall style

Use a light, restrained scientific style:

- quiet neutral background;
- white primary surfaces;
- dark, high-contrast text;
- one primary teal accent;
- semantic colours used sparingly;
- thin borders instead of heavy shadows; and
- generous but not wasteful whitespace.

Dark mode is outside the MVP. Do not add a theme switch merely because the component framework supports one.

### 17.2 Initial colour tokens

These are the approved starting values. They may be adjusted after contrast and visual testing, but all changes must be made centrally.

```css
:root {
  --colour-page: #f5f7fa;
  --colour-surface: #ffffff;
  --colour-surface-subtle: #eef3f6;
  --colour-text: #17212b;
  --colour-text-muted: #5e6b76;
  --colour-border: #d7e0e7;

  --colour-primary: #126e82;
  --colour-primary-hover: #0f5968;
  --colour-primary-subtle: #e4f2f4;
  --colour-focus: #2563a6;

  --colour-success: #217a4a;
  --colour-warning: #9a5700;
  --colour-error: #b42318;

  --colour-earth-water: #dceffc;
  --colour-earth-land: #72ad7c;
  --colour-sun: #e9a400;

  --colour-latitude: #6d3bb3;
  --colour-declination: #b94f00;
  --colour-altitude: #00747a;
  --colour-zenith-distance: #2459a6;
  --colour-longitude: #a82762;
}
```

Diagram-variable colours must also use different line patterns, markers, or labels so that colour is not the only distinction.

### 17.3 Typography

Use a system font stack so the core UI has no remote-font dependency:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

`Inter` is used only if bundled locally or already available; the system stack is the reliable default.

Recommended scale:

| Role | Size | Line height |
| --- | --- | --- |
| Page title | `clamp(2rem, 4vw, 2.75rem)` | `1.1` |
| Section heading | `clamp(1.5rem, 2.4vw, 2rem)` | `1.2` |
| Subheading | `1.125rem` to `1.25rem` | `1.35` |
| Body | `1rem` | `1.55` |
| Supporting text | `0.875rem` | `1.5` |
| Principal coordinate | `clamp(1.75rem, 4vw, 2.5rem)` | `1.15` |

Body paragraphs should normally remain between `45` and `75` characters per line. Do not use uppercase for sentences or field labels.

### 17.4 Spacing

Use a four-pixel base scale:

```text
4, 8, 12, 16, 24, 32, 48, 64
```

Preferred applications:

- `8px` between a label and its control;
- `8px` between a control and helper or error text;
- `16px` between related fields;
- `24px` inside principal surfaces;
- `32px` between subsections; and
- `48px` to `64px` between major page sections.

### 17.5 Borders, radii, and shadows

- Input radius: `8px`
- Primary surface radius: `12px`
- Small badge or status radius: `6px`; avoid excessive pill shapes
- Standard border: `1px solid var(--colour-border)`
- Use at most one subtle elevation shadow for the main workspace
- Do not give every content section a shadow

### 17.6 Icons

- Icons supplement text; they do not replace important labels.
- Use one consistent, simple line-icon family if icons are needed.
- Do not place decorative icons beside every heading or field.
- The degree symbol, compass directions, and mathematical symbols must remain text.

## 18. Component behaviour

### 18.1 Buttons

- Minimum height: `44px`
- Primary button: filled primary colour
- Secondary button: border or subtle primary background
- Quiet action: text treatment with a clear hover and focus state
- Disabled buttons must remain legible and state why they are unavailable where that is not obvious
- Loading state must preserve the button's width

### 18.2 Inputs

- Visible permanent label above every input
- Unit suffix inside a visually attached region or immediately after the input
- Never use placeholder text as the only label
- Numeric values align consistently
- Focus state uses more than a colour change alone where practical
- Errors do not cause a major layout jump

### 18.3 Radio groups

- Use a semantic `fieldset` and `legend`
- Each option has a clear selected state, radio indicator, and visible text
- Arrow-key and Tab behaviour follows established accessible patterns
- Do not use three ambiguous compass icons without labels

### 18.4 Accordions and disclosure

- Use disclosure only for supplementary depth, not essential task instructions
- Headings remain meaningful when the panel is collapsed
- Preserve open state during unrelated recalculations
- Avoid nesting accordions

### 18.5 Alerts

- Error, warning, information, and success states use an icon or explicit label in addition to colour
- Keep messages near the value or action they concern
- Reserve full-width alerts for problems affecting the entire calculation

## 19. Motion and feedback

Motion must explain a change, not decorate the page.

Allowed examples:

- a diagram angle moving to its newly calculated position;
- a result value cross-fading after recalculation; and
- an accordion expanding or collapsing.

Rules:

- Normal transition duration: approximately `150ms` to `250ms`.
- Do not animate the initial page load.
- Do not use parallax, floating particles, bouncing buttons, or looping Sun animations.
- Honour `prefers-reduced-motion` by removing non-essential transitions and showing diagram states immediately.
- Never animate so slowly that the diagram appears to disagree temporarily with its numerical result.

## 20. Accessibility requirements

Target WCAG 2.2 AA.

The implementation must include:

- complete keyboard operation;
- a logical heading hierarchy;
- a **Skip to calculator** link;
- visible focus indicators;
- sufficient text, control, and graphical contrast;
- semantic form grouping;
- associated errors and helper text;
- result announcement through a restrained `aria-live` region;
- textual alternatives for both diagrams;
- no information conveyed by colour alone;
- correct reading and focus order at every breakpoint;
- support for browser zoom to at least `200%` without loss of task functionality; and
- reduced-motion support.

Do not announce every character typed or every cosmetic diagram update. Announce the completed result, important warnings, and copy confirmations.

SVGs require:

- `<title>` and `<desc>`;
- an accessible name associated with the visible section heading;
- decorative geometry hidden from assistive technology where appropriate; and
- an adjacent HTML text explanation containing all result-bearing information.

## 21. Content and terminology rules

### 21.1 Voice

Use calm, direct, explanatory language. Address the user as **you** when giving an instruction. Prefer a familiar word followed by the technical term.

Example:

> The zenith is the point directly above you.

Do not assume prior knowledge of celestial navigation.

### 21.2 Scientific wording

- Use **solar altitude**, with **elevation angle** mentioned as a common alternative.
- Use **local apparent solar noon** when precision matters; introduce it first as **local solar noon**.
- Use **true horizon**, not an unexplained **horizontal**.
- Use **solar declination**, not merely **declination**, on first occurrence.
- Use north/east positive only in the calculation trace; show hemisphere letters in the principal result.
- Keep apparent solar time and mean solar time distinct.

### 21.3 Formatting

- Use a space between a value and most written units, but attach the degree symbol: `52.2°`.
- Display UTC explicitly: `02:12 UTC`.
- Use a true minus sign in rendered negative numerical values where supported.
- Use decimal points, not locale-sensitive commas, in serialized URLs and copied technical values.
- Keep all examples internally consistent with the locked reference case.

## 22. Privacy, resilience, and external content

- Core calculation, validation, formulas, and diagrams run locally.
- Do not ask for browser geolocation.
- Do not send observation values to analytics.
- Do not require a cookie banner for functionality that does not use cookies.
- Treat maps, reverse geocoding, and external reference links as optional enhancements.
- If an external map fails, the coordinate result and calculation explanation remain complete.
- Shared URLs contain only values the user deliberately entered.

## 23. Performance requirements

- Load the calculator and essential styles before map code.
- Avoid a large icon package when only a few icons are used.
- Tree-shake or import UI primitives individually.
- Keep the SVGs declarative and avoid layout measurement loops.
- Avoid cumulative layout shift when results appear by reserving an appropriate result region.
- A normal local calculation should appear immediate; do not add an artificial loading delay.

## 24. Implementation components

The recommended UI component tree is:

```text
AppShell
  SkipLink
  AppHeader
  IntroSection
  CalculatorWorkspace
    ObservationForm
      TimestampFields
      AltitudeField
      DirectionFieldset
      UncertaintyDisclosure
      FormActions
    ResultSummary
      CoordinateDisplay
      PrecisionNote
      ResultActions
  CalculationExplanation
    CalculationStep
    FullTraceDisclosure
  LatitudeLesson
    LessonText
    LatitudeDiagram
    DiagramTextAlternative
  LongitudeLesson
    LessonText
    LongitudeDiagram
    DiagramTextAlternative
  LocationContext
    MapPanel
    AccuracyPanel
  Glossary
  MethodNotes
  ReferenceList
  AppFooter
```

Component boundaries may change where testing or reuse benefits, but calculation logic must not move into presentational components.

## 25. Required visual states for review

Before the design is accepted, capture and review the following states at `375px`, `768px`, `1024px`, and `1440px` widths:

1. Empty calculator
2. Completed Kinglake example
3. Field-validation errors
4. Valid result with a warning
5. Result marked stale after an input change
6. Decimal-altitude mode
7. Degrees-minutes-seconds mode
8. Latitude diagram with plain-language labels
9. Latitude diagram with symbols
10. Both longitude diagram views
11. Map unavailable fallback
12. Reduced-motion mode
13. Keyboard focus on every interactive component
14. Content at `200%` browser zoom

Visual review must check:

- no clipped or overlapping text;
- no horizontal page scrolling;
- consistent alignment of labels and controls;
- diagrams agree with values and formulas;
- status states do not depend on colour alone;
- the primary action is obvious; and
- the page remains recognizably the same application at all breakpoints.

## 26. Explicit design prohibitions

The implementation must not introduce:

- a dashboard sidebar;
- a multi-page wizard for the core calculation;
- a full-height promotional hero;
- glassmorphism or blurred translucent panels;
- decorative gradients behind ordinary content;
- multiple competing primary buttons;
- a card around every paragraph or formula;
- unexplained icon-only controls;
- auto-playing or looping animation;
- arbitrary 3D globe effects in place of the specified geometric SVGs;
- tiny labels embedded permanently in diagram geometry;
- negative altitude as a hemisphere shortcut;
- automatic device-location requests;
- a sign-in prompt;
- fabricated accuracy or confidence values; or
- hidden conversion from local time to UTC.

## 27. Agent implementation sequence

An AI coding agent should implement the UI in controlled stages:

1. Create tokens, global typography, and the responsive page shell.
2. Build the observation and result workspace with static fixture data.
3. Review screenshots at the four required widths before adding the full calculation engine.
4. Implement semantic form behaviour and all validation states.
5. Connect the result and calculation trace to domain output.
6. Build the latitude SVG without labels; verify geometry; then add labels.
7. Build and verify both longitude diagram views.
8. Add glossary, uncertainty, mapping fallback, and copy/share actions.
9. Run accessibility, keyboard, responsive, and visual-regression checks.

The agent must not redesign previously approved sections while implementing a later stage unless the change is required to fix a documented issue. Visual changes should be isolated and reviewed rather than bundled with calculation changes.

## 28. UI acceptance criteria

The interface is ready for MVP release when:

1. A first-time user can identify all required inputs without consulting the glossary.
2. UTC is explicit and cannot reasonably be mistaken for local time.
3. Altitude and Sun direction are separate inputs.
4. One clear primary action produces the result.
5. Latitude and longitude are visually distinguishable and explain their different sources.
6. Every displayed result can be traced through visible intermediate values.
7. Technical terms have plain-language definitions at or near first use.
8. Both diagrams remain accurate, readable, and consistent with the formulas at all test sizes.
9. The core journey works at `320px` width and at `200%` zoom.
10. Keyboard-only and screen-reader users can complete the calculation.
11. The page remains useful when map services are unavailable.
12. No network request is required for calculation or diagrams.
13. The interface meets the explicit design prohibitions in this document.
14. Visual-regression fixtures cover the Kinglake example and the required UI states.
15. Content and numerical examples agree with the product and calculation specifications.

## 29. Deferred design decisions

Confirm these before final visual polish:

- final product name and any abbreviated wordmark;
- whether the existing applications supply a shared brand colour or footer treatment;
- mapping library and tile provider;
- whether reverse-geocoded place names are included;
- final diagram label wording after geometry review;
- whether a print-friendly observation report is included in the first release; and
- hosting-specific privacy, analytics, and external-link policies.

These decisions must not block construction of the calculator, results, explanations, or SVG diagrams.
