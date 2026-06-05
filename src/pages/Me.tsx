import { useMemo, useState } from "react";
import { useTransition } from "../context/useTransition";
import styled, { keyframes } from "styled-components";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Compass,
  Edit3,
  ExternalLink,
  GraduationCap,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Route,
  School,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CATEGORY_META,
  EXPERIENCES,
  QA_ENTRIES,
  type ExperiencePost,
  type QAEntry,
} from "../data/mock-content";
import {
  AUDIENCE_ROLE_ORDER,
  useAudienceRole,
  type AudienceRole,
} from "../hooks/useAudienceRole";

interface ActionItem {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

interface FocusItem {
  title: string;
  text: string;
  tag: string;
}

interface RolePlan {
  label: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  avatarLabel: string;
  icon: LucideIcon;
  stats: Array<{ value: string; label: string }>;
  primary: ActionItem;
  secondary: ActionItem;
  quickActions: ActionItem[];
  focus: FocusItem[];
  postIds: string[];
  qaIds: string[];
  empty: {
    favorites: string;
    experiences: string;
    answers: string;
    history: string;
  };
}

const rolePlans: Record<AudienceRole, RolePlan> = {
  gaokao: {
    label: "高考毕业生",
    shortLabel: "高考",
    eyebrow: "择校决策面板",
    title: "先缩小城市和学校范围，再验证真实校园生活。",
    description:
      "把江苏 13 个城市、学校层次、专业方向和生活成本放在同一条线上看，减少盲选。",
    avatarLabel: "选校",
    icon: GraduationCap,
    stats: [
      { value: "13", label: "城市入口" },
      { value: "47", label: "本科高校" },
      { value: "4", label: "择校维度" },
      { value: "8", label: "高频问答" },
    ],
    primary: {
      label: "打开江苏地图",
      description: "从城市分布、学校层次和高校卡片开始筛选。",
      path: "/jiangsu",
      icon: MapPin,
    },
    secondary: {
      label: "看择校问答",
      description: "先看 985/211、城市选择、转专业这些高频问题。",
      path: "/qa",
      icon: MessageCircle,
    },
    quickActions: [
      {
        label: "按城市看学校",
        description: "南京、苏州、无锡、徐州等城市先做第一轮筛选。",
        path: "/jiangsu",
        icon: Search,
      },
      {
        label: "看学校生活",
        description: "宿舍、食堂、城市生活先做预期管理。",
        path: "/experiences",
        icon: BookOpen,
      },
      {
        label: "收藏待比较",
        description: "后续接入账号后，把目标学校加入对比池。",
        path: "/jiangsu",
        icon: Bookmark,
      },
    ],
    focus: [
      {
        title: "先锁定 2-3 个目标城市",
        text: "城市决定生活成本、实习机会、交通和毕业后的第一圈资源。",
        tag: "城市优先",
      },
      {
        title: "不要只看学校层次",
        text: "同一分数段内，专业方向、校区位置、保研和就业路径也会改变体验。",
        tag: "综合判断",
      },
      {
        title: "用真实经验校验宣传信息",
        text: "宿舍、食堂、转专业、校区差异这些细节，通常比招生简介更影响四年生活。",
        tag: "生活验证",
      },
    ],
    postIds: ["exp-9", "exp-5", "exp-10"],
    qaIds: ["qa-6", "qa-5", "qa-8"],
    empty: {
      favorites: "还没有收藏目标高校，可以先从地图里挑 3 所进入待比较。",
      experiences: "还没有保存经验，建议先看城市生活和新生避坑内容。",
      answers: "还没有参与问答，可以先看择校、专业、城市相关问题。",
      history: "暂无浏览记录，从江苏地图开始会更容易建立全局感。",
    },
  },
  freshman: {
    label: "准大学生",
    shortLabel: "准大学生",
    eyebrow: "入学生活指南",
    title: "从被录取到开学，先把真实校园生活摸清楚。",
    description:
      "重点关注宿舍、食堂、交通、军训、校区和城市适应，提前降低入学不确定性。",
    avatarLabel: "入学",
    icon: Compass,
    stats: [
      { value: "4", label: "生活主题" },
      { value: "6", label: "校园经验" },
      { value: "3", label: "城市线索" },
      { value: "1", label: "入学清单" },
    ],
    primary: {
      label: "浏览入学经验",
      description: "从宿舍、食堂、校区和新生避坑开始了解。",
      path: "/experiences",
      icon: BookOpen,
    },
    secondary: {
      label: "定位学校周边",
      description: "进入地图后查看学校所在城市和生活环境。",
      path: "/jiangsu",
      icon: MapPin,
    },
    quickActions: [
      {
        label: "宿舍和食堂",
        description: "优先看真实生活体验，提前准备开学用品。",
        path: "/experiences",
        icon: School,
      },
      {
        label: "常见入学问题",
        description: "生活费、转专业、校区差异先了解清楚。",
        path: "/qa",
        icon: MessageCircle,
      },
      {
        label: "城市适应",
        description: "了解交通、商圈、天气和生活成本。",
        path: "/experiences",
        icon: Compass,
      },
    ],
    focus: [
      {
        title: "把校区确认清楚",
        text: "同一所学校不同校区差别很大，宿舍、交通和课程安排都可能不同。",
        tag: "校区",
      },
      {
        title: "先看生活成本",
        text: "南京、苏州、无锡、徐州的月开销和城市节奏差异很明显。",
        tag: "预算",
      },
      {
        title: "准备问题清单",
        text: "军训、选课、社团、电脑、床品、校园卡这些问题可以集中查。",
        tag: "开学",
      },
    ],
    postIds: ["exp-3", "exp-1", "exp-2"],
    qaIds: ["qa-1", "qa-4", "qa-3"],
    empty: {
      favorites: "还没有关注学校，可以先收藏你的录取学校和同城高校。",
      experiences: "还没有保存生活经验，建议先看宿舍、食堂和新生避坑。",
      answers: "还没有参与问答，可以先看生活费、转专业和宿舍问题。",
      history: "暂无浏览记录，从你的学校或城市开始看会更有效。",
    },
  },
  college: {
    label: "在校大学生",
    shortLabel: "大学生",
    eyebrow: "成长与经验中心",
    title: "围绕考研、实习、转专业和城市机会，整理下一步路径。",
    description:
      "把经验、问答和地图放在一起看，找到更适合当前阶段的学校资源和城市机会。",
    avatarLabel: "成长",
    icon: BookOpen,
    stats: [
      { value: "3", label: "发展路径" },
      { value: "10", label: "经验样本" },
      { value: "8", label: "问答线索" },
      { value: "13", label: "城市机会" },
    ],
    primary: {
      label: "看成长经验",
      description: "考研、就业、专业学习和城市机会先建立方向。",
      path: "/experiences",
      icon: Route,
    },
    secondary: {
      label: "进入问答区",
      description: "围绕转专业、考研、就业和城市选择继续追问。",
      path: "/qa",
      icon: MessageCircle,
    },
    quickActions: [
      {
        label: "考研保研",
        description: "看学风、去向和不同学校的上岸路径。",
        path: "/experiences",
        icon: GraduationCap,
      },
      {
        label: "就业实习",
        description: "按城市和学校资源看毕业后的第一步。",
        path: "/experiences",
        icon: ExternalLink,
      },
      {
        label: "贡献经验",
        description: "后续开放投稿后，可以补充自己的真实校园记录。",
        path: "/experiences",
        icon: Edit3,
      },
    ],
    focus: [
      {
        title: "先确定当前主线",
        text: "考研、保研、实习、转专业和竞赛不要同时开太多线程。",
        tag: "路径",
      },
      {
        title: "把城市机会纳入规划",
        text: "苏南、南京、徐州等城市的产业和实习机会差异会影响选择。",
        tag: "机会",
      },
      {
        title: "把经验沉淀下来",
        text: "你的选课、实习、考研和校园生活经验，后续都可以反哺下一届学生。",
        tag: "贡献",
      },
    ],
    postIds: ["exp-6", "exp-7", "exp-4"],
    qaIds: ["qa-2", "qa-7", "qa-3"],
    empty: {
      favorites: "还没有收藏高校，可以先关注目标院校、考研去向或同城学校。",
      experiences: "还没有发布经验，后续可以从选课、实习或考研记录开始。",
      answers: "还没有参与问答，可以先回答你熟悉的校园生活问题。",
      history: "暂无浏览记录，从经验流或问答区进入更符合当前阶段。",
    },
  },
};

const personalTabs = [
  { key: "favorites", label: "收藏", icon: Bookmark },
  { key: "experiences", label: "经验", icon: Edit3 },
  { key: "answers", label: "问答", icon: Heart },
  { key: "history", label: "记录", icon: MapPin },
] as const;

const MOCK_USER = {
  name: "访客",
  joinDate: "2026",
  stats: {
    favorites: 0,
    experiences: 0,
    answers: 0,
    history: 0,
  },
};

const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(199, 107, 94, 0.13) 0%, transparent 42%),
    radial-gradient(ellipse at 88% 18%, rgba(116, 151, 175, 0.12) 0%, transparent 36%),
    linear-gradient(170deg, #fdf7f2 0%, #f7efe4 42%, #eee3d4 100%);
  color: #3a2f28;
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;
  box-sizing: border-box;
`;

const Shell = styled.div`
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
  padding: 38px 0 76px;

  @media (max-width: 720px) {
    width: calc(100% - 28px);
    padding: 24px 0 48px;
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 316px;
  gap: 24px;
  align-items: stretch;
  animation: ${fadeUp} 0.5s ease-out both;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const HeroMain = styled.div`
  position: relative;
  overflow: hidden;
  padding: clamp(28px, 5vw, 46px);
  border: 1px solid rgba(180, 150, 120, 0.16);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.62);
  box-shadow: 0 18px 48px rgba(132, 96, 70, 0.09);
  backdrop-filter: blur(14px);
`;

const HeroTop = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;

  @media (max-width: 560px) {
    align-items: flex-start;
  }
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #e8d5c4, #d4b896);
  border: 1px solid rgba(180, 140, 100, 0.22);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #8b6f5a;
`;

const IdentityText = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  margin-bottom: 7px;
  color: #b96b5f;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 850;
`;

const Title = styled.h1`
  max-width: 18ch;
  margin: 0;
  color: #2f261f;
  font-size: clamp(28px, 4.2vw, 48px);
  line-height: 1.12;
  font-weight: 900;
`;

const Description = styled.p`
  max-width: 62ch;
  margin: 18px 0 0;
  color: #6b5d4f;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 15px;
  line-height: 1.8;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
`;

const CommandButton = styled.button<{ $primary?: boolean }>`
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid ${(p) => p.$primary ? "rgba(199, 107, 94, 0.34)" : "rgba(180, 150, 120, 0.22)"};
  background: ${(p) => p.$primary ? "linear-gradient(135deg, #c76b5e, #b75a4d)" : "rgba(255, 252, 247, 0.7)"};
  color: ${(p) => p.$primary ? "#fffdf8" : "#6b5d4f"};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(p) => p.$primary ? "0 10px 22px rgba(199, 107, 94, 0.18)" : "0 8px 18px rgba(132, 96, 70, 0.08)"};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const IdentityPanel = styled.aside`
  padding: 22px;
  border: 1px solid rgba(180, 150, 120, 0.16);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.58);
  box-shadow: 0 18px 48px rgba(132, 96, 70, 0.08);
  backdrop-filter: blur(12px);
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
`;

const UserMark = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(199, 107, 94, 0.09);
  color: #c76b5e;
`;

const UserName = styled.div`
  color: #2f261f;
  font-size: 17px;
  font-weight: 900;
`;

const UserMeta = styled.div`
  margin-top: 2px;
  color: #8b7b6a;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
`;

const RoleSwitch = styled.div`
  display: grid;
  gap: 8px;
`;

const RoleButton = styled.button<{ $active: boolean }>`
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${(p) => p.$active ? "rgba(199, 107, 94, 0.34)" : "rgba(180, 150, 120, 0.16)"};
  background: ${(p) => p.$active ? "rgba(199, 107, 94, 0.09)" : "rgba(255, 252, 247, 0.42)"};
  color: ${(p) => p.$active ? "#9a4f45" : "#6b5d4f"};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    border-color: rgba(199, 107, 94, 0.3);
    color: #9a4f45;
  }
`;

const PanelActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 18px;
`;

const SmallButton = styled.button`
  flex: 1;
  min-height: 36px;
  border: 1px solid rgba(180, 150, 120, 0.16);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.54);
  color: #8b7b6a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 700;
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;

  &:hover {
    color: #c76b5e;
    border-color: rgba(199, 107, 94, 0.24);
    background: rgba(199, 107, 94, 0.05);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 20px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCell = styled.div`
  padding: 16px;
  border: 1px solid rgba(180, 150, 120, 0.13);
  border-radius: 10px;
  background: rgba(255, 252, 247, 0.46);
`;

const StatValue = styled.div`
  color: #c76b5e;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 25px;
  font-weight: 900;
  line-height: 1;
`;

const StatLabel = styled.div`
  margin-top: 8px;
  color: #8b7b6a;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
`;

const Section = styled.section`
  margin-top: 28px;
  animation: ${fadeUp} 0.5s ease-out both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #2f261f;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 900;
`;

const SectionNote = styled.p`
  margin: 6px 0 0;
  color: #8b7b6a;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  line-height: 1.55;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.button`
  min-height: 136px;
  padding: 18px;
  border: 1px solid rgba(180, 150, 120, 0.15);
  border-radius: 10px;
  background: rgba(255, 252, 247, 0.5);
  color: #3a2f28;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(199, 107, 94, 0.26);
    background: rgba(255, 252, 247, 0.72);
    box-shadow: 0 12px 26px rgba(132, 96, 70, 0.08);
  }
