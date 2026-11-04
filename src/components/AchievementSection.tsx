import { useEffect, useRef, useState } from 'react';
import { achievements, press } from '../content/achievements';
import { useModes } from '../flight/modes';

/** Count up to a real year once, when visible. Only real numbers are animated. */
function Year({ to, go }: { to: number; go: boolean }) {
  const [v, setV] = useState(go ? to : to - 12);
  useEffect(() => {
    if (!go) return;
    let raf = 0;
    const t0 = performance.now();
    const from = to - 12;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 900);
      setV(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, to]);
  return <>{v}</>;
}

// Positions of each navigation fix on the desktop star chart (percent of the chart box).
const FIXES: [number, number][] = [
  [8, 18], [36, 4], [64, 26], [88, 8], [8, 64], [36, 80], [62, 62], [88, 78],
];

/** Chapter 06. Achievements as celestial navigation fixes, joined to the route when they enter view. */
export function AchievementSection() {
  const { motion, compact } = useModes();
  const ref = useRef<HTMLOListElement>(null);
  const [seen, setSeen] = useState(!motion);

  useEffect(() => {
    if (!motion || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [motion]);

  return (
    <section id="cruise" className="cruise content section-pad on-dark" data-chapters="5" aria-labelledby="cruise-title">
      <div className="cruise-head">
        <p className="chapter-tag">06 · Cruise · FL350 → FL410</p>
        <h2 id="cruise-title" className="section-h display">
          Achievements &amp; Milestones
        </h2>
        <p className="cruise-sub serif">Fixed points, used to navigate.</p>
      </div>
      <div className={`starchart ${compact ? 'starchart-list' : ''} ${seen ? 'is-seen' : ''}`} data-route="fixes">
        {!compact && (
          <svg className="starchart-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="star-route" d="M -2 92 C 30 88, 60 98, 102 80" pathLength={1} />
            {FIXES.map(([x, y], i) => (
              <line key={i} className="star-line" x1={x} y1={y + 2} x2={x} y2={90 - (x / 100) * 6} pathLength={1} style={{ transitionDelay: `${0.2 + i * 0.12}s` }} />
            ))}
          </svg>
        )}
        <ol ref={ref} className="fixes">
          {achievements.map((a, i) => (
            <li
              key={a.title}
              className="fix"
              style={
                compact
                  ? undefined
                  : {
                      left: `${FIXES[i][0]}%`,
                      top: `${FIXES[i][1]}%`,
                      transitionDelay: `${i * 0.12}s`,
                      // fixes near the right edge hang their label to the left of the star
                      ...(FIXES[i][0] > 60 ? { marginLeft: 'calc(-1 * min(250px, 22vw))', textAlign: 'right' as const } : {}),
                    }
              }
              data-side={FIXES[i] && FIXES[i][0] > 60 ? 'left' : 'right'}
            >
              <span className="fix-star" aria-hidden="true" />
              <span className="fix-rank mono">{a.rank}</span>
              <span className="fix-title serif">{a.title}</span>
              {(a.year || a.where) && (
                <span className="fix-meta mono">
                  {a.year && <Year to={a.year} go={seen} />}
                  {a.year && a.where && ' · '}
                  {a.where}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="press">
        <h3 className="press-h mono">In the media</h3>
        <ul className="press-list">
          {press.map((p) => (
            <li key={p.href}>
              <span className="press-outlet mono">{p.outlet}</span>
              <a className="press-link serif link-underline" href={p.href} target="_blank" rel="noopener noreferrer" lang={p.lang}>
                {p.headline}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
