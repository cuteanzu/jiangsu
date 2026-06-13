import { useMemo } from "react";
import styled, { css, keyframes } from "styled-components";
import {
  AlertCircle,
  Briefcase,
  Database,
  ExternalLink,
  Flame,
  Heart,
  MapPin,
  Navigation,
  School,
  Tag,
  Train,
  Wallet,
} from "lucide-react";
import type { CityProfileDTO, SchoolDTO } from "../../services/types";

const shimmer = keyframes`
  0% { background-position: 120% 0; }
  100% { background-position: -120% 0; }
`;

const Panel = styled.aside`
  position: absolute;
  z-index: 12;
  top: 132px;
  right: 24px;
  width: min(328px, calc(100vw - 48px));
  max-height: calc(100% - 164px);
  overflow: hidden auto;
  border: 1px solid oklch(82% 0.035 64 / 0.42);
  border-radius: 8px;
  background: oklch(98.6% 0.012 78 / 0.92);
  box-shadow: 0 18px 44px oklch(48% 0.045 58 / 0.14);
  color: oklch(29% 0.038 58);
  font-family: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
  backdrop-filter: blur(18px);
  scrollbar-width: thin;

  @media (max-width: 1180px) {
    top: auto;
    right: 18px;
    bottom: 18px;
    max-height: 42vh;
  }

  @media (max-width: 720px) {
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
    max-height: 38vh;
  }
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 14px 16px 12px;
  border-bottom: 1px solid oklch(84% 0.03 67 / 0.36);
  background: oklch(98.6% 0.012 78 / 0.96);
  backdrop-filter: blur(18px);
`;

const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 7px;
  color: oklch(48% 0.095 45);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0;

  svg {
    width: 13px;
    height: 13px;
  }
`;

const Title = styled.h2`
  margin: 0;
  color: oklch(24% 0.035 55);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 900;
`;

const Body = styled.div`
  padding: 12px 16px 16px;
`;

const CompactStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin-bottom: 13px;
`;

const Stat = styled.div`
  min-width: 0;
  padding: 7px 8px;
  border: 1px solid oklch(86% 0.022 70 / 0.52);
  border-radius: 7px;
  background: oklch(99% 0.009 80 / 0.72);

  strong {
    display: block;
    color: oklch(31% 0.052 52);
    font-size: 16px;
    line-height: 1.1;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 3px;
    color: oklch(50% 0.035 58);
    font-size: 10px;
    font-weight: 750;
    white-space: nowrap;
  }
`;

const Section = styled.section`
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid oklch(85% 0.026 68 / 0.48);
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  color: oklch(34% 0.043 58);
  font-size: 12px;
  font-weight: 900;

  svg {
    width: 14px;
    height: 14px;
    color: oklch(53% 0.115 43);
  }
`;

const MutedText = styled.p`
  margin: 0;
  color: oklch(48% 0.032 62);
  font-size: 12px;
  line-height: 1.68;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 23px;
  padding: 0 8px;
  border: 1px solid oklch(82% 0.045 55 / 0.46);
  border-radius: 999px;
  background: oklch(96% 0.027 72 / 0.76);
  color: oklch(38% 0.052 52);
  font-size: 10.5px;
  font-weight: 800;

  svg {
    width: 11px;
    height: 11px;
  }
`;

const TraitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 7px;
`;

const Trait = styled.div`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 7px;
  align-items: start;
  color: oklch(42% 0.038 58);
  font-size: 11.5px;
  line-height: 1.45;

  svg {
    width: 14px;
    height: 14px;
    margin-top: 1px;
    color: oklch(53% 0.075 200);
  }

  b {
    color: oklch(31% 0.04 56);
    font-weight: 900;
  }
`;

const SchoolList = styled.div`
  display: grid;
  gap: 6px;
`;

const SchoolButton = styled.button<{ $selected?: boolean }>`
  width: 100%;
  min-height: 48px;
  padding: 8px 9px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;

  ${({ $selected }) => $selected && css`
    border-color: oklch(70% 0.095 45 / 0.42);
    background: oklch(94% 0.033 66 / 0.72);
  `}

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(78% 0.04 64 / 0.52);
    background: oklch(96.4% 0.018 76 / 0.9);
  }
`;

const SchoolRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
`;

const SchoolName = styled.strong`
  display: block;
  overflow: hidden;
  color: oklch(25% 0.039 55);
  font-size: 12px;
  line-height: 1.35;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SchoolMeta = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: oklch(51% 0.028 60);
  font-size: 10.5px;
  line-height: 1.35;

  svg {
    width: 11px;
    height: 11px;
    color: oklch(54% 0.08 45);
  }
`;

