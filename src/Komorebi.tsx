import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { useSettings } from "./settings-context";
import { stableRange } from "./utils/stableRandom";

const beamShift = keyframes`
  0%, 100% { opacity: 0.5; transform: skewX(-12deg) translateX(0); }
  50% { opacity: 0.8; transform: skewX(-10deg) translateX(2%); }
`;

const Beam = styled.div<{ $opacity: number; $left: number; $width: number; $angle: number; $delay: number }>`
  position: absolute;
  top: -10%;
  left: ${(p) => p.$left}%;
  width: ${(p) => p.$width}px;
  height: 120%;
  background: linear-gradient(
    180deg,
    rgba(255,250,240,${(p) => p.$opacity * 0.7}) 0%,
    rgba(255,240,220,${(p) => p.$opacity * 0.4}) 30%,
    rgba(255,220,180,${(p) => p.$opacity * 0.15}) 60%,
    transparent 100%
  );
  transform: skewX(${(p) => p.$angle}deg);
  animation: ${beamShift} ${(p) => 4 + p.$delay * 2}s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}s;
  pointer-events: none;
  mix-blend-mode: screen;
`;

const dustFloat = keyframes`
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
`;

const DustParticle = styled.div<{ $size: number; $x: number; $dur: number; $delay: number }>`
  position: absolute;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: rgba(255,250,240,0.8);
  left: ${(p) => p.$x}%;
  bottom: -10px;
  animation: ${dustFloat} ${(p) => p.$dur}s ${(p) => p.$delay}s linear infinite;
  pointer-events: none;
  box-shadow: 0 0 ${(p) => p.$size * 2}px rgba(255,245,230,0.5);
`;

interface BeamConfig {
  id: number;
  left: number;
  width: number;
  angle: number;
  delay: number;
}

interface DustConfig {
  id: number;
  size: number;
  x: number;
  dur: number;
  delay: number;
}

export default function Komorebi() {
  const { s } = useSettings();

  const beams = useMemo<BeamConfig[]>(() => [
    { id: 1, left: 15, width: 80, angle: -14, delay: 0 },
    { id: 2, left: 32, width: 50, angle: -10, delay: 1.2 },
    { id: 3, left: 55, width: 100, angle: -16, delay: 0.7 },
    { id: 4, left: 72, width: 60, angle: -11, delay: 2.1 },
  ], []);

  const dust = useMemo<DustConfig[]>(() => {
    return Array.from({ length: s.komorebiDustCount }, (_, i) => ({
      id: i,
      size: stableRange(i, 1, 1, 4),
      x: stableRange(i, 2, 10, 90),
      dur: stableRange(i, 3, 6, 18),
      delay: stableRange(i, 4, 0, 10),
    }));
  }, [s.komorebiDustCount]);

  return (
    <>
      {beams.map((b) => (
        <Beam
          key={b.id}
          $opacity={s.komorebiBeamOpacity}
          $left={b.left}
          $width={b.width}
          $angle={b.angle}
          $delay={b.delay}
        />
      ))}
      {dust.map((d) => (
        <DustParticle
          key={d.id}
          $size={d.size}
          $x={d.x}
          $dur={d.dur}
          $delay={d.delay}
        />
      ))}
    </>
  );
}
