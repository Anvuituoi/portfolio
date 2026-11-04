import { useEffect, useRef } from 'react';
import { ScrollTrigger } from '../flight/scroll';

/**
 * Scroll-scrubbed progress for an element, 0 when it enters, 1 when its centre reaches the
 * viewport centre. When `live` is false the progress is fixed at 1 (composed still frame).
 */
export function useScrub(
  ref: React.RefObject<HTMLElement>,
  live: boolean,
  onProgress: (p: number) => void,
  opts: { start?: string; end?: string } = {},
) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    if (!live || !ref.current) {
      cb.current(1);
      return;
    }
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: opts.start ?? 'top 85%',
      end: opts.end ?? 'center 45%',
      onUpdate: (self) => cb.current(self.progress),
      onRefresh: (self) => cb.current(self.progress),
    });
    return () => st.kill();
  }, [live, ref, opts.start, opts.end]);
}

/** Size a canvas to its CSS box at a capped device pixel ratio. */
export function fitCanvas(c: HTMLCanvasElement, maxDpr = 2) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = c.clientWidth;
  const h = c.clientHeight;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
  }
  const ctx = c.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