`;

const ActionIcon = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(199, 107, 94, 0.09);
  color: #c76b5e;

  svg {
    width: 17px;
    height: 17px;
  }
`;

const ActionTitle = styled.strong`
  display: block;
  margin-top: 12px;
  color: #2f261f;
  font-size: 15px;
`;

const ActionText = styled.span`
  display: block;
  margin-top: 6px;
  color: #7a6b5d;
  font-size: 12.5px;
  line-height: 1.55;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 18px;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const FocusList = styled.div`
  display: grid;
  gap: 10px;
`;

const FocusItemRow = styled.div`
  padding: 17px 18px;
  border: 1px solid rgba(180, 150, 120, 0.14);
  border-radius: 10px;
  background: rgba(255, 252, 247, 0.48);
`;

const FocusTag = styled.span`
  display: inline-flex;
  min-height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  align-items: center;
  color: #b96b5f;
  background: rgba(199, 107, 94, 0.08);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 11px;
  font-weight: 800;
`;

const FocusTitle = styled.h3`
  margin: 10px 0 6px;
  color: #2f261f;
  font-size: 16px;
  line-height: 1.35;
`;

const FocusText = styled.p`
  margin: 0;
  color: #6b5d4f;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  line-height: 1.7;
`;

const RecommendationList = styled.div`
  display: grid;
  gap: 10px;
