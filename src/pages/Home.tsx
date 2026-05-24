import { useMemo, useRef } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { ArrowRight, Heart, MapPin, MessageCircle, School, Sparkles } from "lucide-react";
import { EXPERIENCES, QA_ENTRIES, CATEGORY_META } from "../data/mock-content";
import { cityRouteParam } from "../utils/jiangsuPresentation";

const riseIn = keyframes`
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const floatVisual = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -8px, 0); }
`;

const Page = styled.div`
  min-height: 100%;
  height: 100%;
  overflow-y: auto;
  color: #352b24;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 30%),
    linear-gradient(146deg, #fff9f1 0%, #fbf2ee 37%, #eef6ff 73%, #fff7df 100%);
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;
`;

const PageInner = styled.div`
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 34px 0 54px;

  @media (max-width: 720px) {
    width: min(100% - 28px, 640px);
    padding: 22px 0 36px;
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(360px, 0.86fr) minmax(480px, 1.14fr);
  align-items: center;
  gap: 42px;
  min-height: min(620px, calc(100vh - var(--nav-height, 72px) - 44px));
  padding: 12px 0 30px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 28px;
    min-height: 0;
  }
`;

const HeroCopy = styled.div`
  animation: ${riseIn} 0.58s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(210, 159, 120, 0.28);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.7);
  color: #b96b5f;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
`;

const Title = styled.h1`
  max-width: 620px;
  margin: 24px 0 16px;
  color: #302721;
  font-size: 58px;
  line-height: 1.08;
  letter-spacing: 0;
  font-weight: 900;

  @media (max-width: 1120px) {
    font-size: 48px;
  }

  @media (max-width: 720px) {
    font-size: 36px;
    line-height: 1.16;
  }
`;

const Subtitle = styled.p`
  max-width: 560px;
  margin: 0;
  color: #6d5f55;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 18px;
  line-height: 1.85;
  letter-spacing: 0;

  @media (max-width: 720px) {
    font-size: 15px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
`;

const ButtonBase = styled.button`
  min-height: 46px;
  padding: 0 18px;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 15px;
  font-weight: 850;
  letter-spacing: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(ButtonBase)`
  border: 1px solid rgba(189, 102, 87, 0.18);
  background: linear-gradient(135deg, #c86d62 0%, #e0a06f 100%);
  color: #fffdf8;
  box-shadow: 0 16px 28px rgba(188, 102, 82, 0.18);

  &:hover {
    box-shadow: 0 20px 34px rgba(188, 102, 82, 0.24);
  }
`;

const SecondaryButton = styled(ButtonBase)`
  border: 1px solid rgba(155, 176, 195, 0.36);
  background: rgba(255, 253, 248, 0.72);
  color: #526e85;
  box-shadow: 0 12px 24px rgba(102, 132, 148, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.92);
    border-color: rgba(116, 158, 186, 0.45);
  }
`;

const CityArea = styled.div`
  margin-top: 28px;
`;

const CityLabel = styled.div`
  margin-bottom: 10px;
  color: #9c8b7a;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
`;

const CityTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CityTag = styled.button`
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(203, 168, 124, 0.34);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.62);
  color: #65594e;
  cursor: pointer;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition:
    transform 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    color: #bd6657;
    border-color: rgba(199, 107, 94, 0.34);
    background: rgba(255, 255, 255, 0.82);
  }
`;

const VisualStage = styled.div`
  animation: ${riseIn} 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both;
  perspective: 1100px;
`;

const VisualFrame = styled.div`
  position: relative;
  aspect-ratio: 1.48 / 1;
  min-height: 390px;
  border-radius: 22px;
  overflow: hidden;
  background: #eff7ff;
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow:
    0 28px 70px rgba(102, 126, 150, 0.18),
    0 12px 34px rgba(199, 107, 94, 0.12);
  transform:
    rotateX(var(--tilt-y, 0deg))
    rotateY(var(--tilt-x, 0deg))
    translate3d(var(--shift-x, 0px), var(--shift-y, 0px), 0);
  transform-style: preserve-3d;
  transition: transform 0.28s ease, box-shadow 0.28s ease;

  &:hover {
    box-shadow:
      0 34px 78px rgba(102, 126, 150, 0.22),
      0 16px 38px rgba(199, 107, 94, 0.14);
  }

  @media (max-width: 720px) {
    min-height: 260px;
    border-radius: 18px;
  }
`;

const VisualImage = styled.img`
  width: 108%;
  height: 108%;
  max-width: none;
  object-fit: cover;
  object-position: center;
  transform: translate3d(
    calc(var(--visual-x, 0px) - 4%),
    calc(var(--visual-y, 0px) - 4%),
    36px
  );
  transition: transform 0.3s ease;
  animation: ${floatVisual} 7s ease-in-out infinite;
`;

const VisualShade = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 252, 247, 0.28), rgba(255, 252, 247, 0) 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 247, 239, 0.22));
`;

