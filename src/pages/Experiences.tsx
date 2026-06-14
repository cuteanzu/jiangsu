import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
  RotateCcw,
  Search as SearchIcon,
  School,
  Sparkles,
} from "lucide-react";
import {
  CATEGORY_META,
  EXPERIENCES,
  type ExperiencePost,
  type PostCategory,
} from "../data/mock-content";
import {
  AUDIENCE_ROLE_LABELS,
  AUDIENCE_ROLE_ORDER,
  type AudienceRole,
  useAudienceRole,
} from "../hooks/useAudienceRole";
import CampusAtmosphere from "../components/CampusAtmosphere";
import { contentApi } from "../services/api";
import { useTransition } from "../context/useTransition";
import type { ExperienceDTO } from "../services/types";

const reveal = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  position: relative;
  isolation: isolate;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 38px 30px 72px;
  background: oklch(96.5% 0.018 82);
  color: oklch(25% 0.035 55);
  font-family: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;

  @media (max-width: 720px) {
    padding: 24px 14px 44px;
  }
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1200px, 100%);
  margin: 0 auto;
`;

const Hero = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 24px;
  align-items: end;
  min-height: 252px;
  animation: ${reveal} 0.44s ease-out both;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: oklch(47% 0.12 43);
  font-size: 12px;
  font-weight: 900;
`;

const Title = styled.h1`
  max-width: 10ch;
  margin: 0;
  color: oklch(20% 0.032 52);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(42px, 7vw, 86px);
  line-height: 0.96;
  font-weight: 950;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  max-width: 58ch;
  margin: 20px 0 0;
  color: oklch(45% 0.03 62);
  font-size: 15px;
  line-height: 1.9;
`;

const Briefing = styled.aside`
  border: 1px solid oklch(82% 0.032 70 / 0.58);
  border-radius: 8px;
  background: oklch(98.5% 0.01 82 / 0.74);
  box-shadow: 0 18px 46px oklch(44% 0.04 52 / 0.11);
  overflow: hidden;
`;

const BriefingHead = styled.div`
  padding: 16px 18px 14px;
  border-bottom: 1px solid oklch(84% 0.026 72 / 0.62);
`;

const BriefingLabel = styled.div`
  color: oklch(47% 0.11 42);
  font-size: 11px;
  font-weight: 900;
`;

const BriefingTitle = styled.div`
  margin-top: 7px;
  color: oklch(23% 0.035 54);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 900;
`;

const BriefingBody = styled.div`
  padding: 14px 18px 16px;
  display: grid;
  gap: 12px;
`;

const MetricLine = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const Metric = styled.div`
  min-width: 0;
  padding: 8px;
  border: 1px solid oklch(84% 0.025 72 / 0.66);
  border-radius: 7px;
  background: oklch(99% 0.008 82 / 0.72);

  strong {
    display: block;
    color: oklch(29% 0.05 51);
    font-size: 18px;
    line-height: 1;
    font-weight: 950;
  }

  span {
    display: block;
    margin-top: 4px;
    color: oklch(50% 0.03 62);
    font-size: 10px;
    font-weight: 800;
    white-space: nowrap;
  }
`;

const BriefingCopy = styled.p`
  margin: 0;
  color: oklch(43% 0.035 62);
  font-size: 12.5px;
  line-height: 1.75;
`;

const ControlDesk = styled.section`
  margin-top: 28px;
  padding: 14px;
  border: 1px solid oklch(84% 0.026 72 / 0.7);
  border-radius: 8px;
  background: oklch(98.5% 0.01 82 / 0.72);
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const SearchBox = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: oklch(58% 0.04 62);
  }

  input {
    width: 100%;
    min-height: 44px;
    padding: 0 14px 0 40px;
    border: 1px solid oklch(82% 0.03 72 / 0.78);
    border-radius: 8px;
    background: oklch(99% 0.008 82 / 0.78);
    color: oklch(25% 0.035 55);
    font: inherit;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: oklch(62% 0.12 43 / 0.72);
      box-shadow: 0 0 0 3px oklch(75% 0.08 48 / 0.18);
    }

    &::placeholder {
      color: oklch(58% 0.026 64);
    }
  }
`;

