import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { posterUrl } from './SceneHost';

/**
 * Pre-flight. The percentage is real: it counts the critical fonts and the hero poster only.
 * Lazy 3D is not waited for. Returning visitors with cached assets skip it.
 */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem('altitude-boarded') !== '1';
    } catch {
      return true;
    }
  });
  const started = useRef(performance.now());

  useEffect(() => {
    const portrait = innerWidth / innerHeight < 0.9;
    const jobs: Promise<unknown>[] = [
      document.fonts.load("340 120px 'Newsreader Display'", 'BEYOND'),
      document.fonts.load('400 16px Manrope', 'a'),
      document.fonts.load('500 12px "IBM Plex Mono"', 'FL'),
      document.fonts.load("340 40px 'Newsreader Display'", 'Vũ'),
      new Promise((res) => {
        const img = new Image();
        img.onload = img.onerror = res;
        img.src = posterUrl('gate', portrait);
      }),
    ];
    let done = 0;
    jobs.forEach((j) =>
      j.catch(() => undefined).then(() => {
        done++;
        setPct(Math.round((done / jobs.length) * 100));
      }),
    );
    Promise.allSettled(jobs).then(() => {
      const fast = performance.now() - started.current < 250;
      try {
        sessionStorage.setItem('altitude-boarded', '1');
      } catch {
        /* storage unavailable */
      }
      setTimeout(() => {
        setVisible(false);
        onDone();
      }, fast ? 0 : 350);
    });
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className="loader on-dark"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 0.61, 0.18, 1] } }}
          role="status"
          aria-live="polite"
        >
          <div className="loader-mark">ALTITUDE</div>
          <div className="loader-route" aria-hidden="true">
            <span style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <div className="loader-pct mono">
            <span>Pre-flight</span>
            <span>{String(pct).padStart(3, '0')}%</span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
