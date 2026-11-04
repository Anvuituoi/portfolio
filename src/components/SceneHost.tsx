import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { asset, useModes } from '../flight/modes';
import { flight, onFlight } from '../flight/store';
import { canvasOpacityAt } from '../flight/spline';

const AircraftScene = lazy(() => import('../three/AircraftScene'));

/** Authored still frames rendered from the same scene (see scripts/posters.mjs). One per chapter. */
export const POSTERS = ['gate', 'gate', 'boarding', 'takeoff', 'climb', 'cruise', 'descent', 'contact'] as const;
export const posterUrl = (name: string, portrait: boolean) => asset(`posters/${name}-${portrait ? 'm' : 'd'}.webp`);

/**
 * Fixed layer between the hero headline and the content.
 * Live mode: lazy WebGL canvas, with the hero poster shown until the first frame.
 * Still mode (reduced motion, no WebGL, phones): poster frames that change with the flight phase.
 */
export function SceneHost({ paused }: { paused: boolean }) {
  const modes = useModes();
  const [mountScene, setMountScene] = useState(false);
  const [ready, setReady] = useState(flight.sceneReady);
  const [posterGone, setPosterGone] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [portrait, setPortrait] = useState(() => window.innerWidth / window.innerHeight < 0.9);
  const stillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setPortrait(window.innerWidth / window.innerHeight < 0.9);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!modes.live) return;
    // Hero content and poster first; the 3D chunk loads when the browser is idle.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    const go = () => setMountScene(true);
    const id = idle ? idle(go, { timeout: 1200 }) : window.setTimeout(go, 300);
    return () => {
      if (!idle) clearTimeout(id);
    };
  }, [modes.live]);

  useEffect(
    () =>
      onFlight(() => {
        if (flight.sceneReady && !ready) setReady(true);
        const c = Math.min(7, Math.floor(flight.t));
        setChapter((prev) => (prev === c ? prev : c));
        if (stillRef.current) stillRef.current.style.opacity = String(canvasOpacityAt(flight.t));
      }),
    [ready],
  );

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setPosterGone(true), 1100);
    return () => clearTimeout(id);
  }, [ready]);

  const live = modes.live && mountScene;
  const unique = [...new Set(POSTERS)];
  const current = POSTERS[chapter];

  return (
    <div className="scene-layer" aria-hidden="true">
      {live && (
        <Suspense fallback={null}>
          <AircraftScene lite={modes.lite} active={!paused} />
        </Suspense>
      )}
      {(!modes.live || !posterGone) && (
        <div ref={stillRef} className="scene-canvas">
          {unique.map((name) => {
            const near = Math.abs(POSTERS.indexOf(name) - chapter) <= 1 || name === current || name === 'gate';
            const show = modes.live ? name === 'gate' && !ready : name === current;
            return (
              <img
                key={name}
                className="scene-poster"
                src={near ? posterUrl(name, portrait) : undefined}
                alt=""
                decoding="async"
                {...{ fetchpriority: name === 'gate' ? 'high' : 'low' }}
                style={{ opacity: show ? 1 : 0 }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
