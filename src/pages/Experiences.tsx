import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { MessageCircle, Heart, Search as SearchIcon, MapPin, School } from "lucide-react";
import {
  EXPERIENCES,
  CATEGORY_META,
  searchExperiences,
  type PostCategory,
} from "../data/mock-content";
import DeskPet from "../DeskPet";

// ── Keyframes ──

const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// ── Styled ──

const Page = styled.div`
  height: 100%;
  padding: 28px 32px 48px;
  background: linear-gradient(170deg, #fdf7f2 0%, #f7efe4 40%, #f0e8db 100%);
  color: #3a2f28;
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 16px 16px 24px;
  }
`;

const Header = styled.div`
  max-width: 900px;
  margin: 0 auto 32px;
  animation: ${fadeUp} 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px;
  letter-spacing: 1px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #6b5d53;
  margin: 0 0 20px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const FilterChip = styled.button<{ $active: boolean; $color: string }>`
  background: ${(p) => (p.$active ? p.$color : "rgba(255,252,247,0.7)")};
  color: ${(p) => (p.$active ? "#fff" : "#6b5d53")};
  border: 1px solid ${(p) => (p.$active ? p.$color : "rgba(180,150,130,0.3)")};
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${(p) => p.$color};
    color: ${(p) => (p.$active ? "#fff" : p.$color)};
  }
`;

const BrowseLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #a89588;
  letter-spacing: 0.05em;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  margin: 6px 0 4px 2px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CityChip = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "rgba(90,158,124,0.14)" : "rgba(255,252,247,0.5)")};
  color: ${(p) => (p.$active ? "#5a9e7c" : "#8b7d73")};
  border: 1px solid ${(p) => (p.$active ? "rgba(90,158,124,0.25)" : "rgba(180,150,130,0.15)")};
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 3px;

  &:hover {
    border-color: rgba(90,158,124,0.3);
    color: #5a9e7c;
  }
`;

const SearchBox = styled.div`
  position: relative;
  max-width: 360px;
  margin-bottom: 20px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #b8a090;
    width: 16px;
    height: 16px;
  }

  input {
    width: 100%;
    padding: 10px 14px 10px 36px;
    border: 1px solid rgba(180, 150, 130, 0.3);
    border-radius: 12px;
    background: rgba(255, 252, 247, 0.7);
    font-size: 14px;
    font-family: inherit;
    color: #3a2f28;
    outline: none;
    box-sizing: border-box;
    transition: border 0.2s;

    &:focus {
      border-color: #c76b5e;
    }

    &::placeholder {
      color: #b8a090;
    }
  }
`;

const Grid = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 780px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $expanded: boolean }>`
  background: rgba(255, 252, 247, 0.82);
  border: 1px solid rgba(180, 150, 130, 0.18);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  animation: ${fadeUp} 0.5s ease-out both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(120, 90, 60, 0.1);
    border-color: rgba(180, 150, 130, 0.35);
  }

  ${(p) =>
    p.$expanded &&
    `
    grid-column: 1 / -1;
    cursor: default;
  `}
`;

const CardTag = styled.span<{ $color: string }>`
  display: inline-block;
  background: ${(p) => p.$color}18;
  color: ${(p) => p.$color};
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
`;

const CardSchoolRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const CardSchool = styled.span`
  color: #8b7d73;
  font-weight: 700;
`;

const CardCity = styled.span`
  color: #a89588;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.45;
  color: #3a2f28;
`;

const CardExcerpt = styled.p`
  font-size: 13px;
  color: #6b5d53;
  line-height: 1.6;
  margin: 0 0 12px;
`;

const CardStats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #a89588;
  align-items: center;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const FullBody = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(180, 150, 130, 0.2);
  font-size: 14px;
  line-height: 1.9;
  color: #3a2f28;
  white-space: pre-wrap;
`;

const Empty = styled.p`
  text-align: center;
  color: #8b7d73;
  font-size: 15px;
  padding: 48px 0;
  grid-column: 1 / -1;
