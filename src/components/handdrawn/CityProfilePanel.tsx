import type { CityMeta } from "../../data/city-profiles";

interface CityProfilePanelProps {
  cityName: string;
  meta: CityMeta;
  universityCount: number;
}

export default function CityProfilePanel({ cityName, meta, universityCount }: CityProfilePanelProps) {
  return (
    <aside className="hd-paper-card hd-city-profile">
      <div className="hd-panel-kicker">CITY DOSSIER</div>
      <div className="hd-city-profile-head">
        <h2>{cityName}</h2>
        <span>{meta.identity}</span>
      </div>

      <div className="hd-profile-summary">
        <strong>{universityCount} 所高校</strong>
        <span>本科城市</span>
        <span>{meta.costLevel}成本</span>
        <span>{meta.transportLevel}</span>
      </div>

      <section>
        <h3>城市印象</h3>
        <div className="hd-chip-list">
          {meta.impressionTags.slice(0, 5).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <section>
        <h3>适合人群</h3>
        <div className="hd-profile-bullets">
          {meta.suitableFor.slice(0, 4).map((item) => (
            <p key={item}>
              <span />
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="hd-profile-tip">
        <h3>探索提示</h3>
        <p>{meta.exploreTip}</p>
      </section>
    </aside>
  );
}
