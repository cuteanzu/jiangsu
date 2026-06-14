import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import styled, { keyframes } from "styled-components";
import {
  BookOpen,
  ChevronDown,
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
  QA_ENTRIES,
  type PostCategory,
  type QAEntry,
} from "../data/mock-content";
import { UNIVERSITIES } from "../data/jiangsu-universities";
import {
  AUDIENCE_ROLE_LABELS,
  AUDIENCE_ROLE_ORDER,
  type AudienceRole,
  useAudienceRole,
} from "../hooks/useAudienceRole";
import CampusAtmosphere from "../components/CampusAtmosphere";
import { contentApi } from "../services/api";
import type { QADTO } from "../services/types";

const lift = keyframes`
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
  background: oklch(96% 0.014 197);
  color: oklch(23% 0.035 58);
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
  grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
  gap: 24px;
  align-items: end;
  min-height: 250px;
  animation: ${lift} 0.44s ease-out both;

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
  color: oklch(42% 0.09 205);
  font-size: 12px;
  font-weight: 950;
`;

const Title = styled.h1`
  max-width: 9ch;
  margin: 0;
  color: oklch(18% 0.035 58);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(42px, 7vw, 84px);
  line-height: 0.96;
  font-weight: 950;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  max-width: 58ch;
  margin: 20px 0 0;
  color: oklch(42% 0.032 70);
  font-size: 15px;
  line-height: 1.9;
`;

const IntakePanel = styled.aside`
  border: 1px solid oklch(80% 0.035 190 / 0.48);
  border-radius: 8px;
  background: oklch(98.4% 0.01 100 / 0.76);
  overflow: hidden;
  box-shadow: 0 18px 46px oklch(38% 0.04 195 / 0.12);
`;

const IntakeHead = styled.div`
  padding: 16px 18px 14px;
  border-bottom: 1px solid oklch(83% 0.028 190 / 0.45);
`;

const IntakeLabel = styled.div`
  color: oklch(42% 0.09 205);
  font-size: 11px;
  font-weight: 950;
`;

const IntakeTitle = styled.div`
  margin-top: 7px;
  color: oklch(20% 0.035 58);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 900;
`;

const IntakeBody = styled.div`
  padding: 14px 18px 16px;
  display: grid;
  gap: 12px;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const StatusCell = styled.div`
  min-width: 0;
  padding: 8px;
  border: 1px solid oklch(84% 0.025 190 / 0.45);
  border-radius: 7px;
  background: oklch(99% 0.006 100 / 0.72);

  strong {
    display: block;
    color: oklch(26% 0.045 205);
    font-size: 18px;
    line-height: 1;
    font-weight: 950;
  }

  span {
    display: block;
    margin-top: 4px;
    color: oklch(47% 0.032 70);
    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
  }
`;

const IntakeCopy = styled.p`
  margin: 0;
  color: oklch(42% 0.032 70);
  font-size: 12.5px;
  line-height: 1.75;
`;

const ControlBoard = styled.section`
  margin-top: 28px;
  display: grid;
  grid-template-columns: minmax(280px, 420px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const SearchBox = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: oklch(53% 0.04 200);
  }

  input {
    width: 100%;
    min-height: 50px;
    padding: 0 14px 0 42px;
    border: 1px solid oklch(80% 0.032 190 / 0.56);
    border-radius: 8px;
    background: oklch(99% 0.006 100 / 0.76);
    color: oklch(23% 0.035 58);
    font: inherit;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: oklch(56% 0.09 205 / 0.72);
      box-shadow: 0 0 0 3px oklch(75% 0.07 205 / 0.2);
    }
  }
`;

const FilterBoard = styled.div`
  padding: 12px;
  border: 1px solid oklch(82% 0.026 105 / 0.62);
  border-radius: 8px;
  background: oklch(98.5% 0.008 98 / 0.68);
  display: grid;
  gap: 10px;
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
  color: oklch(42% 0.032 70);
  font-size: 12px;
  font-weight: 950;

  svg {
    width: 14px;
    height: 14px;
    color: oklch(42% 0.09 205);
  }
