import { useEffect, useRef, useState } from 'react';
import { journey } from '../content/journey';
import { T } from './Mark';
import { useModes } from '../flight/modes';
import { ScrollTrigger } from '../flight/scroll';

/**
 * Chapter 04. The journey is a flight log along the runway: each milestone passes as a runway
 * distance marker while the aircraft accelerates; at rotation the route lifts off.
 */
export function JourneyTimeline() {
  const { live } = useModes();
  const wrap = useRef<HTMLElement>(null);
  const [active, setActive] = useState(live ? -1 : journey.length);
  const [rotated, setRotated] = useState(!live);
  const speed = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!live) return;
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: ({ progress: p }) => {
        // milestones are passed during the take-off roll (0.05 – 0.68), rotation at ~0.7
        const idx = Math.floor(((p - 0.05) / 0.63) * journey.length);
        setActive(Math.max(-1, Math.min(journey.length, idx)));
        setRotated(p > 0.7);
        if (speed.current) {
          // decorative ground speed in knots, accelerating to rotation speed
          const kt = Math.round(Math.min(1, Math.max(0, (p - 0.02) / 0.68)) ** 1.6 * 150);
          speed.current.textContent = String(kt).padStart(3, '0');
        }
      },
    });
    return () => st.kill();
  }, [live]);

  return (
    <section
      id="takeoff"
      ref={wrap}
      className={`takeoff content ${live ? 'takeoff-live' : ''}`}
      data-chapters="3"
      aria-labelledby="takeoff-title"
    >
      <div className="takeoff-stage section-pad">
        <div className="takeoff-col">
          <p className="chapter-tag">04 · Takeoff · FL000 → FL100</p>
          <h2 id="takeoff-title" className="section-h display">
            My Journey
          </h2>
          <ol className="runway-log">
            {journey.map((m, i) => {
              const state = i < active ? 'passed' : i === active ? 'current' : 'ahead';
              return (
                <li key={i} className={`runway-mark is-${state}`}>
                  <span className="runway-board" aria-hidden="true">
                    {journey.length - i}
                  </span>
                  <span className="runway-text">
                    <span className="runway-date mono">
                      <T v={m.date} />
                    </span>
                    <span className="runway-title">
                      <T v={m.title} />
                      {m.place && <span className="runway-place">, <T v={m.place} /></span>}
                    </span>
                    {m.detail && (
                      <span className="runway-detail">
                        <T v={m.detail} />
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        {live && (
          <div className="takeoff-instruments mono" aria-hidden="true">
            <span>GS <span ref={speed}>000</span> KT</span>
            <span className={rotated ? 'is-on' : ''}>{rotated ? 'ROTATE · POSITIVE CLIMB' : 'TAKE-OFF ROLL'}</span>
          </div>
        )}
      </div>
      <div className="route-lift" data-route="lift" aria-hidden="true" />
    </section>
  );
}
