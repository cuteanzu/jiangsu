import type { MapProjection2D } from "./useHandDrawnProjection";

// ═══ Watercolor palette ═══
const FILL: Record<string, string> = {
  "南京": "#F4C7B8", "苏州": "#BFDCC8", "无锡": "#BBD9E8",
  "徐州": "#EAD9A6", "常州": "#D9C9E8", "扬州": "#D5E5B8",
  "镇江": "#F0D0AE", "南通": "#BFE1DA", "盐城": "#EFE0B8",
  "淮安": "#DCC9A8", "宿迁": "#CCDDBE", "泰州": "#E8C4CC",
  "连云港": "#C9D6EC",
};

const HOVER_FILL: Record<string, string> = {
  "南京": "#F8D8CC", "苏州": "#D0E8D8", "无锡": "#CCE6F0",
  "徐州": "#F0E4B8", "常州": "#E6D8F0", "扬州": "#E2EDCC",
  "镇江": "#F6DCC0", "南通": "#D0ECE8", "盐城": "#F4E8C8",
  "淮安": "#E8D8B8", "宿迁": "#D8E8CC", "泰州": "#F0D4D8",
  "连云港": "#D8E2F2",
};

const STROKE = "#8D6B48";
const WATER_STROKE = "#9DCCD6";

const LABEL_ROTATE: Record<string, number> = {
  "南京": -1.5, "苏州": 1.2, "无锡": -0.8, "徐州": 1.8,
  "常州": -2.0, "扬州": 0.5, "镇江": -1.0, "南通": 1.5,
  "盐城": -0.5, "淮安": 2.0, "宿迁": -1.8, "泰州": 0.8,
  "连云港": -1.2,
};

const DEFAULT_VISIBLE_LABELS = new Set(["南京", "苏州", "无锡", "徐州"]);

const VB = "0 0 1200 760";

// ═══ City illustrations ═══

function NanjingIllustration({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx - 22}, ${cy - 38})`} opacity={0.55} stroke="#B58B64" fill="none" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-12,16 L-12,6 L12,6 L12,16" />
      <path d="M-8,10 L-8,12 M-4,10 L-4,12 M0,10 L0,12 M4,10 L4,12 M8,10 L8,12" strokeWidth={0.8} />
      <path d="M-3,6 L-3,0 L3,0 L3,6" />
      <path d="M18,2 L24,-4 L30,2" fill="#B58B64" fillOpacity={0.15} />
      <path d="M18,2 L24,6 L30,2" fill="#B58B64" fillOpacity={0.1} />
      <line x1={24} y1={-4} x2={24} y2={6} />
    </g>
  );
}

function SuzhouIllustration({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx + 14}, ${cy - 28})`} opacity={0.55} stroke="#B58B64" fill="none" strokeWidth={1.2} strokeLinecap="round">
      <path d="M-14,10 Q-7,-2 0,4 Q7,-2 14,10" />
      <path d="M-14,10 L14,10" strokeWidth={0.7} />
      <path d="M-18,-4 Q-12,-12 -6,-4 L-2,-4 Q4,-12 10,-4" />
      <line x1={-18} y1={-4} x2={10} y2={-4} strokeWidth={0.8} />
      <line x1={-8} y1={-4} x2={-8} y2={4} strokeWidth={0.9} />
      <line x1={0} y1={-4} x2={0} y2={4} strokeWidth={0.9} />
    </g>
  );
}

function WuxiIllustration({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx + 10}, ${cy - 35})`} opacity={0.55} stroke="#B58B64" fill="none" strokeWidth={1.2} strokeLinecap="round">
      <path d="M-16,8 Q-8,14 10,14 Q18,14 20,8" fill="#B58B64" fillOpacity={0.1} />
      <path d="M-12,8 Q-4,12 8,12 Q14,12 16,8" strokeWidth={0.7} />
      <path d="M2,8 L2,-8 L12,-2" fill="#B58B64" fillOpacity={0.08} />
      <line x1={2} y1={8} x2={2} y2={-8} strokeWidth={0.9} />
      <path d="M-20,16 Q-10,14 0,16 Q10,18 22,16" strokeWidth={0.7} opacity={0.5} />
    </g>
  );
}

function YangzhouIllustration({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx - 24}, ${cy - 28})`} opacity={0.55} stroke="#B58B64" fill="none" strokeWidth={1.1} strokeLinecap="round">
      <line x1={0} y1={12} x2={0} y2={-2} strokeWidth={1.4} />
      <path d="M0,-2 Q-8,2 -10,10" strokeWidth={0.8} />
      <path d="M0,-2 Q-5,0 -6,8" strokeWidth={0.7} />
      <path d="M0,-2 Q4,2 5,11" strokeWidth={0.8} />
      <path d="M0,-2 Q8,0 9,8" strokeWidth={0.7} />
      <path d="M0,-2 Q-3,4 -3,12" strokeWidth={0.8} />
      <path d="M0,-2 Q2,3 2,10" strokeWidth={0.7} />
    </g>
  );
}

