import { useEffect, useRef } from 'react';
import { useModes } from '../../flight/modes';
import { fitCanvas, useScrub } from '../../lib/useScrub';

/** The seven letters that the Vietnamese Latin alphabet (chữ Quốc ngữ) adds to the basic Latin set. */
export const QUOC_NGU_LETTERS = 'ă â đ ê ô ơ ư';

interface P {
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  s: number;
}

/** Waypoint 3. Cloud particles dissolve into letterforms: an archive taking shape in the air. */
export function ArchiveWorld() {
  const { live, motion } = useModes();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(live ? 0 : 1);
  const kickRef = useRef<() => void>(() => undefined);
  useScrub(wrap, live, (p) => {
      progress.current = p;
      kickRef.current();
    }, { start: 'top 80%', end: 'center 40%' });

  useEffect(() => {
    const c = canvas.current!;
    let raf = 0;
    // the loop only runs while the world is on screen
    let visible = false;
    let parts: P[] = [];
    let built = '';

    const build = (w: number, h: number) => {
      // sample the letterforms from an offscreen canvas set in Newsreader
      const off = document.createElement('canvas');
      off.width = Math.round(w);
      off.height = Math.round(h);
      const o = off.getContext('2d')!;
      const size = Math.min(w / 6.2, h * 0.5);
      o.fillStyle = '#000';
      o.font = `340 ${size}px 'Newsreader Display', Georgia, serif`;
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillText(QUOC_NGU_LETTERS, w / 2, h * 0.55);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const pts: [number, number][] = [];
      const step = Math.max(3, Math.round(size / 36));
      for (let y = 0; y < off.height; y += step)
        for (let x = 0; x < off.width; x += step) if (data[(y * off.width + x) * 4 + 3] > 128) pts.push([x, y]);
      let seed = 9;
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const blobs = [[0.2, 0.35], [0.45, 0.25], [0.7, 0.38], [0.85, 0.22], [0.32, 0.6], [0.62, 0.66]];
      parts = pts.map(([tx, ty]) => {
        const b = blobs[Math.floor(rand() * blobs.length)];
        const ang = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * 0.13;
        return { cx: (b[0] + Math.cos(ang) * rr * 1.6) * w, cy: (b[1] + Math.sin(ang) * rr) * h, tx, ty, s: 0.6 + rand() * 1.6 };
      });
      built = `${w}x${h}`;
    };

    const draw = (time: number) => {
      const { ctx, w, h } = fitCanvas(c);
      if (built !== `${w}x${h}`) build(w, h);
      const p = progress.current;
      const k = p * p * (3 - 2 * p);
      ctx.clearRect(0, 0, w, h);
      parts.forEach((pt, i) => {
        const drift = motion ? Math.sin(time * 0.0007 + i) * 3 * (1 - k) : 0;
        const x = pt.cx + (pt.tx - pt.cx) * k + drift;
        const y = pt.cy + (pt.ty - pt.cy) * k;
        const r = pt.s * (1 - k) * 3.2 + 1.3 * k;
        const a = 0.35 + 0.6 * k;
        // silver cloud particles that settle as burgundy ink
        ctx.fillStyle = k < 0.5 ? `rgba(255,255,255,${0.55 * (1 - k)})` : `rgba(58,15,52,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = motion && visible ? requestAnimationFrame(draw) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    kickRef.current = kick;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap.current!);
    document.fonts.load("340 64px 'Newsreader Display'", QUOC_NGU_LETTERS).finally(() => {
      built = '';
      kick();
    });
    window.addEventListener('resize', kick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', kick);
    };
  }, [motion, live]);

  return (
    <div ref={wrap} className="world world-archive">
      <canvas ref={canvas} aria-hidden="true" />
      <p className="archive-caption mono">
        <span lang="vi">{QUOC_NGU_LETTERS}</span> — the seven letters chữ Quốc ngữ adds to the Latin alphabet
      </p>
    </div>
  );
}
