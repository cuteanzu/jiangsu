import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Heart,
  HelpCircle,
  MapPin,
  MessageCircle,
  School,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import CampusAtmosphere from "../components/CampusAtmosphere";
import { EXPERIENCES, type ExperiencePost } from "../data/mock-content";
import { ApiError, commentsApi, contentApi, schoolsApi } from "../services/api";
import type { CommentDTO, SchoolDTO } from "../services/types";
import { useAuth } from "../hooks/useAuth";
import { useTransition } from "../context/useTransition";
import {
  findLocalExperience,
  getExperienceCategoryMeta,
  getExperienceCategoryVerdict,
  heatOfExperience,
  toExperiencePost,
} from "../utils/experienceContent";

const reveal = keyframes`
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
  background: oklch(96.5% 0.018 82);
  color: oklch(24% 0.035 55);
  font-family: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;

  @media (max-width: 720px) {
    padding: 20px 14px 46px;
  }
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
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
  border: 1px solid oklch(82% 0.028 72 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.72);
  color: oklch(41% 0.05 56);
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
    border-color: oklch(70% 0.07 48 / 0.6);
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

const Article = styled.article`
  border: 1px solid oklch(82% 0.028 72 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.76);
  box-shadow: 0 18px 46px oklch(44% 0.04 52 / 0.1);
  animation: ${reveal} 0.38s ease-out both;
  overflow: hidden;
`;

const ArticleHead = styled.header`
  padding: 30px 34px 24px;
  border-bottom: 1px solid oklch(84% 0.026 72 / 0.58);

  @media (max-width: 720px) {
    padding: 24px 20px 20px;
  }
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: oklch(47% 0.11 43);
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

const Title = styled.h1`
  max-width: 16ch;
  margin: 14px 0 16px;
  color: oklch(20% 0.032 52);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 1.12;
  font-weight: 950;
  letter-spacing: 0;
`;

const Summary = styled.p`
  max-width: 66ch;
  margin: 0;
  color: oklch(43% 0.032 62);
  font-size: 15px;
  line-height: 1.9;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
  color: oklch(51% 0.03 62);
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

const ArticleBody = styled.div`
  padding: 28px 34px 34px;

  @media (max-width: 720px) {
    padding: 22px 20px 26px;
  }

  p {
    max-width: 68ch;
    margin: 0 0 18px;
    color: oklch(30% 0.032 56);
    font-size: 15px;
    line-height: 2;
    white-space: pre-wrap;
  }
`;

const VerdictRail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
`;

const VerdictPill = styled.span`
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: oklch(95% 0.018 205 / 0.82);
  color: oklch(39% 0.065 205);
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 850;
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
  border: 1px solid oklch(84% 0.026 72 / 0.66);
  border-radius: 8px;
  background: oklch(98.6% 0.01 82 / 0.74);
`;

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  color: oklch(24% 0.035 54);
  font-size: 14px;
  font-weight: 950;

  svg {
    width: 16px;
    height: 16px;
    color: oklch(48% 0.11 43);
  }
`;

const SchoolName = styled.h2`
  margin: 0;
  color: oklch(23% 0.035 54);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 22px;
  line-height: 1.25;
`;

const Muted = styled.p`
  margin: 8px 0 0;
  color: oklch(48% 0.032 62);
  font-size: 12.5px;
  line-height: 1.7;
`;

const ActionStack = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 14px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid ${({ $primary }) => ($primary ? "oklch(64% 0.11 43 / 0.55)" : "oklch(82% 0.028 72 / 0.72)")};
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
  font-weight: 850;
  transition: transform 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: oklch(70% 0.07 48 / 0.62);
  }

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }
`;

const Discussion = styled.section`
  margin-top: 24px;
  border: 1px solid oklch(82% 0.028 72 / 0.72);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.76);
  overflow: hidden;
`;

const DiscussionHead = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid oklch(84% 0.026 72 / 0.58);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;

  h2 {
    margin: 0;
    color: oklch(23% 0.035 54);
    font-size: 18px;
    line-height: 1.3;
  }

  p {
    margin: 4px 0 0;
    color: oklch(50% 0.03 62);
    font-size: 12px;
    line-height: 1.5;
  }
