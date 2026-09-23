# Calculation Model Specification

## 1. Purpose

This document defines the mathematical conventions, required inputs, derived values, validation rules, uncertainty treatment, and reference example for Solar Noon Location Explorer.

The calculation engine must produce reproducible values independently of the user interface.

## 2. Scope and assumptions

The core method assumes:

- the timestamp identifies the Sun's **upper meridian transit**, called local apparent solar noon;
- the timestamp is expressed in UTC;
- the altitude is the corrected altitude of the Sun's centre above the true horizon;
- the user identifies whether the Sun culminated north or south of the zenith, or directly overhead;
- the latitude result is the spherical/astronomical estimate produced by the meridian-altitude relationship; and
- the app is an educational estimator, not a certified navigation instrument.

For map display, the MVP treats the calculated latitude as a WGS84 latitude coordinate while documenting that approximation. For ordinary educational observations, the distinction between this spherical treatment and a full geodetic reduction is smaller than typical hand-measurement error. The implementation must nevertheless document which ephemeris and coordinate conventions it uses.

## 3. Symbols and sign conventions

| Symbol | Meaning | Unit and sign |
| --- | --- | --- |
| `h` | Corrected solar altitude | Degrees above true horizon |
| `z` | Solar zenith distance | Degrees, `z = 90° - h` |
| `δ` | Apparent solar declination of date | North positive, south negative |
| `φ` | Observer latitude | North positive, south negative |
| `λ` | Observer longitude | East positive, west negative |
| `U` | UTC time after midnight | Minutes |
| `E` | Equation of time | Minutes; apparent solar time minus mean solar time |

Direction is a separate enumeration:

```text
north | south | overhead
```

A negative altitude must never be used to encode the Southern Hemisphere.

## 4. Required inputs

```ts
interface SolarNoonObservation {
  timestampUtc: string;          // ISO 8601, for example 2026-09-22T02:12:00Z
  solarAltitudeDeg: number;      // corrected centre altitude
  meridianDirection: 'north' | 'south' | 'overhead';
  altitudeUncertaintyDeg?: number;
  timeUncertaintySeconds?: number;
}
```

The parser may accept degrees-minutes-seconds input, but the domain layer receives decimal degrees.

## 5. Ephemeris requirements

### 5.1 Production values

The production engine must obtain, for the exact UTC timestamp:

- apparent solar declination of date;
- apparent right ascension or an equivalent Sun vector;
- Greenwich apparent sidereal time, or directly the subsolar longitude; and
- a derived equation of time for explanation.

The recommended browser implementation is Astronomy Engine behind an internal adapter. It is browser-capable, MIT-licensed, and designed for solar-system positions accurate to approximately one arcminute. The adapter must make it possible to substitute another implementation without changing the calculation or UI contracts.

NREL's Solar Position Algorithm should be used as a high-accuracy reference for locked validation cases. NREL reports a solar-position uncertainty of approximately ±0.0003° for SPA when its required inputs are supplied.

### 5.2 Why the short NOAA approximation is not the production engine

The compact NOAA fractional-year formulas are useful for teaching the equation of time, but their approximate declination can differ enough near an equinox to move an inferred latitude by tens of kilometres. They may be shown as an explicitly labelled estimate, but must not silently drive the principal result.

## 6. Derived solar quantities

The ephemeris adapter returns:

```ts
interface SolarEphemerisAtTime {
  declinationDeg: number;          // δ
  subsolarLongitudeDeg: number;    // east positive, normalized to [-180, 180)
  equationOfTimeMinutes: number;   // E, apparent minus mean
  source: string;
  nominalAngularAccuracyDeg: number;
}
```

### 6.1 Subsolar longitude

The subsolar point is where the Sun is on the zenith. At any instant, every point on that meridian is at local apparent solar noon. Therefore:

```text
observer longitude at local solar noon = subsolar longitude at the timestamp
```

If the ephemeris exposes apparent right ascension `α` and Greenwich apparent sidereal time `GAST`, both in angular units:

```text
subsolar longitude = normalize180(α - GAST)
```

If right ascension and sidereal time are in hours, multiply their difference by 15 before normalization.

### 6.2 Equation of time

For educational display, the equation of time can be obtained directly from the ephemeris or derived consistently from the calculated subsolar longitude:

```text
E = normalizeTime(720 - U - 4λ)
```

`normalizeTime` adds or subtracts 1440 minutes until the small equation-of-time value around zero is obtained.

The sign convention is:

```text
E = apparent solar time - mean solar time
```

A positive value means the apparent Sun is ahead of the mean Sun.

## 7. Latitude calculation

### 7.1 Zenith distance

```text
z = 90° - h
```

At upper meridian transit:

```text
z = |φ - δ|
```

The Sun's direction selects the correct branch:

```text
Sun north:    φ = δ - z
Sun south:    φ = δ + z
Sun overhead: φ = δ and z ≈ 0
```

