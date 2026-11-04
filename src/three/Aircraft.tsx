import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  ENGINE, cheatlineCurve, cockpitTransforms, doorLines, finSections, fuselageGeometry, loftGeometry, mirrorZ,
  nacelleGeometry, stabiliserSections, stationLines, windowTransforms, wingSections, wingletSections,
} from './aircraftGeometry';

function roundedWindow() {
  const w = 0.13, h = 0.19, r = 0.1;
  const sh = new THREE.Shape();
  sh.moveTo(-w, -h + r);
  sh.lineTo(-w, h - r);
  sh.quadraticCurveTo(-w, h, 0, h);
  sh.quadraticCurveTo(w, h, w, h - r);
  sh.lineTo(w, -h + r);
  sh.quadraticCurveTo(w, -h, 0, -h);
  sh.quadraticCurveTo(-w, -h, -w, -h + r);
  return new THREE.ShapeGeometry(sh, 4);
}

export const LIVERY = {
  silver: '#E5E4E2',
  burgundy: '#3A0F34',
  gold: '#EAAA00',
  ink: '#2a1027',
};

interface Props {
  lite?: boolean;
  gearRef?: React.MutableRefObject<THREE.Group | null>;
  materialsRef?: React.MutableRefObject<{ skin: THREE.MeshStandardMaterial; lines: THREE.LineBasicMaterial } | null>;
}

function Instances({ matrices, geometry, material }: { matrices: THREE.Matrix4[]; geometry: THREE.BufferGeometry; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current!.setMatrixAt(i, m));
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return <instancedMesh ref={ref} args={[geometry, material, matrices.length]} />;
}

