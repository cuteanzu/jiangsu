import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Home,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { TIER_LABEL, UNIVERSITIES } from "../data/jiangsu-universities";
import type { Tier, University } from "../data/jiangsu-universities";
import { cityRouteParam, normalizeCityParam } from "../utils/jiangsuPresentation";
import { experiencesForSchool, qaForSchool, CATEGORY_META } from "../data/mock-content";
import mapData from "../assets/map/jiangsu-paths.json";
import DeskPet from "../DeskPet";

type ViewMode = "province" | "city" | "school-preview" | "school-detail";

interface CitySummary {
  city: string;
  displayName: string;
  universities: University[];
  counts: Record<Tier, number>;
  total: number;
}

interface Point {
  x: number;
  y: number;
}

const ASSETS = {
  province: "/jiangsu/province-stage.png",
  city: "/jiangsu/city-stage.png",
  schoolHero: "/jiangsu/school-hero.png",
  schoolScenery: "/jiangsu/school-scenery.png",
};

const CITY_ORDER = ["南京", "苏州", "徐州", "无锡", "常州", "南通", "扬州", "盐城", "镇江", "淮安", "泰州", "宿迁", "连云港"];
const TIER_ORDER: Tier[] = ["985", "211", "dual", "provincial"];
const EMPTY_UNIVERSITIES: University[] = [];

const provinceLabelPositions: Record<string, Point> = {
  徐州: { x: 38, y: 23 },
  连云港: { x: 61, y: 14 },
  宿迁: { x: 52, y: 32 },
  盐城: { x: 75, y: 38 },
  淮安: { x: 59, y: 43 },
  扬州: { x: 68, y: 57 },
  南京: { x: 48, y: 69 },
  镇江: { x: 61, y: 67 },
  泰州: { x: 72, y: 70 },
  常州: { x: 68, y: 78 },
  无锡: { x: 76, y: 79 },
  苏州: { x: 84, y: 84 },
  南通: { x: 86, y: 62 },
};

const featuredSchoolPositions: Record<string, Point> = {
  nju: { x: 58, y: 49 },
  seu: { x: 49, y: 40 },
  nuaa: { x: 39, y: 48 },
  njust: { x: 62, y: 36 },
  hhu: { x: 47, y: 58 },
  njau: { x: 67, y: 55 },
  cpu: { x: 70, y: 66 },
  njnu: { x: 42, y: 64 },
  nuist: { x: 43, y: 32 },
  njupt: { x: 70, y: 41 },
  njfu: { x: 65, y: 49 },
  njmu: { x: 75, y: 50 },
  njucm: { x: 76, y: 60 },
  njupt2: { x: 53, y: 70 },
  njue: { x: 61, y: 64 },
  njaudit: { x: 50, y: 33 },
  njit: { x: 57, y: 61 },
  njxzc: { x: 72, y: 31 },
  njty: { x: 52, y: 53 },
  nua: { x: 45, y: 71 },
  njpu: { x: 68, y: 72 },
  jssnu: { x: 39, y: 59 },
  njtech: { x: 59, y: 29 },
  nju_jl: { x: 36, y: 39 },
  seu_cx: { x: 64, y: 68 },
  nuaa_jc: { x: 44, y: 76 },
};

const tierMeta: Record<Tier, { label: string; color: string; soft: string; icon: string }> = {
  "985": { label: "985高校", color: "#c44545", soft: "rgba(196,69,69,0.14)", icon: "盾" },
  "211": { label: "211高校", color: "#7b5ea7", soft: "rgba(123,94,167,0.13)", icon: "冠" },
  dual: { label: "双一流高校", color: "#4a8eb5", soft: "rgba(74,142,181,0.13)", icon: "星" },
  provincial: { label: "本科高校", color: "#5a9e7c", soft: "rgba(90,158,124,0.12)", icon: "校" },
};

function createEmptyCounts(): Record<Tier, number> {
  return { "985": 0, "211": 0, dual: 0, provincial: 0 };
}

function buildCitySummaries(): CitySummary[] {
  const grouped = new Map<string, University[]>();
  UNIVERSITIES.forEach((university) => {
    const list = grouped.get(university.city) ?? [];
    list.push(university);
    grouped.set(university.city, list);
  });

  return CITY_ORDER.map((city) => {
    const universities = grouped.get(city) ?? [];
    const counts = createEmptyCounts();
    universities.forEach((university) => {
      counts[university.tier] += 1;
    });

    return {
      city,
      displayName: `${city}市`,
      universities: sortUniversities(universities),
      counts,
      total: universities.length,
    };
  });
}

function sortUniversities(universities: University[]): University[] {
  return [...universities].sort((a, b) => {
    const tierDiff = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name, "zh-Hans-CN");
  });
}

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function viewModeOf(city: string | null, school: University | null, view: string | null): ViewMode {
  if (!city) return "province";
  if (school && view === "detail") return "school-detail";
  if (school) return "school-preview";
  return "city";
}

function tierLabel(university: University) {
  return TIER_LABEL[university.tier];
}

