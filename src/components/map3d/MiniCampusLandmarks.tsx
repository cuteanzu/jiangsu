import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// ═══════════════════════  Building Definitions  ═══════════════════════

interface Landmark {
  pos: [number, number, number];
  type: "tower" | "hall" | "library" | "clock";
  color: string;
  scale?: number;
  rotY?: number;
}

// Scaled up ~1.5x. Only 6 key cities.
const CITY_LANDMARKS: Record<string, Landmark[]> = {
  "南京": [
    { pos: [-2.12, 0.28, -0.38], type: "tower", color: "#FFF0E8", scale: 1.1 },
    { pos: [-1.90, 0.28, -0.42], type: "hall", color: "#FDE4D8", scale: 0.95 },
    { pos: [-2.05, 0.28, -0.62], type: "library", color: "#F8E8F0", scale: 1.0 },
  ],
  "苏州": [
    { pos: [2.62, 0.28, 2.38], type: "tower", color: "#F0E8FF", scale: 1.0 },
    { pos: [2.38, 0.28, 2.58], type: "clock", color: "#FFEED8", scale: 0.9 },
  ],
  "徐州": [
    { pos: [-2.38, 0.28, -2.68], type: "library", color: "#FFF2E8", scale: 0.95 },
    { pos: [-2.62, 0.28, -2.82], type: "hall", color: "#E8F0F8", scale: 0.9 },
  ],
  "无锡": [
    { pos: [1.70, 0.28, 1.90], type: "tower", color: "#F5E8FF", scale: 0.95 },
    { pos: [1.88, 0.28, 1.72], type: "hall", color: "#FFF5E8", scale: 0.9 },
  ],
  "常州": [
    { pos: [1.20, 0.28, 1.42], type: "clock", color: "#FFEEDD", scale: 0.9 },
    { pos: [1.38, 0.28, 1.22], type: "library", color: "#E8F2FF", scale: 0.9 },
  ],
  "扬州": [
    { pos: [-0.08, 0.28, -0.42], type: "clock", color: "#F8F0E8", scale: 0.9 },
    { pos: [-0.30, 0.28, -0.22], type: "library", color: "#F0E8F8", scale: 0.9 },
  ],
};

// City glow ring centers (rough centroid of each city's landmarks)
const CITY_RING_CENTERS: Record<string, [number, number, number]> = {
  "南京": [-2.02, 0.285, -0.47],
  "苏州": [2.50, 0.285, 2.48],
  "徐州": [-2.50, 0.285, -2.75],
  "无锡": [1.79, 0.285, 1.81],
  "常州": [1.29, 0.285, 1.32],
  "扬州": [-0.19, 0.285, -0.32],
};

// ═══════════════════════  Building Geometries (scaled ~1.5x)  ═══════════════════════

function useBuildingGeo(type: Landmark["type"]) {
  return useMemo(() => {
    switch (type) {
      case "tower":
        return new THREE.BoxGeometry(0.09, 0.36, 0.09);
      case "hall":
        return new THREE.BoxGeometry(0.14, 0.26, 0.10);
      case "library":
        return new THREE.CylinderGeometry(0.06, 0.07, 0.30, 12);
      case "clock":
        return new THREE.ConeGeometry(0.06, 0.34, 10);
    }
  }, [type]);
}

// ═══════════════════════  Single Building  ═══════════════════════

function MiniBuilding({
  landmark,
  highlighted,
  dimmed,
}: {
  landmark: Landmark;
  highlighted: boolean;
  dimmed: boolean;
}) {
  const geo = useBuildingGeo(landmark.type);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = highlighted ? 1.12 : 1;
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, target, Math.min(delta * 6, 1));
    groupRef.current.scale.setScalar(s);
  });

  const opacity = highlighted ? 0.88 : dimmed ? 0.22 : 0.62;
  const edgeOpacity = highlighted ? 0.55 : dimmed ? 0.10 : 0.32;

  return (
    <group
      ref={groupRef}
      position={landmark.pos}
      scale={landmark.scale ?? 1}
      rotation-y={landmark.rotY ?? 0}
    >
      <mesh geometry={geo} renderOrder={2}>
        <meshStandardMaterial
          color={landmark.color}
          roughness={0.65}
          metalness={0.02}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={new THREE.EdgesGeometry(geo, 12)} renderOrder={3}>
        <lineBasicMaterial
          color={landmark.color}
          transparent
          opacity={edgeOpacity}
          depthTest
        />
      </lineSegments>
    </group>
  );
}

// ═══════════════════════  City Glow Ring  ═══════════════════════

function CityGlowRing({
  center,
  highlighted,
  dimmed,
}: {
  center: [number, number, number];
  highlighted: boolean;
  dimmed: boolean;
}) {
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.14, 0.20, 48), []);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = highlighted ? 1.08 : 1;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, target, Math.min(delta * 3, 1));
    ref.current.scale.setScalar(s);
  });

  const opacity = highlighted ? 0.22 : dimmed ? 0.06 : 0.11;

  return (
    <mesh
      ref={ref}
      geometry={ringGeo}
      rotation={[-Math.PI / 2, 0, 0]}
      position={center}
      renderOrder={2}
    >
      <meshBasicMaterial
        color="#FFF8F0"
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ═══════════════════════  Main Component  ═══════════════════════

interface MiniCampusLandmarksProps {
  hoveredCity: string | null;
  selectedCity: string | null;
}

export default function MiniCampusLandmarks({
  hoveredCity,
  selectedCity,
}: MiniCampusLandmarksProps) {
  const allLandmarks = useMemo(() => {
    const entries: { city: string; landmark: Landmark }[] = [];
    for (const [city, landmarks] of Object.entries(CITY_LANDMARKS)) {
      for (const l of landmarks) {
        entries.push({ city, landmark: l });
      }
    }
    return entries;
  }, []);

  const cityList = useMemo(() => Object.keys(CITY_LANDMARKS), []);

  return (
    <group>
      {/* City glow rings */}
      {cityList.map((city) => {
        const center = CITY_RING_CENTERS[city];
        if (!center) return null;
        const highlighted = hoveredCity === city || selectedCity === city;
        const dimmed = selectedCity !== null && selectedCity !== city;
        return (
          <CityGlowRing
            key={`ring-${city}`}
            center={center}
            highlighted={highlighted}
            dimmed={dimmed}
          />
        );
      })}

      {/* Buildings */}
      {allLandmarks.map(({ city, landmark }, i) => {
        const highlighted = hoveredCity === city || selectedCity === city;
        const dimmed = selectedCity !== null && selectedCity !== city;
        return (
          <MiniBuilding
            key={`${city}-${i}`}
            landmark={landmark}
            highlighted={highlighted}
            dimmed={dimmed}
          />
        );
      })}
    </group>
  );
}
