import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Aircraft } from './Aircraft';
import { Clouds, GROUND_Y, Ground, Stars } from './Atmosphere';
import { emitFlight, flight } from '../flight/store';
import { altitudeAt, awayAt, awayYAt, cameraAt, canvasOpacityAt, gearAt, pitchAt, rollAt } from '../flight/spline';
import { lerp, nightAt, piecewise, range, skyAt, sunAt } from '../flight/plan';

const posterParam = new URLSearchParams(location.search).get('poster');
const POSTER_T = posterParam !== null ? parseFloat(posterParam) : null;

declare global {
  interface Window {
    __posterReady?: boolean;
  }
}

const ANCHORS: Record<string, [number, number, number]> = {
  nose: [22, -0.3, 0],
  wing: [-5.9, 0.2, 17.6],
  fin: [-20.6, 9.5, 0],
  door: [15.9, 0.2, 2.05],
  engine: [5.9, -2.75, 7.0],
};

/**
 * Frame driver for frameloop="demand": renders at full rate while the flight is moving (scroll,
 * pointer, damping), at ~30 fps for the idle float, and not at all when the scene is dimmed.
 */
function Driver() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let px = flight.px;
    let py = flight.py;
    const tick = (now: number) => {
      const moving = Math.abs(flight.t - flight.ts) > 0.0004 || px !== flight.px || py !== flight.py;
      px = flight.px;
      py = flight.py;
      const visible = canvasOpacityAt(flight.ts) > 0.5 && !document.hidden;
      if (moving || (visible && now - last > 33)) {
        last = now;
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
  return null;
}

function Rig({ wrapper, lite }: { wrapper: HTMLDivElement | null; lite: boolean }) {
  const { camera, scene, size } = useThree();
  const pivot = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const gear = useRef<THREE.Group | null>(null);
  const mats = useRef<{ skin: THREE.MeshStandardMaterial; lines: THREE.LineBasicMaterial } | null>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const frames = useRef(0);
  const [low, setLow] = useState(true);
  const fog = useMemo(() => new THREE.Fog('#EEEDEA', 120, 900), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const box = useMemo(() => new THREE.Box3(), []);
  const gold = useMemo(() => new THREE.Color('#FFD27A'), []);
  const white = useMemo(() => new THREE.Color('#FFFFFF'), []);

  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame((state, dt) => {
    const poster = POSTER_T !== null;
    const target = poster ? POSTER_T! : flight.t;
    flight.ts = poster ? target : lerp(flight.ts, target, 1 - Math.exp(-Math.min(dt, 0.1) * 3.4));
    const t = flight.ts;
    const time = poster ? 0 : state.clock.elapsedTime;

    // Camera on the authored spline, with a little pointer parallax that fades after the lounge.
    const cam = cameraAt(t);
    const portrait = size.width / size.height < 1;
    const widen = portrait ? 1.55 : size.width / size.height < 1.4 ? 1.18 : 1;
    const influence = poster ? 0 : 1 - range(t, 0.9, 2.0) * 0.7;
    camera.position.set(
      cam.pos[0] + flight.px * 1.6 * influence,
      cam.pos[1] - flight.py * 0.9 * influence,
      cam.pos[2],
    );
    look.set(cam.look[0], cam.look[1], cam.look[2]);
    camera.lookAt(look);
    const pc = camera as THREE.PerspectiveCamera;
    const fov = cam.fov * widen;
    if (Math.abs(pc.fov - fov) > 0.01) {
      pc.fov = fov;
      pc.updateProjectionMatrix();
    }

    // Aircraft: pivots on the main gear at rotation; idle float is tiny and slow.
    if (pivot.current && body.current) {
      const alt = altitudeAt(t);
      const air = range(alt, 0, 30);
      const float = poster ? 0 : Math.sin(time * 0.55) * 0.07 * (0.3 + air);
      pivot.current.position.set(awayAt(t) - 1.2, GROUND_Y + awayYAt(t) + float, 0);
      pivot.current.rotation.set(
        rollAt(t) + (poster ? 0 : Math.sin(time * 0.37) * 0.004 * (0.3 + air)),
        flight.px * 0.035 * influence,
        pitchAt(t) - flight.py * 0.012 * influence,
      );
      body.current.position.set(1.2, -GROUND_Y, 0);
      if (gear.current) {
        const g = gearAt(t);
        gear.current.scale.set(1, Math.max(g, 0.001), 1);
        gear.current.visible = g > 0.02;
      }
      const isLow = alt < 25;
      if (isLow !== low) setLow(isLow);
    }

    // Light and atmosphere follow the altitude palette.
    const sky = skyAt(t);
    fog.color.set(sky[2]);
    const alt = altitudeAt(t);
    fog.near = alt < 60 ? 140 : 260;
    fog.far = alt < 60 ? 1100 : 2200;
    const night = nightAt(t);
    const sunK = sunAt(t);
    if (sun.current) {
      sun.current.intensity = lerp(2.2, 0.35, night);
      sun.current.color.copy(white).lerp(gold, Math.min(1, sunK * 0.9));
    }
    if (rim.current) rim.current.intensity = night * 2.4 + piecewise([[7.1, 0], [8, 1.2]], t);
    if (hemi.current) hemi.current.intensity = lerp(1.0, 0.25, night);
    if (mats.current) {
      mats.current.skin.envMapIntensity = lerp(1.15, 0.3, night);
      mats.current.lines.opacity = lerp(0.32, 0.12, night);
    }

    // Project anchors and bounds for the DOM (labels, cursor).
    if (body.current) {
      const w = size.width;
      const h = size.height;
      for (const [k, p] of Object.entries(ANCHORS)) {
        v.set(p[0], p[1], p[2]);
        body.current.localToWorld(v).project(camera);
        flight.anchors[k] = [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h];
      }
      box.setFromObject(body.current, false);
      const xs: number[] = [];
      const ys: number[] = [];
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
        if (v.z < 1) {
          xs.push((v.x * 0.5 + 0.5) * w);
          ys.push((-v.y * 0.5 + 0.5) * h);
        }
      }
      flight.aircraftRect = xs.length
        ? { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
        : null;
    }

    if (wrapper) wrapper.style.opacity = poster ? '1' : String(canvasOpacityAt(t));

    frames.current++;
    if (frames.current === 2) {
      flight.sceneReady = true;
      emitFlight();
    }
    if (poster && frames.current === 8) window.__posterReady = true;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#F4F2EE', '#8a7f78', 1]} />
      <directionalLight ref={sun} position={[60, 80, 50]} intensity={2.2} />
      <directionalLight ref={rim} position={[-80, 30, -120]} intensity={0} color="#EAAA00" />
      <group ref={pivot}>
        <group ref={body}>
          <Aircraft lite={lite} gearRef={gear} materialsRef={mats} />
        </group>
      </group>
      {low && (
        <ContactShadows
          position={[0, GROUND_Y + 0.05, 0]}
          scale={70}
          far={9}
          blur={2.4}
          opacity={0.42}
          resolution={lite ? 256 : 512}
          color="#3A0F34"
          frames={POSTER_T !== null || lite ? 1 : Infinity}
        />
      )}
    </>
  );
}

export default function AircraftScene({ lite, active }: { lite: boolean; active: boolean }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [dpr, setDpr] = useState(lite ? 1.25 : 1.75);
  const poster = POSTER_T !== null;

  useEffect(() => setEl(wrapper.current), []);

  return (
    <div ref={wrapper} className="scene-canvas" aria-hidden="true">
      <Canvas
        dpr={poster ? 1 : [1, dpr]}
        frameloop={!active ? 'never' : poster ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: poster }}
        camera={{ fov: 30, near: 0.4, far: 4000, position: [40, 3, 44] }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(lite ? 1.25 : 1.75)} />
        {!poster && <Driver />}
        <Rig wrapper={el} lite={lite} />
        <Ground />
        <Clouds count={lite ? 70 : 150} />
        <Stars count={lite ? 300 : 700} />
        <Environment resolution={lite ? 64 : 128} frames={1}>
          <color attach="background" args={['#B9B4AE']} />
          <Lightformer form="rect" intensity={2.2} position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[30, 30, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.4} position={[0, 2, 14]} scale={[40, 1.2, 1]} color="#F4F2EE" />
          <Lightformer form="rect" intensity={0.9} position={[0, -1, -14]} scale={[40, 0.8, 1]} color="#F4F2EE" />
          <Lightformer form="rect" intensity={1.2} position={[14, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[12, 2, 1]} color="#F3D48A" />
          <Lightformer form="rect" intensity={0.5} position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} color="#7a5a6e" />
        </Environment>
      </Canvas>
    </div>
  );
}
