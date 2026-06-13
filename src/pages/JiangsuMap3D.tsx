import { Suspense, useCallback, useMemo, useState, lazy, type FormEvent } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Search, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import SchoolInfoCard from "../components/map3d/SchoolInfoCard";
import SchoolDetailOverlay from "../components/map3d/SchoolDetailOverlay";
import MapDrawer from "../components/map3d/MapDrawer";
import CityDetailPage from "../components/map3d/CityDetailPage";
import ProvinceOverviewChip from "../components/map3d/ProvinceOverviewChip";
import MapDataPanel from "../components/map3d/MapDataPanel";
import {
  isTierOnePlusUniversity,
} from "../data/jiangsu-universities";
import type { Tier, University } from "../data/jiangsu-universities";
import { useMapInsightsData, useUniversitiesData } from "../services/universities";
import { normalizeCityParam } from "../utils/jiangsuPresentation";
import { getCityProfile } from "../data/city-profiles";
import {
  getAdjacentCity,
  getCityAtlasImage,
  getCityFromRouteParam,
  getCityRouteSlug,
} from "../data/city-atlas";

const MapScene = lazy(() => import("../components/map3d/MapScene"));
// const HandDrawnJiangsuMap = lazy(() => import("./HandDrawnJiangsuMap"));

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

const MinimalSearch = styled.form<{ $drawerOpen: boolean }>`
  position: absolute;
  z-index: 14;
  top: 24px;
  left: ${(p) => p.$drawerOpen ? "calc(320px + (100% - 320px) / 2)" : "50%"};
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  padding: 0 8px 0 14px;
  min-height: 44px;
  width: ${(p) => p.$drawerOpen ? "min(420px, calc(100% - 520px))" : "min(420px, calc(100% - 160px))"};
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

  @media (max-width: 900px) {
    left: 64px;
    right: 16px;
    transform: none;
    width: auto;
  }

  @media (max-width: 640px) {
    top: 12px;
    left: 12px;
    right: 12px;
    min-height: 42px;
    width: auto;
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

  @media (max-width: 420px) {
    padding: 6px 10px;
  }
`;

const SuggestionDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: rgba(255, 252, 247, 0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(160, 190, 210, 0.2);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(120, 150, 170, 0.12);
  overflow: hidden;
  z-index: 20;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const SuggestionItem = styled.button<{ $hovered: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: ${(p) => (p.$hovered ? "rgba(200, 150, 120, 0.08)" : "transparent")};
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 14px;
  color: #3a2f28;
  transition: background 0.15s ease;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(180, 150, 130, 0.08);
  }
`;

const SuggestionName = styled.span`
  font-weight: 700;
`;

const SuggestionCity = styled.span`
  font-size: 12px;
  color: #8b7d73;
  margin-left: auto;
`;

const DrawerToggle = styled.button<{ $open: boolean }>`
  position: absolute; z-index: 15; left: ${(p) => (p.$open ? "min(320px, calc(100vw - 52px))" : "12px")}; top: 50%;
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
  @media (max-width: 720px) {
    width: 36px;
    height: 36px;
    left: ${(p) => (p.$open ? "min(320px, calc(100vw - 48px))" : "8px")};
  }
`;

const SceneFallback = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 36%, rgba(252, 250, 245, 0.72), transparent 58%),
    linear-gradient(160deg, #fcfaf5 0%, #f8f4f0 46%, #f2f0f5 100%);
  color: #8b7d73;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 14px;
  font-weight: 800;

  span {
    padding: 10px 14px;
    border: 1px solid rgba(200, 170, 150, 0.18);
    border-radius: 12px;
    background: rgba(255, 252, 247, 0.7);
    box-shadow: 0 12px 34px rgba(158, 126, 104, 0.08);
  }
`;

const CityTransitionStatus = styled.div`
  position: absolute;
  z-index: 13;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(181, 148, 117, 0.22);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.72);
  box-shadow: 0 14px 40px rgba(109, 83, 61, 0.10);
  color: #7d5539;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 900;
  pointer-events: none;
  backdrop-filter: blur(18px);

  strong {
    color: #2b1a12;
    font-family: "Noto Serif SC", "Songti SC", serif;
    font-size: 22px;
    line-height: 1;
  }
`;

function shouldOpenPanelByDefault() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 960px)").matches;
}

