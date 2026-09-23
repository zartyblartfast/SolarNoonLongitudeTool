import { buildLatitudeDiagramGeometry, dot, length } from './latitudeGeometry';

describe('buildLatitudeDiagramGeometry', () => {
  it('preserves the Kinglake latitude relationships in its derived values', () => {
    const geometry = buildLatitudeDiagramGeometry({
      latitudeDeg: -37.4443,
      declinationDeg: 0.3557,
      solarAltitudeDeg: 52.2,
      zenithDistanceDeg: 37.8
    });

    expect(geometry.values.zenithDistanceDeg).toBeCloseTo(37.8, 8);
    expect(Math.abs(geometry.values.latitudeDeg - geometry.values.declinationDeg)).toBeCloseTo(
      geometry.values.zenithDistanceDeg,
      4
    );
    expect(90 - geometry.values.solarAltitudeDeg).toBeCloseTo(geometry.values.zenithDistanceDeg, 8);
  });

  it('places the observer radius perpendicular to the true horizon', () => {
    const geometry = buildLatitudeDiagramGeometry({
      latitudeDeg: -37.4443,
      declinationDeg: 0.3557,
      solarAltitudeDeg: 52.2,
      zenithDistanceDeg: 37.8
    });

    const radiusVector = {
      x: geometry.points.observer.x - geometry.points.center.x,
      y: geometry.points.observer.y - geometry.points.center.y
    };
    const horizonVector = {
      x: geometry.lines.horizon.end.x - geometry.lines.horizon.start.x,
      y: geometry.lines.horizon.end.y - geometry.lines.horizon.start.y
    };

    expect(Math.abs(dot(radiusVector, horizonVector))).toBeLessThan(1e-6);
    expect(length(radiusVector)).toBeCloseTo(geometry.earthRadius, 6);
  });

  it('keeps the subsolar radius parallel to the sunlight direction', () => {
    const geometry = buildLatitudeDiagramGeometry({
      latitudeDeg: -37.4443,
      declinationDeg: 0.3557,
      solarAltitudeDeg: 52.2,
      zenithDistanceDeg: 37.8
    });

    const subsolarRadius = {
      x: geometry.points.subsolarPoint.x - geometry.points.center.x,
      y: geometry.points.subsolarPoint.y - geometry.points.center.y
    };

    expect(Math.abs(dot(subsolarRadius, geometry.vectors.sunlightPerpendicular))).toBeLessThan(1e-6);
    expect(dot(subsolarRadius, geometry.vectors.sunlightDirection)).toBeGreaterThan(0);
  });

  it('derives named angle arcs for latitude, declination, altitude, and zenith distance', () => {
    const geometry = buildLatitudeDiagramGeometry({
      latitudeDeg: -37.4443,
      declinationDeg: 0.3557,
      solarAltitudeDeg: 52.2,
      zenithDistanceDeg: 37.8
    });

    expect(geometry.arcs.latitude.valueDeg).toBeCloseTo(-37.4443, 4);
    expect(geometry.arcs.declination.valueDeg).toBeCloseTo(0.3557, 4);
    expect(geometry.arcs.altitude.valueDeg).toBeCloseTo(52.2, 4);
    expect(geometry.arcs.zenithDistance.valueDeg).toBeCloseTo(37.8, 4);

    expect(geometry.arcs.latitude.path).toMatch(/^M /);
    expect(geometry.arcs.altitude.path).toMatch(/^M /);
  });
});
