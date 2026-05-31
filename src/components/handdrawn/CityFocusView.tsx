import { useMemo, useState, useEffect, useRef } from "react";
import type { University } from "../../data/jiangsu-universities";
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
    <g opacity={0.38} fill="none" stroke="#9BB8A0" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Reeds */}
      <g transform="translate(15, 40)">
        <path d="M0,0 Q2,-18 4,-35 M3,-10 Q6,-22 8,-32 M6,-5 Q10,-16 11,-28" strokeWidth={0.7} />
        <path d="M14,0 Q16,-14 18,-28 M17,-8 Q20,-18 21,-26" strokeWidth={0.7} />
      </g>
      {/* Water bird */}
      <g transform="translate(55, 20)">
        <path d="M0,6 Q4,0 10,2 Q14,4 16,2" strokeWidth={1} />
        <path d="M8,2 Q10,-4 14,-6" strokeWidth={0.8} />
        <path d="M10,3 Q12,8 14,10" strokeWidth={0.6} />
      </g>
      {/* Coastline wave */}
      <path d="M10,60 Q20,56 30,60 Q40,64 50,60 Q60,56 70,60" strokeWidth={0.8} opacity={0.5} />
    </g>
  );
}

function NanjingDecoration() {
  return (
    <g opacity={0.40} fill="none" stroke="#B58B64" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* City wall */}
      <path d="M10,50 L10,20 L50,20 L50,50" strokeWidth={1.3} />
      <path d="M18,20 L18,28 M28,20 L28,28 M38,20 L38,28 M44,20 L44,28" strokeWidth={0.7} />
      {/* Gate */}
      <path d="M25,50 L25,36 Q30,28 35,36 L35,50" fill="#B58B64" fillOpacity={0.08} strokeWidth={1} />
      {/* Parasol tree */}
      <g transform="translate(58, 52)">
        <line x1={0} y1={0} x2={0} y2={-16} strokeWidth={1.2} />
        <path d="M-8,-10 Q0,-20 8,-14" strokeWidth={0.9} />
        <path d="M-6,-8 Q0,-18 6,-12" strokeWidth={0.8} />
      </g>
    </g>
  );
}

function SuzhouDecoration() {
  return (
    <g opacity={0.40} fill="none" stroke="#8BA88E" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Garden bridge */}
      <path d="M8,50 Q20,30 32,50" strokeWidth={1.2} />
      <path d="M12,46 Q20,36 28,46" strokeWidth={0.7} />
      {/* Eaves */}
      <path d="M48,22 Q52,12 60,14" strokeWidth={1.2} />
      <path d="M60,14 L60,24" strokeWidth={0.9} />
      <path d="M48,22 Q50,28 60,28" strokeWidth={0.7} fill="#8BA88E" fillOpacity={0.04} />
      {/* Small tree */}
      <g transform="translate(62, 52)">
        <line x1={0} y1={0} x2={0} y2={-10} strokeWidth={1} />
        <path d="M-5,-6 Q0,-14 5,-6" strokeWidth={0.7} />
      </g>
    </g>
  );
}

function WuxiDecoration() {
  return (
    <g opacity={0.40} fill="none" stroke="#8AA8B8" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Water waves */}
      <path d="M8,48 Q16,44 24,48 Q32,52 40,48 Q48,44 56,48 Q64,52 72,48" strokeWidth={0.9} />
      <path d="M12,54 Q20,50 28,54 Q36,58 44,54 Q52,50 60,54 Q68,58 76,54" strokeWidth={0.6} opacity={0.6} />
      {/* Small boat */}
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
    <g opacity={0.38} fill="none" stroke="#B89868" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Hills */}
      <path d="M0,52 Q8,28 16,44 Q24,18 32,40 Q40,22 48,44 Q56,32 64,50" strokeWidth={1.1} fill="#B89868" fillOpacity={0.05} />
      {/* Historical building outline */}
      <g transform="translate(50, 22)">
        <rect x={0} y={6} width={14} height={12} strokeWidth={1} />
        <path d="M-1,6 L7,-4 L15,6" strokeWidth={0.9} />
        <line x1={7} y1={-4} x2={7} y2={0} strokeWidth={0.6} />
        <line x1={3} y1={18} x2={10} y2={22} strokeWidth={0.5} opacity={0.5} />
      </g>
    </g>
  );
}

function ChangzhouDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#9B8AB8" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Pagoda */}
      <g transform="translate(28, 20)">
        <rect x={0} y={8} width={10} height={24} strokeWidth={1} />
        <path d="M-1,8 L5,-4 L11,8" strokeWidth={0.9} />
        <line x1={5} y1={-4} x2={5} y2={4} strokeWidth={0.5} />
        <line x1={0} y1={16} x2={10} y2={16} strokeWidth={0.5} opacity={0.5} />
        <line x1={0} y1={22} x2={10} y2={22} strokeWidth={0.5} opacity={0.5} />
      </g>
      {/* Dino silhouette */}
      <g transform="translate(52, 48)">
        <path d="M0,4 Q4,-4 10,-2 Q14,0 16,-6 Q20,0 22,4 Q20,8 16,6 Q12,10 6,8 Q2,10 0,4" strokeWidth={0.8} fill="#9B8AB8" fillOpacity={0.04} />
      </g>
    </g>
  );
}

function ZhenjiangDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#B89868" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Mountains by water */}
      <path d="M0,44 Q10,20 20,38 Q30,14 40,34 Q50,18 60,38 Q70,22 80,42" strokeWidth={1.1} fill="#B89868" fillOpacity={0.05} />
      {/* Temple on hill */}
      <g transform="translate(26, 22)">
        <rect x={0} y={4} width={10} height={8} strokeWidth={0.9} />
        <path d="M-1,4 L5,-3 L11,4" strokeWidth={0.8} />
      </g>
      {/* River waves */}
      <path d="M6,56 Q16,52 26,56 Q36,60 46,56 Q56,52 66,56" strokeWidth={0.7} opacity={0.5} />
    </g>
  );
}

function NantongDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#8AA8A0" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Lighthouse */}
      <g transform="translate(44, 14)">
        <rect x={3} y={8} width={8} height={18} strokeWidth={1} />
        <path d="M0,8 L7,0 L14,8" strokeWidth={0.9} />
        <line x1={5} y1={18} x2={9} y2={18} strokeWidth={0.5} />
        <circle cx={7} cy={4} r={3} strokeWidth={0.7} fill="#8AA8A0" fillOpacity={0.06} />
      </g>
      {/* Sea waves */}
      <path d="M4,54 Q14,50 24,54 Q34,58 44,54 Q54,50 64,54 Q74,58 80,54" strokeWidth={0.8} opacity={0.5} />
      <path d="M8,60 Q18,56 28,60 Q38,64 48,60 Q58,56 68,60" strokeWidth={0.6} opacity={0.35} />
    </g>
  );
}

function YangzhouDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#8BA88E" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Five Pavilion Bridge */}
      <path d="M10,40 Q14,22 24,30 Q34,20 44,28 Q54,18 62,30 Q70,22 72,40" strokeWidth={1.1} />
      <path d="M10,40 L72,40" strokeWidth={0.7} />
      {/* Pavilion roofs */}
      <path d="M18,30 L22,18 L26,30" strokeWidth={0.8} />
      <path d="M34,28 L38,16 L42,28" strokeWidth={0.8} />
      <path d="M54,28 L58,18 L62,28" strokeWidth={0.8} />
      {/* Willow */}
      <g transform="translate(62, 48)">
        <line x1={0} y1={0} x2={0} y2={-10} strokeWidth={0.8} />
        <path d="M0,-8 Q-4,-14 -6,-8" strokeWidth={0.6} />
        <path d="M0,-6 Q-5,-12 -7,-6" strokeWidth={0.6} />
      </g>
    </g>
  );
}

function HuaianDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#A89868" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Canal gate */}
      <g transform="translate(24, 20)">
        <rect x={0} y={0} width={14} height={18} strokeWidth={1.1} />
        <line x1={7} y1={0} x2={7} y2={18} strokeWidth={0.7} />
        <path d="M0,8 Q7,4 14,8" strokeWidth={0.8} />
      </g>
      {/* Water channels */}
      <path d="M10,44 Q20,40 30,44 Q40,48 48,44" strokeWidth={0.8} opacity={0.5} />
      <path d="M54,44 Q64,40 74,44" strokeWidth={0.8} opacity={0.5} />
      {/* Small bridge */}
      <path d="M34,44 Q40,34 48,44" strokeWidth={0.9} />
      <line x1={34} y1={44} x2={48} y2={44} strokeWidth={0.5} />
    </g>
  );
}

function SuqianDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#8A9E7A" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Lake */}
      <path d="M8,40 Q20,30 36,36 Q50,30 64,38 Q72,34 78,40" strokeWidth={0.9} fill="#8A9E7A" fillOpacity={0.04} />
      {/* Reeds */}
      <g transform="translate(14, 38)">
        <path d="M0,0 Q2,-12 3,-22 M2,-6 Q5,-14 6,-18" strokeWidth={0.7} />
        <path d="M6,0 Q8,-10 9,-18" strokeWidth={0.7} />
      </g>
      {/* Pavilion */}
      <g transform="translate(48, 24)">
        <line x1={4} y1={16} x2={4} y2={6} strokeWidth={1} />
        <path d="M-2,6 L4,-2 L10,6" strokeWidth={0.9} />
        <line x1={-2} y1={6} x2={10} y2={6} strokeWidth={0.5} />
      </g>
      {/* Water bird */}
      <path d="M58,38 Q62,32 66,34 Q68,35 70,34" strokeWidth={0.7} />
    </g>
  );
}

function TaizhouDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#C09888" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Tower */}
      <g transform="translate(28, 14)">
        <rect x={0} y={8} width={12} height={18} strokeWidth={1} />
        <path d="M-1,8 L6,-4 L13,8" strokeWidth={0.9} />
        <line x1={2} y1={14} x2={10} y2={14} strokeWidth={0.5} opacity={0.5} />
        <line x1={2} y1={20} x2={10} y2={20} strokeWidth={0.5} opacity={0.5} />
      </g>
      {/* Garden wall */}
      <path d="M8,50 L8,34 Q48,30 72,36 L72,50" strokeWidth={0.8} opacity={0.5} />
      <path d="M14,34 L14,42 M22,33 L22,40 M30,32 L30,38" strokeWidth={0.5} opacity={0.4} />
    </g>
  );
}

