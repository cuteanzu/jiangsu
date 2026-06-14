import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Heart,
  HelpCircle,
  Home,
  MapPin,
  MessageCircle,
  Route,
  School,
  Search,
  Sparkles,
  Star,
  Train,
  Utensils,
  X,
} from "lucide-react";
import { UNIVERSITIES, universityBandLabel, universityBandReason } from "../../data/jiangsu-universities";
import type { University } from "../../data/jiangsu-universities";
import { cityLifeNote } from "../../data/city-profiles";
import { SCHOOL_REC } from "./schoolRecommendations";
import { useTransition } from "../../context/useTransition";
import { useAuth } from "../../hooks/useAuth";
import { commentsApi, contentApi, schoolsApi, userApi } from "../../services/api";
import type { CommentDTO, ExperienceDTO, QADTO, SchoolDTO, SchoolDetailDTO } from "../../services/types";
import {
  clipSurveySummary,
  getLifeSurveyCoverage,
  getLifeSurveyHighlights,
  getLifeSurveyItems,
  groupLifeSurveyItems,
  surveyResponseLabel,
} from "../../utils/lifeSurvey";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 30;
  overflow-y: auto;
  padding: 34px 24px 62px;
  box-sizing: border-box;
  background:
    radial-gradient(ellipse at 50% 12%, oklch(97% 0.026 54 / 0.78), transparent 52%),
    linear-gradient(175deg, oklch(97% 0.018 76), oklch(93% 0.018 66));
  color: oklch(24% 0.035 56);
  font-family: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
  animation: ${fadeIn} 0.22s ease-out;
`;

const Shell = styled.article`
  width: min(1120px, 100%);
  margin: 0 auto;
  border: 1px solid oklch(82% 0.032 68 / 0.62);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.86);
  box-shadow: 0 24px 70px oklch(42% 0.04 58 / 0.16);
  overflow: hidden;
  animation: ${fadeUp} 0.28s ease-out both;
`;

const Header = styled.header`
  position: relative;
  padding: 28px 34px 26px;
  border-bottom: 1px solid oklch(84% 0.026 72 / 0.62);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  border: 1px solid oklch(82% 0.028 72 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.72);
  color: oklch(48% 0.032 62);
  cursor: pointer;
  display: grid;
  place-items: center;

  &:hover {
    color: oklch(36% 0.09 42);
    border-color: oklch(70% 0.07 48 / 0.62);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: oklch(46% 0.11 42);
  font-size: 12px;
  font-weight: 950;

  svg {
    width: 15px;
    height: 15px;
  }
`;

const Title = styled.h1`
  max-width: 15ch;
  margin: 14px 0 12px;
  color: oklch(20% 0.032 52);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 44px;
  line-height: 1.1;
  font-weight: 950;
  letter-spacing: 0;
`;

const Lead = styled.p`
  max-width: 74ch;
  margin: 0;
  color: oklch(43% 0.032 62);
  font-size: 14px;
  line-height: 1.85;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
  color: oklch(50% 0.032 62);
  font-size: 12px;
  font-weight: 820;

  span, a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 26px;
    padding: 0 9px;
    border: 1px solid oklch(84% 0.026 72 / 0.68);
    border-radius: 999px;
    background: oklch(98% 0.01 82 / 0.7);
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    color: oklch(42% 0.1 42);
    border-color: oklch(72% 0.065 48 / 0.7);
  }

  svg {
    width: 13px;
    height: 13px;
  }
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  padding: 24px 34px 34px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MainStack = styled.div`
  display: grid;
  gap: 20px;
`;

const SideStack = styled.aside`
  position: sticky;
  top: 18px;
  display: grid;
  gap: 14px;

  @media (max-width: 980px) {
    position: static;
  }
`;

