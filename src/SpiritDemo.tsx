import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  background: oklch(0.18 0.005 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  overflow: hidden;
`;

const Row = styled.div`
  display: flex;
  gap: 56px;
  align-items: flex-end;
`;

const Hint = styled.p`
  color: oklch(0.6 0.02 0);
  font-size: 13px;
  letter-spacing: 0.06em;
`;

// ── Wrapper that handles float animation (separate from tilt transform) ──

const FloatWrap = styled.div<{ $delay: number }>`
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}s;
`;

const TiltWrap = styled.div<{ $tx: number; $ty: number }>`
  transform: rotateX(${(p) => p.$tx * 5}deg) rotateY(${(p) => p.$ty * 5}deg);
  transition: transform 0.2s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

// ── Character body ──

const CharBase = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PinkBody = styled(CharBase)`
  width: 84px;
  height: 90px;
  border-radius: 50% 50% 45% 45%;
  background: oklch(0.78 0.09 10);
`;
const HikariBody = styled(CharBase)`
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: oklch(0.82 0.1 80);
`;
const KazeBody = styled(CharBase)`
  width: 74px;
  height: 84px;
  border-radius: 50%;
  background: oklch(0.75 0.06 160);
`;
const HoshiBody = styled(CharBase)`
  width: 80px;
  height: 80px;
  border-radius: 42% 42% 48% 48%;
  background: oklch(0.85 0.08 95);
`;

// ── Eye (static, pupils move via inline style) ──

const EyeWhite = styled.div`
  width: 22px;
  height: 24px;
  border-radius: 50%;
  background: oklch(0.98 0 0);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Pupil = styled.div`
  width: 10px;
  height: 11px;
  border-radius: 50%;
  background: oklch(0.18 0.005 0);
`;

const Blush = styled.div`
  width: 12px;
  height: 7px;
  border-radius: 50%;
  background: oklch(0.7 0.1 15 / 0.3);
  position: absolute;
`;

// ── Mouth variants ──

const Mouth = styled.div<{ $mood: string; $color: string }>`
  position: absolute;
  bottom: ${(p) => (p.$mood === "curious" ? "16px" : "18px")};
  left: 50%;
  transform: translateX(-50%);
  width: ${(p) => (p.$mood === "happy" ? "16px" : p.$mood === "sad" ? "12px" : p.$mood === "curious" ? "10px" : "14px")};
  height: ${(p) => (p.$mood === "happy" ? "7px" : p.$mood === "curious" ? "10px" : "4px")};
  border: 2px solid ${(p) => p.$color};
  border-top: ${(p) => (p.$mood === "curious" ? "2px solid " + p.$color : "none")};
  border-radius: ${(p) => (p.$mood === "curious" ? "50%" : p.$mood === "sad" ? "50% 50% 0 0" : "0 0 50% 50%")};
  ${(p) => p.$mood === "sad" && "transform: translateX(-50%) rotate(180deg);"}
`;

const NameTag = styled.span<{ $color: string }>`
  font-size: 11px;
  color: ${(p) => p.$color};
  letter-spacing: 0.06em;
`;

// ── Petal marks ──

const Petal = styled.div<{ $a: number }>`
  position: absolute;
  top: -10px;
  left: 50%;
  width: 12px;
  height: 14px;
  border-radius: 50% 0 50% 0;
  background: oklch(0.74 0.1 15);
  transform: translateX(-50%) rotate(${(p) => p.$a}deg);
  transform-origin: center 32px;
`;

const Ray = styled.div<{ $a: number }>`
  position: absolute;
  top: -13px;
  left: 50%;
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: oklch(0.78 0.1 75);
  transform: translateX(-50%) rotate(${(p) => p.$a}deg);
  transform-origin: center 36px;
`;

const Swirl = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  width: 16px;
  height: 16px;
  border: 2px solid oklch(0.65 0.05 155);
  border-radius: 50%;
  border-right-color: transparent;
  border-bottom-color: transparent;
  transform: translateX(-50%) rotate(-30deg);
`;

const Star = styled.span`
  position: absolute;
  font-size: 12px;
  color: oklch(0.78 0.1 85);
  line-height: 1;
`;

// ── Clamp helper ──

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ── Component ──

type Mood = "idle" | "happy" | "sad" | "curious";

interface EyeData {
  left: number;
  right: number;
  top: number;
  cx: number;
  cy: number;
}

