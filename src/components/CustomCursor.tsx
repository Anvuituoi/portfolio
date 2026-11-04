import { useEffect, useRef } from 'react';
import { flight } from '../flight/store';

/**
 * Desktop-only cursor: a dot plus a tracking ring with eased follow.
 * Disabled on touch devices and when motion is off; the native cursor returns then.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('has-cursor');
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let state = '';
    let hidden = true;

    const setState = (s: string) => {
      if (s === state || !ring.current) return;
      state = s;
      ring.current.dataset.state = s;
      if (label.current) label.current.textContent = s === 'project' ? 'VIEW PROJECT' : s === 'view' ? 'VIEW' : '';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      flight.px = (x / innerWidth) * 2 - 1;
      flight.py = (y / innerHeight) * 2 - 1;
      if (hidden && dot.current && ring.current) {
        hidden = false;
        dot.current.style.opacity = ring.current.style.opacity = '1';
      }
      const t = (e.target as Element | null)?.closest?.('[data-cursor], a, button, [role="button"]') as HTMLElement | null;
      let s = t ? t.dataset.cursor ?? 'link' : '';
      if (!s) {
        const r = flight.aircraftRect;
        if (r && flight.t < 1.2 && x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) s = 'aircraft';
      }
      setState(s);
    };
    const onLeave = () => {
      hidden = true;
      if (dot.current && ring.current) dot.current.style.opacity = ring.current.style.opacity = '0';
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div className="cursor-ring" ref={ring} style={{ opacity: 0 }}>
        <span ref={label} />
      </div>
      <div className="cursor-dot" ref={dot} style={{ opacity: 0 }} />
    </div>
  );
}
