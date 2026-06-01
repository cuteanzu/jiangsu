import { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Heart,
  MessageCircle,
  RotateCcw,
  Search as SearchIcon,
  MapPin,
  School,
  Sparkles,
} from "lucide-react";
import {
  EXPERIENCES,
  CATEGORY_META,
  searchExperiences,
  type ExperiencePost,
  type PostCategory,
} from "../data/mock-content";
import {
  AUDIENCE_ROLE_LABELS,
  AUDIENCE_ROLE_ORDER,
  useAudienceRole,
  type AudienceRole,
} from "../hooks/useAudienceRole";

const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  height: 100%;
  padding: 42px 32px 68px;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(225,170,120,0.15) 0%, transparent 48%),
    radial-gradient(ellipse at 90% 42%, rgba(200,145,95,0.10) 0%, transparent 38%),
    linear-gradient(178deg, #fefaf5 0%, #faf2e6 30%, #f2e6d8 100%);
  color: #3a2f28;
  font-family: "Noto Serif SC", "Songti SC", serif;
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 28px 16px 44px;
  }
`;

const Container = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
`;

const Hero = styled.header`
  margin-bottom: 28px;
  animation: ${fadeUp} 0.55s ease-out both;
`;

const Kicker = styled.div`
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.12em;
  color: #c8844a;
  margin-bottom: 10px;
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;

  @media (max-width: 820px) {
    align-items: start;
    flex-direction: column;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Title = styled.h1`
  max-width: 12ch;
  font-size: clamp(34px, 5vw, 62px);
  line-height: 1.06;
  font-weight: 950;
  margin: 0;
  color: #2a221b;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  max-width: 52ch;
  margin: 16px 0 0;
  color: #7c7065;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 16px;
  line-height: 1.75;
`;

const SearchBox = styled.div`
  position: relative;
  width: min(360px, 100%);

  @media (max-width: 820px) {
    width: 100%;
  }

  svg {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #c4a98e;
    width: 17px;
    height: 17px;
  }

  input {
    width: 100%;
    min-height: 48px;
    padding: 0 16px 0 44px;
    border: 1px solid rgba(180, 150, 130, 0.22);
    border-radius: 12px;
    background: rgba(255, 252, 247, 0.58);
    box-shadow: 0 12px 28px rgba(160, 120, 80, 0.06);
    font-size: 14px;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    color: #3a2f28;
    outline: none;
    box-sizing: border-box;
    transition: border 0.2s, box-shadow 0.2s, background 0.2s;

    &:focus {
      background: rgba(255, 252, 247, 0.86);
      border-color: rgba(200, 132, 74, 0.42);
      box-shadow: 0 0 0 3px rgba(200, 132, 74, 0.09);
    }

    &::placeholder {
      color: #c4a98e;
    }
  }
`;

const ControlBand = styled.div`
  margin-top: 26px;
  display: grid;
  gap: 14px;
`;

const RoleChooser = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  @media (max-width: 640px) {
    gap: 8px 7px;
  }
`;

const RoleLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #9b806c;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;

  svg {
    width: 15px;
    height: 15px;
    color: #c8844a;
  }
`;

const RoleButton = styled.button<{ $active: boolean }>`
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${(p) => p.$active ? "rgba(200, 132, 74, 0.38)" : "rgba(180, 150, 130, 0.18)"};
  background: ${(p) => p.$active ? "rgba(200, 132, 74, 0.12)" : "rgba(255, 252, 247, 0.5)"};
  color: ${(p) => p.$active ? "#b07242" : "#7a6e63"};
  cursor: pointer;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 850;
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;

  &:hover {
    color: #b07242;
    border-color: rgba(200, 132, 74, 0.34);
  }

  &:focus-visible {
    outline: 3px solid rgba(200, 132, 74, 0.18);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    min-height: 42px;
    padding: 0 15px;
  }
`;

const CategoryRail = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin: 0 -4px;
  padding: 0 4px 6px;
  scrollbar-width: thin;
`;

const CategoryButton = styled.button<{ $active: boolean; $color: string }>`
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 17px;
  border-radius: 999px;
  border: 1px solid ${(p) => p.$active ? p.$color : "rgba(180, 150, 130, 0.2)"};
  background: ${(p) => p.$active ? `${p.$color}18` : "rgba(255, 252, 247, 0.54)"};
  color: ${(p) => p.$active ? p.$color : "#71655b"};
  cursor: pointer;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${(p) => p.$color};
    color: ${(p) => p.$color};
  }

  &:focus-visible {
    outline: 3px solid rgba(200, 132, 74, 0.16);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    min-height: 44px;
    padding: 0 16px;
  }
`;

const ActiveFilterRow = styled.div`
  min-height: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: #8b7d73;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12.5px;
`;