`;

const PillButton = styled.button<{ $active: boolean; $accent?: string }>`
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid ${({ $active, $accent }) => ($active ? $accent ?? "#4a8eb5" : "oklch(82% 0.026 105 / 0.58)")};
  border-radius: 999px;
  background: ${({ $active, $accent }) => ($active ? `${$accent ?? "#4a8eb5"}18` : "oklch(99% 0.006 100 / 0.6)")};
  color: ${({ $active, $accent }) => ($active ? $accent ?? "#2e6f91" : "oklch(39% 0.032 70)")};
  cursor: pointer;
  font: inherit;
  font-size: 12.5px;
  font-weight: 850;
  white-space: nowrap;
  transition: transform 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $accent }) => $accent ?? "#4a8eb5"};
  }

  &:focus-visible {
    outline: 3px solid oklch(75% 0.07 205 / 0.22);
    outline-offset: 2px;
  }
`;

const ActiveLine = styled.div`
  min-height: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: oklch(45% 0.03 70);
  font-size: 12px;
`;

const FilterPill = styled.span`
  max-width: min(100%, 260px);
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid oklch(75% 0.045 195 / 0.5);
  border-radius: 999px;
  background: oklch(96% 0.018 195 / 0.66);
  color: oklch(38% 0.07 205);
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ResetButton = styled.button`
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid oklch(82% 0.026 105 / 0.62);
  border-radius: 7px;
  background: oklch(99% 0.006 100 / 0.62);
  color: oklch(42% 0.032 70);
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

const Workspace = styled.main`
  margin-top: 28px;
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr) 286px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1120px) {
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const ColumnTitle = styled.div`
  margin-bottom: 12px;

  h2 {
    margin: 0;
    color: oklch(21% 0.035 58);
    font-family: "Noto Serif SC", "Songti SC", serif;
    font-size: 24px;
    line-height: 1.2;
  }

  p {
    margin: 5px 0 0;
    color: oklch(47% 0.032 70);
    font-size: 12.5px;
    line-height: 1.55;
  }
`;

const PriorityStack = styled.section`
  display: grid;
  gap: 10px;
`;

const PriorityQuestion = styled.button<{ $active?: boolean }>`
  width: 100%;
  padding: 16px;
  border: 1px solid ${({ $active }) => ($active ? "oklch(61% 0.09 205 / 0.62)" : "oklch(82% 0.026 105 / 0.62)")};
  border-radius: 8px;
  background: ${({ $active }) => ($active ? "oklch(96% 0.02 195 / 0.82)" : "oklch(99% 0.006 100 / 0.66)")};
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: transform 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(68% 0.06 195 / 0.6);
  }

  strong {
    display: block;
    margin-top: 9px;
    color: oklch(22% 0.035 58);
    font-size: 15px;
    line-height: 1.5;
  }

  p {
    margin: 8px 0 0;
    color: oklch(43% 0.032 70);
    font-size: 12.5px;
    line-height: 1.65;
  }
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

const Queue = styled.section`
  display: grid;
  gap: 10px;
`;

const QAItem = styled.div<{ $expanded: boolean }>`
  padding: 18px;
  border: 1px solid ${({ $expanded }) => ($expanded ? "oklch(61% 0.09 205 / 0.62)" : "oklch(82% 0.026 105 / 0.62)")};
  border-radius: 8px;
  background: ${({ $expanded }) => ($expanded ? "oklch(97% 0.018 195 / 0.82)" : "oklch(99% 0.006 100 / 0.62)")};
  cursor: pointer;
  animation: ${lift} 0.34s ease-out both;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(68% 0.06 195 / 0.6);
  }

  &:focus-visible {
    outline: 3px solid oklch(75% 0.07 205 / 0.22);
    outline-offset: 2px;
  }
`;

const QuestionRow = styled.div`
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 22px;
  gap: 12px;
  align-items: start;

  @media (max-width: 560px) {
    grid-template-columns: 32px minmax(0, 1fr);
  }