const VisualBadge = styled.div`
  position: absolute;
  left: 20px;
  bottom: 20px;
  max-width: min(320px, calc(100% - 40px));
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.68);
  background: rgba(255, 253, 248, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 14px 32px rgba(98, 118, 140, 0.16);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;

  strong {
    display: block;
    color: #3a2f28;
    font-size: 15px;
    line-height: 1.35;
    letter-spacing: 0;
  }

  span {
    display: block;
    margin-top: 4px;
    color: #7b8da0;
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0;
  }

  @media (max-width: 520px) {
    left: 12px;
    bottom: 12px;
    max-width: calc(100% - 24px);
  }
`;

const FloatingNote = styled.div`
  position: absolute;
  right: 20px;
  top: 18px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #b77a5a;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;
  box-shadow: 0 10px 24px rgba(150, 112, 88, 0.1);
`;

const Sections = styled.section`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr 1fr;
  gap: 18px;
  padding-top: 8px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const SectionPanel = styled.div`
  border-radius: 8px;
  border: 1px solid rgba(210, 185, 155, 0.24);
  background: rgba(255, 253, 248, 0.62);
  padding: 18px;
  box-shadow: 0 16px 36px rgba(120, 94, 72, 0.08);
  animation: ${riseIn} 0.62s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #3a2f28;
  font-size: 18px;
  line-height: 1.3;
  font-weight: 900;
  letter-spacing: 0;
`;

const PlainLink = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #bd6657;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;

  &:hover {
    color: #9f5044;
  }
`;

const ExperienceList = styled.div`
  display: grid;
  gap: 12px;
`;

const ExperienceItem = styled.button`
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.54);
  padding: 12px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: background 0.16s ease, transform 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.84);
  }
`;

const ItemMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  color: #9b8c80;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 11px;
  font-weight: 700;
`;

const CategoryPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: ${(p) => p.$color}16;
  color: ${(p) => p.$color};
  font-size: 11px;
  font-weight: 850;
`;

const ItemTitle = styled.div`
  color: #332b25;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.45;
  letter-spacing: 0;
`;

const QAList = styled.div`
  display: grid;
  gap: 10px;
`;

const QAButton = styled.button`
  width: 100%;
  border: 0;
  border-bottom: 1px solid rgba(190, 166, 140, 0.18);
  background: transparent;
  padding: 0 0 11px;
  cursor: pointer;
  color: #3d342d;
  text-align: left;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.52;
  letter-spacing: 0;

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  &:hover {
    color: #bd6657;
  }
`;

const LiaPanel = styled(SectionPanel)`
  background:
    linear-gradient(135deg, rgba(255, 253, 248, 0.75), rgba(239, 248, 255, 0.58)),
    rgba(255, 253, 248, 0.64);
`;

const LiaContent = styled.div`
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 14px;
  align-items: center;

  img {
    width: 78px;
    height: 78px;
    object-fit: contain;
    filter: drop-shadow(0 10px 18px rgba(120, 86, 72, 0.16));
  }
`;

const LiaText = styled.div`
  min-width: 0;
`;

const LiaMessage = styled.p`
  margin: 0;
  color: #51473f;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 14px;
  line-height: 1.72;
  letter-spacing: 0;

  strong {
    color: #bd6657;
  }
`;

const ReasonList = styled.div`
  display: grid;
  gap: 9px;
  margin-top: 16px;
`;

const Reason = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 9px;
  color: #65594e;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  line-height: 1.45;
  letter-spacing: 0;

  svg {
    width: 28px;
    height: 28px;
    padding: 6px;
    border-radius: 8px;
    box-sizing: border-box;
    color: #6594b6;
    background: rgba(232, 243, 251, 0.78);
  }
`;

const LiaActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`;

const MiniButton = styled(ButtonBase)`
  min-height: 38px;
  padding: 0 12px;
  font-size: 13px;
  border: 1px solid rgba(203, 168, 124, 0.32);
  background: rgba(255, 255, 255, 0.58);
  color: #6b5d53;
  box-shadow: none;

  &:hover {
    border-color: rgba(199, 107, 94, 0.32);
    background: rgba(255, 255, 255, 0.82);
  }
`;

const featuredCities = ["南京", "苏州", "徐州", "无锡", "常州", "南通"] as const;