`;

const CommentForm = styled.form`
  padding: 16px 20px 18px;
  border-bottom: 1px solid oklch(84% 0.026 72 / 0.58);
  display: grid;
  gap: 10px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 96px;
  resize: vertical;
  box-sizing: border-box;
  border: 1px solid oklch(82% 0.03 72 / 0.78);
  border-radius: 8px;
  background: oklch(99% 0.008 82 / 0.78);
  color: oklch(25% 0.035 55);
  padding: 12px;
  font: inherit;
  font-size: 14px;
  line-height: 1.7;
  outline: none;

  &:focus {
    border-color: oklch(62% 0.12 43 / 0.72);
    box-shadow: 0 0 0 3px oklch(75% 0.08 48 / 0.18);
  }
`;

const FormFoot = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const CheckLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: oklch(46% 0.035 62);
  font-size: 12px;
  font-weight: 800;
`;

const SubmitButton = styled.button`
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid oklch(64% 0.11 43 / 0.55);
  border-radius: 8px;
  background: oklch(94.5% 0.035 45 / 0.84);
  color: oklch(42% 0.1 42);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 900;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Message = styled.div<{ $error?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: ${({ $error }) => ($error ? "oklch(42% 0.12 32)" : "oklch(38% 0.09 145)")};
  font-size: 12px;
  line-height: 1.5;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CommentList = styled.div`
  display: grid;
`;

const CommentRow = styled.article`
  padding: 16px 20px;
  border-bottom: 1px solid oklch(88% 0.02 72 / 0.58);

  &:last-child {
    border-bottom: 0;
  }
`;

const CommentMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: oklch(52% 0.03 62);
  font-size: 12px;
  font-weight: 800;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CommentText = styled.p`
  margin: 8px 0 0;
  color: oklch(30% 0.032 56);
  font-size: 14px;
  line-height: 1.85;
  white-space: pre-wrap;
`;

const Empty = styled.div`
  padding: 38px 20px;
  color: oklch(52% 0.03 62);
  text-align: center;
  font-size: 13px;
  line-height: 1.7;
`;

const RelatedList = styled.div`
  display: grid;
  gap: 8px;
`;

const RelatedButton = styled.button`
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
    color: oklch(31% 0.035 56);
    font-size: 12.5px;
    line-height: 1.45;
  }

  span {
    display: block;
    margin-top: 3px;
    color: oklch(54% 0.028 62);
    font-size: 11px;
  }

  &:hover strong {
    color: oklch(47% 0.11 43);
  }
