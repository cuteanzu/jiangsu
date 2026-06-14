import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Compass,
  Database,
  ExternalLink,
  GraduationCap,
  Heart,
  Inbox,
  ListChecks,
  LogOut,
  MapPin,
  MessageCircle,
  PenLine,
  Route,
  Save,
  School,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import CampusAtmosphere from "../components/CampusAtmosphere";
import { useTransition } from "../context/useTransition";
import { CATEGORY_META, EXPERIENCES, type ExperiencePost } from "../data/mock-content";
import { UNIVERSITIES } from "../data/jiangsu-universities";
import {
  AUDIENCE_ROLE_LABELS,
  AUDIENCE_ROLE_ORDER,
  type AudienceRole,
  useAudienceRole,
} from "../hooks/useAudienceRole";
import { useAuth } from "../hooks/useAuth";
import { ApiError, authApi, userApi } from "../services/api";
import type { SchoolDTO, SubmissionDTO } from "../services/types";

type TabKey = "schools" | "submissions" | "next";
type SubmissionType = "EXPERIENCE" | "QUESTION" | "CORRECTION" | "SUGGESTION";

const SUBMISSION_TYPE_VALUES: SubmissionType[] = ["EXPERIENCE", "QUESTION", "CORRECTION", "SUGGESTION"];

function readSubmissionTypeParam(value: string | null): SubmissionType | null {
  const normalized = value?.trim().toUpperCase();
  return SUBMISSION_TYPE_VALUES.includes(normalized as SubmissionType) ? (normalized as SubmissionType) : null;
}

type RouteAction = {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
};

type RolePlan = {
  title: string;
  note: string;
  nextStep: string;
  primary: RouteAction;
  secondary: RouteAction;
  focus: string[];
  checklist: string[];
};

const rolePlans: Record<AudienceRole, RolePlan> = {
  gaokao: {
    title: "把目标学校压到可比较的范围",
    note: "先固定城市、层次和专业方向，再用真实经验验证校园生活。",
    nextStep: "收藏 3 所想比较的学校",
    primary: {
      label: "打开江苏地图",
      description: "按城市和学校层次筛第一轮名单。",
      path: "/jiangsu",
      icon: MapPin,
    },
    secondary: {
      label: "查看择校问答",
      description: "先解决城市、层次、专业和转专业问题。",
      path: "/qa",
      icon: MessageCircle,
    },
    focus: ["城市成本", "学校层次", "专业匹配", "就业去向"],
    checklist: ["收藏目标学校", "看宿舍和食堂经验", "确认转专业政策", "把城市放进对比"],
  },
  freshman: {
    title: "把入学前的不确定感降下来",
    note: "优先看校区、宿舍、食堂、交通和开学准备，让第一周更顺。",
    nextStep: "确认录取学校所在校区",
    primary: {
      label: "浏览入学经验",
      description: "从宿舍、食堂、军训和新生避坑开始。",
      path: "/experiences",
      icon: BookOpen,
    },
    secondary: {
      label: "定位学校周边",
      description: "看城市节奏、交通和生活成本。",
      path: "/jiangsu",
      icon: Compass,
    },
    focus: ["校区差异", "宿舍条件", "生活预算", "开学清单"],
    checklist: ["收藏录取学校", "看新生避坑", "记录交通路线", "整理开学问题"],
  },
  college: {
    title: "整理下一步发展的路线",
    note: "把考研、实习、转专业和城市机会放在一起看，减少信息分散。",
    nextStep: "选择一个发展方向继续追踪",
    primary: {
      label: "看成长经验",
      description: "优先看考研、就业、专业学习相关内容。",
      path: "/experiences",
      icon: Route,
    },
    secondary: {
      label: "查发展问答",
      description: "围绕保研、实习和城市选择继续追问。",
      path: "/qa",
      icon: MessageCircle,
    },
    focus: ["考研保研", "实习机会", "专业转向", "城市资源"],
    checklist: ["收藏高频经验", "比较城市机会", "整理问答线索", "记录可行动事项"],
  },
};

const tabItems: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
  { key: "schools", label: "学校清单", icon: School },
  { key: "submissions", label: "我的投稿", icon: ClipboardList },
  { key: "next", label: "推荐下一步", icon: ListChecks },
];

const submissionTypes: Array<{ value: SubmissionType; label: string; hint: string }> = [
  { value: "EXPERIENCE", label: "校园经验", hint: "宿舍、食堂、学习、城市生活都可以写" },
  { value: "QUESTION", label: "问答线索", hint: "把你希望学长学姐回答的问题留下" },
  { value: "CORRECTION", label: "数据纠错", hint: "学校信息、官网、地址、校区等纠错" },
  { value: "SUGGESTION", label: "功能建议", hint: "告诉站长下一步应该补什么" },
];