`;

const QMark = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: oklch(93% 0.035 195 / 0.82);
  color: oklch(38% 0.09 205);
  font-size: 17px;
  font-weight: 950;

  @media (max-width: 560px) {
    width: 32px;
    height: 32px;
  }
`;

const QuestionText = styled.h3`
  margin: 9px 0 10px;
  color: oklch(22% 0.035 58);
  font-size: 18px;
  line-height: 1.46;
  font-weight: 950;
`;

const ShortAnswer = styled.p`
  margin: 0 0 12px;
  color: oklch(41% 0.032 70);
  font-size: 13.5px;
  line-height: 1.75;
`;

const Answer = styled.div`
  margin: 14px 0 14px;
  padding-top: 14px;
  border-top: 1px solid oklch(83% 0.028 190 / 0.46);
  color: oklch(31% 0.035 58);
  font-size: 14px;
  line-height: 1.95;
`;

const Chevron = styled(ChevronDown)<{ $expanded: boolean }>`
  width: 18px;
  height: 18px;
  color: oklch(52% 0.052 200);
  margin-top: 8px;
  transition: transform 0.2s ease;
  transform: rotate(${(p) => (p.$expanded ? "180deg" : "0deg")});

  @media (max-width: 560px) {
    display: none;
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  color: oklch(50% 0.032 70);
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

const FollowUps = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
`;

const FollowButton = styled.button`
  min-height: 28px;
  max-width: 100%;
  padding: 0 9px;
  border: 1px solid oklch(78% 0.04 190 / 0.52);
  border-radius: 999px;
  background: oklch(98% 0.01 100 / 0.7);
  color: oklch(36% 0.07 205);
  cursor: pointer;
  font: inherit;
  font-size: 11.5px;
  font-weight: 850;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    border-color: oklch(62% 0.08 205 / 0.68);
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 20px;
  display: grid;
  gap: 14px;

  @media (max-width: 1120px) {
    position: static;
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const SidePanel = styled.section`
  padding: 16px;
  border: 1px solid oklch(82% 0.026 105 / 0.62);
  border-radius: 8px;
  background: oklch(98.5% 0.008 98 / 0.68);
`;

const SideTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: oklch(22% 0.035 58);
  font-size: 14px;
  font-weight: 950;

  svg {
    width: 15px;
    height: 15px;
    color: oklch(42% 0.09 205);
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
    color: oklch(30% 0.035 58);
    font-size: 12.5px;
    line-height: 1.45;
  }

  span {
    display: block;
    margin-top: 3px;
    color: oklch(52% 0.03 70);
    font-size: 11px;
  }

  &:hover strong {
    color: oklch(36% 0.08 205);
  }
`;

const SchoolRow = styled.button<{ $active?: boolean }>`
  width: 100%;
  min-height: 36px;
  padding: 0 8px;
  border: 0;
  border-radius: 7px;
  background: ${(p) => (p.$active ? "oklch(94% 0.026 195 / 0.76)" : "transparent")};
  color: ${(p) => (p.$active ? "oklch(36% 0.08 205)" : "oklch(38% 0.03 70)")};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  font: inherit;
  font-size: 12.5px;
  font-weight: 850;

  &:hover {
    background: oklch(96% 0.014 195 / 0.72);
  }
`;

const CountPill = styled.span`
  min-width: 28px;
  min-height: 21px;
  padding: 0 7px;
  border-radius: 999px;
  background: oklch(93% 0.03 195 / 0.78);
  color: oklch(36% 0.08 205);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
`;

const Empty = styled.div`
  padding: 54px 0;
  color: oklch(52% 0.03 70);
  text-align: center;
  font-size: 14px;
`;

const SyncNotice = styled.div<{ $error?: boolean }>`
  margin: 18px 0 0;
  border: 1px solid ${({ $error }) => ($error ? "oklch(72% 0.09 32 / 0.54)" : "oklch(75% 0.042 195 / 0.54)")};
  border-radius: 8px;
  background: ${({ $error }) => ($error ? "oklch(96% 0.026 36 / 0.58)" : "oklch(97% 0.015 195 / 0.58)")};
  color: ${({ $error }) => ($error ? "oklch(42% 0.12 32)" : "oklch(36% 0.062 205)")};
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.6;
`;

