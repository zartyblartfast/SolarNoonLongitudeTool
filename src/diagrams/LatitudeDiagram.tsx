import { buildLatitudeDiagramGeometry } from './latitudeGeometry';

export interface LatitudeDiagramProps {
  latitudeDeg: number;
  declinationDeg: number;
  solarAltitudeDeg: number;
  zenithDistanceDeg: number;
}

export function LatitudeDiagram({
  latitudeDeg,
  declinationDeg,
  solarAltitudeDeg,
  zenithDistanceDeg
}: LatitudeDiagramProps) {
  const geometry = buildLatitudeDiagramGeometry({
    latitudeDeg,
    declinationDeg,
    solarAltitudeDeg,
    zenithDistanceDeg
  });

  const titleId = 'latitude-diagram-title';
  const descId = 'latitude-diagram-desc';

  return (
    <figure className="latitude-diagram-block">
      <svg
        className="latitude-diagram"
        viewBox="0 0 280 280"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
      >
        <title id={titleId}>Latitude diagram</title>
        <desc id={descId}>
          Meridian-section diagram showing Earth, observer, true horizon, sunlight, solar declination,
          solar altitude, and zenith distance for the current solar-noon observation.
        </desc>

        <g data-testid="latitude-earth" className="diagram-layer geometry">
          <circle cx={geometry.center.x} cy={geometry.center.y} r={geometry.earthRadius} className="latitude-earth" />
          <line x1="48" y1={geometry.center.y} x2="232" y2={geometry.center.y} className="diagram-equator" />
          <line x1={geometry.center.x} y1="48" x2={geometry.center.x} y2="232" className="diagram-axis" />
        </g>

        <g data-testid="latitude-sunlight" className="diagram-layer sun-rays">
          <line
            x1={geometry.lines.sunlight.start.x}
            y1={geometry.lines.sunlight.start.y}
            x2={geometry.lines.sunlight.end.x}
            y2={geometry.lines.sunlight.end.y}
            className="diagram-sunlight"
          />
          <line
            x1={geometry.lines.subsolarRadius.start.x}
            y1={geometry.lines.subsolarRadius.start.y}
            x2={geometry.lines.subsolarRadius.end.x}
            y2={geometry.lines.subsolarRadius.end.y}
            className="diagram-declination"
          />
        </g>

        <g className="diagram-layer construction-lines">
          <line
            x1={geometry.lines.observerRadius.start.x}
            y1={geometry.lines.observerRadius.start.y}
            x2={geometry.lines.observerRadius.end.x}
            y2={geometry.lines.observerRadius.end.y}
            className="diagram-observer-radius"
          />
          <line
            data-testid="latitude-horizon"
            x1={geometry.lines.horizon.start.x}
            y1={geometry.lines.horizon.start.y}
            x2={geometry.lines.horizon.end.x}
            y2={geometry.lines.horizon.end.y}
            className="diagram-horizon"
          />
          <line
            x1={geometry.lines.localVertical.start.x}
            y1={geometry.lines.localVertical.start.y}
            x2={geometry.lines.localVertical.end.x}
            y2={geometry.lines.localVertical.end.y}
            className="diagram-local-vertical"
          />
        </g>

        <g className="diagram-layer markers">
          <circle
            data-testid="latitude-observer"
            cx={geometry.points.observer.x}
            cy={geometry.points.observer.y}
            r="5"
            className="diagram-observer"
          />
          <circle cx={geometry.points.subsolarPoint.x} cy={geometry.points.subsolarPoint.y} r="5" className="diagram-subsolar" />
        </g>

        <g className="diagram-layer labels">
          <text x="18" y="32">Latitude: {formatSigned(latitudeDeg)}°</text>
          <text x="18" y="52">Declination: {formatSigned(declinationDeg)}°</text>
          <text x="18" y="72">Altitude h: {formatNumber(solarAltitudeDeg)}°</text>
          <text x="18" y="92">Zenith distance z: {formatNumber(zenithDistanceDeg)}°</text>
        </g>
      </svg>
      <figcaption className="diagram-text-alternative">
        <strong>Latitude using the Sun’s altitude.</strong> Zenith distance is calculated as{' '}
        <span>z = 90° - h</span>, so this observation gives z = {formatNumber(zenithDistanceDeg)}°.
        With the Sun due north, latitude is solar declination minus zenith distance.
      </figcaption>
    </figure>
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : '−'}${formatNumber(Math.abs(value))}`;
}
