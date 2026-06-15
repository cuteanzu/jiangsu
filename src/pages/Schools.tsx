import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  Database,
  ExternalLink,
  MapPin,
  MessageCircle,
  RotateCcw,
  School,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useTransition } from "../context/useTransition";
import { EXPERIENCES, QA_ENTRIES } from "../data/mock-content";
import {
  UNIVERSITIES,
  universityBandLabel,
  universityLevelTags,
  universityTypeTag,
  type University,
} from "../data/jiangsu-universities";
import { citiesApi, contentApi, schoolsApi } from "../services/api";
import type { CityProfileDTO, SchoolDTO, SchoolDetailDTO } from "../services/types";
import {
  clipSurveySummary,
  getLifeSurveyCoverage,
  getLifeSurveyHighlights,
  getLifeSurveyItems,
  hasLifeSurvey,
  surveySignalLabel,
  surveySignalValue,
} from "../utils/lifeSurvey";

type DataSource = "api" | "static";
type SortKey = "hot" | "favorite" | "coverage" | "city" | "name";

interface SchoolsState {
  schools: SchoolDTO[];
  cities: CityProfileDTO[];
  source: DataSource;
  loading: boolean;
  notice: string;
  error: string;
}

const lift = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  background: oklch(96% 0.014 82);
  color: oklch(22% 0.035 55);
  font-family: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
`;

const Shell = styled.div`
  width: min(1360px, calc(100% - 48px));
  margin: 0 auto;
  padding: 34px 0 70px;

  @media (max-width: 760px) {
    width: calc(100% - 28px);
    padding: 22px 0 46px;
  }
`;

const Header = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 22px;
  align-items: end;
  animation: ${lift} 0.34s ease-out both;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: oklch(48% 0.11 43);
  font-size: 12px;
  font-weight: 950;

  svg {
    width: 15px;
    height: 15px;
  }
`;

const Title = styled.h1`
  margin: 12px 0 12px;
  color: oklch(20% 0.035 55);
  font-size: 44px;
  line-height: 1.08;
  font-weight: 950;
  letter-spacing: 0;

  @media (max-width: 760px) {
    font-size: 34px;
  }
`;

const Intro = styled.p`
  max-width: 70ch;
  margin: 0;
  color: oklch(43% 0.032 62);
  font-size: 15px;
  line-height: 1.85;
`;

const FlowRail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
`;

const FlowChip = styled.span<{ $active?: boolean }>`
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid ${(p) => (p.$active ? "oklch(64% 0.11 43 / 0.58)" : "oklch(83% 0.028 72 / 0.72)")};
  border-radius: 999px;
  background: ${(p) => (p.$active ? "oklch(94.5% 0.035 45 / 0.8)" : "oklch(99% 0.008 82 / 0.72)")};
  color: ${(p) => (p.$active ? "oklch(42% 0.1 42)" : "oklch(42% 0.03 62)")};
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 850;

  svg {
    width: 13px;
    height: 13px;
  }
`;

const Surface = styled.section`
  border: 1px solid oklch(83% 0.028 72 / 0.72);
  border-radius: 8px;
  background: oklch(98.8% 0.008 82 / 0.76);
  animation: ${lift} 0.34s ease-out both;
`;

const StatusPanel = styled(Surface)`
  overflow: hidden;
`;

const StatusLine = styled.div`
  min-height: 46px;
  padding: 0 16px;
  border-bottom: 1px solid oklch(86% 0.022 72 / 0.62);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;

  &:last-child {
    border-bottom: 0;
  }

  span {
    color: oklch(46% 0.03 62);
    font-weight: 800;
  }

  strong {
    color: oklch(25% 0.04 56);
    font-weight: 950;
  }
`;

const Notice = styled.div<{ $error?: boolean }>`
  margin-top: 18px;
  padding: 11px 13px;
  border: 1px solid ${(p) => (p.$error ? "oklch(72% 0.09 32 / 0.54)" : "oklch(78% 0.045 66 / 0.58)")};
  border-radius: 8px;
  background: ${(p) => (p.$error ? "oklch(96% 0.026 36 / 0.58)" : "oklch(97% 0.018 62 / 0.62)")};
  color: ${(p) => (p.$error ? "oklch(42% 0.12 32)" : "oklch(42% 0.035 58)")};
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12.5px;
  line-height: 1.65;

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const CommandBar = styled.section`
  margin-top: 24px;
  padding: 12px;
  border: 1px solid oklch(83% 0.028 72 / 0.72);
  border-radius: 8px;
  background: oklch(98.8% 0.008 82 / 0.74);
  display: grid;
  grid-template-columns: minmax(280px, 1fr) auto;
  gap: 12px;
  align-items: center;
  animation: ${lift} 0.34s ease-out 0.04s both;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const ControlDeck = styled.section`
  margin-top: 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 14px;
  animation: ${lift} 0.34s ease-out 0.06s both;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const FilterPassport = styled(Surface)`
  padding: 14px;
  display: grid;
  gap: 12px;
`;

const PassportHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  strong {
    color: oklch(23% 0.035 55);
    font-size: 14px;
    font-weight: 950;
  }

  span {
    color: oklch(48% 0.03 62);
    font-size: 12px;
    font-weight: 850;
  }
`;

const PassportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const PassportCell = styled.div<{ $tone?: "blue" | "green" | "warm" }>`
  min-width: 0;
  padding: 10px;
  border: 1px solid ${(p) => {
    if (p.$tone === "blue") return "oklch(74% 0.06 205 / 0.38)";
    if (p.$tone === "green") return "oklch(74% 0.07 145 / 0.38)";
    return "oklch(82% 0.03 72 / 0.68)";
  }};
  border-radius: 8px;
  background: ${(p) => {
    if (p.$tone === "blue") return "oklch(96% 0.018 205 / 0.52)";
    if (p.$tone === "green") return "oklch(96% 0.02 145 / 0.48)";
    return "oklch(99% 0.008 82 / 0.58)";
  }};

  span {
    display: block;
    color: oklch(50% 0.03 62);
    font-size: 11px;
    font-weight: 850;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: oklch(25% 0.035 55);
    font-size: 17px;
    line-height: 1.15;
    font-weight: 950;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CompareDock = styled(Surface)`
  padding: 14px;
  display: grid;
  gap: 10px;
`;

const CompareSlots = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const CompareSlot = styled.button<{ $empty?: boolean }>`
  min-width: 0;
  min-height: 72px;
  border: 1px dashed ${(p) => (p.$empty ? "oklch(78% 0.035 72 / 0.72)" : "oklch(68% 0.07 48 / 0.58)")};
  border-radius: 8px;
  background: ${(p) => (p.$empty ? "oklch(99% 0.008 82 / 0.42)" : "oklch(95% 0.028 48 / 0.68)")};
  color: ${(p) => (p.$empty ? "oklch(52% 0.03 62)" : "oklch(33% 0.065 45)")};
  cursor: ${(p) => (p.$empty ? "default" : "pointer")};
  padding: 9px;
  display: grid;
  align-content: center;
  gap: 5px;
  text-align: left;
  font: inherit;

  strong {
    min-width: 0;
    color: inherit;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 950;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: oklch(46% 0.035 58);
    font-size: 11px;
    font-weight: 800;
  }
`;

const CompareHint = styled.div`
  color: oklch(48% 0.03 62);
  font-size: 12px;
  line-height: 1.6;
`;

const SearchBox = styled.label`
  position: relative;
  display: block;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: oklch(55% 0.04 62);
  }

  input {
    width: 100%;
    min-height: 46px;
    box-sizing: border-box;
    padding: 0 14px 0 42px;
    border: 1px solid oklch(82% 0.03 72 / 0.78);
    border-radius: 8px;
    background: oklch(99% 0.008 82 / 0.82);
    color: oklch(24% 0.035 55);
    font: inherit;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: oklch(62% 0.12 43 / 0.72);
      box-shadow: 0 0 0 3px oklch(75% 0.08 48 / 0.18);
    }

    &::placeholder {
      color: oklch(56% 0.026 64);
    }
  }
`;

const ResetButton = styled.button`
  min-height: 40px;
  padding: 0 13px;
  border: 1px solid oklch(82% 0.028 72 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.72);
  color: oklch(42% 0.04 58);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 850;

  &:hover {
    border-color: oklch(68% 0.08 48 / 0.58);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Layout = styled.main`
  margin-top: 22px;
  display: grid;
  grid-template-columns: 256px minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;

  @media (max-width: 1180px) {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const FilterPanel = styled(Surface)`
  position: sticky;
  top: 18px;
  padding: 15px;
  display: grid;
  gap: 14px;

  @media (max-width: 860px) {
    position: static;
  }
`;

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: oklch(25% 0.035 55);
  font-size: 14px;
  font-weight: 950;

  svg {
    width: 16px;
    height: 16px;
    color: oklch(48% 0.11 43);
  }
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: oklch(44% 0.03 62);
  font-size: 12px;
  font-weight: 850;

  select {
    width: 100%;
    min-height: 38px;
    border: 1px solid oklch(82% 0.03 72 / 0.78);
    border-radius: 8px;
    background: oklch(99% 0.008 82 / 0.82);
    color: oklch(28% 0.035 55);
    font: inherit;
    font-size: 13px;
    outline: none;
    padding: 0 10px;
  }
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid ${(p) => (p.$active ? "oklch(64% 0.11 43 / 0.58)" : "oklch(82% 0.028 72 / 0.7)")};
  border-radius: 999px;
  background: ${(p) => (p.$active ? "oklch(94.5% 0.035 45 / 0.82)" : "oklch(99% 0.008 82 / 0.58)")};
  color: ${(p) => (p.$active ? "oklch(42% 0.1 42)" : "oklch(42% 0.03 62)")};
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 850;
`;

const ResultsPanel = styled(Surface)`
  overflow: hidden;
`;

const ResultsHead = styled.div`
  min-height: 62px;
  padding: 0 18px;
  border-bottom: 1px solid oklch(86% 0.022 72 / 0.62);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px;
  }
`;

const ResultsTitle = styled.div`
  strong {
    display: block;
    color: oklch(24% 0.035 55);
    font-size: 15px;
    font-weight: 950;
  }

  span {
    display: block;
    margin-top: 3px;
    color: oklch(48% 0.03 62);
    font-size: 12px;
  }
`;

const SortSelect = styled.select`
  min-height: 36px;
  border: 1px solid oklch(82% 0.03 72 / 0.78);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.82);
  color: oklch(32% 0.035 55);
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  padding: 0 10px;
  outline: none;