const Section = styled.section`
  border: 1px solid oklch(84% 0.026 72 / 0.66);
  border-radius: 8px;
  background: oklch(98.6% 0.01 82 / 0.68);
  padding: 18px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: oklch(23% 0.035 54);
    font-size: 18px;
    line-height: 1.3;
    font-weight: 950;
  }

  p {
    max-width: 58ch;
    margin: 4px 0 0;
    color: oklch(49% 0.03 62);
    font-size: 12.5px;
    line-height: 1.65;
  }

  svg {
    width: 18px;
    height: 18px;
    color: oklch(48% 0.11 43);
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Metric = styled.div`
  min-width: 0;
  padding: 13px;
  border: 1px solid oklch(84% 0.026 72 / 0.66);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.7);

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: oklch(52% 0.03 62);
    font-size: 11px;
    font-weight: 850;
  }

  strong {
    display: block;
    overflow: hidden;
    margin-top: 8px;
    color: oklch(25% 0.038 55);
    font-size: 19px;
    line-height: 1.15;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    width: 14px;
    height: 14px;
    color: oklch(48% 0.11 43);
  }
`;

const LifeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const LifeCard = styled.div`
  min-width: 0;
  border: 1px solid oklch(84% 0.026 72 / 0.66);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.68);
  padding: 14px;

  strong {
    display: flex;
    align-items: center;
    gap: 7px;
    color: oklch(27% 0.035 55);
    font-size: 13px;
    font-weight: 950;
  }

  p {
    margin: 8px 0 0;
    color: oklch(44% 0.032 62);
    font-size: 12.5px;
    line-height: 1.7;
  }

  svg {
    width: 15px;
    height: 15px;
    color: oklch(49% 0.1 43);
  }
`;

const ScorePill = styled.span`
  margin-left: auto;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: oklch(94% 0.03 54 / 0.74);
  color: oklch(42% 0.095 43);
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
`;

const SurveyOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SurveyStat = styled.div`
  min-width: 0;
  padding: 12px;
  border: 1px solid oklch(84% 0.026 72 / 0.66);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.68);

  span {
    display: block;
    color: oklch(52% 0.03 62);
    font-size: 11px;
    font-weight: 850;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: oklch(27% 0.035 55);
    font-size: 18px;
    line-height: 1.18;
    font-weight: 950;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SurveyGroupRail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 0 0 14px;
`;

const SurveyGroupPill = styled.span`
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  background: oklch(94% 0.026 145 / 0.7);
  color: oklch(36% 0.08 145);
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  font-weight: 900;
`;

const SurveyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SurveyItem = styled.div`
  min-width: 0;
  padding: 13px;
  border: 1px solid oklch(84% 0.026 72 / 0.66);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.68);

  strong {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: oklch(28% 0.035 55);
    font-size: 13px;
    font-weight: 950;
  }

  em {
    color: oklch(45% 0.085 145);
    font-size: 11px;
    font-style: normal;
    font-weight: 900;
  }

  p {
    margin: 8px 0 0;
    color: oklch(43% 0.032 62);
    font-size: 12.5px;
    line-height: 1.68;
  }
`;

const List = styled.div`
  display: grid;
  gap: 8px;
`;

const ListButton = styled.button`
  width: 100%;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid oklch(88% 0.02 72 / 0.58);
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  font: inherit;

  &:last-child {
    border-bottom: 0;
  }

  strong {
    display: block;
    color: oklch(30% 0.035 56);
    font-size: 13px;
    line-height: 1.45;
    font-weight: 920;
  }

  span {
    display: block;
    margin-top: 4px;
    color: oklch(54% 0.028 62);
    font-size: 11.5px;
    line-height: 1.45;
  }

  &:hover strong {
    color: oklch(44% 0.11 43);
  }
`;

const CommentRow = styled.article`
  padding: 10px 0;
  border-bottom: 1px solid oklch(88% 0.02 72 / 0.58);

  &:last-child {
    border-bottom: 0;
  }

  strong {
    display: block;
    color: oklch(31% 0.035 56);
    font-size: 12.5px;
    font-weight: 900;
  }

  p {
    margin: 6px 0 0;
    color: oklch(44% 0.032 62);
    font-size: 12.5px;
    line-height: 1.65;
  }

  span {
    display: block;
    margin-top: 5px;
    color: oklch(56% 0.026 62);
    font-size: 11px;
  }
`;

const Notice = styled.div<{ $error?: boolean }>`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  padding: 11px 12px;
  border: 1px solid ${({ $error }) => ($error ? "oklch(70% 0.11 35 / 0.42)" : "oklch(78% 0.045 66 / 0.58)")};
  border-radius: 8px;
  background: ${({ $error }) => ($error ? "oklch(96% 0.035 38 / 0.64)" : "oklch(97% 0.018 62 / 0.62)")};
  color: ${({ $error }) => ($error ? "oklch(42% 0.09 34)" : "oklch(42% 0.035 58)")};
  font-size: 12px;
  line-height: 1.6;

  svg {
    width: 15px;
    height: 15px;
    margin-top: 2px;
  }
