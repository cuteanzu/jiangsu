import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useSchoolProjection } from "./useSchoolProjection";
import type { SchoolSceneCoord } from "./useSchoolProjection";
import { UNIVERSITIES } from "../../data/jiangsu-universities";
import type { University, Tier } from "../../data/jiangsu-universities";

// ── Tier-based pin colors ──
const TIER_PIN_COLOR: Record<Tier, string> = {
  "985": "#E8786A",
  "211": "#8B6BAE",
  "dual": "#5A8EC8",
  "provincial": "#7AAA8A",
};

// Key tiers shown by default
const KEY_TIERS: Tier[] = ["985", "211", "dual"];

interface SchoolPinsProps {
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

/**
 * Apply circular offset to schools that overlap (within threshold).
 * Offsets are small so pins stay close to their true location.
 */
function avoidOverlaps(schools: PlacedSchool[], threshold = 0.22): PlacedSchool[] {
  const result: PlacedSchool[] = [];
  const groups: PlacedSchool[][] = [];

  for (const s of schools) {
    let placed = false;
    for (const group of groups) {
      const near = group.some(
        (g) => Math.hypot(g.pos.x - s.pos.x, g.pos.z - s.pos.z) < threshold,
      );
      if (near) {
        group.push(s);
        placed = true;
        break;
      }
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
          pos: {
            ...s.pos,
            x: s.pos.x + Math.cos(angle) * radius,
            z: s.pos.z + Math.sin(angle) * radius,
          },
        });
      });
    }
  }

  return result;
}

export default function SchoolPins({
  selectedCity,
  hoveredSchoolName,
  selectedSchoolName,
  showAll,
  hideLabels,
  onHoverSchool,
  onSelectSchool,
}: SchoolPinsProps) {
  const toScene = useSchoolProjection();

  // Compute which schools to show
  const placed = useMemo(() => {
    if (!selectedCity || !toScene) return [] as PlacedSchool[];

    const citySchools = UNIVERSITIES.filter((u) => u.city === selectedCity);
    if (citySchools.length === 0) return [] as PlacedSchool[];

    const keySchools = citySchools.filter((u) => KEY_TIERS.includes(u.tier));
    const provincialSchools = citySchools.filter((u) => u.tier === "provincial");

    let visible: University[];
    if (keySchools.length > 0) {
      visible = keySchools;
      if (showAll) visible = [...keySchools, ...provincialSchools];
    } else {
      // No key schools: show first 5 provincial
      visible = provincialSchools.slice(0, 5);
      if (showAll) visible = provincialSchools;
    }

    const raw: PlacedSchool[] = visible.map((s) => ({
      school: s,
      pos: toScene(s.lat, s.lng),
      isKey: KEY_TIERS.includes(s.tier),
    }));

    return avoidOverlaps(raw);
  }, [selectedCity, toScene, showAll]);

  if (!selectedCity || placed.length === 0) return null;

  return (
    <group>
      {placed.map(({ school, pos }) => {
        const isSelected = selectedSchoolName === school.name;
        const isHovered = hoveredSchoolName === school.name;
        const isDimmed = selectedSchoolName !== null && !isSelected;

        const color = TIER_PIN_COLOR[school.tier];
        // Softer values: dimmed pins are visible but subdued
        const ringOpacity = isSelected ? 0.55 : isHovered ? 0.48 : isDimmed ? 0.28 : 0.38;
        const dotOpacity = isSelected ? 0.95 : isHovered ? 0.90 : isDimmed ? 0.45 : 0.75;
        const dotScale = isSelected ? 1.65 : isHovered ? 1.40 : 1.08;
        const ringScale = isSelected ? 1.35 : isHovered ? 1.20 : 1.08;
        // Hide label when detail view, or when this pin is selected (SchoolInfoCard handles it)
        const labelVisible = !hideLabels && isHovered && !isSelected;

        return (
          <group key={school.id}>
            {/* Glow ring */}
            <mesh
              position={[pos.x, pos.y, pos.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[ringScale, ringScale, 1]}
              renderOrder={4}
            >
              <ringGeometry args={[0.055, 0.095, 32]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={ringOpacity}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Pin dot */}
            <mesh
              position={[pos.x, pos.y + 0.03, pos.z]}
              scale={[dotScale, dotScale, dotScale]}
              renderOrder={5}
              onPointerEnter={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
                onHoverSchool(school.name);
              }}
              onPointerLeave={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "";
                onHoverSchool(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSchool(isSelected ? null : school.name);
              }}
            >
              <sphereGeometry args={[0.038, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={dotOpacity}
                depthWrite={false}
              />
            </mesh>

            {/* Hover / selected label */}
            {labelVisible && (
              <Html
                position={[pos.x, pos.y + 0.14, pos.z]}
                center
                style={{ pointerEvents: "none" }}
                distanceFactor={8}
                occlude={false}
              >
                <div
                  style={{
                    fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
                    fontSize: isSelected ? 10 : 9,
                    fontWeight: isSelected ? 700 : 600,
                    color: "#3a2f28",
                    background: isSelected
                      ? "rgba(255,252,247,0.94)"
                      : "rgba(255,252,247,0.82)",
                    padding: isSelected ? "3px 9px" : "2px 7px",
                    borderRadius: 7,
                    border: `1.5px solid ${isSelected ? "#F08A78" : color}`,
                    whiteSpace: "nowrap",
                    boxShadow: isSelected
                      ? "0 2px 12px rgba(200,140,120,0.2)"
                      : "0 1px 6px rgba(180,150,130,0.10)",
                  }}
                >
                  {school.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
