import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Heart, Search as SearchIcon, ChevronDown, MapPin } from "lucide-react";
import { QA_ENTRIES, CATEGORY_META, searchQA, type PostCategory } from "../data/mock-content";
import { UNIVERSITIES } from "../data/jiangsu-universities";
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
  max-width: 720px;
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

const List = styled.div`
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const QAItem = styled.div<{ $expanded: boolean }>`
  background: rgba(255, 252, 247, 0.82);
  border: 1px solid rgba(180, 150, 130, 0.18);
  border-radius: 16px;
  padding: ${(p) => (p.$expanded ? "20px" : "16px 20px")};
  cursor: pointer;
  transition: all 0.25s ease;
  animation: ${fadeUp} 0.5s ease-out both;

  &:hover {
    border-color: rgba(180, 150, 130, 0.35);
    box-shadow: 0 4px 16px rgba(120, 90, 60, 0.06);
  }
`;

const QARow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const QMark = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #c76b5e;
  flex-shrink: 0;
  line-height: 1.4;
`;

const QContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const Question = styled.h3`
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  line-height: 1.5;
  color: #3a2f28;
`;

const Answer = styled.div`
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(180, 150, 130, 0.15);
  font-size: 14px;
  line-height: 1.85;
  color: #4a3f38;
`;

const QAMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #a89588;

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

const QATag = styled.span<{ $color: string }>`
  display: inline-block;
  background: ${(p) => p.$color}14;
  color: ${(p) => p.$color};
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  margin-right: 6px;
`;

const SchoolRef = styled.span`
  color: #8b7d73;
  font-weight: 700;
`;

const CityRef = styled.span`
  color: #a89588;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 6px;
`;

const Chevron = styled(ChevronDown)<{ $expanded: boolean }>`
  width: 18px;
  height: 18px;
  color: #b8a090;
  flex-shrink: 0;
  margin-top: 2px;
  transition: transform 0.25s ease;
  transform: rotate(${(p) => (p.$expanded ? "180deg" : "0deg")});
`;

const Empty = styled.p`
  text-align: center;
  color: #8b7d73;
  font-size: 15px;
  padding: 48px 0;
`;

const categoryKeys: (PostCategory | "all")[] = [
  "all",
  "dorm",
  "study",
  "freshman",
  "city-life",
  "exam",
  "career",
];

export default function QA() {
  const nav = useNavigate();
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
    let list = activeCat === "all" ? QA_ENTRIES : QA_ENTRIES.filter((a) => a.category === activeCat);
    if (query.trim()) {
      list = searchQA(query).filter((a) => list.includes(a));
    }
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
    return UNIVERSITIES.find((u) => u.name === schoolName)?.city ?? null;
  };

  return (
    <Page>
      <Header>
        <Title>学长学姐问答</Title>
        <Subtitle>新生最关心的问题，过来人为你解答</Subtitle>
        <FilterRow>
          {categoryKeys.map((cat) => {
            const meta =
              cat === "all" ? { label: "全部", color: "#8b7d73" } : CATEGORY_META[cat];
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
        {allQACities.length > 0 && (
          <>
            <BrowseLabel><MapPin size={11} />按城市浏览</BrowseLabel>
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
        {filtered.map((qa) => {
          const meta = CATEGORY_META[qa.category as PostCategory];
          const expanded = expandedId === qa.id;
          const qaCity = getQACity(qa.schoolName);
          return (
            <QAItem key={qa.id} $expanded={expanded} onClick={() => toggleExpand(qa.id)}>
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
                    <span><Heart />{qa.likes}</span>
                  </QAMeta>
                </QContent>
                <Chevron $expanded={expanded} />
              </QARow>
            </QAItem>
          );
        })}
      </List>
      <DeskPet
        compact
        scene="qa"
        preferredSide="right"
        actions={[
          { label: "探索高校地图", onClick: () => nav("/jiangsu") },
          { label: "查看校园经验", onClick: () => nav("/experiences") },
        ]}
      />
    </Page>
  );
}
