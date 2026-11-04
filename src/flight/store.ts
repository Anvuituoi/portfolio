/**
 * A tiny mutable flight state shared by the DOM and the WebGL scene.
 * It is deliberately not React state: the scene and instruments read it every frame.
 */
type Listener = () => void;

export interface FlightState {
  /** Flight time in [0, 8), straight from scroll. */
  t: number;
  /** Damped flight time used by the scene, so the aircraft feels heavy. */
  ts: number;
  /** Projected screen positions of drawing anchors (CSS px). */
  anchors: Record<string, [number, number]>;
  /** Smoothed pointer in [-1, 1]. */
  px: number;
  py: number;
  /** Projected aircraft bounds in CSS pixels, for the cursor's targeting state. */
  aircraftRect: { x: number; y: number; w: number; h: number } | null;
  /** True once the live scene has rendered its first frame. */
  sceneReady: boolean;
}

export const flight: FlightState = { t: 0, ts: 0, anchors: {}, px: 0, py: 0, aircraftRect: null, sceneReady: false };

const listeners = new Set<Listener>();
export const onFlight = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const emitFlight = () => listeners.forEach((fn) => fn());

/* -------------------------------- Modes -------------------------------- */

export interface Modes {
  /** User or OS preference for motion. */
  motion: boolean;
  webgl: boolean;
  /** Small or coarse device: authored stills instead of live 3D. */
  compact: boolean;
  /** Live WebGL flight is running. */
  live: boolean;
  /** Tablet-class: live but reduced quality. */
  lite: boolean;
}

export function detectWebGL(): boolean {
  try {
    const params = new URLSearchParams(location.search);
    if (params.has('nowebgl')) return false;
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function readMotionPref(): boolean {
  try {
    const stored = localStorage.getItem('altitude-motion');
    if (stored === 'on') return true;
    if (stored === 'off') return false;
  } catch {
    /* storage unavailable */
  }
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function writeMotionPref(on: boolean) {
  try {
    localStorage.setItem('altitude-motion', on ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
}

export function computeModes(motion: boolean, webgl: boolean): Modes {
  const w = window.innerWidth;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const compact = w < 768 || (coarse && w < 900);
  const live = motion && webgl && !compact;
  const lite = live && (w < 1200 || coarse || (navigator.hardwareConcurrency ?? 8) <= 4);
  return { motion, webgl, compact, live, lite };
}
