import { useMemo } from "react";
import type { University } from "../../data/jiangsu-universities";
import type { CityPathData } from "./useHandDrawnProjection";

// ═══ Shared constants (mirrors HandDrawnMap) ═══
const FILL: Record<string, string> = {
  "南京": "#F4C7B8", "苏州": "#BFDCC8", "无锡": "#BBD9E8",
  "徐州": "#EAD9A6", "常州": "#D9C9E8", "扬州": "#D5E5B8",
  "镇江": "#F0D0AE", "南通": "#BFE1DA", "盐城": "#EFE0B8",
  "淮安": "#DCC9A8", "宿迁": "#CCDDBE", "泰州": "#E8C4CC",
  "连云港": "#C9D6EC",
};

const LABEL_ROTATE: Record<string, number> = {
  "南京": -1.5, "苏州": 1.2, "无锡": -0.8, "徐州": 1.8,
  "常州": -2.0, "扬州": 0.5, "镇江": -1.0, "南通": 1.5,
  "盐城": -0.5, "淮安": 2.0, "宿迁": -1.8, "泰州": 0.8,
  "连云港": -1.2,
};

const PIN_COLOR = "#B09878";
const PIN_ACTIVE = "#D4845A";

// ── BBox parser ──

interface BBox { x: number; y: number; width: number; height: number; }