`;

const SchoolList = styled.div`
  display: grid;
`;

const SchoolRow = styled.article<{ $selected?: boolean }>`
  display: grid;
  grid-template-columns: 54px minmax(230px, 1.05fr) minmax(210px, 0.85fr) 132px;
  gap: 16px;
  padding: 17px 18px;
  border-bottom: 1px solid oklch(88% 0.02 72 / 0.58);
  background: ${(p) => (p.$selected ? "oklch(96% 0.026 48 / 0.58)" : "transparent")};
  align-items: center;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: oklch(97.5% 0.012 82 / 0.72);
  }

  @media (max-width: 1040px) {
    grid-template-columns: 1fr;
  }
`;

const SchoolRank = styled.div`
  width: 42px;
  height: 42px;
  border: 1px solid oklch(82% 0.03 72 / 0.68);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.62);
  color: oklch(44% 0.075 48);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 950;

  @media (max-width: 1040px) {
    display: none;
  }
`;

const SchoolName = styled.h2`
  margin: 0;
  color: oklch(22% 0.035 55);
  font-size: 18px;
  line-height: 1.35;
  font-weight: 950;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
`;

const MetaPill = styled.span<{ $tone?: "blue" | "green" | "warm" }>`
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: ${(p) => {
    if (p.$tone === "blue") return "oklch(94% 0.025 205 / 0.82)";
    if (p.$tone === "green") return "oklch(94% 0.026 145 / 0.76)";
    return "oklch(95% 0.022 62 / 0.8)";
  }};
  color: ${(p) => {
    if (p.$tone === "blue") return "oklch(37% 0.07 205)";
    if (p.$tone === "green") return "oklch(36% 0.08 145)";
    return "oklch(41% 0.065 48)";
  }};
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 850;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const Brief = styled.p`
  max-width: 64ch;
  margin: 10px 0 0;
  color: oklch(43% 0.03 62);
  font-size: 13px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SurveyPreview = styled.div`
  display: grid;
  gap: 7px;
  margin-top: 11px;
`;

const SurveyFact = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
  color: oklch(42% 0.032 62);
  font-size: 12px;
  line-height: 1.55;

  strong {
    color: oklch(36% 0.075 145);
    font-size: 11.5px;
    font-weight: 950;
    white-space: nowrap;
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SignalStack = styled.div`
  display: grid;
  gap: 9px;
`;

const SignalLine = styled.div`
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) 42px;
  gap: 8px;
  align-items: center;
  color: oklch(47% 0.03 62);
  font-size: 12px;
  font-weight: 850;
`;

const Meter = styled.div`
  height: 7px;
  border-radius: 999px;
  background: oklch(91% 0.016 72 / 0.9);
  overflow: hidden;
`;

const MeterFill = styled.span<{ $value: number; $tone?: "blue" | "green" | "warm" }>`
  display: block;
  height: 100%;
  width: ${(p) => `${Math.max(4, Math.min(100, p.$value))}%`};
  border-radius: inherit;
  background: ${(p) => {
    if (p.$tone === "blue") return "oklch(58% 0.09 205)";
    if (p.$tone === "green") return "oklch(55% 0.1 145)";
    return "oklch(58% 0.11 43)";
  }};
