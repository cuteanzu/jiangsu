import { useState } from "react";
import styled from "styled-components";
import { BLADE_PHOTOS } from "../data";

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #1a1418 0%, #2a1f24 40%, #1e1818 100%)",
  "linear-gradient(160deg, #181a1f 0%, #1f242a 40%, #181c1e 100%)",
  "linear-gradient(145deg, #1a1818 0%, #24201b 40%, #1a1818 100%)",
  "linear-gradient(150deg, #18191a 0%, #1f2224 40%, #181a1c 100%)",
];

const Wrapper = styled.div`
  margin-top: clamp(60px, 10vw, 120px);
`;

const SectionLabel = styled.div`
  text-align: center;
  margin-bottom: clamp(40px, 8vw, 80px);
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c76b5e;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
`;

const KickerTitle = styled.h2`
  margin: 14px 0 0;
  color: #fdf7f2;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 900;
  letter-spacing: 0.04em;
`;

const Row = styled.div<{ $side: "left" | "right" }>`
  position: relative;
  display: flex;
  align-items: center;
  min-height: 80vh;
  padding: clamp(40px, 6vw, 80px) clamp(24px, 5vw, 64px);

  ${(p) =>
    p.$side === "left"
      ? "justify-content: flex-start;"
      : "justify-content: flex-end;"}

  @media (max-width: 760px) {
    justify-content: center;
    min-height: 55vh;
    padding: 32px 20px;
  }
`;

// ── Blurred ambient echo behind the photo ──

const BlurEcho = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  z-index: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 55%;
  aspect-ratio: 16 / 9;
  filter: blur(64px) saturate(0.5);
  opacity: 0.12;

  ${(p) =>
    p.$side === "left" ? "left: 8%;" : "right: 8%;"}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 760px) {
    width: 85%;
    filter: blur(48px) saturate(0.4);
    opacity: 0.08;
  }
`;

const PhotoCard = styled.div<{ $side: "left" | "right"; $portrait: boolean }>`
  position: relative;
  z-index: 2;
  width: ${(p) => (p.$portrait ? "clamp(260px, 28vw, 420px)" : "clamp(380px, 46vw, 680px)")};
  border-radius: 6px;
  overflow: hidden;
  background: #141414;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5);

  img {
    width: 100%;
    display: block;
    will-change: transform, mask-size, -webkit-mask-size;
    mask-image: linear-gradient(to bottom, black 0%, black 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black 100%);
    mask-size: 100% var(--blade-mask, 0%);
    -webkit-mask-size: 100% var(--blade-mask, 0%);
    mask-position: 100% top;
    -webkit-mask-position: 100% top;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    transform-origin: top left;
    transition: filter 0.5s ease;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 40%,
      rgba(8, 13, 20, 0.5) 100%
    );
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  &:hover {
    img {
      filter: brightness(1.08);
    }
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(199, 107, 94, 0.15);
  }

  @media (max-width: 760px) {
    width: 100%;
    max-width: 480px;
  }
`;

const Label = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  bottom: 0;
  z-index: 3;
  padding: clamp(14px, 2vw, 20px) clamp(16px, 2.5vw, 28px);

  ${(p) =>
    p.$side === "left" ? "left: 0; text-align: left;" : "right: 0; text-align: right;"}
`;

const LabelCn = styled.span`
  display: block;
  color: #fdf7f2;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(13px, 1.1vw, 16px);
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 3px;
`;

const LabelEn = styled.span`
  display: block;
  color: rgba(255, 255, 255, 0.38);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

function BladeImage({
  src,
  alt,
  idx,
}: {
  src: string;
  alt: string;
  idx: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: BLADE_PHOTOS[idx].portrait ? "3/4" : "16/9",
          background: PLACEHOLDER_GRADIENTS[idx],
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

const LABELS = ["Wutong Avenue", "Jinling Academy", "Qinhuai River", "Purple Mountain"];

export default function BladeRows() {
  return (
    <Wrapper data-blade-rows>
      <SectionLabel>
        <Kicker>金陵 · JINLING</Kicker>
        <KickerTitle>Nanjing</KickerTitle>
      </SectionLabel>

      {BLADE_PHOTOS.map((photo, i) => {
        const side: "left" | "right" = i % 2 === 0 ? "left" : "right";

        return (
          <Row key={i} $side={side} data-blade-row>
            <BlurEcho $side={side}>
              <BladeImage src={photo.src} alt="" idx={i} />
            </BlurEcho>

            <PhotoCard $side={side} $portrait={photo.portrait ?? false} data-blade-photo>
              <BladeImage src={photo.src} alt={photo.alt} idx={i} />
              <Label $side={side} data-blade-text>
                <LabelCn>{photo.alt}</LabelCn>
                <LabelEn>{LABELS[i]}</LabelEn>
              </Label>
            </PhotoCard>
          </Row>
        );
      })}
    </Wrapper>
  );
}
