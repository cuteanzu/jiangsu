import type { RefObject, SVGProps } from "react";
import styled, { keyframes } from "styled-components";
import type { University } from "../../data/jiangsu-universities";
import type { JiangsuMapData, MapFeaturePath, MapTransform, ProjectedUniversity } from "../../utils/jiangsuMap";
import { cityKey } from "../../utils/jiangsuPresentation";
import { cityFillPalette, tierInkStyles } from "./tokens";

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.88; }
  50% { transform: scale(1.12); opacity: 1; }
`;

const beam = keyframes`
  0%, 100% { opacity: 0.28; }
  50% { opacity: 0.72; }
`;

const Svg = styled.svg`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  touch-action: none;
  cursor: grab;
  overflow: visible;

  &:active {
    cursor: grabbing;
  }

  .paper-city {
    transition: opacity 0.46s ease;
  }

  .city-face,
  .city-side,
  .city-shadow,
  .city-highlight,
  .city-fold {
    transition: opacity 0.46s ease, stroke 0.3s ease, stroke-width 0.3s ease, filter 0.46s ease;
  }

  .marker-core {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${pulse} 3.8s ease-in-out infinite;
  }

  .marker-beam {
    animation: ${beam} 2.8s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .map-book,
    .marker-core,
    .marker-beam {
      animation: none;
    }
  }
