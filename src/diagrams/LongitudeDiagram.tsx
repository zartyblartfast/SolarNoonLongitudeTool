import { buildLongitudeDiagramGeometry } from './longitudeGeometry';

export interface LongitudeDiagramProps {
  longitudeDeg: number;
  utcMinutesAfterMidnight: number;
  equationOfTimeMinutes: number;
}

export function LongitudeDiagram({
  longitudeDeg,
  utcMinutesAfterMidnight,
  equationOfTimeMinutes
}: LongitudeDiagramProps) {
  const geometry = buildLongitudeDiagramGeometry({
    longitudeDeg,
    utcMinutesAfterMidnight,
    equationOfTimeMinutes
  });
  const titleId = 'longitude-diagram-title';
  const descId = 'longitude-diagram-desc';
  const longitudeLabel = formatLongitude(geometry.values.longitudeDeg);
  const beforeOrAfter = geometry.values.solarNoonOffsetMinutes < 0 ? 'before' : 'after';

  return (
    <figure className="longitude-diagram-block">
      <svg
        className="longitude-diagram"
        viewBox="0 0 280 280"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
      >
        <title id={titleId}>Longitude diagram</title>
        <desc id={descId}>
          Polar-view diagram showing the prime meridian, observer meridian, longitude angle, sunlight,
          and the UTC solar-noon time difference used to explain longitude.
        </desc>

        <g data-testid="longitude-earth" className="longitude-layer geometry">
          <circle cx={geometry.center.x} cy={geometry.center.y} r={geometry.earthRadius} className="longitude-earth" />
          <circle cx={geometry.center.x} cy={geometry.center.y} r="3" className="longitude-center" />
        </g>

        <g className="longitude-layer sunlight">
          <line
            x1={geometry.lines.sunlight.start.x}
            y1={geometry.lines.sunlight.start.y}
            x2={geometry.lines.sunlight.end.x}
            y2={geometry.lines.sunlight.end.y}
            className="longitude-sunlight"
          />
        </g>

        <g className="longitude-layer meridians">
          <line
            data-testid="prime-meridian"
            x1={geometry.lines.primeMeridian.start.x}
            y1={geometry.lines.primeMeridian.start.y}
            x2={geometry.lines.primeMeridian.end.x}
            y2={geometry.lines.primeMeridian.end.y}
            className="prime-meridian"
          />
          <line
            data-testid="observer-meridian"
            x1={geometry.lines.observerMeridian.start.x}
            y1={geometry.lines.observerMeridian.start.y}
            x2={geometry.lines.observerMeridian.end.x}
            y2={geometry.lines.observerMeridian.end.y}
            className="observer-meridian"
          />
        </g>

        <g className="longitude-layer angle-arcs">
          <path data-testid="longitude-arc" d={geometry.arcs.longitude.path} className="longitude-arc" />
        </g>

        <g className="longitude-layer labels">
          <text x={geometry.points.primeLabel.x - 28} y={geometry.points.primeLabel.y - 4}>Prime meridian</text>
          <text x={geometry.points.observerLabel.x - 22} y={geometry.points.observerLabel.y + 16}>Observer meridian</text>
          <text x={geometry.arcs.longitude.labelPoint.x - 28} y={geometry.arcs.longitude.labelPoint.y}>λ {longitudeLabel}</text>
          <text x="18" y="252">15° per hour · 1° every four minutes</text>
        </g>
      </svg>
      <figcaption className="diagram-text-alternative">
        <strong>Longitude using UTC solar-noon time.</strong> This observation occurred {Math.abs(geometry.values.solarNoonOffsetMinutes).toFixed(2)} minutes {beforeOrAfter} Greenwich solar noon, placing the result at {longitudeLabel}.
      </figcaption>
    </figure>
  );
}

function formatLongitude(longitudeDeg: number): string {
  const hemisphere = longitudeDeg >= 0 ? 'E' : 'W';
  return `${Math.abs(longitudeDeg).toFixed(2)}° ${hemisphere}`;
}
