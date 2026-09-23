export interface Point {
  x: number;
  y: number;
}

export interface LongitudeDiagramInput {
  longitudeDeg: number;
  utcMinutesAfterMidnight: number;
  equationOfTimeMinutes: number;
}

export interface LongitudeDiagramGeometry {
  center: Point;
  earthRadius: number;
  values: {
    longitudeDeg: number;
    utcMinutesAfterMidnight: number;
    equationOfTimeMinutes: number;
    greenwichSolarNoonUtcMinutes: number;
    solarNoonOffsetMinutes: number;
    direction: 'east' | 'west' | 'prime-meridian';
  };
  lines: {
    primeMeridian: { start: Point; end: Point };
    observerMeridian: { start: Point; end: Point };
    sunlight: { start: Point; end: Point };
  };
  arcs: {
    longitude: AngleArc;
  };
  points: {
    primeLabel: Point;
    observerLabel: Point;
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
const PRIME_MERIDIAN_ANGLE_DEG = -90;

export function buildLongitudeDiagramGeometry(input: LongitudeDiagramInput): LongitudeDiagramGeometry {
  const longitudeDeg = normalizeLongitudeDeg(input.longitudeDeg);
  const observerAngleDeg = longitudeToDiagramAngleDeg(longitudeDeg);
  const greenwichSolarNoonUtcMinutes = 720 - input.equationOfTimeMinutes;
  const solarNoonOffsetMinutes = normalizeClockDifferenceMinutes(
    input.utcMinutesAfterMidnight - greenwichSolarNoonUtcMinutes
  );
  const direction = longitudeDeg > 0 ? 'east' : longitudeDeg < 0 ? 'west' : 'prime-meridian';

  return {
    center: CENTER,
    earthRadius: EARTH_RADIUS,
    values: {
      longitudeDeg,
      utcMinutesAfterMidnight: input.utcMinutesAfterMidnight,
      equationOfTimeMinutes: input.equationOfTimeMinutes,
      greenwichSolarNoonUtcMinutes,
      solarNoonOffsetMinutes,
      direction
    },
    lines: {
      primeMeridian: {
        start: CENTER,
        end: pointOnCircle(CENTER, EARTH_RADIUS, PRIME_MERIDIAN_ANGLE_DEG)
      },
      observerMeridian: {
        start: CENTER,
        end: pointOnCircle(CENTER, EARTH_RADIUS, observerAngleDeg)
      },
      sunlight: {
        start: { x: CENTER.x - EARTH_RADIUS - 24, y: CENTER.y },
        end: { x: CENTER.x + EARTH_RADIUS + 24, y: CENTER.y }
      }
    },
    arcs: {
      longitude: createArc(CENTER, 40, PRIME_MERIDIAN_ANGLE_DEG, observerAngleDeg, Math.abs(longitudeDeg))
    },
    points: {
      primeLabel: pointOnCircle(CENTER, EARTH_RADIUS + 18, PRIME_MERIDIAN_ANGLE_DEG),
      observerLabel: pointOnCircle(CENTER, EARTH_RADIUS + 18, observerAngleDeg)
    }
  };
}

export function normalizeClockDifferenceMinutes(minutes: number): number {
  let normalized = minutes;
  while (normalized > 720) normalized -= 1440;
  while (normalized <= -720) normalized += 1440;
  return normalized;
}

export function normalizeLongitudeDeg(longitudeDeg: number): number {
  let normalized = longitudeDeg;
  while (normalized >= 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function longitudeToDiagramAngleDeg(longitudeDeg: number): number {
  return PRIME_MERIDIAN_ANGLE_DEG + longitudeDeg;
}

function createArc(center: Point, radius: number, startAngleDeg: number, endAngleDeg: number, valueDeg: number): AngleArc {
  const start = pointOnCircle(center, radius, startAngleDeg);
  const end = pointOnCircle(center, radius, endAngleDeg);
  const delta = normalizeLongitudeDeg(endAngleDeg - startAngleDeg);
  const largeArcFlag = Math.abs(delta) > 180 ? 1 : 0;
  const sweepFlag = delta >= 0 ? 1 : 0;
  const labelPoint = pointOnCircle(center, radius + 14, startAngleDeg + delta / 2);

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

function pointOnCircle(center: Point, radius: number, angleDeg: number): Point {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y + radius * Math.sin(angleRad)
  };
}

function formatCoord(value: number): string {
  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}
