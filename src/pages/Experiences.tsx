import { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Heart, MessageCircle, Search as SearchIcon, MapPin, School } from "lucide-react";
import {
  EXPERIENCES,
  CATEGORY_META,
  searchExperiences,
  type PostCategory,
} from "../data/mock-content";

const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  height: 100%;
  padding: 40px 32px 64px;
  background:
    radial-gradient(ellipse at 25% 0%, rgba(225,170,120,0.16) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 90%, rgba(200,145,95,0.12) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 50%, rgba(240,210,170,0.08) 0%, transparent 60%),
    linear-gradient(178deg, #fefaf5 0%, #faf2e6 25%, #f5e9d8 55%, #efe3d0 100%);
  color: #3a2f28;
  font-family: "Noto Serif SC", "Songti SC", serif;
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 24px 16px 40px;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 36px;
  animation: ${fadeUp} 0.6s ease-out;
`;

const Kicker = styled.div`
  font-family: "Noto Sans SC", sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #c8844a;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 900;
  margin: 0 0 10px;
  letter-spacing: 0.02em;
  color: #2a221b;
`;

const Subtitle = styled.p`
  font-size: clamp(14px, 1.3vw, 16px);
  color: #8b7d73;
  margin: 0 0 28px;
  line-height: 1.6;
  max-width: 52ch;
`;

// ── Filters ──

const FilterSection = styled.div`
  margin-bottom: 12px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterChip = styled.button<{ $active: boolean; $color: string }>`
  padding: 7px 18px;
  border-radius: 24px;
  font-size: 13px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid ${(p) => (p.$active ? p.$color : "rgba(180,150,130,0.25)")};
  background: ${(p) => (p.$active ? `${p.$color}18` : "rgba(255,252,247,0.5)")};
  color: ${(p) => (p.$active ? p.$color : "#7a6e63")};

  &:hover {
    border-color: ${(p) => p.$color};
    color: ${(p) => p.$color};
  }
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #b8a595;
  letter-spacing: 0.06em;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  margin: 8px 0 4px 4px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CityChip = styled.button<{ $active: boolean }>`
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid ${(p) => (p.$active ? "rgba(180,130,90,0.3)" : "rgba(180,150,130,0.15)")};
  background: ${(p) => (p.$active ? "rgba(200,132,74,0.1)" : "rgba(255,252,247,0.4)")};
  color: ${(p) => (p.$active ? "#b07242" : "#8b7d73")};

  &:hover {
    border-color: rgba(200,132,74,0.35);
    color: #b07242;
  }
`;

const SearchBox = styled.div`
  position: relative;
  max-width: 340px;
  margin-top: 16px;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #c4a98e;
    width: 16px;
    height: 16px;
  }

  input {
    width: 100%;
    padding: 11px 14px 11px 40px;
    border: 1px solid rgba(180, 150, 130, 0.22);
    border-radius: 14px;
    background: rgba(255, 252, 247, 0.55);
    backdrop-filter: blur(8px);
    font-size: 14px;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    color: #3a2f28;
    outline: none;
    box-sizing: border-box;
    transition: border 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: rgba(200, 132, 74, 0.4);
      box-shadow: 0 0 0 3px rgba(200, 132, 74, 0.08);
    }

    &::placeholder { color: #c4a98e; }
  }
`;

// ── Cards ──

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  animation: ${fadeUp} 0.6s ease-out 0.1s both;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $expanded: boolean }>`
  background: rgba(255, 252, 247, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(200, 170, 140, 0.16);
  border-radius: 16px;
  padding: 22px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(160, 120, 80, 0.1);
    border-color: rgba(200, 140, 80, 0.28);
  }

  ${(p) =>
    p.$expanded &&
    `
    grid-column: 1 / -1;
    cursor: default;
    transform: none;
  `}
