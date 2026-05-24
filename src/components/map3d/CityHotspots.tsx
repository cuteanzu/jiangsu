import { useMemo } from "react";
import * as THREE from "three";

/**
 * City hotspot indicators — soft glowing rings under cities with many universities.
 * Rendered at y=0.23, just above the ground plane but below the extruded map.
 *
 * Positions are estimated normalized coords (8×8 map centered at origin).
 */

interface HotspotDef {
  city: string;
  pos: [number, number, number];
  radius: number;
  color: string;
}

const HOTSPOTS: HotspotDef[] = [
  // Nanjing — largest (most universities)
  { city: "南京", pos: [-2.05, 0.23, -0.85], radius: 0.48, color: "#FFB6C8" },
  // Suzhou — medium
  { city: "苏州", pos: [1.95, 0.23, 2.45], radius: 0.32, color: "#A6D8FF" },
  // Xuzhou — medium
  { city: "徐州", pos: [-0.85, 0.23, -2.75], radius: 0.32, color: "#A6D8FF" },
  // Wuxi — small
  { city: "无锡", pos: [1.55, 0.23, 2.05], radius: 0.22, color: "#C5E0F8" },
  // Changzhou — small
  { city: "常州", pos: [0.65, 0.23, 1.55], radius: 0.22, color: "#C5E0F8" },
];

function HotspotRing({ pos, radius, color, opacity }: HotspotDef & { opacity: number }) {
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(radius * 0.7, radius, 64);
    return g;
  }, [radius]);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={pos}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}

function HotspotDot({ pos, radius, color }: HotspotDef) {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(radius * 0.18, 32);
    return g;
  }, [radius]);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], pos[1] + 0.01, pos[2]]}>
      <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function CityHotspots() {
  return (
    <group>
      {HOTSPOTS.map((h) => (
        <group key={h.city}>
          {/* Outer glow ring */}
          <HotspotRing {...h} opacity={0.22} />
          {/* Inner accent ring */}
          <mesh
            geometry={(() => {
              const g = new THREE.RingGeometry(h.radius * 0.3, h.radius * 0.55, 64);
              return g;
            })()}
            rotation={[-Math.PI / 2, 0, 0]}
            position={h.pos}
          >
            <meshBasicMaterial color={h.color} transparent opacity={0.28} side={THREE.DoubleSide} />
          </mesh>
          {/* Center dot */}
          <HotspotDot {...h} />
        </group>
      ))}
    </group>
  );
}
