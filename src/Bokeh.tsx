import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { useSettings } from "./settings-context";
import { stablePick, stableRange } from "./utils/stableRandom";

const drift = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(10px, -30px) scale(1.05); }
  50% { transform: translate(-5px, -60px) scale(0.95); }
  75% { transform: translate(-15px, -90px) scale(1.02); }
  100% { transform: translate(0, -120px) scale(1); }
`;

const BokehDot = styled.div<{ $size: number; $opacity: number; $x: number; $y: number; $dur: number; $delay: number; $color: string }>`
  position: absolute;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  opacity: ${(p) => p.$opacity};
  filter: blur(${(p) => p.$size * 0.5}px);
  left: ${(p) => p.$x}%;
  top: ${(p) => p.$y}%;
  animation: ${drift} ${(p) => p.$dur}s ${(p) => p.$delay}s linear infinite;
  pointer-events: none;
`;

interface BokehItem {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
  color: string;
}

export default function Bokeh() {
  const { s } = useSettings();

  const dots = useMemo<BokehItem[]>(() => {
    if (s.bokehCount === 0) return [];
    const colors = [
      "rgba(255,245,230,0.5)",
      "rgba(255,225,200,0.4)",
      "rgba(255,210,180,0.35)",
      "rgba(255,240,220,0.45)",
      "rgba(255,220,190,0.3)",
    ];
    return Array.from({ length: s.bokehCount }, (_, i) => ({
      id: i,
      x: stableRange(i, 1, 0, 100),
      y: stableRange(i, 2, 60, 100),
      size: 40 + stableRange(i, 3, 0, 100) * s.bokehSize,
      opacity: stableRange(i, 4, 0.1, 0.6) * s.bokehOpacity,
      dur: stableRange(i, 5, 8, 24),
      delay: stableRange(i, 6, 0, 12),
      color: stablePick(colors, i, 7),
    }));
  }, [s.bokehCount, s.bokehSize, s.bokehOpacity]);

  return (
    <>
      {dots.map((d) => (
        <BokehDot
          key={d.id}
          $size={d.size}
          $opacity={d.opacity}
          $x={d.x}
          $y={d.y}
          $dur={d.dur}
          $delay={d.delay}
          $color={d.color}
        />
      ))}
    </>
  );
}
