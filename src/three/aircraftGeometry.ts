/**
 * A generic twin-engine narrow-body airliner, built procedurally.
 * No real airline livery, registration or manufacturer mark. Proportions follow the
 * common single-aisle layout: ~44 m length, ~36 m span, ~27° wing sweep, low wing, T-less tail.
 *
 * Axes: +X nose, +Y up, +Z right side as seen by the camera. Units are metres.
 */
import * as THREE from 'three';

/* --------------------------------- Fuselage -------------------------------- */

// Station (x) → radius. Nose at +22, tail at -22.
const PROFILE: [number, number][] = [
  [22.0, 0.0], [21.85, 0.42], [21.5, 0.82], [20.9, 1.2], [20.0, 1.55], [18.8, 1.82], [17.2, 1.96],
  [15.5, 2.0], [-9.0, 2.0], [-11.5, 1.9], [-14, 1.66], [-16.5, 1.3], [-19, 0.86], [-21, 0.48], [-22.2, 0.22], [-22.5, 0.0],
];

export function radiusAt(x: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const [x0, r0] = PROFILE[i - 1];
    const [x1, r1] = PROFILE[i];
    if (x <= x0 && x >= x1) return r0 + ((x - x0) / (x1 - x0)) * (r1 - r0);
  }
  return 0;
}

/** Vertical offset of the fuselage centreline: the tail cone sweeps up, the nose droops slightly. */
export function centreYAt(x: number) {
  const r = radiusAt(x);
  if (x < -9) return (2 - r) * 0.82;
  if (x > 17) return -(2 - r) * 0.32;
  return 0;
}

export function fuselageGeometry(segments = 64) {
  const pts: THREE.Vector2[] = [];
  for (let x = -22.5; x <= 22.5; x += 0.25) pts.push(new THREE.Vector2(Math.max(radiusAt(x), 0.001), x));
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateZ(-Math.PI / 2); // lathe axis (Y) → X
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + centreYAt(p.getX(i)));
  g.computeVertexNormals();
  return g;
}

/** A point on the fuselage skin at station x, at angle a (0 = +Z side, π/2 = top). */
export function skinPoint(x: number, a: number, out = new THREE.Vector3(), lift = 0) {
  const r = radiusAt(x) + lift;
  return out.set(x, centreYAt(x) + Math.sin(a) * r, Math.cos(a) * r);
}

/* ---------------------------------- Lofts ---------------------------------- */

export interface Section {
  /** Leading-edge point. */
  le: THREE.Vector3;
  chord: number;
  /** Thickness as a fraction of chord. */
  thick: number;
  /** Direction of thickness (normal to the chord plane). */
  n: THREE.Vector3;
}

/** Cambered airfoil outline, closed, from trailing edge over the top back to trailing edge. */
function airfoil(count: number) {
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= count; i++) {
    const b = (1 - Math.cos((i / count) * Math.PI)) / 2; // cosine spacing
    const yt = 5 * (0.2969 * Math.sqrt(b) - 0.126 * b - 0.3516 * b * b + 0.2843 * b ** 3 - 0.1036 * b ** 4);
    const camber = 0.025 * Math.sin(Math.PI * b);
    top.push([b, camber + yt]);
    bottom.push([b, camber - yt * 0.8]);
  }
  return [...top.reverse(), ...bottom.slice(1)];
}

