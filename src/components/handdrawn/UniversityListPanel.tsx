import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { CityMeta } from "../../data/city-profiles";
import type { University, Tier } from "../../data/jiangsu-universities";
import { universityLevelTags, universityTypeTag } from "../../data/jiangsu-universities";

type FilterKey = "all" | "985" | "211" | "dual" | "provincial";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "provincial", label: "本科" },
  { key: "211", label: "211" },
  { key: "985", label: "985" },
  { key: "dual", label: "双一流" },
];

const TIER_DOT_COLOR: Record<Tier, string> = {
  "985": "#c45a4a",
  "211": "#d97845",
  "dual": "#9b6a4c",
  "provincial": "#8eb7c9",
};

interface UniversityListPanelProps {
  cityName: string;
  universities: University[];
  selectedUniversity: University | null;
  hoveredUniversity: University | null;
  meta: CityMeta;
  onHoverUniversity: (u: University | null) => void;
  onSelectUniversity: (u: University) => void;
  onSelectNearbyCity: (city: string) => void;
}

function matchFilter(university: University, filter: FilterKey): boolean {
  if (filter === "all") return true;
  return university.tier === filter;
}

function countForFilter(universities: University[], filter: FilterKey): number {
  if (filter === "all") return universities.length;
  return universities.filter((u) => u.tier === filter).length;
}

export default function UniversityListPanel({
  cityName,
  universities,
  selectedUniversity,
  hoveredUniversity,
  meta,
  onHoverUniversity,
  onSelectUniversity,
  onSelectNearbyCity,
}: UniversityListPanelProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const filtered = useMemo(
    () => universities.filter((u) => matchFilter(u, filter)),
    [filter, universities],
  );
  const compactCity = universities.length <= 1;

  return (
    <aside className="hd-list-card-side">
      <div className="hd-list-head">
        <h2>{cityName}高校</h2>
        <span className="hd-count-tag">{universities.length} 所</span>
      </div>

      <div className="hd-filter-chips">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`hd-filter-chip${filter === item.key ? " is-active" : ""}`}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
            <small>{countForFilter(universities, item.key)}</small>
          </button>
        ))}
      </div>

      <div className="hd-school-list-new">
        {filtered.map((university) => {
          const isActive = selectedUniversity?.name === university.name;
          const isHover = hoveredUniversity?.name === university.name;
          return (
            <button
              key={university.id}
              type="button"
              className={`hd-school-card${isActive ? " is-active" : ""}${isHover ? " is-hovered" : ""}`}
              onMouseEnter={() => onHoverUniversity(university)}
              onMouseLeave={() => onHoverUniversity(null)}
              onClick={() => onSelectUniversity(university)}
            >
              <span
                className="hd-school-dot-colored"
                style={{ background: TIER_DOT_COLOR[university.tier] }}
              />
              <span className="hd-school-info">
                <strong>{university.name}</strong>
                <span className="hd-school-tags">
                  {[universityTypeTag(university), ...universityLevelTags(university).slice(0, 3)].map((tag) => (
                    <span key={tag} className="hd-school-tag">{tag}</span>
                  ))}
                </span>
              </span>
              <ArrowRight size={16} className="hd-school-arrow" />
            </button>
          );
        })}
      </div>

      {compactCity && (
        <div className="hd-quiet-city-modules">
          <section>
            <h3>适合人群</h3>
            <div className="hd-chip-list">
              {meta.suitableFor.slice(0, 4).map((item) => (
                <span key={item}>{item.replace("的同学", "")}</span>
              ))}
            </div>
          </section>

          <section>
            <h3>还可以看看</h3>
            <div className="hd-nearby-list">
              {meta.nearbyCities.map((nearby) => (
                <button key={nearby.name} type="button" onClick={() => onSelectNearbyCity(nearby.name)}>
                  <strong>{nearby.name}</strong>
                  <span>{nearby.reason}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <button className="hd-view-all-btn" type="button" onClick={() => setFilter("all")}>
        查看全部 {universities.length} 所高校
        <ArrowRight size={15} />
      </button>

      {selectedUniversity && (
        <div className="hd-school-detail-panel">
          <h3>{selectedUniversity.name}</h3>
          <div className="hd-school-detail-tags">
            {universityLevelTags(selectedUniversity).map((tag) => (
              <span key={tag} className="hd-school-tag">{tag}</span>
            ))}
            <span className="hd-school-tag">{universityTypeTag(selectedUniversity)}</span>
          </div>
          <div className="hd-school-detail-meta">
            <span>城市：{selectedUniversity.city}</span>
            {selectedUniversity.founded && <span>建校：{selectedUniversity.founded} 年</span>}
            {selectedUniversity.website && (
              <span>
                官网：<a href={selectedUniversity.website} target="_blank" rel="noopener noreferrer">{selectedUniversity.website}</a>
              </span>
            )}
          </div>
          <a className="hd-school-experience-link" href={`/experiences?school=${encodeURIComponent(selectedUniversity.name)}`}>
            查看校园经验 →
          </a>
        </div>
      )}
    </aside>
  );
}
