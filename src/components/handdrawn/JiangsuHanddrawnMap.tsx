import type { MapProjection2D } from "./useHandDrawnProjection";

const FILL: Record<string, string> = {
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

const KEY_CITIES = new Set(["南京", "苏州", "徐州", "无锡"]);

interface JiangsuHanddrawnMapProps {
  proj: MapProjection2D;
  activeCity: string;
  hoveredCity: string | null;
  schoolCounts: Record<string, number>;
  keyCounts: Record<string, number>;
  onHoverCity: (city: string | null) => void;
  onSelectCity: (city: string) => void;
}

export default function JiangsuHanddrawnMap({
  proj,
  activeCity,
  hoveredCity,
  schoolCounts,
  keyCounts,
  onHoverCity,
  onSelectCity,
}: JiangsuHanddrawnMapProps) {
  return (
    <section className="hd-map-stage">
      <div className="hd-map-paper">
        <svg viewBox="0 0 1200 820" preserveAspectRatio="xMidYMid meet" aria-label="江苏高校手绘地图">
          <defs>
            <filter id="hd-overview-sketch" x="-4%" y="-4%" width="108%" height="108%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.5} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          <rect width="1200" height="760" fill="transparent" />
          <path className="hd-map-water hd-map-water--river" d="M124 562 C296 536 390 566 534 548 C690 530 815 548 1052 522" />
          <path className="hd-map-water hd-map-water--canal" d="M736 78 C768 196 721 282 759 388 C793 481 744 598 780 710" />
          <path className="hd-map-water hd-map-water--lake" d="M853 592 C930 544 1016 590 996 668 C966 754 820 742 802 650 C796 622 817 604 853 592Z" />

          {/* Decorative: clouds */}
          <g className="hd-map-decoration" opacity="0.18">
            <path className="hd-deco-cloud" d="M98 98 Q108 78 128 82 Q144 70 162 80 Q178 74 182 92 Q196 100 184 112 L98 112 Q82 108 98 98Z" />
            <path className="hd-deco-cloud" d="M980 128 Q992 108 1012 110 Q1028 98 1046 106 Q1062 100 1064 118 Q1078 124 1068 136 L980 136 Q962 132 980 128Z" />
            <path className="hd-deco-cloud" d="M280 160 Q290 146 306 150 Q318 138 332 146 Q346 140 348 156 Q360 162 352 172 L280 172 Q266 166 280 160Z" />
          </g>

          {/* Decorative: compass rose */}
          <g className="hd-map-decoration" transform="translate(104, 118)" opacity="0.28">
            <circle className="hd-deco-compass-ring" cx="0" cy="0" r="26" strokeWidth={1} />
            <circle className="hd-deco-compass-ring" cx="0" cy="0" r="22" strokeWidth={0.5} strokeDasharray="3 2" />
            <path className="hd-deco-compass-fill" d="M0 -20 L4 -4 L14 0 L4 4 L0 20 L-4 4 L-14 0 L-4 -4Z" />
            <path className="hd-deco-compass-line" d="M0 -20 L0 20 M-14 0 L14 0" strokeWidth={0.5} />
            <text className="hd-deco-stamp-text" x="0" y="-28" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="var(--serif)">北</text>
          </g>

          {/* Decorative: small hills */}
          <g className="hd-map-decoration" opacity="0.16">
            <path className="hd-deco-hill" d="M60 640 Q90 590 120 640Z" strokeWidth={1.5} />
            <path className="hd-deco-hill" d="M100 640 Q130 600 160 640Z" strokeWidth={1.2} />
            <path className="hd-deco-hill" d="M1080 638 Q1110 595 1138 638Z" strokeWidth={1.5} />
          </g>

          {/* Decorative: small trees */}
          <g className="hd-map-decoration" opacity="0.20">
            <g transform="translate(82, 618)">
              <line className="hd-deco-tree-trunk" x1="0" y1="0" x2="0" y2="16" strokeWidth={0.8} />
              <path className="hd-deco-tree-foliage" d="M-8 0 Q0 -9 8 0" strokeWidth={1.2} />
              <path className="hd-deco-tree-foliage" d="M-7 4 Q0 -4 7 4" strokeWidth={1.2} />
            </g>
            <g transform="translate(1106, 614)">
              <line className="hd-deco-tree-trunk" x1="0" y1="0" x2="0" y2="16" strokeWidth={0.8} />
              <path className="hd-deco-tree-foliage" d="M-8 0 Q0 -9 8 0" strokeWidth={1.2} />
              <path className="hd-deco-tree-foliage" d="M-7 4 Q0 -4 7 4" strokeWidth={1.2} />
            </g>
            <g transform="translate(1128, 624)">
              <line className="hd-deco-tree-trunk" x1="0" y1="0" x2="0" y2="13" strokeWidth={0.7} />
              <path className="hd-deco-tree-foliage" d="M-6 0 Q0 -7 6 0" strokeWidth={1} />
              <path className="hd-deco-tree-foliage" d="M-5 3 Q0 -3 5 3" strokeWidth={1} />
            </g>
          </g>

          {/* Decorative: postmark stamp */}
          <g className="hd-map-decoration" transform="translate(1050, 670)" opacity="0.22">
            <rect className="hd-deco-stamp" x="0" y="0" width="62" height="42" rx="4" strokeWidth={1.2} strokeDasharray="4 2" />
            <text className="hd-deco-stamp-text" x="31" y="18" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="var(--serif)">江苏</text>
            <text className="hd-deco-stamp-text" x="31" y="30" textAnchor="middle" fontSize="6" fontWeight="700" fontFamily="var(--sans)">HAND DRAWN</text>
            <circle className="hd-deco-stamp" cx="31" cy="8" r="5" strokeWidth={0.6} />
            <text className="hd-deco-stamp-text" x="31" y="10" textAnchor="middle" fontSize="5" fontWeight="900">邮</text>
          </g>

          {/* Decorative: journal dot grid */}
          <g opacity="0.06">
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 6 }, (_, col) => (
                <circle className="hd-deco-dot" key={`${row}-${col}`} cx={60 + col * 16} cy={700 + row * 10} r={0.8} />
              ))
            )}
          </g>

          <g transform="translate(575, 392) scale(2.22) translate(-600, -380)">
            {proj.cityPaths.map((city) => {
              const count = schoolCounts[city.name] ?? 0;
              const isActive = activeCity === city.name;
              const isHovered = hoveredCity === city.name;
              const lowCount = count <= 1 && !KEY_CITIES.has(city.name);
              const labelClass = KEY_CITIES.has(city.name)
                ? "hd-city-label hd-city-label--major"
                : lowCount
                  ? "hd-city-label hd-city-label--dot"
                  : "hd-city-label";

              return (
                <g
                  key={city.name}
                  className={`hd-overview-city${isActive ? " is-active" : ""}${isHovered ? " is-hovered" : ""}`}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => onHoverCity(city.name)}
                  onMouseLeave={() => onHoverCity(null)}
                  onClick={() => onSelectCity(city.name)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectCity(city.name);
                    }
                  }}
                >
                  <path
                    d={city.pathD}
                    fill={FILL[city.name] ?? "#E7D7C5"}
                    filter="url(#hd-overview-sketch)"
                  />
                  <path d={city.pathD} className="hd-city-outline" />
                  <g transform={`translate(${city.center.x}, ${city.center.y})`}>
                    <g className={labelClass}>
                      {lowCount && !isHovered && !isActive ? (
                        <circle r={6.5} />
                      ) : (
                        <>
                          <rect
                            x={KEY_CITIES.has(city.name) ? -46 : -34}
                            y={KEY_CITIES.has(city.name) ? -24 : -18}
                            width={KEY_CITIES.has(city.name) ? 92 : 68}
                            height={KEY_CITIES.has(city.name) ? 48 : 36}
                            rx={12}
                          />
                          <text y={KEY_CITIES.has(city.name) ? -5 : -3}>{city.name}</text>
                          <text y={KEY_CITIES.has(city.name) ? 13 : 12} className="hd-label-count">
                            {count} 所{KEY_CITIES.has(city.name) ? ` · 重点 ${keyCounts[city.name] ?? 0}` : ""}
                          </text>
                        </>
                      )}
                    </g>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}
