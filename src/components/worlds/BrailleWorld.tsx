import { useEffect, useRef, useState } from 'react';
import { useModes } from '../../flight/modes';
import { fitCanvas, useScrub } from '../../lib/useScrub';
import { BRAILLE_CELLS, BRAILLE_UNICODE, BRAILLE_WORD, dotPosition } from '../../lib/braille';

interface Light {
  x: number;
  y: number;
  r: number;
  tw: number;
  target?: [number, number];
}

const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0];

/** Waypoint 2. City lights through a night cabin window resolve into the Braille cells of “music”. */
export function BrailleWorld() {
  const { live, motion } = useModes();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(live ? 0 : 1);
  const kickRef = useRef<() => void>(() => undefined);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);

  useScrub(wrap, live, (p) => {
      progress.current = p;
      kickRef.current();
    }, { start: 'top 80%', end: 'center 40%' });

  useEffect(() => {
    const c = canvas.current!;
    let raf = 0;
    // the loop only runs while the world is on screen
    let visible = false;
    let seed = 5;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const lights: Light[] = Array.from({ length: 240 }, () => {
      const row = rand();
      return { x: rand(), y: 0.45 + row * row * 0.55, r: 0.5 + rand() * 1.4, tw: rand() * 6.28 };
    });
    // assign the Braille dots to the nearest lights so the movement reads as lights gathering
    const cells = BRAILLE_CELLS.length;
    const targets: [number, number][] = [];
    BRAILLE_CELLS.forEach((cell, ci) =>
      cell.dots.forEach((d) => {
        const [col, row] = dotPosition(d);
        targets.push([ci, col * 10 + row]);
      }),
    );
    targets.forEach((tg, i) => (lights[i * 17 + 3].target = tg));

    const draw = (time: number) => {
      const { ctx, w, h } = fitCanvas(c);
      const p = progress.current;
      const k = p * p * (3 - 2 * p);
      ctx.clearRect(0, 0, w, h);
      // night sky and horizon glow
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#12040f');
      sky.addColorStop(0.42, '#22081f');
      sky.addColorStop(0.5, '#4a1c3a');
      sky.addColorStop(1, '#170513');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(234,170,0,0.5)';
      ctx.fillRect(0, h * 0.465, w, 1);

      const cellW = Math.min(w * 0.13, 70);
      const gap = cellW * 0.55;
      const totalW = cells * cellW + (cells - 1) * gap;
      const ox = (w - totalW) / 2;
      const oy = h * 0.5 - cellW * 0.75;
      const dot = (ci: number, slot: number): [number, number] => {
        const col = Math.floor(slot / 10);
        const row = slot % 10;
        return [ox + ci * (cellW + gap) + col * cellW * 0.6 + cellW * 0.2, oy + row * cellW * 0.6 + cellW * 0.15];
      };

      // empty cell positions, faint, to show the 2×3 structure
      if (k > 0.5) {
        ctx.strokeStyle = `rgba(229,228,226,${(k - 0.5) * 0.35})`;
        for (let ci = 0; ci < cells; ci++)
          for (let col = 0; col < 2; col++)
            for (let row = 0; row < 3; row++) {
              const [x, y] = dot(ci, col * 10 + row);
              ctx.beginPath();
              ctx.arc(x, y, cellW * 0.09, 0, Math.PI * 2);
              ctx.stroke();
            }
      }

      lights.forEach((l) => {
        const twinkle = motion ? 0.65 + 0.35 * Math.sin(time * 0.0015 + l.tw) : 0.85;
        let x = l.x * w;
        let y = l.y * h;
        let r = l.r;
        let a = twinkle;
        if (l.target) {
          const [tx, ty] = dot(l.target[0], l.target[1]);
          x += (tx - x) * k;
          y += (ty - y) * k;
          r += (cellW * 0.1 - r) * k;
          a = Math.max(a, k);
        } else {
          a *= 1 - k * 0.85;
        }
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, `rgba(255,214,120,${a})`);
        g.addColorStop(0.3, `rgba(234,170,0,${a * 0.5})`);
        g.addColorStop(1, 'rgba(234,170,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
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
    kick();
    window.addEventListener('resize', kick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', kick);
    };
  }, [motion, live]);

  const play = () => {
    const next = !sound;
    setSound(next);
    if (!next) return;
    const ctx = audio.current ?? new AudioContext();
    audio.current = ctx;
    NOTES.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t0 = ctx.currentTime + i * 0.32;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 1.5);
    });
    setTimeout(() => setSound(false), 2200);
  };

  return (
    <div ref={wrap} className="world world-braille on-dark">
      <div className="cabin-window" aria-hidden="true">
        <canvas ref={canvas} />
      </div>
      <p className="braille-caption">
        <span className="braille-uni" aria-hidden="true">
          {BRAILLE_UNICODE}
        </span>
        <span>
          The lights spell “{BRAILLE_WORD}” in literary Braille (uncontracted UEB):{' '}
          {BRAILLE_CELLS.map((c) => `${c.letter} ${c.dots.join('-')}`).join(' · ')}. Not Braille music notation.
        </span>
      </p>
      <button type="button" className="sound-btn mono" aria-pressed={sound} onClick={play}>
        {sound ? 'Playing five notes' : 'Play five piano notes (sound is off by default)'}
      </button>
    </div>
  );
}