function getMarkerPosition(university: University, index: number, total: number): Point {
  const featured = featuredSchoolPositions[university.id];
  if (featured) return featured;
  if (total <= 1) return { x: 62, y: 52 };

  const columns = Math.min(4, Math.ceil(Math.sqrt(total + 1)));
  const rows = Math.ceil(total / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const x = 53 + (column - (columns - 1) / 2) * 12;
  const y = 47 + (row - (rows - 1) / 2) * 13;

  return {
    x: Math.max(36, Math.min(78, x)),
    y: Math.max(28, Math.min(76, y)),
  };
}

const drift = keyframes`
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
  16% { opacity: 0.72; }
  100% { transform: translate3d(var(--petal-x), 106vh, 0) rotate(280deg); opacity: 0; }
`;

const pulseRing = keyframes`
  0% { transform: translate(-50%, 50%) scale(0.76); opacity: 0.64; }
  100% { transform: translate(-50%, 50%) scale(1.9); opacity: 0; }
`;

const beamPulse = keyframes`
  0%, 100% { opacity: 0.55; transform: translateX(-50%) scaleY(0.92); }
  50% { opacity: 0.98; transform: translateX(-50%) scaleY(1.04); }
`;

const riseIn = keyframes`
  0% { opacity: 0; translate: 0 24px; }
  100% { opacity: 1; translate: 0 0; }
`;

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #3a2f28;
  background:
    radial-gradient(circle at 86% 11%, rgba(255,255,245,0.9), transparent 18%),
    radial-gradient(circle at 16% 90%, rgba(220,185,160,0.22), transparent 26%),
    linear-gradient(135deg, #fdf7f0 0%, #f5ebe0 42%, #faf0e8 100%);
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;
  perspective: 1200px;
`;

const PetalLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;

  span {
    position: absolute;
    top: -7vh;
    left: var(--petal-left);
    width: var(--petal-size);
    height: calc(var(--petal-size) * 0.64);
    border-radius: 80% 0 80% 0;
    background: linear-gradient(135deg, rgba(255, 116, 170, 0.85), rgba(255, 221, 236, 0.56));
    filter: blur(var(--petal-blur));
    animation: ${drift} var(--petal-duration) linear infinite;
    animation-delay: var(--petal-delay);
    box-shadow: 0 0 18px rgba(255, 122, 177, 0.28);
  }
`;

const StageImage = styled.div<{ $asset: string; $mode: ViewMode }>`
  position: absolute;
  inset: -2.8vw;
  z-index: 1;
  background-image:
    linear-gradient(90deg, rgba(238, 247, 255, 0.2), rgba(255, 226, 241, 0.14)),
    url(${(p) => p.$asset});
  background-size: cover;
  background-position: center;
  opacity: ${(p) => (p.$mode === "school-detail" ? 1 : 0.96)};
  filter: saturate(1.03) contrast(1.01);
  transform:
    perspective(1200px)
    rotateX(var(--scene-rx, 0deg))
    rotateY(var(--scene-ry, 0deg))
    scale(var(--scene-scale, 1.03));
  transform-origin: center;
  transition: opacity 0.35s ease, transform 0.18s ease-out, filter 0.35s ease;
  will-change: transform;

  ${(p) =>
    p.$mode === "school-detail" &&
    css`
      filter: saturate(1.05) blur(1px);
      opacity: 1;
    `}

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at var(--shine-x, 86%) var(--shine-y, 12%), rgba(255, 255, 255, 0.58), transparent 19%),
      linear-gradient(90deg, rgba(222, 238, 255, 0.22), rgba(255, 235, 246, 0.16));
    transition: background 0.2s ease-out;
  }
`;

const TopBar = styled.header`
  position: absolute;
  z-index: 10;
  top: 26px;
  left: 38px;
  right: 38px;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) auto;
  align-items: start;
  gap: 20px;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }

  @media (max-width: 820px) {
    left: 18px;
    right: 18px;
    grid-template-columns: 1fr auto;
  }
`;

const BrandBlock = styled.div`
  display: grid;
  gap: 9px;

  h1 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #3a2f28;
    font-size: clamp(25px, 2.65vw, 40px);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-shadow: 0 2px 0 rgba(255,255,247,0.8), 0 0 22px rgba(180,130,100,0.12);
  }

  h1 span {
    display: inline-grid;
    place-items: center;
    width: 38px;
    height: 38px;
    color: #c76b5e;
    font-size: 30px;
    letter-spacing: 0;
    filter: drop-shadow(0 8px 14px rgba(180,100,80,0.2));
  }

  p {
    margin: 0 0 0 66px;
    color: rgba(60,42,32,0.6);
    font-size: clamp(14px, 1.2vw, 18px);
    letter-spacing: 0.08em;
  }

  @media (max-width: 820px) {
    h1 {
      font-size: 25px;
    }

    h1 span {
      width: 32px;
      height: 32px;
      font-size: 25px;
    }

    p {
      margin-left: 44px;
      font-size: 12px;
    }
  }
`;

const TopActions = styled.div`
  justify-self: end;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const GlassButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid rgba(220,200,180,0.4);
  border-radius: 17px;
  background: ${(p) => (p.$primary ? "rgba(190,100,80,0.88)" : "rgba(255,252,247,0.72)")};
  color: ${(p) => (p.$primary ? "#fff" : "#3a2f28")};
  box-shadow: 0 14px 36px rgba(140,100,70,0.1), inset 0 1px 0 rgba(255,255,247,0.6);
  backdrop-filter: blur(20px);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  white-space: nowrap;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 42px rgba(140,100,70,0.16), 0 0 22px rgba(180,120,90,0.1);
  }
`;

const Breadcrumb = styled.div`
  position: absolute;
  z-index: 10;
  top: 88px;
  left: 70px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #27316c;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;

  @media (max-width: 820px) {
    left: 22px;
    top: 86px;
    font-size: 12px;
  }
`;

const CrumbButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;

  &:hover {
    color: #c76b5e;
  }
`;

const FloatingPanel = styled.aside<{ $variant?: "province" | "city" }>`
  position: absolute;
  z-index: 9;
  top: ${(p) => (p.$variant === "city" ? "140px" : "152px")};
  left: 34px;
  bottom: 58px;
  width: ${(p) => (p.$variant === "city" ? "336px" : "300px")};
  overflow: hidden;
  border: 1px solid rgba(220,200,180,0.35);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255,252,247,0.72), rgba(250,242,232,0.5)),
    radial-gradient(circle at 16% 0%, rgba(190,130,100,0.12), transparent 34%);
  box-shadow: 0 26px 80px rgba(140,100,70,0.14), inset 0 1px 0 rgba(255,255,247,0.72);
  backdrop-filter: blur(22px) saturate(120%);

  @media (max-width: 960px) {
    top: auto;
    left: 16px;
    right: 16px;
    bottom: 18px;
    width: auto;
    max-height: 46vh;
  }
`;

const PanelInner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: 18px 18px 12px;
`;

const SearchBox = styled.label`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(116, 136, 204, 0.15);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  color: rgba(64, 75, 141, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);

  input {
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #3a2f28;
    font: inherit;
    font-size: 13px;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }

  input::placeholder {
    color: rgba(44, 54, 104, 0.46);
  }
`;

const ClearButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  background: rgba(190, 110, 85, 0.12);
  color: #c76b5e;
  cursor: pointer;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 14px 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(190, 110, 85, 0.28);
    border-radius: 6px;
  }
`;

const PanelSectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 14px 4px 8px;
  color: #3a2f28;
  font-size: 15px;
  font-weight: 800;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;

  span {
    color: #c76b5e;
    font-weight: 700;
    font-size: 12px;
  }
`;

const CityRow = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  min-height: 34px;
  padding: 5px 8px;
  border: 0;
  border-radius: 10px;
  background: ${(p) => (p.$active ? "rgba(255, 79, 131, 0.13)" : "transparent")};
  color: #3a2f28;
  cursor: pointer;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  transition: background 0.18s ease, transform 0.18s ease;

  strong {
    font-weight: 800;
  }

  span {
    color: #c76b5e;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-weight: 800;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.58);
    transform: translateX(2px);
  }
`;

const SchoolRow = styled.button<{ $active?: boolean; $color: string }>`
  width: 100%;
  display: grid;
  grid-template-columns: 26px 1fr auto;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  margin: 4px 0;
  padding: 7px 9px;
  border: 1px solid ${(p) => (p.$active ? p.$color + "55" : "transparent")};
  border-radius: 13px;
  background: ${(p) => (p.$active ? p.$color + "18" : "rgba(255, 255, 255, 0.22)")};
  color: #3a2f28;
  cursor: pointer;
  font: inherit;
  text-align: left;

  &:hover {
    background: ${(p) => p.$color + "13"};
  }
`;

const RankBadge = styled.span<{ $color: string }>`
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: ${(p) => p.$color};
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const SchoolName = styled.div`
  min-width: 0;

  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 800;
  }

  small {
    display: block;
    margin-top: 3px;
    color: rgba(60, 42, 32, 0.54);
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 10px;
  }
`;

const TinyPills = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const TinyPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${(p) => p.$color + "17"};
  color: ${(p) => p.$color};
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 10px;
  font-weight: 800;