function computeBBox(pathD: string): BBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const re = /[ML]\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/g;
  let m;
  while ((m = re.exec(pathD)) !== null) {
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// ═══════════════════════════════════════════════

export interface DetachedCityStageProps {
  city: CityPathData;
  cityUniversities: University[];
  selectedSchool: string | null;
  hoveredSchool: string | null;
  showAllPins: boolean;
  schoolCounts?: Record<string, number>;
  visible: boolean;
  onHoverSchool: (name: string | null) => void;
  onSelectSchool: (name: string | null) => void;
  onViewDetail: (school: University) => void;
}

export default function DetachedCityStage({
  city, cityUniversities, selectedSchool, hoveredSchool,
  showAllPins, schoolCounts, visible,
  onHoverSchool, onSelectSchool, onViewDetail,
}: DetachedCityStageProps) {
  const bbox = useMemo(() => computeBBox(city.pathD), [city.pathD]);
  const pad = 55;
  const vb = `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`;

  const fill = FILL[city.name] || "#DCD4C8";
  const rot = LABEL_ROTATE[city.name] || 0;
  const count = schoolCounts?.[city.name];
  const cx = city.center.x;
  const cy = city.center.y;

  const pins = useMemo(() =>
    cityUniversities.filter((u) => showAllPins || ["985", "211", "dual"].includes(u.tier)),
    [cityUniversities, showAllPins],
  );

  return (
    <div
      className={`detached-stage${visible ? " detached-stage--enter" : ""}`}
      style={{
        position: "absolute",
        zIndex: 11,
        left: "50%",
        top: "50%",
        transform: "translate(-55%, -50%)",
        width: "clamp(380px, 44vw, 520px)",
        height: "clamp(400px, 56vh, 560px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Paper background */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18,
        background: "linear-gradient(180deg, rgba(255,252,247,0.72) 0%, rgba(255,248,240,0.58) 100%)",
        border: "1px solid rgba(200,170,150,0.18)",
        boxShadow: "0 2px 12px rgba(160,140,120,0.05), 0 8px 40px rgba(160,130,110,0.09)",
        backdropFilter: "blur(6px)",
      }} />

      <svg
        viewBox={vb}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="ds-sketch" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ds-bloom" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation={2.5} result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="out" />
          </filter>
          <filter id="ds-texture" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="3" result="n" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.06 0" in="n" result="c" />
            <feComposite in="c" in2="SourceGraphic" operator="in" result="t" />
            <feBlend in="t" in2="SourceGraphic" mode="multiply" />
          </filter>
          <filter id="ds-sticker" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx={0.5} dy={1.2} stdDeviation={2} floodColor="#B8A090" floodOpacity={0.20} />
          </filter>
        </defs>

        {/* Watercolor bloom */}
        <path d={city.pathD} fill="none" stroke={fill}
          strokeWidth={bbox.width * 0.14} strokeLinecap="round" strokeLinejoin="round"
          opacity={0.06} filter="url(#ds-bloom)"
          style={{ pointerEvents: "none" }} />
        <path d={city.pathD} fill="none" stroke={fill}
          strokeWidth={bbox.width * 0.09} strokeLinecap="round" strokeLinejoin="round"
          opacity={0.10} filter="url(#ds-bloom)"
          style={{ pointerEvents: "none" }} />
        <path d={city.pathD} fill="none" stroke={fill}
          strokeWidth={bbox.width * 0.05} strokeLinecap="round" strokeLinejoin="round"
          opacity={0.14} filter="url(#ds-sketch)"
          style={{ pointerEvents: "none" }} />

        {/* Watercolor fill with texture */}
        <path d={city.pathD} fill={fill} stroke="none"
          fillOpacity={0.72} filter="url(#ds-texture)"
          style={{ pointerEvents: "none" }} />

        {/* Hand-drawn boundary */}
        <path d={city.pathD} fill="none"
          stroke="#7B5A40" strokeWidth={bbox.width * 0.012}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={0.62} filter="url(#ds-sketch)"
          style={{ pointerEvents: "none" }} />
        <path d={city.pathD} fill="none"
          stroke="#7B5A40" strokeWidth={bbox.width * 0.004}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={0.30} filter="url(#ds-sketch)"
          style={{ pointerEvents: "none" }} />

        {/* City label — sticker style */}
        <g style={{ pointerEvents: "none" }}
          transform={`rotate(${rot}, ${cx}, ${cy})`}>
          <rect x={cx - 42} y={cy - 22} width={84} height={40} rx={8}
            fill="rgba(255,252,248,0.96)"
            stroke="rgba(165,130,100,0.48)" strokeWidth={1.3}
            filter="url(#ds-sticker)" />
          <text x={cx} y={count !== undefined ? cy - 5 : cy}
            textAnchor="middle" dominantBaseline="central"
            fontFamily='"Noto Serif SC","Songti SC","KaiTi",serif'
            fontSize={bbox.width * 0.08} fontWeight={900} fill="#4A3828">
            {city.name}
          </text>
          {count !== undefined && (
            <text x={cx} y={cy + 11}
              textAnchor="middle" dominantBaseline="central"
              fontFamily='"Noto Sans SC","PingFang SC",sans-serif'
              fontSize={bbox.width * 0.055} fontWeight={700} fill="#8B7D73">
              {count} 所高校
            </text>
          )}
        </g>

        {/* School markers — staggered fade-in */}
        {pins.map((u, i) => {
          const idx = cityUniversities.indexOf(u);
          const angle = (idx / Math.max(cityUniversities.length, 1)) * Math.PI * 2 - Math.PI / 2;
          const radius = bbox.width * 0.16 + (idx % 3) * bbox.width * 0.06;
          const sx = cx + Math.cos(angle) * radius;
          const sy = cy + Math.sin(angle) * radius;
          const isSel = selectedSchool === u.name;
          const isHov = hoveredSchool === u.name;
          const dotColor = isSel ? PIN_ACTIVE : PIN_COLOR;
          const dotR = isSel ? bbox.width * 0.028 : isHov ? bbox.width * 0.024 : bbox.width * 0.018;
          const delay = 0.15 + i * 0.055;

          return (
            <g key={`ds-pin-${u.id}`}
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.35s ease ${delay}s`,
              }}>
              {/* Outer ring */}
              <circle cx={sx} cy={sy} r={dotR + bbox.width * 0.012} fill="none"
                stroke={dotColor} strokeWidth={bbox.width * 0.006}
                opacity={isSel ? 0.40 : 0.22} />
              {/* Main dot */}
              <circle cx={sx} cy={sy} r={dotR} fill={dotColor}
                opacity={isSel ? 0.90 : 0.70} />
              {/* Highlight */}
              <circle cx={sx - dotR * 0.3} cy={sy - dotR * 0.35} r={dotR * 0.30}
                fill="#FFFDF8" opacity={0.50} />
              {/* Hit area */}
              <circle cx={sx} cy={sy} r={bbox.width * 0.06} fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => onHoverSchool(u.name)}
                onMouseLeave={() => onHoverSchool(null)}
                onClick={() => {
                  if (isSel) { onSelectSchool(null); }
                  else { onSelectSchool(u.name); onViewDetail(u); }
                }}
              />
              {/* Tooltip */}
              <g opacity={isHov && !isSel ? 1 : 0} style={{ pointerEvents: "none" }}>
                <rect x={sx - 38} y={sy - 30} width={76} height={19} rx={5}
                  fill="rgba(255,252,248,0.94)" stroke="rgba(160,120,80,0.30)" strokeWidth={0.8} />
                <text x={sx} y={sy - 17} textAnchor="middle"
                  fontFamily='"Noto Sans SC","PingFang SC",sans-serif'
                  fontSize={bbox.width * 0.048} fontWeight={600} fill="#4A3828">
                  {u.name.length > 7 ? u.name.slice(0, 7) + ".." : u.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
