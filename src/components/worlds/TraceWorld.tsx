import { useMemo, useRef } from 'react';
import { useModes } from '../../flight/modes';
import { useScrub } from '../../lib/useScrub';

/** Waypoint 4. A flight-recorder trace that turns into lines of research. */
export function TraceWorld({ lines }: { lines: string[] }) {
  const { live } = useModes();
  const wrap = useRef<HTMLDivElement>(null);
  const paths = useRef<SVGPathElement[]>([]);
  const labels = useRef<SVGGElement[]>([]);

  const traces = useMemo(() => {
    let seed = 21;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return lines.map((_, li) => {
      const base = 50 + li * 60;
      let d = `M 20 ${base}`;
      let y = base;
      for (let x = 20; x <= 560; x += 10) {
        // a noisy channel that flattens into a clean baseline toward the right
        const calm = Math.max(0, (x - 300) / 260);
        y = base + (rand() - 0.5) * 34 * (1 - calm) + Math.sin(x * 0.05 + li) * 6 * (1 - calm);
        d += ` L ${x} ${y.toFixed(1)}`;
      }
      return d;
    });
  }, [lines]);

  useScrub(
    wrap,
    live,
    (p) => {
      paths.current.forEach((el, i) => {
        if (!el) return;
        const len = el.getTotalLength();
        const k = Math.min(1, Math.max(0, p * 1.4 - i * 0.1));
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len * (1 - k)}`;
      });
      labels.current.forEach((el, i) => {
        if (el) el.style.opacity = String(Math.min(1, Math.max(0, (p - 0.55 - i * 0.08) * 4)));
      });
    },
    { start: 'top 80%', end: 'center 40%' },
  );

  return (
    <div ref={wrap} className="world world-trace" aria-hidden="true">
      <svg viewBox="0 0 600 280" className="trace-svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3A0F34" strokeWidth="0.3" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="600" height="280" fill="url(#grid)" />
        {traces.map((d, i) => (
          <path key={i} ref={(el) => { if (el) paths.current[i] = el; }} d={d} fill="none" stroke={i % 2 ? '#3A0F34' : '#8a5a00'} strokeWidth="1.4" />
        ))}
        {lines.map((l, i) => (
          <g key={l} ref={(el) => { if (el) labels.current[i] = el; }} style={{ opacity: live ? 0 : 1 }}>
            <text x="330" y={44 + i * 60} className="trace-label">
              CH{i + 1} · {l.toUpperCase()}
            </text>
          </g>
        ))}
        <text x="20" y="272" className="trace-meta">FLIGHT RECORDER · CHANNELS 1–4 · ILLUSTRATIVE TRACE</text>
      </svg>
    </div>
  );
}
