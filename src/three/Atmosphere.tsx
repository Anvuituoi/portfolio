import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { flight } from '../flight/store';
import { altitudeAt, distanceAt } from '../flight/spline';
import { nightAt, piecewise } from '../flight/plan';

export const GROUND_Y = -4.1;
const CLOUD_BASE = 120;
const CLOUD_TOP = 190;

/** Soft cloud puff drawn once into a canvas texture (no image download). */
function cloudTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const r = s * (0.08 + rand() * 0.16);
    const a = rand() * Math.PI * 2;
    const d = rand() * s * 0.26;
    const x = s / 2 + Math.cos(a) * d;
    const y = s / 2 + Math.sin(a) * d * 0.6;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.5)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Alpha masks so the ground dissolves into the DOM sky instead of ending in a hard horizon. */
function fadeTexture(kind: 'radial' | 'strip') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd =
    kind === 'radial'
      ? g.createRadialGradient(128, 128, 0, 128, 128, 128)
      : g.createLinearGradient(0, 0, 256, 0);
  if (kind === 'radial') {
    grd.addColorStop(0, '#fff');
    grd.addColorStop(0.35, '#fff');
    grd.addColorStop(1, '#000');
  } else {
    grd.addColorStop(0, '#000');
    grd.addColorStop(0.3, '#fff');
    grd.addColorStop(0.7, '#fff');
    grd.addColorStop(1, '#000');
  }
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

const silverCloud = new THREE.Color('#F4F3F1');
const goldCloud = new THREE.Color('#FFE3A1');
const nightCloud = new THREE.Color('#6d3a5c');
const tmp = new THREE.Color();

export function Clouds({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(cloudTexture, []);
  const material = useMemo(
    () => new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: true, opacity: 0.95 }),
    [tex],
  );
  const puffs = useMemo(() => {
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 1400,
      y: CLOUD_BASE + rand() * (CLOUD_TOP - CLOUD_BASE),
      z: (rand() - 0.5) * 900,
      s: 60 + rand() * 120,
    }));
  }, [count]);
  const sprites = useRef<THREE.Sprite[]>([]);

  useFrame(() => {
    const t = flight.ts;
    const alt = altitudeAt(t);
    const dist = distanceAt(t);
    if (!group.current) return;
    group.current.visible = t > 3.55;
    if (!group.current.visible) return;
    const gold = piecewise([[4.1, 0], [4.2, 1], [4.9, 0.8], [5.2, 0]], t);
    tmp.copy(silverCloud).lerp(goldCloud, gold).lerp(nightCloud, nightAt(t) * 0.9);
    material.color.copy(tmp);
    puffs.forEach((p, i) => {
      const s = sprites.current[i];
      if (!s) return;
      const x = ((((p.x - dist * 0.9) % 1400) + 2100) % 1400) - 700;
      s.position.set(x, p.y - alt + GROUND_Y, p.z);
    });
  });

  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite
          key={i}
          ref={(el) => { if (el) sprites.current[i] = el; }}
          material={material}
          scale={[p.s, p.s * 0.55, 1]}
        />
      ))}
    </group>
  );
}

export function Ground() {
  const group = useRef<THREE.Group>(null);
  const dashes = useRef<THREE.InstancedMesh>(null);
  const lights = useRef<THREE.Points>(null);
  const DASH = 36;
  const N = 60;

  const radial = useMemo(() => fadeTexture('radial'), []);
  const strip = useMemo(() => fadeTexture('strip'), []);
  const lightGeo = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 120; i++) {
      const x = -1200 + i * 20;
      pts.push(x, 0.15, 24, x, 0.15, -24);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame(() => {
    const t = flight.ts;
    const alt = altitudeAt(t);
    if (!group.current) return;
    group.current.visible = alt < 260;
    group.current.position.y = GROUND_Y - alt;
    const d = distanceAt(t);
    const off = d % DASH;
    if (dashes.current) dashes.current.position.x = -off;
    if (lights.current) lights.current.position.x = -(d % 20);
  });

  const dashMatrices = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    for (let i = 0; i < N; i++) m.push(new THREE.Matrix4().makeTranslation(-900 + i * DASH, 0.03, 0));
    return m;
  }, []);

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1800, 1800]} />
        <meshStandardMaterial color="#DAD8D3" roughness={1} metalness={0} transparent alphaMap={radial} depthWrite={false} />
      </mesh>
      {/* runway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1600, 46]} />
        <meshStandardMaterial color="#C4C1BC" roughness={0.95} transparent alphaMap={strip} depthWrite={false} />
      </mesh>
      {/* the golden route begins as the taxi line under the aircraft */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[1600, 0.45]} />
        <meshBasicMaterial color="#EAAA00" transparent alphaMap={strip} depthWrite={false} />
      </mesh>
      <instancedMesh
        ref={dashes}
        args={[new THREE.BoxGeometry(18, 0.02, 0.9), new THREE.MeshBasicMaterial({ color: '#F4F3F0', transparent: true, opacity: 0.8 }), N]}
        onUpdate={(self) => {
          dashMatrices.forEach((m, i) => self.setMatrixAt(i, m));
          self.position.z = 3.2;
          self.instanceMatrix.needsUpdate = true;
        }}
      />
      <points ref={lights} geometry={lightGeo}>
        <pointsMaterial color="#F6D27A" size={0.35} sizeAttenuation transparent alphaMap={strip} />
      </points>
    </group>
  );
}

export function Stars({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    let seed = 3;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const p: number[] = [];
    for (let i = 0; i < count; i++) {
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(rand() * 0.9 + 0.1 - 0.05);
      const r = 1500;
      p.push(Math.cos(th) * Math.sin(ph) * r, Math.cos(ph) * r * 0.9 + 80, Math.sin(th) * Math.sin(ph) * r);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, [count]);
  const mat = useMemo(
    () => new THREE.PointsMaterial({ color: '#F3E2B2', size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }),
    [],
  );
  useFrame(() => {
    const n = nightAt(flight.ts);
    mat.opacity = n * 0.85;
    if (ref.current) ref.current.visible = n > 0.01;
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}
