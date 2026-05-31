import styled from "styled-components";
import { MapPin, BookOpen, Search, Sparkles, ArrowLeft } from "lucide-react";
import { TIER_LABEL } from "../../data/jiangsu-universities";
import type { University, Tier } from "../../data/jiangsu-universities";
import type { CityCockpitProfile } from "../../data/city-profiles";

type CockpitMode = "overview" | "city" | "route";

// ── Styled (shared with JiangsuMap3D via duplication — acceptable for decoupling) ──

const PanelKicker = styled.div`
  margin-bottom: 8px;
  color: #b96b5f;
  font-size: 11px;
  font-weight: 850;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
`;

const PanelTitle = styled.div`
  font-family: "Noto Serif SC","Songti SC","KaiTi",serif;
  font-size: 17px; font-weight: 800; color: #3a2f28;
  margin-bottom: 12px; display: flex; align-items: center; gap: 7px;
  svg { color: #c76b5e; width: 16px; height: 16px; }
`;

const PanelHint = styled.div`
  font-size: 11px; color: #8b7d73; margin-bottom: 12px; line-height: 1.5;
`;

const SearchInput = styled.div`
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.6); border-radius: 10px;
  border: 1px solid rgba(200,170,150,0.25);
  padding: 6px 10px; margin-bottom: 12px;
  input {
    border: none; background: none; outline: none; width: 100%;
    font-size: 11px; font-family: "Noto Sans SC","PingFang SC",sans-serif;
    color: #3a2f28;
    &::placeholder { color: #b0a090; }
  }
  svg { color: #b0a090; width: 14px; height: 14px; flex-shrink: 0; }
`;

const CityListWrap = styled.div` display: flex; flex-wrap: wrap; gap: 5px; `;

const CityChip = styled.button<{ $hot?: boolean; $hovered?: boolean; $selected?: boolean }>`
  font-size: 10.5px; padding: 4px 9px; border-radius: 9px; border: 1.5px solid;
  cursor: pointer; font-family: "Noto Sans SC","PingFang SC",sans-serif;
  transition: all 0.15s ease;
  background: ${(p) => p.$selected ? "rgba(232,120,106,0.15)" : p.$hovered ? "rgba(200,170,150,0.25)" : p.$hot ? "rgba(230,180,170,0.2)" : "rgba(220,210,195,0.2)"};
  color: ${(p) => p.$selected ? "#8b3a2e" : "#4a3a2a"};
  border-color: ${(p) => p.$selected ? "rgba(232,120,106,0.4)" : "rgba(200,170,150,0.2)"};
  font-weight: ${(p) => p.$selected || p.$hot ? 700 : 500};
  &:hover { background: rgba(200,170,150,0.3); border-color: rgba(200,150,130,0.4); }
`;

const BackBtn = styled.button`
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-family: "Noto Sans SC","PingFang SC",sans-serif;
  color: #c76b5e; border: none; background: none; cursor: pointer;
  padding: 0; margin-bottom: 10px;
  &:hover { opacity: 0.7; }
  svg { width: 14px; height: 14px; }
`;

const SchoolItem = styled.div<{ $selected?: boolean }>`
  padding: 6px 9px; border-radius: 8px; margin-bottom: 4px;
  cursor: pointer; font-size: 11px; line-height: 1.5;
  background: ${({ $selected }) => $selected ? "rgba(232,120,106,0.10)" : "transparent"};
  border: 1px solid ${({ $selected }) => $selected ? "rgba(232,120,106,0.30)" : "transparent"};
  transition: all 0.15s ease;
  &:hover { background: rgba(200,170,150,0.18); }
  .row { display: flex; align-items: center; justify-content: space-between; }
  .name { font-weight: 700; color: #3a2f28; }
  .founded { font-size: 9px; color: #b0a090; font-weight: 400; white-space: nowrap; }
`;

const TierBadge = styled.span<{ $tier: Tier }>`
  font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: 600;
  background: ${({ $tier }) =>
    $tier === "985" ? "rgba(200,80,60,0.12)" :
    $tier === "211" ? "rgba(180,120,80,0.12)" :
    $tier === "dual" ? "rgba(100,120,180,0.10)" :
    "rgba(150,150,150,0.08)"};
  color: ${({ $tier }) =>
    $tier === "985" ? "#b04a3a" :
    $tier === "211" ? "#9b6a4a" :
    $tier === "dual" ? "#5a6090" :
    "#7a7a7a"};
`;