`;

const CardTag = styled.span<{ $color: string }>`
  display: inline-block;
  background: ${(p) => p.$color}14;
  color: ${(p) => p.$color};
  font-size: 11px;
  font-weight: 700;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  padding: 4px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  letter-spacing: 0.03em;
`;

const CardSchoolRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const CardSchool = styled.span`
  color: #6b5d4f;
  font-weight: 700;
`;

const CardCity = styled.span`
  color: #a89585;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 8px;
  line-height: 1.5;
  color: #2a221b;
`;

const CardExcerpt = styled.p`
  font-size: 13px;
  color: #8b7d6e;
  line-height: 1.7;
  margin: 0 0 14px;
`;

const CardStats = styled.div`
  display: flex;
  gap: 18px;
  font-size: 12px;
  color: #a89580;
  align-items: center;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  svg { width: 14px; height: 14px; }
`;

const FullBody = styled.div`
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(180, 150, 120, 0.18);
  font-size: 14px;
  line-height: 2;
  color: #3a2f28;
  white-space: pre-wrap;
`;

const Empty = styled.p`
  text-align: center;
  color: #a89580;
  font-size: 15px;
  padding: 56px 0;
  grid-column: 1 / -1;
`;

const ALL_CATEGORIES: (PostCategory | "all")[] = [
  "all", "dorm", "cafeteria", "study", "freshman", "city-life", "exam", "career",
];

export default function Experiences() {
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
    if (query.trim()) list = searchExperiences(query).filter((e) => list.includes(e));
    if (cityFilter) list = list.filter((e) => e.city === cityFilter);
    if (schoolFilter) list = list.filter((e) => e.schoolName === schoolFilter);
    return list;
  }, [activeCat, query, cityFilter, schoolFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Page>
      <Container>
        <Header>
          <Kicker>校园经验 · EXPERIENCES</Kicker>
          <Title>看见大学生活</Title>
          <Subtitle>来自学长学姐的真实分享，帮你提前看见每一个选择背后的风景</Subtitle>

          <FilterSection>
            <FilterRow>
              {ALL_CATEGORIES.map((cat) => {
                const meta = cat === "all" ? { label: "全部", color: "#b07242" } : CATEGORY_META[cat];
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
          </FilterSection>

          <SectionLabel><MapPin size={11} />按城市</SectionLabel>
          <FilterRow>
            <CityChip $active={!cityFilter} onClick={() => setCityFilter(null)}>全部</CityChip>
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

          <SectionLabel><School size={11} />按学校</SectionLabel>
          <FilterRow>
            <CityChip $active={!schoolFilter} onClick={() => setSchoolFilter(null)}>全部</CityChip>
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
          {filtered.map((exp, i) => {
            const meta = CATEGORY_META[exp.category];
            const expanded = expandedId === exp.id;
            return (
              <Card
                key={exp.id}
                $expanded={expanded}
                style={{ animationDelay: `${0.05 * (i % 9)}s` }}
                onClick={() => toggleExpand(exp.id)}
              >
                <CardTag $color={meta.color}>{meta.label}</CardTag>
                <CardSchoolRow>
                  <CardSchool>{exp.schoolName}</CardSchool>
                  <CardCity><MapPin size={10} />{exp.city}</CardCity>
                </CardSchoolRow>
                <CardTitle>{exp.title}</CardTitle>
                {!expanded && <CardExcerpt>{exp.excerpt}</CardExcerpt>}
                {expanded && <FullBody>{exp.body}</FullBody>}
                <CardStats>
                  <span><Heart size={14} />{exp.likes}</span>
                  <span><MessageCircle size={14} />{exp.comments}</span>
                  {exp.tags.slice(0, 2).map((t) => (
                    <span key={t} style={{ color: "#c8844a", fontSize: 10, fontWeight: 700 }}>#{t}</span>
                  ))}
                </CardStats>
              </Card>
            );
          })}
        </Grid>
      </Container>
    </Page>
  );
}
