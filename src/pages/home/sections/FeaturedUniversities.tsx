import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight, BookOpen, MapPin } from "lucide-react";
import { getFeatured, TIER_COLORS, DISPLAY_PHOTOS } from "../data";
import { TIER_LABEL } from "../../../data/jiangsu-universities";
import { cityRouteParam } from "../../../utils/jiangsuPresentation";
import { marqueeScroll } from "../Home.styles";

const Wrapper = styled.section`
  position: relative;
  padding: clamp(80px, 10vw, 140px) 0;
  overflow: hidden;
`;

const SectionHead = styled.div`
  margin-bottom: 48px;
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-accent, #c76b5e);
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
`;

const Title = styled.h2`
  margin: 16px 0 14px;
  color: var(--color-text, #fff);
  font-family: var(--font-display, serif);
  font-size: clamp(36px, 5vw, 64px);
  line-height: 1.08;
  font-weight: 900;
`;

const Text = styled.p`
  max-width: 60ch;
  margin: 0;
  color: var(--color-text-muted, #888);
  font-family: var(--font-body, sans-serif);
  font-size: clamp(15px, 1.3vw, 18px);
  line-height: 1.9;
`;

// ── Irregular grid ──

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button<{ $large?: boolean }>`
  position: relative;
  min-height: ${(p) => (p.$large ? "340px" : "280px")};
  padding: 0;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    transform 0.35s var(--easing-out, ease),
    box-shadow 0.35s var(--easing-out, ease),
    border-color 0.35s ease;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.6);
    border-color: rgba(199, 107, 94, 0.3);
    z-index: 2;
  }
`;

const CardBg = styled.div<{ $idx: number }>`
  position: absolute;
  inset: 0;
  background-image: url(${(p) => DISPLAY_PHOTOS[p.$idx % DISPLAY_PHOTOS.length].src});
  background-size: cover;
  background-position: center;
  opacity: 0.55;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(8, 13, 20, 0.1) 0%,
      rgba(8, 13, 20, 0.45) 70%,
      rgba(8, 13, 20, 0.6) 100%
    ),
    radial-gradient(
      circle at 30% 30%,
      rgba(199, 107, 94, 0.12),
      transparent 60%
    );
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const CardTier = styled.span<{ $tier: string }>`
  display: inline-block;
  width: fit-content;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: ${(p) => TIER_COLORS[p.$tier] ?? "#888"};
  border: 1px solid ${(p) => (TIER_COLORS[p.$tier] ?? "#888") + "44"};
  background: ${(p) => (TIER_COLORS[p.$tier] ?? "#888") + "16"};
  margin-bottom: 12px;
`;

const CardName = styled.strong`
  display: block;
  font-family: var(--font-display, serif);
  font-size: clamp(22px, 2.5vw, 30px);
  font-weight: 900;
  color: var(--color-text, #fff);
  line-height: 1.15;
  text-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
`;

const CardCity = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  color: var(--color-text-muted, #888);
`;

const CardArrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent, #c76b5e);
`;

// ── Full-page background marquee ──

const BgMarquee = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: ${(p) => (p.$visible ? 0.1 : 0)};
  transition: opacity 0.7s ease;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
`;

const MarqueeTrack = styled.div`
  display: flex;
  animation: ${marqueeScroll} 40s linear infinite;
`;

const MarqueeName = styled.span`
  padding: 0 36px;
  font-family: var(--font-display, serif);
  font-size: 160px;
  font-weight: 900;
  color: var(--color-text, #fff);
  line-height: 1;
  filter: blur(6px);
  opacity: 0.35;
  user-select: none;
`;

const FEATURED = getFeatured();

export default function FeaturedUniversities() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      <BgMarquee $visible={hoveredId !== null}>
        <MarqueeTrack>
          {[...Array(3)].map((_, round) =>
            FEATURED.map((u) => (
              <MarqueeName key={`${round}-${u.id}`}>{u.name}</MarqueeName>
            )),
          )}
        </MarqueeTrack>
        <MarqueeTrack aria-hidden>
          {[...Array(3)].map((_, round) =>
            FEATURED.map((u) => (
              <MarqueeName key={`dup-${round}-${u.id}`}>{u.name}</MarqueeName>
            )),
          )}
        </MarqueeTrack>
      </BgMarquee>

      <Wrapper>
        <SectionHead>
          <Kicker>
            <BookOpen size={14} />
            代表院校
          </Kicker>
          <Title>六所代表院校</Title>
          <Text>
            覆盖 985、211、双一流和特色本科，点击进入对应城市查看详情。
          </Text>
        </SectionHead>

        <Grid>
          {FEATURED.map((u, i) => {
            return (
              <Card
                key={u.id}
                $large={i === 0 || i === 4}
                data-mouse-target={u.name}
                onMouseEnter={() => setHoveredId(u.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() =>
                  navigate(
                    `/jiangsu?city=${encodeURIComponent(cityRouteParam(u.city))}`,
                  )
                }
              >
                <CardBg $idx={i} />
                <CardContent>
                  <CardTier $tier={u.tier}>{TIER_LABEL[u.tier]}</CardTier>
                  <CardName>{u.name}</CardName>
                  <CardCity>
                    <MapPin size={12} />
                    {u.city}
                  </CardCity>
                  <CardArrow>
                    查看详情
                    <ArrowRight size={12} />
                  </CardArrow>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
      </Wrapper>
    </>
  );
}
