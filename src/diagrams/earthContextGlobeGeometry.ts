import { geoGraticule10, geoOrthographic, geoPath, type GeoProjection } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import type { GeometryObject, Topology } from 'topojson-specification';
import land110m from 'world-atlas/land-110m.json';

export interface EarthContextGlobeInput {
  observerLatitudeDeg: number;
  observerLongitudeDeg: number;
  subsolarLatitudeDeg: number;
  subsolarLongitudeDeg: number;
}

export interface GlobePoint {
  x: number;
  y: number;
  visible: boolean;
  label: string;
  latitudeDeg: number;
  longitudeDeg: number;
}

export interface EarthContextGlobeGeometry {
  width: number;
  height: number;
  radius: number;
  centerLatitudeDeg: number;
  centerLongitudeDeg: number;
  outlinePath: string;
  landPath: string;
  graticulePath: string;
  points: {
    observer: GlobePoint;
    subsolar: GlobePoint;
  };
}

const WIDTH = 280;
const HEIGHT = 280;
const RADIUS = 112;
const landTopology = land110m as unknown as Topology<{ land: GeometryObject }>;
const landFeatureCollection = feature(landTopology, landTopology.objects.land) as FeatureCollection<Geometry>;

export function buildEarthContextGlobeGeometry(input: EarthContextGlobeInput): EarthContextGlobeGeometry {
  const centerLatitudeDeg = (input.observerLatitudeDeg + input.subsolarLatitudeDeg) / 2;
  const centerLongitudeDeg = midpointLongitudeDeg(input.observerLongitudeDeg, input.subsolarLongitudeDeg);
  const projection = geoOrthographic()
    .translate([WIDTH / 2, HEIGHT / 2])
    .scale(RADIUS)
    .rotate([-centerLongitudeDeg, -centerLatitudeDeg])
    .clipAngle(90);
  const path = geoPath(projection);
  const outlinePath = path({ type: 'Sphere' }) ?? '';
  const landPath = path(landFeatureCollection) ?? '';
  const graticulePath = path(geoGraticule10()) ?? '';

  return {
    width: WIDTH,
    height: HEIGHT,
    radius: RADIUS,
    centerLatitudeDeg,
    centerLongitudeDeg,
    outlinePath,
    landPath,
    graticulePath,
    points: {
      observer: projectPoint(projection, input.observerLongitudeDeg, input.observerLatitudeDeg, 'Observer estimate'),
      subsolar: projectPoint(projection, input.subsolarLongitudeDeg, input.subsolarLatitudeDeg, 'Subsolar point')
    }
  };
}

function projectPoint(
  projection: GeoProjection,
  longitudeDeg: number,
  latitudeDeg: number,
  label: string
): GlobePoint {
  const projected = projection([longitudeDeg, latitudeDeg]);

  return {
    x: projected?.[0] ?? Number.NaN,
    y: projected?.[1] ?? Number.NaN,
    visible: projected !== null,
    label,
    latitudeDeg,
    longitudeDeg
  };
}

function midpointLongitudeDeg(a: number, b: number): number {
  const aRad = (a * Math.PI) / 180;
  const bRad = (b * Math.PI) / 180;
  const x = Math.cos(aRad) + Math.cos(bRad);
  const y = Math.sin(aRad) + Math.sin(bRad);
  if (x === 0 && y === 0) return normalizeLongitudeDeg(a);
  return normalizeLongitudeDeg((Math.atan2(y, x) * 180) / Math.PI);
}

function normalizeLongitudeDeg(longitudeDeg: number): number {
  let normalized = longitudeDeg;
  while (normalized >= 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}
