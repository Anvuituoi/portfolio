import { useEffect, useRef } from 'react';
import { flight, onFlight } from '../flight/store';
import { skyAt, sunAt } from '../flight/plan';

/** The sky is DOM, so it exists with or without WebGL. Altitude sets the palette. */
export function Sky({ poster }: { poster?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const sun = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let last = -1;
    const paint = () => {
      const t = poster ?? flight.t;
      if (Math.abs(t - last) < 0.0005) return;
      last = t;
      const [a, b, c] = skyAt(t);
      if (ref.current) ref.current.style.background = `linear-gradient(180deg, ${a} 0%, ${b} 55%, ${c} 100%)`;
      if (sun.current) sun.current.style.opacity = String(sunAt(t));
    };
    paint();
    return onFlight(paint);
  }, [poster]);
  return (
    <div className="sky" ref={ref} aria-hidden="true">
      <div className="sky-sun" ref={sun} />
    </div>
  );
}
