import { buildEarthContextGlobeGeometry } from './earthContextGlobeGeometry';

export interface EarthContextGlobeProps {
  observerLatitudeDeg: number;
  observerLongitudeDeg: number;
  subsolarLatitudeDeg: number;
  subsolarLongitudeDeg: number;
}

export function EarthContextGlobe({
  observerLatitudeDeg,
  observerLongitudeDeg,
  subsolarLatitudeDeg,
  subsolarLongitudeDeg
}: EarthContextGlobeProps) {
  const geometry = buildEarthContextGlobeGeometry({
    observerLatitudeDeg,
    observerLongitudeDeg,
    subsolarLatitudeDeg,
    subsolarLongitudeDeg
  });
  const titleId = 'earth-context-globe-title';
  const descId = 'earth-context-globe-desc';

  return (
    <figure className="earth-context-globe-block">
      <svg
        className="earth-context-globe"
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
      >
        <title id={titleId}>Earth context globe</title>
        <desc id={descId}>
          Orthographic globe showing the estimated observer location and the subsolar point for the
          calculated solar-noon observation.
        </desc>
        <path data-testid="earth-context-outline" d={geometry.outlinePath} className="earth-context-outline" />
        <path data-testid="earth-context-land" d={geometry.landPath} className="earth-context-land" />
        <path data-testid="earth-context-land-outline" d={geometry.landPath} className="earth-context-land-outline" />
        <path data-testid="earth-context-graticule" d={geometry.graticulePath} className="earth-context-graticule" />
        {geometry.points.observer.visible ? (
          <circle
            data-testid="earth-context-observer"
            cx={geometry.points.observer.x}
            cy={geometry.points.observer.y}
            r="5"
            className="earth-context-observer"
          />
        ) : null}
        {geometry.points.subsolar.visible ? (
          <circle
            data-testid="earth-context-subsolar"
            cx={geometry.points.subsolar.x}
            cy={geometry.points.subsolar.y}
            r="5"
            className="earth-context-subsolar"
          />
        ) : null}
      </svg>
      <figcaption className="earth-context-legend">
        <span><i className="legend-dot observer" />Observer estimate</span>
        <span><i className="legend-dot subsolar" />Subsolar point</span>
      </figcaption>
    </figure>
  );
}
