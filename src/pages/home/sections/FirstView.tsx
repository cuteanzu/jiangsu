import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight, Compass, GraduationCap, MapPin } from "lucide-react";
import { spin } from "../Home.styles";
import { TIER_LABEL } from "../../../data/jiangsu-universities";
import type { Tier } from "../../../data/jiangsu-universities";
import { FILMSTRIP_PHOTOS } from "../data";

const TIERS: Tier[] = ["985", "211", "dual", "provincial"];

const Wrapper = styled.section`
  position: relative;
  min-height: calc(100svh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  padding-bottom: 0;
`;

const SpinningGradient = styled.div`
  position: absolute;
  inset: -20%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 35% 45%, rgba(199, 107, 94, 0.15) 0%, transparent 55%),
    radial-gradient(ellipse at 65% 25%, rgba(120, 160, 210, 0.08) 0%, transparent 45%);
  animation: ${spin} 50s linear infinite;
  opacity: 0.8;
`;

const GridLines = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 10% 0;
`;

const Line = styled.div`
  height: 0.5px;
  background: rgba(255, 255, 255, 0.07);
  transform-origin: left;
  transform: scaleX(0);
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: center;
  padding: 0 24px;
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(199, 107, 94, 0.2);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-accent, #c76b5e);
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 32px;
  opacity: 0;
`;

const Title = styled.h1`
  margin: 0 0 22px;
  color: var(--color-text, #fff);
  font-size: clamp(48px, 8vw, 96px);
  line-height: 0.94;
  font-weight: 950;
  letter-spacing: -0.01em;
`;

const TitleLine = styled.span`
  display: block;
  overflow: hidden;
  padding-bottom: 0.02em;
`;

const TitleInner = styled.span`
  display: inline-block;
  opacity: 0;
`;

const TitleEn = styled(TitleInner)`
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-weight: 400;
`;

const TitleCn = styled(TitleInner)`
  font-family: var(--font-display, serif);
  font-size: clamp(72px, 14vw, 176px);
  line-height: 0.82;
  color: var(--color-accent, #c76b5e);
  font-weight: 950;
  text-shadow: 0 18px 48px rgba(199, 107, 94, 0.15);
`;

const Subtitle = styled.p`
  max-width: 52ch;
  margin: 0 0 32px;
  color: var(--color-text-muted, #888);
  font-family: var(--font-body, sans-serif);
  font-size: clamp(16px, 1.4vw, 20px);
  line-height: 1.9;
  opacity: 0;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 36px;
  opacity: 0;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  min-height: 48px;
  padding: 0 20px;
  border-radius: 8px;
  border: 1px solid
    ${(p) => (p.$primary ? "rgba(199, 107, 94, 0.3)" : "rgba(255, 255, 255, 0.12)")};
  background: ${(p) =>
    p.$primary
      ? "linear-gradient(135deg, var(--color-accent, #c76b5e), rgba(180, 80, 50, 0.9))"
      : "rgba(255, 255, 255, 0.04)"};
  color: ${(p) => (p.$primary ? "#fff" : "var(--color-text-muted, #888)")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const TierTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TierTag = styled.span<{ $tier: string }>`
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid
    ${(p) =>
      p.$tier === "985"
        ? "rgba(199, 107, 94, 0.25)"
        : p.$tier === "211"
          ? "rgba(210, 150, 105, 0.25)"
          : p.$tier === "dual"
            ? "rgba(105, 160, 200, 0.25)"
            : "rgba(120, 155, 105, 0.25)"};
  background: rgba(255, 255, 255, 0.03);
  color: var(--color-text-muted, #888);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

// ── Film strip ──

const FilmStrip = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: auto;
  padding: 28px 0 36px;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(8, 13, 20, 0.3) 0%,
      transparent 12%,
      transparent 88%,
      rgba(8, 13, 20, 0.3) 100%
    );
    z-index: 2;
    pointer-events: none;
  }
`;

const FilmTrack = styled.div`
  display: flex;
  gap: 8px;
  width: max-content;
  animation: filmstripScroll 40s linear infinite;

  @keyframes filmstripScroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

const FilmFrame = styled.div`
  width: 140px;
  height: 86px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(8, 13, 20, 0.2);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 760px) {
    width: 100px;
    height: 62px;
  }
`;

const FilmLabel = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
  margin-bottom: 12px;
`;

const FilmLabelText = styled.span`
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
`;

export default function FirstView() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <SpinningGradient data-motion-hero="gradient" />
      <GridLines>
        {Array.from({ length: 7 }).map((_, i) => (
          <Line key={i} className="first-line" />
        ))}
      </GridLines>
      <Content>
        <Kicker data-motion-hero="kicker">
          <GraduationCap size={14} />
          江苏高校
        </Kicker>
        <Title>
          <TitleLine>
            <TitleEn data-title-word>Welcome to</TitleEn>
          </TitleLine>
          <TitleLine>
            <TitleCn data-title-word>江苏</TitleCn>
          </TitleLine>
        </Title>
        <Subtitle data-motion-hero="copy">
          覆盖江苏 13 个城市、47 所本科院校。按学校层次、所在城市、
          专业方向多维度呈现，帮助快速了解和比较。
        </Subtitle>
        <Actions data-motion-hero="copy">
          <ActionButton
            $primary
            data-mouse-target="入图"
            onClick={() => navigate("/jiangsu")}
          >
            <MapPin size={17} />
            查看地图
            <ArrowRight size={16} />
          </ActionButton>
          <ActionButton data-mouse-target="问答" onClick={() => navigate("/qa")}>
            <Compass size={17} />
            问答
          </ActionButton>
        </Actions>
        <TierTags data-motion-hero="copy">
          {TIERS.map((t) => (
            <TierTag key={t} $tier={t}>
              {TIER_LABEL[t]}
            </TierTag>
          ))}
        </TierTags>
      </Content>

      <FilmStrip>
        <FilmLabel>
          <FilmLabelText>长江摄影条 · 金陵光影</FilmLabelText>
        </FilmLabel>
        <FilmTrack>
          {[...FILMSTRIP_PHOTOS, ...FILMSTRIP_PHOTOS, ...FILMSTRIP_PHOTOS].map(
            (photo, i) => (
              <FilmFrame key={i}>
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </FilmFrame>
            ),
          )}
        </FilmTrack>
      </FilmStrip>
    </Wrapper>
  );
}
