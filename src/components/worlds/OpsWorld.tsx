import { useEffect, useRef, useState } from 'react';
import { useModes } from '../../flight/modes';
import { useScrub } from '../../lib/useScrub';
import { MockChart } from '../MockChart';

const ROWS: [string, string, string][] = [
  ['WPT01', 'SALES PROCESS', 'BOARDING'],
  ['WPT02', 'CHANNEL POLICY', 'ON TIME'],
  ['WPT03', 'FIELD PLAYBOOKS', 'ON TIME'],
  ['WPT04', 'REVENUE PAX YIELD', 'DEPARTED'],
  ['WPT05', 'KPI DASHBOARDS', 'DEPARTED'],
  ['WPT06', 'CROSS TEAM COORD', 'ON TIME'],
  ['WPT07', 'NEW ROUTE SUPPORT', 'BOARDING'],
];
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** A split-flap row that flips through characters before settling. */
function Flap({ text, go, delay }: { text: string; go: boolean; delay: number }) {
  const [shown, setShown] = useState(go ? text : text.replace(/[^ ]/g, ' '));
  useEffect(() => {
    if (!go) return;
    let frame = 0;
    const total = 16 + delay;
    const id = setInterval(() => {
      frame++;
      setShown(
        [...text]
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            return frame > total - 6 + i * 0.6 ? ch : GLYPHS[(frame * 7 + i * 13) % GLYPHS.length];
          })
          .join(''),
      );
      if (frame > total + text.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [go, text, delay]);
  return (
    // Words are grouped and spaces become narrow gaps, so a row reads as words, not single letters.
    <span className="flap" role="img" aria-label={text.trim()}>
      {[...shown].map((c, i) =>
        text[i] === ' ' ? (
          <span key={i} className="flap-gap" aria-hidden="true" />
        ) : (
          <span key={i} className="flap-cell" aria-hidden="true">
            {c}
          </span>
        ),
      )}
    </span>
  );
}

export function OpsWorld() {
  const { live, motion } = useModes();
  const ref = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(!motion);

  useScrub(ref, live, (p) => {
    if (p > 0.2 && !go) setGo(true);
    // the one horizontal sequence on the site: the board drifts sideways as you climb
    if (strip.current) strip.current.style.transform = `translate3d(${(0.5 - p) * 18}%, 0, 0)`;
  });

  return (
    <div ref={ref} className="world world-ops on-dark" aria-hidden="true">
      <div className="ops-board-wrap">
        <div ref={strip} className="ops-board">
          <div className="ops-board-head mono">
            <span>Departures · illustrative board</span>
            <span>Status</span>
          </div>
          {ROWS.map((r, i) => (
            <div key={r[0]} className="ops-row">
              <span className="ops-code mono">{r[0]}</span>
              <Flap text={r[1].padEnd(17, ' ')} go={go} delay={i * 3} />
              <span className={`ops-status mono ${r[2] === 'BOARDING' ? 'is-gold' : ''}`}>{r[2]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ops-lower">
        <svg className="ops-network" viewBox="0 0 320 180">
          {[
            [40, 120, 150, 50], [150, 50, 270, 70], [150, 50, 230, 150], [40, 120, 120, 160], [120, 160, 230, 150], [150, 50, 60, 30],
          ].map(([a, b, c, d], i) => (
            <path key={i} className="ops-arc" d={`M${a} ${b} Q ${(a + c) / 2} ${Math.min(b, d) - 40} ${c} ${d}`} style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
          {[[40, 120], [150, 50], [270, 70], [230, 150], [120, 160], [60, 30]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 1 ? 5 : 3} className={i === 1 ? 'ops-hub' : 'ops-node'} />
          ))}
          <text x="6" y="174" className="ops-net-label">ABSTRACT NETWORK · NOT A ROUTE MAP</text>
        </svg>
        <MockChart />
      </div>
    </div>
  );
}
