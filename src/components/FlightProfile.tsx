import { useRef, useState } from 'react';
import { m, useMotionValue, useSpring, useTransform, animate } from 'motion/react';
import { flightProfile } from '../content/profile';
import { site } from '../content/site';
import { T } from './Mark';
import { useModes } from '../flight/modes';

/** Chapter 03. A tactile boarding pass. Drag the stub, or press the button, to tear it. */
export function FlightProfile() {
  const { motion } = useModes();
  const [torn, setTorn] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 18 });
  const sry = useSpring(ry, { stiffness: 120, damping: 18 });
  const dx = useMotionValue(0);
  const stubRotate = useTransform(dx, [0, 200], [0, 9]);

  const onMove = (e: React.PointerEvent) => {
    if (!motion || e.pointerType !== 'mouse' || !card.current) return;
    const r = card.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 7);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const tear = () => {
    setTorn(true);
    if (motion) animate(dx, 520, { duration: 0.9, ease: [0.3, 0.1, 0.2, 1] });
  };

  const fields = (
    <>
      <div className="bp-field bp-name">
        <span className="bp-k">Passenger</span>
        <span className="bp-v display" lang="vi">
          <T v={site.person} />
        </span>
        <span className="bp-alias mono">{site.englishName}</span>
      </div>
      <div className="bp-field">
        <span className="bp-k">Professional focus</span>
        <span className="bp-v">{flightProfile.focus}</span>
      </div>
      <div className="bp-field">
        <span className="bp-k">Education</span>
        <span className="bp-v">
          {flightProfile.education.degree}, {flightProfile.education.school}.
          <br />
          Major: {flightProfile.education.major}; Minor: {flightProfile.education.minor}
        </span>
      </div>
    </>
  );

  return (
    <section id="boarding" className="boarding content section-pad" data-chapters="2" aria-labelledby="boarding-title">
      <p className="chapter-tag">03 · Boarding · FL000</p>
      <h2 id="boarding-title" className="section-h display">
        Flight Profile
      </h2>

      <m.div
        ref={card}
        className="bp"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      >
        <div className="bp-main">
          <div className="bp-head">
            <span className="wordmark">ALTITUDE</span>
            <span className="mono">Boarding pass · {site.fictionalFlight} · fictional flight</span>
          </div>
          <div className="bp-route" aria-hidden="true">
            <span className="display">FL000</span>
            <svg viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M0 18 C 60 18, 120 2, 200 2" fill="none" stroke="#EAAA00" strokeWidth="1.5" />
            </svg>
            <span className="display">NEXT</span>
          </div>
          <div className="bp-fields">{fields}</div>

        </div>

        <div className="bp-under">
          <div className="bp-field">
            <span className="bp-k">Personal statement</span>
            <span className="bp-v serif bp-statement">
              <T v={flightProfile.statement} fallback="" />
            </span>
          </div>
          <div className="bp-field">
            <span className="bp-k">Key professional interests</span>
            <ul className="bp-interests">
              {flightProfile.interests.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>

        <m.div
          className="bp-stub"
          drag={motion && !torn ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          style={{ x: dx, rotate: stubRotate, opacity: torn && !motion ? 0 : 1 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 110) tear();
          }}
          animate={torn && motion ? { opacity: 0, y: 60, transition: { delay: 0.4, duration: 0.5 } } : undefined}
          aria-hidden="true"
          data-cursor="view"
        >
          <span className="mono">Seat</span>
          <span className="display bp-seat">1A</span>
          <span className="mono">Gate 01</span>
          <span className="mono bp-drag">{motion ? 'Drag to tear →' : ''}</span>
        </m.div>
      </m.div>

      <div className="bp-actions">
        <button type="button" className="btn" onClick={tear} disabled={torn}>
          {torn ? 'Stub torn' : 'Tear the stub'}
        </button>
      </div>
    </section>
  );
}