const SectionLabel = styled.div`
  font-size: 11px; color: #a09080; margin-top: 16px; margin-bottom: 8px; font-weight: 600;
  padding-top: 10px; border-top: 1px solid rgba(200,170,150,0.15);
  display: flex; align-items: center; gap: 5px;
  svg { width: 13px; height: 13px; }
`;

const ExpCard = styled.div`
  background: rgba(255,250,247,0.6); border-radius: 10px; padding: 9px 11px;
  margin-bottom: 7px; border: 1px solid rgba(200,170,150,0.18);
  font-size: 10.5px; color: #4a3a2a; line-height: 1.5; cursor: pointer;
  transition: all 0.15s ease;
  &:hover { background: rgba(255,248,243,0.75); border-color: rgba(200,150,130,0.35); }
  .title { font-weight: 700; font-size: 11px; margin-bottom: 2px; }
  .meta { color: #a09080; font-size: 9.5px; margin-top: 3px; }
`;

const RouteCard = styled.button`
  width: 100%;
  padding: 11px 12px;
  border-radius: 14px;
  border: 1px solid rgba(155, 176, 195, 0.24);
  background: rgba(255, 252, 247, 0.66);
  color: #3a2f28;
  cursor: pointer;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  text-align: left;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(116, 158, 186, 0.34);
    background: rgba(255, 255, 255, 0.82);
  }
  .title { color: #455e73; font-size: 12px; font-weight: 850; margin-bottom: 4px; }
  .desc { color: #78685c; font-size: 10.5px; line-height: 1.55; }
`;

// ── Types ──

interface HotCity {
  name: string;
  count: number;
}

interface LeftPanelProps {
  displayMode: CockpitMode;
  selectedName: string | null;
  selectedSchoolName: string | null;
  hoveredName: string | null;
  leftSearch: string;
  showAllPins: boolean;
  cityUniversities: University[];
  filteredSchools: University[];
  hotCities: HotCity[];
  popularSchools: University[];
  selectedCityProfile: CityCockpitProfile;
  onSetLeftSearch: (v: string) => void;
  onSetShowAllPins: (v: boolean) => void;
  onSetHoveredName: (v: string | null) => void;
  onSetHoveredSchoolName: (v: string | null) => void;
  onSelectSchool: (name: string | null) => void;
  onSetActiveMode: (mode: CockpitMode) => void;
  onUpdateSelection: (city: string | null, school: string | null) => void;
  onBackToOverview: () => void;
}