const creatorProof = [
  { value: String(UNIVERSITIES.length), label: "高校基础数据" },
  { value: "地图", label: "城市探索体验" },
  { value: "账号", label: "收藏投稿闭环" },
  { value: "持续", label: "内容维护" },
];

const Page = styled.div`
  position: relative;
  isolation: isolate;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 34px 28px 58px;
  background: oklch(96.2% 0.014 72);
  color: oklch(24% 0.032 58);
  font-family: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;

  @media (max-width: 760px) {
    padding: 20px 14px 42px;
  }
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
`;

const TopGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
  align-items: stretch;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  border: 1px solid oklch(82% 0.035 70 / 0.54);
  border-radius: 8px;
  background: oklch(98.5% 0.01 78 / 0.82);
  box-shadow: 0 20px 56px oklch(42% 0.04 55 / 0.1);
`;

const Workbench = styled(Panel)`
  display: grid;
  grid-template-columns: minmax(230px, 0.78fr) minmax(0, 1.22fr);
  overflow: hidden;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const IdentityPane = styled.div`
  padding: 24px;
  border-right: 1px solid oklch(84% 0.026 74 / 0.54);
  background: oklch(97% 0.016 72 / 0.64);

  @media (max-width: 820px) {
    border-right: 0;
    border-bottom: 1px solid oklch(84% 0.026 74 / 0.54);
  }

  @media (max-width: 760px) {
    padding: 18px;
  }
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Avatar = styled.div`
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: oklch(42% 0.09 42);
  background: oklch(91% 0.035 72 / 0.86);
  border: 1px solid oklch(76% 0.052 66 / 0.52);

  @media (max-width: 760px) {
    width: 46px;
    height: 46px;
    border-radius: 15px;
  }
`;

const UserName = styled.h1`
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 850;
  color: oklch(23% 0.035 58);

  @media (max-width: 760px) {
    font-size: 21px;
  }
`;

const UserMeta = styled.p`
  margin: 4px 0 0;
  color: oklch(50% 0.028 62);
  font-size: 13px;
`;

const RoleSwitch = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 22px;

  @media (max-width: 760px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
    margin-top: 16px;
  }
`;

const RoleButton = styled.button<{ $active: boolean }>`
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid ${({ $active }) => ($active ? "oklch(68% 0.095 42 / 0.72)" : "oklch(84% 0.026 74 / 0.58)")};
  border-radius: 8px;
  background: ${({ $active }) => ($active ? "oklch(95% 0.025 45 / 0.72)" : "oklch(99% 0.008 78 / 0.66)")};
  color: ${({ $active }) => ($active ? "oklch(43% 0.11 40)" : "oklch(35% 0.03 58)")};
  padding: 0 12px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;

  &:hover {
    border-color: oklch(70% 0.08 48 / 0.72);
    background: oklch(96.5% 0.02 54 / 0.7);
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 760px) {
    min-height: 38px;
    justify-content: center;
    padding: 0 8px;
    font-size: 12px;

    > svg {
      display: none;
    }

    span {
      gap: 5px;
    }
  }
`;

const AccountActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 18px;
`;

const SmallButton = styled.button`
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid oklch(84% 0.026 74 / 0.58);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.58);
  color: oklch(43% 0.036 56);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 760;

  &:hover {
    color: oklch(42% 0.1 42);
    border-color: oklch(74% 0.06 45 / 0.7);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ProfileEditor = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 12px;
`;

const Input = styled.input`
  min-height: 38px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid oklch(84% 0.026 74 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.72);
  color: oklch(26% 0.035 58);
  padding: 0 11px;
  font: inherit;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: oklch(63% 0.105 42 / 0.78);
    box-shadow: 0 0 0 3px oklch(76% 0.06 42 / 0.18);
  }
`;

const Select = styled.select`
  min-height: 38px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid oklch(84% 0.026 74 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.72);
  color: oklch(26% 0.035 58);
  padding: 0 10px;
  font: inherit;
  font-size: 13px;
  outline: none;
`;

const TextArea = styled.textarea`
  min-height: 118px;
  width: 100%;
  resize: vertical;
  box-sizing: border-box;
  border: 1px solid oklch(84% 0.026 74 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.72);
  color: oklch(26% 0.035 58);
  padding: 11px;
  font: inherit;
  font-size: 13px;
  line-height: 1.7;
  outline: none;

  &:focus {
    border-color: oklch(63% 0.105 42 / 0.78);
    box-shadow: 0 0 0 3px oklch(76% 0.06 42 / 0.18);
  }
`;

const InlineMessage = styled.p<{ $error?: boolean }>`
  margin: 0;
  color: ${({ $error }) => ($error ? "oklch(48% 0.15 30)" : "oklch(44% 0.09 145)")};
  font-size: 12px;
  line-height: 1.6;