`;

const AboutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  margin: 10px 4px 0;
  padding: 0 15px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #c76b5e;
  cursor: pointer;
  font: inherit;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 800;
`;

const ProvinceLabels = styled.div`
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;

  @media (max-width: 960px) {
    display: none;
  }
`;

const CityLabel = styled.button<{ $x: number; $y: number; $active?: boolean }>`
  position: absolute;
  left: ${(p) => p.$x}%;
  top: ${(p) => p.$y}%;
  transform: translate(-50%, -50%);
  min-width: ${(p) => (p.$active ? "104px" : "96px")};
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.78);
  color: #3a2f28;
  box-shadow: 0 16px 34px rgba(80, 112, 168, 0.18);
  backdrop-filter: blur(14px);
  pointer-events: auto;
  cursor: pointer;
  font: inherit;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  strong {
    display: block;
    font-size: 17px;
    font-weight: 900;
    line-height: 1.18;
  }

  span {
    display: block;
    margin-top: 4px;
    color: #c76b5e;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 12px;
    font-weight: 800;
  }

  &:hover {
    transform: translate(-50%, -54%) scale(1.03);
    box-shadow: 0 20px 44px rgba(255, 99, 153, 0.22);
  }
`;

const CityTitle = styled.div`
  position: absolute;
  z-index: 9;
  top: 86px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;

  h2 {
    margin: 0;
    color: #3a2f28;
    font-size: clamp(40px, 4.4vw, 64px);
    font-weight: 800;
    letter-spacing: 0.18em;
    text-indent: 0.18em;
    text-shadow: 0 2px 0 rgba(255, 255, 255, 0.75), 0 0 32px rgba(190, 120, 95, 0.2);
  }

  p {
    margin: 8px 0 0;
    color: rgba(60, 42, 32, 0.52);
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    letter-spacing: 0.32em;
  }

  @media (max-width: 960px) {
    display: none;
  }
`;

const ArchiveCard = styled.aside<{ $color: string }>`
  position: absolute;
  z-index: 10;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  width: 310px;
  padding: 24px;
  border: 1px solid rgba(220,190,165,0.35);
  border-radius: 22px;
  background: rgba(255,252,247,0.88);
  box-shadow: 0 28px 82px rgba(140,100,70,0.18), 0 0 2px rgba(200,150,110,0.08);
  backdrop-filter: blur(22px);
  animation: ${riseIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  h3 {
    margin: 0;
    color: #3a2f28;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.04em;
  }

  .tier-row {
    display: flex;
    gap: 6px;
    margin: 10px 0 14px;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, ${(p) => p.$color}33, transparent);
    margin: 14px 0;
  }

  .info-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 10px;
    align-items: start;
    margin: 0 0 10px;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 13px;
    color: rgba(60,42,32,0.7);

    b {
      color: #5a4030;
      font-weight: 900;
      white-space: nowrap;
    }
  }

  .keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 6px 0 0;

    span {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 0 8px;
      border-radius: 999px;
      background: ${(p) => p.$color}15;
      color: ${(p) => p.$color};
      font-family: "Noto Sans SC", "PingFang SC", sans-serif;
      font-size: 11px;
      font-weight: 800;
    }
  }

  .recommend {
    margin: 14px 0 0;
    color: rgba(60,42,32,0.65);
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 13px;
    line-height: 1.65;
  }

  @media (max-width: 1100px) {
    right: 18px;
    width: 280px;
  }

  @media (max-width: 960px) {
    right: 16px;
    left: 16px;
    top: auto;
    bottom: 18px;
    width: auto;
    transform: none;
  }
`;

const tierNames: Record<Tier, string> = {
  "985": "综合研究型大学",
  "211": "重点学科大学",
  dual: "特色一流学科",
  provincial: "省属本科院校",
};

const CityStatsCard = styled.aside`
  position: absolute;
  z-index: 9;
  top: 88px;
  right: 34px;
  width: 300px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 24px 72px rgba(140, 100, 70, 0.18);
  backdrop-filter: blur(22px);

  h3 {
    margin: 0 0 16px;
    color: #3a2f28;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 16px;
    font-weight: 900;
  }

  @media (max-width: 1100px) {
    display: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
`;

const StatCell = styled.div<{ $color?: string }>`
  padding: 10px 8px;
  border-right: 1px solid rgba(117, 135, 196, 0.12);
  text-align: center;

  strong {
    display: block;
    color: ${(p) => p.$color ?? "#c76b5e"};
    font-size: 28px;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 4px;
    color: rgba(60, 42, 32, 0.66);
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 12px;
    font-weight: 700;
  }
`;

const MarkerLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 7;
  pointer-events: none;

  @media (max-width: 960px) {
    display: none;
  }
`;

const MarkerLabel = styled.span<{ $active?: boolean; $color: string }>`
  position: absolute;
  left: 50%;
  bottom: 102px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 104px;
  max-width: 154px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: ${(p) => p.$color};
  box-shadow: 0 14px 34px rgba(79, 112, 176, 0.16), 0 0 24px ${(p) => p.$color}22;
  backdrop-filter: blur(14px);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity 0.18s ease, transform 0.18s ease;
`;

const SchoolMarkerButton = styled.button<{
  $x: number;
  $y: number;
  $color: string;
  $active?: boolean;
  $muted?: boolean;
}>`
  position: absolute;
  left: ${(p) => p.$x}%;
  top: ${(p) => p.$y}%;
  width: 72px;
  height: 124px;
  border: 0;
  padding: 0;
  background: transparent;
  color: ${(p) => p.$color};
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -78%) scale(${(p) => (p.$active ? 1.12 : 1)});
  opacity: ${(p) => (p.$muted ? 0.32 : 1)};
  z-index: ${(p) => (p.$active ? 3 : 1)};
  transition: transform 0.18s ease, opacity 0.18s ease, filter 0.18s ease;
  filter: ${(p) => (p.$active ? `drop-shadow(0 0 18px ${p.$color}80)` : "none")};

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 22px;
    width: ${(p) => (p.$active ? "7px" : "5px")};
    height: ${(p) => (p.$active ? "82px" : "62px")};
    border-radius: 999px;
    background: linear-gradient(180deg, ${(p) => p.$color}00 0%, ${(p) => p.$color}aa 45%, rgba(255, 255, 255, 0.88) 100%);
    box-shadow: 0 0 20px ${(p) => p.$color}88;
    transform: translateX(-50%);
    transform-origin: bottom;
    animation: ${beamPulse} 2.4s ease-in-out infinite;
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 18px;
    width: ${(p) => (p.$active ? "54px" : "42px")};
    height: ${(p) => (p.$active ? "22px" : "16px")};
    border: 2px solid ${(p) => p.$color}66;
    border-radius: 50%;
    background: ${(p) => p.$color}10;
    box-shadow: 0 0 26px ${(p) => p.$color}44;
    transform: translate(-50%, 50%);
    animation: ${pulseRing} 2.2s ease-out infinite;
  }

  .pin {
    position: absolute;
    left: 50%;
    bottom: ${(p) => (p.$active ? "88px" : "74px")};
    display: inline-grid;
    place-items: center;
    width: ${(p) => (p.$active ? "38px" : "30px")};
    height: ${(p) => (p.$active ? "38px" : "30px")};
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-radius: 12px 12px 12px 3px;
    background: ${(p) => p.$color};
    color: #fff;
    box-shadow: 0 12px 28px ${(p) => p.$color}55, inset 0 1px 0 rgba(255, 255, 255, 0.42);
    transform: translateX(-50%) rotate(-45deg);
  }

  .pin svg {
    transform: rotate(45deg);
  }

  &:hover {
    transform: translate(-50%, -81%) scale(1.13);
    opacity: 1;
  }

  &:hover ${MarkerLabel} {
    opacity: 1;
    transform: translateX(-50%) translateY(-3px);
  }