export default function LeftPanel(props: LeftPanelProps) {
  const {
    displayMode, selectedName, selectedSchoolName, hoveredName,
    leftSearch, showAllPins, cityUniversities, filteredSchools,
    hotCities, popularSchools, selectedCityProfile,
    onSetLeftSearch, onSetShowAllPins, onSetHoveredName, onSetHoveredSchoolName,
    onSelectSchool, onSetActiveMode, onUpdateSelection, onBackToOverview,
  } = props;

  if (displayMode === "route") {
    return (
      <>
        <PanelKicker>RECOMMENDED ROUTES</PanelKicker>
        <PanelTitle><MapPin size={16} /> 路线推荐</PanelTitle>
        <PanelHint>按目标组合城市。切换路线只调整页面信息，不重置当前 3D 相机视角。</PanelHint>
        <RouteCard onClick={() => { onUpdateSelection("南京", null); onSetShowAllPins(false); }}>
          <div className="title">高资源路线 · 南京</div>
          <div className="desc">985/211 密集，适合科研、保研、实习资源优先的同学。</div>
        </RouteCard>
        <RouteCard onClick={() => { onUpdateSelection("苏州", null); onSetShowAllPins(false); }}>
          <div className="title">产业机会路线 · 苏州 / 无锡</div>
          <div className="desc">城市品质高，制造业、互联网、外企和创新产业更集中。</div>
        </RouteCard>
        <RouteCard onClick={() => { onUpdateSelection("徐州", null); onSetShowAllPins(false); }}>
          <div className="title">性价比路线 · 徐州 / 常州 / 镇江</div>
          <div className="desc">生活成本更友好，学风扎实，适合稳扎稳打型报考。</div>
        </RouteCard>
        <SectionLabel>适合报考人群</SectionLabel>
        <ExpCard>
          <div className="title">先定城市节奏，再筛高校层次</div>
          <div className="meta">把"生活成本、通勤便利、就业机会"一起纳入选择。</div>
        </ExpCard>
      </>
    );
  }

  if (selectedName) {
    return (
      <>
        <BackBtn onClick={onBackToOverview}>
          <ArrowLeft size={14} /> 返回全省视图
        </BackBtn>
        <PanelKicker>CITY EXPLORATION</PanelKicker>
        <PanelTitle><BookOpen size={16} /> {selectedName}高校索引</PanelTitle>
        <PanelHint>
          共 <span style={{ fontWeight: 800, color: "#5a4a3a" }}>{cityUniversities.length}</span> 所本科院校 · {selectedCityProfile.audience}
        </PanelHint>

        <SearchInput>
          <Search size={14} />
          <input
            placeholder={`搜索${selectedName}高校…`}
            value={leftSearch}
            onChange={(e) => onSetLeftSearch(e.target.value)}
          />
        </SearchInput>

        {cityUniversities.some((u) => u.tier === "provincial") && (
          <label style={{
            display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
            fontSize: 10, color: "#8b7d73", cursor: "pointer",
            fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
          }}>
            <input
              type="checkbox"
              checked={showAllPins}
              onChange={(e) => onSetShowAllPins(e.target.checked)}
              style={{ accentColor: "#c76b5e", width: 13, height: 13, cursor: "pointer" }}
            />
            显示全部本科高校
          </label>
        )}

        <div style={{ maxHeight: "calc(100% - 120px)", overflowY: "auto" }}>
          {filteredSchools.map((u) => (
            <SchoolItem
              key={u.id}
              $selected={selectedSchoolName === u.name}
              onClick={() => onSelectSchool(u.name)}
              onMouseEnter={() => onSetHoveredSchoolName(u.name)}
              onMouseLeave={() => onSetHoveredSchoolName(null)}
            >
              <div className="row">
                <span className="name">{u.name}</span>
                <TierBadge $tier={u.tier}>{TIER_LABEL[u.tier]}</TierBadge>
              </div>
              {u.founded && <div className="founded">建校 {u.founded}</div>}
            </SchoolItem>
          ))}
          {filteredSchools.length === 0 && (
            <div style={{ fontSize: 11, color: "#b0a090", textAlign: "center", padding: 16 }}>未找到匹配高校</div>
          )}
        </div>
      </>
    );
  }

  // Overview
  return (
    <>
      <PanelKicker>DISCOVER JIANGSU</PanelKicker>
      <PanelTitle><MapPin size={16} /> 推荐探索</PanelTitle>
      <PanelHint>点击地图城市，或从下面选择城市，进入高校与生活指标概览。</PanelHint>

      <SearchInput>
        <Search size={14} />
        <input
          placeholder="搜索城市或高校…"
          value={leftSearch}
          onChange={(e) => onSetLeftSearch(e.target.value)}
        />
      </SearchInput>

      <div style={{ fontSize: 11, color: "#a09080", marginBottom: 5, fontWeight: 600 }}>全部城市</div>
      <CityListWrap>
        {hotCities
          .filter((c) => !leftSearch.trim() || c.name.includes(leftSearch.trim()))
          .map((c) => (
            <CityChip
              key={c.name}
              $hot={c.count >= 3}
              $hovered={hoveredName === c.name}
              $selected={selectedName === c.name}
              onMouseEnter={() => onSetHoveredName(c.name)}
              onMouseLeave={() => onSetHoveredName(null)}
              onClick={() => {
                onUpdateSelection(c.name, null);
                onSetActiveMode("city");
                onSetShowAllPins(false);
              }}
            >
              {c.name} · {c.count}所
            </CityChip>
          ))}
      </CityListWrap>

      <SectionLabel><Sparkles size={13} /> 热门高校</SectionLabel>
      {popularSchools.slice(0, 4).map((school) => (
        <ExpCard
          key={school.id}
          onClick={() => {
            onUpdateSelection(school.city, school.name);
            onSetActiveMode("city");
          }}
        >
          <div className="title">{school.name}</div>
          <div className="meta">{school.city} · {TIER_LABEL[school.tier]}</div>
        </ExpCard>
      ))}
    </>
  );
}
