/**
 * The authored flight path: one camera spline and one aircraft attitude track, keyed by flight time t.
 * Coordinates are aircraft-centred: +X is the nose, +Y is up, +Z is the visitor's side of the aircraft.
 * Camera positions are interpolated with a Catmull-Rom spline through the keys, so the path is continuous.
 */
import { clamp, lerp, piecewise, smooth } from './plan';

export type V3 = [number, number, number];
export interface CamKey {
  t: number;
  pos: V3;
  look: V3;
  fov: number;
}

export const camKeys: CamKey[] = [
  // 01 Gate: three-quarter front, dominant, from the terminal glass (slightly above)
  { t: 0.0, pos: [40, 3.2, 44], look: [-3.5, 0.8, -6.5], fov: 30 },
  { t: 0.85, pos: [37, 3.6, 41], look: [-3.5, 0.6, -6.5], fov: 30 },
  // 02 Lounge: the camera pulls straight back through the glass
  { t: 1.6, pos: [50, 6.5, 56], look: [-3, 0.2, -6], fov: 30 },
  // 03 Boarding: fuselage and forward door
  { t: 2.15, pos: [26, 1.4, 19], look: [13, 0.2, 1], fov: 30 },
  { t: 2.6, pos: [19.5, 0.6, 9.6], look: [13.6, 0.1, 0.6], fov: 32 },
  // 04 Takeoff: engine at runway level, then the rotation seen from behind and beside
  { t: 3.05, pos: [26, -3.0, 24], look: [-2, -1.4, 0], fov: 32 },
  { t: 3.4, pos: [-4, -2.8, 30], look: [2, -0.8, 0], fov: 32 },
  { t: 3.75, pos: [-6, -2.9, 66], look: [3, 2.2, 0], fov: 30 },
  { t: 4.02, pos: [-46, -9, 34], look: [6, 3.0, 0], fov: 30 },
  // 05 Climb: over the wing, above the cloud deck
  { t: 4.2, pos: [-6.2, 4.4, 3.4], look: [-6.4, -0.8, 21], fov: 44 },
  { t: 4.92, pos: [-7.2, 4.0, 3.6], look: [-7.8, -1.6, 21], fov: 44 },
  // 06 Cruise: a distant silhouette against the burgundy sky
  { t: 5.1, pos: [-40, -9, 150], look: [0, 1, 0], fov: 20 },
  { t: 5.9, pos: [26, -6, 156], look: [0, 1, 0], fov: 20 },
  // 07 Descent: from a cabin window
  { t: 6.08, pos: [-2.4, 0.9, 2.45], look: [-6.5, -1.6, 21], fov: 46 },
  { t: 6.9, pos: [-2.4, 0.9, 2.45], look: [-6.8, -3.4, 21], fov: 46 },
  // 08 Next destination: behind the aircraft as it flies toward the horizon
  { t: 7.2, pos: [-58, 5, 9], look: [20, 0.5, 0], fov: 28 },
  { t: 8.0, pos: [-64, 7, 5], look: [80, 4, 0], fov: 28 },
];

/**
 * Cubic Hermite through the keys with Catmull-Rom tangents, clamped to the segment length.
 * Clamping prevents overshoot when a long move sits next to a hold (e.g. cruise → cabin window).
 */
function hermite(p0: V3, p1: V3, p2: V3, p3: V3, u: number): V3 {
  const seg = Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
  const tangent = (a: V3, b: V3) => {
    const t = [(b[0] - a[0]) / 2, (b[1] - a[1]) / 2, (b[2] - a[2]) / 2];
    const len = Math.hypot(t[0], t[1], t[2]);
    const k = len > seg && len > 0 ? seg / len : 1;
    return t.map((v) => v * k);
  };
  const m1 = tangent(p0, p2);
  const m2 = tangent(p1, p3);
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  return [0, 1, 2].map((j) => h00 * p1[j] + h10 * m1[j] + h01 * p2[j] + h11 * m2[j]) as V3;
}

export function cameraAt(t: number) {
  const k = camKeys;
  let i = 0;
  while (i < k.length - 2 && k[i + 1].t < t) i++;
  const a = k[Math.max(0, i - 1)];
  const b = k[i];
  const c = k[i + 1];
  const d = k[Math.min(k.length - 1, i + 2)];
  const u = smooth(clamp((t - b.t) / (c.t - b.t)));
  return { pos: hermite(a.pos, b.pos, c.pos, d.pos, u), look: hermite(a.look, b.look, c.look, d.look, u), fov: lerp(b.fov, c.fov, u) };
}

/* ------------------------------ Aircraft track ------------------------------ */

const deg = Math.PI / 180;

/** Pitch (nose-up positive). Rotation happens at t ≈ 3.62–3.82. */
export const pitchAt = (t: number) =>
  piecewise([[3.6, 0], [3.82, 9.5], [4.2, 8], [4.5, 2.5], [5.2, 1], [6.1, 0], [6.3, -2.5], [6.95, -2], [7.2, 0.5], [8, 2]], t) * deg;
export const rollAt = (t: number) => piecewise([[4.3, 0], [4.6, -2.5], [5.0, 0], [7.3, 0], [7.6, -6], [8, -2]], t) * deg;
/** Landing gear: 1 down, 0 up. */
export const gearAt = (t: number) => piecewise([[3.9, 1], [4.05, 0], [6.7, 0], [6.95, 0]], t);
/** Aircraft moves away toward the horizon in the final chapter. */
export const awayAt = (t: number) => piecewise([[7.15, 0], [8, 280]], t);
export const awayYAt = (t: number) => piecewise([[7.15, 0], [8, 22]], t);

/** World altitude in scene units (not the displayed flight level). Ground is at 0. */
export const altitudeAt = (t: number) =>
  piecewise([[3.68, 0], [4.0, 80], [4.18, 225], [5.0, 300], [6.1, 300], [6.95, 205], [8, 190]], t);

/** Ground distance travelled. Accelerates down the runway in chapter 04. */
export function distanceAt(t: number) {
  if (t < 3.0) return 0;
  if (t < 3.72) {
    const u = (t - 3.0) / 0.72;
    return 520 * u * u;
  }
  return 520 + (t - 3.72) * 1450;
}

/** How much the live scene shows through the DOM, per chapter. */
export const canvasOpacityAt = (t: number) =>
  piecewise([[4.27, 1], [4.36, 0.22], [4.88, 0.22], [5.02, 1]], t);
