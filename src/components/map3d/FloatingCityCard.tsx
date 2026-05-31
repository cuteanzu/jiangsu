import styled from "styled-components";
import { X, BookOpen } from "lucide-react";
import { TIER_LABEL } from "../../data/jiangsu-universities";
import type { University, Tier } from "../../data/jiangsu-universities";
import type { CityCockpitProfile } from "../../data/city-profiles";

// ── Styled ──

const CardShell = styled.div`
  animation: fcFadeUp 0.28s ease-out;
  @keyframes fcFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  background: rgba(255, 252, 247, 0.88);
  border-radius: 18px;
  border: 1px solid rgba(214, 175, 145, 0.22);
  box-shadow: 0 12px 40px rgba(158, 126, 104, 0.12), 0 2px 8px rgba(180, 150, 130, 0.06);
  backdrop-filter: blur(20px);
  padding: 18px 20px;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
`;

const CardHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
  .cityname { font-family: "Noto Serif SC","Songti SC",serif; font-size: 22px; font-weight: 900; color: #302721; }
`;

const CloseBtn = styled.button`
  border: none; background: rgba(200, 170, 150, 0.12); border-radius: 50%;
  width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #8b7d73; flex-shrink: 0;
  &:hover { background: rgba(200, 150, 130, 0.25); color: #3a2f28; }
`;

const StatRow = styled.div`
  display: flex; gap: 8px; margin-bottom: 10px;
`;

const StatPill = styled.div`
  padding: 4px 12px; border-radius: 999px;
  background: rgba(255, 250, 246, 0.7);
  border: 1px solid rgba(200, 170, 150, 0.18);
  font-size: 11.5px; font-weight: 700; color: #3a2f28;
  .num { font-family: "Noto Serif SC","Songti SC",serif; font-size: 15px; margin-right: 2px; }
`;

const TierTagRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;
`;

const TierTagSmall = styled.span<{ $tier: Tier }>`
  font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 600;
  background: ${({ $tier }) =>
    $tier === "985" ? "rgba(200,80,60,0.14)" :
    $tier === "211" ? "rgba(180,120,80,0.13)" :
    $tier === "dual" ? "rgba(100,120,180,0.11)" :
    "rgba(150,150,150,0.09)"};
  color: ${({ $tier }) =>
    $tier === "985" ? "#b04a3a" :
    $tier === "211" ? "#9b6a4a" :
    $tier === "dual" ? "#5a6090" :
    "#7a7a7a"};
`;

const MetricGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 6px; margin-bottom: 12px;
`;

const MetricCard = styled.div`
  min-width: 0;
  border-radius: 10px;
  border: 1px solid rgba(155, 176, 195, 0.18);
  background: linear-gradient(180deg, rgba(255, 253, 248, 0.82), rgba(241, 248, 255, 0.58));
  padding: 8px 6px;
  text-align: center;
  .label { color: #9a8a7d; font-size: 9px; font-weight: 750; margin-bottom: 2px; }
  .value { color: #455e73; font-size: 11px; font-weight: 850; }
`;

const RepSchools = styled.div`
  display: flex; gap: 6px;
`;

const RepSchoolBtn = styled.button`
  flex: 1; min-height: 36px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 4px; padding: 0 8px;
  border: 1px solid rgba(180, 150, 130, 0.16);
  border-radius: 10px;
  background: rgba(255, 252, 247, 0.6);
  color: #3a2f28; cursor: pointer;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  font-size: 10.5px; font-weight: 800;
  text-align: left;
  transition: all 0.15s ease;
  &:hover { transform: translateY(-1px); border-color: rgba(199, 107, 94, 0.25); background: rgba(255, 255, 255, 0.82); }
`;

// ── Types ──

interface FloatingCityCardProps {
  selectedName: string;
  selectedSchoolName: string | null;
  selectedCityProfile: CityCockpitProfile;
  cityUniversities: University[];
  tierCounts: Record<Tier, number>;
  representativeSchools: University[];
  onSelectSchool: (name: string | null) => void;
  onSetHoveredSchoolName: (name: string | null) => void;
  onViewDetail: (school: University) => void;
  onDismiss: () => void;
}

export default function FloatingCityCard({
  selectedName, selectedSchoolName, selectedCityProfile,
  cityUniversities, tierCounts, representativeSchools,
  onSelectSchool, onSetHoveredSchoolName, onViewDetail, onDismiss,
}: FloatingCityCardProps) {
  return (
    <CardShell>
      <CardHeader>
        <span className="cityname">{selectedName}</span>
        <CloseBtn onClick={onDismiss} title="取消选择">
          <X size={14} />
        </CloseBtn>
      </CardHeader>

      <StatRow>
        <StatPill><span className="num">{cityUniversities.length}</span> 所本科</StatPill>
        <StatPill><span className="num">{tierCounts["985"] + tierCounts["211"] + tierCounts.dual}</span> 所重点</StatPill>
      </StatRow>

      <TierTagRow>
        {tierCounts["985"] > 0 && <TierTagSmall $tier="985">985 × {tierCounts["985"]}</TierTagSmall>}
        {tierCounts["211"] > 0 && <TierTagSmall $tier="211">211 × {tierCounts["211"]}</TierTagSmall>}
        {tierCounts.dual > 0 && <TierTagSmall $tier="dual">双一流 × {tierCounts.dual}</TierTagSmall>}
        {tierCounts.provincial > 0 && <TierTagSmall $tier="provincial">本科 × {tierCounts.provincial}</TierTagSmall>}
      </TierTagRow>

      <MetricGrid>
        <MetricCard><div className="label">生活成本</div><div className="value">{selectedCityProfile.cost}</div></MetricCard>
        <MetricCard><div className="label">交通便利</div><div className="value">{selectedCityProfile.transit}</div></MetricCard>
        <MetricCard><div className="label">就业机会</div><div className="value">{selectedCityProfile.jobs}</div></MetricCard>
      </MetricGrid>

      {representativeSchools.length > 0 && (
        <RepSchools>
          {representativeSchools.map((school) => (
            <RepSchoolBtn
              key={school.id}
              onClick={() => onSelectSchool(school.name)}
              onMouseEnter={() => onSetHoveredSchoolName(school.name)}
              onMouseLeave={() => onSetHoveredSchoolName(null)}
            >
              <span>{school.name}</span>
              <TierTagSmall $tier={school.tier}>{TIER_LABEL[school.tier]}</TierTagSmall>
            </RepSchoolBtn>
          ))}
        </RepSchools>
      )}

      {selectedSchoolName && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              const s = cityUniversities.find((u) => u.name === selectedSchoolName);
              if (s) onViewDetail(s);
            }}
            style={{
              flex: 1, minHeight: 34, border: "1px solid rgba(200, 160, 130, 0.18)",
              borderRadius: 10, background: "linear-gradient(135deg, #c8967e, #d4b896)",
              color: "#fffdf8", cursor: "pointer", fontSize: 11, fontWeight: 800,
              fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
            }}
          >
            <BookOpen size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
            查看 {selectedSchoolName} 详情
          </button>
        </div>
      )}
    </CardShell>
  );
}