`;

const ProgressPane = styled.div`
  padding: 26px;
  display: grid;
  align-content: space-between;
  gap: 24px;

  @media (max-width: 760px) {
    padding: 20px 18px;
    gap: 18px;
  }
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: oklch(46% 0.11 42);
  font-size: 12px;
  font-weight: 900;
`;

const Title = styled.h2`
  max-width: 18ch;
  margin: 12px 0 0;
  color: oklch(21% 0.035 56);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 38px;
  line-height: 1.1;
  font-weight: 950;

  @media (max-width: 760px) {
    font-size: 30px;
  }
`;

const Lead = styled.p`
  max-width: 60ch;
  margin: 14px 0 0;
  color: oklch(44% 0.03 62);
  font-size: 14px;
  line-height: 1.9;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PrimaryButton = styled.button`
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid oklch(58% 0.13 42 / 0.72);
  border-radius: 8px;
  background: oklch(58% 0.13 42);
  color: oklch(98% 0.008 70);
  padding: 0 14px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 900;

  &:hover {
    background: oklch(53% 0.13 42);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: oklch(99% 0.008 78 / 0.72);
  color: oklch(33% 0.035 58);
  border-color: oklch(82% 0.03 74 / 0.7);

  &:hover {
    color: oklch(42% 0.1 42);
    background: oklch(97% 0.018 58 / 0.78);
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Metric = styled.div`
  min-width: 0;
  border: 1px solid oklch(84% 0.026 74 / 0.58);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.62);
  padding: 12px;

  strong {
    display: block;
    color: oklch(46% 0.115 42);
    font-size: 25px;
    line-height: 1;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 7px;
    color: oklch(45% 0.03 60);
    font-size: 12px;
    font-weight: 760;
  }
`;

const NextPanel = styled(Panel)`
  padding: 22px;
  display: grid;
  gap: 18px;
`;

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    color: oklch(21% 0.035 56);
    font-size: 18px;
    font-weight: 900;
  }

  svg {
    width: 18px;
    height: 18px;
    color: oklch(46% 0.11 42);
  }
`;

const NextStep = styled.div`
  border: 1px solid oklch(78% 0.054 68 / 0.62);
  border-radius: 8px;
  background: oklch(97% 0.018 62 / 0.72);
  padding: 14px;

  strong {
    display: block;
    color: oklch(24% 0.035 56);
    font-size: 17px;
    line-height: 1.35;
  }

  span {
    display: block;
    margin-top: 7px;
    color: oklch(47% 0.03 62);
    font-size: 13px;
    line-height: 1.65;
  }
`;

const Checklist = styled.div`
  display: grid;
  gap: 9px;
`;

const CheckItem = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  color: oklch(34% 0.032 58);
  font-size: 13px;
  line-height: 1.5;

  svg {
    flex: 0 0 auto;
    width: 15px;
    height: 15px;
    color: oklch(52% 0.1 148);
  }
`;

const MainGrid = styled.main`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  margin-top: 18px;
  align-items: start;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 18px;
`;

const SectionPanel = styled(Panel)`
  padding: 22px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    color: oklch(21% 0.035 56);
    font-size: 20px;
    font-weight: 900;
  }

  p {
    max-width: 58ch;
    margin: 5px 0 0;
    color: oklch(48% 0.028 62);
    font-size: 13px;
    line-height: 1.7;
  }

  @media (max-width: 640px) {
    display: grid;
  }
`;

const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: oklch(44% 0.11 42);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 850;
  padding: 3px 0;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const AssetTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${({ $active }) => ($active ? "oklch(67% 0.095 42 / 0.72)" : "oklch(84% 0.026 74 / 0.58)")};
  border-radius: 8px;
  background: ${({ $active }) => ($active ? "oklch(95% 0.025 45 / 0.72)" : "oklch(99% 0.008 78 / 0.58)")};
  color: ${({ $active }) => ($active ? "oklch(43% 0.11 40)" : "oklch(38% 0.032 58)")};
  padding: 0 11px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 840;

  svg {
    width: 15px;
    height: 15px;
  }
`;

const SchoolList = styled.div`
  display: grid;
  gap: 10px;
`;

const SchoolRow = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 128px;
  gap: 16px;
  align-items: center;
  border: 1px solid oklch(84% 0.026 74 / 0.58);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.58);
  padding: 14px;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(73% 0.06 48 / 0.72);
    background: oklch(99% 0.009 74 / 0.84);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SchoolName = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  strong {
    color: oklch(24% 0.035 56);
    font-size: 17px;
  }
`;

const Tag = styled.span`
  display: inline-flex;
  min-height: 22px;
  align-items: center;
  border-radius: 999px;
  background: oklch(94% 0.028 55 / 0.74);
  color: oklch(45% 0.1 42);
  padding: 0 8px;
  font-size: 11px;
  font-weight: 820;
