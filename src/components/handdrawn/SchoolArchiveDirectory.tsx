import { useState, useMemo } from "react";
import type { Tier, University } from "../../data/jiangsu-universities";
import { TIER_LABEL } from "../../data/jiangsu-universities";

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

type FilterKey = "all" | Tier;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "985", label: "985" },
  { key: "211", label: "211" },
  { key: "dual", label: "双一流" },
  { key: "provincial", label: "本科" },
];

function tierBadges(tier: Tier): { label: string; tone: Tier }[] {
  if (tier === "985") {
    return [
      { label: "985", tone: "985" },
      { label: "211", tone: "211" },
      { label: "双一流", tone: "dual" },
    ];
  }
  if (tier === "211") {
    return [
      { label: "211", tone: "211" },
      { label: "双一流", tone: "dual" },
    ];
  }
  if (tier === "dual") {
    return [{ label: "双一流", tone: "dual" }];
  }
  return [{ label: "本科", tone: "provincial" }];
}

export interface SchoolArchiveDirectoryProps {
  cityName: string;
  cityUniversities: University[];
  selectedSchool: string | null;
  hoveredSchool: string | null;
  onHoverSchool: (name: string | null) => void;
  onSelectSchool: (name: string | null) => void;
}

export default function SchoolArchiveDirectory({
  cityName,
  cityUniversities,
  selectedSchool,
  hoveredSchool,
  onHoverSchool,
  onSelectSchool,
}: SchoolArchiveDirectoryProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showArchive, setShowArchive] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return cityUniversities;
    return cityUniversities.filter((u) => u.tier === filter);
  }, [cityUniversities, filter]);

  const detailSchool = useMemo(() => {
    if (!selectedSchool) return null;
    return cityUniversities.find((u) => u.name === selectedSchool) ?? null;
  }, [selectedSchool, cityUniversities]);

  const tierCounts = useMemo(() => {
    const c: Record<Tier, number> = { "985": 0, "211": 0, "dual": 0, "provincial": 0 };
    cityUniversities.forEach((u) => { c[u.tier]++; });
    return c;
  }, [cityUniversities]);

  // School archive view
  if (showArchive && detailSchool) {
    return (
      <div className="sa-panel">
        <button
          className="sa-back-btn"
          onClick={() => { setShowArchive(false); onSelectSchool(null); }}
        >
          ← 返回高校列表
        </button>

        <div className="sa-header-row">
          <h3 className="sa-title">{detailSchool.name}</h3>
          <span className="sa-badge">院校档案</span>
        </div>

        <div className="sa-subtitle">
          {detailSchool.city} · {TIER_LABEL[detailSchool.tier]}
          {detailSchool.founded && ` · ${detailSchool.founded}年建校`}
        </div>

        <div className="sa-section">
          <div className="sa-section-title">学校概况</div>
          <p className="sa-text">
            {detailSchool.name}坐落于{detailSchool.city}，是江苏省高校版图中的重要坐标。
            {detailSchool.tier === "985" && "作为985工程重点建设高校，综合实力与研究气质突出。"}
            {detailSchool.tier === "211" && "作为211工程重点建设高校，学科底蕴清晰，专业传统深厚。"}
            {detailSchool.tier === "dual" && "作为双一流建设高校，特色学科辨识度很高。"}
            {detailSchool.tier === "provincial" && "与地方产业、师范教育、应用创新联系紧密。"}
          </p>
        </div>

        <div className="sa-section">
          <div className="sa-section-title">城市环境</div>
          <p className="sa-text">
            {detailSchool.city === "南京" && "省会城市资源丰富，科研平台与实习机会密集，地铁网络覆盖全城。"}
            {detailSchool.city === "苏州" && "经济发达毗邻上海，园林校园环境优美，外企与产业机会丰富。"}
            {detailSchool.city === "无锡" && "太湖之滨生活舒适，物联网与制造业聚集，城市整洁宜居。"}
            {detailSchool.city === "徐州" && "北方城市氛围浓厚，物价友好，是安心读书的好选择。"}
            {detailSchool.city === "常州" && "制造业强市，城市紧凑通勤方便，生活成本适中。"}
            {detailSchool.city === "南通" && "滨江临海空气清新，城市干净成长空间大。"}
            {detailSchool.city === "扬州" && "淮扬美食之城，历史文化深厚，生活节奏舒适怡人。"}
            {detailSchool.city === "镇江" && "山水花园城市紧邻南京，通勤便利生活成本友好。"}
            {detailSchool.city === "盐城" && "沿海湿地生态独特，空气质量优良，生活成本低。"}
            {detailSchool.city === "淮安" && "运河之都烟火气浓，物价友好，生活节奏悠然。"}
            {detailSchool.city === "泰州" && "医药产业聚集，城市安静宜居，早茶文化浓厚。"}
            {detailSchool.city === "宿迁" && "生态绿色新兴城市，生活成本省内最低之一。"}
            {detailSchool.city === "连云港" && "山海风光独特，港口城市空气清新，自然景观优美。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-panel">
      {/* Header */}
      <div className="sa-header-row">
        <h3 className="sa-title">
          {cityName}高校
          <span className="sa-count">{cityUniversities.length} 所</span>
        </h3>
        <span className="sa-badge">高校档案</span>
      </div>

      {/* Filter tabs */}
      <div className="sa-filters">
        {FILTER_TABS.map((tab) => {
          const count = tab.key === "all" ? cityUniversities.length : (tierCounts[tab.key] || 0);
          return (
            <button
              key={tab.key}
              type="button"
              className={`sa-filter-tab${filter === tab.key ? " is-active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className="sa-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* School list */}
      <div className="sa-list">
        {filtered.map((u, i) => {
          const isSel = selectedSchool === u.name;
          const isHov = hoveredSchool === u.name;
          const badges = tierBadges(u.tier);
          return (
            <div
              key={u.id}
              className={`sa-item${isSel ? " is-selected" : ""}${isHov ? " is-hovered" : ""}`}
              style={{ animationDelay: `${0.08 + i * 0.03}s` }}
              onMouseEnter={() => onHoverSchool(u.name)}
              onMouseLeave={() => onHoverSchool(null)}
              onClick={() => {
                if (isSel) { onSelectSchool(null); setShowArchive(false); }
                else { onSelectSchool(u.name); setShowArchive(false); }
              }}
            >
              <span className="sa-dot" style={{ background: TIER_DOT_COLOR[u.tier] }} />
              <span className="sa-school-name">{u.name}</span>
              <span className="sa-tier-stack">
                {badges.map((badge) => (
                  <span
                    key={`${u.id}-${badge.label}`}
                    className="sa-tier-tag"
                    style={{ background: TIER_TAG_BG[badge.tone], color: TIER_TAG_COLOR[badge.tone] }}
                  >
                    {badge.label}
                  </span>
                ))}
              </span>
              <span className="sa-row-arrow">→</span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="sa-empty">该分类暂无高校</div>
        )}
      </div>

      <button className="sa-footer-link" type="button" onClick={() => setFilter("all")}>
        查看全部 {cityUniversities.length} 所高校
        <span>→</span>
      </button>
    </div>
  );
}
