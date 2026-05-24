import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Home, MapPin, Sparkles, MessageCircle, Search, ArrowLeft, BookOpen, Eye, X, Clock, HelpCircle } from "lucide-react";
import MapScene from "../components/map3d/MapScene";
import SchoolInfoCard from "../components/map3d/SchoolInfoCard";
import { SCHOOL_REC } from "../components/map3d/schoolRecommendations";
import { UNIVERSITIES, TIER_LABEL } from "../data/jiangsu-universities";
import type { Tier, University } from "../data/jiangsu-universities";
import { CITY_UNIVERSITY_COUNT, CITY_CENTERS } from "../components/map3d/mapTheme";

// ═══════════════════════  Styled components  ═══════════════════════

const Page = styled.div`
  position: relative; width: 100%; height: 100%; overflow: hidden;
  background:
    radial-gradient(ellipse at 52% 38%, rgba(195, 210, 235, 0.16) 0%, transparent 54%),
    radial-gradient(ellipse at 82% 22%, rgba(248, 215, 205, 0.18) 0%, transparent 40%),
    radial-gradient(ellipse at 20% 75%, rgba(245, 225, 215, 0.12) 0%, transparent 35%),
    linear-gradient(146deg, #fff9f1 0%, #fbf2ee 37%, #eef6ff 73%, #fff7df 100%);
`;

const TopBar = styled.header`
  position: absolute; z-index: 12; top: 26px; left: 38px; right: 38px;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  pointer-events: none;
  & > * { pointer-events: auto; }
  @media (max-width: 820px) { left: 14px; right: 14px; }
`;

const BrandBlock = styled.div`
  h1 {
    margin: 0; display: flex; align-items: center; gap: 10px;
    color: #3a2f28; font-size: clamp(20px, 1.9vw, 28px); font-weight: 700;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 0 rgba(255,255,247,0.8), 0 0 18px rgba(180,130,100,0.1);
  }
  h1 span {
    display: inline-grid; place-items: center; width: 32px; height: 32px;
    color: #c76b5e; font-size: 24px;
    filter: drop-shadow(0 6px 10px rgba(180,100,80,0.2));
  }
`;

const GlassButton = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; padding: 0 16px;
  border: 1px solid rgba(200,180,160,0.4); border-radius: 15px;
  background: rgba(255,252,247,0.72); color: #3a2f28;
  box-shadow: 0 12px 30px rgba(140,100,70,0.1), inset 0 1px 0 rgba(255,255,247,0.6);
  backdrop-filter: blur(16px); cursor: pointer;
  font-family: "Noto Serif SC","Songti SC","STSong","KaiTi",serif;
  font-weight: 700; font-size: 14px; white-space: nowrap;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(140,100,70,0.16), 0 0 18px rgba(180,120,90,0.1); }
`;

const sidePanelBase = `
  position: absolute; z-index: 8; top: 100px; bottom: 60px; width: 228px;
  background: rgba(255, 252, 247, 0.88); border-radius: 22px;
  border: 1px solid rgba(214, 175, 145, 0.25);
  box-shadow: 0 14px 38px rgba(178, 136, 106, 0.10), inset 0 1px 0 rgba(255,255,247,0.68);
  backdrop-filter: blur(14px); padding: 20px 16px;
  font-family: "Noto Sans SC","PingFang SC",sans-serif; overflow-y: auto;
  @media (max-width: 920px) { display: none; }
