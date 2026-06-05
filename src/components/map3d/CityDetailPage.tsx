import styled, { keyframes } from "styled-components";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { universityBandLabel } from "../../data/jiangsu-universities";
import type { Tier, University } from "../../data/jiangsu-universities";
import type { CityCockpitProfile } from "../../data/city-profiles";

const pageIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageLayer = styled.section`
  position: absolute;
  inset: 0;
  z-index: 13;
  overflow-y: auto;
  background:
    linear-gradient(90deg, rgba(252, 249, 244, 0.96) 0%, rgba(252, 249, 244, 0.90) 42%, rgba(252, 249, 244, 0.52) 100%),
    radial-gradient(ellipse at 78% 30%, rgba(142, 183, 201, 0.18), transparent 44%);
  backdrop-filter: blur(5px);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;

  @media (max-width: 860px) {
    background:
      linear-gradient(180deg, rgba(252, 249, 244, 0.94) 0%, rgba(252, 249, 244, 0.98) 58%, rgba(247, 239, 227, 0.98) 100%);
  }
`;

const Content = styled.div`
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: center;
  padding: clamp(28px, 5vw, 64px);
  box-sizing: border-box;
  animation: ${pageIn} 0.42s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    align-items: start;
    padding: 24px 18px 36px;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(181, 148, 117, 0.22);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.76);
  color: #8b5548;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 850;
  transition: background 0.16s ease, transform 0.16s ease;

  &:hover {
    background: rgba(255, 252, 247, 0.95);
    transform: translateY(-1px);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 620px;
`;

const Kicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b96b5f;
  font-size: 12px;
  font-weight: 900;

  svg {
    width: 15px;
    height: 15px;
  }
`;

const CityName = styled.h1`
  margin: 0;
  color: #2b1a12;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(52px, 9vw, 112px);
  font-weight: 900;
  line-height: 0.94;
`;

const Identity = styled.div`
  color: #7d5539;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(18px, 2vw, 26px);
  font-weight: 800;