const FilterStack = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`;

const ButtonRail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const RailLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  color: oklch(45% 0.04 62);
  font-size: 12px;
  font-weight: 900;

  svg {
    width: 14px;
    height: 14px;
    color: oklch(50% 0.11 43);
  }
`;

const PillButton = styled.button<{ $active: boolean; $accent?: string }>`
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid ${({ $active, $accent }) => ($active ? $accent ?? "oklch(55% 0.11 43)" : "oklch(83% 0.028 72 / 0.7)")};
  border-radius: 999px;
  background: ${({ $active, $accent }) => ($active ? `${$accent ?? "#c76b5e"}18` : "oklch(99% 0.008 82 / 0.64)")};
  color: ${({ $active, $accent }) => ($active ? $accent ?? "#9a4f3f" : "oklch(42% 0.03 62)")};
  cursor: pointer;
  font: inherit;
  font-size: 12.5px;
  font-weight: 850;
  white-space: nowrap;
  transition: transform 0.16s ease, border-color 0.16s ease, color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $accent }) => $accent ?? "#c76b5e"};
  }

  &:focus-visible {
    outline: 3px solid oklch(76% 0.08 48 / 0.22);
    outline-offset: 2px;
  }
`;

const ActiveLine = styled.div`
  min-height: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: oklch(47% 0.03 62);
  font-size: 12px;
`;

const FilterPill = styled.span`
  max-width: min(100%, 260px);
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid oklch(78% 0.04 62 / 0.5);
  border-radius: 999px;
  background: oklch(97% 0.014 78 / 0.74);
  color: oklch(43% 0.07 45);
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ResetButton = styled.button`
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid oklch(82% 0.028 72 / 0.72);
  border-radius: 7px;
  background: oklch(99% 0.008 82 / 0.62);
  color: oklch(46% 0.04 62);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font: inherit;
  font-size: 12px;
  font-weight: 850;

  svg {
    width: 13px;
    height: 13px;
  }
`;

const Workbench = styled.main`
  margin-top: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 312px;
  gap: 24px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: oklch(23% 0.035 54);
    font-family: "Noto Serif SC", "Songti SC", serif;
    font-size: 26px;
    line-height: 1.2;
  }

  p {
    margin: 5px 0 0;
    color: oklch(50% 0.03 62);
    font-size: 13px;
    line-height: 1.55;
  }
`;

const LeadNote = styled.button`
  width: 100%;
  min-height: 308px;
  padding: 24px;
  border: 1px solid oklch(80% 0.035 70 / 0.7);
  border-radius: 8px;
  background:
    linear-gradient(135deg, oklch(99% 0.008 82 / 0.82), oklch(96% 0.018 78 / 0.72)),
    radial-gradient(circle at 84% 18%, oklch(68% 0.11 42 / 0.12), transparent 32%);
  color: inherit;
  cursor: pointer;
  text-align: left;
  display: grid;
  align-content: space-between;
  box-shadow: 0 18px 42px oklch(44% 0.04 52 / 0.1);
  transition: transform 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: oklch(70% 0.09 42 / 0.48);
  }

  &:focus-visible {
    outline: 3px solid oklch(76% 0.08 48 / 0.22);
    outline-offset: 3px;
  }
`;

const NoteCode = styled.div`
  color: oklch(46% 0.1 43);
  font-size: 11px;
  font-weight: 950;
`;

const Tag = styled.span<{ $color: string }>`
  display: inline-flex;
  width: fit-content;
  min-height: 24px;
  padding: 0 9px;
  align-items: center;
  border-radius: 999px;
  background: ${(p) => p.$color}16;
  color: ${(p) => p.$color};
  font-size: 11px;
  font-weight: 900;
`;

const LeadTitle = styled.h3`
  max-width: 17ch;
  margin: 14px 0 12px;
  color: oklch(20% 0.032 52);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.12;
  font-weight: 950;
`;

const Excerpt = styled.p`
  max-width: 64ch;
  margin: 0;
  color: oklch(43% 0.032 62);
  font-size: 13.5px;
  line-height: 1.78;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
  color: oklch(51% 0.03 62);
  font-size: 12px;
  font-weight: 800;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const NoteStream = styled.div`
  margin-top: 18px;
  display: grid;
  gap: 10px;
`;

