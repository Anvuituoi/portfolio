import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X } from 'lucide-react';
import { hero, lounge, skillGroups, greetings, type SkillGroup } from '../content/profile';
import { site } from '../content/site';
import { T } from './Mark';
import { ROOM, RoomArt, type RoomObject } from './RoomArt';
import { useModes } from '../flight/modes';
import { ScrollTrigger, lenis } from '../flight/scroll';
import { flight } from '../flight/store';
import { clamp, range, smooth } from '../flight/plan';
import { textOf } from '../content/markers';
import { MockChart } from './MockChart';

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/* ------------------------------ Hero (Chapter 01) ------------------------------ */

function HeroHeadline({ front = false }: { front?: boolean }) {
  // The front copy is aria-hidden and only shows the second line, so the aircraft sits between the two lines.
  if (front)
    return (
      <p className="hero-h1 display" aria-hidden="true">
        <span className="hero-l1" style={{ visibility: 'hidden' }}>
          {hero.headline[0]}
        </span>
        <span className="hero-l2">{hero.headline[1]}</span>
      </p>
    );
  return (
    <h1 id="gate-title" className="hero-h1 display" tabIndex={-1}>
      <span className="hero-l1">{hero.headline[0]}</span> <span className="hero-l2">{hero.headline[1]}</span>
    </h1>
  );
}