`;

const Summary = styled.p`
  max-width: 58ch;
  margin: 0;
  color: #594838;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.9;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Metric = styled.div`
  min-width: 0;
  border: 1px solid rgba(181, 148, 117, 0.20);
  border-radius: 16px;
  background: rgba(255, 252, 247, 0.72);
  padding: 13px 14px;

  .label {
    color: #9b8571;
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .value {
    color: #355b6c;
    font-size: 18px;
    font-weight: 900;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(142, 183, 201, 0.12);
  color: #4d6773;
  font-size: 12px;
  font-weight: 850;
`;

const AtlasSide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

const ImageFrame = styled.div`
  position: relative;
  overflow: hidden;
  min-height: 330px;
  aspect-ratio: 16 / 10;
  border: 1px solid rgba(181, 148, 117, 0.24);
  border-radius: 22px;
  background:
    radial-gradient(ellipse at 50% 36%, rgba(255, 252, 247, 0.64), transparent 58%),
    #f4ebdf;
  box-shadow: 0 20px 64px rgba(103, 77, 54, 0.14);

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  @media (max-width: 540px) {
    min-height: 220px;
  }
`;

const SchoolPanel = styled.div`
  border: 1px solid rgba(181, 148, 117, 0.22);
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.78);
  padding: 16px;
`;

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  color: #3a2f28;
  font-size: 15px;
  font-weight: 900;

  span {
    color: #8b7d73;
    font-size: 12px;
    font-weight: 800;
  }
`;

const SchoolList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SchoolButton = styled.button<{ $selected: boolean }>`
  min-width: 0;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid ${(p) => (p.$selected ? "rgba(199, 107, 94, 0.34)" : "rgba(181, 148, 117, 0.14)")};
  border-radius: 13px;
  background: ${(p) => (p.$selected ? "rgba(217, 120, 69, 0.10)" : "rgba(255, 252, 247, 0.58)")};
  color: #35291f;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 850;
  text-align: left;
  padding: 8px 10px;
  transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(199, 107, 94, 0.30);
    background: rgba(255, 252, 247, 0.88);
  }
`;

const TierBadge = styled.span<{ $tier: Tier }>`
  flex: 0 0 auto;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 7px;
  font-weight: 850;
  background: ${({ $tier }) =>
    $tier === "985" ? "rgba(196, 90, 74, 0.14)" :
    $tier === "211" ? "rgba(142, 183, 201, 0.14)" :
    $tier === "dual" ? "rgba(127, 147, 101, 0.13)" :
    "rgba(139, 125, 115, 0.10)"};
  color: ${({ $tier }) =>
    $tier === "985" ? "#a84b3d" :
    $tier === "211" ? "#496f80" :
    $tier === "dual" ? "#62754c" :
    "#76685e"};
`;

const NavRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const NavButton = styled.button`
  min-width: 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgba(181, 148, 117, 0.22);
  border-radius: 14px;
  background: rgba(255, 252, 247, 0.74);
  color: #4f3f32;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  transition: background 0.16s ease, transform 0.16s ease;

  &:hover {
    background: rgba(255, 252, 247, 0.94);
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface CityDetailPageProps {
  cityName: string;
  profile: CityCockpitProfile;
  cityUniversities: University[];
  selectedSchoolName: string | null;
  imageSrc: string;
  previousCity: string;
  nextCity: string;
  onBackToMap: () => void;
  onSelectCity: (city: string) => void;
  onSelectSchool: (name: string | null) => void;
  onViewSchoolDetail: (school: University) => void;
}

export default function CityDetailPage({
  cityName,
  profile,
  cityUniversities,
  selectedSchoolName,
  imageSrc,
  previousCity,
  nextCity,
  onBackToMap,
  onSelectCity,
  onSelectSchool,
  onViewSchoolDetail,
}: CityDetailPageProps) {
  return (
    <PageLayer aria-label={`${cityName}城市详情`}>
      <Content>
        <Hero>
          <BackButton type="button" onClick={onBackToMap}>
            <ArrowLeft size={15} />
            返回地图
          </BackButton>

          <Kicker>
            <MapPin size={15} />
            JIANGSU CITY ATLAS
          </Kicker>
          <CityName>{cityName}</CityName>
          <Identity>{profile.identity}</Identity>
          <Summary>{profile.summary}</Summary>

          <MetricGrid>
            <Metric>
              <div className="label">一本+院校</div>
              <div className="value">{cityUniversities.length} 所</div>
            </Metric>
            <Metric>
              <div className="label">生活成本</div>
              <div className="value">{profile.cost}</div>
            </Metric>
            <Metric>
              <div className="label">就业机会</div>
              <div className="value">{profile.jobs}</div>
            </Metric>
          </MetricGrid>

          <TagRow>
            {profile.impressions.slice(0, 5).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagRow>
        </Hero>

        <AtlasSide>
          <ImageFrame>
            <img src={imageSrc} alt={`${cityName}城市图`} />
          </ImageFrame>

          <SchoolPanel>
            <PanelTitle>
              <div>
                <GraduationCap size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
                一本+索引
              </div>
              <span>{profile.transit} · {profile.stats.population}</span>
            </PanelTitle>
            <SchoolList>
              {cityUniversities.map((school) => (
                <SchoolButton
                  key={school.id}
                  type="button"
                  $selected={selectedSchoolName === school.name}
                  onClick={() => {
                    onSelectSchool(school.name);
                    onViewSchoolDetail(school);
                  }}
                >
                  <span>
                    <BookOpen size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
                    {school.name}
                  </span>
                  <TierBadge $tier={school.tier}>{universityBandLabel(school)}</TierBadge>
                </SchoolButton>
              ))}
            </SchoolList>
          </SchoolPanel>

          <NavRow>
            <NavButton type="button" onClick={() => onSelectCity(previousCity)}>
              <ChevronLeft size={16} />
              {previousCity}
            </NavButton>
            <NavButton type="button" onClick={() => onSelectCity(nextCity)}>
              {nextCity}
              <ChevronRight size={16} />
            </NavButton>
          </NavRow>
        </AtlasSide>
      </Content>
    </PageLayer>
  );
}