`;

const LeftPanel = styled.div` ${sidePanelBase} left: 18px; padding-bottom: 24px; `;
const RightPanel = styled.div` ${sidePanelBase} right: 18px; padding-bottom: 24px; `;

const PanelTitle = styled.div`
  font-family: "Noto Serif SC","Songti SC","KaiTi",serif;
  font-size: 14px; font-weight: 700; color: #3a2f28;
  margin-bottom: 12px; display: flex; align-items: center; gap: 7px;
  svg { color: #c76b5e; width: 16px; height: 16px; }
`;

// ── Left panel components ──

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

// ── Right panel components ──

const StatGrid = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
`;

const StatCard = styled.div`
  flex: 1 1 auto; min-width: 55px;
  background: rgba(255,250,246,0.7); border-radius: 10px; padding: 8px 10px;
  border: 1px solid rgba(200,170,150,0.18); text-align: center;
  .num { font-size: 20px; font-weight: 800; color: #3a2f28; font-family: "Noto Serif SC","Songti SC",serif; }
  .lbl { font-size: 9.5px; color: #8b7d73; margin-top: 1px; font-weight: 500; }
`;

const TierTagRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; justify-content: center;
`;

const TierTagSmall = styled.span<{ $tier: Tier }>`
  font-size: 9px; padding: 1px 6px; border-radius: 4px; font-weight: 600;
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

const PanelHint = styled.div`
  font-size: 11px; color: #8b7d73; margin-bottom: 12px; line-height: 1.5;
`;

const VersionBadge = styled.div`
  position: absolute; z-index: 12; right: 14px; bottom: 8px;
  color: rgba(120,90,70,0.25);
  font-family: "Noto Sans SC","PingFang SC",sans-serif; font-size: 10px; pointer-events: none;
`;

// ═══════════════════════  School Magazine Detail  ═══════════════════════

const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DetailOverlay = styled.div`
  position: absolute; inset: 0; z-index: 30;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(255,240,235,0.7) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 70%, rgba(235,240,255,0.5) 0%, transparent 50%),
    linear-gradient(175deg, #FDF8F4 0%, #F7F0E8 40%, #F1E8DC 100%);
  backdrop-filter: blur(16px);
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto; padding: 40px 20px 60px;
  animation: ${fadeIn} 0.25s ease-out;
  @media (max-width: 820px) { padding: 20px 12px 40px; }
`;

const MagazineCard = styled.div`
  background: rgba(255,252,247,0.92);
  border-radius: 28px;
  border: 1px solid rgba(200,170,150,0.22);
  box-shadow: 0 8px 50px rgba(140,100,70,0.10), 0 2px 12px rgba(180,150,130,0.06);
  padding: 40px 48px;
  max-width: 980px;
  width: 100%;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  position: relative;
  animation: ${fadeUp} 0.35s ease-out 0.08s both;
  @media (max-width: 820px) { padding: 28px 24px; }
`;

const MagazineClose = styled.button`
  position: absolute; top: 20px; right: 20px;
  border: none; background: rgba(200,170,150,0.12); border-radius: 50%;
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #8b7d73;
  &:hover { background: rgba(200,150,130,0.25); color: #3a2f28; }
  svg { width: 16px; height: 16px; }
`;

// ── Hero ──

const HeroSection = styled.div`
  margin-bottom: 32px; padding-bottom: 24px;
  border-bottom: 1px solid rgba(200,170,150,0.15);
`;

const HeroName = styled.h2`
  margin: 0 0 8px 0;
  font-family: "Noto Serif SC","Songti SC","KaiTi",serif;
  font-size: 28px; font-weight: 800; color: #2a1f18;
  letter-spacing: 0.03em;
  @media (max-width: 820px) { font-size: 22px; }
`;

const HeroMeta = styled.div`
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 12px; font-size: 13px; color: #6b5d53;
  svg { width: 14px; height: 14px; color: #b0a090; }
`;

const HeroTagline = styled.p`
  margin: 0; font-size: 15px; line-height: 1.7; color: #5a4a3a;
  font-family: "Noto Serif SC","Songti SC",serif;
  font-style: italic;
  @media (max-width: 820px) { font-size: 13px; }
`;

// ── Section ──

const MagazineSection = styled.div`
  margin-bottom: 32px;
`;

const SectionHeading = styled.h3`
  margin: 0 0 14px 0;
  font-family: "Noto Serif SC","Songti SC","KaiTi",serif;
  font-size: 17px; font-weight: 700; color: #3a2f28;
  display: flex; align-items: center; gap: 8px;
  svg { width: 18px; height: 18px; color: #c76b5e; }
`;

// ── Quick-fact mini cards ──

const FactCardGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const FactCard = styled.div`
  background: rgba(255,250,246,0.7); border-radius: 14px; padding: 14px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  text-align: center;
  .fl { font-size: 10px; color: #b0a090; font-weight: 500; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .fv { font-size: 16px; font-weight: 700; color: #3a2f28; }
  .fs { font-size: 11px; color: #6b5d53; margin-top: 1px; }
`;

// ── Fit card (适合怎样的你) ──

const FitCardGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
`;

const FitCard = styled.div`
  background: rgba(255,250,246,0.6); border-radius: 14px; padding: 14px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  font-size: 12px; line-height: 1.6; color: #5a4a3a;
  .ficon { font-size: 20px; margin-bottom: 6px; display: block; }
  .ftitle { font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #3a2f28; }
`;

// ── Life card (校园生活) ──

const LifeGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

const LifeCard = styled.div`
  background: rgba(255,250,246,0.6); border-radius: 14px; padding: 14px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  font-size: 11px; line-height: 1.6; color: #5a4a3a;
  .licon { font-size: 18px; margin-bottom: 4px; display: block; }
  .ltitle { font-weight: 700; font-size: 12px; margin-bottom: 2px; color: #3a2f28; }
`;

// ── Experience / QA cards ──

const CardList = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const ContentCard = styled.div`
  background: rgba(255,250,246,0.55); border-radius: 12px; padding: 12px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  font-size: 12px; line-height: 1.6; color: #5a4a3a;
  .ctitle { font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #3a2f28; }
  .cmeta { font-size: 10px; color: #a09080; margin-top: 4px; }
`;

// ── Bottom actions ──

const ActionBar = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-top: 32px; padding-top: 20px;
  border-top: 1px solid rgba(200,170,150,0.15);
`;

const MgzBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 14px;
  font-size: 13px; font-weight: 700;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  cursor: pointer;
  border: 1.5px solid ${({ $primary }) => $primary ? "rgba(200,130,110,0.35)" : "rgba(200,170,150,0.25)"};
  background: ${({ $primary }) => $primary ? "rgba(240,138,120,0.10)" : "rgba(255,252,247,0.6)"};
  color: ${({ $primary }) => $primary ? "#b04a3a" : "#4a3a2a"};
  transition: all 0.15s ease;
  &:hover {
    background: ${({ $primary }) => $primary ? "rgba(240,138,120,0.18)" : "rgba(200,170,150,0.20)"};
    border-color: rgba(200,150,130,0.45);
  }
  svg { width: 15px; height: 15px; }
`;

// ── City-specific content helpers ──

function cityLifeNote(city: string): { dorm: string; food: string; transit: string; life: string } {
  const notes: Record<string, { dorm: string; food: string; transit: string; life: string }> = {
    "南京": { dorm: "多数宿舍配有空调和独立卫浴，仙林、江宁校区条件较新。", food: "从南大食堂到东大九龙湖，高校美食密度全国前列。", transit: "地铁网络覆盖主城区，共享单车密集，通勤方便。", life: "省会资源丰富，实习机会多，文化场馆遍布全城。" },
    "苏州": { dorm: "独墅湖高教区宿舍较新，部分有阳台和独立卫生间。", food: "苏帮菜精致，高校食堂融合南北口味。", transit: "地铁+公交+有轨电车，毗邻上海交通便利。", life: "经济发达，外企多，园林与都市生活完美融合。" },
    "无锡": { dorm: "江南大学蠡湖校区宿舍条件优良，多为四人间。", food: "太湖三白、无锡排骨，食堂价格实惠。", transit: "地铁1-4号线串联主城，公交线路密集。", life: "太湖之滨生活舒适，物联网产业聚集地。" },
    "常州": { dorm: "常州大学武进校区宿舍较新，配备空调。", food: "食堂兼顾南北口味，周边小吃街选择多。", transit: "BRT快速公交+地铁，城市规模适中通勤方便。", life: "制造业强市，生活成本低，城市节奏舒适。" },
    "徐州": { dorm: "矿大南湖校区环境优美，宿舍配套齐全。", food: "徐州菜量大实惠，烧烤和地锅鸡是特色。", transit: "地铁+公交覆盖，淮海经济区中心城市。", life: "北方城市氛围，物价友好，本地生活气息浓厚。" },
    "南通": { dorm: "南通大学主校区宿舍较新，多为四人间。", food: "江海风味，海鲜新鲜，食堂性价比高。", transit: "公交为主，地铁在建，城市不大出行方便。", life: "滨江临海，城市干净，基础教育强市。" },
    "扬州": { dorm: "扬州大学瘦西湖校区环境优美，宿舍条件适中。", food: "淮扬菜发源地，从食堂到社会餐饮皆是美食。", transit: "公交覆盖全城，城市规模精致，骑行即可。", life: "历史文化名城，生活节奏慢，宜居度高。" },
    "盐城": { dorm: "宿舍以四人间为主，部分新校区条件较好。", food: "苏北风味，食堂价格实惠，分量足。", transit: "公交+BRT，城市东西向发展，出行便利。", life: "沿海湿地城市，空气质量好，生活成本低。" },
    "镇江": { dorm: "江苏大学本部宿舍条件良好，部分宿舍有独卫。", food: "锅盖面、肴肉是特色，高校食堂种类丰富。", transit: "公交+共享单车，城市紧凑通勤时间短。", life: "山水花园城市，毗邻南京，宜居宜学。" },
    "淮安": { dorm: "淮阴工学院、淮阴师范学院宿舍条件中等。", food: "淮扬菜正宗，食堂价格亲民。", transit: "公交为主，城市规模适中出行方便。", life: "运河之都，生活节奏慢，物价友好。" },
    "泰州": { dorm: "泰州学院宿舍基本配套齐全，部分校区较新。", food: "泰州早茶文化浓厚，食堂选择丰富。", transit: "公交覆盖，城市不大出行便捷。", life: "医药产业聚集地，城市安静宜居。" },
    "宿迁": { dorm: "宿迁学院宿舍条件中等，基本配套完善。", food: "苏北家常口味，食堂实惠。", transit: "公交+共享单车，城市紧凑。", life: "新兴城市，生活成本省内最低之一。" },
    "连云港": { dorm: "江苏海洋大学宿舍配套齐全，部分可观海。", food: "海鲜特色突出，食堂种类丰富。", transit: "BRT+公交，海滨城市出行方便。", life: "港口城市，空气清新，山海风光独特。" },
  };
  return notes[city] ?? { dorm: "宿舍配套完善，多为四人间，有空调。", food: "食堂选择丰富，兼顾各地口味，价格实惠。", transit: "城市公共交通覆盖，出行方便。", life: "生活便利，校园周边配套齐全。" };
}

function SchoolDetailOverlay({ schoolName, onClose }: { schoolName: string; onClose: () => void }) {
  const school = useMemo(() => UNIVERSITIES.find((u) => u.name === schoolName) ?? null, [schoolName]);

  if (!school) return null;

  const life = cityLifeNote(school.city);
  const tierLabel = TIER_LABEL[school.tier];
  const tierDesc = school.tier === "985" ? "顶尖研究型大学"
    : school.tier === "211" ? "重点建设高校"
    : school.tier === "dual" ? "双一流学科建设高校"
    : "省属本科院校";

  const recText = SCHOOL_REC[school.name] ?? `位于${school.city}的一所优秀本科院校。`;

  return (
    <DetailOverlay onClick={onClose}>
      <MagazineCard onClick={(e) => e.stopPropagation()}>
        <MagazineClose onClick={onClose}><X size={16} /></MagazineClose>

        {/* ── Hero ── */}
        <HeroSection>
          <HeroName>{school.name}</HeroName>
          <HeroMeta>
            <MapPin size={14} /> {school.city}市
            <TierBadge $tier={school.tier}>{tierLabel}</TierBadge>
            {school.founded && <><Clock size={14} /> {school.founded} 年建校</>}
          </HeroMeta>
          <HeroTagline>{recText}</HeroTagline>
        </HeroSection>

        {/* ── 学校速览 ── */}
        <MagazineSection>
          <SectionHeading>📋 学校速览</SectionHeading>
          <FactCardGrid>
            <FactCard>
              <div className="fl">所在城市</div>
              <div className="fv">{school.city}</div>
              <div className="fs">江苏省</div>
            </FactCard>
            <FactCard>
              <div className="fl">学校层级</div>
              <div className="fv">{tierLabel}</div>
              <div className="fs">{tierDesc}</div>
            </FactCard>
            {school.founded && (
              <FactCard>
                <div className="fl">建校时间</div>
                <div className="fv">{school.founded}</div>
                <div className="fs">{new Date().getFullYear() - school.founded} 年办学历史</div>
              </FactCard>
            )}
            <FactCard>
              <div className="fl">学校类型</div>
              <div className="fv">本科院校</div>
              <div className="fs">全日制普通高校</div>
            </FactCard>
          </FactCardGrid>
        </MagazineSection>

        {/* ── 适合怎样的你 ── */}
        <MagazineSection>
          <SectionHeading>🎯 适合怎样的你</SectionHeading>
          <FitCardGrid>
            <FitCard>
              <span className="ficon">📚</span>
              <div className="ftitle">喜欢安静校园环境</div>
              {school.city}高校校园绿树成荫、学习氛围浓厚，适合能静下心、专注学业的学生。图书馆和自习室资源充足，能给你一个安心的学习空间。
            </FitCard>
            <FitCard>
              <span className="ficon">💡</span>
              <div className="ftitle">
                {school.tier === "985" || school.tier === "211" ? "关注学术研究与深造" : "关注应用型专业与就业"}
              </div>
              {school.tier === "985" || school.tier === "211"
                ? "学校学术资源丰富，保研率较高，适合有读研读博规划、想在学术道路上走得更远的学生。"
                : "学校注重实践教学和产教融合，专业设置贴近市场需求，适合毕业后直接就业或创业的学生。"}
            </FitCard>
            <FitCard>
              <span className="ficon">🏙️</span>
              <div className="ftitle">想在本地城市稳定发展</div>
              {school.city}是江苏省{
                school.city === "南京" ? "省会，就业机会丰富，" :
                school.city === "苏州" ? "经济强市，外企和科技企业密集，" :
                "重要城市，"
              }校友网络遍布本地，毕业后留{
                school.city
              }发展优势明显。
            </FitCard>
          </FitCardGrid>
        </MagazineSection>

        {/* ── 校园生活 ── */}
        <MagazineSection>
          <SectionHeading>🏫 校园生活</SectionHeading>
          <LifeGrid>
            <LifeCard>
              <span className="licon">🛏️</span>
              <div className="ltitle">宿舍</div>
              {life.dorm}
            </LifeCard>
            <LifeCard>
              <span className="licon">🍽️</span>
              <div className="ltitle">食堂</div>
              {life.food}
            </LifeCard>
            <LifeCard>
              <span className="licon">🚌</span>
              <div className="ltitle">交通</div>
              {life.transit}
            </LifeCard>
            <LifeCard>
              <span className="licon">🛍️</span>
              <div className="ltitle">周边生活</div>
              {life.life}
            </LifeCard>
          </LifeGrid>
        </MagazineSection>

        {/* ── 学长学姐经验 ── */}
        <MagazineSection>
          <SectionHeading>💬 学长学姐经验</SectionHeading>
          <CardList>
            <ContentCard>
              <div className="ctitle">在{school.city}上大学是怎样的体验？</div>
              <div>
                {school.city}是一座{
                  school.city === "南京" ? "历史与现代交融的省会城市，四季分明，梧桐树下的校园充满了人文气息。" :
                  school.city === "苏州" ? "园林之城，古典与现代交织，在这里读书有一种在画中行走的感觉。" :
                  school.city === "无锡" ? "太湖明珠，城市不大但精致宜居，学习之余可以去蠡湖边散步。" :
                  school.city === "徐州" ? "北方气息浓厚的城市，淮海经济区中心，物价友好生活便利。" :
                  school.city === "南通" ? "滨江临海的城市，干净整洁，有'近代第一城'的美誉。" :
                  school.city === "扬州" ? "历史文化名城，早上皮包水晚上水包皮，生活幸福感很高。" :
                  "充满生活气息的城市，节奏不紧不慢，适合安心读书。"
                }
                在校生活体验很好，老师负责，同学友善。
              </div>
              <div className="cmeta">💬 24 条讨论</div>
            </ContentCard>
            <ContentCard>
              <div className="ctitle">{school.city}高校食堂红黑榜</div>
              <div>食堂整体水平不错，价格实惠。{school.name}的食堂在本地高校中口碑较好，推荐尝试招牌菜。</div>
              <div className="cmeta">💬 18 条讨论</div>
            </ContentCard>
          </CardList>
        </MagazineSection>

        {/* ── 新生问答 ── */}
        <MagazineSection>
          <SectionHeading>❓ 新生问答</SectionHeading>
          <CardList>
            <ContentCard>
              <div className="ctitle">Q: {school.city}生活费一个月多少合适？</div>
              <div>A: 在{school.city}上学，一个月生活费大约{
                school.city === "南京" || school.city === "苏州" ? "1500-2500元" :
                school.city === "徐州" || school.city === "宿迁" || school.city === "连云港" ? "1000-1800元" :
                "1200-2000元"
              }。食堂一顿饭8-15元，加上水果零食、日用品、偶尔外出聚餐，合理规划可以过得不错。</div>
              <div className="cmeta">12 条回答</div>
            </ContentCard>
            <ContentCard>
              <div className="ctitle">Q: {school.city}转专业难不难？</div>
              <div>A: {
                school.tier === "985" || school.tier === "211"
                  ? "重点高校的转专业政策相对规范，一般大一下学期可以申请，需要绩点达到一定要求并通过考核。各专业名额有限，热门专业竞争较大。"
                  : "大多数学校在大一结束时开放转专业申请，需要绩点和面试考核。建议入学后尽早了解目标专业的具体要求。"
              }</div>
              <div className="cmeta">8 条回答</div>
            </ContentCard>
          </CardList>
        </MagazineSection>

        {/* ── Actions ── */}
        <ActionBar>
          <MgzBtn $primary onClick={onClose}>
            <ArrowLeft size={15} /> 返回地图
          </MgzBtn>
          <MgzBtn>
            <MessageCircle size={15} /> 查看相关经验
          </MgzBtn>
          <MgzBtn>
            <HelpCircle size={15} /> 我要提问
          </MgzBtn>
        </ActionBar>
      </MagazineCard>
    </DetailOverlay>
  );
}

// ═══════════════════════  Page Component  ═══════════════════════

export default function JiangsuMap3D() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Restore state from URL params ──
  const urlCity = searchParams.get("city") ?? null;
  const urlSchoolId = searchParams.get("school") ?? null;
  const urlView = searchParams.get("view") ?? null;
  const currentSearch = searchParams.toString();

  // Resolve school id for URL restoration
  const restoredSchool = useMemo(() => {
    if (!urlSchoolId) return null;
    const s = UNIVERSITIES.find((u) => u.id === urlSchoolId);
    return s ?? null;
  }, [urlSchoolId]);

  const selectedName = urlCity ?? restoredSchool?.city ?? null;
  const selectedSchoolName = restoredSchool?.name ?? null;

  // ── Lifted state (shared between map and panels) ──
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [hoveredSchoolName, setHoveredSchoolName] = useState<string | null>(null);
  const [showAllPins, setShowAllPins] = useState(false);
  const [leftSearch, setLeftSearch] = useState("");

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
    if (school) {
      params.set("school", school.id);
    }
    if (view === "detail" && school) {
      params.set("view", "detail");
    }
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

  const filteredSchools = useMemo(() => {
    if (!leftSearch.trim()) return cityUniversities;
    const q = leftSearch.toLowerCase();
    return cityUniversities.filter((u) => u.name.toLowerCase().includes(q) || u.city.includes(q));
  }, [cityUniversities, leftSearch]);

  // City list sorted by university count
  const hotCities = useMemo(
    () => CITY_CENTERS
      .map((c) => ({ name: c.name, count: CITY_UNIVERSITY_COUNT[c.name] ?? 1 }))
      .sort((a, b) => b.count - a.count),
    [],
  );

  // ── Left panel content ──
  const leftPanel = selectedName ? (
    // ═══ City state: university list ═══
    <>
      <BackBtn onClick={() => { updateSelectionParams(null, null); setLeftSearch(""); }}>
        <ArrowLeft size={14} /> 返回全省视图
      </BackBtn>
      <PanelTitle><BookOpen size={16} /> {selectedName}市高校</PanelTitle>
      <div style={{ fontSize: 11, color: "#8b7d73", marginBottom: 8 }}>
        共 <span style={{ fontWeight: 700, color: "#5a4a3a" }}>{cityUniversities.length}</span> 所本科院校
      </div>

      <SearchInput>
        <Search size={14} />
        <input
          placeholder={`搜索${selectedName}高校…`}
          value={leftSearch}
          onChange={(e) => setLeftSearch(e.target.value)}
        />
      </SearchInput>

      {/* Show-all toggle for provincial schools */}
      {cityUniversities.some((u) => u.tier === "provincial") && (
        <label style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
          fontSize: 10, color: "#8b7d73", cursor: "pointer",
          fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
        }}>
          <input
            type="checkbox"
            checked={showAllPins}
            onChange={(e) => setShowAllPins(e.target.checked)}
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
            onClick={() => handleSelectSchool(u.name)}
            onMouseEnter={() => setHoveredSchoolName(u.name)}
            onMouseLeave={() => setHoveredSchoolName(null)}
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
  ) : (
    // ═══ Province state: city overview ═══
    <>
      <PanelTitle><MapPin size={16} /> 探索江苏高校</PanelTitle>
      <PanelHint>覆盖 <span style={{ fontWeight: 700, color: "#5a4a3a" }}>13</span> 座城市 · <span style={{ fontWeight: 700, color: "#5a4a3a" }}>78</span> 所本科院校</PanelHint>
      <PanelHint>点击地图城市，或从下面选择城市，查看高校列表。</PanelHint>

      <SearchInput>
        <Search size={14} />
        <input
          placeholder="搜索城市或高校…"
          value={leftSearch}
          onChange={(e) => setLeftSearch(e.target.value)}
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
              onMouseEnter={() => setHoveredName(c.name)}
              onMouseLeave={() => setHoveredName(null)}
              onClick={() => {
                updateSelectionParams(c.name, null);
                setShowAllPins(false);
              }}
            >
              {c.name} · {c.count}所
            </CityChip>
          ))}
      </CityListWrap>
    </>
  );

  // ── Right panel content ──
  const rightPanel = selectedName ? (
    // ═══ City state: overview ═══
    <>
      <PanelTitle><Sparkles size={16} /> {selectedName}市概览</PanelTitle>

      <StatGrid>
        <StatCard>
          <div className="num">{cityUniversities.length}</div>
          <div className="lbl">本科院校</div>
        </StatCard>
      </StatGrid>
      <TierTagRow>
        {tierCounts["985"] > 0 && <TierTagSmall $tier="985">985 × {tierCounts["985"]}</TierTagSmall>}
        {tierCounts["211"] > 0 && <TierTagSmall $tier="211">211 × {tierCounts["211"]}</TierTagSmall>}
        {tierCounts.dual > 0 && <TierTagSmall $tier="dual">双一流 × {tierCounts.dual}</TierTagSmall>}
        {tierCounts.provincial > 0 && <TierTagSmall $tier="provincial">本科 × {tierCounts.provincial}</TierTagSmall>}
      </TierTagRow>

      <SectionLabel>
        <MessageCircle size={13} /> 热门校园经验
      </SectionLabel>
      <ExpCard>
        <div className="title">在{selectedName}上大学是怎样的体验？</div>
        <div className="meta">24 条讨论</div>
      </ExpCard>
      <ExpCard>
        <div className="title">{selectedName}高校食堂红黑榜</div>
        <div className="meta">18 条讨论</div>
      </ExpCard>

      <SectionLabel>新生最关心</SectionLabel>
      <ExpCard>
        <div className="title">{selectedName}生活费一个月多少合适？</div>
        <div className="meta">12 条回答</div>
      </ExpCard>
      <ExpCard>
        <div className="title">{selectedName}转专业难不难？</div>
        <div className="meta">8 条回答</div>
      </ExpCard>

      {/* School selected module */}
      {selectedSchoolName && (
        <>
          <SectionLabel>
            <Eye size={13} /> 当前选择
          </SectionLabel>
          <ExpCard style={{ borderColor: "rgba(240,138,120,0.25)", background: "rgba(255,248,244,0.75)" }}>
            <div className="title" style={{ color: "#b04a3a" }}>{selectedSchoolName}</div>
            <div className="meta" style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 5, fontSize: 10 }}>
              <span style={{ cursor: "pointer", color: "#6b5d53" }}
                onClick={() => {
                  const s = UNIVERSITIES.find((u) => u.name === selectedSchoolName);
                  if (s) handleViewDetail(s);
                }}>
                📖 查看校园详情
              </span>
              <span style={{ color: "#a09080" }}>💬 查看相关经验</span>
              <span style={{ color: "#a09080" }}>🙋 向学长学姐提问</span>
            </div>
          </ExpCard>
        </>
      )}
    </>
  ) : (
    // ═══ Province state: Liya recommends ═══
    <>
      <PanelTitle><Sparkles size={16} /> 莉雅推荐</PanelTitle>
      <PanelHint>点击城市，我会帮你整理高校和校园经验 ✨</PanelHint>

      <SectionLabel>
        <MessageCircle size={13} /> 热门校园经验
      </SectionLabel>
      <ExpCard>
        <div className="title">南大宿舍体验：住得好才能学得好</div>
        <div className="meta">南京大学 · 💬 24 条讨论</div>
      </ExpCard>
      <ExpCard>
        <div className="title">东大九龙湖校区的隐藏美食地图</div>
        <div className="meta">东南大学 · 💬 18 条讨论</div>
      </ExpCard>

      <SectionLabel>新生最关心</SectionLabel>
      <ExpCard>
        <div className="title">南京上学一个月生活费多少？</div>
        <div className="meta">24 条回答</div>
      </ExpCard>
      <ExpCard>
        <div className="title">江苏转专业最灵活的大学是哪些？</div>
        <div className="meta">18 条回答</div>
      </ExpCard>
    </>
  );

  const isDetailView = urlView === "detail";

  return (
    <Page>
      {/* Top bar — hidden in detail view */}
      {!isDetailView && (
        <TopBar>
          <BrandBlock>
            <h1><span>✿</span>江苏高校探索沙盘</h1>
          </BrandBlock>
          <GlassButton onClick={() => navigate("/home")}>
            <Home size={16} /> 返回首页
          </GlassButton>
        </TopBar>
      )}

      {/* Panels — hidden in detail view */}
      {!isDetailView && (
        <>
          <LeftPanel>{leftPanel}</LeftPanel>
          <RightPanel>{rightPanel}</RightPanel>
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

      {/* School info card — appears when school selected, not in detail view */}
      {selectedSchoolName && !isDetailView && (
        <SchoolInfoCard
          schoolName={selectedSchoolName}
          onClose={() => updateSelectionParams(selectedName, null)}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* School detail overlay */}
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

      {!isDetailView && <VersionBadge>v9 · 校园探索沙盘</VersionBadge>}
    </Page>
  );
}
