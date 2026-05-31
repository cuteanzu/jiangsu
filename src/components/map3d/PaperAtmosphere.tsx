import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const PARTICLE_COUNT = 40;
const AREA_HALF = 4.5;

function sakuraTexture(): THREE.Texture {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(255,235,225,0.75)");
  grad.addColorStop(0.4, "rgba(252,220,215,0.45)");
  grad.addColorStop(0.7, "rgba(248,210,210,0.10)");
  grad.addColorStop(1, "rgba(248,210,210,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.premultiplyAlpha = true;
  return tex;
}

function SakuraParticles() {
  const texture = useMemo(() => sakuraTexture(), []);
  const geo = useMemo(() => new THREE.PlaneGeometry(0.08, 0.08), []);

  const particles = useMemo(() => {
    const arr: { pos: THREE.Vector3; phase: number; speed: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * AREA_HALF * 2,
          0.5 + Math.random() * 2.5,
          (Math.random() - 0.5) * AREA_HALF * 2,
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.4,
      });
    }
    return arr;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const children = groupRef.current?.children;
    if (!children) return;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const p = particles[i];
      child.position.x = p.pos.x + Math.sin(t * p.speed + p.phase) * 0.6;
      child.position.z = p.pos.z + Math.cos(t * p.speed * 0.7 + p.phase) * 0.5;
      child.position.y = p.pos.y + Math.sin(t * p.speed * 0.5 + p.phase) * 0.3;
      child.rotation.z = Math.sin(t * 0.3 + p.phase) * 0.3;
      const s = 0.7 + Math.sin(t * p.speed + p.phase) * 0.3;
      child.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((_p, i) => (
        <mesh key={i} geometry={geo} renderOrder={99}>
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            opacity={0.18}
            side={THREE.DoubleSide}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Soft mist planes near water areas
function MistClouds() {
  const clouds = useMemo(() => {
    const configs = [
      { pos: [2.1, 0.25, 2.3], scale: [0.8, 0.5, 0.8] },  // near Taihu
      { pos: [0.5, 0.3, -0.2], scale: [1.4, 0.4, 1.2] },   // along Yangtze
      { pos: [-0.7, 0.22, -1.1], scale: [0.7, 0.35, 0.7] }, // Hongze Lake
      { pos: [2.8, 0.28, 1.0], scale: [0.8, 0.3, 0.6] },    // east coast
    ];
    return configs.map((c) => ({
      pos: new THREE.Vector3(...c.pos),
      scale: new THREE.Vector3(...c.scale),
      phase: Math.random() * Math.PI * 2,
      speed: 0.12 + Math.random() * 0.25,
    }));
  }, []);

  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const half = size / 2;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, "rgba(255,255,255,0.12)");
    grad.addColorStop(0.5, "rgba(248,244,240,0.06)");
    grad.addColorStop(1, "rgba(248,244,240,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const children = groupRef.current?.children;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const c = clouds[i];
      children[i].position.x = c.pos.x + Math.sin(t * c.speed + c.phase) * 0.25;
      children[i].position.z = c.pos.z + Math.cos(t * c.speed * 0.6 + c.phase) * 0.2;
      const s = c.scale.x + Math.sin(t * c.speed * 0.4 + c.phase) * 0.05;
      children[i].scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <mesh
          key={i}
          geometry={geo}
          position={c.pos}
          scale={c.scale}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={0}
        >
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            opacity={0.55}
            side={THREE.DoubleSide}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function PaperAtmosphere() {
  return (
    <group>
      <SakuraParticles />
      <MistClouds />
    </group>
  );
}
