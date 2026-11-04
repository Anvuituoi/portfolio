import { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';
import { ModesContext } from './flight/modes';
import { computeModes, detectWebGL, readMotionPref, writeMotionPref } from './flight/store';
import { ScrollTrigger, startScroll } from './flight/scroll';
import { Sky } from './components/Sky';
import { SceneHost } from './components/SceneHost';
import { Navbar } from './components/Navbar';
import { Altimeter } from './components/Altimeter';
import { CustomCursor } from './components/CustomCursor';
import { LoadingScreen } from './components/LoadingScreen';
import { GateLounge } from './components/GateLounge';
import { FlightProfile } from './components/FlightProfile';
import { JourneyTimeline } from './components/JourneyTimeline';
import { ProjectWaypoints } from './components/ProjectWaypoints';
import { ProjectModal } from './components/ProjectModal';
import { AchievementSection } from './components/AchievementSection';
import { ThinkingSection } from './components/ThinkingSection';
import { ContactSection, Footer } from './components/ContactSection';
import { GoldenRoute } from './components/GoldenRoute';
import { FlightManifest } from './components/FlightManifest';

const posterParam = new URLSearchParams(location.search).get('poster');

function readHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  return { manifest: h === 'manifest', caseSlug: h.startsWith('case/') ? h.slice(5) : null };
}

function Flight() {
  const webgl = useMemo(detectWebGL, []);
  const [motion, setMotion] = useState(readMotionPref);
  const [modes, setModes] = useState(() => computeModes(motion, webgl));
  const [route, setRoute] = useState(readHash);
  const [, setLoaded] = useState(false);
  // The gate renders first; the other chapters render in a time-sliced transition after first paint,
  // so the main thread is never blocked by one long render. Deep links render everything at once.
  const [rest, setRest] = useState(() => !!location.hash && location.hash !== '#gate');

  useEffect(() => {
    if (rest) return;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    const go = () => startTransition(() => setRest(true));
    const id = idle ? idle(go, { timeout: 1200 }) : window.setTimeout(go, 200);
    return () => {
      if (!idle) clearTimeout(id);
    };
  }, [rest]);

  useEffect(() => {
    const onResize = () => {
      const next = computeModes(motion, webgl);
      setModes((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [motion, webgl]);

  useEffect(() => {
    document.documentElement.classList.toggle('motion-off', !modes.motion);
    document.documentElement.dataset.mode = modes.live ? 'live' : 'still';
  }, [modes]);

  useEffect(() => {
    const onHash = () => setRoute(readHash());
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);

  // Smooth scroll + flight timeline. Rebuilt when the layout mode changes.
  useEffect(() => {
    if (route.manifest) return;
    const stop = startScroll(modes.motion);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    // jump to a chapter anchor on first load
    const h = location.hash.slice(1);
    if (h && !h.startsWith('case/')) requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView());
    // layout changes (fonts, late chapters) re-measure the flight, debounced
    let t: number | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    });
    ro.observe(document.body);
    return () => {
      clearTimeout(t);
      clearTimeout(id);
      ro.disconnect();
      stop();
    };
  }, [modes.motion, modes.live, route.manifest, rest]);

  const toggleMotion = useCallback(() => {
    setMotion((m) => {
      writeMotionPref(!m);
      return !m;
    });
  }, []);

  const closeCase = useCallback(() => {
    if (history.state?.fromSite) history.back();
    else history.replaceState(null, '', '#climb');
    setRoute(readHash());
  }, []);

  // remember that a case was opened from inside the site, so Back returns there
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#case/"]') as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      history.pushState({ fromSite: true }, '', a.getAttribute('href')!);
      setRoute(readHash());
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (route.manifest) {
    return (
      <ModesContext.Provider value={modes}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <FlightManifest />
      </ModesContext.Provider>
    );
  }

  const showCursor = modes.motion && !modes.compact && matchMedia('(pointer: fine)').matches;

  return (
    <ModesContext.Provider value={modes}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion={modes.motion ? 'never' : 'always'}>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <LoadingScreen onDone={() => setLoaded(true)} />
          <Sky />
          <SceneHost paused={!!route.caseSlug} />
          <Navbar onToggleMotion={toggleMotion} />
          <Altimeter />
          <main id="main" tabIndex={-1}>
            <GateLounge />
            {rest && (
              <>
                <FlightProfile />
                <JourneyTimeline />
                <ProjectWaypoints />
                <AchievementSection />
                <ThinkingSection />
                <ContactSection />
                <GoldenRoute />
              </>
            )}
          </main>
          {rest && <Footer />}
          <ProjectModal slug={route.caseSlug} onClose={closeCase} />
          {showCursor && <CustomCursor />}
        </MotionConfig>
      </LazyMotion>
    </ModesContext.Provider>
  );
}

/** Poster mode renders only the scene (and optionally the sky), for scripts/posters.mjs. */
export default function App() {
  return posterParam !== null ? <PosterMode t={parseFloat(posterParam)} /> : <Flight />;
}

function PosterMode({ t }: { t: number }) {
  // posters are rendered with a transparent background; the sky stays DOM
  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }, []);
  const modes = { motion: true, webgl: true, compact: false, live: true, lite: false };
  const sky = new URLSearchParams(location.search).has('sky');
  return (
    <ModesContext.Provider value={modes}>
      {sky && <Sky poster={t} />}
      <PosterScene />
    </ModesContext.Provider>
  );
}

const AircraftScene = lazy(() => import('./three/AircraftScene'));
function PosterScene() {
  return (
    <div className="scene-layer">
      <Suspense fallback={null}>
        <AircraftScene lite={false} active />
      </Suspense>
    </div>
  );
}
