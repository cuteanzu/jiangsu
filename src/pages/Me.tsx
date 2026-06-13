import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  ExternalLink,
  GraduationCap,
  History,
  ListChecks,
  LogOut,
  MapPin,
  MessageCircle,
  Route,
  School,
  Search,
  Settings,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import CampusAtmosphere from "../components/CampusAtmosphere";
import { useTransition } from "../context/useTransition";
import {
  CATEGORY_META,
  EXPERIENCES,
  QA_ENTRIES,
  type ExperiencePost,
  type QAEntry,
} from "../data/mock-content";
import { UNIVERSITIES } from "../data/jiangsu-universities";
import {
  AUDIENCE_ROLE_LABELS,
  AUDIENCE_ROLE_ORDER,
  type AudienceRole,
  useAudienceRole,
} from "../hooks/useAudienceRole";

type TabKey = "schools" | "questions" | "notes" | "history";

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

type TrackedSchool = {
  name: string;
  city: string;
  tier: string;
  status: string;
  reason: string;
  progress: number;
  tags: string[];
};

const rolePlans: Record<AudienceRole, RolePlan> = {
  gaokao: {
    title: "把目标学校压到可以比较的范围",
    note: "先确定城市、层次和专业方向，再用经验和问答验证真实校园生活。",
    nextStep: "添加 3 所想比较的学校",
    primary: {
      label: "打开江苏地图",
      description: "按城市和学校层次筛第一轮名单。",
      path: "/jiangsu",
      icon: MapPin,
    },
    secondary: {
      label: "看择校问答",
      description: "先解决城市、层次、专业和转专业问题。",
      path: "/qa",
      icon: MessageCircle,
    },
    focus: ["城市生活成本", "学校层次", "专业匹配", "就业去向"],
    checklist: ["收藏目标学校", "查看宿舍和食堂经验", "确认转专业政策", "把城市放进对比"],
  },
  freshman: {
    title: "把入学前的不确定感降下来",
    note: "优先看校区、宿舍、食堂、交通和开学准备，先把第一周过顺。",
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
    title: "整理下一步发展路径",
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

const trackedSchools: TrackedSchool[] = [
  {
    name: "苏州大学",
    city: "苏州",
    tier: "211",
    status: "重点比较",
    reason: "城市体验和校园生活都值得继续看",
    progress: 78,
    tags: ["古城校区", "城市生活", "新生体验"],
  },
  {
    name: "南京师范大学",
    city: "南京",
    tier: "双一流",
    status: "补充信息",
    reason: "文科资源强，需要继续确认专业和校区",
    progress: 62,
    tags: ["专业学习", "仙林校区", "保研"],
  },
  {
    name: "江南大学",
    city: "无锡",
    tier: "211",
    status: "候选观察",
    reason: "城市舒适度高，适合放进第二梯队",
    progress: 46,
    tags: ["无锡", "生活成本", "就业"],
  },
];

const tabItems: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
  { key: "schools", label: "学校清单", icon: School },
  { key: "questions", label: "我的问答", icon: MessageCircle },
  { key: "notes", label: "保存经验", icon: BookOpen },
  { key: "history", label: "最近浏览", icon: History },
];

const creatorProof = [
  { value: String(UNIVERSITIES.length), label: "高校数据" },
  { value: "13", label: "城市入口" },
  { value: "4", label: "核心模块" },
  { value: "持续", label: "维护状态" },
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
  grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.22fr);
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

  @media (max-width: 760px) {
    margin-top: 12px;
  }
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

  svg {
    width: 14px;
    height: 14px;
  }
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
    max-width: 56ch;
    margin: 5px 0 0;
    color: oklch(48% 0.028 62);
    font-size: 13px;
    line-height: 1.7;
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

const SchoolList = styled.div`
  display: grid;
  gap: 10px;
`;

const SchoolRow = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
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

const MiniTag = styled.span`
  color: oklch(44% 0.032 62);
  border: 1px solid oklch(84% 0.026 74 / 0.58);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 760;
`;

const ProgressBox = styled.div`
  display: grid;
  gap: 8px;

  span {
    color: oklch(45% 0.03 62);
    font-size: 12px;
    font-weight: 780;
  }
`;

const ProgressTrack = styled.div`
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: oklch(90% 0.018 70 / 0.82);
`;

const ProgressFill = styled.div<{ $value: number }>`
  width: ${(p) => p.$value}%;
  height: 100%;
  border-radius: inherit;
  background: oklch(58% 0.12 42);
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

const CategoryPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 999px;
  background: ${(p) => p.$color}16;
  color: ${(p) => p.$color};
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

function pickPosts(ids: string[]): ExperiencePost[] {
  return ids
    .map((id) => EXPERIENCES.find((post) => post.id === id))
    .filter((post): post is ExperiencePost => Boolean(post));
}

function pickQuestions(ids: string[]): QAEntry[] {
  return ids
    .map((id) => QA_ENTRIES.find((entry) => entry.id === id))
    .filter((entry): entry is QAEntry => Boolean(entry));
}

function clip(text: string, max = 86) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function Me() {
  const { navigateWithTransition } = useTransition();
  const { role, roleLabel, setRole } = useAudienceRole();
  const [tab, setTab] = useState<TabKey>("schools");
  const plan = rolePlans[role];
  const PrimaryIcon = plan.primary.icon;
  const SecondaryIcon = plan.secondary.icon;

  const savedPosts = useMemo(() => pickPosts(["exp-3", "exp-5", "exp-6"]), []);
  const savedQuestions = useMemo(() => pickQuestions(["qa-6", "qa-5", "qa-8"]), []);
  const recentPosts = useMemo(() => [...EXPERIENCES].sort((a, b) => b.likes - a.likes).slice(0, 3), []);

  const go = (path: string) => navigateWithTransition(path);

  const metrics = [
    { value: trackedSchools.length, label: "收藏学校" },
    { value: 2, label: "对比清单" },
    { value: savedQuestions.length, label: "关注问答" },
    { value: savedPosts.length, label: "保存经验" },
  ];

  const renderFeed = () => {
    if (tab === "schools") {
      return (
        <SchoolList>
          {trackedSchools.map((school) => (
            <SchoolRow key={school.name} type="button" onClick={() => go("/jiangsu")}>
              <div>
                <SchoolName>
                  <strong>{school.name}</strong>
                  <Tag>{school.tier}</Tag>
                  <MiniTag>{school.city}</MiniTag>
                </SchoolName>
                <Muted>{school.reason}</Muted>
                <TagLine>
                  {school.tags.map((tag) => (
                    <MiniTag key={tag}>{tag}</MiniTag>
                  ))}
                </TagLine>
              </div>
              <ProgressBox>
                <span>{school.status}</span>
                <ProgressTrack>
                  <ProgressFill $value={school.progress} />
                </ProgressTrack>
                <span>{school.progress}% 信息已看</span>
              </ProgressBox>
            </SchoolRow>
          ))}
        </SchoolList>
      );
    }

    if (tab === "questions") {
      return (
        <FeedList>
          {savedQuestions.map((entry) => (
            <FeedRow key={entry.id} type="button" onClick={() => go("/qa")}>
              <FeedMeta>
                <CategoryPill $color="#4a8eb5">问答</CategoryPill>
                {entry.schoolName && <span>{entry.schoolName}</span>}
                <span>{entry.likes} 收藏</span>
              </FeedMeta>
              <FeedTitle>{entry.question}</FeedTitle>
              <FeedText>{clip(entry.answer)}</FeedText>
            </FeedRow>
          ))}
        </FeedList>
      );
    }

    if (tab === "notes") {
      return (
        <FeedList>
          {savedPosts.map((post) => {
            const meta = CATEGORY_META[post.category];
            return (
              <FeedRow key={post.id} type="button" onClick={() => go("/experiences")}>
                <FeedMeta>
                  <CategoryPill $color={meta.color}>{meta.label}</CategoryPill>
                  <span>{post.schoolName}</span>
                  <span>{post.likes} 喜欢</span>
                </FeedMeta>
                <FeedTitle>{post.title}</FeedTitle>
                <FeedText>{post.excerpt}</FeedText>
              </FeedRow>
            );
          })}
        </FeedList>
      );
    }

    return (
      <FeedList>
        {recentPosts.map((post) => {
          const meta = CATEGORY_META[post.category];
          return (
            <FeedRow key={post.id} type="button" onClick={() => go("/experiences")}>
              <FeedMeta>
                <CategoryPill $color={meta.color}>最近看过</CategoryPill>
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
  };

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
                  <UserName>访客用户</UserName>
                  <UserMeta>当前身份：{roleLabel}</UserMeta>
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
                <SmallButton type="button">
                  <Settings />
                  设置
                </SmallButton>
                <SmallButton type="button" onClick={() => go("/login")}>
                  <LogOut />
                  退出
                </SmallButton>
              </AccountActions>
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
                  <h3>我的学校清单</h3>
                  <p>把想看的学校固定下来，再围绕城市、专业、生活体验和问答逐步补证据。</p>
                </div>
                <TextButton type="button" onClick={() => go("/jiangsu")}>
                  去地图补充
                  <ArrowRight />
                </TextButton>
              </SectionHead>
              <SchoolList>
                {trackedSchools.map((school) => (
                  <SchoolRow key={school.name} type="button" onClick={() => go("/jiangsu")}>
                    <div>
                      <SchoolName>
                        <strong>{school.name}</strong>
                        <Tag>{school.status}</Tag>
                        <MiniTag>{school.city}</MiniTag>
                        <MiniTag>{school.tier}</MiniTag>
                      </SchoolName>
                      <Muted>{school.reason}</Muted>
                      <TagLine>
                        {school.tags.map((tag) => (
                          <MiniTag key={tag}>{tag}</MiniTag>
                        ))}
                      </TagLine>
                    </div>
                    <ProgressBox>
                      <span>资料完整度</span>
                      <ProgressTrack>
                        <ProgressFill $value={school.progress} />
                      </ProgressTrack>
                      <span>{school.progress}%</span>
                    </ProgressBox>
                  </SchoolRow>
                ))}
              </SchoolList>
            </SectionPanel>

            <SectionPanel>
              <SectionHead>
                <div>
                  <h3>个人资产</h3>
                  <p>收藏、问答、经验和浏览记录放在一个地方，下一次回来不用重新找。</p>
                </div>
              </SectionHead>
              <AssetTabs>
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.key;
                  return (
                    <TabButton
                      key={item.key}
                      type="button"
                      $active={active}
                      onClick={() => setTab(item.key)}
                    >
                      <Icon />
                      {item.label}
                    </TabButton>
                  );
                })}
              </AssetTabs>
              {renderFeed()}
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
                  网站缔造者
                </CreatorBadge>
                <CreatorName>cuteanzu 在搭建这张江苏高校地图</CreatorName>
                <CreatorCopy>
                  这个站不是随手拼出来的页面。数据整理、地图交互、经验内容、问答结构、后端接口和上线流程都在持续打磨，目标是把零散的高校信息变成真正可用的择校工具。
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
                  <CreatorLink
                    href="https://github.com/cuteanzu/jiangsu"
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看项目仓库
                    <ExternalLink />
                  </CreatorLink>
                  <CreatorLink
                    href="https://github.com/orgs/cuteanzu/repositories"
                    target="_blank"
                    rel="noreferrer"
                  >
                    了解更多作品
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
