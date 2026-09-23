export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface LatitudeDiagramInput {
  latitudeDeg: number;
  declinationDeg: number;
  solarAltitudeDeg: number;
  zenithDistanceDeg: number;
}

export interface LatitudeDiagramGeometry {
  center: Point;
  earthRadius: number;
  values: LatitudeDiagramInput;
  points: {
    center: Point;
    observer: Point;
    subsolarPoint: Point;
    zenith: Point;
  };
  vectors: {
    observerRadius: Vector;
    localVertical: Vector;
    horizon: Vector;
    sunlightDirection: Vector;
    sunlightPerpendicular: Vector;
  };
  lines: {
    observerRadius: { start: Point; end: Point };
    horizon: { start: Point; end: Point };
    localVertical: { start: Point; end: Point };
    sunlight: { start: Point; end: Point };
    subsolarRadius: { start: Point; end: Point };
  };
  arcs: {
    latitude: AngleArc;
    declination: AngleArc;
    altitude: AngleArc;
    zenithDistance: AngleArc;
  };
}

export interface AngleArc {
  center: Point;
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
  valueDeg: number;
  path: string;
  labelPoint: Point;
}

const CENTER: Point = { x: 140, y: 140 };
const EARTH_RADIUS = 92;
const LINE_EXTENSION = 42;

export function buildLatitudeDiagramGeometry(input: LatitudeDiagramInput): LatitudeDiagramGeometry {
  const observerRadius = unitFromLatitude(input.latitudeDeg);
  const subsolarRadius = unitFromLatitude(input.declinationDeg);
  const horizon = perpendicularClockwise(observerRadius);
  const sunlightDirection = subsolarRadius;
  const sunlightPerpendicular = perpendicularClockwise(sunlightDirection);

  const observer = add(CENTER, scale(observerRadius, EARTH_RADIUS));
  const subsolarPoint = add(CENTER, scale(subsolarRadius, EARTH_RADIUS));
  const zenith = add(observer, scale(observerRadius, LINE_EXTENSION));
  const latitudeArc = createArc(CENTER, 30, 0, input.latitudeDeg, input.latitudeDeg);
  const declinationArc = createArc(CENTER, 44, 0, input.declinationDeg, input.declinationDeg);
  const altitudeArc = createArcBetweenVectors(observer, 26, horizon, sunlightDirection, input.solarAltitudeDeg);
  const zenithDistanceArc = createArcBetweenVectors(observer, 38, observerRadius, sunlightDirection, input.zenithDistanceDeg);

  return {
    center: CENTER,
    earthRadius: EARTH_RADIUS,
    values: input,
    points: {
      center: CENTER,
      observer,
      subsolarPoint,
      zenith
    },
    vectors: {
      observerRadius,
      localVertical: observerRadius,
      horizon,
      sunlightDirection,
      sunlightPerpendicular
    },
    lines: {
      observerRadius: {
        start: CENTER,
        end: observer
      },
      horizon: {
        start: add(observer, scale(horizon, -LINE_EXTENSION)),
        end: add(observer, scale(horizon, LINE_EXTENSION))
      },
      localVertical: {
        start: observer,
        end: zenith
      },
      sunlight: {
        start: add(observer, scale(sunlightDirection, -LINE_EXTENSION * 1.3)),
        end: add(observer, scale(sunlightDirection, LINE_EXTENSION * 1.3))
      },
      subsolarRadius: {
        start: CENTER,
        end: subsolarPoint
      }
    },
    arcs: {
      latitude: latitudeArc,
      declination: declinationArc,
      altitude: altitudeArc,
      zenithDistance: zenithDistanceArc
    }
  };
}

export function dot(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y;
}

export function length(vector: Vector): number {
  return Math.hypot(vector.x, vector.y);
}

export function scale(vector: Vector, scalar: number): Vector {
  return { x: vector.x * scalar, y: vector.y * scalar };
}

export function add(point: Point, vector: Vector): Point {
  return { x: point.x + vector.x, y: point.y + vector.y };
}

function unitFromLatitude(latitudeDeg: number): Vector {
  const angleRad = (latitudeDeg * Math.PI) / 180;
  return {
    x: Math.cos(angleRad),
    y: -Math.sin(angleRad)
  };
}

function perpendicularClockwise(vector: Vector): Vector {
  return {
    x: vector.y,
    y: -vector.x
  };
}

function createArcBetweenVectors(center: Point, radius: number, startVector: Vector, endVector: Vector, valueDeg: number): AngleArc {
  return createArc(center, radius, vectorAngleDeg(startVector), vectorAngleDeg(endVector), valueDeg);
}

function createArc(center: Point, radius: number, startAngleDeg: number, endAngleDeg: number, valueDeg: number): AngleArc {
  const start = pointOnArc(center, radius, startAngleDeg);
  const end = pointOnArc(center, radius, endAngleDeg);
  const delta = normalizeDeltaDeg(endAngleDeg - startAngleDeg);
  const largeArcFlag = Math.abs(delta) > 180 ? 1 : 0;
  const sweepFlag = delta >= 0 ? 0 : 1;
  const labelPoint = pointOnArc(center, radius + 13, startAngleDeg + delta / 2);

  return {
    center,
    radius,
    startAngleDeg,
    endAngleDeg,
    valueDeg,
    path: `M ${formatCoord(start.x)} ${formatCoord(start.y)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${formatCoord(end.x)} ${formatCoord(end.y)}`,
    labelPoint
  };
}

function pointOnArc(center: Point, radius: number, angleDeg: number): Point {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y - radius * Math.sin(angleRad)
  };
}

function vectorAngleDeg(vector: Vector): number {
  return (Math.atan2(-vector.y, vector.x) * 180) / Math.PI;
}

function normalizeDeltaDeg(deltaDeg: number): number {
  let normalized = deltaDeg;
  while (normalized > 180) normalized -= 360;
  while (normalized <= -180) normalized += 360;
  return normalized;
}

function formatCoord(value: number): string {
  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}
