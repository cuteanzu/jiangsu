import styled, { keyframes } from "styled-components";
import { useTransition } from "../context/useTransition";

const transitionFade = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const Overlay = styled.div<{ $active: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  background: radial-gradient(ellipse 55% 45% at 50% 48%, rgba(255,252,247,0.94) 0%, rgba(253,242,235,0.88) 40%, rgba(240,236,245,0.70) 100%);
  transition: opacity 0.35s ease;
  animation: ${(p) => (p.$active ? transitionFade : "none")} 0.35s ease both;
`;

export default function PageTransitionOverlay() {
  const { isTransitioning } = useTransition();
  return <Overlay $active={isTransitioning} />;
}