function Character({
  Body,
  eyeL,
  eyeR,
  mouthColor,
  bodyColor,
  name,
  tiltX,
  tiltY,
  mood,
  delay,
  children,
}: {
  Body: typeof PinkBody;
  eyeL: EyeData;
  eyeR: EyeData;
  mouthColor: string;
  bodyColor: string;
  name: string;
  tiltX: number;
  tiltY: number;
  mood: Mood;
  delay: number;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pupilL, setPupilL] = useState({ x: 0, y: 0 });
  const [pupilR, setPupilR] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const calc = (cx: number, cy: number) => {
        const ex = r.left + r.width * cx;
        const ey = r.top + r.height * cy;
        return {
          x: clamp((e.clientX - ex) / (r.width * 0.25), -1, 1) * 3.5,
          y: clamp((e.clientY - ey) / (r.height * 0.25), -1, 1) * 3.5,
        };
      };
      setPupilL(calc(eyeL.cx, eyeL.cy));
      setPupilR(calc(eyeR.cx, eyeR.cy));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [eyeL, eyeR]);

  return (
    <FloatWrap $delay={delay}>
      <TiltWrap $tx={tiltX} $ty={tiltY} ref={ref}>
        <Body>
          {children}
          <EyeWhite style={{ left: eyeL.left, top: eyeL.top }}>
            <Pupil style={{ transform: `translate(${pupilL.x}px, ${pupilL.y}px)` }} />
          </EyeWhite>
          <EyeWhite style={{ left: eyeR.left, top: eyeR.top }}>
            <Pupil style={{ transform: `translate(${pupilR.x}px, ${pupilR.y}px)` }} />
          </EyeWhite>
          <Blush style={{ left: eyeL.left - 4, top: eyeL.top + 12 }} />
          <Blush style={{ left: eyeR.left - 4, top: eyeR.top + 12 }} />
          <Mouth $mood={mood} $color={mouthColor} />
        </Body>
        <NameTag $color={bodyColor}>{name}</NameTag>
      </TiltWrap>
    </FloatWrap>
  );
}

export default function SpiritDemo() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [mood, setMood] = useState<Mood>("idle");

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const tx = mouse.y * 2 - 1;
  const ty = -(mouse.x * 2 - 1);

  return (
    <Page>
      <Hint>移动鼠标试试 &middot; 眼睛会跟着光标走</Hint>
      <Row>
        <Character
          Body={PinkBody}
          eyeL={{ left: 20, right: 0, top: 28, cx: 0.28, cy: 0.4 }}
          eyeR={{ left: 0, right: 20, top: 28, cx: 0.72, cy: 0.4 }}
          mouthColor="oklch(0.5 0.08 15)"
          bodyColor="oklch(0.7 0.1 15)"
          name="樱花"
          tiltX={tx}
          tiltY={ty}
          mood={mood}
          delay={0}
        >
          {[0, 72, 144, 216, 288].map((a) => (
            <Petal key={a} $a={a} />
          ))}
        </Character>

        <Character
          Body={HikariBody}
          eyeL={{ left: 18, right: 0, top: 26, cx: 0.28, cy: 0.38 }}
          eyeR={{ left: 0, right: 18, top: 26, cx: 0.72, cy: 0.38 }}
          mouthColor="oklch(0.55 0.08 70)"
          bodyColor="oklch(0.72 0.1 75)"
          name="光"
          tiltX={tx}
          tiltY={ty}
          mood={mood}
          delay={0.3}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <Ray key={a} $a={a} />
          ))}
        </Character>

        <Character
          Body={KazeBody}
          eyeL={{ left: 17, right: 0, top: 30, cx: 0.28, cy: 0.42 }}
          eyeR={{ left: 0, right: 17, top: 30, cx: 0.72, cy: 0.42 }}
          mouthColor="oklch(0.48 0.04 150)"
          bodyColor="oklch(0.62 0.06 155)"
          name="风"
          tiltX={tx}
          tiltY={ty}
          mood={mood}
          delay={0.6}
        >
          <Swirl />
        </Character>

        <Character
          Body={HoshiBody}
          eyeL={{ left: 19, right: 0, top: 28, cx: 0.3, cy: 0.4 }}
          eyeR={{ left: 0, right: 19, top: 28, cx: 0.7, cy: 0.4 }}
          mouthColor="oklch(0.55 0.06 85)"
          bodyColor="oklch(0.72 0.08 90)"
          name="星"
          tiltX={tx}
          tiltY={ty}
          mood={mood}
          delay={0.9}
        >
          <Star style={{ top: 6, left: 14 }}>✦</Star>
          <Star style={{ top: 8, left: 52 }}>✦</Star>
        </Character>
      </Row>

      <div style={{ display: "flex", gap: 12 }}>
        {(["idle", "curious", "happy", "sad"] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            style={{
              padding: "8px 18px",
              border: `1px solid ${mood === m ? "oklch(0.72 0.12 10 / 0.5)" : "oklch(0.5 0.02 0 / 0.3)"}`,
              borderRadius: 8,
              background: mood === m ? "oklch(0.22 0.01 0 / 0.6)" : "oklch(0.15 0.005 0 / 0.4)",
              color: mood === m ? "oklch(0.9 0.01 0)" : "oklch(0.6 0.02 0)",
              cursor: "pointer",
              fontSize: 12,
              letterSpacing: "0.04em",
            }}
          >
            {m === "idle" ? "通常" : m === "curious" ? "好奇" : m === "happy" ? "开心" : "难过"}
          </button>
        ))}
      </div>
    </Page>
  );
}
