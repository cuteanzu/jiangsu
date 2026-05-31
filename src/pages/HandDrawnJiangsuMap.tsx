import { useState, useCallback, useMemo, useEffect, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import HandDrawnMap from "../components/handdrawn/HandDrawnMap";
import "../components/handdrawn/handdrawn.css";
import { UNIVERSITIES } from "../data/jiangsu-universities";
import type { Tier, University } from "../data/jiangsu-universities";
import { TIER_LABEL } from "../data/jiangsu-universities";
import { normalizeCityParam } from "../utils/jiangsuPresentation";
import { getCityProfile } from "../data/city-profiles";

// ── Helpers ──

const TIER_DOT_COLOR: Record<Tier, string> = {
  "985": "#C87A6A",
  "211": "#B0A0C0",
  "dual": "#78A0B8",
  "provincial": "#90A890",
};

const TIER_TAG_BG: Record<Tier, string> = {
  "985": "rgba(200,120,100,0.12)",
  "211": "rgba(160,140,180,0.12)",
  "dual": "rgba(100,140,170,0.11)",
  "provincial": "rgba(130,150,130,0.10)",
};

const TIER_TAG_COLOR: Record<Tier, string> = {
  "985": "#B06050",
  "211": "#8070A0",
  "dual": "#507090",
  "provincial": "#608060",
};

// ═══════════════════════════════════════════════

export default function HandDrawnJiangsuMap() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Restore state from URL ──
  const urlCity = searchParams.get("city") ?? null;
  const urlSchoolId = searchParams.get("school") ?? null;
  const urlView = searchParams.get("view") ?? null;

  const restoredSchool = useMemo(() => {
    if (!urlSchoolId) return null;
    return UNIVERSITIES.find((u) => u.id === urlSchoolId) ?? null;
  }, [urlSchoolId]);

  const selectedName = normalizeCityParam(urlCity) ?? restoredSchool?.city ?? null;
  const selectedSchoolName = restoredSchool?.name ?? null;
  const isDetailView = urlView === "detail";

  // ── State ──
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [hoveredSchool, setHoveredSchool] = useState<string | null>(null);
  const [showAllPins, setShowAllPins] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [panelVisible, setPanelVisible] = useState(isDetailView);
  const [isExiting, setIsExiting] = useState(false);

  // Delay info panel 250ms after stage animation starts
  useEffect(() => {
    if (selectedName && !isDetailView) {
      setPanelVisible(false);
      const timer = setTimeout(() => setPanelVisible(true), 250);
      return () => clearTimeout(timer);
    } else if (isDetailView && selectedSchoolName) {
      setPanelVisible(false);
      const timer = setTimeout(() => setPanelVisible(true), 250);
      return () => clearTimeout(timer);
    } else {
      setPanelVisible(false);
    }
  }, [selectedName, isDetailView, selectedSchoolName]);

  const currentSearch = searchParams.toString();

  // ── URL helpers ──
  const updateParams = useCallback((
    city: string | null,
    schoolName: string | null,
    view: "detail" | null = null,
  ) => {
    const params = new URLSearchParams();
    params.set("mode", "handdrawn"); // preserve mode
    const school = schoolName ? UNIVERSITIES.find((u) => u.name === schoolName) ?? null : null;
    const nextCity = city ?? school?.city ?? null;
    if (nextCity) params.set("city", nextCity);
    if (school) params.set("school", school.id);
    if (view === "detail" && school) params.set("view", "detail");
    if (params.toString() !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [currentSearch, setSearchParams]);

  // ── Exit animation flow ──
  const handleBackToOverview = useCallback(() => {
    if (!selectedName) return;
    setIsExiting(true);
    setTimeout(() => {
      updateParams(null, null);
      setIsExiting(false);
      setPanelVisible(false);
    }, 420);
  }, [selectedName, updateParams]);

  // ── Handlers ──
  const handleHoverCity = useCallback((name: string | null) => setHoveredCity(name), []);
  const handleSelectCity = useCallback((name: string | null) => {
    updateParams(name, null);
  }, [updateParams]);

  const handleHoverSchool = useCallback((name: string | null) => setHoveredSchool(name), []);
  const handleSelectSchool = useCallback((name: string | null) => {
    updateParams(selectedName, selectedSchoolName === name ? null : name);
  }, [selectedName, selectedSchoolName, updateParams]);

  const handleViewDetail = useCallback((school: University) => {
    updateParams(school.city, school.name, "detail");
  }, [updateParams]);

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    const raw = searchText.trim();
    if (!raw) return;

    // Search school first
    const school = UNIVERSITIES.find((u) =>
      u.name.includes(raw) || raw.includes(u.name),
    );
    if (school) {
      updateParams(school.city, school.name);
      return;
    }

    // Search city
    const city = UNIVERSITIES.find((u) => {
      const nc = normalizeCityParam(u.city);
      return nc && (raw.includes(nc) || nc.includes(raw));
    });
    if (city) {
      updateParams(city.city, null);
      return;
    }
  }, [searchText, updateParams]);

  // ── Derived data ──
  const cityUniversities = useMemo(
    () => UNIVERSITIES.filter((u) => u.city === selectedName),
    [selectedName],
  );

  const tierCounts = useMemo(() => {
    const counts: Record<Tier, number> = { "985": 0, "211": 0, "dual": 0, "provincial": 0 };
    cityUniversities.forEach((u) => { counts[u.tier]++; });
    return counts;
  }, [cityUniversities]);

  const cityProfile = useMemo(() => getCityProfile(selectedName), [selectedName]);

  const schoolCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    UNIVERSITIES.forEach((u) => {
      counts[u.city] = (counts[u.city] || 0) + 1;
    });
    return counts;
  }, []);

  const provinceKeyCount = useMemo(() => {
    let n = 0;
    UNIVERSITIES.forEach((u) => { if (u.tier !== "provincial") n++; });
    return n;
  }, []);

  const detailSchool = useMemo(() => {
    if (!isDetailView || !selectedSchoolName) return null;
    return UNIVERSITIES.find((u) => u.name === selectedSchoolName) ?? null;
  }, [isDetailView, selectedSchoolName]);

  // ═══════════════ Render ═══════════════

  return (
    <div className="hd-page">
      {/* Mode toggle — back to 3D */}
      <button
        className="hd-mode-toggle"
        onClick={() => {
          const params = new URLSearchParams(searchParams);
          params.delete("mode");
          setSearchParams(params);
        }}
      >
        3D 沙盘
      </button>

      {/* Search bar */}
      <form className="hd-search" onSubmit={handleSearch}>
        <Search size={16} />
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索城市或高校，例如 南京 / 苏州大学"
        />
        <button className="hd-search-btn" type="submit">搜索</button>
      </form>

      {/* Back button */}
      {selectedName && (
        <button className="hd-back-btn" onClick={handleBackToOverview}>
          <ArrowLeft size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
          返回全省总览
        </button>
      )}

      {/* Province overview hint card */}
      {!selectedName && (
        <div className="hd-overview-card">
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 4, paddingBottom: 8,
            borderBottom: "1px dashed rgba(200,170,150,0.22)",
          }}>
            <h3 style={{ margin: 0 }}>江苏高校探索</h3>
            <span style={{
              fontSize: 8, fontWeight: 600, color: "#B0A090",
              fontFamily: '"Noto Serif SC",serif', letterSpacing: "0.4px",
            }}>
              手绘地图
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#8b7d73", marginBottom: 10, letterSpacing: "0.2px" }}>
            {(() => {
              const citySet = UNIVERSITIES.reduce((s, u) => { if (!s.includes(u.city)) s.push(u.city); return s; }, [] as string[]);
              return `${citySet.length} 市 · ${UNIVERSITIES.length} 所本科 · ${provinceKeyCount} 所重点`;
            })()}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#2A1810", marginBottom: 6,
            letterSpacing: "0.6px", fontFamily: '"Noto Serif SC",serif',
          }}>
            推荐探索
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {["南京", "苏州", "无锡", "徐州"].map((city) => {
              const c = schoolCounts[city];
              return (
                <button key={city}
                  onClick={() => handleSelectCity(city)}
                  onMouseEnter={() => setHoveredCity(city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  style={{
                    border: "1px solid rgba(200,170,150,0.20)", borderRadius: 8,
                    background: "rgba(255,252,248,0.55)", padding: "5px 12px",
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: 11, fontWeight: 700, color: "#5A4A3A",
                    transition: "all 0.15s ease",
                    display: "flex", alignItems: "center", gap: 3,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(200,160,130,0.12)";
                    e.currentTarget.style.borderColor = "rgba(200,160,130,0.30)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255,252,248,0.55)";
                    e.currentTarget.style.borderColor = "rgba(200,170,150,0.20)";
                  }}
                >
                  {city}{c && <span style={{ fontSize: 9, fontWeight: 500, color: "#B0A090", marginLeft: 2 }}>{c}所</span>}
                  <span style={{ fontSize: 9, color: "#C8B8A8", marginLeft: 1 }}>→</span>
                </button>
              );
            })}
          </div>
          <div style={{
            paddingTop: 8, borderTop: "1px dashed rgba(200,170,150,0.14)",
            textAlign: "center",
          }}>
            <span style={{
              fontSize: 10, color: "#B0A090", fontWeight: 600,
              fontFamily: '"Noto Serif SC",serif', letterSpacing: "0.3px",
            }}>
              点击城市查看高校分布
            </span>
          </div>
        </div>
      )}

      {/* Map area */}
      <div className="hd-map-wrap">
        <HandDrawnMap
          selectedCity={selectedName}
          hoveredCity={hoveredCity}
          selectedSchool={selectedSchoolName}
          hoveredSchool={hoveredSchool}
          showAllPins={showAllPins}
          cityUniversities={cityUniversities}
          schoolCounts={schoolCounts}
          cityProfile={cityProfile}
          isExiting={isExiting}
          onHoverCity={handleHoverCity}
          onSelectCity={handleSelectCity}
          onHoverSchool={handleHoverSchool}
          onSelectSchool={handleSelectSchool}
          onViewDetail={handleViewDetail}
        />
      </div>

      {/* City info panel — journal page style */}
      {panelVisible && selectedName && !isDetailView && (
        <div className={`hd-info-panel${isExiting ? " hd-info-panel--exit" : ""}`}>
          {/* Decorative header — handwritten journal feel */}
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 4, paddingBottom: 8,
            borderBottom: "1px dashed rgba(200,170,150,0.22)",
          }}>
            <h3 style={{ margin: 0 }}>{selectedName}</h3>
            <span style={{
              fontSize: 9, fontWeight: 600, color: "#B0A090",
              fontFamily: '"Noto Serif SC",serif', letterSpacing: "0.5px",
            }}>
              手账笔记
            </span>
          </div>

          <div className="hd-subtitle" style={{ borderBottom: "none", marginBottom: 10, paddingBottom: 0 }}>
            {cityProfile?.cost && `${cityProfile.cost} · `}
            {cityProfile?.transit && `${cityProfile.transit} · `}
            {cityProfile?.jobs && cityProfile.jobs}
          </div>

          {/* Tier summary — sticker badges */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {tierCounts["985"] > 0 && (
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, fontWeight: 700, background: TIER_TAG_BG["985"], color: TIER_TAG_COLOR["985"], border: "1px solid rgba(200,120,100,0.12)", boxShadow: "0 1px 2px rgba(180,140,120,0.06)" }}>
                985 × {tierCounts["985"]}
              </span>
            )}
            {tierCounts["211"] > 0 && (
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, fontWeight: 700, background: TIER_TAG_BG["211"], color: TIER_TAG_COLOR["211"], border: "1px solid rgba(160,140,180,0.12)", boxShadow: "0 1px 2px rgba(180,140,120,0.06)" }}>
                211 × {tierCounts["211"]}
              </span>
            )}
            {tierCounts.dual > 0 && (
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, fontWeight: 700, background: TIER_TAG_BG["dual"], color: TIER_TAG_COLOR["dual"], border: "1px solid rgba(100,140,170,0.12)", boxShadow: "0 1px 2px rgba(180,140,120,0.06)" }}>
                双一流 × {tierCounts.dual}
              </span>
            )}
            {tierCounts.provincial > 0 && (
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, fontWeight: 700, background: TIER_TAG_BG["provincial"], color: TIER_TAG_COLOR["provincial"], border: "1px solid rgba(130,150,130,0.12)", boxShadow: "0 1px 2px rgba(180,140,120,0.06)" }}>
                本科 × {tierCounts.provincial}
              </span>
            )}
          </div>

          {/* School list — journal entry style */}
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#2A1810", marginBottom: 8,
            letterSpacing: "0.8px", fontFamily: '"Noto Serif SC",serif',
          }}>
            驻地高校
            <span style={{ fontSize: 9, fontWeight: 500, color: "#B0A090", marginLeft: 5 }}>
              {cityUniversities.length} 所
            </span>
          </div>
          {cityUniversities.map((u, i) => (
            <div
              key={u.id}
              className="hd-school-item"
              style={{ animationDelay: `${Math.min(0.22 + i * 0.035, 0.50)}s` }}
              onMouseEnter={() => setHoveredSchool(u.name)}
              onMouseLeave={() => setHoveredSchool(null)}
              onClick={() => handleViewDetail(u)}
            >
              <span className="hd-tier-dot" style={{ background: TIER_DOT_COLOR[u.tier] }} />
              <span className="hd-school-name">{u.name}</span>
              <span className="hd-tier-tag" style={{
                background: TIER_TAG_BG[u.tier],
                color: TIER_TAG_COLOR[u.tier],
              }}>
                {TIER_LABEL[u.tier]}
              </span>
            </div>
          ))}

          <div style={{
            marginTop: 14, paddingTop: 10,
            borderTop: "1px dashed rgba(200,170,150,0.18)",
          }}>
            <label style={{ fontSize: 10, color: "#8b7d73", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontWeight: 600 }}>
              <input type="checkbox" checked={showAllPins} onChange={(e) => setShowAllPins(e.target.checked)}
                style={{ accentColor: "#B09070" }} />
              显示全部高校点位
            </label>
          </div>
        </div>
      )}

      {/* School detail overlay — journal spread */}
      {panelVisible && isDetailView && detailSchool && (
        <div className="hd-info-panel hd-detail-panel" style={{ top: 100, transform: "none", maxHeight: "calc(100vh - 140px)" }}>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("mode", "handdrawn");
              if (selectedName) params.set("city", selectedName);
              const s = UNIVERSITIES.find((u) => u.name === selectedSchoolName);
              if (s) params.set("school", s.id);
              setSearchParams(params);
            }}
            style={{
              border: "1px solid rgba(200,170,150,0.18)", borderRadius: 8,
              background: "rgba(255,252,247,0.55)",
              padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700,
              color: "#6B5D50", marginBottom: 14, fontFamily: "inherit",
              boxShadow: "0 1px 3px rgba(180,150,130,0.05)",
            }}
          >
            ← 返回城市
          </button>

          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 4, paddingBottom: 8,
            borderBottom: "1px dashed rgba(200,170,150,0.22)",
          }}>
            <h3 style={{ margin: 0 }}>{detailSchool.name}</h3>
            <span style={{
              fontSize: 9, fontWeight: 600, color: "#B0A090",
              fontFamily: '"Noto Serif SC",serif', letterSpacing: "0.5px",
            }}>
              院校档案
            </span>
          </div>
          <div className="hd-subtitle" style={{ borderBottom: "none", marginBottom: 8, paddingBottom: 0 }}>
            {detailSchool.city} · {TIER_LABEL[detailSchool.tier]}
            {detailSchool.founded && ` · ${detailSchool.founded}年建校`}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#2A1810", marginBottom: 5,
              letterSpacing: "0.8px", fontFamily: '"Noto Serif SC",serif',
            }}>
              学校概况
            </div>
            <p style={{ fontSize: 11, color: "#5a4a3a", lineHeight: 1.9, letterSpacing: "0.2px" }}>
              {detailSchool.name}坐落于{detailSchool.city}，是江苏省高校版图中的重要坐标。
              {detailSchool.tier === "985" && "作为985工程重点建设高校，综合实力与研究气质突出。"}
              {detailSchool.tier === "211" && "作为211工程重点建设高校，学科底蕴清晰，专业传统深厚。"}
              {detailSchool.tier === "dual" && "作为双一流建设高校，特色学科辨识度很高。"}
              {detailSchool.tier === "provincial" && "与地方产业、师范教育、应用创新联系紧密。"}
            </p>
          </div>

          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: "1px dashed rgba(200,170,150,0.18)",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#2A1810", marginBottom: 5,
              letterSpacing: "0.8px", fontFamily: '"Noto Serif SC",serif',
            }}>
              城市环境
            </div>
            <p style={{ fontSize: 11, color: "#5a4a3a", lineHeight: 1.9, letterSpacing: "0.2px" }}>
              {cityProfile?.cost && `生活成本适中。`}
              {cityProfile?.transit && `交通便利。`}
              {cityProfile?.jobs && `就业机会丰富。`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
