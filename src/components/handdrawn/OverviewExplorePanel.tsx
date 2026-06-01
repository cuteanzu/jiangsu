interface CityRankItem {
  name: string;
  value: string;
}

interface OverviewExplorePanelProps {
  totalUniversities: number;
  keyUniversityCount: number;
  cityCount: number;
  activeCity: string;
  activeFilter: string;
  onSelectCity: (city: string) => void;
  onSelectFilter: (filter: string) => void;
}

const RANK_GROUPS: { title: string; items: CityRankItem[] }[] = [
  {
    title: "高校最多",
    items: [
      { name: "南京", value: "26 所" },
      { name: "苏州", value: "6 所" },
      { name: "徐州", value: "4 所" },
      { name: "无锡", value: "3 所" },
    ],
  },
  {
    title: "生活成本低",
    items: [
      { name: "宿迁", value: "低" },
      { name: "淮安", value: "友好" },
      { name: "盐城", value: "友好" },
    ],
  },
  {
    title: "就业机会强",
    items: [
      { name: "南京", value: "强" },
      { name: "苏州", value: "强" },
      { name: "无锡", value: "多" },
    ],
  },
  {
    title: "校园环境好",
    items: [
      { name: "扬州", value: "文艺" },
      { name: "镇江", value: "山水" },
      { name: "南京", value: "资源" },
    ],
  },
];

const FILTERS = ["本科高校", "985", "211", "双一流", "生活成本低", "考研友好", "交通便利"];

export default function OverviewExplorePanel({
  totalUniversities,
  keyUniversityCount,
  cityCount,
  activeCity,
  activeFilter,
  onSelectCity,
  onSelectFilter,
}: OverviewExplorePanelProps) {
  return (
    <aside className="hd-paper-card hd-overview-panel">
      <div className="hd-panel-kicker">HAND-DRAWN ATLAS</div>
      <h2>江苏高校探索</h2>

      <div className="hd-overview-stats">
        <div>
          <strong>{totalUniversities}</strong>
          <span>本科高校</span>
        </div>
        <div>
          <strong>{keyUniversityCount}</strong>
          <span>重点高校</span>
        </div>
        <div>
          <strong>{cityCount}</strong>
          <span>覆盖城市</span>
        </div>
      </div>

      <div className="hd-section-title">城市榜单</div>
      <div className="hd-rank-groups">
        {RANK_GROUPS.map((group) => (
          <section key={group.title} className="hd-rank-group">
            <h3>{group.title}</h3>
            <div>
              {group.items.map((item) => (
                <button
                  key={`${group.title}-${item.name}`}
                  type="button"
                  className={activeCity === item.name ? "is-active" : ""}
                  onClick={() => onSelectCity(item.name)}
                >
                  <span>{item.name}</span>
                  <small>{item.value}</small>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="hd-section-title">快速筛选</div>
      <div className="hd-filter-cloud">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? "is-active" : ""}
            onClick={() => onSelectFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </aside>
  );
}
