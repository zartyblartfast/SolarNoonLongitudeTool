import { buildLongitudeDiagramGeometry, normalizeClockDifferenceMinutes } from './longitudeGeometry';

describe('buildLongitudeDiagramGeometry', () => {
  it('derives the Kinglake longitude angle and time interpretation', () => {
    const geometry = buildLongitudeDiagramGeometry({
      longitudeDeg: 145.215,
      utcMinutesAfterMidnight: 132,
      equationOfTimeMinutes: 7.14
    });

    expect(geometry.values.longitudeDeg).toBeCloseTo(145.215, 4);
    expect(geometry.values.greenwichSolarNoonUtcMinutes).toBeCloseTo(712.86, 2);
    expect(geometry.values.solarNoonOffsetMinutes).toBeCloseTo(-580.86, 2);
    expect(geometry.values.direction).toBe('east');
    expect(geometry.arcs.longitude.valueDeg).toBeCloseTo(145.215, 4);
    expect(geometry.arcs.longitude.path).toMatch(/^M /);
  });

  it('normalizes clock differences around midnight', () => {
    expect(normalizeClockDifferenceMinutes(800)).toBe(-640);
    expect(normalizeClockDifferenceMinutes(-800)).toBe(640);
    expect(normalizeClockDifferenceMinutes(580.86)).toBeCloseTo(580.86, 2);
  });

  it('places prime and observer meridians from the same polar center', () => {
    const geometry = buildLongitudeDiagramGeometry({
      longitudeDeg: 145.215,
      utcMinutesAfterMidnight: 132,
      equationOfTimeMinutes: 7.14
    });

    expect(geometry.lines.primeMeridian.start).toEqual(geometry.center);
    expect(geometry.lines.observerMeridian.start).toEqual(geometry.center);
    expect(Number.isFinite(geometry.lines.observerMeridian.end.x)).toBe(true);
    expect(Number.isFinite(geometry.lines.observerMeridian.end.y)).toBe(true);
  });
});