`;

const MiniTag = styled.span`
  color: oklch(44% 0.032 62);
  border: 1px solid oklch(84% 0.026 74 / 0.58);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 760;
`;

const Muted = styled.p`
  margin: 8px 0 0;
  color: oklch(47% 0.028 62);
  font-size: 13px;
  line-height: 1.7;
`;

const TagLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

const RowStat = styled.div`
  display: grid;
  gap: 8px;
  justify-items: start;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: oklch(45% 0.03 62);
    font-size: 12px;
    font-weight: 780;
  }

  strong {
    color: oklch(44% 0.11 42);
    font-size: 22px;
    line-height: 1;
    font-weight: 900;
  }
`;

const FeedList = styled.div`
  display: grid;
  gap: 10px;
`;

const FeedRow = styled.button`
  width: 100%;
  border: 1px solid oklch(84% 0.026 74 / 0.58);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.58);
  padding: 14px;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(73% 0.06 48 / 0.72);
    background: oklch(99% 0.009 74 / 0.84);
  }
`;

const FeedMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: oklch(50% 0.026 62);
  font-size: 12px;
`;

const CategoryPill = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 999px;
  background: ${({ $color }) => ($color ? `${$color}16` : "oklch(94% 0.028 55 / 0.74)")};
  color: ${({ $color }) => $color ?? "oklch(45% 0.1 42)"};
  padding: 0 8px;
  font-size: 11px;
  font-weight: 840;
`;

const FeedTitle = styled.h4`
  margin: 9px 0 0;
  color: oklch(23% 0.035 56);
  font-size: 16px;
  line-height: 1.45;
  font-weight: 900;
`;

const FeedText = styled.p`
  margin: 7px 0 0;
  color: oklch(47% 0.028 62);
  font-size: 13px;
  line-height: 1.75;
`;

const EmptyState = styled.div`
  border: 1px dashed oklch(78% 0.045 66 / 0.7);
  border-radius: 8px;
  background: oklch(98% 0.012 76 / 0.64);
  padding: 18px;
  display: grid;
  gap: 10px;
  color: oklch(45% 0.03 62);

  svg {
    width: 18px;
    height: 18px;
    color: oklch(46% 0.11 42);
  }

  strong {
    color: oklch(24% 0.035 56);
    font-size: 15px;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
  }
`;

const Notice = styled.div<{ $error?: boolean }>`
  border: 1px solid ${({ $error }) => ($error ? "oklch(72% 0.09 32 / 0.58)" : "oklch(78% 0.045 66 / 0.62)")};
  border-radius: 8px;
  background: ${({ $error }) => ($error ? "oklch(96% 0.026 36 / 0.62)" : "oklch(97% 0.018 62 / 0.68)")};
  color: ${({ $error }) => ($error ? "oklch(42% 0.12 32)" : "oklch(42% 0.035 58)")};
  padding: 12px;
  display: flex;
  gap: 9px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.65;

  svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    margin-top: 2px;
  }
`;

const FormGrid = styled.form`
  display: grid;
  gap: 10px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  color: oklch(40% 0.034 58);
  font-size: 12px;
  font-weight: 800;
`;

const FormHelper = styled.p`
  margin: 0;
  color: oklch(50% 0.026 62);
  font-size: 12px;
  line-height: 1.65;
`;

const CreatorPanel = styled(Panel)`
  overflow: hidden;
`;

const CreatorHeader = styled.div`
  padding: 22px;
  background:
    linear-gradient(145deg, oklch(95% 0.026 48 / 0.78), oklch(98% 0.011 78 / 0.76));
  border-bottom: 1px solid oklch(84% 0.026 74 / 0.58);
`;

const CreatorBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: oklch(43% 0.11 42);
  font-size: 12px;
  font-weight: 900;
`;

const CreatorName = styled.h3`
  margin: 12px 0 0;
  color: oklch(22% 0.035 56);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 28px;
  line-height: 1.16;
  font-weight: 950;
`;

const CreatorCopy = styled.p`
  margin: 12px 0 0;
  color: oklch(42% 0.03 62);
  font-size: 13px;
  line-height: 1.85;
`;

const CreatorBody = styled.div`
  padding: 18px 22px 22px;
  display: grid;
  gap: 16px;
`;

const ProofGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const Proof = styled.div`
  border: 1px solid oklch(84% 0.026 74 / 0.58);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.56);
  padding: 10px;

  strong {
    display: block;
    color: oklch(43% 0.105 42);
    font-size: 20px;
    line-height: 1;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 7px;
    color: oklch(49% 0.028 62);
    font-size: 12px;
    font-weight: 760;
  }
`;

const CreatorActions = styled.div`
  display: grid;
  gap: 8px;
`;

