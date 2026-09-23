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
