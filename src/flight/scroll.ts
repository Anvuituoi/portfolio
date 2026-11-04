/**
 * Scroll → flight time. GSAP ScrollTrigger owns the scroll timeline; Lenis smooths native scroll
 * (never hijacks it: anchors, Back, and keyboard scrolling keep working).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { emitFlight, flight } from './store';
import { clamp } from './plan';

gsap.registerPlugin(ScrollTrigger);

export let lenis: Lenis | null = null;

interface Segment {
  chapter: number;
  start: number;
  end: number;
}
let segments: Segment[] = [];

function measure() {
  const max = ScrollTrigger.maxScroll(window);
  const els = [...document.querySelectorAll<HTMLElement>('[data-chapters]')];
  segments = [];
  els.forEach((el) => {
    const chapters = el.dataset.chapters!.split(',').map(Number);
    const splits = (el.dataset.splits ?? '').split(',').filter(Boolean).map(Number);
    const top = el.getBoundingClientRect().top + window.scrollY;
    const early = el.dataset.enter === 'early' ? window.innerHeight * 0.6 : 0;
    const h = el.offsetHeight;
    const bounds = [0, ...splits, 1];
    chapters.forEach((c, i) => {
      segments.push({ chapter: c, start: Math.min(top - (i === 0 ? early : 0) + h * bounds[i], max), end: 0 });
    });
  });
  // each chapter ends where the next one starts, the last one at the bottom of the page
  segments.forEach((s, i) => (s.end = i < segments.length - 1 ? segments[i + 1].start : max));
}

function compute(y: number) {
  if (!segments.length) return 0;
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    // 2px tolerance: anchor jumps land exactly on a boundary, sometimes a sub-pixel short
    if (y + 2 >= s.start) {
      const span = Math.max(1, s.end - s.start);
      return s.chapter + clamp((y - s.start) / span, 0, 0.9999);
    }
  }
  return 0;
}

let lastSky = '';
export function updateFlight() {
  flight.t = compute(window.scrollY);
  // dark instruments only over the night sky of the cruise; the descent cabin wall is light
  const dark = flight.t > 5.04 && flight.t < 6.0 ? 'dark' : 'light';
  if (dark !== lastSky) {
    document.documentElement.dataset.sky = dark;
    lastSky = dark;
  }
  // past the hero, the navigation gets a soft backing so it never sits bare on content
  const scrolled = window.scrollY > window.innerHeight * 0.6 ? '1' : '';
  if ((document.documentElement.dataset.scrolled ?? '') !== scrolled) {
    if (scrolled) document.documentElement.dataset.scrolled = scrolled;
    else delete document.documentElement.dataset.scrolled;
  }
  emitFlight();
}

export function startScroll(smooth: boolean) {
  if (smooth) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  }
  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: updateFlight,
    onRefresh: () => {
      measure();
      updateFlight();
    },
  });
  measure();
  updateFlight();
  return () => {
    st.kill();
    if (lenis) {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenis = null;
    }
  };
}

function raf(time: number) {
  lenis?.raf(time * 1000);
}

/** Scroll to an in-page target, through Lenis when it is running. */
export function flyTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (k: number) => 1 - Math.pow(1 - k, 3) });
  else el.scrollIntoView({ behavior: 'auto' });
  history.pushState(null, '', `#${id}`);
  // move keyboard focus to the chapter for screen readers and keyboard users
  const focusTarget =
    (el.dataset.focus ? document.getElementById(el.dataset.focus) : null) ?? el.querySelector<HTMLElement>('h1, h2') ?? el;
  if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
  setTimeout(() => focusTarget.focus({ preventScroll: true }), lenis ? 900 : 0);
}

export { gsap, ScrollTrigger };