`;

const BottomLegend = styled.footer`
  position: absolute;
  z-index: 10;
  right: 38px;
  bottom: 34px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 18px 50px rgba(80, 112, 168, 0.16);
  backdrop-filter: blur(18px);

  @media (max-width: 960px) {
    display: none;
  }
`;

const LegendItem = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #5a4030;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;

  &::before {
    content: "";
    width: 11px;
    height: 11px;
    border-radius: 999px;
    background: ${(p) => p.$color};
    box-shadow: 0 0 16px ${(p) => p.$color};
  }
`;

const DetailShell = styled.main`
  position: absolute;
  z-index: 9;
  inset: 122px 38px 36px;
  display: grid;
  grid-template-rows: minmax(0, 1fr);

  @media (max-width: 900px) {
    inset: 118px 16px 18px;
  }
`;

const DetailActions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 22px;
  padding-top: 6px;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

// ── Standard map components ──

interface MapCity {
  name: string;
  adcode: number;
  d: string;
  centroid: { x: number; y: number };
}

const rawMapCities: MapCity[] = mapData.cities as unknown as MapCity[];

function computeMapViewBox(): string {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of rawMapCities) {
    const cx = c.centroid.x, cy = c.centroid.y;
    if (cx < minX) minX = cx;
    if (cx > maxX) maxX = cx;
    if (cy < minY) minY = cy;
    if (cy > maxY) maxY = cy;
  }
  const padX = (maxX - minX) * 0.25;
  const padY = (maxY - minY) * 0.25;
  return `${minX - padX} ${minY - padY} ${maxX - minX + padX * 2} ${maxY - minY + padY * 2}`;
}

const MAP_SVG_VIEWBOX = computeMapViewBox();

const standardCityPalette: Record<string, string> = {
  "南京": "#eacfba", "苏州": "#d6ae92", "无锡": "#debca0",
  "常州": "#d2b496", "徐州": "#edd4c2", "南通": "#d8b898",
  "扬州": "#e4c4aa", "盐城": "#cfac8c", "镇江": "#dcbaa2",
  "淮安": "#e6cbb4", "泰州": "#d3b08e", "宿迁": "#e0c2a8",
  "连云港": "#cba686",
};

function standardCityFill(name: string): string {
  return standardCityPalette[name] ?? "#dab89a";
}

const StandardMapLayer = styled.svg`
  position: absolute;
  inset: 0;
  z-index: 6;
  width: 100%;
  height: 100%;
`;

const StdRegionPath = styled.path<{ $fill: string; $dimmed: boolean; $glow: boolean }>`
  fill: ${(p) => p.$fill};
  stroke: #fff;
  stroke-width: 1.5;
  stroke-linejoin: round;
  cursor: pointer;
  opacity: ${(p) => (p.$dimmed ? 0.38 : 0.95)};
  transition: opacity 0.32s ease, filter 0.24s ease;
  ${(p) => p.$glow && !p.$dimmed && `filter: drop-shadow(0 4px 12px rgba(150, 100, 60, 0.22)); opacity: 1;`}
`;

const StdOutlinePath = styled.path<{ $dimmed: boolean }>`
  fill: none;
  stroke: rgba(150, 118, 88, 0.22);
  stroke-width: 0.6;
  stroke-linejoin: round;
  pointer-events: none;
  opacity: ${(p) => (p.$dimmed ? 0.24 : 0.55)};
  transition: opacity 0.32s ease;
`;

const StdLabelG = styled.g<{ $dimmed: boolean }>`
  opacity: ${(p) => (p.$dimmed ? 0.42 : 1)};
  transition: opacity 0.32s ease;
  pointer-events: none;
`;

const StdLabelText = styled.text`
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 800;
  font-size: 13px;
  fill: #3a2f28;
  text-anchor: middle;
`;

const StdLabelSub = styled.text`
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 700;
  font-size: 9px;
  fill: #8b6d58;
  text-anchor: middle;
`;

const KeySchoolsToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 8px 4px 0;
  padding: 5px 12px;
  border: 1px solid rgba(180, 150, 130, 0.15);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.45);
  color: #8b7d73;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: rgba(199, 107, 94, 0.25);
    color: #c76b5e;
  }
`;

// ── Magazine layout components ──

const MagazinePanel = styled.section`
  overflow-y: auto;
  padding: 32px 28px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(250, 242, 232, 0.72)),
    radial-gradient(circle at 82% 6%, rgba(210, 160, 140, 0.1), transparent 34%);
  box-shadow: 0 28px 90px rgba(82, 104, 170, 0.24);
  backdrop-filter: blur(24px) saturate(140%);
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;

  @media (max-width: 960px) {
    padding: 20px 16px;
  }
`;

const MagazineHero = styled.div<{ $color: string }>`
  text-align: center;
  padding: 32px 0;
  border-bottom: 1px solid rgba(180, 150, 130, 0.15);
  margin-bottom: 28px;

  h1 {
    margin: 0;
    font-size: clamp(36px, 4.5vw, 56px);
    font-weight: 900;
    letter-spacing: 0.1em;
    color: #3a2f28;
  }

  .tier-line {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 14px 0 0;
    flex-wrap: wrap;
  }

  .meta-line {
    margin-top: 14px;
    font-size: 14px;
    color: #8b7d73;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }

  .motto {
    margin-top: 16px;
    font-size: 18px;
    color: ${(p) => p.$color};
    font-weight: 700;
    font-style: italic;
    letter-spacing: 0.05em;
  }
`;

const MagazineSection = styled.div`
  margin-bottom: 28px;
`;

const MagazineTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: #3a2f28;
  margin: 0 0 14px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 20px;
  }
`;

const MagazineText = styled.p`
  font-size: 15px;
  color: rgba(60, 42, 32, 0.8);
  line-height: 1.9;
  margin: 0;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const WhoForBlock = styled.div`
  background: rgba(199, 107, 94, 0.06);
  border: 1px solid rgba(199, 107, 94, 0.12);
  border-radius: 16px;
  padding: 20px 24px;
  margin-top: 14px;

  p {
    margin: 0 0 10px;
    font-size: 14px;
    color: #3a2f28;
    line-height: 1.7;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: #c76b5e;
  }
`;

const SnippetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const SnippetCard = styled.div`
  background: rgba(255, 252, 247, 0.7);
  border: 1px solid rgba(180, 150, 130, 0.14);
  border-radius: 14px;
  padding: 18px;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 800;
    color: #3a2f28;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #6b5d53;
    line-height: 1.65;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }
`;

const RelatedPosts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RelatedPostCard = styled.div`
  background: rgba(255, 252, 247, 0.7);
  border: 1px solid rgba(180, 150, 130, 0.14);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(3px);
    border-color: rgba(199, 107, 94, 0.2);
    box-shadow: 0 4px 16px rgba(120, 90, 60, 0.06);
  }

  .tag {
    flex-shrink: 0;
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 8px;
    letter-spacing: 0.5px;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }

  .title {
    flex: 1;
    font-size: 13px;
    font-weight: 700;
    color: #3a2f28;
    line-height: 1.4;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }

  .stats {
    flex-shrink: 0;
    font-size: 11px;
    color: #a89588;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }
`;

const RelatedQACard = styled.div`
  background: rgba(255, 252, 247, 0.7);
  border: 1px solid rgba(180, 150, 130, 0.14);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(3px);
    border-color: rgba(199, 107, 94, 0.2);
    box-shadow: 0 4px 16px rgba(120, 90, 60, 0.06);
  }

  .q-mark {
    flex-shrink: 0;
    font-size: 16px;
    font-weight: 800;
    color: #c76b5e;
  }

  .question {
    flex: 1;
    font-size: 13px;
    font-weight: 700;
    color: #3a2f28;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }
`;

const MagazineBack = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 24px;
  padding: 8px 16px;
  background: rgba(255, 252, 247, 0.7);
  border: 1px solid rgba(180, 150, 130, 0.2);
  border-radius: 10px;
  cursor: pointer;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #6b5d53;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(199, 107, 94, 0.3);
    color: #c76b5e;
  }
`;

const PrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-width: 260px;
  min-height: 52px;
  border-radius: 15px;
  background: linear-gradient(135deg, #c76b5e, #d4907e);
  color: #fff;
  text-decoration: none;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 900;
  box-shadow: 0 16px 36px rgba(255, 79, 131, 0.24);
`;

const VersionBadge = styled.div`
  position: absolute;
  z-index: 12;
  right: 14px;
  bottom: 10px;
  color: rgba(35, 44, 104, 0.34);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 10px;
  pointer-events: none;
`;

function TierPills({ university }: { university: University }) {
  const pills = TIER_ORDER.filter((tier) => {
    if (university.tier === "985") return tier === "985" || tier === "211" || tier === "dual";
    if (university.tier === "211") return tier === "211" || tier === "dual";
    return tier === university.tier;
  });

  return (
    <TinyPills>
      {pills.map((tier) => (
        <TinyPill key={tier} $color={tierMeta[tier].color}>
          {TIER_LABEL[tier]}
        </TinyPill>
      ))}
    </TinyPills>
  );
}

function SakuraPetals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        left: `${(index * 17 + 9) % 100}%`,
        x: `${index % 2 === 0 ? 32 + index * 2 : -24 - index}px`,
        size: `${9 + (index % 5) * 5}px`,
        blur: `${index % 4 === 0 ? 2.4 : 0.4}px`,
        duration: `${16 + (index % 6) * 3}s`,
        delay: `${index * -1.7}s`,
      })),
    [],
  );

  return (
    <PetalLayer aria-hidden="true">
      {petals.map((petal, index) => (
        <span
          key={index}
          style={
            {
              "--petal-left": petal.left,
              "--petal-x": petal.x,
              "--petal-size": petal.size,
              "--petal-blur": petal.blur,
              "--petal-duration": petal.duration,
              "--petal-delay": petal.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </PetalLayer>
  );
}

export default function JiangsuMap() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [scene, setScene] = useState({ rx: 0, ry: 0, shineX: 86, shineY: 12 });
  const [showAllSchools, setShowAllSchools] = useState(false);

  const citySummaries = useMemo(() => buildCitySummaries(), []);
  const totalUniversities = UNIVERSITIES.length;
  const cityParam = normalizeCityParam(searchParams.get("city"));
  const selectedSchoolId = searchParams.get("school");
  const viewParam = searchParams.get("view");
  const selectedSchool = selectedSchoolId ? UNIVERSITIES.find((university) => university.id === selectedSchoolId) ?? null : null;
  const selectedCity = selectedSchool?.city ?? cityParam;
  const selectedSummary = selectedCity ? citySummaries.find((summary) => summary.city === selectedCity) ?? null : null;
  const selectedCityName = selectedSummary?.city ?? null;
  const viewMode = viewModeOf(selectedCityName, selectedSchool, viewParam);
  const isDetail = viewMode === "school-detail";

  const filteredCities = useMemo(() => {
    const value = query.trim();
    if (!value) return citySummaries;
    return citySummaries.filter((summary) => {
      return (
        includesQuery(summary.city, value) ||
        includesQuery(summary.displayName, value) ||
        summary.universities.some((university) => includesQuery(university.name, value) || includesQuery(tierLabel(university), value))
      );
    });
  }, [citySummaries, query]);

  const cityUniversities = selectedSummary?.universities ?? EMPTY_UNIVERSITIES;
  const filteredUniversities = useMemo(() => {
    const value = query.trim();
    if (!value) return cityUniversities;
    return cityUniversities.filter((university) => {
      return includesQuery(university.name, value) || includesQuery(tierLabel(university), value);
    });
  }, [cityUniversities, query]);

  function routeParams(values: Record<string, string | null | undefined>) {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params;
  }

  function goProvince() {
    setQuery("");
    setSearchParams(routeParams({}));
  }

  function goCity(city: string) {
    setQuery("");
    setSearchParams(routeParams({ city: cityRouteParam(city) }));
  }

  function selectSchool(university: University) {
    setSearchParams(routeParams({ city: cityRouteParam(university.city), school: university.id }));
  }

  function showSchoolDetail(university: University) {
    setSearchParams(routeParams({ city: cityRouteParam(university.city), school: university.id, view: "detail" }));
  }

  function backToCityKeepSchool() {
    if (!selectedSchool || !selectedCityName) return;
    setSearchParams(routeParams({ city: cityRouteParam(selectedCityName), school: selectedSchool.id }));
  }

  const backgroundAsset = isDetail ? ASSETS.schoolScenery : viewMode === "province" ? ASSETS.province : ASSETS.city;
  const sceneScale = selectedSchool && !isDetail ? 1.06 : viewMode === "city" ? 1.045 : 1.035;
  const sceneStyle = {
    "--scene-rx": `${scene.rx}deg`,
    "--scene-ry": `${scene.ry}deg`,
    "--scene-scale": sceneScale,
    "--shine-x": `${scene.shineX}%`,
    "--shine-y": `${scene.shineY}%`,
  } as React.CSSProperties;

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    setScene({
      rx: Number((-y * 3.2).toFixed(2)),
      ry: Number((x * 4.2).toFixed(2)),
      shineX: Math.round(82 + x * 10),
      shineY: Math.round(13 + y * 8),
    });
  }

  return (
    <Page
      style={sceneStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setScene({ rx: 0, ry: 0, shineX: 86, shineY: 12 })}
    >
      <StageImage $asset={backgroundAsset} $mode={viewMode} />
      <SakuraPetals />

      <TopBar>
        <BrandBlock>
          <h1>
            <span>✿</span>
            江苏高校 立体地图
          </h1>
          {viewMode === "province" && <p>选院校向 · 发现热爱 · 遇见未来</p>}
        </BrandBlock>
        <TopActions>
          {viewMode !== "province" && (
            <GlassButton onClick={goProvince}>
              <RotateCcw size={17} />
              返回全省地图
            </GlassButton>
          )}
          {isDetail ? (
            <GlassButton onClick={backToCityKeepSchool}>
              <MapPin size={17} />
              返回地图
            </GlassButton>
          ) : (
            <GlassButton onClick={() => navigate("/home")}>
              <Home size={17} />
              返回首页
            </GlassButton>
          )}
        </TopActions>
      </TopBar>

      {viewMode !== "province" && selectedCityName && (
        <Breadcrumb>
          <MapPin size={18} color="#c76b5e" />
          <CrumbButton onClick={goProvince}>江苏省</CrumbButton>
          <ChevronRight size={15} />
          <CrumbButton onClick={() => goCity(selectedCityName)}>{selectedCityName}市</CrumbButton>
          {selectedSchool && (
            <>
              <ChevronRight size={15} />
              <span>{selectedSchool.name}</span>
            </>
          )}
        </Breadcrumb>
      )}

      {viewMode === "province" && (
        <>
          <ProvinceLabels>
            {citySummaries.map((summary) => {
              const point = provinceLabelPositions[summary.city] ?? { x: 50, y: 50 };
              return (
                <CityLabel key={summary.city} $x={point.x} $y={point.y} onClick={() => goCity(summary.city)}>
                  <strong>{summary.displayName}</strong>
                  <span>{summary.total}所高校</span>
                </CityLabel>
              );
            })}
          </ProvinceLabels>
          <ProvincePanel
            query={query}
            setQuery={setQuery}
            cities={filteredCities}
            allCities={citySummaries}
            totalUniversities={totalUniversities}
            onCitySelect={goCity}
          />
          <BottomLegend>
            <LegendItem $color="#c76b5e">城市 {citySummaries.length}个</LegendItem>
            <LegendItem $color="#7b5ea7">高校 {totalUniversities}所</LegendItem>
          </BottomLegend>
        </>
      )}

      {(viewMode === "city" || viewMode === "school-preview") && selectedSummary && selectedCityName && (
        <>
          <CityTitle>
            <h2>{selectedCityName}市</h2>
            <p>{selectedCityName.toUpperCase()}</p>
          </CityTitle>
          <CityPanel
            query={query}
            setQuery={setQuery}
            summary={selectedSummary}
            universities={filteredUniversities}
            selectedSchool={selectedSchool}
            onSchoolSelect={selectSchool}
            showAllSchools={showAllSchools}
            onToggleSchools={() => setShowAllSchools((v) => !v)}
          />
          <SchoolMarkerLayer
            universities={showAllSchools ? cityUniversities : cityUniversities.filter((u) => u.tier !== "provincial")}
            selectedSchool={selectedSchool}
            onSchoolSelect={selectSchool}
          />
          <CityStatsCard>
            <h3>{selectedCityName}市高校概览</h3>
            <StatsGrid>
              <StatCell>
                <strong>{selectedSummary.total}</strong>
                <span>高校总数</span>
              </StatCell>
              <StatCell $color={tierMeta["985"].color}>
                <strong>{selectedSummary.counts["985"]}</strong>
                <span>985高校</span>
              </StatCell>
              <StatCell $color={tierMeta["211"].color}>
                <strong>{selectedSummary.counts["211"]}</strong>
                <span>211高校</span>
              </StatCell>
              <StatCell $color={tierMeta.dual.color}>
                <strong>{selectedSummary.counts.dual}</strong>
                <span>双一流高校</span>
              </StatCell>
            </StatsGrid>
          </CityStatsCard>
          {selectedSchool && <SchoolArchiveCard university={selectedSchool} onDetail={() => showSchoolDetail(selectedSchool)} />}
          <BottomLegend>
            {TIER_ORDER.map((tier) => (
              <LegendItem key={tier} $color={tierMeta[tier].color}>
                {tierMeta[tier].label} {selectedSummary.counts[tier]}
              </LegendItem>
            ))}
          </BottomLegend>
        </>
      )}

      {isDetail && selectedSchool && selectedCityName && (
        <SchoolDetail university={selectedSchool} city={selectedCityName} onBack={backToCityKeepSchool} />
      )}

      <VersionBadge>v5 · 沙盘</VersionBadge>
      <DeskPet
        compact
        preferredSide="left"
        scene={
          isDetail ? "map-school" :
          viewMode === "city" || viewMode === "school-preview" ? "map-city" :
          "map-province"
        }
      />
    </Page>
  );
}

{/* Preserved for future use as standalone index tool page */}
// @ts-expect-error -- preserved for future standard-map index page
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StandardMapView({
  cities,
  hoveredCity,
  onCityHover,
  onCityClick,
  selectedCity,
  citySummaries,
}: {
  cities: MapCity[];
  hoveredCity: string | null;
  onCityHover: (cityName: string | null) => void;
  onCityClick: (city: string) => void;
  selectedCity: string | null;
  citySummaries: CitySummary[];
}) {
  const cityCountMap = useMemo(() => {
    const m = new Map<string, number>();
    citySummaries.forEach((s) => m.set(s.city, s.total));
    return m;
  }, [citySummaries]);

  return (
    <StandardMapLayer viewBox={MAP_SVG_VIEWBOX} preserveAspectRatio="xMidYMid meet">
      {/* Glass shadow filter */}
      <defs>
        <filter id="std-glass-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(100,70,40,0.1)" />
        </filter>
      </defs>

      {/* Outline strokes behind each region */}
      {cities.map((c) => (
        <StdOutlinePath
          key={`${c.name}-outline`}
          d={c.d}
          $dimmed={selectedCity !== null && c.name.replace(/市$/, "") !== selectedCity}
        />
      ))}

      {/* Filled region paths */}
      {cities.map((c) => {
        const displayName = c.name.replace(/市$/, "");
        const isSelected = selectedCity === displayName;
        const isHovered = hoveredCity === displayName;
        const isDimmed = selectedCity !== null && !isSelected;
        return (
          <StdRegionPath
            key={c.name}
            d={c.d}
            $fill={standardCityFill(displayName)}
            $dimmed={isDimmed}
            $glow={isHovered}
            onClick={() => onCityClick(displayName)}
            onMouseEnter={() => onCityHover(displayName)}
            onMouseLeave={() => onCityHover(null)}
          />
        );
      })}

      {/* Glass capsule labels */}
      {cities.map((c) => {
        const displayName = c.name.replace(/市$/, "");
        const count = cityCountMap.get(displayName) ?? 0;
        if (count === 0 && displayName !== selectedCity) return null;
        const isDimmed = selectedCity !== null && displayName !== selectedCity;
        const cw = Math.max(displayName.length * 16 + 28, 60);
        const cx = c.centroid.x;
        const cy = c.centroid.y - 14;
        return (
          <StdLabelG key={`${c.name}-label`} $dimmed={isDimmed}>
            <rect
              x={cx - cw / 2}
              y={cy - 17}
              width={cw}
              height={32}
              rx={16}
              ry={16}
              fill="rgba(255,255,255,0.76)"
              stroke="rgba(190,168,142,0.18)"
              strokeWidth={1}
              filter="url(#std-glass-shadow)"
            />
            <StdLabelText x={cx} y={cy - 5}>
              {displayName}
            </StdLabelText>
            <StdLabelSub x={cx} y={cy + 7}>
              {count}所高校
            </StdLabelSub>
          </StdLabelG>
        );
      })}
    </StandardMapLayer>
  );
}

function ProvincePanel({
  query,
  setQuery,
  cities,
  allCities,
  totalUniversities,
  onCitySelect,
}: {
  query: string;
  setQuery: (query: string) => void;
  cities: CitySummary[];
  allCities: CitySummary[];
  totalUniversities: number;
  onCitySelect: (city: string) => void;
}) {
  return (
    <FloatingPanel $variant="province">
      <PanelInner>
        <PanelHeader>
          <SearchBox>
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索城市 / 高校" />
            {query && (
              <ClearButton type="button" onClick={() => setQuery("")}>
                <X size={13} />
              </ClearButton>
            )}
          </SearchBox>
        </PanelHeader>
        <ScrollArea>
          <PanelSectionTitle>
            全省城市 <span>{allCities.length} 城市 · {totalUniversities} 高校</span>
          </PanelSectionTitle>
          {cities.map((summary) => (
            <CityRow key={summary.city} onClick={() => onCitySelect(summary.city)}>
              <strong>{summary.displayName}</strong>
              <span>{summary.total}</span>
            </CityRow>
          ))}
          <AboutButton type="button">
            <Sparkles size={15} />
            关于江苏高校
          </AboutButton>
        </ScrollArea>
      </PanelInner>
    </FloatingPanel>
  );
}

function CityPanel({
  query,
  setQuery,
  summary,
  universities,
  selectedSchool,
  onSchoolSelect,
  showAllSchools,
  onToggleSchools,
}: {
  query: string;
  setQuery: (query: string) => void;
  summary: CitySummary;
  universities: University[];
  selectedSchool: University | null;
  onSchoolSelect: (university: University) => void;
  showAllSchools: boolean;
  onToggleSchools: () => void;
}) {
  const keyCount = summary.counts["985"] + summary.counts["211"] + summary.counts.dual;
  const listCount = showAllSchools ? summary.total : keyCount;
  return (
    <FloatingPanel $variant="city">
      <PanelInner>
        <PanelHeader>
          <SearchBox>
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索高校名称 / 层次" />
            {query && (
              <ClearButton type="button" onClick={() => setQuery("")}>
                <X size={13} />
              </ClearButton>
            )}
          </SearchBox>
        </PanelHeader>
        <ScrollArea>
          <PanelSectionTitle>
            {summary.displayName}高校列表 <span>({listCount})</span>
          </PanelSectionTitle>
          {universities
            .filter((u) => showAllSchools || u.tier !== "provincial")
            .map((university, index) => {
              const meta = tierMeta[university.tier];
              const active = selectedSchool?.id === university.id;
              return (
                <SchoolRow key={university.id} $active={active} $color={meta.color} onClick={() => onSchoolSelect(university)}>
                  <RankBadge $color={active ? meta.color : "rgba(95, 104, 177, 0.72)"}>{index + 1}</RankBadge>
                  <SchoolName>
                    <strong>{university.name}</strong>
                    <small>{university.founded ? `${university.founded}年建校` : "江苏高校坐标"}</small>
                  </SchoolName>
                  <TierPills university={university} />
                </SchoolRow>
              );
            })}
          {!showAllSchools && keyCount < summary.total && (
            <KeySchoolsToggle onClick={onToggleSchools}>
              显示全部 {summary.total} 所高校（含省属本科）
            </KeySchoolsToggle>
          )}
          {showAllSchools && (
            <KeySchoolsToggle onClick={onToggleSchools}>
              仅显示重点高校
            </KeySchoolsToggle>
          )}
        </ScrollArea>
      </PanelInner>
    </FloatingPanel>
  );
}

function SchoolMarkerLayer({
  universities,
  selectedSchool,
  onSchoolSelect,
}: {
  universities: University[];
  selectedSchool: University | null;
  onSchoolSelect: (university: University) => void;
}) {
  return (
    <MarkerLayer aria-label="高校点位">
      {universities.map((university, index) => {
        const meta = tierMeta[university.tier];
        const point = getMarkerPosition(university, index, universities.length);
        const active = selectedSchool?.id === university.id;
        const featured = active || university.tier !== "provincial";

        return (
          <SchoolMarkerButton
            key={university.id}
            type="button"
            title={university.name}
            aria-label={`查看${university.name}`}
            $x={point.x}
            $y={point.y}
            $color={meta.color}
            $active={active}
            $muted={Boolean(selectedSchool && !active)}
            onClick={() => onSchoolSelect(university)}
          >
            <span className="pin" aria-hidden="true">
              <GraduationCap size={active ? 21 : 17} strokeWidth={2.5} />
            </span>
            <MarkerLabel $active={featured} $color={meta.color}>
              {university.name}
            </MarkerLabel>
          </SchoolMarkerButton>
        );
      })}
    </MarkerLayer>
  );
}

function SchoolArchiveCard({ university, onDetail }: { university: University; onDetail: () => void }) {
  const meta = tierMeta[university.tier];
  const tierChips = TIER_ORDER.filter((t) => {
    if (university.tier === "985") return t === "985" || t === "211" || t === "dual";
    if (university.tier === "211") return t === "211" || t === "dual";
    return t === university.tier;
  });
  return (
    <ArchiveCard $color={meta.color}>
      <h3>{university.name}</h3>
      <div className="tier-row">
        {tierChips.map((t) => (
          <TinyPill key={t} $color={tierMeta[t].color}>
            {TIER_LABEL[t]}
          </TinyPill>
        ))}
      </div>
      <div className="info-row">
        <b>📍</b><span>{university.city}市</span>
        {university.founded ? <><b>🏛</b><span>{university.founded} 年建校</span></> : null}
        <b>📖</b><span>{tierNames[university.tier]}</span>
      </div>
      <div className="keywords">
        <span>#{meta.label}</span>
        <span>#{university.city}高校</span>
        {university.founded && <span>#百年底蕴</span>}
      </div>
      <div className="divider" />
      <div className="recommend">
        💬 {university.name}是{university.city}高校版图中的重要坐标。{university.tier === "985" ? "综合实力突出，适合作为探索第一站。" : university.tier === "211" ? "学科底蕴清晰，值得重点了解。" : "与地方发展紧密关联，校园生活丰富多彩。"}
      </div>
      <DetailActions style={{ marginTop: 14 }}>
        <PrimaryLink
          as="button"
          type="button"
          onClick={onDetail}
          style={{
            background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
            border: 0,
            cursor: "pointer",
            font: "inherit",
            fontFamily: '"Noto Sans SC", "PingFang SC", sans-serif',
          }}
        >
          查看校园详情
          <ChevronRight size={17} />
        </PrimaryLink>
      </DetailActions>
    </ArchiveCard>
  );
}

function SchoolDetail({ university, city, onBack }: { university: University; city: string; onBack: () => void }) {
  const meta = tierMeta[university.tier];
  const website = university.website ?? (university.id === "nju" ? "https://www.nju.edu.cn" : "");
  const relatedExps = experiencesForSchool(university.id).slice(0, 3);
  const relatedQAs = qaForSchool(university.id).slice(0, 3);
  const tierChips = TIER_ORDER.filter((t) => {
    if (university.tier === "985") return t === "985" || t === "211" || t === "dual";
    if (university.tier === "211") return t === "211" || t === "dual";
    return t === university.tier;
  });

  const motto =
    university.tier === "985"
      ? "诚朴雄伟  励学敦行"
      : university.tier === "211"
        ? "严谨求实  团结创新"
        : "明德至善  知行合一";

  return (
    <DetailShell>
      <MagazinePanel>
        <MagazineBack onClick={onBack}>
          <ArrowLeft size={16} />
          返回{city}市
        </MagazineBack>

        <MagazineHero $color={meta.color}>
          <h1>{university.name}</h1>
          <div className="tier-line">
            {tierChips.map((t) => (
              <TinyPill key={t} $color={tierMeta[t].color}>
                {TIER_LABEL[t]}
              </TinyPill>
            ))}
          </div>
          <div className="meta-line">
            {university.founded ? `${university.founded} 年建校` : ""}{university.founded ? " · " : ""}{city}市
          </div>
          <div className="motto">{motto}</div>
        </MagazineHero>

        <MagazineSection>
          <MagazineTitle><span>📖</span> 学校概述</MagazineTitle>
          <MagazineText>
            {university.name}坐落于江苏省{city}，{university.founded ? `始建于${university.founded}年，` : ""}
            是{tierNames[university.tier]}。学校在长期的办学实践中形成了鲜明的学科特色和校园文化，
            为江苏乃至全国培养了大量优秀人才。{university.tier === "985"
              ? "作为江苏省内仅有的两所985高校之一，其综合实力和学术影响力在全国高校中位居前列。"
              : university.tier === "211"
                ? "学校在多个学科领域拥有国家级重点学科，是区域内重要的高等教育基地。"
                : university.tier === "dual"
                  ? "学校入选国家双一流建设计划，在特定学科方向上具备全国领先的实力。"
                  : "学校立足地方、服务区域，在应用型人才培养方面形成了独特优势。"}
          </MagazineText>
        </MagazineSection>

        <MagazineSection>
          <MagazineTitle><span>🎯</span> 适合怎样的学生</MagazineTitle>
          <MagazineText>
            选择一所大学不只是看排名，更要看气质是否契合。以下是{university.name}的画像，看看是不是你的理想型。
          </MagazineText>
          <WhoForBlock>
            <p>
              <strong>如果你喜欢：</strong>
              {university.tier === "985"
                ? " 顶尖的学术资源、自由的研究氛围、与全国最优秀的同龄人同台竞争。这里的课堂会挑战你的认知边界，但也会给你最广阔的成长空间。"
                : university.tier === "211"
                  ? " 扎实的学科训练、明确的专业发展路径、在特定领域做到最好。这里不会让你迷失在太多选择中，而是帮你把一件事做好。"
                  : university.tier === "dual"
                    ? " 在某个特色学科方向深入钻研、享受小而精的学术社群氛围。这里的优势学科有全国领先的师资和实验条件。"
                    : " 贴近产业实际的应用型学习、与地方经济紧密结合的实习机会、相对轻松自由的校园节奏。这里更看重你的实践能力而非考试分数。"}
            </p>
            <p>
              <strong>如果你擅长：</strong>
              {university.tier === "985" || university.tier === "211"
                ? " 自主学习、独立思考、在竞争中保持自己的节奏。学校提供平台和资源，但不会手把手教你每一步——适合有内驱力的同学。"
                : " 动手实践、团队协作、在项目中学习和成长。学校提供很多实操机会，适合喜欢在'做中学'的同学。"}
            </p>
          </WhoForBlock>
        </MagazineSection>

        <MagazineSection>
          <MagazineTitle><span>🏠</span> 校园生活剪影</MagazineTitle>
          <SnippetGrid>
            <SnippetCard>
              <h4>🛏️ 住宿环境</h4>
              <p>
                {university.tier === "985" || university.tier === "211"
                  ? "四人间为主，独立卫浴配置齐全，空调热水器一应俱全。新校区宿舍条件在江苏高校中属于上乘。"
                  : "宿舍以四人间为主，部分为六人间，配备空调和公共卫浴。生活便利，离教学区步行可达。"}
              </p>
            </SnippetCard>
            <SnippetCard>
              <h4>🍜 饮食体验</h4>
              <p>
                {university.city === "南京"
                  ? "多个食堂分散在校园各处，菜品丰富涵盖南北风味。南京特色鸭血粉丝和盐水鸭是食堂常客。"
                  : `${university.city}本地风味浓郁，食堂菜品价格实惠。每月伙食费800-1200元够用。`}
              </p>
            </SnippetCard>
            <SnippetCard>
              <h4>📚 学习氛围</h4>
              <p>
                {university.tier === "985"
                  ? "图书馆常年满座，学术讲座每周数场。同学圈子讨论的多是论文、项目和未来规划——氛围会推着你往前走。"
                  : university.tier === "211"
                    ? "学风扎实，考研率较高。图书馆自习室考试周需要早起占座，身边同学目标感很强。"
                    : "学习节奏相对从容，图书馆座位充足。学校注重实践教学，实验和项目机会较多。"}
              </p>
            </SnippetCard>
          </SnippetGrid>
        </MagazineSection>

        {/* Related Experiences */}
        {relatedExps.length > 0 && (
          <MagazineSection>
            <MagazineTitle><span>💬</span> 学长学姐说</MagazineTitle>
            <RelatedPosts>
              {relatedExps.map((exp) => {
                const catMeta = CATEGORY_META[exp.category];
                return (
                  <RelatedPostCard key={exp.id}>
                    <span className="tag" style={{ background: `${catMeta.color}16`, color: catMeta.color }}>
                      {catMeta.label}
                    </span>
                    <span className="title">{exp.title}</span>
                    <span className="stats">👍 {exp.likes}</span>
                  </RelatedPostCard>
                );
              })}
            </RelatedPosts>
          </MagazineSection>
        )}

        {/* Related Q&A */}
        {relatedQAs.length > 0 && (
          <MagazineSection>
            <MagazineTitle><span>❓</span> 常见疑问</MagazineTitle>
            <RelatedPosts>
              {relatedQAs.map((qa) => (
                <RelatedQACard key={qa.id}>
                  <span className="q-mark">Q</span>
                  <span className="question">{qa.question}</span>
                </RelatedQACard>
              ))}
            </RelatedPosts>
          </MagazineSection>
        )}

        <DetailActions style={{ justifyContent: "center", gap: 16 }}>
          {website && (
            <PrimaryLink href={website} target="_blank" rel="noreferrer">
              <ExternalLink size={18} />
              访问官网
            </PrimaryLink>
          )}
        </DetailActions>
      </MagazinePanel>
    </DetailShell>
  );
}