const CreatorLink = styled.a`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid oklch(82% 0.03 74 / 0.7);
  border-radius: 8px;
  background: oklch(99% 0.008 78 / 0.66);
  color: oklch(30% 0.035 58);
  padding: 0 12px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 850;

  &:hover {
    color: oklch(43% 0.11 42);
    border-color: oklch(72% 0.06 48 / 0.72);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

const FocusPanel = styled(Panel)`
  padding: 20px;
`;

const FocusList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const FocusPill = styled.span`
  border: 1px solid oklch(82% 0.03 74 / 0.62);
  border-radius: 999px;
  background: oklch(99% 0.008 78 / 0.58);
  color: oklch(40% 0.036 58);
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 820;
`;

const Footer = styled.footer`
  margin-top: 28px;
  color: oklch(58% 0.022 62);
  text-align: center;
  font-size: 12px;
`;

function normalizeError(err: unknown) {
  if (err instanceof ApiError) {
    const payload = err.payload;
    if (payload && typeof payload === "object" && "message" in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    return err.message || "请求失败";
  }
  if (err instanceof Error) return err.message;
  return "请求失败，请稍后再试";
}

function clip(text: string, max = 96) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function formatDate(value?: string | null) {
  if (!value) return "刚刚";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function submissionTypeLabel(type?: string | null) {
  const normalized = (type ?? "").toUpperCase();
  return submissionTypes.find((item) => item.value === normalized)?.label ?? type ?? "投稿";
}

function statusLabel(status?: string | null) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "APPROVED") return "已通过";
  if (normalized === "REJECTED") return "未通过";
  if (normalized === "PENDING") return "待审核";
  return status || "待处理";
}

function statusTone(status?: string | null) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "APPROVED") return "oklch(46% 0.11 145)";
  if (normalized === "REJECTED") return "oklch(46% 0.14 30)";
  return "oklch(45% 0.1 42)";
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function schoolPath(school: SchoolDTO) {
  const matched = UNIVERSITIES.find((item) => item.name === school.name);
  if (matched) {
    return `/jiangsu?city=${encodeURIComponent(matched.city)}&school=${encodeURIComponent(matched.id)}`;
  }
  if (school.cityName) {
    return `/jiangsu?city=${encodeURIComponent(school.cityName.replace(/市$/, ""))}`;
  }
  return "/jiangsu";
}

function pickRecommendedPosts(role: AudienceRole): ExperiencePost[] {
  const categories: Record<AudienceRole, string[]> = {
    gaokao: ["study", "career", "city-life"],
    freshman: ["freshman", "dorm", "cafeteria"],
    college: ["exam", "career", "study"],
  };
  return EXPERIENCES.filter((post) => categories[role].includes(post.category)).slice(0, 3);
}

export default function Me() {
  const { navigateWithTransition } = useTransition();
  const [searchParams] = useSearchParams();
  const { authenticated, error: authError, loading: authLoading, logout, refreshUser, user } = useAuth();
  const { role, roleLabel, setRole } = useAudienceRole();
  const [tab, setTab] = useState<TabKey>("schools");
  const [favorites, setFavorites] = useState<SchoolDTO[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionDTO[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [submitSchoolName, setSubmitSchoolName] = useState("");
  const [submitType, setSubmitType] = useState<SubmissionType>("EXPERIENCE");
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitContent, setSubmitContent] = useState("");
  const [submitContact, setSubmitContact] = useState("");
  const [submitAnonymous, setSubmitAnonymous] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const plan = rolePlans[role];
  const PrimaryIcon = plan.primary.icon;
  const SecondaryIcon = plan.secondary.icon;
  const displayName = user?.nickname || user?.username || "我的账号";
  const recommendedPosts = useMemo(() => pickRecommendedPosts(role), [role]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfileName(user?.nickname || user?.username || "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user?.nickname, user?.username]);

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    const nextSchool = searchParams.get("school")?.trim();
    const nextType = readSubmissionTypeParam(searchParams.get("type"));
    const nextTitle = searchParams.get("title")?.trim();
    const nextContent = searchParams.get("content")?.trim();

    if (nextTab === "submissions" || nextSchool || nextType || nextTitle || nextContent) {
      setTab("submissions");
    }
    if (nextSchool) {
      setSubmitSchoolName(nextSchool);
    }
    if (nextType) {
      setSubmitType(nextType);
    }
    if (nextTitle) {
      setSubmitTitle(nextTitle);
    }
    if (nextContent) {
      setSubmitContent(nextContent);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    const timer = window.setTimeout(() => {
      setAssetsLoading(true);
      setAssetsError("");
      Promise.all([userApi.favorites(), userApi.submissions()])
        .then(([nextFavorites, nextSubmissions]) => {
          if (!active) return;
          setFavorites(ensureArray<SchoolDTO>(nextFavorites));
          setSubmissions(ensureArray<SubmissionDTO>(nextSubmissions));
        })
        .catch((err) => {
          if (!active) return;
          setAssetsError(normalizeError(err));
        })
        .finally(() => {
          if (active) setAssetsLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [authenticated]);

  const go = (path: string) => navigateWithTransition(path);

  const metrics = [
    { value: favorites.length, label: "收藏学校" },
    { value: submissions.length, label: "我的投稿" },
    { value: submissions.filter((item) => (item.status ?? "").toUpperCase() === "PENDING").length, label: "待审核" },
    { value: UNIVERSITIES.length, label: "可探索高校" },
  ];

  const handleLogout = async () => {
    await logout();
    navigateWithTransition("/login");
  };

  const handleSaveProfile = async () => {
    const nextName = profileName.trim();
    if (!nextName) {
      setProfileMessage("昵称不能为空");
      return;
    }

    setProfileSaving(true);
    setProfileMessage("");
    try {
      await authApi.updateProfile({ nickname: nextName });
      await refreshUser();
      setEditingProfile(false);
      setProfileMessage("昵称已更新");
    } catch (err) {
      setProfileMessage(normalizeError(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSubmitContribution = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = submitContent.trim();
    const title = submitTitle.trim();
    const schoolName = submitSchoolName.trim();
    const contact = submitContact.trim();

    if (content.length < 10) {
      setSubmitError("内容至少写 10 个字，方便审核和整理。");
      setSubmitMessage("");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");
    setSubmitMessage("");
    try {
      const created = await userApi.createSubmission({
        schoolName: schoolName || undefined,
        title: title || undefined,
        content,
        type: submitType,
        contact: contact || undefined,
        isAnonymous: submitAnonymous,
      });
      setSubmissions((items) => [created, ...items]);
      setSubmitTitle("");
      setSubmitContent("");
      setSubmitContact("");
      setSubmitAnonymous(false);
      setSubmitMessage("投稿已提交，审核通过后会进入公共内容。");
      setTab("submissions");
    } catch (err) {
      setSubmitError(normalizeError(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderSchools = () => {
    if (assetsLoading) {
      return (
        <Notice>
          <Database />
          <div>正在同步你的收藏学校...</div>
        </Notice>
      );
    }

    if (favorites.length === 0) {
      return (
        <EmptyState>
          <Inbox />
          <strong>还没有收藏学校</strong>
          <p>先去江苏地图里点开高校档案，把真正想比较的学校加入清单。这里会变成你的择校工作台。</p>
          <ActionRow>
            <SecondaryButton type="button" onClick={() => go("/jiangsu")}>
              去地图探索
              <ArrowRight />
            </SecondaryButton>
          </ActionRow>
        </EmptyState>
      );
    }

    return (
      <SchoolList>
        {favorites.map((school) => (
          <SchoolRow key={school.id} type="button" onClick={() => go(schoolPath(school))}>
            <div>
              <SchoolName>
                <strong>{school.name}</strong>
                <Tag>{school.level || school.type || "高校"}</Tag>
                {school.cityName && <MiniTag>{school.cityName}</MiniTag>}
              </SchoolName>
              <Muted>{school.brief || school.address || "已加入你的学校清单，后续可以继续补充经验和问答线索。"}</Muted>
              <TagLine>
                {school.website && <MiniTag>官网已收录</MiniTag>}
                {school.address && <MiniTag>地址已收录</MiniTag>}
                {school.isFavorited && <MiniTag>已收藏</MiniTag>}
              </TagLine>
            </div>
            <RowStat>
              <span>
                <Heart size={12} />
                收藏热度
              </span>
              <strong>{school.favoriteCount ?? 0}</strong>
              <span>热度 {school.hotScore ?? 0}</span>
            </RowStat>
          </SchoolRow>
        ))}
      </SchoolList>
    );
  };

  const renderSubmissions = () => {
    if (assetsLoading) {
      return (
        <Notice>
          <Database />
          <div>正在读取你的投稿记录...</div>
        </Notice>
      );
    }

    if (submissions.length === 0) {
      return (
        <EmptyState>
          <PenLine />
          <strong>还没有投稿</strong>
          <p>你可以提交校园经验、问答线索或数据纠错。内容先进入审核，质量稳定后再公开展示。</p>
        </EmptyState>
      );
    }

    return (
      <FeedList>
        {submissions.map((item) => (
          <FeedRow key={item.id} type="button" onClick={() => setTab("submissions")}>
            <FeedMeta>
              <CategoryPill $color={statusTone(item.status)}>{statusLabel(item.status)}</CategoryPill>
              <span>{submissionTypeLabel(item.type ?? item.category)}</span>
              {item.schoolName && <span>{item.schoolName}</span>}
              <span>{formatDate(item.createdAt)}</span>
            </FeedMeta>
            <FeedTitle>{item.title || "未命名投稿"}</FeedTitle>
            <FeedText>{clip(item.content)}</FeedText>
            {item.rejectReason && <FeedText>未通过原因：{item.rejectReason}</FeedText>}
          </FeedRow>
        ))}
      </FeedList>
    );
  };

  const renderNext = () => (
    <FeedList>
      {recommendedPosts.map((post) => {
        const meta = CATEGORY_META[post.category];
        return (
          <FeedRow key={post.id} type="button" onClick={() => go("/experiences")}>
            <FeedMeta>
              <CategoryPill $color={meta.color}>{meta.label}</CategoryPill>
              <span>{post.schoolName}</span>
              <span>{post.city}</span>
            </FeedMeta>
            <FeedTitle>{post.title}</FeedTitle>
            <FeedText>{post.excerpt}</FeedText>
          </FeedRow>
        );
      })}
    </FeedList>
  );

  const renderAssetBody = () => {
    if (assetsError) {
      return (
        <Notice $error>
          <AlertCircle />
          <div>个人数据暂时无法同步：{assetsError}</div>
        </Notice>
      );
    }
    if (tab === "schools") return renderSchools();
    if (tab === "submissions") return renderSubmissions();
    return renderNext();
  };

  if (authLoading) {
    return (
      <Page>
        <CampusAtmosphere variant="profile" />
        <Shell>
          <Notice>
            <Database />
            <div>正在载入你的账号...</div>
          </Notice>
        </Shell>
      </Page>
    );
  }

  if (!authenticated) {
    return (
      <Page>
        <CampusAtmosphere variant="profile" />
        <Shell>
          <EmptyState>
            <ShieldCheck />
            <strong>登录状态已失效</strong>
            <p>{authError || "请重新登录，再管理你的收藏、投稿和个人资料。"}</p>
            <ActionRow>
              <PrimaryButton type="button" onClick={() => go("/login")}>
                去登录
                <ArrowRight />
              </PrimaryButton>
            </ActionRow>
          </EmptyState>
        </Shell>
      </Page>
    );
  }

  return (
    <Page>
      <CampusAtmosphere variant="profile" />
      <Shell>
        <TopGrid>
          <Workbench>
            <IdentityPane>
              <UserRow>
                <Avatar>
                  <User size={26} />
                </Avatar>
                <div>
                  <UserName>{displayName}</UserName>
                  <UserMeta>
                    {user?.username} · 当前身份：{roleLabel}
                  </UserMeta>
                </div>
              </UserRow>

              <RoleSwitch>
                {AUDIENCE_ROLE_ORDER.map((item) => {
                  const active = role === item;
                  return (
                    <RoleButton
                      key={item}
                      type="button"
                      $active={active}
                      aria-pressed={active}
                      onClick={() => setRole(item)}
                    >
                      <span>
                        <GraduationCap />
                        {AUDIENCE_ROLE_LABELS[item]}
                      </span>
                      {active && <Sparkles />}
                    </RoleButton>
                  );
                })}
              </RoleSwitch>

              <AccountActions>
                <SmallButton type="button" onClick={() => setEditingProfile((value) => !value)}>
                  <Settings />
                  设置
                </SmallButton>
                <SmallButton type="button" onClick={handleLogout}>
                  <LogOut />
                  退出
                </SmallButton>
              </AccountActions>

              {editingProfile && (
                <ProfileEditor>
                  <Input
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    placeholder="设置昵称"
                  />
                  <SmallButton type="button" onClick={handleSaveProfile} disabled={profileSaving}>
                    <Save />
                    {profileSaving ? "保存中" : "保存昵称"}
                  </SmallButton>
                </ProfileEditor>
              )}
              {profileMessage && <InlineMessage $error={profileMessage.includes("失败") || profileMessage.includes("不能为空")}>{profileMessage}</InlineMessage>}
            </IdentityPane>

            <ProgressPane>
              <div>
                <Kicker>
                  <ListChecks size={15} />
                  我的择校工作台
                </Kicker>
                <Title>{plan.title}</Title>
                <Lead>{plan.note}</Lead>
              </div>

              <ActionRow>
                <PrimaryButton type="button" onClick={() => go(plan.primary.path)}>
                  <PrimaryIcon />
                  {plan.primary.label}
                  <ArrowRight />
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => go(plan.secondary.path)}>
                  <SecondaryIcon />
                  {plan.secondary.label}
                </SecondaryButton>
              </ActionRow>

              <MetricGrid>
                {metrics.map((metric) => (
                  <Metric key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </Metric>
                ))}
              </MetricGrid>
            </ProgressPane>
          </Workbench>

          <NextPanel>
            <PanelTitle>
              <h3>下一步</h3>
              <CheckCircle2 />
            </PanelTitle>
            <NextStep>
              <strong>{plan.nextStep}</strong>
              <span>{plan.primary.description}</span>
            </NextStep>
            <Checklist>
              {plan.checklist.map((item) => (
                <CheckItem key={item}>
                  <CheckCircle2 />
                  {item}
                </CheckItem>
              ))}
            </Checklist>
          </NextPanel>
        </TopGrid>

        <MainGrid>
          <Stack>
            <SectionPanel>
              <SectionHead>
                <div>
                  <h3>个人资产</h3>
                  <p>收藏学校、投稿记录和下一步推荐都放在这里。注册账号的价值，是让你的择校线索能持续累积。</p>
                </div>
                <TextButton type="button" onClick={() => go("/jiangsu")}>
                  去地图补充
                  <ArrowRight />
                </TextButton>
              </SectionHead>
              <AssetTabs>
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.key;
                  return (
                    <TabButton key={item.key} type="button" $active={active} onClick={() => setTab(item.key)}>
                      <Icon />
                      {item.label}
                    </TabButton>
                  );
                })}
              </AssetTabs>
              {renderAssetBody()}
            </SectionPanel>

            <SectionPanel>
              <SectionHead>
                <div>
                  <h3>提交内容</h3>
                  <p>你可以把真实校园经验、想追问的问题或数据纠错提交给站点，审核后再进入公共内容。</p>
                </div>
              </SectionHead>
              <FormGrid onSubmit={handleSubmitContribution}>
                <Field>
                  投稿类型
                  <Select value={submitType} onChange={(event) => setSubmitType(event.target.value as SubmissionType)}>
                    {submissionTypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                  <FormHelper>{submissionTypes.find((item) => item.value === submitType)?.hint}</FormHelper>
                </Field>
                <Field>
                  关联学校
                  <Input
                    value={submitSchoolName}
                    onChange={(event) => setSubmitSchoolName(event.target.value)}
                    placeholder="可选，例如南京大学"
                  />
                </Field>
                <Field>
                  标题
                  <Input
                    value={submitTitle}
                    onChange={(event) => setSubmitTitle(event.target.value)}
                    placeholder="可选，但建议写清楚主题"
                  />
                </Field>
                <Field>
                  内容
                  <TextArea
                    value={submitContent}
                    onChange={(event) => setSubmitContent(event.target.value)}
                    placeholder="写下你的经验、问题或纠错信息"
                  />
                </Field>
                <Field>
                  联系方式
                  <Input
                    value={submitContact}
                    onChange={(event) => setSubmitContact(event.target.value)}
                    placeholder="可选，方便站长核对"
                  />
                </Field>
                <CheckItem>
                  <input
                    type="checkbox"
                    checked={submitAnonymous}
                    onChange={(event) => setSubmitAnonymous(event.target.checked)}
                  />
                  匿名提交到公共内容
                </CheckItem>
                <ActionRow>
                  <PrimaryButton type="submit" disabled={submitLoading}>
                    <Send />
                    {submitLoading ? "提交中" : "提交审核"}
                  </PrimaryButton>
                </ActionRow>
                {submitMessage && <InlineMessage>{submitMessage}</InlineMessage>}
                {submitError && <InlineMessage $error>{submitError}</InlineMessage>}
              </FormGrid>
            </SectionPanel>
          </Stack>

          <Stack>
            <FocusPanel>
              <PanelTitle>
                <h3>当前关注</h3>
                <Search />
              </PanelTitle>
              <FocusList>
                {plan.focus.map((item) => (
                  <FocusPill key={item}>{item}</FocusPill>
                ))}
              </FocusList>
            </FocusPanel>

            <CreatorPanel>
              <CreatorHeader>
                <CreatorBadge>
                  <Wrench size={15} />
                  网站创建者
                </CreatorBadge>
                <CreatorName>cuteanzu 正在搭建这张江苏高校地图</CreatorName>
                <CreatorCopy>
                  这个站点背后有高校资料整理、地图交互、内容结构、问答入口、账号体系和上线维护。右侧保留创建者信息，方便补充线索、纠错和合作联系。
                </CreatorCopy>
              </CreatorHeader>
              <CreatorBody>
                <ProofGrid>
                  {creatorProof.map((item) => (
                    <Proof key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </Proof>
                  ))}
                </ProofGrid>
                <CreatorActions>
                  <CreatorLink href="mailto:chenxiang1601@qq.com">
                    chenxiang1601@qq.com
                    <ExternalLink />
                  </CreatorLink>
                  <CreatorLink href="mailto:chenxiang1601@qq.com?subject=江苏校园指北补充与纠错">
                    补充信息或纠错
                    <ExternalLink />
                  </CreatorLink>
                </CreatorActions>
              </CreatorBody>
            </CreatorPanel>
          </Stack>
        </MainGrid>

        <Footer>江苏高校地图，给高考毕业生、准大学生和在校大学生的校园信息工作台。</Footer>
      </Shell>
    </Page>
  );
}
