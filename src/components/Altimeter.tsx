import { useEffect, useRef, useState } from 'react';
import { chapters, flightLevel } from '../flight/plan';
import { flight, onFlight } from '../flight/store';
import { flyTo } from '../flight/scroll';

const fl = (n: number) => `FL${String(n).padStart(3, '0')}`;

/** The altimeter is both the progress indicator and the main navigation. */
export function Altimeter() {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const flRef = useRef<HTMLSpanElement>(null);
  const flRef2 = useRef<HTMLSpanElement>(null);
  const pointer = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      onFlight(() => {
        const c = Math.min(chapters.length - 1, Math.floor(flight.t));
        setCurrent((p) => (p === c ? p : c));
        const text = c === 7 && flight.t > 7.85 ? 'HORIZON' : fl(flightLevel(flight.t));
        if (flRef.current && flRef.current.textContent !== text) flRef.current.textContent = text;
        if (flRef2.current && flRef2.current.textContent !== text) flRef2.current.textContent = text;
        if (pointer.current) pointer.current.style.top = `${(1 - flightLevel(flight.t) / 410) * 100}%`;
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    flyTo(id);
  };

  const list = (
    <ol>
      {chapters.map((c, i) => (
        <li key={c.id}>
          <a href={`#${c.id}`} onClick={go(c.id)} aria-current={i === current ? 'step' : undefined} data-cursor="link">
            <span className="alt-name">{c.phase}</span>
            <span className="alt-num">{c.num}</span>
            <span className="alt-tick" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <nav className="altimeter" aria-label="Flight chapters">
        <div className="alt-readout" aria-hidden="true">
          <span className="alt-fl" ref={flRef}>
            FL000
          </span>
          <span className="alt-label">{chapters[current].phase}</span>
        </div>
        <div className="alt-row">
          <div className="alt-nav">{list}</div>
          <div className="alt-tape" aria-hidden="true">
            <div className="alt-pointer" ref={pointer} style={{ top: '100%' }} />
          </div>
        </div>
      </nav>

      <nav className="alt-compact" aria-label="Flight chapters (compact)">
        {open && <div className="alt-sheet on-dark alt-nav" id="alt-sheet">{list}</div>}
        <button
          type="button"
          className="alt-pill on-dark"
          aria-expanded={open}
          aria-controls="alt-sheet"
          onClick={() => setOpen((o) => !o)}
        >
          <span ref={flRef2} aria-hidden="true">
            FL000
          </span>
          <span>
            {chapters[current].num} · {chapters[current].phase}
          </span>
          <span className="sr-only">, open chapter list</span>
        </button>
      </nav>
    </>
  );
}
