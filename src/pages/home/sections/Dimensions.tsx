import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { Layers } from "lucide-react";
import { DIMENSIONS, DISPLAY_PHOTOS } from "../data";

const Wrapper = styled.section`
  position: relative;
  padding: clamp(80px, 10vw, 140px) 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const StickyCol = styled.div`
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;

  @media (max-width: 860px) {
    position: relative;
    top: auto;
    transform: none;
  }
`;

const IconStage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: grid;
  place-items: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.45;
  }
`;

const NumberDisplay = styled.div`
  margin-top: 20px;
  font-family: var(--font-display, serif);
  font-size: 96px;
  font-weight: 900;
  color: var(--color-accent, #c76b5e);
  text-align: center;
  line-height: 1;
  letter-spacing: -0.02em;
  text-shadow: 0 8px 32px rgba(199, 107, 94, 0.12);
`;

const TitleDisplay = styled.div`
  margin-top: 8px;
  font-family: var(--font-display, serif);
  font-size: 32px;
  font-weight: 900;
  color: var(--color-text, #fff);
  text-align: center;
`;

const TagDisplay = styled.div`
  margin-top: 12px;
  text-align: center;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  color: var(--color-text-muted, #888);
  letter-spacing: 0.04em;
`;

const CardsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div<{ $active: boolean }>`
  position: relative;
  padding: 36px;
  border-radius: 14px;
  border: 1px solid
    ${(p) =>
      p.$active
        ? "rgba(199, 107, 94, 0.3)"
        : "rgba(255, 255, 255, 0.06)"};
  background: ${(p) =>
    p.$active
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.02)"};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  transition:
    border-color 0.5s ease,
    background 0.5s ease,
    transform 0.35s ease;
  cursor: default;

  ${(p) =>
    p.$active &&
    `
    transform: translateX(6px);
    box-shadow: 0 0 0 1px rgba(199, 107, 94, 0.08), 0 24px 48px rgba(0, 0, 0, 0.3);
  `}
`;

const CardNumber = styled.span<{ $active: boolean }>`
  display: block;
  font-family: var(--font-display, serif);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: ${(p) =>
    p.$active
      ? "var(--color-accent, #c76b5e)"
      : "var(--color-text-muted, #888)"};
  transition: color 0.5s ease;
`;

const CardTitle = styled.h3<{ $active: boolean }>`
  margin: 14px 0 10px;
  font-family: var(--font-display, serif);
  font-size: clamp(24px, 2.5vw, 34px);
  font-weight: 900;
  color: ${(p) =>
    p.$active ? "var(--color-text, #fff)" : "var(--color-text-muted, #888)"};
  transition: color 0.5s ease;
`;

const CardText = styled.p<{ $active: boolean }>`
  margin: 0;
  font-family: var(--font-body, sans-serif);
  font-size: 15px;
  line-height: 1.8;
  color: ${(p) =>
    p.$active
      ? "var(--color-text-muted, #888)"
      : "rgba(255, 255, 255, 0.25)"};
  transition: color 0.5s ease;
`;

const CardTag = styled.span`
  display: inline-block;
  margin-top: 16px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted, #888);
  letter-spacing: 0.06em;
  background: rgba(255, 255, 255, 0.02);
`;

const SectionHead = styled.div`
  margin-bottom: 8px;
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
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const Title = styled.h2`
  margin: 0 0 14px;
  color: var(--color-text, #fff);
  font-family: var(--font-display, serif);
  font-size: clamp(32px, 4.5vw, 56px);
  line-height: 1.08;
  font-weight: 900;
`;

export default function Dimensions() {
  const [active, setActive] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>("[data-dim-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.dimIndex);
            if (!isNaN(idx)) setActive(idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-40px 0px" },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const activeDim = DIMENSIONS[active];

  return (
    <Wrapper>
      <Grid>
        <StickyCol>
          <IconStage>
            <img src={DISPLAY_PHOTOS[0].src} alt="" />
          </IconStage>
          <NumberDisplay>{activeDim.number}</NumberDisplay>
          <TitleDisplay>{activeDim.title}</TitleDisplay>
          <TagDisplay>{activeDim.tag}</TagDisplay>
        </StickyCol>

        <CardsCol ref={cardsRef}>
          <SectionHead>
            <Kicker>
              <Layers size={14} />
              择校维度
            </Kicker>
            <Title>从四个维度了解一所大学。</Title>
          </SectionHead>
          {DIMENSIONS.map((dim, i) => (
            <Card
              key={dim.number}
              data-dim-index={i}
              $active={active === i}
            >
              <CardNumber $active={active === i}>{dim.number}</CardNumber>
              <CardTitle $active={active === i}>{dim.title}</CardTitle>
              <CardText $active={active === i}>{dim.text}</CardText>
              <CardTag>{dim.tag}</CardTag>
            </Card>
          ))}
        </CardsCol>
      </Grid>
    </Wrapper>
  );
}