const ResetButton = styled.button`
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(180, 150, 130, 0.18);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.52);
  color: #8b7d73;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 800;

  &:hover {
    color: #b07242;
    border-color: rgba(200, 132, 74, 0.28);
  }

  svg {
    width: 13px;
    height: 13px;
  }

  @media (max-width: 640px) {
    min-height: 38px;
  }
`;

const FilterPill = styled.span`
  max-width: min(100%, 280px);
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(200, 132, 74, 0.18);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.58);
  color: #9b6f4d;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Section = styled.section`
  margin-top: 32px;
  animation: ${fadeUp} 0.55s ease-out both;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  @media (max-width: 640px) {
    align-items: start;
    flex-direction: column;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #2a221b;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 900;
`;

const SectionNote = styled.p`
  margin: 5px 0 0;
  color: #8b7d73;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  line-height: 1.55;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  gap: 18px;

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`;

const FeaturedMain = styled.button`
  min-height: 310px;
  padding: 28px;
  border: 1px solid rgba(200, 170, 140, 0.18);
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(255, 252, 247, 0.78), rgba(247, 231, 212, 0.62)),
    radial-gradient(circle at 80% 20%, rgba(199, 107, 94, 0.12), transparent 34%);
  color: #3a2f28;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 18px 42px rgba(160, 120, 80, 0.09);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(199, 107, 94, 0.28);
    box-shadow: 0 22px 48px rgba(160, 120, 80, 0.13);
  }

  &:focus-visible {
    outline: 3px solid rgba(199, 107, 94, 0.22);
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    min-height: 250px;
    padding: 22px;
  }
`;

const FeaturedStack = styled.div`
  display: grid;
  gap: 14px;
`;

const FeaturedSmall = styled.button`
  min-height: 148px;
  padding: 20px;
  border: 1px solid rgba(200, 170, 140, 0.16);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.58);
  color: #3a2f28;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(199, 107, 94, 0.26);
    background: rgba(255, 252, 247, 0.76);
  }

  &:focus-visible {
    outline: 3px solid rgba(199, 107, 94, 0.18);
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    min-height: 132px;
    padding: 18px;
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
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 11px;
  font-weight: 850;
`;

const FeaturedTitle = styled.h3<{ $large?: boolean }>`
  margin: 14px 0 8px;
  color: #2a221b;
  font-size: ${(p) => p.$large ? "clamp(25px, 3vw, 36px)" : "17px"};
  line-height: 1.35;
  font-weight: 900;
`;

const Excerpt = styled.p`
  margin: 0;
  color: #75685d;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  line-height: 1.72;
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
  color: #9a8878;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 700;

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

const BodyGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 660px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $expanded: boolean }>`
  min-height: 218px;
  padding: 21px;
  border: 1px solid rgba(200, 170, 140, 0.16);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.6);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(199, 107, 94, 0.26);
    background: rgba(255, 252, 247, 0.82);
    box-shadow: 0 14px 34px rgba(160, 120, 80, 0.08);
  }

  ${(p) =>
    p.$expanded &&
    `
    grid-column: 1 / -1;
    min-height: auto;
  `}

  &:focus-visible {
    outline: 3px solid rgba(199, 107, 94, 0.22);
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    min-height: 190px;
    padding: 18px;
  }
`;

const CardTitle = styled.h3`
  margin: 11px 0 8px;
  color: #2a221b;
  font-size: 17px;
  line-height: 1.48;
  font-weight: 850;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;

  ${MetaRow} {
    margin-top: 0;
  }

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const FullBody = styled.div`
  margin: 16px 0 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(180, 150, 120, 0.16);
  color: #3a2f28;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 14px;
  line-height: 1.95;
  white-space: pre-wrap;
`;

const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #c76b5e;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 850;
  white-space: nowrap;

  svg {
    width: 13px;
    height: 13px;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 18px;
  display: grid;
  gap: 16px;

  @media (max-width: 960px) {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const SidePanel = styled.div`
  padding: 18px;
  border: 1px solid rgba(200, 170, 140, 0.16);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.56);
`;

const SideTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #2a221b;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 14px;
  font-weight: 900;

  svg {
    width: 16px;
    height: 16px;
    color: #c76b5e;
  }
`;

const SideList = styled.div`
  display: grid;
  gap: 10px;
`;

const SideItem = styled.button`
  width: 100%;
  min-height: 44px;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: #3a2f28;
  cursor: pointer;
  text-align: left;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;

  &:hover strong {
    color: #c76b5e;
  }

  &:focus-visible {
    outline: 3px solid rgba(199, 107, 94, 0.18);
    outline-offset: 2px;
    border-radius: 8px;
  }

  strong {
    display: block;
    color: #4a3a2f;
    font-size: 12.5px;
    line-height: 1.45;
    transition: color 0.18s ease;
  }

  span {
    display: block;
    margin-top: 3px;
    color: #a08e7e;
    font-size: 11px;
  }
`;