const CATEGORY_KEYS: (PostCategory | "all")[] = [
  "all",
  "freshman",
  "dorm",
  "study",
  "city-life",
  "exam",
  "career",
];

const ROLE_QA_GUIDES: Record<AudienceRole, {
  title: string;
  description: string;
  categories: PostCategory[];
}> = {
  gaokao: {
    title: "优先处理择校、城市和政策问题",
    description: "先把学校层次、城市选择、转专业、中外合作和毕业去向相关问题排在前面。",
    categories: ["freshman", "study", "city-life", "career"],
  },
  freshman: {
    title: "优先处理入学生活和适应问题",
    description: "先把宿舍、生活费、转专业和城市适应相关问题排在前面。",
    categories: ["dorm", "city-life", "study", "freshman"],
  },
  college: {
    title: "优先处理成长路径和发展问题",
    description: "先把考研保研、就业去向、转专业和城市机会相关问答排在前面。",
    categories: ["exam", "career", "study", "city-life"],
  },
};

function getCategoryMeta(category: string | "all") {
  if (category === "all") return { label: "推荐", color: "#347895" };
  return CATEGORY_META[category as PostCategory] ?? { label: "问答", color: "#347895" };
}

function toQAEntry(item: QADTO, index: number): QAEntry {
  return {
    id: item.id || `remote-qa-${index}`,
    question: item.question || "未命名问题",
    answer: item.answer || "这条问答暂时只有标题，后续可以在后台继续补充回答。",
    schoolId: item.schoolId || undefined,
    schoolName: item.schoolName || undefined,
    category: item.category || "freshman",
    likes: item.likes ?? 0,
  };
}

function searchInQA(list: QAEntry[], term: string) {
  const keyword = term.trim().toLowerCase();
  if (!keyword) return list;
  return list.filter((item) => [item.question, item.answer, item.schoolName ?? "", item.schoolId ?? "", item.category]
    .join(" ")
    .toLowerCase()
    .includes(keyword));
}

function getQACity(schoolName?: string) {
  if (!schoolName) return null;
  return UNIVERSITIES.find((university) => university.name === schoolName)?.city ?? null;
}

function sortForRole(list: QAEntry[], role: AudienceRole) {
  const guide = ROLE_QA_GUIDES[role];
  const priority = new Map(guide.categories.map((cat, index) => [cat, index]));
  return [...list].sort((a, b) => {
    const aPriority = priority.get(a.category as PostCategory) ?? 99;
    const bPriority = priority.get(b.category as PostCategory) ?? 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.likes - a.likes;
  });
}

function shortAnswer(answer: string) {
  const sentence = answer.split(/[。！？]/)[0]?.trim();
  return sentence ? `${sentence}。` : answer;
}

