import { useMemo, useState, useEffect, useRef } from "react";
import type { University } from "../../data/jiangsu-universities";
import type { CityCockpitProfile } from "../../data/city-profiles";
import type { CityPathData } from "./useHandDrawnProjection";

// ═══ Palette ═══
const FILL: Record<string, string> = {
  "南京": "#F4C7B8", "苏州": "#BFDCC8", "无锡": "#BBD9E8",
  "徐州": "#EAD9A6", "常州": "#D9C9E8", "扬州": "#D5E5B8",
  "镇江": "#F0D0AE", "南通": "#BFE1DA", "盐城": "#EFE0B8",
  "淮安": "#DCC9A8", "宿迁": "#CCDDBE", "泰州": "#E8C4CC",
  "连云港": "#C9D6EC",
};

const PIN_COLOR = "#B09878";
const PIN_ACTIVE = "#D4845A";

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

// ═══ City-specific hand-drawn decorations ═══

function YanchengDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#9BB8A0" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(15, 40)">
        <path d="M0,0 Q2,-18 4,-35 M3,-10 Q6,-22 8,-32 M6,-5 Q10,-16 11,-28" strokeWidth={0.7} />
        <path d="M14,0 Q16,-14 18,-28 M17,-8 Q20,-18 21,-26" strokeWidth={0.7} />
      </g>
      <g transform="translate(55, 20)">
        <path d="M0,6 Q4,0 10,2 Q14,4 16,2" strokeWidth={1} />
        <path d="M8,2 Q10,-4 14,-6" strokeWidth={0.8} />
        <path d="M10,3 Q12,8 14,10" strokeWidth={0.6} />
      </g>
      <path d="M10,60 Q20,56 30,60 Q40,64 50,60 Q60,56 70,60" strokeWidth={0.8} opacity={0.5} />
    </g>
  );
}

function NanjingDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#B58B64" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,50 L10,20 L50,20 L50,50" strokeWidth={1.3} />
      <path d="M18,20 L18,28 M28,20 L28,28 M38,20 L38,28 M44,20 L44,28" strokeWidth={0.7} />
      <path d="M25,50 L25,36 Q30,28 35,36 L35,50" fill="#B58B64" fillOpacity={0.08} strokeWidth={1} />
      <g transform="translate(58, 52)">
        <line x1={0} y1={0} x2={0} y2={-16} strokeWidth={1.2} />
        <path d="M-8,-10 Q0,-20 8,-14" strokeWidth={0.9} />
        <path d="M-6,-8 Q0,-18 6,-12" strokeWidth={0.8} />
      </g>
      {/* Book */}
      <g transform="translate(55, 16)">
        <rect x={0} y={0} width={6} height={8} rx={0.5} fill="#B58B64" fillOpacity={0.06} strokeWidth={0.7} />
        <line x1={3} y1={0} x2={3} y2={8} strokeWidth={0.4} />
      </g>
    </g>
  );
}

function SuzhouDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#8BA88E" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8,50 Q20,30 32,50" strokeWidth={1.2} />
      <path d="M12,46 Q20,36 28,46" strokeWidth={0.7} />
      <path d="M48,22 Q52,12 60,14" strokeWidth={1.2} />
      <path d="M60,14 L60,24" strokeWidth={0.9} />
      <path d="M48,22 Q50,28 60,28" strokeWidth={0.7} fill="#8BA88E" fillOpacity={0.04} />
      {/* Lotus leaf */}
      <g transform="translate(14, 18)">
        <path d="M0,0 Q6,-8 12,-2 Q8,4 0,0" strokeWidth={0.8} fill="#8BA88E" fillOpacity={0.06} />
        <line x1={6} y1={-4} x2={6} y2={-1} strokeWidth={0.5} />
      </g>
    </g>
  );
}

function WuxiDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#8AA8B8" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8,48 Q16,44 24,48 Q32,52 40,48 Q48,44 56,48 Q64,52 72,48" strokeWidth={0.9} />
      <path d="M12,54 Q20,50 28,54 Q36,58 44,54 Q52,50 60,54 Q68,58 76,54" strokeWidth={0.6} opacity={0.6} />
      <g transform="translate(40, 38)">
        <path d="M0,0 Q4,6 12,4 L14,2" strokeWidth={1} />
        <line x1={6} y1={1} x2={5} y2={-5} strokeWidth={0.6} />
        <path d="M5,-5 L9,-3 L5,-2" fill="#8AA8B8" fillOpacity={0.08} strokeWidth={0.4} />
      </g>
    </g>
  );
}

function XuzhouDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#B89868" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,52 Q8,28 16,44 Q24,18 32,40 Q40,22 48,44 Q56,32 64,50" strokeWidth={1.1} fill="#B89868" fillOpacity={0.05} />
      <g transform="translate(50, 22)">
        <rect x={0} y={6} width={14} height={12} strokeWidth={1} />
        <path d="M-1,6 L7,-4 L15,6" strokeWidth={0.9} />
        <line x1={7} y1={-4} x2={7} y2={0} strokeWidth={0.6} />
        <line x1={3} y1={18} x2={10} y2={22} strokeWidth={0.5} opacity={0.5} />
      </g>
    </g>
  );
}

function NantongDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#8AA8A0" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Lighthouse */}
      <g transform="translate(44, 14)">
        <rect x={3} y={8} width={8} height={18} strokeWidth={1} />
        <path d="M0,8 L7,0 L14,8" strokeWidth={0.9} />
        <line x1={5} y1={18} x2={9} y2={18} strokeWidth={0.5} />
        <circle cx={7} cy={4} r={3} strokeWidth={0.7} fill="#8AA8A0" fillOpacity={0.06} />
      </g>
      {/* Windmill */}
      <g transform="translate(12, 24)">
        <line x1={0} y1={18} x2={0} y2={0} strokeWidth={1} />
        <line x1={-7} y1={5} x2={7} y2={5} strokeWidth={0.7} />
        <line x1={-5} y1={1} x2={5} y2={9} strokeWidth={0.7} />
        <line x1={-5} y1={9} x2={5} y2={1} strokeWidth={0.7} />
        <line x1={0} y1={-2} x2={0} y2={10} strokeWidth={0.7} />
      </g>
      {/* Sea waves */}
      <path d="M4,54 Q14,50 24,54 Q34,58 44,54 Q54,50 64,54 Q74,58 80,54" strokeWidth={0.8} opacity={0.5} />
      <path d="M8,60 Q18,56 28,60 Q38,64 48,60 Q58,56 68,60" strokeWidth={0.6} opacity={0.35} />
    </g>
  );
}

function YangzhouDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#8BA88E" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,40 Q14,22 24,30 Q34,20 44,28 Q54,18 62,30 Q70,22 72,40" strokeWidth={1.1} />
      <path d="M10,40 L72,40" strokeWidth={0.7} />
      <path d="M18,30 L22,18 L26,30" strokeWidth={0.8} />
      <path d="M34,28 L38,16 L42,28" strokeWidth={0.8} />
      <path d="M54,28 L58,18 L62,28" strokeWidth={0.8} />
      {/* Willow tree */}
      <g transform="translate(62, 48)">
        <line x1={0} y1={0} x2={0} y2={-10} strokeWidth={0.8} />
        <path d="M0,-8 Q-4,-14 -6,-8" strokeWidth={0.6} />
        <path d="M0,-6 Q-5,-12 -7,-6" strokeWidth={0.6} />
        <path d="M0,-8 Q3,-13 5,-7" strokeWidth={0.6} />
      </g>
    </g>
  );
}

function LianyungangDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#7A8EAE" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,46 Q8,18 18,34 Q26,10 36,30 Q44,8 54,28 Q62,14 70,34 Q76,22 80,42" strokeWidth={1} fill="#7A8EAE" fillOpacity={0.04} />
      <g transform="translate(58, 24)">
        <line x1={4} y1={20} x2={4} y2={2} strokeWidth={1.2} />
        <line x1={0} y1={2} x2={12} y2={2} strokeWidth={0.8} />
        <line x1={12} y1={2} x2={12} y2={8} strokeWidth={0.6} />
        <line x1={4} y1={6} x2={8} y2={6} strokeWidth={0.5} />
      </g>
      <path d="M4,54 Q14,50 24,54 Q34,58 44,54 Q54,50 64,54" strokeWidth={0.7} opacity={0.45} />
    </g>
  );
}

