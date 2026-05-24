import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// ═══════════════════════  Yangtze River  ═══════════════════════

function YangtzeRiver() {
  const tubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-3.0, 0, -0.48),
        new THREE.Vector3(-2.4, 0, -0.42),
        new THREE.Vector3(-1.6, 0, -0.32),
        new THREE.Vector3(-0.9, 0, -0.18),
        new THREE.Vector3(-0.2, 0, -0.06),
        new THREE.Vector3(0.3, 0, 0.05),
        new THREE.Vector3(0.9, 0, 0.04),
        new THREE.Vector3(1.6, 0, 0.14),
        new THREE.Vector3(2.2, 0, 0.28),
        new THREE.Vector3(2.9, 0, 0.38),
        new THREE.Vector3(3.4, 0, 0.52),
      ],
      false, "catmullrom", 0.7,
    );
    return new THREE.TubeGeometry(curve, 120, 0.04, 16, false);
  }, []);

  // Thin highlight line running along the river
  const highlightGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-3.0, 0, -0.48),
        new THREE.Vector3(-2.4, 0, -0.42),
        new THREE.Vector3(-1.6, 0, -0.32),
        new THREE.Vector3(-0.9, 0, -0.18),
        new THREE.Vector3(-0.2, 0, -0.06),
        new THREE.Vector3(0.3, 0, 0.05),
        new THREE.Vector3(0.9, 0, 0.04),
        new THREE.Vector3(1.6, 0, 0.14),
        new THREE.Vector3(2.2, 0, 0.28),
        new THREE.Vector3(2.9, 0, 0.38),
        new THREE.Vector3(3.4, 0, 0.52),
      ],
      false, "catmullrom", 0.7,
    );
    return new THREE.TubeGeometry(curve, 120, 0.012, 8, false);
  }, []);

  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = 0.26 + Math.sin(Date.now() * 0.0005) * 0.04;
    }
  });

  return (
    <group>
      {/* Main river body */}
      <mesh geometry={tubeGeo} position={[0, 0.285, 0]} renderOrder={1}>
        <meshBasicMaterial
          ref={matRef}
          color="#AEE6FF"
          transparent
          opacity={0.26}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Thin highlight line */}
      <mesh geometry={highlightGeo} position={[0, 0.29, 0]} renderOrder={2}>
        <meshBasicMaterial
          color="#D0F0FF"
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ═══════════════════════  Taihu Lake  ═══════════════════════

function TaihuLake() {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(0.48, 52);
    g.scale(1, 1.5, 1);
    return g;
  }, []);

  // Edge ring for subtle shoreline definition
  const ringGeo = useMemo(() => {
    const g = new THREE.RingGeometry(0.44, 0.50, 64);
    g.scale(1, 1.5, 1);
    return g;
  }, []);

  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = 0.47 + Math.sin(Date.now() * 0.0004 + 1) * 0.04;
    }
    if (ringRef.current) {
      ringRef.current.opacity = 0.18 + Math.sin(Date.now() * 0.0005 + 0.5) * 0.03;
    }
  });

  return (
    <group>
      {/* Lake body */}
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[2.1, 0.29, 2.3]}>
        <meshBasicMaterial
          ref={matRef}
          color="#BFE7FF"
          transparent
          opacity={0.47}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Edge highlight */}
      <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]} position={[2.1, 0.295, 2.3]} renderOrder={2}>
        <meshBasicMaterial
          ref={ringRef}
          color="#FFFFFF"
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ═══════════════════════  Grand Canal  ═══════════════════════

function GrandCanal() {
  const tubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(2.5, 0, 2.5),
        new THREE.Vector3(1.8, 0, 1.8),
        new THREE.Vector3(1.3, 0, 1.3),
        new THREE.Vector3(0.2, 0, 0.4),
        new THREE.Vector3(-0.2, 0, -0.5),
        new THREE.Vector3(-0.4, 0, -1.2),
        new THREE.Vector3(-0.6, 0, -1.8),
        new THREE.Vector3(-0.9, 0, -2.2),
        new THREE.Vector3(-1.2, 0, -2.4),
        new THREE.Vector3(-2.0, 0, -2.7),
        new THREE.Vector3(-2.5, 0, -2.9),
      ],
      false, "catmullrom", 0.5,
    );
    return new THREE.TubeGeometry(curve, 80, 0.018, 8, false);
  }, []);

  return (
    <mesh geometry={tubeGeo} position={[0, 0.27, 0]} renderOrder={1}>
      <meshBasicMaterial
        color="#A8D8E0"
        transparent
        opacity={0.22}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ═══════════════════════  Eastern Coastline  ═══════════════════════

function CoastlineGlow() {
  const spots = useMemo(() => {
    const configs: { pos: [number, number, number]; w: number; h: number }[] = [
      { pos: [0.6, 0.275, -2.9], w: 0.18, h: 1.1 },
      { pos: [0.9, 0.275, -2.0], w: 0.16, h: 0.9 },
      { pos: [1.2, 0.275, -1.0], w: 0.15, h: 0.8 },
      { pos: [1.5, 0.275, 0.0], w: 0.15, h: 0.8 },
      { pos: [2.0, 0.275, 0.7], w: 0.14, h: 0.7 },
      { pos: [2.6, 0.275, 1.4], w: 0.13, h: 0.6 },
    ];
    return configs.map((c) => ({
      pos: c.pos,
      geo: new THREE.PlaneGeometry(c.w, c.h),
    }));
  }, []);

  return (
    <>
      {spots.map((spot, i) => (
        <mesh
          key={`coast-${i}`}
          geometry={spot.geo}
          rotation={[-Math.PI / 2, 0, 0]}
          position={spot.pos}
        >
          <meshBasicMaterial
            color="#C8E8F8"
            transparent
            opacity={0.24}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════  Subtle water rings (decorative) ═══════════════════════

function WaterAccents() {
  const rings = useMemo(() => {
    const items: { pos: [number, number, number]; radius: number; opacity: number }[] = [
      { pos: [-2.4, 0.275, -2.6], radius: 0.15, opacity: 0.10 },
      { pos: [0.0, 0.275, 0.0], radius: 0.12, opacity: 0.08 },
      { pos: [2.6, 0.275, 0.3], radius: 0.12, opacity: 0.08 },
    ];
    return items.map((item) => ({
      ...item,
      geo: new THREE.RingGeometry(item.radius * 0.6, item.radius, 40),
    }));
  }, []);

  return (
    <>
      {rings.map((ring, i) => (
        <mesh
          key={`accent-${i}`}
          geometry={ring.geo}
          rotation={[-Math.PI / 2, 0, 0]}
          position={ring.pos}
          renderOrder={1}
        >
          <meshBasicMaterial
            color="#C8E4F8"
            transparent
            opacity={ring.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════  Main Component  ═══════════════════════

export default function JiangsuWaterSystem() {
  return (
    <group>
      <YangtzeRiver />
      <TaihuLake />
      <GrandCanal />
      <CoastlineGlow />
      <WaterAccents />
    </group>
  );
}
