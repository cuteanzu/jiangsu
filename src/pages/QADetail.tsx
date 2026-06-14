import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  HelpCircle,
  MapPin,
  MessageCircle,
  School,
  Sparkles,
} from "lucide-react";
import CampusAtmosphere from "../components/CampusAtmosphere";
import { CATEGORY_META, EXPERIENCES, QA_ENTRIES, type QAEntry, type PostCategory } from "../data/mock-content";
import { UNIVERSITIES } from "../data/jiangsu-universities";
import { contentApi, schoolsApi } from "../services/api";
import type { QADTO, SchoolDTO } from "../services/types";
import { useAuth } from "../hooks/useAuth";
import { useTransition } from "../context/useTransition";
import { heatOfExperience } from "../utils/experienceContent";

const lift = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  position: relative;
  isolation: isolate;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 30px 28px 72px;
  background: oklch(96% 0.014 197);
  color: oklch(23% 0.035 58);
  font-family: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;

  @media (max-width: 720px) {
    padding: 20px 14px 46px;
  }
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1160px, 100%);
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
`;

const TextButton = styled.button`
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid oklch(80% 0.032 190 / 0.56);
  border-radius: 8px;
  background: oklch(99% 0.006 100 / 0.72);
  color: oklch(38% 0.055 200);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 850;
  transition: transform 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(62% 0.08 205 / 0.68);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

const Layout = styled.main`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const TriageSheet = styled.article`
  border: 1px solid oklch(80% 0.035 190 / 0.5);
  border-radius: 8px;
  background: oklch(99% 0.006 100 / 0.78);
  box-shadow: 0 18px 46px oklch(38% 0.04 195 / 0.12);
  overflow: hidden;
  animation: ${lift} 0.38s ease-out both;
