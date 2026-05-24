import { useMemo } from "react";
import * as THREE from "three";

/**
 * Subtle water features:
 * - Taihu Lake (south, near Suzhou/Wuxi)
 * - Yangtze River (thin band, west→east)
 * - Eastern coastal glow
 *
 * All thin, low opacity, behind city blocks.
 */

// ── Taihu Lake ──
function TaihuLake() {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(0.5, 48);
    g.scale(1, 1.6, 1);
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[2.0, 0.24, 2.2]}>
      <meshBasicMaterial color="#B0D8EC" transparent opacity={0.38} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Yangtze River: thin tube ──
function YangtzeRiver() {
  const tubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-2.8, 0, -0.8),
        new THREE.Vector3(-1.8, 0, -0.75),
        new THREE.Vector3(-0.6, 0, -0.85),
        new THREE.Vector3(0.5, 0, -0.95),
        new THREE.Vector3(1.6, 0, -1.1),
        new THREE.Vector3(2.6, 0, -1.25),
        new THREE.Vector3(3.2, 0, -1.35),
      ],
      false, "catmullrom", 0.65,
    );
    return new THREE.TubeGeometry(curve, 80, 0.04, 12, false);
  }, []);

  return (
    <mesh geometry={tubeGeo} position={[0, 0.25, 0]} renderOrder={0}>
      <meshBasicMaterial color="#90C0D8" transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Coastal glow ──
function CoastalGlow() {
  const spots = useMemo(() => {
    const items: { pos: [number, number, number]; sx: number; sz: number }[] = [
      { pos: [0.6, 0.235, 2.8], sx: 0.3, sz: 0.55 },   // Lianyungang
      { pos: [1.4, 0.235, 1.5], sx: 0.35, sz: 0.6 },    // Yancheng north
      { pos: [1.7, 0.235, 0.2], sx: 0.32, sz: 0.55 },   // Yancheng south
      { pos: [2.2, 0.235, -0.9], sx: 0.28, sz: 0.5 },   // Nantong
      { pos: [2.6, 0.235, -1.8], sx: 0.25, sz: 0.45 },  // Nantong south
    ];
    return items.map((p) => ({
      ...p,
      geo: (() => {
        const g = new THREE.CircleGeometry(0.25, 32);
        g.scale(p.sx, p.sz, 1);
        return g;
      })(),
    }));
  }, []);

  return (
    <>
      {spots.map((spot, i) => (
        <mesh
          key={`coastal-${i}`}
          geometry={spot.geo}
          rotation={[-Math.PI / 2, 0, 0]}
          position={spot.pos}
        >
          <meshBasicMaterial color="#B8DDF0" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export default function MapWaterSystem() {
  return (
    <group>
      <TaihuLake />
      <YangtzeRiver />
      <CoastalGlow />
    </group>
  );
}