// Simpler decorations for remaining cities
function ChangzhouDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#9B8AB8" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(28, 20)">
        <rect x={0} y={8} width={10} height={24} strokeWidth={1} />
        <path d="M-1,8 L5,-4 L11,8" strokeWidth={0.9} />
        <line x1={5} y1={-4} x2={5} y2={4} strokeWidth={0.5} />
        <line x1={0} y1={16} x2={10} y2={16} strokeWidth={0.5} opacity={0.5} />
        <line x1={0} y1={22} x2={10} y2={22} strokeWidth={0.5} opacity={0.5} />
      </g>
    </g>
  );
}

function ZhenjiangDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#B89868" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,44 Q10,20 20,38 Q30,14 40,34 Q50,18 60,38 Q70,22 80,42" strokeWidth={1.1} fill="#B89868" fillOpacity={0.05} />
      <g transform="translate(26, 22)">
        <rect x={0} y={4} width={10} height={8} strokeWidth={0.9} />
        <path d="M-1,4 L5,-3 L11,4" strokeWidth={0.8} />
      </g>
    </g>
  );
}

function HuaianDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#A89868" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(24, 20)">
        <rect x={0} y={0} width={14} height={18} strokeWidth={1.1} />
        <line x1={7} y1={0} x2={7} y2={18} strokeWidth={0.7} />
      </g>
      <path d="M10,44 Q20,40 30,44 Q40,48 48,44" strokeWidth={0.8} opacity={0.5} />
      <path d="M34,44 Q40,34 48,44" strokeWidth={0.9} />
    </g>
  );
}

function SuqianDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#8A9E7A" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8,40 Q20,30 36,36 Q50,30 64,38 Q72,34 78,40" strokeWidth={0.9} fill="#8A9E7A" fillOpacity={0.04} />
      <g transform="translate(14, 38)">
        <path d="M0,0 Q2,-12 3,-22 M2,-6 Q5,-14 6,-18" strokeWidth={0.7} />
        <path d="M6,0 Q8,-10 9,-18" strokeWidth={0.7} />
      </g>
      <g transform="translate(48, 24)">
        <line x1={4} y1={16} x2={4} y2={6} strokeWidth={1} />
        <path d="M-2,6 L4,-2 L10,6" strokeWidth={0.9} />
      </g>
    </g>
  );
}

function TaizhouDecoration() {
  return (
    <g opacity={0.35} fill="none" stroke="#C09888" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(28, 14)">
        <rect x={0} y={8} width={12} height={18} strokeWidth={1} />
        <path d="M-1,8 L6,-4 L13,8" strokeWidth={0.9} />
        <line x1={2} y1={14} x2={10} y2={14} strokeWidth={0.5} opacity={0.5} />
        <line x1={2} y1={20} x2={10} y2={20} strokeWidth={0.5} opacity={0.5} />
      </g>
      <path d="M8,50 L8,34 Q48,30 72,36 L72,50" strokeWidth={0.8} opacity={0.5} />
      <path d="M14,34 L14,42 M22,33 L22,40 M30,32 L30,38" strokeWidth={0.5} opacity={0.4} />
    </g>
  );
}

const CITY_DECORATION: Record<string, React.FC> = {
  "盐城": YanchengDecoration,
  "南京": NanjingDecoration,
  "苏州": SuzhouDecoration,
  "无锡": WuxiDecoration,
  "徐州": XuzhouDecoration,
  "常州": ChangzhouDecoration,
  "镇江": ZhenjiangDecoration,
  "南通": NantongDecoration,
  "扬州": YangzhouDecoration,
  "淮安": HuaianDecoration,
  "宿迁": SuqianDecoration,
  "泰州": TaizhouDecoration,
  "连云港": LianyungangDecoration,
};