function LianyungangDecoration() {
  return (
    <g opacity={0.38} fill="none" stroke="#7A8EAE" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
      {/* Mountain peaks */}
      <path d="M0,46 Q8,18 18,34 Q26,10 36,30 Q44,8 54,28 Q62,14 70,34 Q76,22 80,42" strokeWidth={1} fill="#7A8EAE" fillOpacity={0.04} />
      {/* Port crane silhouette */}
      <g transform="translate(58, 24)">
        <line x1={4} y1={20} x2={4} y2={2} strokeWidth={1.2} />
        <line x1={0} y1={2} x2={12} y2={2} strokeWidth={0.8} />
        <line x1={12} y1={2} x2={12} y2={8} strokeWidth={0.6} />
        <line x1={4} y1={6} x2={8} y2={6} strokeWidth={0.5} />
      </g>
      {/* Waves */}
      <path d="M4,54 Q14,50 24,54 Q34,58 44,54 Q54,50 64,54" strokeWidth={0.7} opacity={0.45} />
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
  cityProfile?: { cost?: string; transit?: string; jobs?: string; tags?: string[]; audience?: string };
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

  // Build a balanced viewBox — prevent extreme aspect ratios
  const mapVB = useMemo(() => {
    const ar = bbox.width / bbox.height;
    let vbW: number, vbH: number;
    if (ar < 0.7) {
      // Tall/narrow city — widen the viewBox
      vbW = bbox.height * 0.9;
      vbH = bbox.height * 1.15;
    } else if (ar > 1.5) {
      // Wide/flat city — heighten the viewBox
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

  // Build subtitle
  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (count !== undefined) parts.push(`${count} 所高校`);
    parts.push("本科城市");
    if (cityProfile?.cost) parts.push(cityProfile.cost);
    if (cityProfile?.transit) parts.push(cityProfile.transit);
    return parts.join(" · ");
  }, [count, cityProfile]);

  // Map draw animation phase: idle → drawing → complete
  type MapPhase = "idle" | "drawing" | "complete";
  const [mapPhase, setMapPhase] = useState<MapPhase>("idle");
  const prevVisibleRef = useRef(visible);
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setMapPhase("drawing");
      const t1 = setTimeout(() => setMapPhase("complete"), 550);
      return () => clearTimeout(t1);
    }
    if (!visible) {
      setMapPhase("idle");
    }
    prevVisibleRef.current = visible;
  }, [visible]);

  const isDrawing = mapPhase === "drawing";
  const isMapReady = mapPhase === "complete";

  return (
    <div
      className={`city-focus-view${visible ? " city-focus-view--enter" : ""}`}
      style={{
        position: "absolute",
        zIndex: 11,
        left: "clamp(12px, 3vw, 32px)",
        top: "50%",
        transform: "translateY(-50%)",
        width: "clamp(380px, 60vw, 580px)",
        maxHeight: "calc(100vh - 140px)",
        overflowY: "auto",
        pointerEvents: visible ? "auto" : "none",
        background: "linear-gradient(175deg, #FFFCF7 0%, #FFFAF2 45%, #FEF8F0 100%)",
        border: "1px solid rgba(200, 170, 150, 0.22)",
        borderRadius: 14,
        boxShadow: "0 2px 8px rgba(180,150,130,0.06), 0 8px 32px rgba(160,130,110,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        padding: "22px 24px 18px",
      }}
    >
      {/* Subtle paper line texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 14, opacity: 0.025,
        background: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(180,160,140,0.35) 18px, rgba(180,160,140,0.35) 19px)",
      }} />

      {/* ═══ Header ═══ */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
          <h3 style={{
            fontFamily: '"Noto Serif SC","Songti SC",serif',
            fontSize: 22, fontWeight: 900, color: "#2A1810",
            margin: 0, letterSpacing: "0.5px",
          }}>
            {city.name}
          </h3>
          <span style={{
            fontSize: 8, fontWeight: 600, color: "#B0A090",
            fontFamily: '"Noto Serif SC",serif', letterSpacing: "0.4px",
          }}>
            城市手账
          </span>
        </div>
        <p style={{
          fontSize: 11, color: "#8B7D73", margin: "2px 0 14px",
          paddingBottom: 12, borderBottom: "1px dashed rgba(200,170,150,0.20)",
          letterSpacing: "0.2px",
        }}>
          {subtitle}
        </p>
      </div>

      {/* ═══ City map — constrained, centered ═══ */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", justifyContent: "center",
        marginBottom: 10,
      }}>
        <div style={{
          width: "100%", maxWidth: 380, height: "clamp(240px, 32vw, 380px)",
          position: "relative", overflow: "hidden",
        }}>
          <svg
            viewBox={mapVB}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%", overflow: "visible", position: "relative", zIndex: 1 }}
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

            {/* Textured fill — fades in after boundary draws */}
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

            {/* City label on map — subtle watermark */}
            <g style={{ pointerEvents: "none" }}>
              <text x={city.center.x} y={city.center.y - bbox.height * 0.04}
                textAnchor="middle"
                fontFamily='"Noto Serif SC","Songti SC",serif'
                fontSize={bbox.width * 0.058} fontWeight={700} fill="#8B7D73"
                opacity={0.40}>
                {city.name}
              </text>
            </g>

            {/* School pins — staggered pop-in */}
            {pins.map((u, i) => {
              const idx = cityUniversities.indexOf(u);
              const angle = (idx / Math.max(cityUniversities.length, 1)) * Math.PI * 2 - Math.PI / 2;
              const radius = bbox.width * 0.14 + (idx % 3) * bbox.width * 0.055;
              const sx = city.center.x + Math.cos(angle) * radius;
              const sy = city.center.y + Math.sin(angle) * radius;
              const isSel = selectedSchool === u.name;
              const isHov = hoveredSchool === u.name;
              const dotColor = isSel ? PIN_ACTIVE : PIN_COLOR;
              const dotR = isSel ? bbox.width * 0.026 : isHov ? bbox.width * 0.033 : bbox.width * 0.020;
              const staggerDelay = 0.22 + i * 0.045;
              const pinScale = isMapReady ? 1 : 0.4;
              const pinOpacity = isMapReady ? 1 : 0;

              return (
                <g key={`cv-pin-${u.id}`}
                  transform={`translate(${sx}, ${sy})`}
                  opacity={pinOpacity}
                  style={{ transition: `opacity 0.25s ease ${staggerDelay}s` }}>
                  {/* Scale wrapper */}
                  <g className="hd-pin-scaling"
                     style={{
                       transform: `scale(${pinScale})`,
                       transition: `transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay}s`,
                     }}>
                    {/* Pulse ring for selected pin */}
                    {isSel && isMapReady && (
                      <circle cx={0} cy={0} r={dotR * 1.5} fill="none"
                        stroke={PIN_ACTIVE} strokeWidth={bbox.width * 0.005}
                        opacity={0}
                        style={{ animation: "hdPulseRing 1.8s ease-out 2 forwards" }} />
                    )}
                    <circle cx={0} cy={0} r={dotR + bbox.width * 0.012} fill="none"
                      stroke={dotColor} strokeWidth={bbox.width * 0.006}
                      opacity={isSel ? 0.42 : isHov ? 0.35 : 0.20} />
                    <circle cx={0} cy={0} r={dotR} fill={dotColor}
                      opacity={isSel ? 0.92 : 0.68} />
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

          {/* City-specific decoration — subtle corner vignette */}
          {Decoration && (
            <div style={{
              position: "absolute", bottom: 2, right: 2,
              width: 56, height: 56, zIndex: 0, pointerEvents: "none",
              opacity: 0.75,
            }}>
              <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}
                xmlns="http://www.w3.org/2000/svg">
                <Decoration />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* ═══ City info modules ═══ */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* City impression */}
        {cityProfile?.tags && cityProfile.tags.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#2A1810", marginBottom: 5,
              letterSpacing: "0.6px", fontFamily: '"Noto Serif SC",serif',
            }}>
              城市印象
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {cityProfile.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 5,
                  background: "rgba(180,160,140,0.08)",
                  color: "#6B5D50", fontWeight: 600,
                  border: "1px solid rgba(180,160,140,0.12)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suitable for */}
        {cityProfile?.audience && (
          <div style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#2A1810", marginBottom: 4,
              letterSpacing: "0.6px", fontFamily: '"Noto Serif SC",serif',
            }}>
              适合人群
            </div>
            <p style={{
              fontSize: 10.5, color: "#8B7D73", lineHeight: 1.7,
              margin: 0, letterSpacing: "0.2px",
            }}>
              {cityProfile.audience}
            </p>
          </div>
        )}

        {/* Exploration tip */}
        <div style={{
          marginBottom: 10, paddingTop: 8,
          borderTop: "1px dashed rgba(200,170,150,0.15)",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "#2A1810", marginBottom: 4,
            letterSpacing: "0.6px", fontFamily: '"Noto Serif SC",serif',
          }}>
            探索提示
          </div>
          <p style={{
            fontSize: 10.5, color: "#8B7D73", lineHeight: 1.7,
            margin: 0, letterSpacing: "0.2px",
          }}>
            {cityUniversities.length > 0
              ? `点击学校点位查看详情，右侧列表可浏览全部${cityUniversities.length}所驻地高校。`
              : "该城市暂无收录高校信息。"}
          </p>
        </div>
      </div>

      {/* ═══ Selected school indicator ═══ */}
      {selectedSchool && (
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px", marginBottom: 8,
          background: "rgba(200,140,110,0.08)",
          border: "1px solid rgba(200,140,110,0.16)",
          borderRadius: 10,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#D4845A", flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: "#8B7D73", fontWeight: 600 }}>
            当前查看：
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#4A3828",
            fontFamily: '"Noto Serif SC",serif',
          }}>
            {selectedSchool}
          </span>
        </div>
      )}

    </div>
  );
}