const Score = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 999px;
  background: oklch(94% 0.037 50 / 0.88);
  color: oklch(43% 0.105 42);
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;

  svg {
    width: 11px;
    height: 11px;
  }
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  margin-top: 9px;
  padding: 0 10px;
  border: 1px solid oklch(74% 0.065 46 / 0.46);
  border-radius: 7px;
  background: oklch(96% 0.024 68 / 0.74);
  color: oklch(39% 0.085 42);
  font-size: 11px;
  font-weight: 900;
  text-decoration: none;

  &:hover {
    background: oklch(93.5% 0.034 58 / 0.86);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const Notice = styled.div<{ $error?: boolean }>`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 7px;
  padding: 10px;
  border: 1px solid ${({ $error }) => $error ? "oklch(70% 0.11 35 / 0.42)" : "oklch(84% 0.03 68 / 0.46)"};
  border-radius: 7px;
  background: ${({ $error }) => $error ? "oklch(96% 0.035 38 / 0.74)" : "oklch(97% 0.016 78 / 0.74)"};
  color: ${({ $error }) => $error ? "oklch(42% 0.09 34)" : "oklch(47% 0.032 62)"};
  font-size: 11.5px;
  line-height: 1.55;

  svg {
    width: 14px;
    height: 14px;
    margin-top: 2px;
  }
`;

const Skeleton = styled.div`
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    oklch(92% 0.015 78 / 0.45),
    oklch(98% 0.01 78 / 0.85),
    oklch(92% 0.015 78 / 0.45)
  );
  background-size: 220% 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;

  & + & {
    margin-top: 8px;
  }
`;

interface MapDataPanelProps {
  selectedCityName: string | null;
  selectedSchoolName: string | null;
  schools: SchoolDTO[];
  hotSchools: SchoolDTO[];
  cityProfiles: CityProfileDTO[];
  loading: boolean;
  error: string | null;
  onSelectCity: (cityName: string) => void;
  onSelectSchool: (schoolName: string) => void;
}

function getWebsiteLabel(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "官网";
  }
}

function sortByHotScore(items: SchoolDTO[]) {
  return [...items].sort((a, b) => b.hotScore - a.hotScore || b.favoriteCount - a.favoriteCount);
}