Interpretation:

- If `δ > φ`, the Sun culminates north of the zenith.
- If `δ < φ`, the Sun culminates south of the zenith.
- If `δ ≈ φ`, the Sun culminates at or very close to the zenith.

### 7.2 Latitude validation

Reject or flag the result when:

- `φ` falls outside `[-90°, +90°]`;
- the selected direction contradicts the relationship between `φ` and `δ`;
- `h > 90°`;
- `h < 0°` in visible-observation mode; or
- `h` is close to 90° but the direction is asserted with unwarranted certainty.

## 8. Longitude calculation

### 8.1 Convert UTC to minutes

```text
U = 60 × UTC_hour + UTC_minute + UTC_second / 60
```

At local apparent solar noon, true solar time is 720 minutes. Using east-positive longitude and the stated equation-of-time convention:

```text
720 = U + E + 4λ
```

Therefore:

```text
λ = (720 - U - E) / 4
```

Normalize the result:

```text
while λ >= 180°, subtract 360°
while λ < -180°, add 360°
```

The factor of four follows from:

```text
1440 minutes / 360° = 4 minutes per degree
```

An earlier UTC solar noon than Greenwich indicates east longitude; a later one indicates west longitude.

### 8.2 Preferred implementation

For the primary result, use the ephemeris-derived subsolar longitude directly. Independently calculate the equation-of-time form above and assert that both longitude paths agree within a small numerical tolerance. This gives the app both accuracy and an auditable educational trace.

## 9. Observation corrections

### 9.1 MVP rule

The MVP accepts the corrected altitude of the Sun's centre. It does not silently correct a raw sextant or inclinometer reading.

### 9.2 Future correction assistant

If raw-observation support is added, corrections must be displayed individually and applied with explicit sign conventions:

- index correction;
- dip of the visible sea horizon;
- atmospheric refraction;
- solar semidiameter when a limb rather than the centre is observed;
- height of eye;
- pressure and temperature, if used for refraction; and
- optional parallax treatment.

For a lower-limb sight, solar semidiameter is added to obtain the centre altitude. For an upper-limb sight, it is subtracted. Refraction generally makes the apparent Sun higher than its geometric position, so the correction to geometric altitude is generally subtractive.

## 10. Uncertainty

### 10.1 Latitude sensitivity

Ignoring small ephemeris uncertainty:

```text
latitude uncertainty ≈ altitude uncertainty
```

An altitude error of 0.1° therefore moves latitude by about 0.1°, or approximately 11 km north-south.

### 10.2 Longitude sensitivity

```text
1 minute of timing = 0.25° of longitude
1 second of timing = 15 arcseconds of longitude
```

At latitude `φ`, an angular longitude error `Δλ` corresponds approximately to:

```text
east-west distance ≈ 111.32 km × cos(φ) × Δλ
```

### 10.3 Display precision

The app must not display more meaningful precision than the input supports. Internally retain full floating-point precision, but round the principal result according to observation uncertainty.

## 11. Reference example

Assume:

```text
UTC timestamp:       2026-09-22T02:12:00Z
Solar altitude:      52.2°
Sun direction:       north
Altitude definition: corrected centre above true horizon
```

Reference ephemeris values are approximately:

```text
δ = +0.3557°
E = +7.140 minutes
λ = +145.2150°
```

Latitude:

```text
z = 90° - 52.2°
z = 37.8°

φ = δ - z
φ = +0.3557° - 37.8°
φ = -37.4443°
```

Longitude:

```text
U = 2 × 60 + 12
U = 132 minutes

λ = (720 - 132 - 7.140) / 4
λ = +145.215°
```

Result:

```text
37.44° S, 145.22° E
```

The locked automated fixture must be regenerated from the selected production ephemeris and independently compared with NREL SPA before implementation acceptance.

## 12. Required numerical tests

At minimum, include fixtures for:

- the Kinglake example;
- northern and southern observers on an equinox;
- both solstices;
- Sun north and Sun south within the same geographic hemisphere;
- an overhead transit;
- UTC times close to midnight;
- longitude wrapping near ±180°;
- high-latitude visible and below-horizon culmination;
- leap day;
- timing with seconds; and
- contradictory direction input.

Property tests should verify:

- forward reconstruction gives `h = 90° - |φ - δ|`;
- the chosen direction agrees with the sign of `δ - φ`;
- both longitude calculation paths agree;
- normalization always produces `-180° <= λ < 180°`; and
- formatting never changes the underlying value.

## 13. References

- NREL Solar Position Algorithm report: https://www.nrel.gov/docs/fy08osti/34302.pdf
- NREL SPA information and calculator: https://midcdmz.nlr.gov/spa/
- Astronomy Engine: https://github.com/cosinekitty/astronomy
- NOAA general solar-position equations, useful as a teaching approximation: https://gml.noaa.gov/grad/solcalc/solareqns.PDF