`;

const ActionColumn = styled.div`
  display: grid;
  gap: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean; $active?: boolean }>`
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid ${(p) => (p.$active ? "oklch(58% 0.09 145 / 0.58)" : p.$primary ? "oklch(64% 0.11 43 / 0.58)" : "oklch(82% 0.028 72 / 0.72)")};
  border-radius: 8px;
  background: ${(p) => (p.$active ? "oklch(94% 0.026 145 / 0.72)" : p.$primary ? "oklch(94.5% 0.035 45 / 0.84)" : "oklch(99% 0.008 82 / 0.66)")};
  color: ${(p) => (p.$active ? "oklch(35% 0.085 145)" : p.$primary ? "oklch(42% 0.1 42)" : "oklch(39% 0.04 58)")};
  cursor: pointer;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font: inherit;
  font-size: 12.5px;
  font-weight: 900;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const InsightRail = styled.aside`
  position: sticky;
  top: 18px;
  display: grid;
  gap: 14px;

  @media (max-width: 1180px) {
    position: static;
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const InsightPanel = styled(Surface)`
  padding: 15px;
  display: grid;
  gap: 12px;
`;

const CityList = styled.div`
  display: grid;
  gap: 9px;
`;

const CityButton = styled.button<{ $active?: boolean }>`
  border: 0;
  border-radius: 8px;
  background: ${(p) => (p.$active ? "oklch(94.5% 0.035 45 / 0.74)" : "transparent")};
  color: inherit;
  cursor: pointer;
  padding: 6px 7px;
  display: grid;
  gap: 5px;
  text-align: left;
  font: inherit;
`;

const CityLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: oklch(34% 0.035 55);
  font-size: 12.5px;
  font-weight: 900;

  span:last-child {
    color: oklch(48% 0.03 62);
  }
`;

const Empty = styled.div`
  padding: 54px 18px;
  color: oklch(52% 0.03 62);
  text-align: center;
  font-size: 14px;
  line-height: 1.7;
`;

const Skeleton = styled.div`
  padding: 17px 18px;
  border-bottom: 1px solid oklch(88% 0.02 72 / 0.58);
  display: grid;
  gap: 10px;

  span {
    display: block;
    height: 14px;
    border-radius: 999px;
    background: oklch(91% 0.016 72);
  }

  span:nth-child(1) { width: 32%; }
  span:nth-child(2) { width: 72%; }
  span:nth-child(3) { width: 48%; }
`;

const cityOrder = ["南京", "苏州", "无锡", "徐州", "常州", "南通", "扬州", "镇江", "盐城", "淮安", "连云港", "泰州", "宿迁"];
const cityIdMap = new Map(cityOrder.map((city, index) => [city, index + 1]));

function fallbackSchool(university: University, index: number): SchoolDTO {
  const levelTags = universityLevelTags(university);
  return {
    id: 10000 + index,
    name: university.name,
    cityId: cityIdMap.get(university.city) ?? 0,
    cityName: university.city,
    type: universityTypeTag(university),
    level: universityBandLabel(university),
    website: university.website ?? null,
    logoUrl: null,
    coverUrl: null,
    address: null,
    brief: `${university.city}高校，${levelTags.join("、")}。适合在学校库、地图、经验和问答之间继续交叉查看。`,
    hotScore: Math.max(35, 96 - index),
    favoriteCount: Math.max(0, 60 - index),
    mapX: null,
    mapY: null,
    isFavorited: false,
  };
}

const fallbackSchools = UNIVERSITIES.map(fallbackSchool);

function localUniversityFor(school: SchoolDTO) {
  return UNIVERSITIES.find((item) => item.name === school.name) ?? null;
}

function displayCity(school: SchoolDTO) {
  return school.cityName || localUniversityFor(school)?.city || "江苏";
}

function displayLevel(school: SchoolDTO) {
  const local = localUniversityFor(school);
  return school.level || (local ? universityBandLabel(local) : "本科");
}

function displayType(school: SchoolDTO) {
  const local = localUniversityFor(school);
  return school.type || (local ? universityTypeTag(local) : "综合类");
}

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function coverageOf(school: SchoolDTO) {
  const fields = [school.logoUrl, school.website, school.address, school.brief, school.type, school.level];
  return Math.round((fields.filter(hasValue).length / fields.length) * 100);
}

function compactBrief(school: SchoolDTO) {
  if (school.brief?.trim()) return school.brief;
  const local = localUniversityFor(school);
  if (local) return `${local.city}高校，${universityLevelTags(local).join("、")}。`;
  return "这所学校还缺少简介，可以从地图、经验和问答继续补充真实信息。";
}

function buildCountMap(names: string[]) {
  return names.reduce<Map<string, number>>((map, name) => {
    if (!name) return map;
    map.set(name, (map.get(name) ?? 0) + 1);
    return map;
  }, new Map());
}

function sortChinese(a: string, b: string) {
  return a.localeCompare(b, "zh-Hans-CN");
}

export default function Schools() {
  const { navigateWithTransition } = useTransition();
  const [state, setState] = useState<SchoolsState>({
    schools: fallbackSchools,
    cities: [],
    source: "static",
    loading: true,
    notice: "",
    error: "",
  });
  const [experienceNames, setExperienceNames] = useState<string[]>(EXPERIENCES.map((item) => item.schoolName));
  const [qaNames, setQaNames] = useState<string[]>(QA_ENTRIES.map((item) => item.schoolName ?? ""));
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [level, setLevel] = useState("all");
  const [type, setType] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("hot");
  const [detailMap, setDetailMap] = useState<Record<number, SchoolDetailDTO | null>>({});
  const [compareIds, setCompareIds] = useState<number[]>([]);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      schoolsApi.search({ size: 300 }),
      citiesApi.list(),
      contentApi.experiences(),
      contentApi.qa(),
    ]).then(([schoolsResult, citiesResult, experiencesResult, qaResult]) => {
      if (!active) return;
      const nextSchools = schoolsResult.status === "fulfilled" && Array.isArray(schoolsResult.value) ? schoolsResult.value : [];
      const nextCities = citiesResult.status === "fulfilled" && Array.isArray(citiesResult.value) ? citiesResult.value : [];

      if (experiencesResult.status === "fulfilled" && experiencesResult.value.length > 0) {
        setExperienceNames(experiencesResult.value.map((item) => item.schoolName));
      }
      if (qaResult.status === "fulfilled" && qaResult.value.length > 0) {
        setQaNames(qaResult.value.map((item) => item.schoolName ?? ""));
      }

      if (nextSchools.length > 0) {
        setState({
          schools: nextSchools,
          cities: nextCities,
          source: "api",
          loading: false,
          notice: `已整理 ${nextSchools.length} 所学校档案。`,
          error: "",
        });
        return;
      }

      setState({
        schools: fallbackSchools,
        cities: nextCities,
        source: "static",
        loading: false,
        notice: "学校档案暂时未完整载入，当前展示基础高校资料。",
        error: schoolsResult.status === "rejected" ? "学校资料暂时不可用。" : "",
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const experienceCountMap = useMemo(() => buildCountMap(experienceNames), [experienceNames]);
  const qaCountMap = useMemo(() => buildCountMap(qaNames), [qaNames]);

  const cityOptions = useMemo(
    () => [...new Set(state.schools.map(displayCity))]
      .filter(Boolean)
      .sort((a, b) => {
        const ai = cityOrder.indexOf(a);
        const bi = cityOrder.indexOf(b);
        if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        return sortChinese(a, b);
      }),
    [state.schools],
  );

  const levelOptions = useMemo(() => [...new Set(state.schools.map(displayLevel))].filter(Boolean).sort(sortChinese), [state.schools]);
  const typeOptions = useMemo(() => [...new Set(state.schools.map(displayType))].filter(Boolean).sort(sortChinese), [state.schools]);

  const filteredSchools = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const list = state.schools.filter((school) => {
      const cityName = displayCity(school);
      const levelName = displayLevel(school);
      const typeName = displayType(school);
      if (city !== "all" && cityName !== city) return false;
      if (level !== "all" && levelName !== level) return false;
      if (type !== "all" && typeName !== type) return false;
      if (!keyword) return true;
      return [school.name, cityName, levelName, typeName, school.brief ?? "", school.address ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

    return [...list].sort((a, b) => {
      if (sortKey === "favorite") return (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0);
      if (sortKey === "coverage") return coverageOf(b) - coverageOf(a);
      if (sortKey === "city") return sortChinese(displayCity(a), displayCity(b)) || sortChinese(a.name, b.name);
      if (sortKey === "name") return sortChinese(a.name, b.name);
      return (b.hotScore ?? 0) - (a.hotScore ?? 0);
    });
  }, [city, level, query, sortKey, state.schools, type]);

  useEffect(() => {
    const available = new Set(state.schools.map((school) => school.id));
    setCompareIds((current) => current.filter((id) => available.has(id)));
  }, [state.schools]);

  useEffect(() => {
    if (state.source !== "api" || state.loading) return;
    const ids = filteredSchools
      .slice(0, 60)
      .map((school) => school.id)
      .filter((id) => detailMap[id] === undefined);
    if (ids.length === 0) return;

    let active = true;
    Promise.allSettled(ids.map((id) => schoolsApi.detail(id))).then((results) => {
      if (!active) return;
      setDetailMap((current) => {
        const next = { ...current };
        ids.forEach((id, index) => {
          const result = results[index];
          next[id] = result.status === "fulfilled" ? result.value : null;
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [detailMap, filteredSchools, state.loading, state.source]);

  const cityStats = useMemo(() => {
    const counts = new Map<string, number>();
    state.schools.forEach((school) => {
      const name = displayCity(school);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || sortChinese(a.name, b.name))
      .slice(0, 8);
  }, [state.schools]);

  const averageCoverage = useMemo(() => {
    if (state.schools.length === 0) return 0;
    return Math.round(state.schools.reduce((sum, school) => sum + coverageOf(school), 0) / state.schools.length);
  }, [state.schools]);

  const contentSchools = useMemo(() => new Set([...experienceNames, ...qaNames].filter(Boolean)).size, [experienceNames, qaNames]);
  const surveyStats = useMemo(() => {
    const surveys = Object.values(detailMap)
      .map((detail) => detail?.lifeSurvey ?? null)
      .filter(hasLifeSurvey);
    const averageSurveyCoverage = surveys.length > 0
      ? Math.round(surveys.reduce((sum, survey) => sum + getLifeSurveyCoverage(survey), 0) / surveys.length)
      : 0;
    const averageSurveySignal = surveys.length > 0
      ? Math.round(surveys.reduce((sum, survey) => sum + surveySignalValue(survey), 0) / surveys.length)
      : 0;
    return {
      surveySchoolCount: surveys.length,
      averageSurveyCoverage,
      averageSurveySignal,
    };
  }, [detailMap]);

  const clearFilters = () => {
    setQuery("");
    setCity("all");
    setLevel("all");
    setType("all");
    setSortKey("hot");
  };

  const compareSchools = useMemo(
    () => compareIds
      .map((id) => state.schools.find((school) => school.id === id))
      .filter((school): school is SchoolDTO => Boolean(school)),
    [compareIds, state.schools],
  );

  const filterPassport = useMemo(() => {
    const cityText = city === "all" ? "全省" : city;
    const levelText = level === "all" ? "全部层次" : level;
    const typeText = type === "all" ? "全部类型" : type;
    const keywordText = query.trim() || "未输入";
    return { cityText, levelText, typeText, keywordText };
  }, [city, level, query, type]);

  const toggleCompare = (school: SchoolDTO) => {
    setCompareIds((current) => {
      if (current.includes(school.id)) return current.filter((id) => id !== school.id);
      return [...current.slice(-2), school.id];
    });
  };

  const openMap = (school: SchoolDTO) => {
    const local = localUniversityFor(school);
    const params = new URLSearchParams();
    params.set("city", local?.city ?? displayCity(school));
    if (local) {
      params.set("school", local.id);
      params.set("view", "detail");
    }
    navigateWithTransition(`/jiangsu?${params.toString()}`);
  };

  const openExperiences = (school: SchoolDTO) => {
    navigateWithTransition(`/experiences?school=${encodeURIComponent(school.name)}`);
  };

  const openQA = (school: SchoolDTO) => {
    navigateWithTransition(`/qa?school=${encodeURIComponent(school.name)}`);
  };

  const openWebsite = (school: SchoolDTO) => {
    if (school.website) window.open(school.website, "_blank", "noopener,noreferrer");
  };

  const activeFilterCount = [query.trim(), city !== "all", level !== "all", type !== "all"].filter(Boolean).length;

  return (
    <Page>
      <Shell>
        <Header>
          <div>
            <Eyebrow><Database />SCHOOL FILTER DESK</Eyebrow>
            <Title>择校筛选台</Title>
            <Intro>
              把学校名单、城市分布、资料完整度、生活画像、经验和问答线索放在同一个控制台里。先筛出候选学校，再加入对比，最后进入地图档案细看。
            </Intro>
            <FlowRail>
              <FlowChip $active><Database />筛选台</FlowChip>
              <FlowChip><Compass />发现台</FlowChip>
              <FlowChip><BookOpen />现场笔记</FlowChip>
              <FlowChip><MessageCircle />分诊台</FlowChip>
            </FlowRail>
          </div>

          <StatusPanel>
            <StatusLine><span>学校档案</span><strong>{state.schools.length} 所</strong></StatusLine>
            <StatusLine><span>覆盖城市</span><strong>{cityOptions.length} 个</strong></StatusLine>
            <StatusLine><span>内容线索</span><strong>{contentSchools} 所</strong></StatusLine>
            <StatusLine><span>生活画像</span><strong>{surveyStats.surveySchoolCount > 0 ? `${surveyStats.surveySchoolCount} 所` : "整理中"}</strong></StatusLine>
            {state.cities.length > 0 && <StatusLine><span>城市画像</span><strong>{state.cities.length} 份</strong></StatusLine>}
          </StatusPanel>
        </Header>

        {(state.notice || state.error) && (
          <Notice $error={Boolean(state.error)}>
            {state.error ? <AlertCircle /> : <CheckCircle2 />}
            <span>{state.error || state.notice}</span>
          </Notice>
        )}

        <CommandBar>
          <SearchBox>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索学校、城市、类型、层次，例如 南京 / 双一流 / 师范 / 苏州大学"
            />
          </SearchBox>
          <ResetButton type="button" onClick={clearFilters}>
            <RotateCcw />
            重置筛选{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </ResetButton>
        </CommandBar>

        <ControlDeck>
          <FilterPassport>
            <PassportHead>
              <strong>当前筛选护照</strong>
              <span>{filteredSchools.length} 所进入候选池</span>
            </PassportHead>
            <PassportGrid>
              <PassportCell $tone="warm">
                <span>城市范围</span>
                <strong>{filterPassport.cityText}</strong>
              </PassportCell>
              <PassportCell $tone="blue">
                <span>学校层次</span>
                <strong>{filterPassport.levelText}</strong>
              </PassportCell>
              <PassportCell $tone="green">
                <span>学校类型</span>
                <strong>{filterPassport.typeText}</strong>
              </PassportCell>
              <PassportCell>
                <span>关键词</span>
                <strong>{filterPassport.keywordText}</strong>
              </PassportCell>
            </PassportGrid>
          </FilterPassport>

          <CompareDock>
            <PassportHead>
              <strong>候选对比</strong>
              <span>{compareSchools.length}/3</span>
            </PassportHead>
            <CompareSlots>
              {[0, 1, 2].map((slot) => {
                const school = compareSchools[slot];
                return school ? (
                  <CompareSlot key={school.id} type="button" onClick={() => openMap(school)}>
                    <strong>{school.name}</strong>
                    <span>{displayCity(school)} · {displayLevel(school)}</span>
                  </CompareSlot>
                ) : (
                  <CompareSlot key={slot} type="button" $empty>
                    <strong>空位</strong>
                    <span>加入学校</span>
                  </CompareSlot>
                );
              })}
            </CompareSlots>
            <CompareHint>在学校行里点“加入对比”，先收拢 2 到 3 所，再进入地图档案细看生活画像。</CompareHint>
          </CompareDock>
        </ControlDeck>

        <Layout>
          <FilterPanel>
            <PanelTitle><span>筛选条件</span><SlidersHorizontal /></PanelTitle>
            <Field>
              城市
              <select value={city} onChange={(event) => setCity(event.target.value)}>
                <option value="all">全部城市</option>
                {cityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field>
              学校层次
              <select value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="all">全部层次</option>
                {levelOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field>
              学校类型
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="all">全部类型</option>
                {typeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <div>
              <PanelTitle><span>快捷城市</span></PanelTitle>
              <ChipGroup>
                {cityStats.slice(0, 6).map((item) => (
                  <FilterChip
                    key={item.name}
                    type="button"
                    $active={city === item.name}
                    onClick={() => setCity(city === item.name ? "all" : item.name)}
                  >
                    {item.name}
                  </FilterChip>
                ))}
              </ChipGroup>
            </div>
          </FilterPanel>

          <ResultsPanel>
            <ResultsHead>
              <ResultsTitle>
                <strong>{filteredSchools.length} 所学校匹配当前条件</strong>
                <span>每一行都可以加入对比，或继续进入地图、经验和问答。</span>
              </ResultsTitle>
              <SortSelect value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                <option value="hot">按热度排序</option>
                <option value="favorite">按收藏排序</option>
                <option value="coverage">按资料完整度排序</option>
                <option value="city">按城市排序</option>
                <option value="name">按名称排序</option>
              </SortSelect>
            </ResultsHead>

            <SchoolList>
              {state.loading && [0, 1, 2, 3].map((item) => (
                <Skeleton key={item}><span /><span /><span /></Skeleton>
              ))}
              {!state.loading && filteredSchools.length === 0 && (
                <Empty>没有找到匹配学校，可以换一个城市、层次或关键词。</Empty>
              )}
              {!state.loading && filteredSchools.map((school, index) => {
                const cityName = displayCity(school);
                const levelName = displayLevel(school);
                const typeName = displayType(school);
                const coverage = coverageOf(school);
                const expCount = experienceCountMap.get(school.name) ?? 0;
                const questionCount = qaCountMap.get(school.name) ?? 0;
                const hotScore = Math.min(100, Math.max(0, school.hotScore ?? 0));
                const detail = detailMap[school.id];
                const survey = detail?.lifeSurvey;
                const surveyItems = getLifeSurveyItems(survey);
                const surveyCoverage = getLifeSurveyCoverage(survey);
                const surveyHighlights = getLifeSurveyHighlights(survey, 2);
                const isCompared = compareIds.includes(school.id);
                return (
                  <SchoolRow key={`${school.id}-${school.name}`} $selected={isCompared}>
                    <SchoolRank>{String(index + 1).padStart(2, "0")}</SchoolRank>
                    <div>
                      <SchoolName>{school.name}</SchoolName>
                      <MetaRow>
                        <MetaPill $tone="warm"><MapPin />{cityName}</MetaPill>
                        <MetaPill $tone="blue"><School />{levelName}</MetaPill>
                        <MetaPill $tone="green">{typeName}</MetaPill>
                      </MetaRow>
                      <Brief>{compactBrief(school)}</Brief>
                      {surveyHighlights.length > 0 && (
                        <SurveyPreview>
                          {surveyHighlights.map((item) => (
                            <SurveyFact key={item.key}>
                              <strong>{item.label}</strong>
                              <span>{clipSurveySummary(item.summary, 36)}</span>
                            </SurveyFact>
                          ))}
                        </SurveyPreview>
                      )}
                    </div>

                    <SignalStack>
                      <SignalLine><span>热度</span><Meter><MeterFill $value={hotScore} /></Meter><span>{hotScore}</span></SignalLine>
                      <SignalLine><span>资料</span><Meter><MeterFill $value={coverage} $tone="blue" /></Meter><span>{coverage}%</span></SignalLine>
                      <SignalLine><span>生活</span><Meter><MeterFill $value={surveyCoverage} $tone="green" /></Meter><span>{surveyCoverage > 0 ? `${surveyCoverage}%` : "待"}</span></SignalLine>
                      <MetaRow>
                        <MetaPill $tone={surveyItems.length > 0 ? "green" : "warm"}><Database />{surveySignalLabel(survey)}</MetaPill>
                        <MetaPill><BookOpen />{expCount} 经验</MetaPill>
                        <MetaPill><MessageCircle />{questionCount} 问答</MetaPill>
                      </MetaRow>
                    </SignalStack>

                    <ActionColumn>
                      <ActionButton $primary type="button" onClick={() => openMap(school)}>地图档案<ArrowRight /></ActionButton>
                      <ActionButton $active={isCompared} type="button" onClick={() => toggleCompare(school)}>{isCompared ? "移出对比" : "加入对比"}<BarChart3 /></ActionButton>
                      <ActionButton type="button" onClick={() => openExperiences(school)}>看经验<BookOpen /></ActionButton>
                      <ActionButton type="button" onClick={() => openQA(school)}>查问答<MessageCircle /></ActionButton>
                      {school.website && <ActionButton type="button" onClick={() => openWebsite(school)}>官网<ExternalLink /></ActionButton>}
                    </ActionColumn>
                  </SchoolRow>
                );
              })}
            </SchoolList>
          </ResultsPanel>

          <InsightRail>
            <InsightPanel>
              <PanelTitle><span>城市分布</span><BarChart3 /></PanelTitle>
              <CityList>
                {cityStats.map((item) => {
                  const value = state.schools.length > 0 ? (item.count / state.schools.length) * 100 : 0;
                  return (
                    <CityButton
                      key={item.name}
                      type="button"
                      $active={city === item.name}
                      onClick={() => setCity(city === item.name ? "all" : item.name)}
                    >
                      <CityLine><span>{item.name}</span><span>{item.count} 所</span></CityLine>
                      <Meter><MeterFill $value={value} $tone="blue" /></Meter>
                    </CityButton>
                  );
                })}
              </CityList>
            </InsightPanel>

            <InsightPanel>
              <PanelTitle><span>资料画像</span><Database /></PanelTitle>
              <SignalStack>
                <SignalLine><span>平均资料</span><Meter><MeterFill $value={averageCoverage} $tone="blue" /></Meter><span>{averageCoverage}%</span></SignalLine>
                <SignalLine><span>生活画像</span><Meter><MeterFill $value={surveyStats.averageSurveyCoverage} $tone="green" /></Meter><span>{surveyStats.surveySchoolCount}所</span></SignalLine>
                <SignalLine><span>画像强度</span><Meter><MeterFill $value={surveyStats.averageSurveySignal} /></Meter><span>{surveyStats.averageSurveySignal}%</span></SignalLine>
                <SignalLine><span>经验覆盖</span><Meter><MeterFill $value={Math.min(100, (experienceCountMap.size / Math.max(1, state.schools.length)) * 100)} $tone="green" /></Meter><span>{experienceCountMap.size}</span></SignalLine>
                <SignalLine><span>问答覆盖</span><Meter><MeterFill $value={Math.min(100, (qaCountMap.size / Math.max(1, state.schools.length)) * 100)} /></Meter><span>{qaCountMap.size}</span></SignalLine>
              </SignalStack>
              <Notice>
                <AlertCircle />
                <span>生活画像把宿舍、外卖、门禁、交通等维度拆开，进入学校地图档案后可以继续点击查看。</span>
              </Notice>
            </InsightPanel>
          </InsightRail>
        </Layout>
      </Shell>
    </Page>
  );
}