/** Loft airfoil sections into a closed surface with end caps. */
export function loftGeometry(sections: Section[], foilPoints = 18) {
  const foil = airfoil(foilPoints);
  const ring = foil.length;
  const pos: number[] = [];
  const idx: number[] = [];
  const chordDir = new THREE.Vector3(-1, 0, 0);
  sections.forEach((s) => {
    foil.forEach(([u, v]) => {
      const p = s.le.clone().addScaledVector(chordDir, u * s.chord).addScaledVector(s.n, v * s.thick * s.chord);
      pos.push(p.x, p.y, p.z);
    });
  });
  for (let si = 0; si < sections.length - 1; si++) {
    for (let i = 0; i < ring - 1; i++) {
      const a = si * ring + i;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  // end caps (fan around the section centroid)
  [0, sections.length - 1].forEach((si, k) => {
    const base = si * ring;
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < ring; i++) {
      cx += pos[(base + i) * 3]; cy += pos[(base + i) * 3 + 1]; cz += pos[(base + i) * 3 + 2];
    }
    const ci = pos.length / 3;
    pos.push(cx / ring, cy / ring, cz / ring);
    for (let i = 0; i < ring - 1; i++) {
      if (k === 0) idx.push(ci, base + i, base + i + 1);
      else idx.push(ci, base + i + 1, base + i);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const tan = Math.tan;
const DIHEDRAL = 5.5 * (Math.PI / 180);

/** Right wing (+Z). Mirror on Z for the left wing. Root kink inboard, swept outboard panel. */
export function wingSections(): Section[] {
  const y0 = -1.25;
  const yAt = (z: number) => y0 + (z - 1.7) * tan(DIHEDRAL);
  return [
    { le: V(4.2, yAt(1.7), 1.7), chord: 8.6, thick: 0.15, n: UP },
    { le: V(1.4, yAt(6.6), 6.6), chord: 6.0, thick: 0.125, n: UP },
    { le: V(-5.1, yAt(17.4), 17.4), chord: 1.75, thick: 0.1, n: UP },
  ];
}

export function wingletSections(): Section[] {
  const tip = wingSections()[2];
  const n = V(0, 0, 1);
  return [
    { le: tip.le.clone().add(V(0.0, 0, 0.02)), chord: 1.7, thick: 0.08, n },
    { le: tip.le.clone().add(V(-0.75, 0.55, 0.32)), chord: 1.2, thick: 0.08, n },
    { le: tip.le.clone().add(V(-1.7, 2.3, 0.46)), chord: 0.55, thick: 0.08, n },
  ];
}

export function stabiliserSections(): Section[] {
  return [
    { le: V(-15.6, 0.95, 0.6), chord: 4.6, thick: 0.1, n: UP },
    { le: V(-19.6, 1.45, 7.0), chord: 1.6, thick: 0.08, n: UP },
  ];
}

export function finSections(): Section[] {
  const n = V(0, 0, 1);
  return [
    { le: V(-13.2, 1.2, 0), chord: 7.6, thick: 0.1, n },
    { le: V(-15.6, 3.6, 0), chord: 5.6, thick: 0.1, n },
    { le: V(-20.1, 9.4, 0), chord: 2.3, thick: 0.09, n },
  ];
}

export function mirrorZ(g: THREE.BufferGeometry) {
  const m = g.clone();
  m.scale(1, 1, -1);
  // flip winding so normals point outward after the mirror
  const index = m.getIndex()!;
  const arr = index.array as Uint16Array | Uint32Array;
  for (let i = 0; i < arr.length; i += 3) {
    const t = arr[i + 1];
    arr[i + 1] = arr[i + 2];
    arr[i + 2] = t;
  }
  index.needsUpdate = true;
  m.computeVertexNormals();
  return m;
}

/* --------------------------------- Engine --------------------------------- */

export const ENGINE = { x: 3.4, y: -2.75, z: 5.9 };

export function nacelleGeometry() {
  const prof: [number, number][] = [
    [2.55, 0.86], [2.6, 0.96], [2.5, 1.06], [2.1, 1.12], [0.6, 1.12], [-0.9, 1.02], [-1.7, 0.86], [-1.8, 0.7],
    [-1.8, 0.56], [-2.7, 0.34], [-3.1, 0.0],
  ];
  const pts = prof.map(([x, r]) => new THREE.Vector2(r, x)).reverse();
  const g = new THREE.LatheGeometry(pts, 40);
  g.rotateZ(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------ Drawing lines ------------------------------ */

/** Station rings: the frame lines of the technical drawing. */
export function stationLines() {
  const pts: number[] = [];
  const stations = [19, 15.6, 12, 8, 4, 0, -4, -8, -12, -16, -19.5];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  stations.forEach((x) => {
    for (let i = 0; i < 72; i++) {
      skinPoint(x, (i / 72) * Math.PI * 2, a, 0.012);
      skinPoint(x, ((i + 1) / 72) * Math.PI * 2, b, 0.012);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });
  // longitudinal construction lines: crown and waterline
  [Math.PI / 2].forEach((ang) => {
    for (let x = 21.2; x > -21.6; x -= 0.4) {
      skinPoint(x, ang, a, 0.012);
      skinPoint(x - 0.4, ang, b, 0.012);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Door outlines on both sides. */
export function doorLines() {
  const pts: number[] = [];
  const doors: [number, number, number][] = [
    [15.9, 0.95, 1.85], // forward door: x, width, height
    [-17.2, 0.8, 1.7],
    [0.7, 0.55, 0.9], // overwing exits
    [-0.6, 0.55, 0.9],
  ];
  const p = new THREE.Vector3();
  [1, -1].forEach((side) => {
    doors.forEach(([x, w, h]) => {
      const y0 = -0.8 + (h < 1 ? 0.55 : 0);
      const corners: [number, number][] = [];
      const steps = 14;
      for (let i = 0; i <= steps; i++) corners.push([x - w / 2 + (w * i) / steps, y0]);
      for (let i = 0; i <= steps; i++) corners.push([x + w / 2, y0 + (h * i) / steps]);
      for (let i = 0; i <= steps; i++) corners.push([x + w / 2 - (w * i) / steps, y0 + h]);
      for (let i = 0; i <= steps; i++) corners.push([x - w / 2, y0 + h - (h * i) / steps]);
      for (let i = 0; i < corners.length - 1; i++) {
        for (const [cx, cy] of [corners[i], corners[i + 1]]) {
          const r = radiusAt(cx) + 0.015;
          const yy = cy;
          const z = Math.sqrt(Math.max(r * r - yy * yy, 0.01)) * side;
          p.set(cx, yy + centreYAt(cx), z);
          pts.push(p.x, p.y, p.z);
        }
      }
    });
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Cabin window positions and normals on one side. */
export function windowTransforms(side: 1 | -1) {
  const out: THREE.Matrix4[] = [];
  const skip = (x: number) => Math.abs(x - 15.9) < 0.9 || Math.abs(x - 0.05) < 1.3 || Math.abs(x + 17.2) < 0.8;
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);
  for (let x = 14.6; x > -16.4; x -= 0.95) {
    if (skip(x)) continue;
    const y = 0.42;
    const r = radiusAt(x) + 0.006;
    const z = Math.sqrt(r * r - y * y) * side;
    const n = new THREE.Vector3(0, y, z).normalize();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    out.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y + centreYAt(x), z), q, s));
  }
  return out;
}

/** Cockpit windscreen panels. */
export function cockpitTransforms() {
  const out: THREE.Matrix4[] = [];
  const s = new THREE.Vector3(1, 1, 1);
  [1, -1].forEach((side) => {
    [21.12, 20.66, 20.16].forEach((x, i) => {
      const ang = 0.5 - i * 0.04;
      const p = skinPoint(x, side > 0 ? ang : Math.PI - ang, new THREE.Vector3(), 0.01);
      const slope = (radiusAt(x + 0.1) - radiusAt(x - 0.1)) / 0.2;
      const n = new THREE.Vector3(-slope, Math.sin(ang), Math.cos(ang) * side).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
      out.push(new THREE.Matrix4().compose(p, q, s));
    });
  });
  return out;
}

/** The thin Aviation Gold cheatline along both sides, rising into the fin root. */
export function cheatlineCurve(side: 1 | -1) {
  const pts: THREE.Vector3[] = [];
  for (let x = 19.6; x >= -14; x -= 0.6) {
    const ang = x < -6 ? -0.28 + ((-6 - x) / 8) * 0.5 : -0.28;
    pts.push(skinPoint(x, side > 0 ? ang : Math.PI - ang, new THREE.Vector3(), 0.02));
  }
  return new THREE.CatmullRomCurve3(pts);
}