`;

const SheetHead = styled.header`
  padding: 30px 34px 24px;
  border-bottom: 1px solid oklch(83% 0.028 190 / 0.45);

  @media (max-width: 720px) {
    padding: 24px 20px 20px;
  }
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: oklch(42% 0.09 205);
  font-size: 12px;
  font-weight: 950;

  svg {
    width: 15px;
    height: 15px;
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
  font-size: 11px;
  font-weight: 900;
`;

const QuestionTitle = styled.h1`
  max-width: 18ch;
  margin: 14px 0 16px;
  color: oklch(18% 0.035 58);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.13;
  font-weight: 950;
  letter-spacing: 0;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  color: oklch(50% 0.032 70);
  font-size: 12px;
  font-weight: 800;

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

const AnswerBlock = styled.section`
  padding: 26px 34px 32px;

  @media (max-width: 720px) {
    padding: 22px 20px 26px;
  }
`;

const VerdictBox = styled.div`
  padding: 16px 18px;
  border: 1px solid oklch(75% 0.042 195 / 0.54);
  border-radius: 8px;
  background: oklch(97% 0.015 195 / 0.58);
  color: oklch(28% 0.055 200);
  display: grid;
  gap: 8px;

  strong {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 950;
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.85;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SectionTitle = styled.h2`
  margin: 24px 0 12px;
  color: oklch(21% 0.035 58);
  font-size: 20px;
  line-height: 1.3;
`;

const BodyText = styled.div`
  max-width: 70ch;
  color: oklch(31% 0.035 58);
  font-size: 15px;
  line-height: 2;
  white-space: pre-wrap;
`;

const ActionStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  min-height: 40px;
  padding: 0 13px;
  border: 1px solid ${({ $primary }) => ($primary ? "oklch(56% 0.09 205 / 0.62)" : "oklch(80% 0.032 190 / 0.56)")};
  border-radius: 8px;
  background: ${({ $primary }) => ($primary ? "oklch(95% 0.025 195 / 0.86)" : "oklch(99% 0.006 100 / 0.68)")};
  color: ${({ $primary }) => ($primary ? "oklch(34% 0.08 205)" : "oklch(38% 0.042 70)")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  font-size: 13px;
  font-weight: 900;
  transition: transform 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(62% 0.08 205 / 0.68);
  }

  svg {
    width: 15px;
    height: 15px;
  }
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

const Panel = styled.section`
  padding: 16px;
  border: 1px solid oklch(82% 0.026 105 / 0.62);
  border-radius: 8px;
  background: oklch(98.5% 0.008 98 / 0.72);
`;

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  color: oklch(22% 0.035 58);
  font-size: 14px;
  font-weight: 950;

  svg {
    width: 16px;
    height: 16px;
    color: oklch(42% 0.09 205);
  }
`;

const SchoolName = styled.h2`
  margin: 0;
  color: oklch(21% 0.035 58);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 22px;
  line-height: 1.25;
`;

const Muted = styled.p`
  margin: 8px 0 0;
  color: oklch(46% 0.032 70);
  font-size: 12.5px;
  line-height: 1.7;
`;

const List = styled.div`
  display: grid;
  gap: 8px;
`;

const ListButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 7px 0;
  text-align: left;
  font: inherit;

  strong {
    display: block;
    color: oklch(30% 0.035 58);
    font-size: 12.5px;
    line-height: 1.45;
  }

  span {
    display: block;
    margin-top: 3px;
    color: oklch(52% 0.03 70);
    font-size: 11px;
  }

  &:hover strong {
    color: oklch(36% 0.08 205);
  }
`;

const Empty = styled.div`
  padding: 42px 0;
  color: oklch(52% 0.03 70);
  text-align: center;
  font-size: 14px;
`;

function toQAEntry(item: QADTO, index = 0): QAEntry {
  return {
    id: item.id || `remote-qa-${index}`,
    question: item.question || "未命名问题",
    answer: item.answer || "这条问答暂时只有问题，后续可以继续补充回答。",
    schoolId: item.schoolId || undefined,
    schoolName: item.schoolName || undefined,
    category: item.category || "freshman",
    likes: item.likes ?? 0,
  };
}

function findLocalQuestion(id: string | undefined) {
  if (!id) return null;
  return QA_ENTRIES.find((item) => item.id === id) ?? null;
}

function getCategoryMeta(category: string | "all") {
  if (category === "all") return { label: "推荐", color: "#347895" };
  return CATEGORY_META[category as PostCategory] ?? { label: "问答", color: "#347895" };
}

function firstSentence(answer: string) {
  const sentence = answer.split(/[。！？?]/)[0]?.trim();
  return sentence ? `${sentence}。` : answer;
}

function getQACity(schoolName?: string) {
  if (!schoolName) return null;
  return UNIVERSITIES.find((university) => university.name === schoolName)?.city ?? null;
}

function exactSchoolMatch(list: SchoolDTO[], name: string) {
  return list.find((item) => item.name === name) ?? list[0] ?? null;
}

export default function QADetail() {
  const { qaId = "" } = useParams();
  const { authenticated } = useAuth();
  const { navigateWithTransition } = useTransition();
  const [question, setQuestion] = useState<QAEntry | null>(null);
  const [allQuestions, setAllQuestions] = useState<QAEntry[]>(QA_ENTRIES);
  const [schoolRecord, setSchoolRecord] = useState<SchoolDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const localQuestion = findLocalQuestion(qaId);
    setLoading(true);
    setError("");

    contentApi.question(qaId)
      .then((item) => {
        if (active) setQuestion(toQAEntry(item));
      })
      .catch(() => {
        if (!active) return;
        if (localQuestion) {
          setQuestion(localQuestion);
          return;
        }
        setQuestion(null);
        setError("没有找到这个问题");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    contentApi.qa()
      .then((data) => {
        if (!active) return;
        const normalized = Array.isArray(data) ? data.map(toQAEntry) : [];
        setAllQuestions(normalized.length > 0 ? normalized : QA_ENTRIES);
      })
      .catch(() => {
        if (active) setAllQuestions(QA_ENTRIES);
      });

    return () => {
      active = false;
    };
  }, [qaId]);

  useEffect(() => {
    if (!question?.schoolName) {
      setSchoolRecord(null);
      return;
    }

    let active = true;
    schoolsApi.search({ keyword: question.schoolName, size: 8 })
      .then((items) => {
        if (active) setSchoolRecord(exactSchoolMatch(Array.isArray(items) ? items : [], question.schoolName ?? ""));
      })
      .catch(() => {
        if (active) setSchoolRecord(null);
      });

    return () => {
      active = false;
    };
  }, [question?.schoolName]);

  const categoryMeta = question ? getCategoryMeta(question.category) : getCategoryMeta("all");
  const city = getQACity(question?.schoolName);
  const relatedQuestions = useMemo(() => {
    if (!question) return [];
    return allQuestions
      .filter((item) => item.id !== question.id && (item.category === question.category || item.schoolName === question.schoolName))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  }, [allQuestions, question]);

  const relatedExperiences = useMemo(() => {
    if (!question) return [];
    return EXPERIENCES
      .filter((item) => item.schoolName === question.schoolName || item.category === question.category)
      .sort((a, b) => heatOfExperience(b) - heatOfExperience(a))
      .slice(0, 4);
  }, [question]);

  const schoolParam = question?.schoolName ? encodeURIComponent(question.schoolName) : "";
  const titleParam = question ? encodeURIComponent(question.question) : "";
  const askPath = `/me?tab=submissions&type=QUESTION${schoolParam ? `&school=${schoolParam}` : ""}${titleParam ? `&title=${titleParam}` : ""}`;
  const loginNext = `/login?next=${encodeURIComponent(askPath)}`;
  const mapPath = question?.schoolName && city
    ? `/jiangsu?city=${encodeURIComponent(city)}&school=${schoolParam}`
    : "/jiangsu";

  const go = (path: string) => navigateWithTransition(path);
  const goAsk = () => go(authenticated ? askPath : loginNext);

  if (loading) {
    return (
      <Page>
        <CampusAtmosphere variant="qa" />
        <Shell>
          <Empty>正在打开这个问题...</Empty>
        </Shell>
      </Page>
    );
  }

  if (!question || error) {
    return (
      <Page>
        <CampusAtmosphere variant="qa" />
        <Shell>
          <TopBar>
            <TextButton type="button" onClick={() => go("/qa")}>
              <ArrowLeft />
              返回问答
            </TextButton>
          </TopBar>
          <Empty>{error || "没有找到这个问题"}</Empty>
        </Shell>
      </Page>
    );
  }

  return (
    <Page>
      <CampusAtmosphere variant="qa" />
      <Shell>
        <TopBar>
          <TextButton type="button" onClick={() => go(question.schoolName ? `/qa?school=${schoolParam}` : "/qa")}>
            <ArrowLeft />
            返回问答库
          </TextButton>
          <TextButton type="button" onClick={goAsk}>
            <Sparkles />
            继续追问
          </TextButton>
        </TopBar>

        <Layout>
          <TriageSheet>
            <SheetHead>
              <Kicker>
                <MessageCircle />
                QUESTION CASE FILE
              </Kicker>
              <Tag $color={categoryMeta.color}>{categoryMeta.label}</Tag>
              <QuestionTitle>{question.question}</QuestionTitle>
              <MetaRow>
                {question.schoolName && <span><School />{question.schoolName}</span>}
                {city && <span><MapPin />{city}</span>}
                <span><Heart />{question.likes}</span>
              </MetaRow>
            </SheetHead>

            <AnswerBlock>
              <VerdictBox>
                <strong>
                  <CheckCircle2 />
                  先看结论
                </strong>
                <p>{firstSentence(question.answer)}</p>
              </VerdictBox>

              <SectionTitle>完整解释</SectionTitle>
              <BodyText>{question.answer}</BodyText>

              <ActionStrip>
                <ActionButton $primary type="button" onClick={goAsk}>
                  我想继续追问
                  <HelpCircle />
                </ActionButton>
                {question.schoolName && (
                  <ActionButton type="button" onClick={() => go(`/experiences?school=${schoolParam}`)}>
                    看相关经验
                    <BookOpen />
                  </ActionButton>
                )}
              </ActionStrip>
            </AnswerBlock>
          </TriageSheet>

          <SideStack>
            <Panel>
              <PanelTitle>
                学校上下文
                <GraduationCap />
              </PanelTitle>
              <SchoolName>{question.schoolName || "江苏高校"}</SchoolName>
              <Muted>{schoolRecord?.brief || "这个问题暂时没有绑定到完整学校档案，但仍然可以继续补充线索。"}</Muted>
              <ActionStrip>
                <ActionButton $primary type="button" onClick={() => go(mapPath)}>
                  地图里查看
                  <MapPin />
                </ActionButton>
              </ActionStrip>
            </Panel>

            <Panel>
              <PanelTitle>
                相关追问
                <MessageCircle />
              </PanelTitle>
              {relatedQuestions.length > 0 ? (
                <List>
                  {relatedQuestions.map((item) => (
                    <ListButton key={item.id} type="button" onClick={() => go(`/qa/${encodeURIComponent(item.id)}`)}>
                      <strong>{item.question}</strong>
                      <span>{item.likes} 收藏</span>
                    </ListButton>
                  ))}
                </List>
              ) : (
                <Muted>暂时没有相近问题，可以从问答库继续检索。</Muted>
              )}
            </Panel>

            <Panel>
              <PanelTitle>
                相关经验
                <BookOpen />
              </PanelTitle>
              {relatedExperiences.length > 0 ? (
                <List>
                  {relatedExperiences.map((item) => (
                    <ListButton key={item.id} type="button" onClick={() => go(`/experiences/${encodeURIComponent(item.id)}`)}>
                      <strong>{item.title}</strong>
                      <span>{item.schoolName} · {heatOfExperience(item)} 热度</span>
                    </ListButton>
                  ))}
                </List>
              ) : (
                <Muted>这类问题还缺少经验补充，可以投稿帮助后来的人。</Muted>
              )}
            </Panel>

            <Panel>
              <PanelTitle>
                补充答案
                <Sparkles />
              </PanelTitle>
              <Muted>如果你有更准确的政策、亲身经历或补充角度，可以提交为问答线索，审核后进入公共内容。</Muted>
              <ActionStrip>
                <ActionButton $primary type="button" onClick={goAsk}>
                  补充回答
                  <ArrowRight />
                </ActionButton>
              </ActionStrip>
            </Panel>
          </SideStack>
        </Layout>
      </Shell>
    </Page>
  );
}
