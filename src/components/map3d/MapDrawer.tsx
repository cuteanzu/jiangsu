import { useState, useEffect } from "react";
import styled from "styled-components";
import LeftPanel from "./LeftPanel";
import type { University } from "../../data/jiangsu-universities";
import type { CityCockpitProfile } from "../../data/city-profiles";

// ── Styled ──

const DrawerShell = styled.aside<{ $open: boolean }>`
  position: absolute; z-index: 11; top: 0; left: 0; bottom: 0;
  width: 320px;
  background: rgba(255, 252, 247, 0.90);
  border-right: 1px solid rgba(214, 175, 145, 0.20);
  box-shadow: 4px 0 32px rgba(158, 126, 104, 0.10);
  backdrop-filter: blur(20px);
  transform: translateX(${(p) => (p.$open ? "0" : "-100%")});
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  overflow: hidden;
`;

const DrawerInner = styled.div`
  flex: 1; overflow-y: auto; padding: 20px 18px 24px;
`;

const ModeTabs = styled.div`
  display: flex; gap: 4px; margin-bottom: 16px;
  padding: 4px; border-radius: 10px;
  background: rgba(220, 210, 195, 0.18);
`;

const ModeTab = styled.button<{ $active: boolean }>`
  flex: 1; min-height: 34px; border: 0; border-radius: 8px;
  cursor: pointer; font-size: 11.5px; font-weight: 700;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  background: ${(p) => (p.$active ? "rgba(255, 252, 247, 0.9)" : "transparent")};
  color: ${(p) => (p.$active ? "#c76b5e" : "#6b5d53")};
  box-shadow: ${(p) => (p.$active ? "0 2px 8px rgba(180, 130, 110, 0.12)" : "none")};
  transition: all 0.15s ease;
  white-space: nowrap;
  &:hover { color: #c76b5e; }
`;

// ── Types ──

type CockpitMode = "overview" | "city" | "route";

interface HotCity {
  name: string;
  count: number;
}

interface MapDrawerProps {
  open: boolean;
  pinned: boolean;
  mode: CockpitMode;
  selectedName: string | null;
  selectedSchoolName: string | null;
  hoveredName: string | null;
  cityUniversities: University[];
  hotCities: HotCity[];
  popularSchools: University[];
  selectedCityProfile: CityCockpitProfile;
  onSetMode: (mode: CockpitMode) => void;
  onSetHoveredName: (v: string | null) => void;
  onSetHoveredSchoolName: (v: string | null) => void;
  onSelectSchool: (name: string | null) => void;
  onUpdateSelection: (city: string | null, school: string | null) => void;
  onBackToOverview: () => void;
}

export default function MapDrawer({
  open, mode, selectedName, selectedSchoolName,
  hoveredName, cityUniversities, hotCities, popularSchools,
  selectedCityProfile,
  onSetMode, onSetHoveredName, onSetHoveredSchoolName,
  onSelectSchool, onUpdateSelection, onBackToOverview,
}: MapDrawerProps) {
  const [leftSearch, setLeftSearch] = useState("");
  const [showAllPins, setShowAllPins] = useState(false);

  // Auto-switch to city mode when a city is selected
  useEffect(() => {
    if (selectedName) onSetMode("city");
  }, [selectedName]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayMode = selectedName && mode === "overview" ? "city" : mode;

  return (
    <DrawerShell $open={open}>
      <ModeTabs style={{ margin: "18px 18px 0" }}>
        <ModeTab $active={displayMode === "overview"} onClick={() => onSetMode("overview")}>总览</ModeTab>
        <ModeTab $active={displayMode === "city"} onClick={() => onSetMode("city")}>城市探索</ModeTab>
        <ModeTab $active={displayMode === "route"} onClick={() => onSetMode("route")}>路线推荐</ModeTab>
      </ModeTabs>
      <DrawerInner>
        <LeftPanel
          displayMode={displayMode}
          selectedName={selectedName}
          selectedSchoolName={selectedSchoolName}
          hoveredName={hoveredName}
          leftSearch={leftSearch}
          showAllPins={showAllPins}
          cityUniversities={cityUniversities}
          filteredSchools={
            leftSearch.trim()
              ? cityUniversities.filter((u) => u.name.toLowerCase().includes(leftSearch.toLowerCase()) || u.city.includes(leftSearch))
              : cityUniversities
          }
          hotCities={hotCities}
          popularSchools={popularSchools}
          selectedCityProfile={selectedCityProfile}
          onSetLeftSearch={setLeftSearch}
          onSetShowAllPins={setShowAllPins}
          onSetHoveredName={onSetHoveredName}
          onSetHoveredSchoolName={onSetHoveredSchoolName}
          onSelectSchool={onSelectSchool}
          onSetActiveMode={onSetMode}
          onUpdateSelection={onUpdateSelection}
          onBackToOverview={onBackToOverview}
        />
      </DrawerInner>
    </DrawerShell>
  );
}