`;

function normalizeError(err: unknown) {
  if (err instanceof ApiError) {
    const payload = err.payload;
    if (payload && typeof payload === "object" && "message" in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    return err.message || "请求失败";
  }
  if (err instanceof Error) return err.message;
  return "请求失败，请稍后再试";
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

function splitBody(body: string) {
  return body
    .split(/\n{2,}|\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function exactSchoolMatch(list: SchoolDTO[], name: string) {
  return list.find((item) => item.name === name) ?? list[0] ?? null;
}

export default function ExperienceDetail() {
  const { experienceId = "" } = useParams();
  const location = useLocation();
  const { authenticated } = useAuth();
  const { navigateWithTransition } = useTransition();
  const [post, setPost] = useState<ExperiencePost | null>(null);
  const [allPosts, setAllPosts] = useState<ExperiencePost[]>(EXPERIENCES);
  const [schoolRecord, setSchoolRecord] = useState<SchoolDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    const localPost = findLocalExperience(experienceId);
    setLoading(true);
    setError("");

    contentApi.experience(experienceId)
      .then((item) => {
        if (!active) return;
        setPost(toExperiencePost(item));
      })
      .catch(() => {
        if (!active) return;
        if (localPost) {
          setPost(localPost);
          return;
        }
        setPost(null);
        setError("没有找到这条校园经验");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    contentApi.experiences()
      .then((data) => {
        if (!active) return;
        const normalized = Array.isArray(data) ? data.map(toExperiencePost) : [];
        setAllPosts(normalized.length > 0 ? normalized : EXPERIENCES);
      })
      .catch(() => {
        if (active) setAllPosts(EXPERIENCES);
      });

    return () => {
      active = false;
    };
  }, [experienceId]);

  useEffect(() => {
    if (!post?.schoolName) {
      setSchoolRecord(null);
      return;
    }

    let active = true;
    schoolsApi.search({ keyword: post.schoolName, size: 8 })
      .then((items) => {
        if (!active) return;
        setSchoolRecord(exactSchoolMatch(Array.isArray(items) ? items : [], post.schoolName));
      })
      .catch(() => {
        if (active) setSchoolRecord(null);
      });

    return () => {
      active = false;
    };
  }, [post?.schoolName]);

  useEffect(() => {
    if (!schoolRecord?.id) {
      setComments([]);
      return;
    }

    let active = true;
    setCommentsLoading(true);
    commentsApi.bySchool(schoolRecord.id, 0, 20)
      .then((items) => {
        if (active) setComments(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (active) setComments([]);
      })
      .finally(() => {
        if (active) setCommentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [schoolRecord?.id]);

  const categoryMeta = post ? getExperienceCategoryMeta(post.category) : getExperienceCategoryMeta("all");
  const paragraphs = useMemo(() => splitBody(post?.body ?? ""), [post?.body]);
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter((item) => item.id !== post.id && (item.schoolName === post.schoolName || item.category === post.category))
      .sort((a, b) => heatOfExperience(b) - heatOfExperience(a))
      .slice(0, 4);
  }, [allPosts, post]);

  const schoolParam = post ? encodeURIComponent(post.schoolName) : "";
  const cityParam = post ? encodeURIComponent(post.city) : "";
  const contributionPath = post ? `/me?tab=submissions&type=EXPERIENCE&school=${schoolParam}` : "/me?tab=submissions&type=EXPERIENCE";
  const questionPath = post ? `/qa?school=${schoolParam}` : "/qa";
  const mapPath = post ? `/jiangsu?city=${cityParam}&school=${schoolParam}` : "/jiangsu";
  const loginPath = `/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`;

  const go = (path: string) => navigateWithTransition(path);
  const goToContribution = () => go(authenticated ? contributionPath : `/login?next=${encodeURIComponent(contributionPath)}`);

  const handleSubmitComment = async (event: FormEvent) => {
    event.preventDefault();
    const content = commentText.trim();
    if (!authenticated) {
      go(loginPath);
      return;
    }
    if (!schoolRecord?.id) {
      setSubmitError("这条经验还没有匹配到学校档案，暂时不能评论。");
      setSubmitMessage("");
      return;
    }
    if (content.length < 4) {
      setSubmitError("评论至少写 4 个字。");
      setSubmitMessage("");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");
    setSubmitMessage("");
    try {
      const created = await commentsApi.createForSchool(schoolRecord.id, {
        content,
        category: "EXPERIENCE",
        isAnonymous: anonymous,
      });
      setComments((items) => [created, ...items]);
      setCommentText("");
      setAnonymous(false);
      setSubmitMessage("评论已发布到这所学校的讨论区。");
    } catch (err) {
      setSubmitError(normalizeError(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <CampusAtmosphere variant="notes" />
        <Shell>
          <Empty>正在打开这条校园经验...</Empty>
        </Shell>
      </Page>
    );
  }

  if (!post || error) {
    return (
      <Page>
        <CampusAtmosphere variant="notes" />
        <Shell>
          <TopBar>
            <TextButton type="button" onClick={() => go("/experiences")}>
              <ArrowLeft />
              返回校园经验
            </TextButton>
          </TopBar>
          <Empty>{error || "没有找到这条校园经验"}</Empty>
        </Shell>
      </Page>
    );
  }

  return (
    <Page>
      <CampusAtmosphere variant="notes" />
      <Shell>
        <TopBar>
          <TextButton type="button" onClick={() => go(`/experiences?school=${schoolParam}`)}>
            <ArrowLeft />
            返回经验库
          </TextButton>
          <TextButton type="button" onClick={goToContribution}>
            <Sparkles />
            补充一条
          </TextButton>
        </TopBar>

        <Layout>
          <div>
            <Article>
              <ArticleHead>
                <Kicker>
                  <BookOpen />
                  CAMPUS READING ROOM
                </Kicker>
                <Tag $color={categoryMeta.color}>{categoryMeta.label}</Tag>
                <Title>{post.title}</Title>
                <Summary>{post.excerpt}</Summary>
                <MetaRow>
                  <span><School />{post.schoolName}</span>
                  <span><MapPin />{post.city}</span>
                  <span><Heart />{post.likes}</span>
                  <span><MessageCircle />{post.comments}</span>
                </MetaRow>
              </ArticleHead>

              <ArticleBody>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <VerdictRail>
                  <VerdictPill>{getExperienceCategoryVerdict(post.category)}</VerdictPill>
                  {post.tags.slice(0, 6).map((tag) => (
                    <VerdictPill key={tag}>{tag}</VerdictPill>
                  ))}
                </VerdictRail>
              </ArticleBody>
            </Article>

            <Discussion>
              <DiscussionHead>
                <div>
                  <h2>这所学校的讨论</h2>
                  <p>围绕这所学校的补充、纠错和真实体验会集中在这里。</p>
                </div>
                <MessageCircle />
              </DiscussionHead>

              <CommentForm onSubmit={handleSubmitComment}>
                <TextArea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder={`聊聊你对 ${post.schoolName} 的真实体验，或者补充这条经验里没说到的细节。`}
                />
                <FormFoot>
                  <CheckLabel>
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(event) => setAnonymous(event.target.checked)}
                    />
                    匿名发表
                  </CheckLabel>
                  <SubmitButton type="submit" disabled={submitLoading}>
                    <Send />
                    {submitLoading ? "发送中" : "发表评论"}
                  </SubmitButton>
                </FormFoot>
                {submitMessage && (
                  <Message>
                    <CheckCircle2 />
                    {submitMessage}
                  </Message>
                )}
                {submitError && (
                  <Message $error>
                    <AlertCircle />
                    {submitError}
                  </Message>
                )}
              </CommentForm>

              {commentsLoading ? (
                <Empty>正在读取讨论...</Empty>
              ) : comments.length > 0 ? (
                <CommentList>
                  {comments.map((comment) => (
                    <CommentRow key={comment.id}>
                      <CommentMeta>
                        <UserRound />
                        <span>{comment.username || "匿名用户"}</span>
                        <span>{formatDate(comment.createdAt)}</span>
                        <span>{comment.likeCount ?? 0} 赞</span>
                      </CommentMeta>
                      <CommentText>{comment.content}</CommentText>
                    </CommentRow>
                  ))}
                </CommentList>
              ) : (
                <Empty>还没有讨论。你可以成为第一个补充真实体验的人。</Empty>
              )}
            </Discussion>
          </div>

          <SideStack>
            <Panel>
              <PanelTitle>
                学校上下文
                <School />
              </PanelTitle>
              <SchoolName>{post.schoolName}</SchoolName>
              <Muted>{schoolRecord?.brief || `${post.city} 的校园经验、问答和学校档案会在这里串起来。`}</Muted>
              <ActionStack>
                <ActionButton $primary type="button" onClick={() => go(mapPath)}>
                  在地图里看学校
                  <MapPin />
                </ActionButton>
                <ActionButton type="button" onClick={() => go(questionPath)}>
                  查看相关问答
                  <HelpCircle />
                </ActionButton>
                {schoolRecord?.website && (
                  <ActionButton type="button" onClick={() => window.open(schoolRecord.website || "", "_blank", "noopener,noreferrer")}>
                    打开学校官网
                    <ExternalLink />
                  </ActionButton>
                )}
              </ActionStack>
            </Panel>

            <Panel>
              <PanelTitle>
                继续阅读
                <ArrowRight />
              </PanelTitle>
              {relatedPosts.length > 0 ? (
                <RelatedList>
                  {relatedPosts.map((item) => (
                    <RelatedButton key={item.id} type="button" onClick={() => go(`/experiences/${encodeURIComponent(item.id)}`)}>
                      <strong>{item.title}</strong>
                      <span>{item.schoolName} · {heatOfExperience(item)} 热度</span>
                    </RelatedButton>
                  ))}
                </RelatedList>
              ) : (
                <Muted>暂时没有更多相近经验，可以从经验库继续筛选。</Muted>
              )}
            </Panel>

            <Panel>
              <PanelTitle>
                参与方式
                <Sparkles />
              </PanelTitle>
              <Muted>如果你有更具体的宿舍、食堂、专业或城市体验，可以作为新经验投稿，审核后会进入公共内容。</Muted>
              <ActionStack>
                <ActionButton $primary type="button" onClick={goToContribution}>
                  写一条校园经验
                  <ArrowRight />
                </ActionButton>
              </ActionStack>
            </Panel>
          </SideStack>
        </Layout>
      </Shell>
    </Page>
  );
}
