import { ArrowRight } from "lucide-react";
import type { University } from "../../data/jiangsu-universities";
import { universityLevelTags } from "../../data/jiangsu-universities";
import type { CityMeta } from "../../data/city-profiles";

interface CityInsightPanelProps {
  cityName: string;
  meta: CityMeta;
  universities: University[];
  keyUniversityCount: number;
  onEnterCity: (city: string) => void;
}

export default function CityInsightPanel({
  cityName,
  meta,
  universities,
  keyUniversityCount,
  onEnterCity,
}: CityInsightPanelProps) {
  const recommended = universities
    .filter((university) => university.tier !== "provincial")
    .concat(universities.filter((university) => university.tier === "provincial"))
    .slice(0, 5);

  return (
    <aside className="hd-paper-card hd-insight-panel">
      <div className="hd-panel-kicker">CITY NOTE</div>
      <div className="hd-insight-heading">
        <h2>{cityName}</h2>
        <span>{meta.identity}</span>
      </div>

      <div className="hd-insight-metrics">
        <div>
          <strong>{universities.length}</strong>
          <span>高校</span>
        </div>
        <div>
          <strong>{keyUniversityCount}</strong>
          <span>重点</span>
        </div>
      </div>

      <dl className="hd-city-facts">
        <div>
          <dt>生活成本</dt>
          <dd>{meta.costLevel}</dd>
        </div>
        <div>
          <dt>交通便利</dt>
          <dd>{meta.transportLevel}</dd>
        </div>
        <div>
          <dt>城市机会</dt>
          <dd>{meta.opportunityLevel}</dd>
        </div>
        <div>
          <dt>城市节奏</dt>
          <dd>{meta.rhythmLevel}</dd>
        </div>
      </dl>

      <section className="hd-insight-section">
        <h3>适合人群</h3>
        <p>{meta.suitableFor.slice(0, 2).join("；")}</p>
      </section>

      <section className="hd-insight-section">
        <h3>推荐高校</h3>
        <div className="hd-recommend-list">
          {recommended.map((university) => (
            <div key={university.id}>
              <span>{university.name}</span>
              <small>{universityLevelTags(university).slice(0, 2).join(" / ")}</small>
            </div>
          ))}
        </div>
      </section>

      <button className="hd-primary-btn" type="button" onClick={() => onEnterCity(cityName)}>
        进入{cityName}详情
        <ArrowRight size={16} />
      </button>
    </aside>
  );
}
