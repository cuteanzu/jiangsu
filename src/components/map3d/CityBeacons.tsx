import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import {
  CITY_UNIVERSITY_COUNT, CITY_CENTERS, BEACON_HEIGHT,
  BEACON_CITIES, LABEL_CITIES, PROVINCE_VISIBLE_LABELS,
  BEACON_WARM, BEACON_PINK, BEACON_BLUE,
} from "./mapTheme";
import type { CityCenter } from "./mapTheme";

interface CityBeaconsProps {
  selectedCity: string | null;
  hoveredCity: string | null;
  hideLabels?: boolean;
}

function pillarColor(name: string): string {
  if (["南京", "苏州", "徐州", "无锡"].includes(name)) return BEACON_WARM;
  if (["常州"].includes(name)) return BEACON_PINK;
  return BEACON_BLUE;
}

function pillarHeight(name: string): number {
  if (name === "南京") return BEACON_HEIGHT.large;
  if (name === "苏州" || name === "徐州") return BEACON_HEIGHT.medium;
  return BEACON_HEIGHT.small;
}

// ── Pillar + ring + label (5 BEACON_CITIES) ──
function Beacon({ b, color, height, count, selected, hovered, isCityMode, hideLabels }: {
  b: CityCenter; color: string; height: number; count: number;
  selected: boolean; hovered: boolean; isCityMode: boolean;
  hideLabels?: boolean;
}) {
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.07, 0.12, 48), []);
  const pillarGeo = useMemo(() => new THREE.CylinderGeometry(0.018, 0.028, height, 16, 1, true), [height]);
  const innerGeo = useMemo(() => new THREE.CylinderGeometry(0.005, 0.010, height, 16, 1, true), [height]);

  const labelY = 0.36 + height + 0.12;
  const labelX = selected ? 0.08 : 0;

  const isVisible = hideLabels ? false : isCityMode ? selected : true;
  const ringOpacity = selected ? 0.48 : hovered ? 0.32 : 0.18;
  const pillarOuterOpacity = selected ? 0.20 : hovered ? 0.12 : 0.06;
  const pillarInnerOpacity = selected ? 0.25 : hovered ? 0.14 : 0.08;
  const labelBgOpacity = selected ? 0.96 : hovered ? 0.92 : 0.82;
  const labelBorderColor = selected ? "#F08A78" : hovered ? "#d4a090" : "rgba(200,170,150,0.30)";
  const labelFontSize = selected ? 6.8 : 5.8;
  const labelPad = selected ? "2px 6px" : "1px 5px";

  return (
    <group>
      {/* Bottom ring */}
      <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]} position={[b.x, 0.36, b.z]} renderOrder={3}>
        <meshBasicMaterial color={color} transparent opacity={ringOpacity} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer pillar */}
      <mesh geometry={pillarGeo} position={[b.x, 0.36 + height / 2, b.z]} renderOrder={3}>
        <meshBasicMaterial color={color} transparent opacity={pillarOuterOpacity} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner core */}
      <mesh geometry={innerGeo} position={[b.x, 0.36 + height / 2, b.z]} renderOrder={3}>
        <meshBasicMaterial color="#FFFFFF" transparent opacity={pillarInnerOpacity} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>

      {/* Label — only show if visible */}
      {isVisible && (
        <Html position={[b.x + labelX, labelY, b.z]} center style={{ pointerEvents: "none" }} distanceFactor={9} occlude={false}>
          <div
            style={{
              fontFamily: '"Noto Serif SC","Songti SC","KaiTi",serif',
              fontSize: labelFontSize, fontWeight: selected ? 700 : 600,
              color: "#2d2018",
              background: `rgba(255,252,247,${labelBgOpacity})`,
              padding: labelPad, borderRadius: 7,
              border: `1.5px solid ${labelBorderColor}`,
              whiteSpace: "nowrap", letterSpacing: "0.03em", maxWidth: 140,
              boxShadow: selected
                ? "0 2px 12px rgba(200,140,120,0.2)"
                : "0 1px 6px rgba(180,150,130,0.10)",
              transition: "all 0.2s ease",
              overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {b.name} · {count} 所高校
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Label only (non-beacon cities) ──
function LabelOnly({ b, count, selected, hovered, isCityMode, isProvinceVisible, hideLabels }: {
  b: CityCenter; count: number; selected: boolean; hovered: boolean;
  isCityMode: boolean; isProvinceVisible: boolean;
  hideLabels?: boolean;
}) {
  // Province: only show if in PROVINCE_VISIBLE_LABELS or hovered
  // City mode: only show selected city label
  const visible = hideLabels ? false : isCityMode ? selected : (isProvinceVisible || hovered);
  const labelX = selected ? 0.08 : 0;
  const borderColor = selected ? "#F08A78" : hovered ? "#d4a090" : "rgba(200,170,150,0.28)";
  const fontSize = selected ? 6.4 : 5.4;
  const bg = selected ? "rgba(255,252,247,0.96)" : hovered ? "rgba(255,252,247,0.90)" : "rgba(255,252,247,0.70)";

  return (
    <Html position={[b.x + labelX, 0.42, b.z]} center style={{ pointerEvents: "none", opacity: visible ? 1 : 0, transition: "opacity 0.2s" }} distanceFactor={9} occlude={false}>
      <div
        style={{
          fontFamily: '"Noto Serif SC","Songti SC","KaiTi",serif',
          fontSize, fontWeight: selected ? 700 : 500,
          color: "#2d2018",
          background: bg, padding: selected ? "3px 8px" : "2px 6px",
          borderRadius: 6, border: `1px solid ${borderColor}`,
          whiteSpace: "nowrap", letterSpacing: "0.02em", maxWidth: 130,
          boxShadow: selected
            ? "0 1px 8px rgba(200,140,120,0.15)"
            : "0 1px 4px rgba(180,150,130,0.06)",
          transition: "all 0.2s ease",
          overflow: "hidden", textOverflow: "ellipsis",
        }}
      >
        {b.name} · {count} 所
      </div>
    </Html>
  );
}

export default function CityBeacons({ selectedCity, hoveredCity, hideLabels }: CityBeaconsProps) {
  const beaconSet = new Set(BEACON_CITIES);
  const labelSet = new Set(LABEL_CITIES);
  const provinceVisibleSet = new Set(PROVINCE_VISIBLE_LABELS);
  const isCityMode = selectedCity !== null;

  const beacons = CITY_CENTERS
    .filter((c) => beaconSet.has(c.name))
    .map((c) => ({
      center: c,
      color: pillarColor(c.name),
      height: pillarHeight(c.name),
      count: CITY_UNIVERSITY_COUNT[c.name] ?? 0,
    }));

  const labels = CITY_CENTERS
    .filter((c) => labelSet.has(c.name) && !beaconSet.has(c.name))
    .map((c) => ({
      center: c,
      count: CITY_UNIVERSITY_COUNT[c.name] ?? 0,
      isProvinceVisible: provinceVisibleSet.has(c.name),
    }));

  return (
    <group>
      {beacons.map((bd) => (
        <Beacon
          key={bd.center.name} b={bd.center}
          color={bd.color} height={bd.height} count={bd.count}
          selected={selectedCity === bd.center.name}
          hovered={hoveredCity === bd.center.name}
          isCityMode={isCityMode}
          hideLabels={hideLabels}
        />
      ))}
      {labels.map((lb) => (
        <LabelOnly
          key={lb.center.name} b={lb.center}
          count={lb.count}
          selected={selectedCity === lb.center.name}
          hovered={hoveredCity === lb.center.name}
          isCityMode={isCityMode}
          isProvinceVisible={lb.isProvinceVisible}
          hideLabels={hideLabels}
        />
      ))}
    </group>
  );
}
