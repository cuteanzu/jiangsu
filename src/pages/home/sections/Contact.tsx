import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight } from "lucide-react";
import { marqueeScroll } from "../Home.styles";
import { MARQUEE_NAMES } from "../data";

const Wrapper = styled.section`
  position: relative;
  padding: clamp(80px, 12vw, 160px) 0 clamp(40px, 8vw, 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
`;

// ── Aperture / Iris stage ──

const ApertureStage = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 1 / 1;
  margin: 0 auto 40px;
  display: grid;
  place-items: center;
`;

const IrisRing = styled.div<{ $index: number; $expand: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${(p) => (p.$expand ? `${120 + p.$index * 70}%` : "0")};
  height: ${(p) => (p.$expand ? `${120 + p.$index * 70}%` : "0")};
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, ${(p) => 0.05 + p.$index * 0.035});
  transform: translate(-50%, -50%);
  transition:
    width 0.9s cubic-bezier(0.46, 0, 0.17, 1) ${(p) => p.$index * 0.1}s,
    height 0.9s cubic-bezier(0.46, 0, 0.17, 1) ${(p) => p.$index * 0.1}s,
    border-color 0.7s ease;
  pointer-events: none;

  ${(p) =>
    p.$expand &&
    p.$index === 3 &&
    `
    border-color: rgba(199, 107, 94, 0.12);
  `}
`;

const IrisBlade = styled.div<{ $rotation: number; $expand: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${(p) => (p.$expand ? "60%" : "0")};
  height: 1px;
  background: rgba(255, 255, 255, ${(p) => (p.$expand ? 0.04 : 0)});
  transform: translate(-50%, -50%) rotate(${(p) => p.$rotation}deg);
  transform-origin: center;
  transition:
    width 0.7s cubic-bezier(0.46, 0, 0.17, 1) 0.15s;
  pointer-events: none;
`;

const CTAButton = styled.button`
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 60px;
  padding: 0 36px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text, #fff);
  font-family: var(--font-display, serif);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition:
    transform 0.3s ease,
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(199, 107, 94, 0.3);
    box-shadow: 0 0 60px rgba(199, 107, 94, 0.08);
  }
`;

const SubLink = styled.button`
  margin-top: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-muted, #888);
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.25s ease;

  &:hover {
    color: var(--color-accent, #c76b5e);
  }
`;

// ── Marquee at bottom ──

const MarqueeWrap = styled.div`
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-top: 80px;
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  white-space: nowrap;
`;

const MarqueeTrack = styled.div`
  display: inline-flex;
  animation: ${marqueeScroll} 80s linear infinite;
`;

const MarqueeItem = styled.span`
  padding: 0 28px;
  font-family: var(--font-display, serif);
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.14);
  letter-spacing: 0.06em;
`;

// Generate blade rotations evenly
const BLADE_ROTATIONS = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);

export default function Contact() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <Wrapper>
      <ApertureStage
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Iris rings */}
        {[0, 1, 2, 3].map((i) => (
          <IrisRing key={`ring-${i}`} $index={i} $expand={hovered} />
        ))}
        {/* Iris blades */}
        {BLADE_ROTATIONS.map((rot, i) => (
          <IrisBlade key={`blade-${i}`} $rotation={rot} $expand={hovered} />
        ))}

        <CTAButton
          data-mouse-target="查看地图"
          onClick={() => navigate("/jiangsu")}
        >
          查看高校地图
          <ArrowRight size={20} />
        </CTAButton>
      </ApertureStage>

      <SubLink
        data-mouse-target="校园经验分享"
        onClick={() => navigate("/experiences")}
      >
        校园经验分享
        <ArrowRight size={14} />
      </SubLink>

      <MarqueeWrap>
        <MarqueeTrack>
          {MARQUEE_NAMES.map((name, i) => (
            <MarqueeItem key={i}>{name}</MarqueeItem>
          ))}
          {MARQUEE_NAMES.map((name, i) => (
            <MarqueeItem key={`dup-${i}`}>{name}</MarqueeItem>
          ))}
        </MarqueeTrack>
      </MarqueeWrap>
    </Wrapper>
  );
}