`;

const ALL_CATEGORIES: (PostCategory | "all")[] = [
  "all",
  "dorm",
  "cafeteria",
  "study",
  "freshman",
  "city-life",
  "exam",
  "career",
];

export default function Experiences() {
  const nav = useNavigate();
  const [activeCat, setActiveCat] = useState<PostCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);

  const allCities = useMemo(
    () => [...new Set(EXPERIENCES.map((e) => e.city))].sort((a, b) => a.localeCompare(b, "zh-Hans-CN")),
    [],
  );
  const allSchools = useMemo(
    () => [...new Set(EXPERIENCES.map((e) => e.schoolName))].sort((a, b) => a.localeCompare(b, "zh-Hans-CN")),
    [],
  );

  const filtered = useMemo(() => {
    let list = activeCat === "all" ? EXPERIENCES : EXPERIENCES.filter((e) => e.category === activeCat);
    if (query.trim()) {
      list = searchExperiences(query).filter((e) => list.includes(e));
    }
    if (cityFilter) {
      list = list.filter((e) => e.city === cityFilter);
    }
    if (schoolFilter) {
      list = list.filter((e) => e.schoolName === schoolFilter);
    }
    return list;
  }, [activeCat, query, cityFilter, schoolFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Page>
      <Header>
        <Title>校园经验</Title>
        <Subtitle>来自学长学姐的真实分享，帮你提前看见大学生活</Subtitle>

        {/* Category filter */}
        <FilterRow>
          {ALL_CATEGORIES.map((cat) => {
            const meta = cat === "all" ? { label: "全部", color: "#8b7d73" } : CATEGORY_META[cat];
            return (
              <FilterChip
                key={cat}
                $active={activeCat === cat}
                $color={meta.color}
                onClick={() => setActiveCat(cat)}
              >
                {meta.label}
              </FilterChip>
            );
          })}
        </FilterRow>

        {/* City browse filter */}
        <BrowseLabel><MapPin size={11} />按城市浏览</BrowseLabel>
        <FilterRow>
          <CityChip $active={!cityFilter} onClick={() => setCityFilter(null)}>全部城市</CityChip>
          {allCities.map((city) => (
            <CityChip
              key={city}
              $active={cityFilter === city}
              onClick={() => setCityFilter(cityFilter === city ? null : city)}
            >
              {city}
            </CityChip>
          ))}
        </FilterRow>

        {/* School browse filter */}
        <BrowseLabel><School size={11} />按学校浏览</BrowseLabel>
        <FilterRow>
          <CityChip $active={!schoolFilter} onClick={() => setSchoolFilter(null)}>全部学校</CityChip>
          {allSchools.slice(0, 8).map((school) => (
            <CityChip
              key={school}
              $active={schoolFilter === school}
              onClick={() => setSchoolFilter(schoolFilter === school ? null : school)}
            >
              {school}
            </CityChip>
          ))}
        </FilterRow>

        <SearchBox>
          <SearchIcon />
          <input
            placeholder="搜索经验、学校、城市..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchBox>
      </Header>

      <Grid>
        {filtered.length === 0 && <Empty>没有找到匹配的校园经验</Empty>}
        {filtered.map((exp) => {
          const meta = CATEGORY_META[exp.category];
          const expanded = expandedId === exp.id;
          return (
            <Card key={exp.id} $expanded={expanded} onClick={() => toggleExpand(exp.id)}>
              <CardTag $color={meta.color}>{meta.label}</CardTag>
              <CardSchoolRow>
                <CardSchool>{exp.schoolName}</CardSchool>
                <CardCity><MapPin size={10} />{exp.city}</CardCity>
              </CardSchoolRow>
              <CardTitle>{exp.title}</CardTitle>
              {!expanded && <CardExcerpt>{exp.excerpt}</CardExcerpt>}
              {expanded && <FullBody>{exp.body}</FullBody>}
              <CardStats>
                <span><Heart />{exp.likes}</span>
                <span><MessageCircle />{exp.comments}</span>
                {exp.tags.slice(0, 2).map((t) => (
                  <span key={t} style={{ color: "#c76b5e", fontSize: 10, fontWeight: 700 }}>#{t}</span>
                ))}
              </CardStats>
            </Card>
          );
        })}
      </Grid>
      <DeskPet
        compact
        scene="exp"
        preferredSide="right"
        actions={[
          { label: "探索高校地图", onClick: () => nav("/jiangsu") },
          { label: "查看新生问答", onClick: () => nav("/qa") },
        ]}
      />
    </Page>
  );
}
