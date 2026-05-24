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

export interface HeroJiangsuMapProps {
  onCityClick: (cityName: string) => void;
  selectedCity: string | null;
  hoveredCity: string | null;
  onCityHover: (cityName: string | null) => void;
  cityCounts: Map<string, number>;
}

// ── Computed viewBox (tight fit with padding) ──

const rawCities: MapCity[] = mapData.cities as unknown as MapCity[];

function computeViewBox(): string {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of rawCities) {
    if (c.centroid.x < minX) minX = c.centroid.x;
    if (c.centroid.x > maxX) maxX = c.centroid.x;
    if (c.centroid.y < minY) minY = c.centroid.y;
    if (c.centroid.y > maxY) maxY = c.centroid.y;
  }
  const padX = (maxX - minX) * 0.28;
  const padY = (maxY - minY) * 0.28;
  return `${minX - padX} ${minY - padY} ${maxX - minX + padX * 2} ${maxY - minY + padY * 2}`;
}

const MAP_VIEWBOX = computeViewBox();

// ── City palette (warm, distinguishable, strong) ──

const cityPalette: Record<string, string> = {
  "南京": "#e8c2a8",
  "苏州": "#d4a98a",
  "无锡": "#dcb898",
  "常州": "#cfb094",
  "徐州": "#eacfba",
  "南通": "#d6b594",
  "扬州": "#e2c0a6",
  "盐城": "#ccaa88",
  "镇江": "#dab89e",
  "淮安": "#e4c8b0",
  "泰州": "#d0ad8c",
  "宿迁": "#dec0a4",
  "连云港": "#c8a484",
};

function cityColor(name: string): string {
  return cityPalette[name] ?? "#d8b898";
}

// ── Styled ──

const MapStage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  background: rgba(255, 252, 248, 0.88);
  border: 1px solid rgba(200, 178, 155, 0.32);
  border-radius: 26px;
  box-shadow:
    0 2px 0 rgba(255, 255, 255, 0.9) inset,
    0 1px 0 rgba(210, 185, 160, 0.18) inset,
    0 24px 58px rgba(120, 85, 55, 0.10),
    0 8px 18px rgba(140, 100, 65, 0.06);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(ellipse at 50% 45%, rgba(255, 248, 238, 0.55) 0%, transparent 68%),
      radial-gradient(ellipse at 85% 15%, rgba(255, 240, 225, 0.3) 0%, transparent 50%);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0.06;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='40' height='40' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  }
`;

const SvgStage = styled.svg`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: block;
`;

const CityPath = styled.path<{ $fill: string; $dimmed: boolean; $hovered: boolean }>`
  fill: ${(p) => p.$fill};
  stroke: #fff;
  stroke-width: 1.8;
  stroke-linejoin: round;
  cursor: pointer;
  opacity: ${(p) => (p.$dimmed ? 0.42 : 0.97)};
  transition: opacity 0.35s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease;

  ${(p) =>
    p.$hovered &&
    !p.$dimmed &&
    `
    filter: drop-shadow(0 6px 18px rgba(160, 110, 70, 0.28));
    transform: translateY(-3px);
    opacity: 1;
  `}
`;

const CityOutline = styled.path<{ $dimmed: boolean }>`
  fill: none;
  stroke: rgba(160, 125, 95, 0.28);
  stroke-width: 1;
  stroke-linejoin: round;
  pointer-events: none;
  opacity: ${(p) => (p.$dimmed ? 0.3 : 0.7)};
  transition: opacity 0.35s ease;
`;

// ── Capsule label ──

const LabelGroup = styled.g<{ $dimmed: boolean }>`
  opacity: ${(p) => (p.$dimmed ? 0.5 : 1)};
  transition: opacity 0.35s ease;
  pointer-events: none;
`;

const LabelCapsule = styled.rect`
  filter: drop-shadow(0 2px 6px rgba(100, 70, 40, 0.12));
`;

const LabelName = styled.text`
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 800;
  font-size: 15px;
  fill: #3a2f28;
  text-anchor: middle;
`;

const LabelCount = styled.text`
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 700;
  font-size: 11px;
  fill: #8b6d58;
  text-anchor: middle;
`;

// ── Helpers ──

function capsuleWidth(name: string, count: number): number {
  const chars = name.length;
  const countStr = `${count}所`;
  return Math.max(chars * 17 + countStr.length * 10 + 28, 72);
}

// ── Component ──

export default function HeroJiangsuMap({
  onCityClick,
  selectedCity,
  hoveredCity,
  onCityHover,
  cityCounts,
}: HeroJiangsuMapProps) {
  const cities = useMemo(
    () =>
      rawCities.map((c) => ({
        ...c,
        displayName: c.name.replace(/市$/, ""),
        count: cityCounts.get(c.name.replace(/市$/, "")) ?? 0,
      })),
    [cityCounts],
  );

  return (
    <MapStage>
      <SvgStage viewBox={MAP_VIEWBOX} preserveAspectRatio="xMidYMid meet">
        {/* Secondary outline strokes behind each city */}
        {cities.map((city) => (
          <CityOutline
            key={`${city.name}-outline`}
            d={city.d}
            $dimmed={selectedCity !== null && city.displayName !== selectedCity}
          />
        ))}

        {/* City fill paths */}
        {cities.map((city) => {
          const isSelected = selectedCity === city.displayName;
          const isHovered = hoveredCity === city.displayName;
          const isDimmed = selectedCity !== null && !isSelected;
          return (
            <CityPath
              key={city.name}
              d={city.d}
              $fill={cityColor(city.displayName)}
              $dimmed={isDimmed}
              $hovered={isHovered}
              onClick={() => onCityClick(city.displayName)}
              onMouseEnter={() => onCityHover(city.displayName)}
              onMouseLeave={() => onCityHover(null)}
            />
          );
        })}

        {/* Capsule labels */}
        {cities.map((city) => {
          if (city.count === 0) return null;
          const isDimmed = selectedCity !== null && city.displayName !== selectedCity;
          const cw = capsuleWidth(city.displayName, city.count);
          const cx = city.centroid.x;
          const cy = city.centroid.y - 16;
          return (
            <LabelGroup key={`${city.name}-label`} $dimmed={isDimmed}>
              <LabelCapsule
                x={cx - cw / 2}
                y={cy - 22}
                width={cw}
                height={38}
                rx={19}
                ry={19}
                fill="rgba(255,255,255,0.86)"
                stroke="rgba(200,175,150,0.22)"
                strokeWidth={1}
              />
              <LabelName x={cx} y={cy - 6}>
                {city.displayName}
              </LabelName>
              <LabelCount x={cx} y={cy + 9}>
                {city.count}所高校
              </LabelCount>
            </LabelGroup>
          );
        })}
      </SvgStage>
    </MapStage>
  );
}