export default function MapDataPanel({
  selectedCityName,
  selectedSchoolName,
  schools,
  hotSchools,
  cityProfiles,
  loading,
  error,
  onSelectCity,
  onSelectSchool,
}: MapDataPanelProps) {
  const selectedSchool = useMemo(
    () => (selectedSchoolName ? schools.find((school) => school.name === selectedSchoolName) ?? null : null),
    [schools, selectedSchoolName],
  );

  const activeCityName = selectedCityName ?? selectedSchool?.cityName ?? null;

  const activeCityProfile = useMemo(
    () => (activeCityName ? cityProfiles.find((city) => city.name === activeCityName) ?? null : null),
    [activeCityName, cityProfiles],
  );

  const citySchools = useMemo(
    () => (activeCityName ? sortByHotScore(schools.filter((school) => school.cityName === activeCityName)) : []),
    [activeCityName, schools],
  );

  const topCities = useMemo(
    () => [...cityProfiles].sort((a, b) => b.schoolCount - a.schoolCount).slice(0, 5),
    [cityProfiles],
  );

  const rankedSchools = useMemo(
    () => (citySchools.length > 0 ? citySchools.slice(0, 6) : sortByHotScore(hotSchools).slice(0, 6)),
    [citySchools, hotSchools],
  );

  return (
    <Panel aria-label="后端数据面板" data-testid="map-data-panel">
      <Header>
        <Eyebrow>
          <Database size={13} />
          BACKEND DATA
        </Eyebrow>
        <Title>{activeCityName ? `${activeCityName} 数据画像` : "江苏高校数据层"}</Title>
      </Header>

      <Body>
        <CompactStats>
          <Stat>
            <strong>{loading ? "..." : schools.length}</strong>
            <span>后端高校</span>
          </Stat>
          <Stat>
            <strong>{loading ? "..." : cityProfiles.length}</strong>
            <span>城市画像</span>
          </Stat>
          <Stat>
            <strong>{loading ? "..." : hotSchools.length}</strong>
            <span>热度样本</span>
          </Stat>
        </CompactStats>

        {loading && (
          <Notice>
            <Database size={14} />
            <div>
              正在读取后端学校、城市画像和热度榜。
              <Skeleton style={{ width: "86%", marginTop: 8 }} />
              <Skeleton style={{ width: "62%" }} />
            </div>
          </Notice>
        )}

        {!loading && error && (
          <Notice $error>
            <AlertCircle size={14} />
            <div>后端数据暂时不可用，地图仍会使用本地坐标兜底。错误信息：{error}</div>
          </Notice>
        )}

        {!loading && !error && schools.length === 0 && (
          <Notice>
            <Database size={14} />
            <div>接口已连通，但暂时没有学校数据。导入数据后这里会自动出现城市与学校列表。</div>
          </Notice>
        )}

        {selectedSchool && (
          <Section>
            <SectionTitle>
              <School size={14} />
              当前学校
            </SectionTitle>
            <SchoolRow>
              <div>
                <SchoolName>{selectedSchool.name}</SchoolName>
                <SchoolMeta>
                  <MapPin size={11} />
                  {selectedSchool.cityName} · {selectedSchool.level || selectedSchool.type}
                </SchoolMeta>
              </div>
              <Score>
                <Flame size={11} />
                {selectedSchool.hotScore}
              </Score>
            </SchoolRow>
            <SchoolMeta>
              <Heart size={11} />
              {selectedSchool.favoriteCount} 次收藏
              {selectedSchool.address ? ` · ${selectedSchool.address}` : ""}
            </SchoolMeta>
            {selectedSchool.brief && <MutedText style={{ marginTop: 8 }}>{selectedSchool.brief}</MutedText>}
            {selectedSchool.website && (
              <LinkButton href={selectedSchool.website} target="_blank" rel="noreferrer">
                {getWebsiteLabel(selectedSchool.website)}
                <ExternalLink size={12} />
              </LinkButton>
            )}
          </Section>
        )}

        {activeCityProfile && (
          <Section>
            <SectionTitle>
              <MapPin size={14} />
              城市画像
            </SectionTitle>
            {(activeCityProfile.tags ?? []).length > 0 && (
              <TagRow>
                {(activeCityProfile.tags ?? []).map((tag) => (
                  <TagPill key={tag}>
                    <Tag size={11} />
                    {tag}
                  </TagPill>
                ))}
              </TagRow>
            )}
            <TraitGrid style={{ marginTop: 10 }}>
              <Trait>
                <Wallet size={14} />
                <span><b>成本</b>：{activeCityProfile.cost}</span>
              </Trait>
              <Trait>
                <Train size={14} />
                <span><b>交通</b>：{activeCityProfile.transit}</span>
              </Trait>
              <Trait>
                <Briefcase size={14} />
                <span><b>机会</b>：{activeCityProfile.jobs}</span>
              </Trait>
              <Trait>
                <Navigation size={14} />
                <span><b>适合</b>：{activeCityProfile.audience}</span>
              </Trait>
            </TraitGrid>
          </Section>
        )}

        {!activeCityName && topCities.length > 0 && (
          <Section>
            <SectionTitle>
              <MapPin size={14} />
              数据最多的城市
            </SectionTitle>
            <SchoolList>
              {topCities.map((city) => (
                <SchoolButton key={city.id} onClick={() => onSelectCity(city.name)}>
                  <SchoolRow>
                    <div>
                      <SchoolName>{city.name}</SchoolName>
                      <SchoolMeta>{(city.tags ?? []).slice(0, 2).join(" · ") || city.audience}</SchoolMeta>
                    </div>
                    <Score>{city.schoolCount} 校</Score>
                  </SchoolRow>
                </SchoolButton>
              ))}
            </SchoolList>
          </Section>
        )}

        {rankedSchools.length > 0 && (
          <Section>
            <SectionTitle>
              <Flame size={14} />
              {activeCityName ? "本城热度学校" : "全省热度学校"}
            </SectionTitle>
            <SchoolList>
              {rankedSchools.map((school) => (
                <SchoolButton
                  key={school.id}
                  $selected={selectedSchoolName === school.name}
                  onClick={() => onSelectSchool(school.name)}
                >
                  <SchoolRow>
                    <div>
                      <SchoolName>{school.name}</SchoolName>
                      <SchoolMeta>
                        <MapPin size={11} />
                        {school.cityName} · {school.level || school.type}
                      </SchoolMeta>
                    </div>
                    <Score>
                      <Flame size={11} />
                      {school.hotScore}
                    </Score>
                  </SchoolRow>
                </SchoolButton>
              ))}
            </SchoolList>
          </Section>
        )}
      </Body>
    </Panel>
  );
}
