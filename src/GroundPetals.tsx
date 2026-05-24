import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { useSettings } from "./settings-context";
import { stableRandom, stableRange } from "./utils/stableRandom";

const gentleSway = keyframes`
  0%, 100% { transform: rotate(0deg) translateX(0); }
  33% { transform: rotate(3deg) translateX(2px); }
  66% { transform: rotate(-2deg) translateX(-1px); }
`;

interface PetalShapeProps {
  $size: number;
  $x: number;
  $y: number;
  $rot: number;
  $opacity: number;
  $delay: number;
  $flip: boolean;
}

const PetalShape = styled.div<PetalShapeProps>`
  position: absolute;
  bottom: ${(p) => p.$y}%;
  left: ${(p) => p.$x}%;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size * 1.6}px;
  border-radius: 50% 0 50% 0;
  background: ${(p) =>
    p.$flip
      ? "linear-gradient(135deg, rgba(255,200,215,0.7), rgba(255,170,190,0.5), rgba(255,220,230,0.3))"
      : "linear-gradient(135deg, rgba(255,220,230,0.65), rgba(255,185,200,0.5), rgba(255,200,215,0.25))"};
  opacity: ${(p) => p.$opacity};
  transform: rotate(${(p) => p.$rot}deg);
  animation: ${gentleSway} ${(p) => 3 + p.$delay * 2}s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}s;
  pointer-events: none;
  filter: blur(0.5px);
`;

interface GroundPetal {
  id: number;
  size: number;
  x: number;
  y: number;
  rot: number;
  opacity: number;
  delay: number;
  flip: boolean;
}

export default function GroundPetals() {
  const { s } = useSettings();

  const petals = useMemo<GroundPetal[]>(() => {
    return Array.from({ length: s.groundPetalsCount }, (_, i) => ({
      id: i,
      size: stableRange(i, 1, 6, 20),
      x: stableRange(i, 2, 0, 100),
      y: stableRange(i, 3, 1, 16),
      rot: stableRange(i, 4, 0, 360),
      opacity: stableRange(i, 5, 0.3, 0.7),
      delay: stableRange(i, 6, 0, 3),
      flip: stableRandom(i, 7) > 0.5,
    }));
  }, [s.groundPetalsCount]);

  return (
    <>
      {petals.map((p) => (
        <PetalShape
          key={p.id}
          $size={p.size}
          $x={p.x}
          $y={p.y}
          $rot={p.rot}
          $opacity={p.opacity}
          $delay={p.delay}
          $flip={p.flip}
        />
      ))}
    </>
  );
}
