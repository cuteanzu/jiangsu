import styled, { keyframes } from "styled-components";

// ── Keyframes ──

export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const marqueeScroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ── Page wrapper ──

export const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  color: #f0f0f0;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;

  &.lenis.lenis-smooth {
    scroll-behavior: auto !important;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

// ── Custom cursor ──

export const CursorAura = styled.div`
  position: fixed;
  left: -70px;
  top: -70px;
  z-index: 100000;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  pointer-events: none;
  display: grid;
  place-items: center;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  opacity: 0;

  span {
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  @media (pointer: coarse), (max-width: 760px) {
    display: none;
  }
`;

// ── Content shell ──

export const Shell = styled.div`
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(40px, 6vw, 80px) 0 120px;

  @media (max-width: 720px) {
    width: calc(100% - 28px);
    padding: 28px 0 60px;
  }
`;

// ── Photo placeholder with shimmer ──

export const PhotoPlaceholder = styled.div<{
  $aspect?: string;
  $gradient: string;
}>`
  width: 100%;
  aspect-ratio: ${(p) => p.$aspect ?? "16/9"};
  border-radius: 8px;
  background: ${(p) => p.$gradient};
  background-size: 200% 100%;
  animation: ${shimmer} 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;
`;

// ── Shared section headers ──

export const SectionKicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-accent, #c76b5e);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const SectionTitle = styled.h2`
  margin: 16px 0 14px;
  color: #fff;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(32px, 5vw, 64px);
  line-height: 1.08;
  font-weight: 900;
`;

export const SectionText = styled.p`
  max-width: 60ch;
  margin: 0 0 48px;
  color: #888;
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: clamp(15px, 1.3vw, 18px);
  line-height: 1.9;
`;
