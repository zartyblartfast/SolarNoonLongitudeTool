import { buildEarthContextGlobeGeometry } from './earthContextGlobeGeometry';

describe('buildEarthContextGlobeGeometry', () => {
  it('projects Kinglake observer and subsolar points onto the visible globe', () => {
    const geometry = buildEarthContextGlobeGeometry({
      observerLatitudeDeg: -37.4451,
      observerLongitudeDeg: 145.2185,
      subsolarLatitudeDeg: 0.3549,
      subsolarLongitudeDeg: 145.2185
    });

    expect(geometry.points.observer.visible).toBe(true);
    expect(geometry.points.subsolar.visible).toBe(true);
    expect(Number.isFinite(geometry.points.observer.x)).toBe(true);
    expect(Number.isFinite(geometry.points.observer.y)).toBe(true);
    expect(Number.isFinite(geometry.points.subsolar.x)).toBe(true);
    expect(Number.isFinite(geometry.points.subsolar.y)).toBe(true);
  });

  it('centers the globe between observer and subsolar point', () => {
    const geometry = buildEarthContextGlobeGeometry({
      observerLatitudeDeg: -37.4451,
      observerLongitudeDeg: 145.2185,
      subsolarLatitudeDeg: 0.3549,
      subsolarLongitudeDeg: 145.2185
    });

    expect(geometry.centerLongitudeDeg).toBeCloseTo(145.2185, 4);
    expect(geometry.centerLatitudeDeg).toBeCloseTo(-18.5451, 4);
  });

  it('returns graticule and marker data suitable for inline SVG rendering', () => {
    const geometry = buildEarthContextGlobeGeometry({
      observerLatitudeDeg: -37.4451,
      observerLongitudeDeg: 145.2185,
      subsolarLatitudeDeg: 0.3549,
      subsolarLongitudeDeg: 145.2185
    });

    expect(geometry.outlinePath).toMatch(/^M/);
    expect(geometry.graticulePath).toMatch(/^M/);
    expect(geometry.points.observer.label).toBe('Observer estimate');
    expect(geometry.points.subsolar.label).toBe('Subsolar point');
  });
});