// ═══════════════════════════════════════════════

export interface CityFocusViewProps {
  city: CityPathData;
  cityUniversities: University[];
  selectedSchool: string | null;
  hoveredSchool: string | null;
  showAllPins: boolean;
  schoolCounts?: Record<string, number>;
  cityProfile: CityCockpitProfile;
  visible: boolean;
  onHoverSchool: (name: string | null) => void;
  onSelectSchool: (name: string | null) => void;
  onViewDetail: (school: University) => void;
}

export default function CityFocusView({
  city, cityUniversities, selectedSchool, hoveredSchool,
  showAllPins, schoolCounts, cityProfile, visible,
  onHoverSchool, onSelectSchool, onViewDetail,
}: CityFocusViewProps) {
  const bbox = useMemo(() => computeBBox(city.pathD), [city.pathD]);
  const fill = FILL[city.name] || "#DCD4C8";
  const count = schoolCounts?.[city.name];
  const Decoration = CITY_DECORATION[city.name];

  // Build viewBox accounting for aspect ratio
  const mapVB = useMemo(() => {
    const ar = bbox.width / bbox.height;
    let vbW: number, vbH: number;
    if (ar < 0.7) {
      vbW = bbox.height * 0.9;
      vbH = bbox.height * 1.15;
    } else if (ar > 1.5) {
      vbW = bbox.width * 1.2;
      vbH = bbox.width * 0.85;
    } else {
      vbW = bbox.width * 1.2;
      vbH = bbox.height * 1.2;
    }
    const vbX = bbox.x + bbox.width / 2 - vbW / 2;
    const vbY = bbox.y + bbox.height / 2 - vbH / 2;
    return `${vbX} ${vbY} ${vbW} ${vbH}`;
  }, [bbox]);

  const pins = useMemo(() =>
    cityUniversities.filter((u) => showAllPins || ["985", "211", "dual"].includes(u.tier)),
    [cityUniversities, showAllPins],
  );

  // Build subtitle line
  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (count !== undefined) parts.push(`${count} 所高校`);
    parts.push("本科城市");
    if (cityProfile.cost) parts.push(cityProfile.cost);
    if (cityProfile.transit) parts.push(cityProfile.transit);
    return parts.join(" · ");
  }, [count, cityProfile]);

  // Map draw animation
  type MapPhase = "idle" | "drawing" | "complete";
  const [mapPhase, setMapPhase] = useState<MapPhase>("idle");
  const [selectedPulse, setSelectedPulse] = useState<string | null>(null);
  const prevVisibleRef = useRef(visible);

  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    if (visible && !wasVisible) {
      timers.push(setTimeout(() => setMapPhase("drawing"), 0));
      timers.push(setTimeout(() => setMapPhase("complete"), 550));
    } else if (!visible) {
      timers.push(setTimeout(() => setMapPhase("idle"), 0));
    }

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [visible]);

  // One-time pulse when a school is selected
  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    if (!selectedSchool) {
      timers.push(setTimeout(() => setSelectedPulse(null), 0));
    } else {
      timers.push(setTimeout(() => setSelectedPulse(selectedSchool), 0));
      timers.push(setTimeout(() => setSelectedPulse(null), 2000));
    }
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [selectedSchool]);

  const isDrawing = mapPhase === "drawing";
  const isMapReady = mapPhase === "complete";

  return (
    <section
      className={`city-focus-view cf-journal${visible ? " city-focus-view--enter" : ""}`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="cf-paper-lines" />

      <header className="cf-title-block">
        <div className="cf-title-row">
          <h2>{city.name}</h2>
          <span>{cityProfile.identity}</span>
        </div>
        <p className="cf-subtitle">{subtitle}</p>
      </header>

      <div className="cf-content-grid">
        <aside className="cf-info-rail">
          <p className="cf-city-summary">{cityProfile.summary}</p>

          {Decoration && (
            <span className="cf-hidden-decoration" aria-hidden="true">
              <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <Decoration />
              </svg>
            </span>
          )}

          {cityProfile.impressions.length > 0 && (
        <section className="cf-note-section">
          <h3>城市印象</h3>
          <div className="cf-tag-list">
            {cityProfile.impressions.slice(0, 4).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>
          )}

          {cityProfile.suitableFor.length > 0 && (
        <section className="cf-note-section">
          <h3>适合人群</h3>
          <div className="cf-audience-list">
            {cityProfile.suitableFor.slice(0, 4).map((s) => (
              <p key={s}>
                <span />
                {s}
              </p>
            ))}
          </div>
        </section>
          )}
        </aside>

        <div className="cf-map-panel">
        <div className="cf-map-canvas">
          <svg
            className="cf-map-svg"
            viewBox={mapVB}
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
              <defs>
                <filter id="cv-sketch" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="3" result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale={1.2} xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <filter id="cv-bloom" x="-15%" y="-15%" width="130%" height="130%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" result="d" />
                  <feGaussianBlur in="d" stdDeviation={2.5} result="b" />
                  <feComposite in="b" in2="SourceGraphic" operator="out" />
                </filter>
                <filter id="cv-texture" x="-2%" y="-2%" width="104%" height="104%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="3" result="n" />
                  <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.06 0" in="n" result="c" />
                  <feComposite in="c" in2="SourceGraphic" operator="in" result="t" />
                  <feBlend in="t" in2="SourceGraphic" mode="multiply" />
                </filter>
              </defs>

              {/* Bloom */}
              <path d={city.pathD} fill="none" stroke={fill}
                strokeWidth={bbox.width * 0.12} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.07} filter="url(#cv-bloom)" style={{ pointerEvents: "none" }} />
              <path d={city.pathD} fill="none" stroke={fill}
                strokeWidth={bbox.width * 0.07} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.11} filter="url(#cv-bloom)" style={{ pointerEvents: "none" }} />
              <path d={city.pathD} fill="none" stroke={fill}
                strokeWidth={bbox.width * 0.04} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.15} filter="url(#cv-sketch)" style={{ pointerEvents: "none" }} />

              {/* Textured fill */}
              <path d={city.pathD} fill={fill} stroke="none"
                fillOpacity={isDrawing || isMapReady ? 0.52 : 0}
                filter="url(#cv-texture)"
                style={{
                  pointerEvents: "none",
                  transition: "fill-opacity 0.45s ease 0.15s",
                }} />

              {/* Boundary — hand-drawn stroke animation */}
              <path d={city.pathD} fill="none"
                stroke="#7B5A40" strokeWidth={bbox.width * 0.011}
                strokeLinecap="round" strokeLinejoin="round"
                opacity={0.55} filter="url(#cv-sketch)"
                pathLength={1000}
                strokeDasharray={1000}
                strokeDashoffset={(isDrawing || isMapReady) ? 0 : 1000}
                className="hd-map-boundary"
                style={{ pointerEvents: "none" }} />
              <path d={city.pathD} fill="none"
                stroke="#7B5A40" strokeWidth={bbox.width * 0.004}
                strokeLinecap="round" strokeLinejoin="round"
                opacity={isDrawing || isMapReady ? 0.28 : 0}
                filter="url(#cv-sketch)"
                style={{
                  pointerEvents: "none",
                  transition: "opacity 0.35s ease 0.12s",
                }} />

              {/* City name watermark */}
              <g style={{ pointerEvents: "none" }}>
                <text x={city.center.x} y={city.center.y - bbox.height * 0.04}
                  textAnchor="middle"
                  fontFamily='"Noto Serif SC","Songti SC",serif'
                  fontSize={bbox.width * 0.058} fontWeight={700} fill="#8B7D73"
                  opacity={0.35}>
                  {city.name}
                </text>
              </g>

              {/* School pins — dots only, no labels */}
              {pins.map((u, i) => {
                const idx = cityUniversities.indexOf(u);
                const angle = (idx / Math.max(cityUniversities.length, 1)) * Math.PI * 2 - Math.PI / 2;
                const radius = bbox.width * 0.14 + (idx % 3) * bbox.width * 0.055;
                const sx = city.center.x + Math.cos(angle) * radius;
                const sy = city.center.y + Math.sin(angle) * radius;
                const isSel = selectedSchool === u.name;
                const isHov = hoveredSchool === u.name;
                const dotColor = isSel ? PIN_ACTIVE : PIN_COLOR;
                const baseR = bbox.width * 0.028;
                const dotR = isSel ? baseR * 1.3 : isHov ? baseR * 1.3 : baseR;
                const staggerDelay = 0.22 + i * 0.045;
                const pinScale = isMapReady ? 1 : 0.4;
                const pinOpacity = isMapReady ? 1 : 0;
                const showPulse = selectedPulse === u.name;

                return (
                  <g key={`cv-pin-${u.id}`}
                    transform={`translate(${sx}, ${sy})`}
                    opacity={pinOpacity}
                    style={{ transition: `opacity 0.25s ease ${staggerDelay}s` }}>
                    <g className="hd-pin-scaling"
                       style={{
                         transform: `scale(${pinScale})`,
                         transition: `transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay}s`,
                       }}>
                      {/* One-time pulse ring for selected */}
                      {showPulse && (
                        <circle cx={0} cy={0} r={dotR * 1.5} fill="none"
                          stroke={PIN_ACTIVE} strokeWidth={bbox.width * 0.005}
                          opacity={0}
                          className="hd-pulse-ring" />
                      )}
                      {/* Outer ring */}
                      <circle cx={0} cy={0} r={dotR + bbox.width * 0.012} fill="none"
                        stroke={dotColor} strokeWidth={bbox.width * 0.006}
                        opacity={isSel ? 0.42 : isHov ? 0.35 : 0.20} />
                      {/* Dot */}
                      <circle cx={0} cy={0} r={dotR} fill={dotColor}
                        opacity={isSel ? 0.92 : 0.68} />
                      {/* Highlight */}
                      <circle cx={-dotR * 0.3} cy={-dotR * 0.35} r={dotR * 0.28}
                        fill="#FFFDF8" opacity={0.48} />
                    </g>
                    {/* Hit area */}
                    <circle cx={0} cy={0} r={bbox.width * 0.07} fill="transparent"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => onHoverSchool(u.name)}
                      onMouseLeave={() => onHoverSchool(null)}
                      onClick={() => {
                        if (isSel) { onSelectSchool(null); }
                        else { onSelectSchool(u.name); onViewDetail(u); }
                      }}
                    />
                    {/* Hover tooltip */}
                    <g opacity={isHov ? 1 : 0} style={{ pointerEvents: "none" }}>
                      <rect x={-40} y={-32} width={80} height={20} rx={5}
                        fill="rgba(255,252,248,0.95)" stroke="rgba(160,120,80,0.30)" strokeWidth={0.8} />
                      <text x={0} y={-18} textAnchor="middle"
                        fontFamily='"Noto Sans SC","PingFang SC",sans-serif'
                        fontSize={bbox.width * 0.048} fontWeight={600} fill="#4A3828">
                        {u.name.length > 8 ? u.name.slice(0, 8) + ".." : u.name}
                      </text>
                    </g>
                  </g>
                );
              })}
          </svg>
        </div>

        {selectedSchool && (
          <div className="cf-selected-pill">
            <span />
            当前查看：
            <strong>{selectedSchool}</strong>
          </div>
        )}

        </div>
      </div>

      <div className="cf-stat-card">
        <div>
          <span>面积</span>
          <strong>{cityProfile.stats.area}</strong>
        </div>
        <div>
          <span>常住人口</span>
          <strong>{cityProfile.stats.population}</strong>
        </div>
        <div>
          <span>高校数量</span>
          <strong>{cityProfile.stats.universityCount} 所</strong>
        </div>
      </div>

      {cityProfile.tips && (
        <section className="cf-note-section cf-tip-box">
          <h3>探索提示</h3>
          <p>{cityProfile.tips}</p>
        </section>
      )}
    </section>
  );
}
