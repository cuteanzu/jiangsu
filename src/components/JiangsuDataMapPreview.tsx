import { useState } from "react";
import styled from "styled-components";
import pathAsset from "../assets/map/jiangsu-paths.json";
import { cityKey } from "../utils/jiangsuPresentation";

interface JiangsuPathCity {
  id: string;
  name: string;
  d: string;
  centroid: {
    x: number;
    y: number;
  };
}

interface JiangsuPathAsset {
  viewBox: string;
  cities: JiangsuPathCity[];
}

interface JiangsuDataMapPreviewProps {
  cityCounts: Map<string, number>;
  onCityClick: (city: string) => void;
}

const data = pathAsset as JiangsuPathAsset;

const fills = [
  "url(#mapPink)",
  "url(#mapBlue)",
  "url(#mapMint)",
  "url(#mapCream)",
  "url(#mapLilac)",
];

const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1.18;
  filter:
    drop-shadow(0 12px 18px rgba(50, 92, 152, 0.14))
    drop-shadow(0 0 12px rgba(255, 92, 150, 0.16));
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;

  .province-base {
    opacity: 0.58;
  }

  .city-side,
  .city-face,
  .city-dot {
    transition: opacity 0.18s ease, transform 0.18s ease, stroke 0.18s ease, stroke-width 0.18s ease;
    transform-box: fill-box;
    transform-origin: center;
  }

  .city-group:hover .city-face {
    opacity: 1;
    stroke: #ff4f83;
    stroke-width: 3;
    transform: translateY(-3px);
  }

  .city-group:hover .city-side {
    opacity: 0.72;
    transform: translateY(-1px);
  }

  .city-group:hover .city-dot {
    opacity: 1;
    transform: scale(1.28);
  }
`;

export default function JiangsuDataMapPreview({ cityCounts, onCityClick }: JiangsuDataMapPreviewProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <Frame>
      <Svg viewBox={data.viewBox} role="img" aria-label="江苏 13 城市 SVG 数据地图预览">
        <defs>
          <linearGradient id="mapPink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff8fb" />
            <stop offset="52%" stopColor="#ffc8dc" />
            <stop offset="100%" stopColor="#c8efff" />
          </linearGradient>
          <linearGradient id="mapBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fdff" />
            <stop offset="54%" stopColor="#bfe7ff" />
            <stop offset="100%" stopColor="#ffd9e8" />
          </linearGradient>
          <linearGradient id="mapMint" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffffb" />
            <stop offset="52%" stopColor="#cbf2df" />
            <stop offset="100%" stopColor="#ccecff" />
          </linearGradient>
          <linearGradient id="mapCream" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#ffe1ac" />
            <stop offset="100%" stopColor="#c9ecff" />
          </linearGradient>
          <linearGradient id="mapLilac" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#dfd3ff" />
            <stop offset="100%" stopColor="#ffd7e7" />
          </linearGradient>
          <filter id="dataMapGlow" x="-18%" y="-18%" width="136%" height="150%">
            <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#7ca8d6" floodOpacity="0.25" />
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ff8fbd" floodOpacity="0.18" />
          </filter>
        </defs>

        <g className="province-base" filter="url(#dataMapGlow)">
          {data.cities.map((city) => (
            <path key={`base-${city.id}`} d={city.d} transform="translate(10 15)" fill="#6fb9df" opacity="0.18" />
          ))}
        </g>

        {data.cities.map((city, index) => {
          const key = cityKey(city.name);
          const hovered = hoveredCity === key;
          const count = cityCounts.get(key) ?? 0;

          return (
            <g
              className="city-group"
              key={city.id}
              onClick={() => onCityClick(key)}
              onPointerEnter={() => setHoveredCity(key)}
              onPointerLeave={() => setHoveredCity(null)}
              style={{ cursor: "pointer" }}
            >
              <title>{`${key}市 · ${count} 所高校`}</title>
              <path
                className="city-side"
                d={city.d}
                transform="translate(8 13)"
                fill="#86c8e8"
                stroke="rgba(82, 135, 174, 0.5)"
                strokeWidth="1.4"
                strokeLinejoin="round"
                opacity={hovered ? 0.78 : 0.5}
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="city-face"
                d={city.d}
                fill={fills[index % fills.length]}
                stroke={hovered ? "#ff4f83" : "rgba(63, 118, 160, 0.72)"}
                strokeWidth={hovered ? 2.8 : 1.55}
                strokeLinejoin="round"
                opacity={hoveredCity && !hovered ? 0.58 : 0.86}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                className="city-dot"
                cx={city.centroid.x}
                cy={city.centroid.y}
                r={hovered ? 8.6 : 5.8}
                fill={hovered ? "#ff4f83" : "#ffffff"}
                stroke={hovered ? "#ffffff" : "#ff7dad"}
                strokeWidth="2"
                opacity={count > 0 ? 0.92 : 0.45}
              />
            </g>
          );
        })}
      </Svg>
    </Frame>
  );
}