export default function Home() {
  const navigate = useNavigate();
  const visualRef = useRef<HTMLDivElement>(null);
  const featuredExperiences = useMemo(() => EXPERIENCES.slice(0, 3), []);
  const featuredQuestions = useMemo(() => QA_ENTRIES.slice(0, 4), []);

  function goMap(city?: string) {
    const target = city ? `/jiangsu?city=${encodeURIComponent(cityRouteParam(city))}` : "/jiangsu";
    navigate(target);
  }

  function handleVisualMove(event: MouseEvent<HTMLDivElement>) {
    const node = visualRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    node.style.setProperty("--tilt-x", `${px * 5}deg`);
    node.style.setProperty("--tilt-y", `${py * -5}deg`);
    node.style.setProperty("--shift-x", `${px * 6}px`);
    node.style.setProperty("--shift-y", `${py * 6}px`);
    node.style.setProperty("--visual-x", `${px * -14}px`);
    node.style.setProperty("--visual-y", `${py * -14}px`);
  }

  function resetVisualMove() {
    const node = visualRef.current;
    if (!node) return;

    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--shift-x", "0px");
    node.style.setProperty("--shift-y", "0px");
    node.style.setProperty("--visual-x", "0px");
    node.style.setProperty("--visual-y", "0px");
  }

  return (
    <Page>
      <PageInner>
        <Hero>
          <HeroCopy>
            <Eyebrow>
              <Sparkles size={15} />
              江苏高校生活指南
            </Eyebrow>
            <Title>探索江苏，遇见你的大学</Title>
            <Subtitle>13座城市 · 78所本科高校 · 一份会呼吸的高校生活地图</Subtitle>

            <Actions>
              <PrimaryButton onClick={() => goMap()}>
                <MapPin size={18} />
                开始探索地图
                <ArrowRight size={17} />
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate("/experiences")}>
                <Sparkles size={18} />
                查看校园经验
              </SecondaryButton>
            </Actions>

            <CityArea>
              <CityLabel>热门城市</CityLabel>
              <CityTags>
                {featuredCities.map((city) => (
                  <CityTag key={city} onClick={() => goMap(city)}>
                    <MapPin size={13} />
                    {city}
                  </CityTag>
                ))}
              </CityTags>
            </CityArea>
          </HeroCopy>

          <VisualStage>
            <VisualFrame
              ref={visualRef}
              onMouseMove={handleVisualMove}
              onMouseLeave={resetVisualMove}
            >
              <VisualImage src="/jiangsu/province-stage.png" alt="江苏高校梦幻沙盘主视觉" />
              <VisualShade />
              <FloatingNote>梦幻沙盘 · 轻3D校园导览</FloatingNote>
              <VisualBadge>
                <strong>江苏高校梦幻沙盘</strong>
                <span>把 13 座城市、校园地标与生活路线收进一张柔和的高校地图。</span>
              </VisualBadge>
            </VisualFrame>
          </VisualStage>
        </Hero>

        <Sections>
          <SectionPanel>
            <SectionHeader>
              <SectionTitle>热门校园经验</SectionTitle>
              <PlainLink onClick={() => navigate("/experiences")}>
                全部经验 <ArrowRight size={13} />
              </PlainLink>
            </SectionHeader>
            <ExperienceList>
              {featuredExperiences.map((exp) => {
                const meta = CATEGORY_META[exp.category];
                return (
                  <ExperienceItem key={exp.id} onClick={() => navigate("/experiences")}>
                    <ItemMeta>
                      <CategoryPill $color={meta.color}>{meta.label}</CategoryPill>
                      <span>{exp.schoolName}</span>
                      <span>
                        <Heart size={12} /> {exp.likes}
                      </span>
                    </ItemMeta>
                    <ItemTitle>{exp.title}</ItemTitle>
                  </ExperienceItem>
                );
              })}
            </ExperienceList>
          </SectionPanel>

          <SectionPanel>
            <SectionHeader>
              <SectionTitle>新生高频问答</SectionTitle>
              <PlainLink onClick={() => navigate("/qa")}>
                去问答 <ArrowRight size={13} />
              </PlainLink>
            </SectionHeader>
            <QAList>
              {featuredQuestions.map((qa) => (
                <QAButton key={qa.id} onClick={() => navigate("/qa")}>
                  {qa.question}
                </QAButton>
              ))}
            </QAList>
          </SectionPanel>

          <LiaPanel>
            <SectionHeader>
              <SectionTitle>莉雅推荐</SectionTitle>
              <PlainLink onClick={() => navigate("/qa")}>
                进入问答 <ArrowRight size={13} />
              </PlainLink>
            </SectionHeader>
            <LiaContent>
              <img src="/lia/calm.png" alt="莉雅" />
              <LiaText>
                <LiaMessage>
                  <strong>莉雅</strong>会把城市、高校和校园经验串起来，帮新生从生活场景开始认识一所大学。
                </LiaMessage>
              </LiaText>
            </LiaContent>
            <ReasonList>
              <Reason>
                <School />
                <span>按城市探索学校，再回到经验页补足生活细节</span>
              </Reason>
              <Reason>
                <MessageCircle />
                <span>用问答快速扫清住宿、食堂、通勤和选课疑问</span>
              </Reason>
            </ReasonList>
            <LiaActions>
              <MiniButton onClick={() => goMap("南京")}>看南京高校</MiniButton>
              <MiniButton onClick={() => navigate("/experiences")}>浏览经验</MiniButton>
            </LiaActions>
          </LiaPanel>
        </Sections>
      </PageInner>
    </Page>
  );
}
