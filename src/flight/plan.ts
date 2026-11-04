/**
 * The flight plan. Scroll position is mapped to a flight time `t` in [0, 8):
 * the integer part is the chapter, the fraction is progress through it.
 * Everything that changes with scroll (sky, aircraft, camera, altimeter) reads from `t`.
 */
export interface Chapter {
  id: string;
  num: string;
  phase: string;
  title: string;
  /** Flight level shown on the altimeter at the start of the chapter. */
  fl: number;
}

export const chapters: Chapter[] = [
  { id: 'gate', num: '01', phase: 'Gate', title: 'Beyond the ordinary', fl: 0 },
  { id: 'lounge', num: '02', phase: 'Lounge', title: 'Skills & Languages', fl: 0 },
  { id: 'boarding', num: '03', phase: 'Boarding', title: 'Flight Profile', fl: 0 },
  { id: 'takeoff', num: '04', phase: 'Takeoff', title: 'My Journey', fl: 0 },
  { id: 'climb', num: '05', phase: 'Climb', title: 'Selected Projects', fl: 100 },
  { id: 'cruise', num: '06', phase: 'Cruise', title: 'Achievements', fl: 350 },
  { id: 'descent', num: '07', phase: 'Descent', title: 'Thinking & Interests', fl: 410 },
  { id: 'contact', num: '08', phase: 'Next Destination', title: 'Contact', fl: 100 },
];

/** Altimeter flight level by t. Piecewise linear through these points. */
const flKeys: [number, number][] = [
  [0, 0], [3.55, 0], [4.0, 100], [4.2, 240], [5.0, 350], [5.9, 410], [6.1, 410], [7.0, 100], [8, 30],
];

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export function piecewise(keys: [number, number][], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}

export const flightLevel = (t: number) => Math.round(piecewise(flKeys, t));

/* ---------------------------------- Sky ---------------------------------- */

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;

/** Sky gradient stops [zenith, middle, horizon] at key flight times. */
const skyKeys: [number, string, string, string][] = [
  [0.0, '#D8D6D2', '#E5E4E2', '#EFEEEB'], // gate haze
  [1.4, '#D3D0CB', '#E3E0DB', '#EBDDBE'], // lounge, low gold sun
  [2.2, '#DAD8D4', '#E5E4E2', '#EEEDEA'], // boarding
  [3.5, '#DCD9D3', '#E8E4DA', '#F1EAD8'], // runway
  [3.95, '#D9D1C0', '#E6DCC3', '#EFE3C4'], // rotation, silver warming
  [4.08, '#CFC9BC', '#DDD8CC', '#E8E2D2'], // inside cloud: diffuse
  [4.19, '#F0C24A', '#F5D27A', '#FBE7B5'], // breakthrough: gold
  [4.85, '#E9B83A', '#F2CD6E', '#F8E2A8'],
  [5.08, '#2A0A26', '#3A0F34', '#6B2A3C'], // cruise: burgundy, gold sun line
  [5.9, '#1D0619', '#3A0F34', '#5E2140'],
  [6.15, '#2A0A26', '#3A0F34', '#5E2140'],
  [6.95, '#C9C2C2', '#DCD8D5', '#E9E6E1'], // descent into warm silver
  [7.25, '#E2E0DC', '#EDE2C6', '#F2CE6A'], // next destination: gold horizon
  [8.0, '#E5E4E2', '#EFDDAA', '#EAAA00'],
];

const rgb = (c: RGB) => `rgb(${c.map((v) => Math.round(v)).join(',')})`;

export function skyAt(t: number): [string, string, string] {
  let i = 1;
  while (i < skyKeys.length - 1 && skyKeys[i][0] < t) i++;
  const a = skyKeys[i - 1];
  const b = skyKeys[i];
  const k = smooth(range(t, a[0], b[0]));
  return [1, 2, 3].map((j) => {
    const ca = hex(a[j] as string);
    const cb = hex(b[j] as string);
    return rgb([lerp(ca[0], cb[0], k), lerp(ca[1], cb[1], k), lerp(ca[2], cb[2], k)]);
  }) as [string, string, string];
}

/** 0 = day/silver, 1 = night/burgundy. Used for star visibility and aircraft lighting. */
export const nightAt = (t: number) => piecewise([[4.85, 0], [5.15, 1], [6.1, 1], [6.9, 0]], t);
/** Gold sun line intensity. */
export const sunAt = (t: number) => piecewise([[4.15, 0], [4.3, 1], [4.9, 0.8], [5.2, 0.55], [6.2, 0.4], [6.9, 0], [7.2, 0.6], [8, 1]], t);
