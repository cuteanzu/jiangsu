import { useState, useCallback, useMemo, lazy, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Search, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import MapScene from "../components/map3d/MapScene";
import SchoolInfoCard from "../components/map3d/SchoolInfoCard";
import SchoolDetailOverlay from "../components/map3d/SchoolDetailOverlay";
import MapDrawer from "../components/map3d/MapDrawer";
import FloatingCityCard from "../components/map3d/FloatingCityCard";
import ProvinceOverviewChip from "../components/map3d/ProvinceOverviewChip";
import { UNIVERSITIES } from "../data/jiangsu-universities";
import type { Tier, University } from "../data/jiangsu-universities";
import { normalizeCityParam } from "../utils/jiangsuPresentation";
import { getCityProfile } from "../data/city-profiles";

const HandDrawnJiangsuMap = lazy(() => import("./HandDrawnJiangsuMap"));

type CockpitMode = "overview" | "city" | "route";

// ═══════════════════════  Styled components  ═══════════════════════

const Page = styled.div`
  position: relative; width: 100%; height: 100%; overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 35%, rgba(252,250,245,0.55) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 25%, rgba(245,225,220,0.13) 0%, transparent 40%),
    radial-gradient(ellipse at 25% 70%, rgba(225,235,245,0.10) 0%, transparent 35%),
    linear-gradient(160deg, #FCFAF5 0%, #F8F4F0 40%, #F2F0F5 100%);
  &::after {
    content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23n)"/%3E%3C/svg%3E");
    background-size: 256px 256px;
  }
`;

const MinimalSearch = styled.form`
  position: absolute; z-index: 14; top: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  padding: 0 8px 0 14px; min-height: 44px; width: min(420px, calc(100% - 160px));
  border: 1px solid rgba(160, 190, 210, 0.18); border-radius: 14px;
  background: rgba(255, 252, 247, 0.58);
  box-shadow: 0 8px 24px rgba(120, 150, 170, 0.06), inset 0 1px 0 rgba(255,255,255,0.6);
  backdrop-filter: blur(14px);
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  transition: background 0.2s ease, border-color 0.2s ease;
  &:focus-within {
    background: rgba(255, 252, 247, 0.82);
    border-color: rgba(160, 190, 210, 0.35);
  }
  svg { color: #8aa6ba; flex-shrink: 0; }
  input {
    border: 0; outline: 0; background: transparent; width: 100%;
    color: #3a2f28; font: inherit; font-size: 14px; font-weight: 700;
    &::placeholder { color: rgba(100, 120, 135, 0.45); }
  }
`;

const SearchBtn = styled.button`
  border: 0; border-radius: 10px; padding: 6px 16px; min-height: 32px;
  background: linear-gradient(135deg, #c8967e, #d4b896);
  color: #fffdf8; cursor: pointer; font-family: inherit;
  font-weight: 850; font-size: 13px; white-space: nowrap;
  box-shadow: 0 6px 16px rgba(180, 140, 120, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(180, 140, 120, 0.18); }
`;

const DrawerToggle = styled.button<{ $open: boolean }>`
  position: absolute; z-index: 15; left: ${(p) => (p.$open ? "320px" : "12px")}; top: 50%;
  transform: translateY(-50%);
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255, 252, 247, 0.78);
  border: 1px solid rgba(214, 175, 145, 0.22);
  box-shadow: 0 4px 16px rgba(158, 126, 104, 0.10);
  backdrop-filter: blur(14px);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: left 0.32s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.15s ease;
  color: #8b7d73;
  &:hover { background: rgba(255, 252, 247, 0.92); color: #5a4a3a; box-shadow: 0 6px 20px rgba(158, 126, 104, 0.16); }
  svg { width: 18px; height: 18px; }
  @media (max-width: 720px) { width: 34px; height: 34px; left: ${(p) => (p.$open ? "320px" : "8px")}; }
`;

const FloatingCardWrap = styled.div`
  position: absolute; z-index: 12; bottom: 32px; right: 32px;
  max-width: 312px; width: calc(100% - 64px);
  @media (max-width: 720px) { right: 16px; bottom: 16px; max-width: calc(100% - 32px); }
`;

// ═══════════════════════  Page Component  ═══════════════════════

export default function JiangsuMap3D() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Restore state from URL params ──
  const urlCity = searchParams.get("city") ?? null;
  const urlSchoolId = searchParams.get("school") ?? null;
  const urlView = searchParams.get("view") ?? null;
  const urlMode = searchParams.get("mode") ?? null;
  const currentSearch = searchParams.toString();

  const restoredSchool = useMemo(() => {
    if (!urlSchoolId) return null;
    const s = UNIVERSITIES.find((u) => u.id === urlSchoolId);
    return s ?? null;
  }, [urlSchoolId]);

  const selectedName = normalizeCityParam(urlCity) ?? restoredSchool?.city ?? null;
  const selectedSchoolName = restoredSchool?.name ?? null;

  // ── Lifted state ──
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [hoveredSchoolName, setHoveredSchoolName] = useState<string | null>(null);
  const [showAllPins, setShowAllPins] = useState(false);
  const [topSearch, setTopSearch] = useState("");
  const [drawerMode, setDrawerMode] = useState<CockpitMode>(() => selectedName ? "city" : "overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPinned, setDrawerPinned] = useState(false);

  const updateSelectionParams = useCallback((
    city: string | null,
    schoolName: string | null,
    view: "detail" | null = null,
    replace = true,
  ) => {
    const params = new URLSearchParams();
    const school = schoolName ? UNIVERSITIES.find((u) => u.name === schoolName) ?? null : null;
    const nextCity = city ?? school?.city ?? null;
    if (nextCity) params.set("city", nextCity);
    if (school) params.set("school", school.id);
    if (view === "detail" && school) params.set("view", "detail");
    if (params.toString() !== currentSearch) {
      setSearchParams(params, { replace });
    }
  }, [currentSearch, setSearchParams]);

  const handleHover = useCallback((name: string) => setHoveredName(name), []);
  const handleUnhover = useCallback(() => setHoveredName(null), []);
  const handleSelect = useCallback(
    (name: string) => {
      updateSelectionParams(selectedName === name ? null : name, null);
      setShowAllPins(false);
      if (selectedName === name) {
        setDrawerMode("overview");
      } else {
        setDrawerMode("city");
      }
    },
    [selectedName, updateSelectionParams],
  );

  const handleHoverSchool = useCallback((name: string | null) => setHoveredSchoolName(name), []);
  const handleSelectSchool = useCallback(
    (name: string | null) => {
      updateSelectionParams(selectedName, selectedSchoolName === name ? null : name);
    },
    [selectedName, selectedSchoolName, updateSelectionParams],
  );

  const handleViewDetail = useCallback(
    (school: University) => {
      updateSelectionParams(school.city, school.name, "detail", false);
    },
    [updateSelectionParams],
  );

  const handleTopSearch = useCallback((event: FormEvent) => {
    event.preventDefault();
    const raw = topSearch.trim();
    if (!raw) return;
    const school = UNIVERSITIES.find((u) => u.name.includes(raw) || raw.includes(u.name));
    if (school) {
      updateSelectionParams(school.city, school.name);
      setDrawerMode("city");
      setShowAllPins(false);
      return;
    }

    const city = UNIVERSITIES.find((u) => {
      const nc = normalizeCityParam(u.city);
      return nc && (raw.includes(nc) || nc.includes(raw));
    });
    if (city) {
      updateSelectionParams(city.city, null);
      setDrawerMode("city");
      setShowAllPins(false);
      return;
    }
  }, [topSearch, updateSelectionParams]);

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

  const provinceTierCounts = useMemo(() => {
    const counts: Record<Tier, number> = { "985": 0, "211": 0, "dual": 0, "provincial": 0 };
    UNIVERSITIES.forEach((u) => { counts[u.tier]++; });
    return counts;
  }, []);

  const hotCities = useMemo(
    () => UNIVERSITIES
      .reduce<{ name: string; count: number }[]>((acc, u) => {
        const existing = acc.find((c) => c.name === u.city);
        if (existing) existing.count++;
        else acc.push({ name: u.city, count: 1 });
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count),
    [],
  );

  const selectedCityProfile = useMemo(() => getCityProfile(selectedName), [selectedName]);

  const representativeSchools = useMemo(() => {
    const flagship = cityUniversities.filter((u) => u.tier !== "provincial");
    return (flagship.length > 0 ? flagship : cityUniversities).slice(0, 3);
  }, [cityUniversities]);

  const popularSchools = useMemo(
    () => UNIVERSITIES
      .filter((u) => u.tier === "985" || u.tier === "211" || u.tier === "dual")
      .slice(0, 6),
    [],
  );

  const isDetailView = urlView === "detail";
  const provinceKeyCount = provinceTierCounts["985"] + provinceTierCounts["211"] + provinceTierCounts.dual;

  const handleDrawerToggle = useCallback(() => {
    setDrawerPinned((p) => !p);
    setDrawerOpen((p) => !p);
  }, []);

  const handleBackToOverview = useCallback(() => {
    updateSelectionParams(null, null);
    setDrawerMode("overview");
  }, [updateSelectionParams]);

  // ── Mode switch: hand-drawn map ──
  if (urlMode === "handdrawn") {
    return <HandDrawnJiangsuMap />;
  }

  return (
    <Page>
      {/* Mode toggle */}
      <button
        onClick={() => {
          const params = new URLSearchParams(searchParams);
          params.set("mode", "handdrawn");
          setSearchParams(params);
        }}
        style={{
          position: "absolute", zIndex: 16, top: 26, right: 24,
          border: "1px solid rgba(200,170,150,0.18)", borderRadius: 10,
          background: "rgba(255,252,247,0.55)", padding: "6px 12px",
          cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700,
          color: "#8B7D73", backdropFilter: "blur(10px)",
        }}
      >
        手绘地图
      </button>

      {!isDetailView && (
        <>
          <MinimalSearch onSubmit={handleTopSearch}>
            <Search size={16} />
            <input
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              placeholder="搜索城市或高校，例如 南京 / 苏州大学"
            />
            <SearchBtn type="submit">搜索</SearchBtn>
          </MinimalSearch>

          <MapDrawer
            open={drawerOpen}
            pinned={drawerPinned}
            mode={drawerMode}
            selectedName={selectedName}
            selectedSchoolName={selectedSchoolName}
            hoveredName={hoveredName}
            cityUniversities={cityUniversities}
            hotCities={hotCities}
            popularSchools={popularSchools}
            selectedCityProfile={selectedCityProfile}
            onSetMode={setDrawerMode}
            onSetHoveredName={setHoveredName}
            onSetHoveredSchoolName={setHoveredSchoolName}
            onSelectSchool={handleSelectSchool}
            onUpdateSelection={updateSelectionParams}
            onBackToOverview={handleBackToOverview}
          />

          <DrawerToggle
            $open={drawerOpen}
            onMouseEnter={() => { if (!drawerPinned) setDrawerOpen(true); }}
            onMouseLeave={() => { if (!drawerPinned) setDrawerOpen(false); }}
            onClick={handleDrawerToggle}
            title={drawerOpen ? "收起面板" : "打开探索面板"}
          >
            {drawerOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </DrawerToggle>

          {selectedName && (
            <FloatingCardWrap>
              <FloatingCityCard
                selectedName={selectedName}
                selectedSchoolName={selectedSchoolName}
                selectedCityProfile={selectedCityProfile}
                cityUniversities={cityUniversities}
                tierCounts={tierCounts}
                representativeSchools={representativeSchools}
                onSelectSchool={handleSelectSchool}
                onSetHoveredSchoolName={setHoveredSchoolName}
                onViewDetail={handleViewDetail}
                onDismiss={() => {
                  updateSelectionParams(null, null);
                  setDrawerMode("overview");
                }}
              />
            </FloatingCardWrap>
          )}

          {!selectedName && !selectedSchoolName && (
            <ProvinceOverviewChip
              totalCities={13}
              totalUniversities={UNIVERSITIES.length}
              keyCount={provinceKeyCount}
              onClick={() => {
                setDrawerMode("overview");
                setDrawerPinned(true);
                setDrawerOpen(true);
              }}
            />
          )}
        </>
      )}

      <MapScene
        hoveredName={hoveredName}
        selectedName={selectedName}
        selectedSchoolName={selectedSchoolName}
        hoveredSchoolName={hoveredSchoolName}
        showAllPins={showAllPins}
        hideOverlays={isDetailView}
        onHover={handleHover}
        onUnhover={handleUnhover}
        onSelect={handleSelect}
        onHoverSchool={handleHoverSchool}
        onSelectSchool={handleSelectSchool}
      />

      {selectedSchoolName && !isDetailView && (
        <SchoolInfoCard
          schoolName={selectedSchoolName}
          onClose={() => updateSelectionParams(selectedName, null)}
          onViewDetail={handleViewDetail}
        />
      )}

      {isDetailView && selectedSchoolName && (
        <SchoolDetailOverlay
          schoolName={selectedSchoolName}
          onClose={() => {
            const params = new URLSearchParams();
            if (selectedName) params.set("city", selectedName);
            if (selectedSchoolName) {
              const s = UNIVERSITIES.find((u) => u.name === selectedSchoolName);
              if (s) params.set("school", s.id);
            }
            setSearchParams(params);
          }}
        />
      )}
    </Page>
  );
}
