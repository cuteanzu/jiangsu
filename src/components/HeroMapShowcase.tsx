import { useMemo } from "react";
import styled from "styled-components";
import mapData from "../assets/map/jiangsu-paths.json";

// ── Types ──

interface MapCity {
  name: string;
  adcode: number;
  d: string;
  centroid: { x: number; y: number };
}

export interface CityInfo {
  name: string;
  count: number;
  tier985: number;
  tier211: number;
  tierDual: number;
  tierProv: number;
}

export interface HeroMapShowcaseProps {
  onCityClick: (cityName: string) => void;
  selectedCity: string | null;
  hoveredCity: string | null;
  onCityHover: (cityName: string | null) => void;
  cityInfoMap: Map<string, CityInfo>;
}

// ── Computed viewBox ──

const rawCities: MapCity[] = mapData.cities as unknown as MapCity[];

function computeViewBox(): string {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of rawCities) {
    const cx = c.centroid.x, cy = c.centroid.y;
    if (cx < minX) minX = cx;
    if (cx > maxX) maxX = cx;
    if (cy < minY) minY = cy;
    if (cy > maxY) maxY = cy;
  }
  const padX = (maxX - minX) * 0.30;
  const padY = (maxY - minY) * 0.30;
  return `${minX - padX} ${minY - padY} ${maxX - minX + padX * 2} ${maxY - minY + padY * 2}`;
}

const MAP_VIEWBOX = computeViewBox();

// ── City palette (warm, distinct, school-life feel) ──

const cityPalette: Record<string, string> = {
  "南京": "#eacfba",
  "苏州": "#d6ae92",
  "无锡": "#debca0",
  "常州": "#d2b496",
  "徐州": "#edd4c2",
  "南通": "#d8b898",
  "扬州": "#e4c4aa",
  "盐城": "#cfac8c",
  "镇江": "#dcbaa2",
  "淮安": "#e6cbb4",
  "泰州": "#d3b08e",
  "宿迁": "#e0c2a8",
  "连云港": "#cba686",
};

function cityFill(name: string): string {
  return cityPalette[name] ?? "#dab89a";
}

// ── Styled ──

const Stage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  background: rgba(255, 253, 250, 0.82);
  border: 1px solid rgba(190, 170, 148, 0.28);
  border-radius: 24px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.85) inset,
    0 1px 0 rgba(200,175,148,0.15) inset,
    0 20px 48px rgba(110, 75, 45, 0.08),
    0 6px 14px rgba(130, 90, 55, 0.05);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(ellipse at 52% 44%, rgba(255,250,240,0.6) 0%, transparent 62%),
      radial-gradient(ellipse at 80% 18%, rgba(230,225,240,0.22) 0%, transparent 45%);
  }
`;

const SvgCanvas = styled.svg`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: block;
`;

const RegionPath = styled.path<{ $fill: string; $dimmed: boolean; $glow: boolean }>`
  fill: ${(p) => p.$fill};
  stroke: #fff;
  stroke-width: 2;
  stroke-linejoin: round;
  cursor: pointer;
  opacity: ${(p) => (p.$dimmed ? 0.43 : 0.96)};
  transition: opacity 0.38s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), filter 0.28s ease;

  ${(p) =>
    p.$glow &&
    !p.$dimmed &&
    `
    filter: drop-shadow(0 6px 16px rgba(150, 100, 60, 0.26));
    transform: translateY(-4px);
    opacity: 1;
  `}
`;

const OutlinePath = styled.path<{ $dimmed: boolean }>`
  fill: none;
  stroke: rgba(150, 118, 88, 0.26);
  stroke-width: 0.8;
  stroke-linejoin: round;
  pointer-events: none;
  opacity: ${(p) => (p.$dimmed ? 0.28 : 0.65)};
  transition: opacity 0.38s ease;
`;

// ── Glass label (SVG) ──

const LabelG = styled.g<{ $dimmed: boolean }>`
  opacity: ${(p) => (p.$dimmed ? 0.48 : 1)};
  transition: opacity 0.38s ease;
  pointer-events: none;
`;

const LabelBg = styled.rect``;

const LabelText = styled.text`
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 800;
  font-size: 15px;
  fill: #3a2f28;
  text-anchor: middle;
`;

const LabelSub = styled.text`
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 700;
  font-size: 10.5px;
  fill: #8b6d58;
  text-anchor: middle;
  letter-spacing: 0.03em;
`;

// ── Helpers ──

function labelWidth(name: string): number {
  return Math.max(name.length * 18 + 32, 68);
}

// ── Component ──

export default function HeroMapShowcase({
  onCityClick,
  selectedCity,
  hoveredCity,
  onCityHover,
  cityInfoMap,
}: HeroMapShowcaseProps) {
  const cities = useMemo(
    () =>
      rawCities.map((c) => ({
        ...c,
        displayName: c.name.replace(/市$/, ""),
      })),
    [],
  );

  return (
    <Stage>
      <SvgCanvas viewBox={MAP_VIEWBOX} preserveAspectRatio="xMidYMid meet">
        {/* Outline strokes under each region */}
        {cities.map((c) => (
          <OutlinePath
            key={`${c.name}-outline`}
            d={c.d}
            $dimmed={selectedCity !== null && c.displayName !== selectedCity}
          />
        ))}

        {/* Filled region paths */}
        {cities.map((c) => {
          const isSelected = selectedCity === c.displayName;
          const isHovered = hoveredCity === c.displayName;
          const isDimmed = selectedCity !== null && !isSelected;
          return (
            <RegionPath
              key={c.name}
              d={c.d}
              $fill={cityFill(c.displayName)}
              $dimmed={isDimmed}
              $glow={isHovered}
              onClick={() => onCityClick(c.displayName)}
              onMouseEnter={() => onCityHover(c.displayName)}
              onMouseLeave={() => onCityHover(null)}
            />
          );
        })}

        {/* Glass capsule labels */}
        {cities.map((c) => {
          const info = cityInfoMap.get(c.displayName);
          const count = info?.count ?? 0;
          if (count === 0) return null;
          const isDimmed = selectedCity !== null && c.displayName !== selectedCity;
          const cw = labelWidth(c.displayName);
          const cx = c.centroid.x;
          const cy = c.centroid.y - 16;
          return (
            <LabelG key={`${c.name}-label`} $dimmed={isDimmed}>
              <LabelBg
                x={cx - cw / 2}
                y={cy - 20}
                width={cw}
                height={36}
                rx={18}
                ry={18}
                fill="rgba(255,255,255,0.78)"
                stroke="rgba(190,168,142,0.2)"
                strokeWidth={1}
                filter="url(#glass-shadow)"
              />
              <LabelText x={cx} y={cy - 6}>
                {c.displayName}
              </LabelText>
              <LabelSub x={cx} y={cy + 8}>
                {count}所高校
              </LabelSub>
            </LabelG>
          );
        })}

        {/* Glass shadow filter */}
        <defs>
          <filter id="glass-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(100,70,40,0.12)" />
          </filter>
        </defs>
      </SvgCanvas>
    </Stage>
  );
}
