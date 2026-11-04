/**
 * Illustrative chart. Values are invented to show the kind of reporting built,
 * and are labelled as such. They are not employer data.
 */
const CHANNELS = ['OTA', 'GDS', 'Wholesale', 'Corporate', 'Agent'];
const NORTH = [62, 38, 54, 30, 71];
const SOUTH = [55, 44, 47, 36, 64];

export function MockChart({ light = false }: { light?: boolean }) {
  const max = 80;
  const ink = light ? '#3A0F34' : '#E5E4E2';
  return (
    <figure className="mock-chart">
      <figcaption className="mock-label">
        <strong>Illustrative data</strong> — not real figures. Channel index by region, North vs South.
      </figcaption>
      <svg viewBox="0 0 300 140" role="img" aria-label="Illustrative bar chart comparing an index for five channels, North and South. Invented values.">
        {CHANNELS.map((c, i) => {
          const x = 14 + i * 58;
          const hn = (NORTH[i] / max) * 100;
          const hs = (SOUTH[i] / max) * 100;
          return (
            <g key={c}>
              <rect x={x} y={112 - hn} width="16" height={hn} fill="#EAAA00" />
              <rect x={x + 19} y={112 - hs} width="16" height={hs} fill={light ? '#3A0F34' : '#E5E4E2'} opacity={light ? 1 : 0.85} />
              <text x={x + 17} y="130" textAnchor="middle" fontSize="9" fill={ink} fontFamily="'IBM Plex Mono'">
                {c}
              </text>
            </g>
          );
        })}
        <line x1="8" x2="296" y1="112.5" y2="112.5" stroke={ink} strokeWidth="0.75" />
      </svg>
      <div className="mock-legend mono">
        <span>
          <i style={{ background: '#EAAA00', outline: light ? '1px solid #3A0F34' : 'none' }} /> North
        </span>
        <span>
          <i style={{ background: light ? '#3A0F34' : '#E5E4E2' }} /> South
        </span>
      </div>
    </figure>
  );
}