export const Aircraft = forwardRef<THREE.Group, Props>(function Aircraft({ lite, gearRef, materialsRef }, ref) {
  const geo = useMemo(() => {
    const wingR = loftGeometry(wingSections(), lite ? 12 : 20);
    const wingletR = loftGeometry(wingletSections(), 10);
    const stabR = loftGeometry(stabiliserSections(), 12);
    const nacelle = nacelleGeometry();
    return {
      fuselage: fuselageGeometry(lite ? 40 : 72),
      wingR, wingL: mirrorZ(wingR),
      wingletR, wingletL: mirrorZ(wingletR),
      stabR, stabL: mirrorZ(stabR),
      fin: loftGeometry(finSections(), 14),
      nacelle,
      stations: stationLines(),
      doors: doorLines(),
      wingEdges: new THREE.EdgesGeometry(wingR, 28),
      wingEdgesL: new THREE.EdgesGeometry(mirrorZ(wingR), 28),
      finEdges: new THREE.EdgesGeometry(loftGeometry(finSections(), 14), 28),
      cheatR: new THREE.TubeGeometry(cheatlineCurve(1), 120, 0.035, 5, false),
      cheatL: new THREE.TubeGeometry(cheatlineCurve(-1), 120, 0.035, 5, false),
      window: roundedWindow(),
      cockpit: new THREE.PlaneGeometry(0.42, 0.24),
      fan: new THREE.CircleGeometry(0.88, 40),
      spinner: new THREE.ConeGeometry(0.28, 0.55, 24),
      pylon: new THREE.BoxGeometry(2.6, 1.0, 0.32),
      strut: new THREE.CylinderGeometry(0.11, 0.11, 2.4, 12),
      wheel: new THREE.CylinderGeometry(0.56, 0.56, 0.42, 24),
      winR: windowTransforms(1),
      winL: windowTransforms(-1),
      cockpitM: cockpitTransforms(),
    };
  }, [lite]);

  const mat = useMemo(() => {
    const skin = new THREE.MeshStandardMaterial({ color: LIVERY.silver, metalness: 0.62, roughness: 0.3, envMapIntensity: 1.1 });
    const tail = new THREE.MeshStandardMaterial({ color: LIVERY.burgundy, metalness: 0.35, roughness: 0.38 });
    const gold = new THREE.MeshStandardMaterial({ color: LIVERY.gold, metalness: 0.8, roughness: 0.25, emissive: '#5a3c00', emissiveIntensity: 0.25 });
    const glass = new THREE.MeshStandardMaterial({ color: '#2a1228', metalness: 0.2, roughness: 0.15, side: THREE.DoubleSide });
    const dark = new THREE.MeshStandardMaterial({ color: '#2b2427', metalness: 0.5, roughness: 0.55 });
    const lines = new THREE.LineBasicMaterial({ color: LIVERY.burgundy, transparent: true, opacity: 0.32, depthWrite: false });
    const edges = new THREE.LineBasicMaterial({ color: LIVERY.burgundy, transparent: true, opacity: 0.45, depthWrite: false });
    return { skin, tail, gold, glass, dark, lines, edges };
  }, []);

  useLayoutEffect(() => {
    if (materialsRef) materialsRef.current = { skin: mat.skin, lines: mat.lines };
  }, [mat, materialsRef]);

  const engine = (side: 1 | -1) => (
    <group position={[ENGINE.x, ENGINE.y, ENGINE.z * side]} key={side}>
      <mesh geometry={geo.nacelle} material={mat.skin} castShadow />
      <mesh geometry={geo.fan} material={mat.dark} position={[2.3, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={geo.spinner} material={mat.dark} position={[2.45, 0, 0]} rotation={[0, 0, -Math.PI / 2]} />
      <mesh geometry={geo.pylon} material={mat.skin} position={[-0.2, 1.15, 0]} rotation={[0, 0, 0.08]} />
    </group>
  );

  const mainGear = (side: 1 | -1) => (
    <group position={[-1.2, -1.7, 3.7 * side]} key={side}>
      <mesh geometry={geo.strut} material={mat.dark} position={[0, -0.9, 0]} scale={[1, 0.8, 1]} />
      <mesh geometry={geo.wheel} material={mat.dark} position={[0, -1.85, 0.24 * side]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={geo.wheel} material={mat.dark} position={[0, -1.85, -0.24 * side]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );

  return (
    <group ref={ref}>
      <mesh geometry={geo.fuselage} material={mat.skin} castShadow />
      <mesh geometry={geo.wingR} material={mat.skin} castShadow />
      <mesh geometry={geo.wingL} material={mat.skin} castShadow />
      <mesh geometry={geo.wingletR} material={mat.tail} />
      <mesh geometry={geo.wingletL} material={mat.tail} />
      <mesh geometry={geo.stabR} material={mat.skin} />
      <mesh geometry={geo.stabL} material={mat.skin} />
      <mesh geometry={geo.fin} material={mat.tail} castShadow />
      <mesh geometry={geo.cheatR} material={mat.gold} />
      <mesh geometry={geo.cheatL} material={mat.gold} />
      {engine(1)}
      {engine(-1)}
      <Instances matrices={geo.winR} geometry={geo.window} material={mat.glass} />
      <Instances matrices={geo.winL} geometry={geo.window} material={mat.glass} />
      <Instances matrices={geo.cockpitM} geometry={geo.cockpit} material={mat.glass} />
      <lineSegments geometry={geo.stations} material={mat.lines} />
      <lineSegments geometry={geo.doors} material={mat.edges} />
      <lineSegments geometry={geo.wingEdges} material={mat.edges} />
      <lineSegments geometry={geo.wingEdgesL} material={mat.edges} />
      <lineSegments geometry={geo.finEdges} material={mat.lines} />
      <group ref={gearRef}>
        {mainGear(1)}
        {mainGear(-1)}
        <group position={[15.2, -1.6, 0]}>
          <mesh geometry={geo.strut} material={mat.dark} position={[0, -0.95, 0]} scale={[0.8, 0.85, 0.8]} />
          <mesh geometry={geo.wheel} material={mat.dark} position={[0, -1.98, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.75, 0.9, 0.75]} />
        </group>
      </group>
    </group>
  );
});