// ═══════════════════════  Page Component  ═══════════════════════

export default function JiangsuMap3D() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { citySlug } = useParams<{ citySlug?: string }>();
  const { universities } = useUniversitiesData();
  const {
    schools: backendSchools,
    hotSchools: backendHotSchools,
    cityProfiles: backendCityProfiles,
    loading: backendInsightsLoading,
    error: backendInsightsError,
  } = useMapInsightsData();
  const tierOnePlusUniversities = useMemo(
    () => universities.filter(isTierOnePlusUniversity),
    [universities],
  );

  // ── Restore state from URL params ──
  const urlCity = searchParams.get("city") ?? null;
  const urlSchoolId = searchParams.get("school") ?? null;
  const urlView = searchParams.get("view") ?? null;
  const routeCity = useMemo(() => getCityFromRouteParam(citySlug), [citySlug]);
  const routeBase = location.pathname.startsWith("/map") ? "/map" : "/jiangsu";
  const isCityDetailRoute = routeCity !== null;

  const restoredSchool = useMemo(() => {
    if (!urlSchoolId) return null;
    const s = universities.find((u) => u.id === urlSchoolId);
    return s ?? null;
  }, [urlSchoolId, universities]);

  const selectedName = routeCity ?? normalizeCityParam(urlCity) ?? restoredSchool?.city ?? null;
  const selectedSchoolName = restoredSchool?.name ?? null;
  const selectedSchoolRecord = useMemo(
    () => (selectedSchoolName ? backendSchools.find((school) => school.name === selectedSchoolName) ?? null : null),
    [backendSchools, selectedSchoolName],
  );

  // ── Lifted state ──
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [hoveredSchoolName, setHoveredSchoolName] = useState<string | null>(null);
  const [showAllPins, setShowAllPins] = useState(false);
  const [topSearch, setTopSearch] = useState("");
  const [drawerMode, setDrawerMode] = useState<CockpitMode>(() => selectedName ? "city" : "overview");
  const [drawerOpen, setDrawerOpen] = useState(() => shouldOpenPanelByDefault());
  const [drawerPinned, setDrawerPinned] = useState(() => shouldOpenPanelByDefault());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredSuggestionIdx, setHoveredSuggestionIdx] = useState(-1);
  const [settledCity, setSettledCity] = useState<string | null>(null);

  const updateSelectionParams = useCallback((
    city: string | null,
    schoolName: string | null,
    view: "detail" | null = null,
    replace = true,
    asCityRoute = false,
  ) => {
    const params = new URLSearchParams();
    const school = schoolName ? universities.find((u) => u.name === schoolName) ?? null : null;
    const nextCity = normalizeCityParam(city ?? school?.city ?? null);
    if (nextCity && !asCityRoute) params.set("city", nextCity);
    if (school) params.set("school", school.id);
    if (view === "detail" && school) params.set("view", "detail");
    const pathname = nextCity && asCityRoute ? `${routeBase}/${getCityRouteSlug(nextCity)}` : routeBase;
    const search = params.toString();
    const nextUrl = `${pathname}${search ? `?${search}` : ""}`;
    const currentUrl = `${location.pathname}${location.search}`;
    if (nextUrl !== currentUrl) {
      navigate({ pathname, search: search ? `?${search}` : "" }, { replace });
    }
  }, [location.pathname, location.search, navigate, routeBase, universities]);

  const handleHover = useCallback((name: string) => setHoveredName(name), []);
  const handleUnhover = useCallback(() => setHoveredName(null), []);
  const handleSelect = useCallback(
    (name: string) => {
      updateSelectionParams(selectedName === name ? null : name, null, null, true, isCityDetailRoute);
      setShowAllPins(false);
      if (selectedName === name) {
        setSettledCity(null);
        setDrawerMode("overview");
      } else {
        setSettledCity(null);
        setDrawerMode("city");
        if (shouldOpenPanelByDefault()) {
          setDrawerOpen(true);
          setDrawerPinned(true);
        }
      }
    },
    [isCityDetailRoute, selectedName, updateSelectionParams],
  );

  const handleHoverSchool = useCallback((name: string | null) => setHoveredSchoolName(name), []);
  const handleSelectSchool = useCallback(
    (name: string | null) => {
      if (name) setSettledCity(null);
      updateSelectionParams(selectedName, selectedSchoolName === name ? null : name, null, true, isCityDetailRoute);
    },
    [isCityDetailRoute, selectedName, selectedSchoolName, updateSelectionParams],
  );

  const handleViewDetail = useCallback(
    (school: University) => {
      updateSelectionParams(school.city, school.name, "detail", false, isCityDetailRoute);
    },
    [isCityDetailRoute, updateSelectionParams],
  );

  const handleTopSearch = useCallback((event: FormEvent) => {
    event.preventDefault();
    setShowSuggestions(false);
    const raw = topSearch.trim();
    if (!raw) return;
    const school = tierOnePlusUniversities.find((u) => u.name.includes(raw) || raw.includes(u.name));
    if (school) {
      updateSelectionParams(school.city, school.name);
      setSettledCity(null);
      setDrawerMode("city");
      setShowAllPins(false);
      if (shouldOpenPanelByDefault()) {
        setDrawerOpen(true);
        setDrawerPinned(true);
      }
      return;
    }

    const city = tierOnePlusUniversities.find((u) => {
      const nc = normalizeCityParam(u.city);
      return nc && (raw.includes(nc) || nc.includes(raw));
    });
    if (city) {
      updateSelectionParams(city.city, null);
      setSettledCity(null);
      setDrawerMode("city");
      setShowAllPins(false);
      if (shouldOpenPanelByDefault()) {
        setDrawerOpen(true);
        setDrawerPinned(true);
      }
      return;
    }
  }, [tierOnePlusUniversities, topSearch, updateSelectionParams]);

  // ── Search suggestions ──
  const suggestions = useMemo(() => {
    const raw = topSearch.trim();
    if (!raw) return [];
    const lower = raw.toLowerCase();
    return tierOnePlusUniversities
      .filter((u) => {
        if (u.name.includes(raw)) return true;
        if (u.shortName?.includes(raw)) return true;
        if (u.city.includes(raw)) return true;
        if (u.aliases?.some((a) => a.toLowerCase().includes(lower))) return true;
        return false;
      })
      .slice(0, 5);
  }, [tierOnePlusUniversities, topSearch]);

  const handleSuggestionSelect = useCallback((school: University) => {
    updateSelectionParams(school.city, school.name);
    setSettledCity(null);
    setDrawerMode("city");
    setShowAllPins(false);
    if (shouldOpenPanelByDefault()) {
      setDrawerOpen(true);
      setDrawerPinned(true);
    }
    setShowSuggestions(false);
    setTopSearch(school.name);
    setHoveredSuggestionIdx(-1);
  }, [updateSelectionParams]);

  // ── Derived data ──
  const cityUniversities = useMemo(
    () => selectedName
      ? tierOnePlusUniversities.filter((university) => university.city === selectedName)
      : tierOnePlusUniversities,
    [selectedName, tierOnePlusUniversities],
  );

  const provinceTierCounts = useMemo(() => {
    const counts: Record<Tier, number> = { "985": 0, "211": 0, "dual": 0, "provincial": 0 };
    tierOnePlusUniversities.forEach((u) => { counts[u.tier]++; });
    return counts;
  }, [tierOnePlusUniversities]);

  const hotCities = useMemo(
    () => tierOnePlusUniversities
      .reduce<{ name: string; count: number }[]>((acc, u) => {
        const existing = acc.find((c) => c.name === u.city);
        if (existing) existing.count++;
        else acc.push({ name: u.city, count: 1 });
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count),
    [tierOnePlusUniversities],
  );

  const selectedCityProfile = useMemo(() => getCityProfile(selectedName), [selectedName]);
  const selectedCityImage = useMemo(
    () => (selectedName ? getCityAtlasImage(selectedName) : null),
    [selectedName],
  );
  const previousCity = useMemo(
    () => (selectedName ? getAdjacentCity(selectedName, -1) : null),
    [selectedName],
  );
  const nextCity = useMemo(
    () => (selectedName ? getAdjacentCity(selectedName, 1) : null),
    [selectedName],
  );

  const popularSchools = useMemo(
    () => tierOnePlusUniversities
      .filter((u) => isTierOnePlusUniversity(u))
      .slice(0, 6),
    [tierOnePlusUniversities],
  );

  const isDetailView = urlView === "detail";
  const cityDetailReady = Boolean(isCityDetailRoute && selectedName && settledCity === selectedName);
  const provinceKeyCount = provinceTierCounts["985"] + provinceTierCounts["211"] + provinceTierCounts.dual;

  const handleDrawerToggle = useCallback(() => {
    setDrawerPinned((p) => !p);
    setDrawerOpen((p) => !p);
  }, []);

  const handleBackToOverview = useCallback(() => {
    setSettledCity(null);
    updateSelectionParams(null, null);
    setDrawerMode("overview");
  }, [updateSelectionParams]);

  const handleBackToFocusedMap = useCallback(() => {
    if (!selectedName) {
      handleBackToOverview();
      return;
    }
    setSettledCity(null);
    updateSelectionParams(selectedName, null, null, false, false);
    setDrawerMode("city");
    if (shouldOpenPanelByDefault()) {
      setDrawerOpen(true);
      setDrawerPinned(true);
    }
  }, [handleBackToOverview, selectedName, updateSelectionParams]);

  const handleAtlasCitySelect = useCallback((city: string) => {
    setSettledCity(null);
    updateSelectionParams(city, null, null, false, isCityDetailRoute);
    setDrawerMode("city");
    setShowAllPins(false);
  }, [isCityDetailRoute, updateSelectionParams]);

  const handleOpenCityDetail = useCallback((city: string) => {
    setSettledCity(null);
    updateSelectionParams(city, null, null, false, true);
  }, [updateSelectionParams]);

  const handleInsightCitySelect = useCallback((city: string) => {
    setSettledCity(null);
    updateSelectionParams(city, null);
    setDrawerMode("city");
    setShowAllPins(false);
    if (shouldOpenPanelByDefault()) {
      setDrawerOpen(true);
      setDrawerPinned(true);
    }
  }, [updateSelectionParams]);

  const handleInsightSchoolSelect = useCallback((schoolName: string) => {
    const school = backendSchools.find((item) => item.name === schoolName) ?? null;
    setSettledCity(null);
    updateSelectionParams(school?.cityName ?? selectedName, schoolName);
    setDrawerMode("city");
    setShowAllPins(false);
    if (shouldOpenPanelByDefault()) {
      setDrawerOpen(true);
      setDrawerPinned(true);
    }
  }, [backendSchools, selectedName, updateSelectionParams]);

  return (
      <Page>
{/* Mode toggle (hand-drawn map disabled) */}

      {!isDetailView && !isCityDetailRoute && (
        <>
          <MinimalSearch $drawerOpen={drawerOpen} onSubmit={handleTopSearch}>
            <Search size={16} />
            <input
              value={topSearch}
              onChange={(e) => {
                setTopSearch(e.target.value);
                setShowSuggestions(true);
                setHoveredSuggestionIdx(-1);
              }}
              onFocus={() => { if (topSearch.trim()) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setShowSuggestions(false); return; }
                if (!showSuggestions || suggestions.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHoveredSuggestionIdx((prev) => (prev + 1) % suggestions.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHoveredSuggestionIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === "Enter" && hoveredSuggestionIdx >= 0) {
                  e.preventDefault();
                  handleSuggestionSelect(suggestions[hoveredSuggestionIdx]);
                }
              }}
              placeholder="搜索城市或一本+院校，例如 南京 / 苏州大学"
            />
            <SearchBtn type="submit" className="ui-press">搜索</SearchBtn>
            {showSuggestions && suggestions.length > 0 && (
              <SuggestionDropdown>
                {suggestions.map((u, i) => (
                  <SuggestionItem
                    key={u.id}
                    $hovered={i === hoveredSuggestionIdx}
                    onMouseEnter={() => setHoveredSuggestionIdx(i)}
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(u); }}
                  >
                    <SuggestionName>{u.name}</SuggestionName>
                    {u.shortName && <span style={{ fontSize: 12, color: "#8b7d73" }}>{u.shortName}</span>}
                    <SuggestionCity>{u.city}</SuggestionCity>
                  </SuggestionItem>
                ))}
              </SuggestionDropdown>
            )}
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
            showAllPins={showAllPins}
            onSetMode={setDrawerMode}
            onSetHoveredName={setHoveredName}
            onSetHoveredSchoolName={setHoveredSchoolName}
            onSetShowAllPins={setShowAllPins}
            onSelectSchool={handleSelectSchool}
            onUpdateSelection={updateSelectionParams}
            onOpenCityDetail={handleOpenCityDetail}
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

          {!selectedName && !selectedSchoolName && (
            <ProvinceOverviewChip
              totalCities={13}
              totalUniversities={tierOnePlusUniversities.length}
              keyCount={provinceKeyCount}
              onClick={() => {
                setDrawerMode("overview");
                setDrawerPinned(true);
                setDrawerOpen(true);
              }}
            />
          )}

          <MapDataPanel
            selectedCityName={selectedName}
            selectedSchoolName={selectedSchoolName}
            schools={backendSchools}
            hotSchools={backendHotSchools}
            cityProfiles={backendCityProfiles}
            loading={backendInsightsLoading}
            error={backendInsightsError}
            onSelectCity={handleInsightCitySelect}
            onSelectSchool={handleInsightSchoolSelect}
          />
        </>
      )}

      <Suspense fallback={<SceneFallback><span>加载 3D 地图中...</span></SceneFallback>}>
        <MapScene
          universities={universities}
          hoveredName={hoveredName}
          selectedName={selectedName}
          selectedSchoolName={selectedSchoolName}
          hoveredSchoolName={hoveredSchoolName}
          showAllPins={showAllPins}
          hideOverlays={isDetailView || Boolean(selectedName)}
          onHover={handleHover}
          onUnhover={handleUnhover}
          onSelect={handleSelect}
          onHoverSchool={handleHoverSchool}
          onSelectSchool={handleSelectSchool}
          onCameraSettled={setSettledCity}
        />
      </Suspense>

      {isCityDetailRoute && selectedName && !isDetailView && !cityDetailReady && (
        <CityTransitionStatus>
          进入 <strong>{selectedName}</strong>
        </CityTransitionStatus>
      )}

      {isCityDetailRoute && selectedName && !isDetailView && cityDetailReady && selectedCityImage && previousCity && nextCity && (
        <CityDetailPage
          cityName={selectedName}
          profile={selectedCityProfile}
          cityUniversities={cityUniversities}
          selectedSchoolName={selectedSchoolName}
          imageSrc={selectedCityImage}
          previousCity={previousCity}
          nextCity={nextCity}
          onBackToMap={handleBackToFocusedMap}
          onSelectCity={handleAtlasCitySelect}
          onSelectSchool={handleSelectSchool}
          onViewSchoolDetail={handleViewDetail}
        />
      )}

      {selectedSchoolName && !isDetailView && !isCityDetailRoute && (
        <SchoolInfoCard
          schoolName={selectedSchoolName}
          universities={universities}
          schoolRecord={selectedSchoolRecord}
          onClose={() => updateSelectionParams(selectedName, null)}
          onViewDetail={handleViewDetail}
        />
      )}

      {isDetailView && selectedSchoolName && (
        <SchoolDetailOverlay
          schoolName={selectedSchoolName}
          universities={universities}
          onClose={() => updateSelectionParams(selectedName, selectedSchoolName, null, true, isCityDetailRoute)}
        />
      )}
    </Page>
  );
}
