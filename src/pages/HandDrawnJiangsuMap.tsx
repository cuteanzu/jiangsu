import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import HanddrawnTopNav from "../components/handdrawn/HanddrawnTopNav";
import JiangsuHanddrawnMap from "../components/handdrawn/JiangsuHanddrawnMap";
import CityIllustrationMap from "../components/handdrawn/CityIllustrationMap";
import UniversityListPanel from "../components/handdrawn/UniversityListPanel";
import { useHandDrawnProjection } from "../components/handdrawn/useHandDrawnProjection";
import "../components/handdrawn/handdrawn.css";
import { UNIVERSITIES, type University } from "../data/jiangsu-universities";
import { getCityMeta } from "../data/city-profiles";
import { normalizeCityParam } from "../utils/jiangsuPresentation";

const DEFAULT_OVERVIEW_CITY = "南京";

export default function HandDrawnJiangsuMap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCity = searchParams.get("city") ?? null;
  const urlSchoolId = searchParams.get("school") ?? null;

  const restoredSchool = useMemo(() => {
    if (!urlSchoolId) return null;
    return UNIVERSITIES.find((u) => u.id === urlSchoolId) ?? null;
  }, [urlSchoolId]);

  const selectedName = normalizeCityParam(urlCity) ?? restoredSchool?.city ?? null;
  const selectedUniversity = restoredSchool ?? null;
  const isDetail = Boolean(selectedName);
  const proj = useHandDrawnProjection();

  const [searchText, setSearchText] = useState("");
  const [overviewCity, setOverviewCity] = useState(restoredSchool?.city ?? DEFAULT_OVERVIEW_CITY);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [hoveredUniversity, setHoveredUniversity] = useState<University | null>(null);
  const [selectedPreviewCity, setSelectedPreviewCity] = useState<string | null>(null);

  const schoolCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    UNIVERSITIES.forEach((u) => {
      counts[u.city] = (counts[u.city] ?? 0) + 1;
    });
    return counts;
  }, []);

  const keyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    UNIVERSITIES.forEach((u) => {
      if (u.tier === "provincial") return;
      counts[u.city] = (counts[u.city] ?? 0) + 1;
    });
    return counts;
  }, []);

  const provinceCityCount = useMemo(
    () => new Set(UNIVERSITIES.map((u) => u.city)).size,
    [],
  );

  const provinceKeyCount = useMemo(
    () => UNIVERSITIES.filter((u) => u.tier !== "provincial").length,
    [],
  );

  const provinceTotalCount = UNIVERSITIES.length;

  const hoveredMeta = useMemo(() => {
    if (!hoveredCity) return null;
    return getCityMeta(hoveredCity);
  }, [hoveredCity]);

  const previewMeta = useMemo(() => {
    if (!selectedPreviewCity) return null;
    return getCityMeta(selectedPreviewCity);
  }, [selectedPreviewCity]);

  const displayCityName = hoveredCity ?? selectedPreviewCity ?? null;
  const displayMeta = hoveredCity ? hoveredMeta : previewMeta;
  const displaySchoolCount = displayCityName ? (schoolCounts[displayCityName] ?? 0) : 0;

  const selectedCityPath = useMemo(() => {
    if (!proj || !selectedName) return null;
    return proj.cityPaths.find((c) => c.name === selectedName) ?? null;
  }, [proj, selectedName]);

  const cityUniversities = useMemo(
    () => UNIVERSITIES.filter((u) => u.city === selectedName),
    [selectedName],
  );
  const cityMeta = useMemo(() => getCityMeta(selectedName), [selectedName]);

  const safeImpressions: string[] = cityMeta?.impressionTags ?? [];
  const safeSuitable: string[] = cityMeta?.suitableFor ?? [];
  const safeExploreTip: string = cityMeta?.exploreTip ?? "";

  const updateParams = useCallback((
    city: string | null,
    school: University | null = null,
  ) => {
    const params = new URLSearchParams();
    params.set("mode", "handdrawn");
    const nextCity = city ?? school?.city ?? null;
    if (nextCity) params.set("city", nextCity);
    if (school) params.set("school", school.id);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleSearch = useCallback((event: FormEvent) => {
    event.preventDefault();
    const raw = searchText.trim();
    if (!raw) return;

    const school = UNIVERSITIES.find((u) =>
      u.name.includes(raw) ||
      u.shortName?.includes(raw) ||
      u.aliases?.some((a) => a.toLowerCase().includes(raw.toLowerCase())),
    );
    if (school) {
      if (isDetail) updateParams(school.city, school);
      else {
        setSelectedPreviewCity(school.city);
        setOverviewCity(school.city);
      }
      setHoveredCity(null);
      return;
    }

    const city = normalizeCityParam(raw) ?? UNIVERSITIES.find((u) => {
      const normalized = normalizeCityParam(u.city);
      return normalized && (raw.includes(normalized) || normalized.includes(raw));
    })?.city ?? null;

    if (city) {
      if (isDetail) updateParams(city, null);
      else {
        setSelectedPreviewCity(city);
        setOverviewCity(city);
      }
      setHoveredCity(null);
    }
  }, [isDetail, searchText, updateParams]);

  const handleSwitchMode = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("mode");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleOverviewCitySelect = useCallback((cityName: string) => {
    setSelectedPreviewCity(cityName);
    setHoveredCity(null);
  }, []);

  const handleEnterCity = useCallback(() => {
    if (!selectedPreviewCity) return;
    updateParams(selectedPreviewCity, null);
  }, [selectedPreviewCity, updateParams]);

  const handleSelectUniversity = useCallback((u: University) => {
    updateParams(selectedName, u);
  }, [selectedName, updateParams]);

  return (
    <div className={`handdrawn-page${isDetail ? " handdrawn-page--detail" : " handdrawn-page--overview"}`}>
      <HanddrawnTopNav />

      {/* ═══ Overview ═══ */}
      {!isDetail && (
        <>
          {/* Hero: page title + search */}
          <section className="hd-overview-hero">
            <div className="hd-hero-title">
              <h2>江苏高校地图</h2>
              <p>手绘地图探索江苏高校分布</p>
            </div>
            <form className="hd-search" onSubmit={handleSearch}>
              <Search size={17} />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索城市或高校，例如 南京 / 苏州大学"
              />
              <button className="hd-search-btn" type="submit">搜索</button>
            </form>
          </section>

          {/* Main canvas */}
          <main className="hd-overview-canvas">
            {/* Floating sticker */}
            <div className={`hd-floating-sticker${displayCityName ? " has-city" : ""}`}>
              {displayCityName ? (
                <>
                  <h2>{displayCityName}</h2>
                  {displayMeta?.identity && <p>{displayMeta.identity}</p>}
                  <div className="hd-sticker-stats">
                    <span>{displaySchoolCount} 所高校</span>
                    {displayMeta?.costLevel && <span>{displayMeta.costLevel}</span>}
                    {displayMeta?.transportLevel && <span>{displayMeta.transportLevel}</span>}
                  </div>
                </>
              ) : (
                <>
                  <h2>江苏高校地图</h2>
                  <p>手绘地图探索江苏高校分布</p>
                  <div className="hd-sticker-stats">
                    <span>{provinceTotalCount} 所本科高校</span>
                    <span>{provinceKeyCount} 所重点</span>
                    <span>{provinceCityCount} 个城市</span>
                  </div>
                </>
              )}
              {selectedPreviewCity && (
                <button className="hd-sticker-enter-btn" type="button" onClick={handleEnterCity}>
                  进入城市详情 →
                </button>
              )}
            </div>

            {/* Map */}
            {proj ? (
              <JiangsuHanddrawnMap
                proj={proj}
                activeCity={selectedPreviewCity ?? overviewCity}
                hoveredCity={hoveredCity}
                schoolCounts={schoolCounts}
                keyCounts={keyCounts}
                onHoverCity={setHoveredCity}
                onSelectCity={handleOverviewCitySelect}
              />
            ) : (
              <div className="hd-loading">正在加载手绘地图...</div>
            )}

            {/* Bottom chips */}
            <div className="hd-overview-chips">
              <span className="hd-overview-chip">
                <strong>{provinceTotalCount}</strong> 所本科高校
              </span>
              <span className="hd-overview-chip">
                <strong>{provinceKeyCount}</strong> 所重点高校
              </span>
              <span className="hd-overview-chip">
                覆盖 <strong>{provinceCityCount}</strong> 个城市
              </span>
              <span className="hd-overview-chip">
                手绘地图 · 水彩风格
              </span>
            </div>
          </main>
        </>
      )}

      {/* ═══ Detail ═══ */}
      {isDetail && selectedName && (
        <>
          {/* Toolbar: back + search + 3D toggle */}
          <div className="hd-detail-toolbar">
            <button className="hd-back-btn" type="button" onClick={() => updateParams(null, null)}>
              <ArrowLeft size={15} />
              返回全省总览
            </button>
            <form className="hd-search" onSubmit={handleSearch}>
              <Search size={17} />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索城市或高校，例如 南京 / 苏州大学"
              />
              <button className="hd-search-btn" type="submit">搜索</button>
            </form>
            <button className="hd-mode-toggle" type="button" onClick={handleSwitchMode}>
              3D 沙盘
            </button>
          </div>

          {/* Dual-column layout */}
          <main className="hd-detail-layout-new">
            <section className="hd-map-card-main">
              {/* City info zone */}
              <aside className="hd-city-info-zone">
                <span className="hd-panel-kicker">CITY DOSSIER</span>
                <div className="hd-city-name-block">
                  <h2>{selectedName}</h2>
                  {cityMeta.identity && (
                    <span className="hd-city-identity-tag">{cityMeta.identity}</span>
                  )}
                </div>

                <div className="hd-impression-chips">
                  <span className="hd-info-chip">{cityUniversities.length} 所高校</span>
                  <span className="hd-info-chip">{cityMeta.costLevel}</span>
                  <span className="hd-info-chip">{cityMeta.transportLevel}</span>
                  <span className="hd-info-chip">{cityMeta.rhythmLevel}</span>
                </div>

                {safeImpressions.length > 0 && (
                  <>
                    <p className="hd-section-label">城市印象</p>
                    <div className="hd-impression-chips">
                      {safeImpressions.map((imp) => (
                        <span key={imp}>{imp}</span>
                      ))}
                    </div>
                  </>
                )}

                {safeSuitable.length > 0 && (
                  <>
                    <p className="hd-section-label">适合人群</p>
                    <ul className="hd-suitable-list">
                      {safeSuitable.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {safeExploreTip && (
                  <p className="hd-explore-tip">{safeExploreTip}</p>
                )}
              </aside>

              {/* Map visual zone */}
              <div className="hd-map-visual-zone">
                <div className="hd-map-visual-header">
                  <h3>{selectedName}手绘地图</h3>
                  <span className="hd-map-count-badge">
                    {cityUniversities.length} 所高校
                  </span>
                </div>

                {selectedCityPath ? (
                  <CityIllustrationMap
                    city={selectedCityPath}
                    universities={cityUniversities}
                    selectedUniversity={selectedUniversity}
                    hoveredUniversity={hoveredUniversity}
                    meta={cityMeta}
                    onHoverUniversity={setHoveredUniversity}
                    onSelectUniversity={handleSelectUniversity}
                  />
                ) : (
                  <div className="hd-loading">正在加载城市地图...</div>
                )}

                <div className="hd-city-stats-row">
                  <span>面积：<strong>{cityMeta.area}</strong></span>
                  <span>常住人口：<strong>{cityMeta.population}</strong></span>
                  <span>高校数量：<strong>{cityUniversities.length} 所</strong></span>
                </div>

                <div className="hd-status-bar">
                  <span className="hd-status-dot" />
                  {selectedUniversity ? (
                    <>当前查看：<strong>{selectedUniversity.name}</strong></>
                  ) : (
                    "点击地图上的高校或右侧列表查看详情"
                  )}
                </div>
              </div>
            </section>

            <UniversityListPanel
              cityName={selectedName}
              universities={cityUniversities}
              selectedUniversity={selectedUniversity}
              hoveredUniversity={hoveredUniversity}
              meta={cityMeta}
              onHoverUniversity={setHoveredUniversity}
              onSelectUniversity={handleSelectUniversity}
              onSelectNearbyCity={(city) => updateParams(city, null)}
            />
          </main>
        </>
      )}
    </div>
  );
}