const SchoolRow = styled.button<{ $active?: boolean }>`
  width: 100%;
  min-height: 38px;
  padding: 0 8px;
  border: 0;
  border-radius: 10px;
  background: ${(p) => p.$active ? "rgba(199, 107, 94, 0.08)" : "transparent"};
  color: ${(p) => p.$active ? "#b96b5f" : "#6b5d4f"};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12.5px;
  font-weight: 750;

  &:hover {
    color: #c76b5e;
    background: rgba(199, 107, 94, 0.06);
  }

  &:focus-visible {
    outline: 3px solid rgba(199, 107, 94, 0.18);
    outline-offset: 2px;
  }
`;

const CountPill = styled.span`
  min-width: 28px;
  min-height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: rgba(199, 107, 94, 0.08);
  color: #b96b5f;
  font-size: 11px;
`;

const Empty = styled.p`
  margin: 0;
  padding: 48px 0;
  color: #a89580;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 14px;
  text-align: center;
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
    title: "优先看择校、城市和专业体验",
    description: "默认把择校避坑、城市生活、专业学习和就业方向相关经验排在前面。",
    categories: ["freshman", "city-life", "study", "career"],
  },
  freshman: {
    title: "优先看入学生活和校园适应",
    description: "默认把新生避坑、宿舍、食堂和城市适应相关经验排在前面。",
    categories: ["freshman", "dorm", "cafeteria", "city-life"],
  },
  college: {
    title: "优先看成长路径和发展机会",
    description: "默认把考研保研、就业实习、专业学习和城市机会相关经验排在前面。",
    categories: ["exam", "career", "study", "city-life"],
  },
};

function getCategoryMeta(category: PostCategory | "all") {
  return category === "all" ? { label: "推荐", color: "#b07242" } : CATEGORY_META[category];
}

function sortForRole(list: ExperiencePost[], role: AudienceRole) {
  const guide = ROLE_EXPERIENCE_GUIDES[role];
  const priority = new Map(guide.categories.map((cat, index) => [cat, index]));
  return [...list].sort((a, b) => {
    const categoryDelta =
      (priority.get(a.category) ?? 99) - (priority.get(b.category) ?? 99);
    if (categoryDelta !== 0) return categoryDelta;
    return b.likes - a.likes;
  });
}

export default function Experiences() {
  const { role, setRole } = useAudienceRole();
  const [activeCat, setActiveCat] = useState<PostCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const roleGuide = ROLE_EXPERIENCE_GUIDES[role];

  const filtered = useMemo(() => {
    let list = activeCat === "all" ? sortForRole(EXPERIENCES, role) : EXPERIENCES.filter((e) => e.category === activeCat);
    if (query.trim()) list = searchExperiences(query).filter((e) => list.includes(e));
    if (schoolFilter) list = list.filter((e) => e.schoolName === schoolFilter);
    return list;
  }, [activeCat, query, role, schoolFilter]);

  const featured = filtered.slice(0, 3);
  const allItems = filtered;
  const hasManualFilter = activeCat !== "all" || Boolean(query.trim()) || Boolean(schoolFilter);

  const hotPosts = useMemo(
    () => [...EXPERIENCES].sort((a, b) => b.likes + b.comments - (a.likes + a.comments)).slice(0, 5),
    [],
  );

  const schoolStats = useMemo(() => {
    const map = new Map<string, number>();
    EXPERIENCES.forEach((item) => {
      map.set(item.schoolName, (map.get(item.schoolName) ?? 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
      .slice(0, 6);
  }, []);

  const clearFilters = () => {
    setActiveCat("all");
    setQuery("");
    setSchoolFilter(null);
    setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleExpand(id);
  };

  const handleRoleSelect = (nextRole: AudienceRole) => {
    setRole(nextRole);
    setActiveCat("all");
    setSchoolFilter(null);
    setExpandedId(null);
  };

  const openPostFromSidebar = (item: ExperiencePost) => {
    setActiveCat("all");
    setQuery("");
    setSchoolFilter(null);
    setExpandedId(item.id);
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
      <Container>
        <Hero>
          <HeroTop>
            <TitleBlock>
              <Kicker>校园经验 · EXPERIENCES</Kicker>
              <Title>看见真实的大学生活</Title>
              <Subtitle>来自江苏高校学长学姐的经验分享，先看真实生活，再做下一步选择。</Subtitle>
            </TitleBlock>
            <SearchBox>
              <SearchIcon />
              <input
                placeholder="搜索经验、学校、城市..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setExpandedId(null);
                }}
              />
            </SearchBox>
          </HeroTop>

          <ControlBand>
            <RoleChooser>
              <RoleLabel>
                <Sparkles />
                我想看
              </RoleLabel>
              {AUDIENCE_ROLE_ORDER.map((item) => (
                <RoleButton
                  key={item}
                  type="button"
                  $active={role === item}
                  onClick={() => handleRoleSelect(item)}
                >
                  {AUDIENCE_ROLE_LABELS[item]}
                </RoleButton>
              ))}
            </RoleChooser>

            <CategoryRail>
              {ALL_CATEGORIES.map((category) => {
                const meta = getCategoryMeta(category);
                return (
                  <CategoryButton
                    key={category}
                    type="button"
                    $active={activeCat === category}
                    $color={meta.color}
                    onClick={() => {
                      setActiveCat(category);
                      setExpandedId(null);
                    }}
                  >
                    {meta.label}
                  </CategoryButton>
                );
              })}
            </CategoryRail>

            <ActiveFilterRow>
              <span>{roleGuide.title}，当前显示 {filtered.length} 条</span>
              {activeCat !== "all" && (
                <FilterPill>分类：{getCategoryMeta(activeCat).label}</FilterPill>
              )}
              {query.trim() && <FilterPill>搜索：{query.trim()}</FilterPill>}
              {schoolFilter && <FilterPill>学校：{schoolFilter}</FilterPill>}
              {hasManualFilter && (
                <ResetButton type="button" onClick={clearFilters}>
                  <RotateCcw />
                  重置筛选
                </ResetButton>
              )}
            </ActiveFilterRow>
          </ControlBand>
        </Hero>

        {featured.length > 0 && (
          <Section>
            <SectionHead>
              <div>
                <SectionTitle>精选经验</SectionTitle>
                <SectionNote>{roleGuide.description}</SectionNote>
              </div>
            </SectionHead>
            <FeaturedGrid>
              <FeaturedMain type="button" onClick={() => toggleExpand(featured[0].id)}>
                <div>
                  <Tag $color={CATEGORY_META[featured[0].category].color}>
                    {CATEGORY_META[featured[0].category].label}
                  </Tag>
                  <FeaturedTitle $large>{featured[0].title}</FeaturedTitle>
                  <Excerpt>{featured[0].excerpt}</Excerpt>
                </div>
                {renderMeta(featured[0])}
              </FeaturedMain>

              <FeaturedStack>
                {featured.slice(1, 3).map((item) => (
                  <FeaturedSmall key={item.id} type="button" onClick={() => toggleExpand(item.id)}>
                    <div>
                      <Tag $color={CATEGORY_META[item.category].color}>
                        {CATEGORY_META[item.category].label}
                      </Tag>
                      <FeaturedTitle>{item.title}</FeaturedTitle>
                    </div>
                    {renderMeta(item)}
                  </FeaturedSmall>
                ))}
              </FeaturedStack>
            </FeaturedGrid>
          </Section>
        )}

        <Section>
          <BodyGrid>
            <div>
              <SectionHead>
                <div>
                  <SectionTitle>全部经验</SectionTitle>
                  <SectionNote>点开卡片阅读全文，筛选和身份视角会保留。</SectionNote>
                </div>
              </SectionHead>

              {allItems.length === 0 ? (
                <Empty>没有找到匹配的校园经验</Empty>
              ) : (
                <CardGrid>
                  {allItems.map((item, index) => {
                    const expanded = expandedId === item.id;
                    return (
                      <Card
                        key={item.id}
                        $expanded={expanded}
                        role="button"
                        tabIndex={0}
                        aria-expanded={expanded}
                        style={{ animationDelay: `${0.035 * (index % 8)}s` }}
                        onClick={() => toggleExpand(item.id)}
                        onKeyDown={(event) => handleCardKeyDown(event, item.id)}
                      >
                        <Tag $color={CATEGORY_META[item.category].color}>
                          {CATEGORY_META[item.category].label}
                        </Tag>
                        <CardTitle>{item.title}</CardTitle>
                        {!expanded && <Excerpt>{item.excerpt}</Excerpt>}
                        {expanded && <FullBody>{item.body}</FullBody>}
                        <CardFooter>
                          {renderMeta(item)}
                          <ReadMore>
                            {expanded ? "收起" : "阅读全文"}
                            <ArrowRight />
                          </ReadMore>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </CardGrid>
              )}
            </div>

            <Sidebar>
              <SidePanel>
                <SideTitle>
                  <Flame />
                  热门经验
                </SideTitle>
                <SideList>
                  {hotPosts.map((item) => (
                    <SideItem key={item.id} type="button" onClick={() => openPostFromSidebar(item)}>
                      <strong>{item.title}</strong>
                      <span>{item.schoolName} · {item.likes + item.comments} 热度</span>
                    </SideItem>
                  ))}
                </SideList>
              </SidePanel>

              <SidePanel>
                <SideTitle>
                  <BookOpen />
                  热门学校经验
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
          </BodyGrid>
        </Section>
      </Container>
    </Page>
  );
}