`;

const provinceLayerOffsets = [46, 36, 26, 16, 8];
const sceneTilt = {
  cx: 500,
  cy: 386,
  dx: 18,
  dy: 72,
  angle: -8,
  scaleY: 0.72,
};

interface MapMarkerProps {
  university: ProjectedUniversity;
  selected: boolean;
  hovered: boolean;
  onSelect: (university: University) => void;
  onHover: (id: string | null) => void;
}

interface CityOffsets {
  x: number;
  y: number;
  rotate: number;
  opacity: number;
}

interface MapCanvasProps {
  mapData: JiangsuMapData;
  filteredUniversities: ProjectedUniversity[];
  selectedId: string | null;
  hoveredId: string | null;
  selectedCity: string | null;
  hoveredCity: string | null;
  transform: MapTransform;
  svgRef: RefObject<SVGSVGElement | null>;
  svgHandlers: SVGProps<SVGSVGElement>;
  onCitySelect: (feature: MapFeaturePath) => void;
  onCityHover: (city: string | null) => void;
  onSelect: (university: University) => void;
  onHover: (id: string | null) => void;
}

const paperTransition = "opacity 520ms ease";

function markerShape(university: ProjectedUniversity, size: number) {
  const style = tierInkStyles[university.tier];

  if (university.tier === "985") {
    return (
      <g>
        <path
          d={`M0 ${-size * 1.1} C${size * 0.85} ${-size * 0.72} ${size * 0.9} ${size * 0.46} 0 ${size * 1.05} C${-size * 0.9} ${size * 0.46} ${-size * 0.85} ${-size * 0.72} 0 ${-size * 1.1}Z`}
          fill={style.color}
          stroke="#fff4f8"
          strokeWidth={1.4}
        />
        <circle r={size * 0.32} fill="#fff6bd" />
      </g>
    );
  }

  if (university.tier === "211") {
    return (
      <g>
        <rect
          x={-size * 0.72}
          y={-size * 0.72}
          width={size * 1.44}
          height={size * 1.44}
          rx={size * 0.18}
          fill="#fff9e6"
          stroke={style.color}
          strokeWidth={1.8}
          transform="rotate(45)"
        />
        <circle r={size * 0.24} fill={style.color} />
      </g>
    );
  }

  if (university.tier === "dual") {
    return (
      <g>
        <circle r={size * 0.92} fill="#f3fbff" stroke={style.color} strokeWidth={1.8} />
        <path
          d={`M0 ${-size * 0.64} L${size * 0.54} 0 L0 ${size * 0.64} L${-size * 0.54} 0Z`}
          fill={style.color}
          opacity="0.92"
        />
      </g>
    );
  }

  return (
    <g>
      <circle r={size * 0.86} fill="#f5fff8" stroke={style.color} strokeWidth={1.35} />
      <circle r={size * 0.34} fill={style.color} opacity="0.94" />
    </g>
  );
}

function MapMarker({ university, selected, hovered, onSelect, onHover }: MapMarkerProps) {
  const style = tierInkStyles[university.tier];
  const size = university.tier === "985" ? 9.8 : university.tier === "211" ? 8.8 : university.tier === "dual" ? 7.8 : 6.6;
  const active = selected || hovered;
  const showLabel = active || university.tier === "985" || university.tier === "211" || university.tier === "dual";
  const labelWidth = Math.max(98, university.name.length * 13 + 34);

  return (
    <g
      transform={`translate(${university.x}, ${university.y})`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(university);
      }}
      onPointerEnter={() => onHover(university.id)}
      onPointerLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
      aria-label={university.name}
      filter={active ? "url(#marker-hot-glow)" : "url(#marker-soft-glow)"}
    >
      <line
        className="marker-beam"
        x1="0"
        y1={size * 3.2}
        x2="0"
        y2={-size * 2.3}
        stroke="url(#school-beam)"
        strokeWidth={active ? 2.3 : 1.2}
        strokeLinecap="round"
      />
      <ellipse
        cx="0"
        cy={size * 2.55}
        rx={size * (active ? 2.35 : 1.62)}
        ry={size * 0.58}
        fill={style.soft}
        stroke={style.color}
        strokeWidth="0.85"
        opacity={active ? 0.78 : 0.38}
      />
      <path
        d={`M${-size * 0.56} ${-size * 2.25} H${size * 0.56} V${size * 0.88} L0 ${size * 1.38} L${-size * 0.56} ${size * 0.88}Z`}
        fill="rgba(255, 255, 255, 0.84)"
        stroke={style.color}
        strokeWidth={1}
        opacity={active ? 0.96 : 0.78}
      />
      <g className="marker-core" transform={`scale(${selected ? 1.28 : hovered ? 1.16 : 1})`}>
        {markerShape(university, size)}
      </g>
      {showLabel && (
        <g transform={`translate(0, ${-size * 4.4})`} pointerEvents="none">
          <rect
            x={-labelWidth / 2}
            y="-23"
            width={labelWidth}
            height="44"
            rx="13"
            fill={active ? "rgba(255, 255, 255, 0.94)" : "rgba(255, 255, 255, 0.78)"}
            stroke={style.color}
            strokeWidth="0.9"
            filter={active ? "url(#paper-label-shadow)" : undefined}
            opacity={active ? 1 : 0.84}
          />
          <text x="0" y="-5" textAnchor="middle" fill="#31425c" fontSize="13" fontFamily='"Noto Serif SC","Songti SC","STSong",serif'>
            {university.name}
          </text>
          <text x="0" y="12" textAnchor="middle" fill={style.color} fontSize="9.5" fontFamily='"Noto Serif SC","Songti SC","STSong",serif'>
            {university.city} · {style.label}
          </text>
        </g>
      )}
    </g>
  );
}

function scatterOffset(feature: MapFeaturePath, selectedFeature: MapFeaturePath | null): CityOffsets {
  if (!selectedFeature || feature.id === selectedFeature.id) {
    return { x: 0, y: 0, rotate: 0, opacity: 1 };
  }

  const dx = feature.center[0] - selectedFeature.center[0];
  const dy = feature.center[1] - selectedFeature.center[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = dx / length;
  const ny = dy / length;

  return {
    x: nx * 96,
    y: ny * 78,
    rotate: nx * 8 + ny * 3,
    opacity: 0.2,
  };
}

function cityTransform(
  feature: MapFeaturePath,
  selectedFeature: MapFeaturePath | null,
  active: boolean,
  hovered: boolean,
) {
  const offset = scatterOffset(feature, selectedFeature);
  const lift = active ? -26 : hovered ? -10 : 0;
  const scale = active ? 1.035 : 1;
  const rotate = active ? 0 : offset.rotate;
  const [cx, cy] = feature.center;

  return `translate(${offset.x} ${offset.y + lift}) translate(${cx} ${cy}) rotate(${rotate}) scale(${scale}) translate(${-cx} ${-cy})`;
}

function cityOpacity(feature: MapFeaturePath, selectedFeature: MapFeaturePath | null) {
  return scatterOffset(feature, selectedFeature).opacity;
}

function mapSceneTransform(provinceMode: boolean) {
  if (!provinceMode) return "";
  return `translate(${sceneTilt.dx} ${sceneTilt.dy}) translate(${sceneTilt.cx} ${sceneTilt.cy}) rotate(${sceneTilt.angle}) scale(1 ${sceneTilt.scaleY}) translate(${-sceneTilt.cx} ${-sceneTilt.cy})`;
}

function scenePoint(x: number, y: number, provinceMode: boolean): [number, number] {
  if (!provinceMode) return [x, y];
  const angle = (sceneTilt.angle * Math.PI) / 180;
  const dx = x - sceneTilt.cx;
  const dy = (y - sceneTilt.cy) * sceneTilt.scaleY;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    sceneTilt.cx + sceneTilt.dx + dx * cos - dy * sin,
    sceneTilt.cy + sceneTilt.dy + dx * sin + dy * cos,
  ];
}

function labelOffset(
  feature: MapFeaturePath,
  selectedFeature: MapFeaturePath | null,
  active: boolean,
  hovered: boolean,
  provinceMode: boolean,
) {
  const offset = scatterOffset(feature, selectedFeature);
  const [x, y] = scenePoint(feature.center[0] + offset.x, feature.center[1] + offset.y, provinceMode);
  return {
    x,
    y: y + (active ? -34 : hovered ? -15 : 0),
    opacity: active ? 1 : offset.opacity === 1 ? 0.94 : 0.16,
  };
}

export default function MapCanvas({
  mapData,
  filteredUniversities,
  selectedId,
  hoveredId,
  selectedCity,
  hoveredCity,
  transform,
  svgRef,
  svgHandlers,
  onCitySelect,
  onCityHover,
  onSelect,
  onHover,
}: MapCanvasProps) {
  const selectedUniversity = selectedId ? mapData.universities.find((university) => university.id === selectedId) : null;
  const activeCity = selectedUniversity?.city ?? selectedCity ?? "";
  const selectedFeature = selectedCity ? mapData.features.find((feature) => cityKey(feature.name) === selectedCity) ?? null : null;
  const provinceMode = !selectedCity;
  const provincePath = mapData.features.map((feature) => feature.d).join(" ");
  const sceneTransform = mapSceneTransform(provinceMode);
  const cityEntries = mapData.features
    .map((feature, index) => ({ feature, index }))
    .sort((a, b) => Number(cityKey(a.feature.name) === activeCity) - Number(cityKey(b.feature.name) === activeCity));

  return (
    <Svg ref={svgRef} viewBox={mapData.viewBox} role="img" aria-label="江苏高校立体书地图" {...svgHandlers}>
      <defs>
        <filter id="book-shadow" x="-18%" y="-18%" width="136%" height="150%">
          <feDropShadow dx="0" dy="40" stdDeviation="26" floodColor="#8db5d8" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#ff8fbd" floodOpacity="0.24" />
        </filter>
        <filter id="city-paper-shadow" x="-20%" y="-20%" width="142%" height="150%">
          <feDropShadow dx="0" dy="15" stdDeviation="8" floodColor="#7e9ab1" floodOpacity="0.34" />
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.46" />
        </filter>
        <filter id="province-stack-shadow" x="-18%" y="-18%" width="136%" height="150%">
          <feDropShadow dx="0" dy="20" stdDeviation="13" floodColor="#879fb4" floodOpacity="0.3" />
        </filter>
        <filter id="city-active-glow" x="-24%" y="-24%" width="148%" height="156%">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="#ff8ab3" floodOpacity="0.34" />
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#8ddfff" floodOpacity="0.28" />
        </filter>
        <filter id="marker-soft-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#9ab8ca" floodOpacity="0.22" />
        </filter>
        <filter id="marker-hot-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#ff7aa8" floodOpacity="0.52" />
          <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#7bdfff" floodOpacity="0.28" />
        </filter>
        <filter id="paper-label-shadow" x="-35%" y="-60%" width="170%" height="220%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#8aa3b6" floodOpacity="0.2" />
        </filter>

        <linearGradient id="book-page" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef7ff" />
          <stop offset="52%" stopColor="#f8fbff" />
          <stop offset="100%" stopColor="#ffddea" />
        </linearGradient>
        <linearGradient id="province-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9fc2" />
          <stop offset="36%" stopColor="#ffdbe8" />
          <stop offset="62%" stopColor="#f7fbff" />
          <stop offset="100%" stopColor="#8bd4ff" />
        </linearGradient>
        <linearGradient id="province-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5aaedc" />
          <stop offset="48%" stopColor="#e779a8" />
          <stop offset="100%" stopColor="#2f8fc1" />
        </linearGradient>
        <linearGradient id="book-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#dcebf5" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="city-paper-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="48%" stopColor="#ffc5da" />
          <stop offset="100%" stopColor="#caecff" />
        </linearGradient>
        <linearGradient id="city-paper-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="52%" stopColor="#b9e5ff" />
          <stop offset="100%" stopColor="#ffd6e6" />
        </linearGradient>
        <linearGradient id="city-paper-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffefa" />
          <stop offset="52%" stopColor="#c9f3dd" />
          <stop offset="100%" stopColor="#c8eaff" />
        </linearGradient>
        <linearGradient id="city-paper-cream" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="52%" stopColor="#ffe2a9" />
          <stop offset="100%" stopColor="#c9ecff" />
        </linearGradient>
        <linearGradient id="active-city-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff7fb" />
          <stop offset="42%" stopColor="#ffd9e8" />
          <stop offset="100%" stopColor="#dff6ff" />
        </linearGradient>
        <linearGradient id="city-side-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#77b8dc" />
          <stop offset="100%" stopColor="#ef8fba" />
        </linearGradient>
        <linearGradient id="school-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ff8ab8" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#76dfff" stopOpacity="0.78" />
        </linearGradient>
      </defs>

        <g transform={`translate(${transform.tx}, ${transform.ty}) scale(${transform.scale})`}>
        <g className="map-book" pointerEvents="none">
          <path
            d="M84 666 C218 732 728 752 936 674 L884 86 C712 34 300 48 128 118 Z"
            fill="url(#book-page)"
            filter="url(#book-shadow)"
            opacity="0.95"
          />
          <path
            d="M104 678 C266 734 698 744 916 674 L940 704 C698 780 250 760 70 692 Z"
            fill="url(#book-edge)"
            opacity="0.86"
          />
          <path
            d="M508 104 C496 260 501 466 515 690"
            fill="none"
            stroke="rgba(255, 152, 188, 0.18)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        <ellipse
          cx="506"
          cy="675"
          rx="360"
          ry="48"
          fill="rgba(255, 142, 184, 0.18)"
          pointerEvents="none"
        />

        <g pointerEvents="none" transform={sceneTransform}>
          <ellipse
            cx="505"
            cy="672"
            rx="420"
            ry="76"
            fill="rgba(75, 132, 176, 0.22)"
            opacity="0.82"
          />
          {provinceLayerOffsets.map((offset, layerIndex) => (
            <path
              key={`province-plate-${offset}`}
              d={provincePath}
              transform={`translate(${offset * 0.34} ${offset})`}
              fill={layerIndex === 0 ? "rgba(58, 134, 184, 0.42)" : "url(#province-side)"}
              stroke="rgba(44, 107, 151, 0.42)"
              strokeWidth="1.65"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              opacity={0.32 + layerIndex * 0.1}
            />
          ))}
          <path
            d={provincePath}
            fill="url(#province-plate)"
            stroke="rgba(37, 105, 154, 0.88)"
            strokeWidth="3.2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={provinceMode ? 1 : 0.42}
          />
        </g>

        <g transform={sceneTransform}>
          {cityEntries.map(({ feature, index }) => {
            const city = cityKey(feature.name);
            const active = city === activeCity;
            const hovered = city === hoveredCity;
            const muted = selectedCity !== null && !active;
            const faceFill = active ? "url(#active-city-paper)" : cityFillPalette[index % cityFillPalette.length];

            return (
              <g
                key={feature.id}
                className="paper-city"
                transform={cityTransform(feature, selectedFeature, active, hovered)}
                opacity={cityOpacity(feature, selectedFeature)}
                filter={active ? "url(#city-active-glow)" : undefined}
                style={{ transition: paperTransition }}
              >
                <path
                  className="city-shadow"
                  d={feature.d}
                  transform="translate(14 22)"
                  fill="rgba(42, 95, 132, 0.2)"
                  opacity={provinceMode ? 0.22 : muted ? 0.26 : 0.72}
                  pointerEvents="none"
                />
                <path
                  className="city-side"
                  d={feature.d}
                  transform="translate(7 12)"
                  fill="url(#city-side-fill)"
                  stroke="rgba(45, 112, 158, 0.5)"
                  strokeWidth="1.45"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  opacity={provinceMode ? 0.58 : muted ? 0.36 : active ? 0.96 : 0.82}
                  pointerEvents="none"
                />
                <path
                  className="city-face"
                  d={feature.d}
                  fill={faceFill}
                  stroke={active ? "#ff4f8c" : hovered ? "#25aee8" : "rgba(53, 116, 160, 0.74)"}
                  strokeWidth={active ? 2.8 : hovered ? 2.15 : 1.65}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  opacity={provinceMode ? 0.92 : 1}
                  filter={hovered ? "url(#city-paper-shadow)" : undefined}
                  style={{ cursor: "pointer" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCitySelect(feature);
                  }}
                  onPointerEnter={() => onCityHover(city)}
                  onPointerLeave={() => onCityHover(null)}
                />
                <path
                  className="city-fold"
                  d={feature.d}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.86)"
                  strokeWidth={active ? 2.2 : 1.45}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  opacity={provinceMode ? 0.58 : muted ? 0.24 : active ? 0.92 : 0.68}
                  pointerEvents="none"
                />
                {active && (
                  <path
                    className="city-highlight"
                    d={feature.d}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="4.2"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.42"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
        </g>

        <g>
          {mapData.features.map((feature) => {
            const city = cityKey(feature.name);
            const active = city === activeCity;
            const hidden = selectedCity !== null && !active;
            const hovered = city === hoveredCity;
            const label = labelOffset(feature, selectedFeature, active, hovered, provinceMode);
            const boxWidth = active ? 92 : provinceMode ? 60 : 68;
            const boxHeight = active ? 46 : provinceMode ? 31 : 34;

            return (
              <g
                key={`label-${feature.id}`}
                opacity={hidden ? label.opacity : feature.universityCount > 0 ? label.opacity : label.opacity * 0.66}
                style={{ cursor: "pointer", transition: paperTransition }}
                onClick={(event) => {
                  event.stopPropagation();
                  onCitySelect(feature);
                }}
                onPointerEnter={() => onCityHover(city)}
                onPointerLeave={() => onCityHover(null)}
              >
                <rect
                  x={label.x - boxWidth / 2}
                  y={label.y - boxHeight / 2}
                  width={boxWidth}
                  height={boxHeight}
                  rx="12"
                  fill={active ? "rgba(255, 255, 255, 0.94)" : "rgba(255, 255, 255, 0.72)"}
                  stroke={active ? "#ff5f92" : "rgba(255, 144, 185, 0.24)"}
                  filter="url(#paper-label-shadow)"
                />
                <text
                  x={label.x}
                  y={label.y - (active ? 7 : 5)}
                  textAnchor="middle"
                  fill="#36516d"
                  fontSize={active ? "17" : provinceMode ? "12" : "13.2"}
                  fontFamily='"Noto Serif SC","Songti SC","STSong",serif'
                  pointerEvents="none"
                >
                  {city}
                </text>
                {feature.universityCount > 0 && (
                  <text
                    x={label.x}
                    y={label.y + (active ? 13 : 10)}
                    textAnchor="middle"
                    fill={active ? "#ff5f92" : "rgba(232, 78, 128, 0.82)"}
                    fontSize={active ? "10.2" : provinceMode ? "8.2" : "8.8"}
                    fontFamily='"Noto Serif SC","Songti SC","STSong",serif'
                    pointerEvents="none"
                  >
                    {provinceMode ? `${feature.universityCount} 所高校` : `${feature.universityCount}`}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <g>
          {filteredUniversities.map((university) => (
            <MapMarker
              key={university.id}
              university={university}
              selected={selectedId === university.id}
              hovered={hoveredId === university.id}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </g>
      </g>
    </Svg>
  );
}
