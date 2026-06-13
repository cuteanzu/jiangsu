import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useSchoolProjection } from "./useSchoolProjection";
import type { SchoolSceneCoord } from "./useSchoolProjection";
import { isTierOnePlusUniversity } from "../../data/jiangsu-universities";
import type { University, Tier } from "../../data/jiangsu-universities";

// Pearl-toned pin colors — soft, warm, paper-diorama compatible
const TIER_PIN_COLOR: Record<Tier, string> = {
  "985": "#EACCB2",
  "211": "#DCC8D2",
  "dual": "#C8D2E2",
  "provincial": "#C4D6C4",
};

interface SchoolPinsProps {
  universities: University[];
  selectedCity: string | null;
  hoveredSchoolName: string | null;
  selectedSchoolName: string | null;
  showAll: boolean;
  hideLabels?: boolean;
  onHoverSchool: (name: string | null) => void;
  onSelectSchool: (name: string | null) => void;
}

interface PlacedSchool {
  school: University;
  pos: SchoolSceneCoord;
  isKey: boolean;
}

function avoidOverlaps(schools: PlacedSchool[], threshold = 0.22): PlacedSchool[] {
  const result: PlacedSchool[] = [];
  const groups: PlacedSchool[][] = [];

  for (const s of schools) {
    let placed = false;
    for (const group of groups) {
      const near = group.some(
        (g) => Math.hypot(g.pos.x - s.pos.x, g.pos.z - s.pos.z) < threshold,
      );
      if (near) { group.push(s); placed = true; break; }
    }
    if (!placed) groups.push([s]);
  }

  for (const group of groups) {
    if (group.length === 1) {
      result.push(group[0]);
    } else {
      const radius = 0.10;
      group.forEach((s, i) => {
        const angle = (2 * Math.PI * i) / group.length;
        result.push({
          ...s,
          pos: { ...s.pos, x: s.pos.x + Math.cos(angle) * radius, z: s.pos.z + Math.sin(angle) * radius },
        });
      });
    }
  }
  return result;
}

// ── Pearl light point ──
function PearlPin({ school, pos, isSelected, isHovered, isDimmed, hideLabels, onHoverSchool, onSelectSchool }: {
  school: University; pos: SchoolSceneCoord; isSelected: boolean; isHovered: boolean;
  isDimmed: boolean; hideLabels?: boolean;
  onHoverSchool: (name: string | null) => void;
  onSelectSchool: (name: string | null) => void;
}) {
  const color = TIER_PIN_COLOR[school.tier];
  const glowOpacity = isSelected ? 0.35 : isHovered ? 0.28 : isDimmed ? 0.14 : 0.20;
  const dotOpacity = isSelected ? 0.92 : isHovered ? 0.85 : isDimmed ? 0.40 : 0.70;
  const scale = isSelected ? 1.5 : isHovered ? 1.3 : 1.0;
  const labelVisible = !hideLabels && isHovered && !isSelected;

  return (
    <group>
      {/* Soft glow ring */}
      <mesh
        position={[pos.x, pos.y, pos.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[scale, scale, 1]}
        renderOrder={4}
      >
        <ringGeometry args={[0.05, 0.085, 32]} />
        <meshBasicMaterial color={color} transparent opacity={glowOpacity} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Pearl dot */}
      <mesh
        position={[pos.x, pos.y + 0.025, pos.z]}
        scale={[scale, scale, scale]}
        renderOrder={5}
        onPointerEnter={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; onHoverSchool(school.name); }}
        onPointerLeave={(e) => { e.stopPropagation(); document.body.style.cursor = ""; onHoverSchool(null); }}
        onClick={(e) => { e.stopPropagation(); onSelectSchool(isSelected ? null : school.name); }}
      >
        <sphereGeometry args={[0.026, 20, 20]} />
        <meshBasicMaterial color="#FFFDF8" transparent opacity={dotOpacity} depthWrite={false} />
      </mesh>

      {/* Tiny inner highlight */}
      <mesh
        position={[pos.x, pos.y + 0.032, pos.z]}
        scale={[scale, scale, scale]}
        renderOrder={5}
      >
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={dotOpacity * 0.6} depthWrite={false} />
      </mesh>

      {/* Hover label */}
      {labelVisible && (
        <Html position={[pos.x, pos.y + 0.13, pos.z]} center style={{ pointerEvents: "none" }} distanceFactor={8} occlude={false}>
          <div style={{
            fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
            fontSize: 10, fontWeight: 600, color: "#3a2f28",
            background: "rgba(255,252,248,0.88)", padding: "3px 8px",
            borderRadius: 8, border: "1px solid rgba(210,180,160,0.25)",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 8px rgba(180,150,120,0.10)",
            backdropFilter: "blur(6px)",
          }}>
            {school.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SchoolPins({
  universities, selectedCity, hoveredSchoolName, selectedSchoolName,
  showAll, hideLabels, onHoverSchool, onSelectSchool,
}: SchoolPinsProps) {
  const toScene = useSchoolProjection();

  const placed = useMemo(() => {
    if (!selectedCity || !toScene) return [] as PlacedSchool[];
    const citySchools = universities.filter((u) => u.city === selectedCity);
    if (citySchools.length === 0) return [] as PlacedSchool[];

    const keySchools = citySchools.filter(isTierOnePlusUniversity);
    const ordinarySchools = citySchools.filter((u) => !isTierOnePlusUniversity(u));

    let visible: University[];
    if (keySchools.length > 0) {
      visible = keySchools;
      if (showAll) visible = [...keySchools, ...ordinarySchools];
    } else {
      visible = ordinarySchools.slice(0, 5);
      if (showAll) visible = ordinarySchools;
    }

    const raw: PlacedSchool[] = visible.map((s) => ({
      school: s,
      pos: toScene(s.lat, s.lng),
      isKey: isTierOnePlusUniversity(s),
    }));
    return avoidOverlaps(raw);
  }, [universities, selectedCity, toScene, showAll]);

  if (!selectedCity || placed.length === 0) return null;

  return (
    <group>
      {placed.map(({ school, pos }) => (
        <PearlPin
          key={school.id} school={school} pos={pos}
          isSelected={selectedSchoolName === school.name}
          isHovered={hoveredSchoolName === school.name}
          isDimmed={selectedSchoolName !== null && selectedSchoolName !== school.name}
          hideLabels={hideLabels}
          onHoverSchool={onHoverSchool}
          onSelectSchool={onSelectSchool}
        />
      ))}
    </group>
  );
}