function HeroCopy() {
  return (
    <div className="hero-copy">
      <p className="hero-support serif">{hero.supporting}</p>
      <p className="hero-identity">
        <span className="hero-name display" lang="vi">
          <T v={site.person} />
        </span>
        <span className="hero-alias mono">{site.englishName}</span>
        <span className="hero-dims">
          {hero.dimensions.map((d, i) => (
            <span key={d}>
              {i > 0 && <span aria-hidden="true"> | </span>}
              {d}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}

/** Technical-drawing callouts projected from the live aircraft. Decorative. */
function DrawingLabels() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const svg = ref.current;
      if (svg) {
        const a = flight.anchors;
        const vis = 1 - range(flight.ts, 0.25, 0.7);
        svg.style.opacity = String(flight.sceneReady ? vis : 0);
        (['nose', 'fin', 'wing'] as const).forEach((k) => {
          const p = a[k];
          const g = svg.querySelector<SVGGElement>(`[data-k="${k}"]`);
          if (p && g) g.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const label = (k: string, dx: number, dy: number, a: string, b: string) => (
    <g data-k={k}>
      <circle r="3" fill="none" stroke="#3A0F34" />
      <line x1="0" y1="0" x2={dx} y2={dy} stroke="#3A0F34" strokeWidth="0.75" />
      <line x1={dx} y1={dy} x2={dx + (dx > 0 ? 70 : -70)} y2={dy} stroke="#3A0F34" strokeWidth="0.75" />
      <text x={dx + (dx > 0 ? 0 : -70)} y={dy - 8} className="draw-label">
        {a}
      </text>
      <text x={dx + (dx > 0 ? 0 : -70)} y={dy + 14} className="draw-label draw-label-soft">
        {b}
      </text>
    </g>
  );
  return (
    <svg ref={ref} className="draw-labels" aria-hidden="true" style={{ opacity: 0 }}>
      {label('nose', -40, 96, 'STA 0.0', 'NOSE')}
      {label('fin', -70, -120, 'FIN', 'H 9.4 M')}
      {label('wing', -40, 60, 'WINGLET', 'SPAN 36 M')}
    </svg>
  );
}

/* ------------------------------ Lounge (Chapter 02) ------------------------------ */

function SkillList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`skill-list ${compact ? 'skill-list-compact' : ''}`}>
      {skillGroups.map((g) => (
        <div key={g.id} className="skill-group">
          <h3 className="mono skill-h">
            <T v={g.label} />
          </h3>
          <ul>
            {g.items.map((it) => (
              <li key={it.text}>
                {it.text}
                {it.detail && <span className="skill-detail"> — {it.detail}</span>}
                {g.id === 'languages' && (
                  <span className="skill-greet" lang={greetings.find((x) => x.label === it.text)?.lang}>
                    {' '}
                    · {greetings.find((x) => x.label === it.text)?.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {g.link && (
            <a className="skill-link link-underline" href={g.link.href} data-cursor="project">
              {g.link.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function ObjectPanel({ group, onClose }: { group: SkillGroup; onClose: () => void }) {
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    head.current?.focus();
  }, []);
  return (
    <m.div
      className="object-panel on-dark"
      role="region"
      aria-labelledby={`panel-${group.id}`}
      id={`object-panel-${group.id}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 0.61, 0.18, 1], delay: 0.15 } }}
      exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
    >
      <div className="object-panel-top">
        <span className="mono">{group.object}</span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close and return to the lounge">
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
      <h3 id={`panel-${group.id}`} ref={head} tabIndex={-1} className="object-panel-h display">
        <T v={group.label} />
      </h3>
      <ul>
        {group.items.map((it) => (
          <li key={it.text}>
            {it.text}
            {it.detail && <span className="skill-detail"> — {it.detail}</span>}
          </li>
        ))}
      </ul>
      {group.id === 'analytics' && <MockChart />}
      {group.note && <p className="object-note">{group.note}</p>}
      {group.link && (
        <a className="btn btn-gold" href={group.link.href} data-cursor="project">
          {group.link.label}
        </a>
      )}
    </m.div>
  );
}

const OBJECT_ORDER: RoomObject[] = ['commercial', 'analytics', 'languages', 'braille'];

function ObjectButtons({ open, setOpen, disabled }: { open: RoomObject | null; setOpen: (o: RoomObject | null) => void; disabled?: boolean }) {
  return (
    <>
      {OBJECT_ORDER.map((k, i) => {
        const o = ROOM.objects[k];
        const g = skillGroups.find((s) => s.id === k)!;
        return (
          <button
            key={k}
            type="button"
            className="room-hit"
            style={{ left: pct(o.x, ROOM.w), top: pct(o.y, ROOM.h), width: pct(o.w, ROOM.w), height: pct(o.h, ROOM.h) }}
            aria-expanded={open === k}
            aria-controls={`object-panel-${k}`}
            tabIndex={disabled ? -1 : 0}
            data-cursor="view"
            onClick={() => setOpen(open === k ? null : k)}
          >
            <span className="room-tag mono" style={{ top: o.label[1] < o.y ? '-30px' : 'calc(100% + 6px)' }}>
              <span aria-hidden="true">0{i + 1}</span> {o.tag}<span className="sr-only">: {textOf(g.label)}</span>
            </span>
          </button>
        );
      })}
    </>
  );
}

/* ---------------------------------- Live ---------------------------------- */

function LiveGateLounge() {
  const wrap = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontCopy = useRef<HTMLDivElement>(null);
  const roomOuter = useRef<HTMLDivElement>(null);
  const loungeUi = useRef<HTMLDivElement>(null);
  const [greet, setGreet] = useState(0);
  const [boarding, setBoarding] = useState(false);
  const [open, setOpen] = useState<RoomObject | null>(null);
  const [interactive, setInteractive] = useState(false);
  const greeted = useRef(false);
  const progress = useRef(0);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    function apply(p: number) {
      progress.current = p;
      // hero headline lifts away
      const lift = smooth(range(p, 0.06, 0.26));
      if (backRef.current) {
        backRef.current.style.transform = `translate3d(0, ${-lift * 38}vh, 0)`;
        backRef.current.style.opacity = String(1 - lift);
        backRef.current.style.visibility = lift >= 1 ? 'hidden' : 'visible';
      }
      if (frontCopy.current) {
        frontCopy.current.style.transform = `translate3d(0, ${-lift * 38}vh, 0)`;
        frontCopy.current.style.opacity = String(1 - lift);
      }
      // the camera pulls straight back through the glass
      const pull = smooth(range(p, 0.1, 0.5));
      const exit = smooth(range(p, 0.86, 1));
      const s = 3.8 - 2.8 * pull + exit * 1.6;
      if (roomOuter.current) {
        const el = roomOuter.current;
        const bw = el.offsetWidth;
        const bh = el.offsetHeight;
        const fx = (innerWidth - bw) / 2 + (ROOM.focus.x / ROOM.w) * bw;
        const fy = (innerHeight - bh) / 2 + (ROOM.focus.y / ROOM.h) * bh;
        const k = 1 - pull;
        el.style.transform = `translate3d(${(innerWidth / 2 - fx) * k}px, ${(innerHeight / 2 - fy) * k}px, 0) scale(${s})`;
        roomOuter.current.style.transformOrigin = exit > 0 ? `${pct(ROOM.pass.x, ROOM.w)} ${pct(ROOM.pass.y, ROOM.h)}` : `${pct(ROOM.focus.x, ROOM.w)} ${pct(ROOM.focus.y, ROOM.h)}`;
        roomOuter.current.style.opacity = String(clamp(range(p, 0.1, 0.18)) * (1 - range(p, 0.95, 1)));
        roomOuter.current.style.setProperty('--reflect', String(range(p, 0.3, 0.5)));
      }
      const ui = range(p, 0.44, 0.56) * (1 - range(p, 0.84, 0.9));
      if (loungeUi.current) {
        loungeUi.current.style.opacity = String(ui);
        loungeUi.current.style.transform = `translate3d(0, ${(1 - ui) * 30}px, 0)`;
        // opacity only: the list stays in the accessibility tree and in the tab order
        loungeUi.current.style.pointerEvents = ui <= 0.01 ? 'none' : 'auto';
      }
      roomOuter.current?.style.setProperty('--skew', `${-24 - range(p, 0.2, 1) * 26}deg`);
      setInteractive(p > 0.44 && p < 0.86);
      // the lounge walls are dark: switch the instruments to silver while they frame the view
      const chrome = p > 0.36 && p < 0.97 ? 'dark' : 'light';
      if (document.documentElement.dataset.chrome !== chrome) document.documentElement.dataset.chrome = chrome;
      setBoarding(p > 0.8);
      if (p > 0.5 && !greeted.current) {
        greeted.current = true;
        // greet once in each language, then stop
        greetings.forEach((_, i) => setTimeout(() => setGreet(i), i * 1500));
      }
    }
    return () => {
      st.kill();
      delete document.documentElement.dataset.chrome;
    };
  }, []);

  useEffect(() => {
    if (!interactive) setOpen(null);
  }, [interactive]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const close = useCallback(() => {
    const k = open;
    setOpen(null);
    if (k) requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[aria-controls="object-panel-${k}"]`)?.focus());
  }, [open]);

  /** Keyboard users who tab into the pinned room are flown to the moment it is open. */
  const ensureVisible = () => {
    const p = progress.current;
    if (p > 0.46 && p < 0.84) return;
    const el = wrap.current!;
    const top = el.getBoundingClientRect().top + scrollY;
    const y = top + (el.offsetHeight - innerHeight) * 0.6;
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else scrollTo(0, y);
  };

  const zoom = open ? ROOM.objects[open] : null;
  const zx = zoom ? zoom.x + zoom.w / 2 : ROOM.focus.x;
  const zy = zoom ? zoom.y + zoom.h / 2 : ROOM.focus.y;

  return (
    <div ref={wrap} className="gl" data-chapters="0,1" data-splits="0.19">
      <div id="gate" className="gl-anchor" style={{ top: 0 }} data-focus="gate-title" />
      <div id="lounge" className="gl-anchor" style={{ top: '27%' }} data-focus="lounge-title" />

      <section className="gl-back" aria-labelledby="gate-title">
        <div ref={backRef} className="hero-box">
          <HeroHeadline />
        </div>
      </section>

      <div className="gl-front" onFocusCapture={(e) => (e.target as HTMLElement).closest('.lounge-stage') && ensureVisible()}>
        <div ref={frontCopy} className="hero-box hero-front">
          <div aria-hidden="true">
            <HeroHeadline front />
          </div>
          <HeroCopy />
        </div>
        <DrawingLabels />

        <section className={`lounge-stage ${interactive ? 'is-interactive' : ''}`} aria-labelledby="lounge-title">
          <div ref={roomOuter} className="room-outer" style={{ opacity: 0 }}>
            <m.div
              className="room-box"
              animate={{ scale: open ? 1.9 : 1 }}
              transition={{ duration: 1.1, ease: [0.22, 0.61, 0.18, 1] }}
              style={{ transformOrigin: `${pct(zx, ROOM.w)} ${pct(zy, ROOM.h)}` }}
            >
              <RoomArt greet={greet} boarding={boarding} highlight={open} />
              <ObjectButtons open={open} setOpen={setOpen} />
            </m.div>
          </div>

          <div ref={loungeUi} className="lounge-ui" style={{ opacity: 0 }}>
            <div className="lounge-wall on-dark">
              <p className="chapter-tag">02 · Lounge · FL000</p>
              <h2 id="lounge-title" className="lounge-h display" tabIndex={-1}>
                {lounge.headline}
              </h2>
              <p className="lounge-sub serif">{lounge.supporting}</p>
              <AnimatePresence mode="wait">
                {open ? (
                  <ObjectPanel key={open} group={skillGroups.find((g) => g.id === open)!} onClose={close} />
                ) : (
                  <m.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SkillList />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------------------------- Still ---------------------------------- */

const CROPS: Record<RoomObject, string> = {
  commercial: '430 690 300 170',
  analytics: '560 690 260 150',
  languages: '780 60 260 170',
  braille: '60 560 420 330',
};

function StillGateLounge() {
  const [open, setOpen] = useState<RoomObject | null>(null);
  return (
    <>
      <section id="gate" className="gl-still-hero" data-chapters="0" aria-labelledby="gate-title">
        <div className="hero-box hero-still-back">
          <HeroHeadline />
        </div>
        <div className="hero-box hero-front">
          <div aria-hidden="true">
            <HeroHeadline front />
          </div>
          <HeroCopy />
        </div>
      </section>

      <section id="lounge" className="lounge-still content section-pad" data-chapters="1" aria-labelledby="lounge-title">
        <p className="chapter-tag">02 · Lounge · FL000</p>
        <h2 id="lounge-title" className="lounge-h display">
          {lounge.headline}
        </h2>
        <p className="lounge-sub serif">{lounge.supporting}</p>
        <div className="room-frame">
          <RoomArt greet={3} />
        </div>
        <div className="lounge-still-grid">
          <ol className="object-seq">
            {OBJECT_ORDER.map((k, i) => {
              const g = skillGroups.find((s) => s.id === k)!;
              const isOpen = open === k;
              return (
                <li key={k} className="object-card">
                  <button
                    type="button"
                    className="object-card-btn"
                    aria-expanded={isOpen}
                    aria-controls={`still-panel-${k}`}
                    onClick={() => setOpen(isOpen ? null : k)}
                  >
                    <span className="object-crop">
                      <RoomArt viewBox={CROPS[k]} greet={k === 'languages' ? 0 : 3} highlight={k} />
                    </span>
                    <span className="object-card-label">
                      <span className="mono">
                        0{i + 1} · {g.object}
                      </span>
                      <span className="object-card-title serif">
                        <T v={g.label} />
                      </span>
                    </span>
                  </button>
                  {isOpen && (
                    <div id={`still-panel-${k}`} className="object-card-body">
                      {k === 'analytics' && <MockChart light />}
                      {g.note && <p className="object-note">{g.note}</p>}
                      {g.link && (
                        <a className="link-underline" href={g.link.href}>
                          {g.link.label}
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="lounge-still-list">
            <SkillList compact />
          </div>
        </div>
        <p className="boarding-cue mono">
          <span aria-hidden="true">■</span> Now boarding · {site.fictionalFlight} (fictional flight code)
        </p>
      </section>
    </>
  );
}

export function GateLounge() {
  const { live } = useModes();
  return live ? <LiveGateLounge /> : <StillGateLounge />;
}
