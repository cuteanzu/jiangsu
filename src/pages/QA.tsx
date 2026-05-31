import { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Heart, Search as SearchIcon, ChevronDown, MapPin } from "lucide-react";
import { QA_ENTRIES, CATEGORY_META, searchQA, type PostCategory } from "../data/mock-content";
import { UNIVERSITIES } from "../data/jiangsu-universities";

const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  height: 100%;
  padding: 40px 32px 64px;
  background:
    radial-gradient(ellipse at 75% 5%, rgba(225,170,120,0.16) 0%, transparent 50%),
    radial-gradient(ellipse at 25% 85%, rgba(200,145,95,0.12) 0%, transparent 45%),
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
  max-width: 720px;
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
  max-width: 48ch;
`;

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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${fadeUp} 0.6s ease-out 0.1s both;
`;

const QAItem = styled.div<{ $expanded: boolean }>`
  background: rgba(255, 252, 247, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(200, 170, 140, 0.16);
  border-radius: 16px;
  padding: ${(p) => (p.$expanded ? "22px" : "18px 22px")};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);

  &:hover {
    border-color: rgba(200, 140, 80, 0.28);
    box-shadow: 0 6px 24px rgba(160, 120, 80, 0.08);
  }
`;

const QARow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const QMark = styled.span`
  font-size: 22px;
  font-weight: 900;
  color: #c8844a;
  flex-shrink: 0;
  line-height: 1.3;
  font-family: "Noto Sans SC", sans-serif;
`;

const QContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const Question = styled.h3`
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  line-height: 1.55;
  color: #2a221b;
`;

const Answer = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(180, 150, 120, 0.16);
  font-size: 14px;
  line-height: 1.95;
  color: #4a3f35;
`;

const QAMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: #a89580;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  svg { width: 14px; height: 14px; }
`;

const QATag = styled.span<{ $color: string }>`
  display: inline-block;
  background: ${(p) => p.$color}14;
  color: ${(p) => p.$color};
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 8px;
  margin-right: 8px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const SchoolRef = styled.span`
  color: #6b5d4f;
  font-weight: 700;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const CityRef = styled.span`
  color: #a89585;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 6px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
`;

const Chevron = styled(ChevronDown)<{ $expanded: boolean }>`
  width: 18px;
  height: 18px;
  color: #c4a98e;
  flex-shrink: 0;
  margin-top: 3px;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform: rotate(${(p) => (p.$expanded ? "180deg" : "0deg")});
`;

const Empty = styled.p`
  text-align: center;
  color: #a89580;
  font-size: 15px;
  padding: 56px 0;
`;

const categoryKeys: (PostCategory | "all")[] = [
  "all", "dorm", "study", "freshman", "city-life", "exam", "career",
];

export default function QA() {
  const [activeCat, setActiveCat] = useState<PostCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  const allQACities = useMemo(() => {
    const cities = new Set<string>();
    QA_ENTRIES.forEach((qa) => {
      if (qa.schoolName) {
        const uni = UNIVERSITIES.find((u) => u.name === qa.schoolName);
        if (uni) cities.add(uni.city);
      }
    });
    return [...cities].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }, []);

  const filtered = useMemo(() => {
    let list: typeof QA_ENTRIES = activeCat === "all" ? QA_ENTRIES : QA_ENTRIES.filter((a) => a.category === activeCat);
    if (query.trim()) list = searchQA(query).filter((a) => list.includes(a));
    if (cityFilter) {
      list = list.filter((qa) => {
        if (!qa.schoolName) return false;
        const uni = UNIVERSITIES.find((u) => u.name === qa.schoolName);
        return uni?.city === cityFilter;
      });
    }
    return list;
  }, [activeCat, query, cityFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getQACity = (schoolName?: string) => {
    if (!schoolName) return null;
    return UNIVERSITIES.find((u: { name: string; city: string }) => u.name === schoolName)?.city ?? null;
  };

  return (
    <Page>
      <Container>
        <Header>
          <Kicker>学长学姐问答 · Q&A</Kicker>
          <Title>你的疑问，过来人回答</Title>
          <Subtitle>新生最关心的问题，学长学姐用真实经历为你解答</Subtitle>

          <FilterSection>
            <FilterRow>
              {categoryKeys.map((cat) => {
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

          {allQACities.length > 0 && (
            <>
              <SectionLabel><MapPin size={11} />按城市</SectionLabel>
              <FilterRow>
                <CityChip $active={!cityFilter} onClick={() => setCityFilter(null)}>全部</CityChip>
                {allQACities.map((city) => (
                  <CityChip
                    key={city}
                    $active={cityFilter === city}
                    onClick={() => setCityFilter(cityFilter === city ? null : city)}
                  >
                    {city}
                  </CityChip>
                ))}
              </FilterRow>
            </>
          )}

          <SearchBox>
            <SearchIcon />
            <input
              placeholder="搜索问题、学校..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchBox>
        </Header>

        <List>
          {filtered.length === 0 && <Empty>没有找到匹配的问答</Empty>}
          {filtered.map((qa, i) => {
            const meta = CATEGORY_META[qa.category as PostCategory];
            const expanded = expandedId === qa.id;
            const qaCity = getQACity(qa.schoolName);
            return (
              <QAItem
                key={qa.id}
                $expanded={expanded}
                style={{ animationDelay: `${0.04 * i}s` }}
                onClick={() => toggleExpand(qa.id)}
              >
                <QARow>
                  <QMark>Q</QMark>
                  <QContent>
                    <Question>{qa.question}</Question>
                    {expanded && <Answer>{qa.answer}</Answer>}
                    <QAMeta>
                      <div>
                        {meta && <QATag $color={meta.color}>{meta.label}</QATag>}
                        {qa.schoolName && <SchoolRef>{qa.schoolName}</SchoolRef>}
                        {qaCity && <CityRef><MapPin size={10} />{qaCity}</CityRef>}
                      </div>
                      <span><Heart size={14} />{qa.likes}</span>
                    </QAMeta>
                  </QContent>
                  <Chevron $expanded={expanded} />
                </QARow>
              </QAItem>
            );
          })}
        </List>
      </Container>
    </Page>
  );
}