function XuzhouIllustration({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx - 20}, ${cy - 38})`} opacity={0.55} stroke="#B58B64" fill="none" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-16,14 Q-12,0 -6,8 Q0,-2 6,8 Q12,0 16,14" fill="#B58B64" fillOpacity={0.08} />
      <path d="M-10,14 Q-6,4 0,10 Q6,2 10,14" fill="#B58B64" fillOpacity={0.06} />
      <line x1={-18} y1={14} x2={18} y2={14} strokeWidth={0.7} />
      <line x1={-4} y1={14} x2={-4} y2={6} strokeWidth={1} />
      <path d="M-8,8 Q-4,2 0,8 Q4,2 8,8" strokeWidth={0.9} />
    </g>
  );
}

const CITY_ILLUSTRATION: Record<string, React.FC<{ cx: number; cy: number }>> = {
  "南京": NanjingIllustration, "苏州": SuzhouIllustration, "无锡": WuxiIllustration,
  "扬州": YangzhouIllustration, "徐州": XuzhouIllustration,
};

// ═══════════════════════════════════════════════

export interface HandDrawnMapProps {
  proj: MapProjection2D;
  selectedCity: string | null;
  hoveredCity: string | null;
  schoolCounts?: Record<string, number>;
  debug?: boolean;
  onHoverCity: (name: string | null) => void;
  onSelectCity: (name: string | null) => void;
}

export default function HandDrawnMap({
  proj, selectedCity, hoveredCity,
  schoolCounts, debug = false,
  onHoverCity, onSelectCity,
}: HandDrawnMapProps) {

  const pathCount = proj.cityPaths.length;
  const pathsWithData = proj.cityPaths.filter((c) => c.pathD && c.pathD.length > 10);
  const missingPaths = proj.cityPaths.filter((c) => !c.pathD || c.pathD.length <= 10);

  const isFocused = selectedCity !== null;

  // ═══ ERROR STATES ═══
  if (pathCount !== 13) {
    return (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", color: "#8B0000",
        fontFamily: "monospace", fontSize: 14, padding: 40, gap: 8,
      }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>数据错误</div>
        <div>期望 13 个城市，实际获取到 {pathCount} 个</div>
      </div>
    );
  }

  if (missingPaths.length > 0) {
    return (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", color: "#8B0000",
        fontFamily: "monospace", fontSize: 14, padding: 40, gap: 8,
      }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>路径数据错误</div>
        <div>以下城市缺少有效的 SVG path d：</div>
        <div style={{ color: "#666" }}>{missingPaths.map((c) => `"${c.name}"`).join(", ")}</div>
      </div>
    );
  }

  // ═══════════════════ RENDER ═══════════════════

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {debug && (
        <div style={{
          position: "absolute", zIndex: 999, bottom: 12, left: 12,
          background: "rgba(0,0,0,0.72)", color: "#0f0",
          fontFamily: "monospace", fontSize: 11, padding: "8px 12px",
          borderRadius: 6, lineHeight: 1.6, pointerEvents: "none", userSelect: "none",
        }}>
          <div>cityPaths count: {pathCount}</div>
          <div>rendered paths: {pathsWithData.length}</div>
          <div>selected city: {selectedCity ?? "(none)"}</div>
          <div>focused: {isFocused ? "yes" : "no"}</div>
        </div>
      )}

      <svg
        viewBox={VB}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", background: "#FCF9F4", cursor: "default" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="hd-sketch" x="-3%" y="-3%" width="106%" height="106%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="hd-water" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.5} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="sticker-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx={0.5} dy={1.2} stdDeviation={2} floodColor="#B8A090" floodOpacity={0.20} />
          </filter>
          <filter id="hd-texture" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.06 0" in="noise" result="coloredNoise" />
            <feComposite in="coloredNoise" in2="SourceGraphic" operator="in" result="masked" />
            <feBlend in="masked" in2="SourceGraphic" mode="multiply" />
          </filter>
          <filter id="hd-bloom" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation={2.5} result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="out" result="bloomOnly" />
          </filter>
        </defs>

        <rect x={0} y={0} width={1200} height={760} fill="#FCF9F4" />
        <rect x={0} y={0} width={1200} height={760} fill="#F2EDE4" opacity={0.15} style={{ pointerEvents: "none" }} />

        {/* ═══ Main map group — dims when focused ═══ */}
        <g
          transform="translate(560, 410) scale(1.62) translate(-600, -380)"
          opacity={isFocused ? 0.06 : 1}
          style={{ transition: "opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {/* Province silhouette */}
          {proj.provinceOutline && (
            <g style={{ pointerEvents: "none" }}>
              <path d={proj.provinceOutline} fill="#F0E8D8" stroke="none" opacity={0.55} />
              <path d={proj.provinceOutline} fill="none" stroke="#C8B090"
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.40} strokeDasharray="10 5" filter="url(#hd-sketch)" />
              <path d={proj.provinceOutline} fill="none" stroke="#D4C0A0"
                strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.22} filter="url(#hd-sketch)" />
            </g>
          )}

          {/* City regions — all rendered normally, dimmed by parent group */}
          {pathsWithData.map((city) => {
            const isSelected = selectedCity === city.name;
            const isHovered = hoveredCity === city.name;
            const baseFill = isSelected || isHovered
              ? (HOVER_FILL[city.name] || FILL[city.name] || "#E0D8CC")
              : (FILL[city.name] || "#DCD4C8");

            return (
              <g key={`city-${city.name}`}>
                {/* Watercolor bloom — only when not focused */}
                {isSelected && !isFocused && (
                  <>
                    <path d={city.pathD} fill="none" stroke={baseFill}
                      strokeWidth={26} strokeLinecap="round" strokeLinejoin="round"
                      opacity={0.06} filter="url(#hd-bloom)"
                      style={{ pointerEvents: "none" }} />
                    <path d={city.pathD} fill="none" stroke={baseFill}
                      strokeWidth={16} strokeLinecap="round" strokeLinejoin="round"
                      opacity={0.10} filter="url(#hd-bloom)"
                      style={{ pointerEvents: "none" }} />
                    <path d={city.pathD} fill="none" stroke={baseFill}
                      strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
                      opacity={0.14} filter="url(#hd-sketch)"
                      style={{ pointerEvents: "none" }} />
                  </>
                )}
                <path d={city.pathD} fill={baseFill} stroke="none"
                  fillOpacity={0.42}
                  filter="url(#hd-texture)"
                  style={{ pointerEvents: "none" }} />
                <path d={city.pathD} fill="none"
                  stroke={STROKE} strokeWidth={1.1}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={0.45}
                  filter="url(#hd-sketch)"
                  style={{ pointerEvents: "none" }} />
                <path d={city.pathD} fill="none"
                  stroke={STROKE} strokeWidth={0.5}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={0.20}
                  filter="url(#hd-sketch)"
                  style={{ pointerEvents: "none" }} />
                {/* Hit area — only active in overview */}
                {!isFocused && (
                  <path d={city.pathD}
                    fill="transparent" stroke="transparent" strokeWidth={16}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => onHoverCity(city.name)}
                    onMouseLeave={() => onHoverCity(null)}
                    onClick={() => {
                      if (selectedCity === city.name) {
                        onSelectCity(null);
                      } else {
                        onSelectCity(city.name);
                      }
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Water features */}
          <g style={{ pointerEvents: "none" }} opacity={isFocused ? 0.35 : 0.45}>
            {proj.waterPaths.filter((w) => w.name === "长江").map((w) => (
              <g key={w.name}>
                <path d={w.pathD} fill="none" stroke={WATER_STROKE}
                  strokeWidth={16} strokeLinecap="round" opacity={0.22} filter="url(#hd-water)" />
                <path d={w.pathD} fill="none" stroke={WATER_STROKE}
                  strokeWidth={10} strokeLinecap="round" opacity={0.35} filter="url(#hd-water)" />
                <path d={w.pathD} fill="none" stroke="#D8EEF6"
                  strokeWidth={4} strokeLinecap="round" opacity={0.32} />
              </g>
            ))}
            {proj.waterPaths.filter((w) => w.name === "太湖").map((w) => (
              <g key={w.name}>
                <path d={w.pathD} fill="#C8DEE8" fillOpacity={0.20} stroke={WATER_STROKE}
                  strokeWidth={1.5} strokeLinecap="round" opacity={0.40} filter="url(#hd-water)" />
              </g>
            ))}
            {proj.waterPaths.filter((w) => w.name === "洪泽湖").map((w) => (
              <g key={w.name}>
                <path d={w.pathD} fill="#C8DEE8" fillOpacity={0.18} stroke={WATER_STROKE}
                  strokeWidth={1.2} strokeLinecap="round" opacity={0.35} filter="url(#hd-water)" />
              </g>
            ))}
            {proj.waterPaths.filter((w) => w.name === "大运河").map((w) => (
              <g key={w.name}>
                <path d={w.pathD} fill="none" stroke={WATER_STROKE}
                  strokeWidth={3} strokeLinecap="round" opacity={0.32}
                  strokeDasharray="8 5" filter="url(#hd-water)" />
                <path d={w.pathD} fill="none" stroke="#D8EEF6"
                  strokeWidth={1.2} strokeLinecap="round" opacity={0.28} />
              </g>
            ))}
          </g>

          {/* City illustrations — hidden when focused */}
          {!isFocused && pathsWithData.map((city) => {
            const Illo = CITY_ILLUSTRATION[city.name];
            if (!Illo) return null;
            const isHovered = hoveredCity === city.name;
            return (
              <g key={`illo-${city.name}`}
                opacity={isHovered ? 0.72 : 0.50}
                style={{ pointerEvents: "none" }}>
                <Illo cx={city.center.x} cy={city.center.y} />
              </g>
            );
          })}

          {/* City labels — hidden when focused */}
          {!isFocused && pathsWithData.map((city) => {
            const isSelected = selectedCity === city.name;
            const isHovered = hoveredCity === city.name;
            const isOverview = selectedCity === null;

            const otherDefaults = [...DEFAULT_VISIBLE_LABELS]
              .filter((n) => n !== selectedCity && n !== "南京")
              .slice(0, 2);
            const isOtherRef = otherDefaults.includes(city.name);

            let visible: boolean;
            let isReference: boolean;
            if (isOverview) {
              visible = DEFAULT_VISIBLE_LABELS.has(city.name) || isHovered;
              isReference = false;
            } else {
              if (isSelected) {
                visible = true; isReference = false;
              } else if (city.name === "南京" || isOtherRef) {
                visible = true; isReference = true;
              } else {
                visible = isHovered; isReference = true;
              }
            }

            const rot = LABEL_ROTATE[city.name] || 0;
            const count = schoolCounts?.[city.name];
            const hasCount = count !== undefined;
            const isProtagonist = isSelected && !isOverview;
            const labelW = isProtagonist ? 76 : hasCount ? 64 : 52;
            const labelH = isProtagonist ? 38 : hasCount ? 32 : 22;
            const fontSize = isProtagonist ? 13 : isReference ? 9.5 : 10;
            const fontWeight = isProtagonist ? 900 : isReference ? 600 : 700;
            const fontColor = isReference && !isHovered ? "#7B6D60" : "#4A3828";
            const bgAlpha = isProtagonist ? "0.96" : isReference ? "0.78" : "0.82";
            const strokeAlpha = isProtagonist ? "0.48" : isReference ? "0.18" : "0.22";
            const strokeW = isProtagonist ? 1.3 : 0.7;
            const cx = city.center.x;
            const cy = city.center.y;

            const labelHovered = isHovered && !isFocused;
            return (
              <g key={`label-${city.name}`}
                opacity={visible ? 1 : 0}
                style={{ pointerEvents: "none", transition: "opacity 0.25s ease" }}
                transform={`rotate(${rot}, ${cx}, ${cy})`}>
                <g className="hd-city-label-group"
                   style={{ transform: labelHovered ? 'translateY(-2px)' : 'translateY(0)' }}>
                  <rect x={cx - labelW / 2} y={cy - labelH / 2}
                    width={labelW} height={labelH} rx={7}
                    fill={`rgba(255,252,248,${bgAlpha})`}
                    stroke={`rgba(165,130,100,${strokeAlpha})`}
                    strokeWidth={strokeW}
                    filter="url(#sticker-shadow)" />
                  <text x={cx} y={hasCount ? cy - 5 : cy}
                    textAnchor="middle" dominantBaseline="central"
                    fontFamily='"Noto Serif SC","Songti SC","KaiTi",serif'
                    fontSize={fontSize} fontWeight={fontWeight} fill={fontColor}>
                    {city.name}
                  </text>
                  {hasCount && (
                    <text x={cx} y={cy + 10}
                      textAnchor="middle" dominantBaseline="central"
                      fontFamily='"Noto Sans SC","PingFang SC",sans-serif'
                      fontSize={isProtagonist ? 9 : 8}
                      fontWeight={isProtagonist ? 700 : 600}
                      fill={isReference && !isHovered ? "#9B8D80" : "#8B7D73"}>
                      {count} 所高校
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>

    </div>
  );
}