`;

const PostRow = styled.button`
  width: 100%;
  padding: 16px 18px;
  border: 1px solid rgba(180, 150, 120, 0.14);
  border-radius: 10px;
  background: rgba(255, 252, 247, 0.48);
  cursor: pointer;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(199, 107, 94, 0.25);
    background: rgba(255, 252, 247, 0.72);
  }
`;

const PostMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: #9a8878;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 11px;
  font-weight: 700;
`;

const CategoryPill = styled.span<{ $color: string }>`
  color: ${(p) => p.$color};
  background: ${(p) => p.$color}14;
  border-radius: 999px;
  padding: 3px 8px;
`;

const PostTitle = styled.h3`
  margin: 9px 0 6px;
  color: #2f261f;
  font-size: 15px;
  line-height: 1.45;
`;

const PostExcerpt = styled.p`
  margin: 0;
  color: #6b5d4f;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12.5px;
  line-height: 1.65;
`;

const PersonalPanel = styled.div`
  border: 1px solid rgba(180, 150, 120, 0.14);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.5);
  overflow: hidden;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(180, 150, 120, 0.13);

  @media (max-width: 560px) {
    overflow-x: auto;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  min-height: 48px;
  padding: 0 18px;
  border: 0;
  background: ${(p) => p.$active ? "rgba(199, 107, 94, 0.08)" : "transparent"};
  color: ${(p) => p.$active ? "#9a4f45" : "#7a6b5d"};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease;

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    color: #9a4f45;
  }
`;