`;

const ActionStack = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 14px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid ${({ $primary }) => ($primary ? "oklch(62% 0.11 43 / 0.58)" : "oklch(82% 0.028 72 / 0.72)")};
  border-radius: 8px;
  background: ${({ $primary }) => ($primary ? "oklch(94.5% 0.035 45 / 0.84)" : "oklch(99% 0.008 82 / 0.64)")};
  color: ${({ $primary }) => ($primary ? "oklch(42% 0.1 42)" : "oklch(39% 0.04 58)")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font: inherit;
  font-size: 13px;
  font-weight: 900;

  &:hover {
    border-color: oklch(70% 0.07 48 / 0.62);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

const InlineMessage = styled.div<{ $error?: boolean }>`
  margin-top: 10px;
  color: ${({ $error }) => ($error ? "oklch(42% 0.12 32)" : "oklch(38% 0.09 145)")};
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  line-height: 1.5;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  color: oklch(52% 0.03 62);
  font-size: 12.5px;
  line-height: 1.7;
`;

interface Props {
  schoolName: string;
  universities?: University[];
  onClose: () => void;
}

function exactSchoolMatch(list: SchoolDTO[], name: string) {
  return list.find((item) => item.name === name) ?? list[0] ?? null;
}

function formatScore(value?: number) {
  return typeof value === "number" ? `${value.toFixed(1)}/10` : "待补全";
}

function clip(value: string, length = 82) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function fallbackLifeText(city: string, key: "dorm" | "food" | "transit" | "life") {
  const life = cityLifeNote(city);
  return life[key];
}

function formatDate(value?: string) {
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

export default function SchoolDetailOverlay({ schoolName, universities = UNIVERSITIES, onClose }: Props) {
  const { navigateWithTransition } = useTransition();
  const { authenticated } = useAuth();
  const school = useMemo(() => universities.find((u) => u.name === schoolName) ?? null, [schoolName, universities]);
  const [schoolRecord, setSchoolRecord] = useState<SchoolDTO | null>(null);
  const [detail, setDetail] = useState<SchoolDetailDTO | null>(null);
  const [experiences, setExperiences] = useState<ExperienceDTO[]>([]);
  const [questions, setQuestions] = useState<QADTO[]>([]);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [favoriteError, setFavoriteError] = useState(false);

  useEffect(() => {
    if (!school) return;
    let active = true;
    setLoading(true);
    setError("");

    schoolsApi.search({ keyword: school.name, size: 8 })
      .then((items) => {
        if (!active) return null;
        const matched = exactSchoolMatch(Array.isArray(items) ? items : [], school.name);
        setSchoolRecord(matched);
        return matched ? schoolsApi.detail(matched.id) : null;
      })
      .then((nextDetail) => {
        if (active && nextDetail) setDetail(nextDetail);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "学校档案暂时无法同步");
        setDetail(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [school]);

  useEffect(() => {
    if (!school) return;
    let active = true;
    Promise.all([
      contentApi.experiences({ schoolId: schoolRecord?.id ?? undefined }),
      contentApi.qa(),
      schoolRecord?.id ? commentsApi.bySchool(schoolRecord.id, 0, 5) : Promise.resolve([]),
    ])
      .then(([nextExperiences, nextQuestions, nextComments]) => {
        if (!active) return;
        const schoolExperiences = (Array.isArray(nextExperiences) ? nextExperiences : [])
          .filter((item) => item.schoolName === school.name || item.schoolId === school.id)
          .slice(0, 5);
        const schoolQuestions = (Array.isArray(nextQuestions) ? nextQuestions : [])
          .filter((item) => item.schoolName === school.name || item.schoolId === school.id)
          .slice(0, 5);
        setExperiences(schoolExperiences);
        setQuestions(schoolQuestions);
        setComments(Array.isArray(nextComments) ? nextComments : []);
      })
      .catch(() => {
        if (!active) return;
        setExperiences([]);
        setQuestions([]);
        setComments([]);
      });

    return () => {
      active = false;
    };
  }, [school, schoolRecord?.id]);

  if (!school) return null;

  const basic = detail?.basic ?? schoolRecord;
  const lifeInfo = detail?.lifeInfo;
  const lifeSurvey = detail?.lifeSurvey;
  const surveyItems = getLifeSurveyItems(lifeSurvey);
  const surveyHighlights = getLifeSurveyHighlights(lifeSurvey, 8);
  const groupedSurvey = groupLifeSurveyItems(surveyItems);
  const surveyCoverage = getLifeSurveyCoverage(lifeSurvey);
  const tierLabel = basic?.level || universityBandLabel(school);
  const tierDesc = basic?.type || universityBandReason(school);
  const recText = basic?.brief || SCHOOL_REC[school.name] || `位于${school.city}的高校档案正在补全中。`;
  const schoolParam = encodeURIComponent(school.name);
  const cityParam = encodeURIComponent(basic?.cityName ?? school.city);
  const contributionPath = `/me?tab=submissions&type=CORRECTION&school=${schoolParam}`;
  const questionPath = `/me?tab=submissions&type=QUESTION&school=${schoolParam}`;
  const loginPath = `/login?next=${encodeURIComponent(contributionPath)}`;
  const isFavorited = Boolean(detail?.isFavorited ?? basic?.isFavorited);
  const favoriteCount = basic?.favoriteCount ?? 0;

  const go = (path: string) => navigateWithTransition(path);

  const handleFavorite = async () => {
    if (!basic?.id) {
      setFavoriteError(true);
      setFavoriteMessage("学校档案同步后才可以收藏。");
      return;
    }
    if (!authenticated) {
      go(`/login?next=${encodeURIComponent(`/jiangsu?city=${cityParam}&school=${school.id}&view=detail`)}`);
      return;
    }

    setFavoriteBusy(true);
    setFavoriteMessage("");
    setFavoriteError(false);
    try {
      if (isFavorited) {
        await userApi.removeFavorite(basic.id);
        setDetail((current) => current ? {
          ...current,
          basic: { ...current.basic, isFavorited: false, favoriteCount: Math.max(0, (current.basic.favoriteCount ?? 0) - 1) },
          isFavorited: false,
        } : current);
        setFavoriteMessage("已从个人页学校清单移除。");
      } else {
        await userApi.addFavorite(basic.id);
        setDetail((current) => current ? {
          ...current,
          basic: { ...current.basic, isFavorited: true, favoriteCount: (current.basic.favoriteCount ?? 0) + 1 },
          isFavorited: true,
        } : current);
        setFavoriteMessage("已加入个人页学校清单。");
      }
    } catch (err) {
      setFavoriteError(true);
      setFavoriteMessage(err instanceof Error ? err.message : "收藏操作失败，请稍后再试。");
    } finally {
      setFavoriteBusy(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Shell onClick={(event) => event.stopPropagation()}>
        <Header>
          <CloseButton type="button" aria-label="关闭学校详情" onClick={onClose}>
            <X />
          </CloseButton>
          <Kicker>
            <School />
            SCHOOL DOSSIER
          </Kicker>
          <Title>{school.name}</Title>
          <Lead>{recText}</Lead>
          <MetaRow>
            <span><MapPin />{basic?.cityName ?? school.city}</span>
            <span><Star />{tierLabel}</span>
            {school.founded && <span><Clock />{school.founded} 年建校</span>}
            {basic?.website && (
              <a href={basic.website} target="_blank" rel="noreferrer">
                官网
                <ExternalLink />
              </a>
            )}
          </MetaRow>
        </Header>

        <Body>
          <MainStack>
            <Section>
              <SectionHead>
                <div>
                  <h2>基础档案</h2>
                  <p>先把学校放进可比较的坐标系，层次、城市、热度和互动数据放在同一屏。</p>
                </div>
                <Building2 />
              </SectionHead>
              <MetricGrid>
                <Metric>
                  <span><MapPin />城市</span>
                  <strong>{basic?.cityName ?? school.city}</strong>
                </Metric>
                <Metric>
                  <span><Star />层次</span>
                  <strong>{tierLabel}</strong>
                </Metric>
                <Metric>
                  <span><Sparkles />热度</span>
                  <strong>{basic?.hotScore ?? "待同步"}</strong>
                </Metric>
                <Metric>
                  <span><Heart />收藏</span>
                  <strong>{favoriteCount}</strong>
                </Metric>
              </MetricGrid>
              {(loading || error) && (
                <Notice $error={Boolean(error)} style={{ marginTop: 14 }}>
                  {error ? <AlertCircle /> : <Search />}
                  <div>{error || "正在同步后端学校详情。"}</div>
                </Notice>
              )}
            </Section>

            <Section>
              <SectionHead>
                <div>
                  <h2>生活调查样本</h2>
                  <p>来自 CSV 导入的真实问卷摘要，适合快速判断宿舍、外卖、门禁、交通和校园基础设施。</p>
                </div>
                <Database />
              </SectionHead>
              {surveyItems.length > 0 ? (
                <>
                  <SurveyOverview>
                    <SurveyStat>
                      <span>答卷样本</span>
                      <strong>{surveyResponseLabel(lifeSurvey)}</strong>
                    </SurveyStat>
                    <SurveyStat>
                      <span>覆盖维度</span>
                      <strong>{surveyItems.length}/23</strong>
                    </SurveyStat>
                    <SurveyStat>
                      <span>资料完整度</span>
                      <strong>{surveyCoverage}%</strong>
                    </SurveyStat>
                  </SurveyOverview>

                  <SurveyGroupRail>
                    {Object.entries(groupedSurvey)
                      .filter(([, items]) => items.length > 0)
                      .map(([group, items]) => (
                        <SurveyGroupPill key={group}>{group} {items.length}</SurveyGroupPill>
                      ))}
                  </SurveyGroupRail>

                  <SurveyGrid>
                    {surveyHighlights.map((item) => (
                      <SurveyItem key={item.key}>
                        <strong>
                          {item.label}
                          <em>{item.group}</em>
                        </strong>
                        <p>{clipSurveySummary(item.summary, 92)}</p>
                      </SurveyItem>
                    ))}
                  </SurveyGrid>

                  {lifeSurvey?.sourceUrl && (
                    <ActionStack>
                      <ActionButton type="button" onClick={() => window.open(lifeSurvey.sourceUrl, "_blank", "noopener,noreferrer")}>
                        查看调查来源
                        <ExternalLink />
                      </ActionButton>
                    </ActionStack>
                  )}
                </>
              ) : (
                <Notice>
                  <AlertCircle />
                  <div>这所学校还没有匹配到生活调查摘要。导入 CSV 并完成学校名匹配后，宿舍、空调、独卫、门禁等维度会显示在这里。</div>
                </Notice>
              )}
            </Section>

            <Section>
              <SectionHead>
                <div>
                  <h2>校园生活</h2>
                  <p>这里优先展示后端 lifeInfo。没有数据时，用城市生活画像兜底，并引导用户补全。</p>
                </div>
                <Home />
              </SectionHead>
              <LifeGrid>
                <LifeCard>
                  <strong>
                    <Home />
                    宿舍
                    <ScorePill>{formatScore(lifeInfo?.dormScore)}</ScorePill>
                  </strong>
                  <p>{lifeInfo?.dormDesc || fallbackLifeText(school.city, "dorm")}</p>
                </LifeCard>
                <LifeCard>
                  <strong>
                    <Utensils />
                    食堂
                    <ScorePill>{formatScore(lifeInfo?.canteenScore)}</ScorePill>
                  </strong>
                  <p>{lifeInfo?.canteenDesc || fallbackLifeText(school.city, "food")}</p>
                </LifeCard>
                <LifeCard>
                  <strong>
                    <BookOpen />
                    学习氛围
                    <ScorePill>{formatScore(lifeInfo?.studyScore)}</ScorePill>
                  </strong>
                  <p>{lifeInfo?.studyDesc || `${tierDesc}，建议结合校园经验和问答继续判断专业强度。`}</p>
                </LifeCard>
                <LifeCard>
                  <strong>
                    <Train />
                    交通周边
                    <ScorePill>{formatScore(lifeInfo?.transportScore)}</ScorePill>
                  </strong>
                  <p>{lifeInfo?.transportDesc || fallbackLifeText(school.city, "transit")}</p>
                </LifeCard>
              </LifeGrid>
              {!lifeInfo && (
                <Notice style={{ marginTop: 14 }}>
                  <AlertCircle />
                  <div>这所学校的生活评分还没有进入后端档案。你可以提交宿舍、食堂、学习氛围和周边信息，审核后会补进这里。</div>
                </Notice>
              )}
            </Section>

            <Section>
              <SectionHead>
                <div>
                  <h2>相关经验</h2>
                  <p>把学校详情和真实体验接起来，用户不用回到列表重新筛选。</p>
                </div>
                <BookOpen />
              </SectionHead>
              {experiences.length > 0 ? (
                <List>
                  {experiences.map((item) => (
                    <ListButton key={item.id} type="button" onClick={() => go(`/experiences/${encodeURIComponent(item.id)}`)}>
                      <strong>{item.title}</strong>
                      <span>{item.category} · {item.likes ?? 0} 赞 · {item.comments ?? 0} 评论</span>
                    </ListButton>
                  ))}
                </List>
              ) : (
                <EmptyText>这所学校还缺少专属经验。可以先从经验库查看同城内容，或者提交一条真实体验。</EmptyText>
              )}
            </Section>
          </MainStack>

          <SideStack>
            <Section>
              <SectionHead>
                <div>
                  <h2>行动</h2>
                  <p>收藏、提问、补全档案，形成用户闭环。</p>
                </div>
                <Route />
              </SectionHead>
              <ActionStack>
                <ActionButton $primary type="button" onClick={handleFavorite} disabled={favoriteBusy}>
                  {isFavorited ? "取消收藏" : "收藏到个人页"}
                  <Heart />
                </ActionButton>
                <ActionButton type="button" onClick={() => go(`/experiences?school=${schoolParam}`)}>
                  查看相关经验
                  <BookOpen />
                </ActionButton>
                <ActionButton type="button" onClick={() => go(`/qa?school=${schoolParam}`)}>
                  查看相关问答
                  <HelpCircle />
                </ActionButton>
                <ActionButton type="button" onClick={() => go(authenticated ? contributionPath : loginPath)}>
                  补充学校数据
                  <Sparkles />
                </ActionButton>
                <ActionButton type="button" onClick={() => go(authenticated ? questionPath : `/login?next=${encodeURIComponent(questionPath)}`)}>
                  我要提问
                  <MessageCircle />
                </ActionButton>
              </ActionStack>
              {favoriteMessage && (
                <InlineMessage $error={favoriteError}>
                  {favoriteError ? <AlertCircle /> : <CheckCircle2 />}
                  {favoriteMessage}
                </InlineMessage>
              )}
            </Section>

            <Section>
              <SectionHead>
                <div>
                  <h2>问答线索</h2>
                  <p>围绕这所学校的决策问题。</p>
                </div>
                <HelpCircle />
              </SectionHead>
              {questions.length > 0 ? (
                <List>
                  {questions.map((item) => (
                    <ListButton key={item.id} type="button" onClick={() => go(`/qa/${encodeURIComponent(item.id)}`)}>
                      <strong>{item.question}</strong>
                      <span>{item.category} · {item.likes ?? 0} 收藏</span>
                    </ListButton>
                  ))}
                </List>
              ) : (
                <EmptyText>还没有绑定到这所学校的问题。可以先发起一个具体问题。</EmptyText>
              )}
            </Section>

            <Section>
              <SectionHead>
                <div>
                  <h2>最近讨论</h2>
                  <p>{detail?.commentCount ?? 0} 条学校评论。</p>
                </div>
                <MessageCircle />
              </SectionHead>
              {comments.length > 0 ? (
                <div>
                  {comments.map((comment) => (
                    <CommentRow key={comment.id}>
                      <strong>{comment.username || "匿名用户"}</strong>
                      <p>{clip(comment.content, 96)}</p>
                      <span>{formatDate(comment.createdAt)} · {comment.likeCount ?? 0} 赞</span>
                    </CommentRow>
                  ))}
                </div>
              ) : (
                <EmptyText>还没有公开评论。后续用户在经验详情页和学校讨论区补充内容后，这里会自然变厚。</EmptyText>
              )}
            </Section>

            <ActionButton type="button" onClick={onClose}>
              返回地图
              <ArrowLeft />
            </ActionButton>
          </SideStack>
        </Body>
      </Shell>
    </Overlay>
  );
}