export default function QA() {
  const { role, setRole } = useAudienceRole();
  const [activeCat, setActiveCat] = useState<PostCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [remoteQuestions, setRemoteQuestions] = useState<QAEntry[] | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentNotice, setContentNotice] = useState("");
  const [contentNoticeIsError, setContentNoticeIsError] = useState(false);
  const roleGuide = ROLE_QA_GUIDES[role];
  const questions = remoteQuestions ?? QA_ENTRIES;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setContentLoading(true);
      setContentNotice("");
      setContentNoticeIsError(false);
      contentApi.qa()
        .then((data) => {
          if (!active) return;
          const normalized = Array.isArray(data) ? data.map(toQAEntry) : [];
          if (normalized.length > 0) {
            setRemoteQuestions(normalized);
            setContentNotice(`已同步后端问答库：${normalized.length} 条`);
            setContentNoticeIsError(false);
          } else {
            setRemoteQuestions(null);
            setContentNotice("后端问答库暂时为空，当前展示本地精选内容。");
            setContentNoticeIsError(false);
          }
        })
        .catch(() => {
          if (!active) return;
          setRemoteQuestions(null);
          setContentNotice("后端问答接口暂时不可用，当前展示本地精选内容。");
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

  const filtered = useMemo(() => {
    let list = activeCat === "all" ? sortForRole(questions, role) : questions.filter((item) => item.category === activeCat);
    if (query.trim()) list = searchInQA(list, query);
    if (schoolFilter) list = list.filter((item) => item.schoolName === schoolFilter);
    return list;
  }, [activeCat, query, questions, role, schoolFilter]);

  const priorityQuestions = filtered.slice(0, 4);
  const hasManualFilter = activeCat !== "all" || Boolean(query.trim()) || Boolean(schoolFilter);

  const hotQuestions = useMemo(
    () => [...questions].sort((a, b) => b.likes - a.likes).slice(0, 5),
    [questions],
  );

  const schoolStats = useMemo(() => {
    const map = new Map<string, number>();
    questions.forEach((item) => {
      if (!item.schoolName) return;
      map.set(item.schoolName, (map.get(item.schoolName) ?? 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
      .slice(0, 6);
  }, [questions]);

  const clearFilters = () => {
    setActiveCat("all");
    setQuery("");
    setSchoolFilter(null);
    setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleRoleSelect = (nextRole: AudienceRole) => {
    setRole(nextRole);
    setActiveCat("all");
    setSchoolFilter(null);
    setExpandedId(null);
  };

  const handleItemKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleExpand(id);
  };

  const openQuestionFromSidebar = (item: QAEntry) => {
    setActiveCat("all");
    setQuery("");
    setSchoolFilter(null);
    setExpandedId(item.id);
  };

  const relatedQuestions = (item: QAEntry) =>
    questions
      .filter((candidate) => candidate.id !== item.id && candidate.category === item.category)
      .slice(0, 3);

  const renderMeta = (item: QAEntry) => {
    const city = getQACity(item.schoolName);
    return (
      <MetaRow>
        {item.schoolName && <span><School size={14} />{item.schoolName}</span>}
        {city && <span><MapPin size={14} />{city}</span>}
        <span><Heart size={14} />{item.likes}</span>
      </MetaRow>
    );
  };

  return (
    <Page>
      <CampusAtmosphere variant="qa" />
      <Shell>
        <Hero>
          <div>
            <Kicker>
              <MessageCircle size={15} />
              QUESTION TRIAGE
            </Kicker>
            <Title>问题分诊台</Title>
            <Subtitle>
              把择校、入学、专业、城市和发展问题先分诊，再给出一句话结论和完整解释。少翻列表，先找到你真正卡住的地方。
            </Subtitle>
            {(contentLoading || contentNotice) && (
              <SyncNotice $error={contentNoticeIsError}>
                {contentLoading ? "正在同步后端问答库..." : contentNotice}
              </SyncNotice>
            )}
          </div>

          <IntakePanel>
            <IntakeHead>
              <IntakeLabel>当前处理队列</IntakeLabel>
              <IntakeTitle>{roleGuide.title}</IntakeTitle>
            </IntakeHead>
            <IntakeBody>
              <StatusGrid>
                <StatusCell>
                  <strong>{filtered.length}</strong>
                  <span>匹配问题</span>
                </StatusCell>
                <StatusCell>
                  <strong>{priorityQuestions.length}</strong>
                  <span>优先处理</span>
                </StatusCell>
                <StatusCell>
                  <strong>{hotQuestions[0]?.likes ?? 0}</strong>
                  <span>最高收藏</span>
                </StatusCell>
              </StatusGrid>
              <IntakeCopy>{roleGuide.description}</IntakeCopy>
            </IntakeBody>
          </IntakePanel>
        </Hero>

        <ControlBoard>
          <SearchBox>
            <SearchIcon />
            <input
              placeholder="搜索问题、学校、转专业、生活费、考研..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setExpandedId(null);
              }}
            />
          </SearchBox>

          <FilterBoard>
            <ButtonRail>
              <RailLabel>
                <Sparkles />
                我现在是
              </RailLabel>
              {AUDIENCE_ROLE_ORDER.map((item) => (
                <PillButton
                  key={item}
                  type="button"
                  $active={role === item}
                  $accent="#347895"
                  onClick={() => handleRoleSelect(item)}
                >
                  {AUDIENCE_ROLE_LABELS[item]}
                </PillButton>
              ))}
            </ButtonRail>

            <ButtonRail>
              {CATEGORY_KEYS.map((category) => {
                const meta = getCategoryMeta(category);
                return (
                  <PillButton
                    key={category}
                    type="button"
                    $active={activeCat === category}
                    $accent={meta.color}
                    onClick={() => {
                      setActiveCat(category);
                      setExpandedId(null);
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
          </FilterBoard>
        </ControlBoard>

        <Workspace>
          <section>
            <ColumnTitle>
              <h2>优先处理</h2>
              <p>先看最可能影响决策的几个问题。</p>
            </ColumnTitle>
            <PriorityStack>
              {priorityQuestions.map((item) => (
                <PriorityQuestion
                  key={item.id}
                  type="button"
                  $active={expandedId === item.id}
                  onClick={() => toggleExpand(item.id)}
                >
                  <Tag $color={getCategoryMeta(item.category).color}>
                    {getCategoryMeta(item.category).label}
                  </Tag>
                  <strong>{item.question}</strong>
                  <p>{shortAnswer(item.answer)}</p>
                </PriorityQuestion>
              ))}
            </PriorityStack>
          </section>

          <section>
            <ColumnTitle>
              <h2>问答队列</h2>
              <p>展开后会显示完整回答和下一步追问。</p>
            </ColumnTitle>

            {filtered.length === 0 ? (
              <Empty>没有找到匹配的问答</Empty>
            ) : (
              <Queue>
                {filtered.map((item, index) => {
                  const expanded = expandedId === item.id;
                  const meta = getCategoryMeta(item.category);
                  return (
                    <QAItem
                      key={item.id}
                      $expanded={expanded}
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      style={{ animationDelay: `${0.03 * (index % 8)}s` }}
                      onClick={() => toggleExpand(item.id)}
                      onKeyDown={(event) => handleItemKeyDown(event, item.id)}
                    >
                      <QuestionRow>
                        <QMark>Q</QMark>
                        <div>
                          <Tag $color={meta.color}>{meta.label}</Tag>
                          <QuestionText>{item.question}</QuestionText>
                          {!expanded && <ShortAnswer>{shortAnswer(item.answer)}</ShortAnswer>}
                          {expanded && (
                            <>
                              <Answer>{item.answer}</Answer>
                              <FollowUps>
                                {relatedQuestions(item).map((related) => (
                                  <FollowButton
                                    key={related.id}
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setExpandedId(related.id);
                                    }}
                                  >
                                    {related.question}
                                  </FollowButton>
                                ))}
                              </FollowUps>
                            </>
                          )}
                          {renderMeta(item)}
                        </div>
                        <Chevron $expanded={expanded} />
                      </QuestionRow>
                    </QAItem>
                  );
                })}
              </Queue>
            )}
          </section>

          <Sidebar>
            <SidePanel>
              <SideTitle>
                <Flame />
                追问热区
              </SideTitle>
              <SideList>
                {hotQuestions.map((item) => (
                  <SideItem key={item.id} type="button" onClick={() => openQuestionFromSidebar(item)}>
                    <strong>{item.question}</strong>
                    <span>{item.likes} 收藏</span>
                  </SideItem>
                ))}
              </SideList>
            </SidePanel>

            <SidePanel>
              <SideTitle>
                <BookOpen />
                高频学校
              </SideTitle>
              <SideList>
                {schoolStats.map(([school, count]) => (
                  <SchoolRow
                    key={school}
                    type="button"
                    $active={schoolFilter === school}
                    onClick={() => {
                      setSchoolFilter(school);
                      setExpandedId(null);
                    }}
                  >
                    <span>{school}</span>
                    <CountPill>{count}</CountPill>
                  </SchoolRow>
                ))}
              </SideList>
            </SidePanel>
          </Sidebar>
        </Workspace>
      </Shell>
    </Page>
  );
}