const EmptyState = styled.div`
  padding: 34px 22px;
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 560px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const EmptyIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #c76b5e;
  background: rgba(199, 107, 94, 0.08);
`;

const EmptyText = styled.p`
  margin: 0;
  color: #6b5d4f;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  line-height: 1.7;
`;

const EmptyAction = styled.button`
  margin-top: 12px;
  padding: 0;
  border: 0;
  background: none;
  color: #c76b5e;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 850;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PageFooter = styled.footer`
  margin-top: 52px;
  padding-top: 22px;
  border-top: 1px solid rgba(180, 150, 120, 0.12);
  text-align: center;
  color: #b5a592;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
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

export default function Me() {
  const { navigateWithTransition } = useTransition();
  const { role, setRole } = useAudienceRole();
  const [tab, setTab] = useState<(typeof personalTabs)[number]["key"]>("favorites");

  const plan = rolePlans[role];
  const RoleIcon = plan.icon;
  const activeTab = personalTabs.find((item) => item.key === tab) ?? personalTabs[0];
  const ActiveTabIcon = activeTab.icon;

  const recommendedPosts = useMemo(() => pickPosts(plan.postIds), [plan.postIds]);
  const recommendedQuestions = useMemo(() => pickQuestions(plan.qaIds), [plan.qaIds]);

  const go = (path: string) => navigateWithTransition(path);

  const handleRoleChange = (nextRole: AudienceRole) => {
    setRole(nextRole);
  };

  const handleLogout = () => {
    navigateWithTransition("/login");
  };

  return (
    <Page>
      <Shell>
        <Hero>
          <HeroMain>
            <HeroTop>
              <Avatar>
                <RoleIcon size={34} />
              </Avatar>
              <IdentityText>
                <Eyebrow>{plan.eyebrow}</Eyebrow>
                <Title>{plan.title}</Title>
              </IdentityText>
            </HeroTop>
            <Description>{plan.description}</Description>
            <HeroActions>
              <CommandButton $primary onClick={() => go(plan.primary.path)}>
                <plan.primary.icon />
                {plan.primary.label}
                <ArrowRight />
              </CommandButton>
              <CommandButton onClick={() => go(plan.secondary.path)}>
                <plan.secondary.icon />
                {plan.secondary.label}
              </CommandButton>
            </HeroActions>
            <StatsGrid>
              {plan.stats.map((stat) => (
                <StatCell key={stat.label}>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatCell>
              ))}
            </StatsGrid>
          </HeroMain>

          <IdentityPanel>
            <UserRow>
              <UserMark>
                <User size={21} />
              </UserMark>
              <div>
                <UserName>{MOCK_USER.name}</UserName>
                <UserMeta>加入于 {MOCK_USER.joinDate} · {plan.label}</UserMeta>
              </div>
            </UserRow>
            <RoleSwitch>
              {AUDIENCE_ROLE_ORDER.map((item) => {
                const option = rolePlans[item];
                const OptionIcon = option.icon;
                const active = role === item;
                return (
                  <RoleButton
                    key={item}
                    type="button"
                    $active={active}
                    aria-pressed={active}
                    onClick={() => handleRoleChange(item)}
                  >
                    <span>
                      <OptionIcon />
                      {option.label}
                    </span>
                    {active && <Sparkles size={14} />}
                  </RoleButton>
                );
              })}
            </RoleSwitch>
            <PanelActions>
              <SmallButton type="button">
                <Settings />
                设置
              </SmallButton>
              <SmallButton type="button" onClick={handleLogout}>
                <LogOut />
                退出
              </SmallButton>
            </PanelActions>
          </IdentityPanel>
        </Hero>

        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>{plan.avatarLabel}行动入口</SectionTitle>
              <SectionNote>根据当前身份默认排序，其他内容仍然可以自由浏览。</SectionNote>
            </div>
          </SectionHeader>
          <ActionGrid>
            {plan.quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <ActionCard key={action.label} type="button" onClick={() => go(action.path)}>
                  <div>
                    <ActionIcon>
                      <Icon />
                    </ActionIcon>
                    <ActionTitle>{action.label}</ActionTitle>
                    <ActionText>{action.description}</ActionText>
                  </div>
                  <ArrowRight size={16} color="#c76b5e" />
                </ActionCard>
              );
            })}
          </ActionGrid>
        </Section>

        <Section>
          <ContentGrid>
            <div>
              <SectionHeader>
                <div>
                  <SectionTitle>当前重点</SectionTitle>
                  <SectionNote>先把这一阶段最重要的判断点放在前面。</SectionNote>
                </div>
              </SectionHeader>
              <FocusList>
                {plan.focus.map((item) => (
                  <FocusItemRow key={item.title}>
                    <FocusTag>{item.tag}</FocusTag>
                    <FocusTitle>{item.title}</FocusTitle>
                    <FocusText>{item.text}</FocusText>
                  </FocusItemRow>
                ))}
              </FocusList>
            </div>

            <div>
              <SectionHeader>
                <div>
                  <SectionTitle>推荐内容</SectionTitle>
                  <SectionNote>经验和问答会随身份切换改变默认排序。</SectionNote>
                </div>
              </SectionHeader>
              <RecommendationList>
                {recommendedPosts.map((post) => {
                  const meta = CATEGORY_META[post.category];
                  return (
                    <PostRow key={post.id} type="button" onClick={() => go("/experiences")}>
                      <PostMeta>
                        <CategoryPill $color={meta.color}>{meta.label}</CategoryPill>
                        <span>{post.schoolName}</span>
                        <span>{post.likes} 喜欢</span>
                      </PostMeta>
                      <PostTitle>{post.title}</PostTitle>
                      <PostExcerpt>{post.excerpt}</PostExcerpt>
                    </PostRow>
                  );
                })}
                {recommendedQuestions.map((entry) => (
                  <PostRow key={entry.id} type="button" onClick={() => go("/qa")}>
                    <PostMeta>
                      <CategoryPill $color="#4a8eb5">问答</CategoryPill>
                      {entry.schoolName && <span>{entry.schoolName}</span>}
                      <span>{entry.likes} 收藏</span>
                    </PostMeta>
                    <PostTitle>{entry.question}</PostTitle>
                    <PostExcerpt>{entry.answer}</PostExcerpt>
                  </PostRow>
                ))}
              </RecommendationList>
            </div>
          </ContentGrid>
        </Section>

        <Section>
          <SectionHeader>
            <div>
              <SectionTitle>个人记录</SectionTitle>
              <SectionNote>后续接入账号后，这里会承接收藏、投稿、回答和浏览历史。</SectionNote>
            </div>
          </SectionHeader>
          <PersonalPanel>
            <Tabs>
              {personalTabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.key;
                return (
                  <Tab
                    key={item.key}
                    type="button"
                    $active={active}
                    onClick={() => setTab(item.key)}
                  >
                    <Icon />
                    {item.label}
                  </Tab>
                );
              })}
            </Tabs>
            <EmptyState>
              <EmptyIcon>
                <ActiveTabIcon size={24} />
              </EmptyIcon>
              <div>
                <EmptyText>{plan.empty[tab]}</EmptyText>
                <EmptyAction type="button" onClick={() => go(tab === "answers" ? "/qa" : tab === "experiences" ? "/experiences" : "/jiangsu")}>
                  {tab === "answers" ? "进入问答" : tab === "experiences" ? "浏览经验" : "去地图看看"}
                  <ArrowRight />
                </EmptyAction>
              </div>
            </EmptyState>
          </PersonalPanel>
        </Section>

        <PageFooter>江苏高校地图 · 为高考毕业生、准大学生和在校大学生整理真实校园线索</PageFooter>
      </Shell>
    </Page>
  );
}
