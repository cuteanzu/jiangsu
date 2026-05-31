import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import {
  CITY_UNIVERSITY_COUNT, BEACON_HEIGHT,
  BEACON_CITIES, LABEL_CITIES, PROVINCE_VISIBLE_LABELS,
} from "./mapTheme";
import type { CityCenter } from "./mapTheme";

interface CityBeaconsProps {
  cityCenters: CityCenter[];
  selectedCity: string | null;
  hoveredCity: string | null;
  hideLabels?: boolean;
}

const BEACON_COLOR = "#F5EDE0";
const BEACON_INNER = "#FFFCF8";

function pillarHeight(name: string): number {
  if (name === "南京") return BEACON_HEIGHT.large;
  if (name === "苏州" || name === "徐州") return BEACON_HEIGHT.medium;
  return BEACON_HEIGHT.small;
}

// ── Glass sticker label card ──
function GlassLabel({ b, count, selected, hovered, visible }: {
  b: CityCenter; count: number; selected: boolean; hovered: boolean;
  visible: boolean;
}) {
  const labelX = selected ? 0.06 : 0;
  const bg = selected ? "rgba(255,252,248,0.94)" : hovered ? "rgba(255,252,248,0.86)" : "rgba(255,252,248,0.68)";
  const borderColor = selected ? "rgba(195,165,140,0.40)" : hovered ? "rgba(195,165,140,0.26)" : "rgba(195,165,140,0.16)";
  const shadow = selected
    ? "0 2px 14px rgba(170,140,110,0.14), 0 0 0 1px rgba(255,255,255,0.45) inset"
    : hovered
      ? "0 1px 8px rgba(170,140,110,0.08)"
      : "0 1px 3px rgba(170,140,110,0.03)";

  return (
    <Html position={[b.x + labelX, 0.44, b.z]} center style={{ pointerEvents: "none", opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }} distanceFactor={10} occlude={false}>
      <div
        style={{
          fontFamily: '"Noto Serif SC","Songti SC","KaiTi",serif',
          padding: selected ? "4px 10px" : hovered ? "3px 8px" : "2px 7px",
          borderRadius: 8,
          background: bg,
          border: `1px solid ${borderColor}`,
          backdropFilter: "blur(6px)",
          whiteSpace: "nowrap", letterSpacing: "0.02em",
          boxShadow: shadow,
          transition: "all 0.25s ease",
          textAlign: "center",
        }}
      >
        <div style={{
          fontSize: selected ? 11 : hovered ? 10 : 9,
          fontWeight: 800,
          color: "#3a2f28",
          lineHeight: 1.3,
        }}>
          {b.name}
        </div>
        <div style={{
          fontSize: selected ? 9 : 8,
          fontWeight: 500,
          color: "#9a8a7d",
          marginTop: 1,
        }}>
          {count} 所高校
        </div>
      </div>
    </Html>
  );
}

function BeaconPillar({ b, height, count, selected, hovered, hideLabels }: {
  b: CityCenter; height: number; count: number;
  selected: boolean; hovered: boolean; hideLabels?: boolean;
}) {
  const pillarGeo = useMemo(() => new THREE.CylinderGeometry(0.015, 0.025, height, 16, 1, true), [height]);
  const innerGeo = useMemo(() => new THREE.CylinderGeometry(0.004, 0.008, height, 16, 1, true), [height]);
  const pillarOuterOpacity = selected ? 0.16 : hovered ? 0.10 : 0.05;
  const pillarInnerOpacity = selected ? 0.20 : hovered ? 0.12 : 0.06;

  return (
    <group>
      <mesh geometry={pillarGeo} position={[b.x, 0.36 + height / 2, b.z]} renderOrder={3}>
        <meshBasicMaterial color={BEACON_COLOR} transparent opacity={pillarOuterOpacity} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={innerGeo} position={[b.x, 0.36 + height / 2, b.z]} renderOrder={3}>
        <meshBasicMaterial color={BEACON_INNER} transparent opacity={pillarInnerOpacity} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <GlassLabel b={b} count={count} selected={selected} hovered={hovered} visible={!hideLabels} />
    </group>
  );
}

export default function CityBeacons({ cityCenters, selectedCity, hoveredCity, hideLabels }: CityBeaconsProps) {
  const beaconSet = new Set(BEACON_CITIES);
  const provinceVisibleSet = new Set(PROVINCE_VISIBLE_LABELS);
  const labelSet = new Set(LABEL_CITIES);
  const isCityMode = selectedCity !== null;

  const beacons = cityCenters
    .filter((c) => beaconSet.has(c.name))
    .map((c) => ({
      center: c,
      height: pillarHeight(c.name),
      count: CITY_UNIVERSITY_COUNT[c.name] ?? 0,
    }));

  const labels = cityCenters
    .filter((c) => labelSet.has(c.name) && !beaconSet.has(c.name))
    .map((c) => ({
      center: c,
      count: CITY_UNIVERSITY_COUNT[c.name] ?? 0,
      isProvinceVisible: provinceVisibleSet.has(c.name),
    }));

  return (
    <group>
      {/* Soft light pillars for key cities */}
      {beacons.map((bd) => (
        <BeaconPillar
          key={bd.center.name} b={bd.center}
          height={bd.height} count={bd.count}
          selected={selectedCity === bd.center.name}
          hovered={hoveredCity === bd.center.name}
          hideLabels={hideLabels}
        />
      ))}

      {/* Other labels: province-visible or on hover */}
      {labels.map((lb) => {
        const selected = selectedCity === lb.center.name;
        const hovered = hoveredCity === lb.center.name;
        const visible = hideLabels ? false : isCityMode ? selected : (lb.isProvinceVisible || hovered);

        return (
          <GlassLabel
            key={lb.center.name} b={lb.center} count={lb.count}
            selected={selected} hovered={hovered}
            visible={visible}
          />
        );
      })}
    </group>
  );
}