const NoteItem = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
  border: 1px solid oklch(84% 0.026 72 / 0.62);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.56);
  color: inherit;
  cursor: pointer;
  text-align: left;
  font: inherit;
  animation: ${reveal} 0.34s ease-out both;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(74% 0.055 62 / 0.68);
  }

  &:focus-visible {
    outline: 3px solid oklch(76% 0.08 48 / 0.22);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const NoteIndex = styled.div`
  color: oklch(54% 0.07 42);
  font-size: 12px;
  font-weight: 950;
`;

const NoteTitle = styled.h3`
  margin: 9px 0 8px;
  color: oklch(23% 0.035 54);
  font-size: 18px;
  line-height: 1.42;
  font-weight: 950;
`;

const Verdict = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const VerdictPill = styled.span`
  min-height: 23px;
  padding: 0 8px;
  border-radius: 999px;
  background: oklch(95% 0.018 205 / 0.82);
  color: oklch(39% 0.065 205);
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 850;
`;

const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  color: oklch(47% 0.11 43);
  font-size: 12px;
  font-weight: 900;

  svg {
    width: 13px;
    height: 13px;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 20px;
  display: grid;
  gap: 14px;

  @media (max-width: 980px) {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const SidePanel = styled.section`
  padding: 16px;
  border: 1px solid oklch(84% 0.026 72 / 0.62);
  border-radius: 8px;
  background: oklch(98.6% 0.01 82 / 0.7);
`;

const SideTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: oklch(24% 0.035 54);
  font-size: 14px;
  font-weight: 950;

  svg {
    width: 15px;
    height: 15px;
    color: oklch(48% 0.11 43);
  }
`;

const SideList = styled.div`
  display: grid;
  gap: 8px;
`;

const SideItem = styled.button`
  width: 100%;
  min-height: 42px;
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  font: inherit;

  strong {
    display: block;
    color: oklch(31% 0.035 56);
    font-size: 12.5px;
    line-height: 1.45;
  }

  span {
    display: block;
    margin-top: 3px;
    color: oklch(54% 0.028 62);
    font-size: 11px;
  }

  &:hover strong {
    color: oklch(47% 0.11 43);
  }
`;

const SchoolRow = styled.button<{ $active?: boolean }>`
  width: 100%;
  min-height: 36px;
  padding: 0 8px;
  border: 0;
  border-radius: 7px;
  background: ${(p) => (p.$active ? "oklch(94% 0.03 54 / 0.72)" : "transparent")};
  color: ${(p) => (p.$active ? "oklch(43% 0.09 43)" : "oklch(40% 0.03 62)")};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  font: inherit;
  font-size: 12.5px;
  font-weight: 850;

  &:hover {
    background: oklch(95.5% 0.018 72 / 0.8);
  }
`;

const CountPill = styled.span`
  min-width: 28px;
  min-height: 21px;
  padding: 0 7px;
  border-radius: 999px;
  background: oklch(94% 0.028 52 / 0.84);
  color: oklch(44% 0.09 43);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
`;

const Empty = styled.div`
  padding: 54px 0;
  color: oklch(54% 0.03 62);
  text-align: center;
  font-size: 14px;
`;

const SyncNotice = styled.div<{ $error?: boolean }>`
  margin: 18px 0 0;
  border: 1px solid ${({ $error }) => ($error ? "oklch(72% 0.09 32 / 0.54)" : "oklch(78% 0.045 66 / 0.58)")};
  border-radius: 8px;
  background: ${({ $error }) => ($error ? "oklch(96% 0.026 36 / 0.58)" : "oklch(97% 0.018 62 / 0.62)")};
  color: ${({ $error }) => ($error ? "oklch(42% 0.12 32)" : "oklch(42% 0.035 58)")};
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.6;
`;

const ALL_CATEGORIES: (PostCategory | "all")[] = [
  "all",
  "freshman",
  "dorm",
  "cafeteria",
  "study",
  "city-life",
  "exam",
  "career",
];

const ROLE_EXPERIENCE_GUIDES: Record<AudienceRole, {
  title: string;
  description: string;
  categories: PostCategory[];
}> = {
  gaokao: {
    title: "先看择校、城市和专业体验",
    description: "默认把择校避坑、城市生活、专业学习和就业方向相关笔记排在前面。",
    categories: ["freshman", "city-life", "study", "career"],
  },
  freshman: {
    title: "先看入学生活和校园适应",
    description: "默认把新生避坑、宿舍、食堂和城市适应相关笔记排在前面。",
    categories: ["freshman", "dorm", "cafeteria", "city-life"],
  },
  college: {
    title: "先看成长路径和发展机会",
    description: "默认把考研保研、就业实习、专业学习和城市机会相关笔记排在前面。",
    categories: ["exam", "career", "study", "city-life"],
  },
};

const CATEGORY_VERDICTS: Record<PostCategory, string> = {
  dorm: "住宿体感",
  cafeteria: "日常补给",
  study: "课程强度",
  freshman: "新生适应",
  "city-life": "城市节奏",
  exam: "升学路径",
  career: "就业去向",
};

function isPostCategory(value: unknown): value is PostCategory {
  return typeof value === "string" && value in CATEGORY_META;
}

function getCategoryMeta(category: PostCategory | "all") {
  return category === "all" ? { label: "推荐", color: "#9a5a3b" } : CATEGORY_META[category] ?? { label: "校园经验", color: "#9a5a3b" };
}

function getCategoryVerdict(category: PostCategory) {
  return CATEGORY_VERDICTS[category] ?? "校园线索";
}

function sortForRole(list: ExperiencePost[], role: AudienceRole) {
  const guide = ROLE_EXPERIENCE_GUIDES[role];
  const priority = new Map(guide.categories.map((cat, index) => [cat, index]));
  return [...list].sort((a, b) => {
    const categoryDelta = (priority.get(a.category) ?? 99) - (priority.get(b.category) ?? 99);
    if (categoryDelta !== 0) return categoryDelta;
    return b.likes + b.comments - (a.likes + a.comments);
  });
}

function heatOf(item: ExperiencePost) {
  return item.likes + item.comments;
}

function normalizeTags(tags: unknown): string[] {
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0) : [];
}

function fallbackExcerpt(body: string, excerpt?: string | null) {
  if (excerpt?.trim()) return excerpt;
  const firstLine = body.split(/\n+/)[0]?.trim() ?? body;
  return firstLine.length > 86 ? `${firstLine.slice(0, 86)}...` : firstLine;
}

function toExperiencePost(item: ExperienceDTO, index: number): ExperiencePost {
  const category = isPostCategory(item.category) ? item.category : "freshman";
  const body = item.body?.trim() || item.excerpt?.trim() || "这条校园经验暂时只有简要信息，后续可以在后台继续补充正文。";
  return {
    id: item.id || `remote-exp-${index}`,
    category,
    schoolId: item.schoolId || "",
    schoolName: item.schoolName || "未关联学校",
    city: item.city || "江苏",
    title: item.title || "未命名校园经验",
    excerpt: fallbackExcerpt(body, item.excerpt),
    body,
    likes: item.likes ?? 0,
    comments: item.comments ?? 0,
    tags: normalizeTags(item.tags),
  };
}

function searchInExperiences(list: ExperiencePost[], term: string) {
  const keyword = term.trim().toLowerCase();
  if (!keyword) return list;
  return list.filter((item) => [item.title, item.excerpt, item.body, item.schoolName, item.city, ...item.tags]
    .join(" ")
    .toLowerCase()
    .includes(keyword));
}

export default function Experiences() {
  const [searchParams] = useSearchParams();
  const requestedSchool = searchParams.get("school")?.trim() || null;
  const { navigateWithTransition } = useTransition();
  const { role, setRole } = useAudienceRole();
  const [activeCat, setActiveCat] = useState<PostCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState<string | null>(() => requestedSchool);
  const [remotePosts, setRemotePosts] = useState<ExperiencePost[] | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentNotice, setContentNotice] = useState("");
  const [contentNoticeIsError, setContentNoticeIsError] = useState(false);
  const roleGuide = ROLE_EXPERIENCE_GUIDES[role];
  const posts = remotePosts ?? EXPERIENCES;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setContentLoading(true);
      setContentNotice("");
      setContentNoticeIsError(false);
      contentApi.experiences()
        .then((data) => {
          if (!active) return;
          const normalized = Array.isArray(data) ? data.map(toExperiencePost) : [];
          if (normalized.length > 0) {
            setRemotePosts(normalized);
            setContentNotice(`已同步后端经验库：${normalized.length} 条`);
            setContentNoticeIsError(false);
          } else {
            setRemotePosts(null);
            setContentNotice("后端经验库暂时为空，当前展示本地精选内容。");
            setContentNoticeIsError(false);
          }
        })
        .catch(() => {
          if (!active) return;
          setRemotePosts(null);
          setContentNotice("后端经验接口暂时不可用，当前展示本地精选内容。");
          setContentNoticeIsError(true);
        })
        .finally(() => {
          if (active) setContentLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const nextSchool = searchParams.get("school")?.trim() || null;
    setSchoolFilter(nextSchool);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = activeCat === "all" ? sortForRole(posts, role) : posts.filter((item) => item.category === activeCat);
    if (query.trim()) list = searchInExperiences(list, query);
    if (schoolFilter) list = list.filter((item) => item.schoolName === schoolFilter);
    return list;
  }, [activeCat, posts, query, role, schoolFilter]);

  const leadNote = filtered[0] ?? null;
  const hasManualFilter = activeCat !== "all" || Boolean(query.trim()) || Boolean(schoolFilter);

  const hotPosts = useMemo(
    () => [...posts].sort((a, b) => heatOf(b) - heatOf(a)).slice(0, 5),
    [posts],
  );

  const schoolStats = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((item) => {
      map.set(item.schoolName, (map.get(item.schoolName) ?? 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
      .slice(0, 6);
  }, [posts]);

  const clearFilters = () => {
    setActiveCat("all");
    setQuery("");
    setSchoolFilter(null);
  };

  const openPost = (id: string) => {
    navigateWithTransition(`/experiences/${encodeURIComponent(id)}`);
  };

  const handleItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPost(id);
  };

  const handleRoleSelect = (nextRole: AudienceRole) => {
    setRole(nextRole);
    setActiveCat("all");
    setSchoolFilter(null);
  };

  const openPostFromSidebar = (item: ExperiencePost) => {
    openPost(item.id);
  };

  const renderMeta = (item: ExperiencePost) => (
    <MetaRow>
      <span><School size={14} />{item.schoolName}</span>
      <span><MapPin size={14} />{item.city}</span>
      <span><Heart size={14} />{item.likes}</span>
      <span><MessageCircle size={14} />{item.comments}</span>
    </MetaRow>
  );

  return (
    <Page>
      <CampusAtmosphere variant="notes" />
      <Shell>
        <Hero>
          <div>
            <Kicker>
              <BookOpen size={15} />
              CAMPUS FIELD NOTES
            </Kicker>
            <Title>校园现场笔记</Title>
            <Subtitle>
              把宿舍、食堂、专业、城市和升学就业拆成一张张现场切片。先看真实体感，再决定要不要把这所学校放进你的志愿清单。
            </Subtitle>
            {(contentLoading || contentNotice) && (
              <SyncNotice $error={contentNoticeIsError}>
                {contentLoading ? "正在同步后端经验库..." : contentNotice}
              </SyncNotice>
            )}
          </div>

          <Briefing>
            <BriefingHead>
              <BriefingLabel>当前侦察视角</BriefingLabel>
              <BriefingTitle>{roleGuide.title}</BriefingTitle>
            </BriefingHead>
            <BriefingBody>
              <MetricLine>
                <Metric>
                  <strong>{filtered.length}</strong>
                  <span>匹配笔记</span>
                </Metric>
                <Metric>
                  <strong>{schoolStats.length}</strong>
                  <span>高频学校</span>
                </Metric>
                <Metric>
                  <strong>{hotPosts[0] ? heatOf(hotPosts[0]) : 0}</strong>
                  <span>最高热度</span>
                </Metric>
              </MetricLine>
              <BriefingCopy>{roleGuide.description}</BriefingCopy>
            </BriefingBody>
          </Briefing>
        </Hero>

        <ControlDesk>
          <SearchBox>
            <SearchIcon />
            <input
              placeholder="搜索学校、城市、宿舍、食堂、考研..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
          </SearchBox>

          <FilterStack>
            <ButtonRail>
              <RailLabel>
                <Sparkles />
                我想看
              </RailLabel>
              {AUDIENCE_ROLE_ORDER.map((item) => (
                <PillButton
                  key={item}
                  type="button"
                  $active={role === item}
                  $accent="#9a5a3b"
                  onClick={() => handleRoleSelect(item)}
                >
                  {AUDIENCE_ROLE_LABELS[item]}
                </PillButton>
              ))}
            </ButtonRail>

            <ButtonRail>
              {ALL_CATEGORIES.map((category) => {
                const meta = getCategoryMeta(category);
                return (
                  <PillButton
                    key={category}
                    type="button"
                    $active={activeCat === category}
                    $accent={meta.color}
                    onClick={() => {
                      setActiveCat(category);
                    }}
                  >
                    {meta.label}
                  </PillButton>
                );
              })}
            </ButtonRail>

            <ActiveLine>
              <span>{roleGuide.title}，当前显示 {filtered.length} 条</span>
              {activeCat !== "all" && <FilterPill>分类：{getCategoryMeta(activeCat).label}</FilterPill>}
              {query.trim() && <FilterPill>搜索：{query.trim()}</FilterPill>}
              {schoolFilter && <FilterPill>学校：{schoolFilter}</FilterPill>}
              {hasManualFilter && (
                <ResetButton type="button" onClick={clearFilters}>
                  <RotateCcw />
                  重置
                </ResetButton>
              )}
            </ActiveLine>
          </FilterStack>
        </ControlDesk>

        <Workbench>
          <section>
            <SectionHeader>
              <div>
                <h2>本轮重点</h2>
                <p>先读第一条，再沿着下方档案继续扫。</p>
              </div>
            </SectionHeader>

            {leadNote ? (
              <LeadNote type="button" onClick={() => openPost(leadNote.id)}>
                <div>
                  <NoteCode>FIELD NOTE 01</NoteCode>
                  <Tag $color={getCategoryMeta(leadNote.category).color}>
                    {getCategoryMeta(leadNote.category).label}
                  </Tag>
                  <LeadTitle>{leadNote.title}</LeadTitle>
                  <Excerpt>{leadNote.excerpt}</Excerpt>
                </div>
                {renderMeta(leadNote)}
              </LeadNote>
            ) : (
              <Empty>没有找到匹配的校园笔记</Empty>
            )}

            {filtered.length > 0 && (
              <NoteStream>
                {filtered.map((item, index) => {
                  const meta = getCategoryMeta(item.category);
                  return (
                    <NoteItem
                      key={item.id}
                      type="button"
                      style={{ animationDelay: `${0.03 * (index % 8)}s` }}
                      onClick={() => openPost(item.id)}
                      onKeyDown={(event) => handleItemKeyDown(event, item.id)}
                    >
                      <NoteIndex>#{String(index + 1).padStart(2, "0")}</NoteIndex>
                      <div>
                        <Tag $color={meta.color}>{meta.label}</Tag>
                        <NoteTitle>{item.title}</NoteTitle>
                        <Excerpt>{item.excerpt}</Excerpt>
                        <Verdict>
                          <VerdictPill>{getCategoryVerdict(item.category)}</VerdictPill>
                          {item.tags.slice(0, 3).map((tag) => (
                            <VerdictPill key={tag}>{tag}</VerdictPill>
                          ))}
                        </Verdict>
                        {renderMeta(item)}
                        <ReadMore>
                          进入阅读页
                          <ArrowRight />
                        </ReadMore>
                      </div>
                    </NoteItem>
                  );
                })}
              </NoteStream>
            )}
          </section>

          <Sidebar>
            <SidePanel>
              <SideTitle>
                <Flame />
                正在被反复查看
              </SideTitle>
              <SideList>
                {hotPosts.map((item) => (
                  <SideItem key={item.id} type="button" onClick={() => openPostFromSidebar(item)}>
                    <strong>{item.title}</strong>
                    <span>{item.schoolName} · {heatOf(item)} 热度</span>
                  </SideItem>
                ))}
              </SideList>
            </SidePanel>

            <SidePanel>
              <SideTitle>
                <School />
                高频学校档案
              </SideTitle>
              <SideList>
                {schoolStats.map(([school, count]) => (
                  <SchoolRow
                    key={school}
                    type="button"
                    $active={schoolFilter === school}
                    onClick={() => {
                      setSchoolFilter(school);
                    }}
                  >
                    <span>{school}</span>
                    <CountPill>{count}</CountPill>
                  </SchoolRow>
                ))}
              </SideList>
            </SidePanel>
          </Sidebar>
        </Workbench>
      </Shell>
    </Page>
  );
}
