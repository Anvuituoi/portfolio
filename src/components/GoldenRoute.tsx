import { useEffect, useRef, useState } from 'react';
import { useModes } from '../flight/modes';
import { ScrollTrigger } from '../flight/scroll';

/**
 * One golden route from the gate to the final call to action. It is built from anchors placed
 * in the layout ([data-route]) and drawn up to the current scroll position.
 */
export function GoldenRoute() {
  const { motion } = useModes();
  const path = useRef<SVGPathElement>(null);
  const [d, setD] = useState('');
  const [height, setHeight] = useState(0);
  const samples = useRef<{ len: number; y: number }[]>([]);

  useEffect(() => {
    const build = () => {
      const doc = document.documentElement;
      const w = doc.clientWidth;
      const gutter = Math.max(16, Math.min(64, w * 0.04));
      const x0 = gutter * 0.5;
      const pts: [number, number][] = [];
      const el = (sel: string) => document.querySelector<HTMLElement>(`[data-route="${sel}"]`);
      const pos = (e: HTMLElement | null, fx = 0.5, fy = 0.5): [number, number] | null => {
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return [r.left + r.width * fx + scrollX, r.top + r.height * fy + scrollY];
      };
      const boarding = document.getElementById('boarding');
      const takeoff = document.getElementById('takeoff');
      const lift = pos(el('lift'));
      const start = boarding ? boarding.getBoundingClientRect().top + scrollY : innerHeight;
      pts.push([x0, start]);
      if (takeoff) pts.push([x0, takeoff.getBoundingClientRect().top + scrollY + innerHeight * 0.5]);
      if (lift) pts.push([x0 + gutter * 0.2, lift[1] - innerHeight * 0.4]);
      ['wpt1', 'wpt2', 'wpt3', 'wpt4'].forEach((k, i) => {
        const p = pos(el(k), 0, 0.5);
        if (p) pts.push([x0 + (i % 2 ? gutter * 0.25 : 0), p[1]]);
      });
      const fixes = pos(el('fixes'), 0.5, 0.92);
      if (fixes) pts.push([x0, fixes[1]]);
      const descent = document.getElementById('descent');
      if (descent) pts.push([x0, descent.getBoundingClientRect().top + scrollY + descent.offsetHeight * 0.5]);
      const cta = pos(el('cta'), 0, 0.5);
      if (cta) {
        pts.push([x0, cta[1] - innerHeight * 0.18]);
        pts.push([cta[0] - 14, cta[1]]);
      }
      if (pts.length < 2) return;
      // smooth Catmull-Rom → cubic Bézier
      let s = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        s += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
      }
      setHeight(doc.scrollHeight);
      setD(s);
    };
    const st = ScrollTrigger.create({ start: 0, end: 'max', onRefresh: build });
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(build);
    else setTimeout(build, 300);
    return () => st.kill();
  }, []);

  useEffect(() => {
    const p = path.current;
    if (!p || !d) return;
    const total = p.getTotalLength();
    samples.current = [];
    for (let i = 0; i <= 160; i++) {
      const len = (i / 160) * total;
      samples.current.push({ len, y: p.getPointAtLength(len).y });
    }
    p.style.strokeDasharray = `${total}`;
    if (!motion) {
      p.style.strokeDashoffset = '0';
      return;
    }
    const update = () => {
      const target = scrollY + innerHeight * 0.72;
      let len = 0;
      for (const s of samples.current) if (s.y <= target) len = Math.max(len, s.len);
      if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) len = total;
      p.style.strokeDashoffset = String(total - len);
    };
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update });
    update();
    return () => st.kill();
  }, [d, motion]);

  return (
    <svg className="route-svg" style={{ height }} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="#3A0F34" strokeOpacity="0.18" strokeWidth="3" />
      <path ref={path} d={d} fill="none" stroke="#EAAA00" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
