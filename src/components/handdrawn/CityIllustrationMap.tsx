import { useMemo } from "react";
import type { CityMeta } from "../../data/city-profiles";
import type { University, Tier } from "../../data/jiangsu-universities";
import type { CityPathData } from "./useHandDrawnProjection";

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CityIllustrationMapProps {
  city: CityPathData;
  universities: University[];
  selectedUniversity: University | null;
  hoveredUniversity: University | null;
  meta: CityMeta;
  onHoverUniversity: (u: University | null) => void;
  onSelectUniversity: (u: University) => void;
}

const CITY_FILL: Record<string, string> = {
  南京: "#F4C7B8",
  苏州: "#BFDCC8",
  无锡: "#BBD9E8",
  徐州: "#EAD9A6",
  常州: "#D9C9E8",
  扬州: "#D5E5B8",
  镇江: "#F0D0AE",
  南通: "#BFE1DA",
  盐城: "#EFE0B8",
  淮安: "#DCC9A8",
  宿迁: "#CCDDBE",
  泰州: "#E8C4CC",
  连云港: "#C9D6EC",
};

const PIN_COLOR: Record<Tier, string> = {
  "985": "#c45a4a",
  "211": "#d97845",
  "dual": "#9b6a4c",
  "provincial": "#8eb7c9",
};

function computeBBox(pathD: string): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const re = /[ML]\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(pathD)) !== null) {
    const x = Number.parseFloat(match[1]);
    const y = Number.parseFloat(match[2]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function cityViewBox(bbox: BBox): string {
  const paddingX = Math.max(bbox.width * 0.04, 12);
  const paddingY = Math.max(bbox.height * 0.04, 12);
  return `${bbox.x - paddingX} ${bbox.y - paddingY} ${bbox.width + paddingX * 2} ${bbox.height + paddingY * 2}`;
}

export default function CityIllustrationMap({
  city,
  universities,
  selectedUniversity,
  hoveredUniversity,
  meta,
  onHoverUniversity,
  onSelectUniversity,
}: CityIllustrationMapProps) {
  const bbox = useMemo(() => computeBBox(city.pathD), [city.pathD]);
  const viewBox = useMemo(() => cityViewBox(bbox), [bbox]);
  const fill = CITY_FILL[city.name] ?? "#E7D7C5";
  const minDim = Math.max(Math.min(bbox.width, bbox.height), 80);

  const pins = useMemo(() => {
    const total = universities.length;
    return universities.map((university, index) => {
      if (total === 1) {
        return { university, x: city.center.x + bbox.width * 0.08, y: city.center.y };
      }
      const ring = Math.floor(index / 8);
      const itemInRing = index % 8;
      const angle = (itemInRing / Math.min(8, total)) * Math.PI * 2 - Math.PI / 2 + ring * 0.36;
      const radiusX = Math.min(bbox.width * 0.28, minDim * (0.34 + ring * 0.13));
      const radiusY = Math.min(bbox.height * 0.28, minDim * (0.28 + ring * 0.12));
      return {
        university,
        x: city.center.x + Math.cos(angle) * radiusX + (index % 3 - 1) * minDim * 0.04,
        y: city.center.y + Math.sin(angle) * radiusY + (index % 4 - 1.5) * minDim * 0.035,
      };
    });
  }, [bbox, city.center.x, city.center.y, minDim, universities]);

  return (
    <div className="hd-city-map-canvas">
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-label={`${city.name}高校点位地图`}>
        <defs>
          <filter id="hd-city-sketch" x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="12" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <path
          d={`M${bbox.x - 54},${city.center.y - bbox.height * 0.35} C${bbox.x - 16},${city.center.y - bbox.height * 0.10} ${bbox.x - 42},${city.center.y + bbox.height * 0.18} ${bbox.x - 12},${bbox.y + bbox.height + 48}`}
          className="hd-city-water-line"
        />
        <path
          d={`M${bbox.x + bbox.width * 0.10},${bbox.y + bbox.height * 0.74} Q${bbox.x + bbox.width * 0.22},${bbox.y + bbox.height * 0.58} ${bbox.x + bbox.width * 0.34},${bbox.y + bbox.height * 0.74} Q${bbox.x + bbox.width * 0.48},${bbox.y + bbox.height * 0.60} ${bbox.x + bbox.width * 0.62},${bbox.y + bbox.height * 0.76}`}
          className="hd-city-hills"
        />
        <g className="hd-city-trees" transform={`translate(${bbox.x + bbox.width * 0.72}, ${bbox.y + bbox.height * 0.68})`}>
          <path d="M0 22 L0 6 M-8 13 Q0 -2 8 13 M-6 18 Q0 7 6 18" />
          <path d="M28 20 L28 4 M20 12 Q28 0 36 12 M22 17 Q28 7 34 17" />
        </g>
        <g className="hd-city-building" transform={`translate(${bbox.x + bbox.width * 0.68}, ${bbox.y + bbox.height * 0.18})`}>
          <path d="M0 52 L0 18 L58 18 L58 52" />
          <path d="M8 18 L8 28 M20 18 L20 28 M32 18 L32 28 M44 18 L44 28" />
          <path d="M21 52 L21 38 Q29 25 37 38 L37 52" />
        </g>

        <path d={city.pathD} fill={fill} filter="url(#hd-city-sketch)" className="hd-city-shape" />
        <path d={city.pathD} className="hd-city-shape-line" />
        <text x={city.center.x} y={city.center.y - bbox.height * 0.05} className="hd-city-watermark">
          {city.name}
        </text>

        {pins.map(({ university, x, y }) => {
          const isActive = selectedUniversity?.name === university.name;
          const isHover = hoveredUniversity?.name === university.name;
          const pinColor = PIN_COLOR[university.tier];
          return (
            <g
              key={university.id}
              className={`hd-school-pin${isActive ? " is-active" : ""}${isHover ? " is-hovered" : ""}`}
              transform={`translate(${x}, ${y})`}
              onMouseEnter={() => onHoverUniversity(university)}
              onMouseLeave={() => onHoverUniversity(null)}
              onClick={() => onSelectUniversity(university)}
            >
              {isActive && <circle r={minDim * 0.045} className="hd-school-pin-glow" />}
              {isActive && <circle r={minDim * 0.038} className="hd-school-pin-pulse" fill="none" stroke={pinColor} strokeWidth={1.5} />}
              <circle r={isActive ? minDim * 0.032 : minDim * 0.024} fill={pinColor} />
              <circle r={isActive ? minDim * 0.014 : minDim * 0.010} className="hd-school-pin-core" />
            </g>
          );
        })}
      </svg>

      {city.name === "宿迁" && (
        <div className="hd-direction-tags">
          {meta.nearbyCities.map((nearby) => (
            <span key={nearby.name}>{nearby.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}
