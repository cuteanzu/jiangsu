import { useMemo } from "react";
import styled, { keyframes } from "styled-components";

const floatUp = keyframes`
  0% { transform: translateY(100vh) translateX(0); opacity: 0; }
  10% { opacity: 0.35; }
  90% { opacity: 0.35; }
  100% { transform: translateY(-10vh) translateX(40px); opacity: 0; }
`;

const floatUpAlt = keyframes`
  0% { transform: translateY(105vh) translateX(0); opacity: 0; }
  15% { opacity: 0.25; }
  85% { opacity: 0.25; }
  100% { transform: translateY(-15vh) translateX(-30px); opacity: 0; }
`;

interface ParticleProps {
  $x: number;
  $size: number;
  $duration: number;
  $delay: number;
  $alt: boolean;
}

const Particle = styled.div<ParticleProps>`
  position: fixed;
  left: ${(p) => p.$x}%;
  bottom: 0;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  z-index: 0;
  animation: ${(p) => (p.$alt ? floatUpAlt : floatUp)} ${(p) => p.$duration}s
    ${(p) => p.$delay}s linear infinite;
  filter: blur(0.5px);

  @media (pointer: coarse), (max-width: 760px) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    display: none;
  }
`;

function stableRandom(seed: number, offset: number): number {
  const x = Math.sin(seed * 9301 + offset * 4921 + 233280) * 49297;
  return x - Math.floor(x);
}

export default function Particles({ count = 35 }: { count?: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: stableRandom(i, 1) * 100,
      size: 1 + stableRandom(i, 2) * 2.5,
      duration: 12 + stableRandom(i, 3) * 18,
      delay: stableRandom(i, 4) * 15,
      alt: stableRandom(i, 5) > 0.5,
    }));
  }, [count]);

  return (
    <>
      {particles.map((p, i) => (
        <Particle
          key={i}
          $x={p.x}
          $size={p.size}
          $duration={p.duration}
          $delay={p.delay}
          $alt={p.alt}
        />
      ))}
    </>
  );
}
