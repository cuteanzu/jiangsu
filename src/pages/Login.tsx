import { useState, useEffect, useRef, useCallback, Component } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { Eye, EyeOff } from "lucide-react";
import { createSeasonalFX } from "seasonalfx";
import type { ISeasonalFX } from "seasonalfx";
import { useSettings } from "../settings-context";
import Bokeh from "../Bokeh";
import Komorebi from "../Komorebi";
import GroundPetals from "../GroundPetals";
import DeskPet from "../DeskPet";
import bgImage from "/bg.webp";

// ── Petal texture ──

function createPetalImage(): string {
  const size = 48;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const h = size / 2;
  ctx.save();
  ctx.translate(h, h);
  // Plum blossom petal — broad oval, no notch
  const grad = ctx.createRadialGradient(0, -h * 0.1, h * 0.03, 0, h * 0.05, h * 0.9);
  grad.addColorStop(0, "rgba(255,242,245,1)");
  grad.addColorStop(0.15, "rgba(255,220,230,0.95)");
  grad.addColorStop(0.45, "rgba(245,190,205,0.7)");
  grad.addColorStop(0.75, "rgba(235,155,175,0.3)");
  grad.addColorStop(1, "rgba(220,125,150,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.12, h * 0.52, h * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return c.toDataURL("image/png");
}

const petalImg = createPetalImage();

// ── Animations ──

const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 50%, 90% { transform: translateX(-4px); }
  30%, 70% { transform: translateX(4px); }
`;

const popIn = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const InlineKeyframes = createGlobalStyle`
  @keyframes blinkAnim {
    0%, 100% { transform: scaleY(1); }
    30% { transform: scaleY(0.05); }
    60% { transform: scaleY(1); }
  }
`;

const transitionFade = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const TransitionOverlay = styled.div<{ $active: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  background: radial-gradient(ellipse 55% 45% at 50% 48%, rgba(255,252,247,0.94) 0%, rgba(253,242,235,0.88) 40%, rgba(240,236,245,0.70) 100%);
  transition: opacity 0.35s ease;
  animation: ${(p) => (p.$active ? transitionFade : "none")} 0.35s ease both;
`;

// ── Scene ──

const Wrapper = styled.div<{ $px: number; $py: number; $strength: number }>`
  width: 100vw; height: 100vh;
  position: relative; overflow: hidden;
  background: url(${bgImage}) center / cover no-repeat;
  background-position: ${(p) => 50 + p.$px * p.$strength * 3}% ${(p) => 50 + p.$py * p.$strength * 2}%;
`;

const FXLayer = styled.div`
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
`;

const VignetteOverlay = styled.div<{ $opacity: number }>`
  position: absolute; inset: 0; pointer-events: none; z-index: 2;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(8, 4, 6, ${(p) => p.$opacity}) 100%);
`;

// ── Card ──

const CardLayer = styled.div`
  position: absolute; inset: 0; z-index: 15;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
`;

const Card = styled.div`
  display: flex;
  width: 820px; height: 540px;
  border-radius: 20px;
  overflow: hidden;
  background: oklch(0.94 0.01 20 / 0.75);
  backdrop-filter: blur(24px);
  border: 1px solid oklch(0.9 0.02 20 / 0.3);
  box-shadow: 0 16px 60px rgba(0,0,0,0.15);
  pointer-events: auto;
  animation: ${fadeUp} 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

// ── Character stage ──

const CharStage = styled.div`
  flex: 0 0 400px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, oklch(0.7 0.15 10 / 0.55), oklch(0.68 0.16 15 / 0.65), oklch(0.65 0.15 20 / 0.55));
`;

const StageGrid = styled.div`
  position: absolute; inset: 0; z-index: 1;
  background-image:
    linear-gradient(oklch(1 0 0 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, oklch(1 0 0 / 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
`;

const DecorCircle1 = styled.div`
  position: absolute; top: 25%; right: 25%;
  width: 180px; height: 180px; border-radius: 50%;
  background: oklch(1 0 0 / 0.08);
  filter: blur(40px); pointer-events: none;
`;

const DecorCircle2 = styled.div`
  position: absolute; bottom: 25%; left: 25%;
  width: 240px; height: 240px; border-radius: 50%;
  background: oklch(1 0 0 / 0.04);
  filter: blur(48px); pointer-events: none;
`;

const BrandRow = styled.div`
  position: absolute; top: 24px; left: 24px; z-index: 20;
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 500; color: oklch(0.95 0.01 0);
  letter-spacing: 0.04em;
`;

const BrandIcon = styled.div`
  width: 30px; height: 30px; border-radius: 8px;
  background: oklch(0.98 0 0 / 0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
`;

const FooterLinks = styled.div`
  position: absolute; bottom: 20px; left: 24px; z-index: 20;
  display: flex; gap: 20px;
  font-size: 11px; color: oklch(0.92 0.01 0 / 0.5);
  a { color: inherit; text-decoration: none; }
  a:hover { color: oklch(1 0 0); }
`;

const SpiritGuideCard = styled.div<{ $color: string }>`
  position: absolute;
  top: 68px;
  left: 24px;
  right: 24px;
  z-index: 22;
  min-height: 112px;
  padding: 16px 16px 14px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 18px;
  background:
    radial-gradient(circle at 16% 20%, ${(p) => p.$color}44, transparent 34%),
    rgba(255, 255, 255, 0.12);
  color: #fff;
  box-shadow: 0 18px 44px rgba(42, 16, 36, 0.15);
  backdrop-filter: blur(18px) saturate(130%);
  pointer-events: none;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 9px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.86);
    font-size: 11px;
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  }

  h3 {
    margin: 10px 0 0;
    font-size: 21px;
    letter-spacing: 0.04em;
  }

  p {
    margin: 7px 0 0;
    color: rgba(255, 255, 255, 0.74);
    font-family: "Noto Sans SC", "PingFang SC", sans-serif;
    font-size: 12px;
    line-height: 1.65;
  }
`;

const SpiritStageHint = styled.div`
  position: absolute;
  left: 24px;
  right: 24px;
  top: 190px;
  z-index: 22;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  color: rgba(255, 255, 255, 0.72);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 11px;
  letter-spacing: 0.04em;
  pointer-events: none;
`;

const SpiritHalo = styled.div<{ $active: boolean; $color: string }>`
  position: absolute;
  inset: -9px;
  border: 1px solid ${(p) => (p.$active ? p.$color : "transparent")};
  border-radius: 34px;
  box-shadow: ${(p) => (p.$active ? `0 0 0 6px ${p.$color}18, 0 0 34px ${p.$color}55` : "none")};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  pointer-events: none;
`;

// ── Form ──

const FormPanel = styled.div`
  flex: 1;
  display: flex; flex-direction: column; justify-content: center;
  padding: 48px 40px;
  background: transparent;
`;

const Title = styled.h2`
  font-size: 24px; font-weight: 500; margin: 0; letter-spacing: 0.02em;
  color: oklch(0.25 0.02 20);
`;

const Subtitle = styled.p`
  font-size: 13px; color: oklch(0.5 0.02 20); margin: 4px 0 28px;
`;

const Field = styled.div`
  margin-bottom: 14px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px; font-weight: 500; color: oklch(0.4 0.02 20);
  margin-bottom: 5px; letter-spacing: 0.02em;
`;

const Input = styled.input`
  width: 100%; padding: 11px 14px;
  border: 1px solid oklch(0.85 0.02 20 / 0.4); border-radius: 10px;
  background: oklch(0.97 0.005 20 / 0.6);
  color: oklch(0.25 0.01 20); font-size: 13px;
  outline: none; box-sizing: border-box;
  transition: border-color 0.3s, box-shadow 0.3s;
  &::placeholder { color: oklch(0.6 0.02 20); }
  &:focus {
    border-color: oklch(0.7 0.13 10 / 0.6);
    box-shadow: 0 0 0 3px oklch(0.7 0.13 10 / 0.1);
  }
`;

const PwdWrap = styled.div` position: relative; `;

const EyeToggle = styled.button`
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; padding: 4px;
  color: oklch(0.5 0.02 20); cursor: pointer;
  display: flex; align-items: center;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  &:hover { color: oklch(0.3 0.03 20); background: oklch(0.85 0.02 20 / 0.3); }
`;

const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18px; font-size: 12px;
`;

const CheckLabel = styled.label`
  display: flex; align-items: center; gap: 6px;
  color: oklch(0.5 0.02 20); cursor: pointer; font-size: 12px;
`;

const Checkbox = styled.input`
  width: 15px; height: 15px;
  accent-color: oklch(0.7 0.13 10);
  cursor: pointer;
`;

const Link = styled.span`
  color: oklch(0.65 0.12 10); cursor: pointer; font-size: 12px; font-weight: 500;
  &:hover { color: oklch(0.6 0.14 12); }
`;

const LoginBtn = styled.button<{ $shaking: boolean; $hovered: boolean }>`
  width: 100%; padding: 11px;
  border: none; border-radius: 10px;
  background: oklch(0.7 0.15 10); color: oklch(0.98 0 0);
  font-size: 14px; font-weight: 500; cursor: pointer; letter-spacing: 0.03em;
  transition: all 0.3s;
  animation: ${(p) => p.$shaking ? shakeAnim : p.$hovered ? popIn : "none"}
    ${(p) => p.$shaking ? "0.5s ease-in-out" : p.$hovered ? "0.35s ease-out both" : ""};
  &:hover { background: oklch(0.67 0.16 12); transform: scale(1.02); }
  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ErrorMsg = styled.p`
  color: oklch(0.55 0.18 20); font-size: 12px; text-align: center;
  margin: 10px 0 0; min-height: 18px;
`;

const Divider = styled.div`
  display: flex; align-items: center; gap: 10px;
  margin: 18px 0; font-size: 11px; color: oklch(0.55 0.02 20);
  &::before, &::after { content: ''; flex: 1; height: 1px; background: oklch(0.8 0.02 20 / 0.3); }
`;

const GoogleBtn = styled.button`
  width: 100%; padding: 10px;
  border: 1px solid oklch(0.8 0.02 20 / 0.3); border-radius: 10px;
  background: oklch(0.96 0.005 20 / 0.5); color: oklch(0.35 0.02 20);
  font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.3s;
  &:hover { background: oklch(0.92 0.01 20 / 0.6); border-color: oklch(0.7 0.02 20 / 0.4); }
`;

const RegisterHint = styled.p`
  text-align: center; font-size: 12px; color: oklch(0.5 0.02 20); margin-top: 18px;
`;

// ── Helper ──

function cl(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ── Eye components ──

interface PupilCompProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

function PupilComp({ size = 12, maxDistance = 5, pupilColor = "#2D2D2D", forceLookX, forceLookY }: PupilCompProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      if (forceLookX !== undefined && forceLookY !== undefined) {
        setPos({ x: forceLookX, y: forceLookY });
        return;
      }
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
      const a = Math.atan2(dy, dx);
      setPos({ x: Math.cos(a) * d, y: Math.sin(a) * d });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [maxDistance, forceLookX, forceLookY]);

  const sparkleSize = Math.max(1.5, Math.round(size * 0.18));

  return (
    <div
      ref={ref}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        backgroundColor: pupilColor,
        transform: "translate(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px)",
        transition: "transform 0.08s ease-out",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute",
        top: Math.round(size * 0.1),
        right: Math.round(size * 0.14),
        width: sparkleSize,
        height: sparkleSize,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.8)",
      }} />
    </div>
  );
}

interface EyeBallCompProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

function EyeBallComp({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "#2D2D2D", isBlinking = false, forceLookX, forceLookY }: EyeBallCompProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      if (forceLookX !== undefined && forceLookY !== undefined) {
        setPos({ x: forceLookX, y: forceLookY });
        return;
      }
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
      const a = Math.atan2(dy, dx);
      setPos({ x: Math.cos(a) * d, y: Math.sin(a) * d });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [maxDistance, forceLookX, forceLookY]);

  const sparkleSize = Math.max(2, Math.round(pupilSize * 0.22));

  return (
    <div
      ref={ref}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        backgroundColor: eyeColor,
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid " + pupilColor + "22",
        boxShadow: "inset 0 1px 2px " + pupilColor + "18",
        animation: isBlinking ? "blinkAnim 0.18s ease-in-out" : "none",
      }}
    >
      <div
        style={{
          width: pupilSize, height: pupilSize,
          borderRadius: "50%",
          backgroundColor: pupilColor,
          transform: "translate(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px)",
          transition: "transform 0.08s ease-out",
          position: "relative",
        }}
      >
        {/* Sparkle highlight */}
        <div style={{
          position: "absolute",
          top: Math.round(pupilSize * 0.12),
          right: Math.round(pupilSize * 0.15),
          width: sparkleSize,
          height: sparkleSize,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.85)",
        }} />
      </div>
    </div>
  );
}

// ── Character dimensions (scaled from ref 550px → 400px = 0.727) ──

const SCALE = 400 / 550;

const PURPLE = { w: Math.round(180 * SCALE), h: Math.round(400 * SCALE), hTall: Math.round(440 * SCALE), left: Math.round(90 * SCALE) };
const BLACK = { w: Math.round(120 * SCALE), h: Math.round(310 * SCALE), left: Math.round(230 * SCALE) };
const ORANGE = { w: Math.round(240 * SCALE), h: Math.round(200 * SCALE), left: 0 };
const YELLOW = { w: Math.round(140 * SCALE), h: Math.round(230 * SCALE), left: Math.round(290 * SCALE) };

const PEYE = 24;
const PPUP = 10;
const BEYE = 22;
const BPUP = 9;
const OPUP = 16;
const YPUP = 16;

// Proximity stretch config
const STRETCH_RADIUS = 250; // px — mouse within this distance triggers stretch
const STRETCH_MAX = 0.28;   // max height stretch ratio
interface PointerPoint {
  x: number;
  y: number;
}

interface CharacterPose {
  faceX: number;
  faceY: number;
  bodySkew: number;
  stretch: number;
}

const neutralPose: CharacterPose = { faceX: 0, faceY: 0, bodySkew: 0, stretch: 0 };

type SpiritId = "purple" | "black" | "orange" | "yellow";

const spiritGuides: Record<SpiritId, { name: string; title: string; description: string; color: string }> = {
  purple: {
    name: "地图探索",
    title: "带你从江苏地图开始",
    description: "点击后进入城市和高校分布，这是网站当前最完整的主线能力。",
    color: "#9b7af5",
  },
  black: {
    name: "高校档案",
    title: "整理学校的关键信息",
    description: "学校层次、城市、建校时间、官网和展览详情会在这里逐步完善。",
    color: "#2d2d2d",
  },
  orange: {
    name: "经验分享",
    title: "后续接入真实学生经验",
    description: "未来可以放学长学姐投稿，让选校从数据变成真实生活参考。",
    color: "#ff9b6b",
  },
  yellow: {
    name: "生活指北",
    title: "关注宿舍、食堂和交通",
    description: "这一块会承接全面升级规划，补齐更有用的校园生活内容。",
    color: "#e8d754",
  },
};

function readCharacterPose(element: HTMLDivElement | null, pointer: PointerPoint, baseH: number): CharacterPose {
  if (!element) return neutralPose;
  const r = element.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 3;
  const dx = pointer.x - cx;
  const dy = pointer.y - cy;
  const stretchDistance = dist(pointer.x, pointer.y, cx, r.top + r.height * 0.4);
  return {
    faceX: cl(dx / 20, -15, 15),
    faceY: cl(dy / 30, -10, 10),
    bodySkew: cl(-dx / 120, -6, 6),
    stretch: Math.max(0, 1 - stretchDistance / STRETCH_RADIUS) * STRETCH_MAX * baseH,
  };
}

// ── Local error boundary for character stage ──

class StageErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ flex: "0 0 400px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, oklch(0.7 0.15 10 / 0.55), oklch(0.65 0.15 20 / 0.55))", color: "white", fontFamily: "monospace", fontSize: 11, padding: 20, textAlign: "center" }}>
          <div>
            <p style={{ fontWeight: 600 }}>Character error</p>
            <p style={{ opacity: 0.7, fontSize: 10 }}>{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main ──

export default function Login() {
  const nav = useNavigate();
  const { s } = useSettings();

  // Scene
  const fxRef = useRef<HTMLDivElement>(null);
  const fxInstanceRef = useRef<ISeasonalFX | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [activeSpirit, setActiveSpirit] = useState<SpiritId>("purple");

  // Character states
  const [isTyping, setIsTyping] = useState(false);
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false);
  const [purplePeeking, setPurplePeeking] = useState(false);
  const [purpleBlinking, setPurpleBlinking] = useState(false);
  const [blackBlinking, setBlackBlinking] = useState(false);
  const [characterPose, setCharacterPose] = useState({
    purple: neutralPose,
    black: neutralPose,
    orange: neutralPose,
    yellow: neutralPose,
  });

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Breath
  const [breathT, setBreathT] = useState(0);

  // Refs
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);

  // Mouse tracking. The characters now keep one stable transform source;
  // click feedback uses highlight state instead of competing keyframe transforms.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x: mx, y: my });

      const pointer = { x: e.clientX, y: e.clientY };
      setCharacterPose({
        purple: readCharacterPose(purpleRef.current, pointer, PURPLE.h),
        black: readCharacterPose(blackRef.current, pointer, BLACK.h),
        orange: readCharacterPose(orangeRef.current, pointer, ORANGE.h),
        yellow: readCharacterPose(yellowRef.current, pointer, YELLOW.h),
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, []);

  // SeasonalFX
  useEffect(() => {
    if (!fxRef.current) return;
    const fx = createSeasonalFX({
      target: fxRef.current,
      season: "spring",
      seasonConfig: { spring: { variant: "softPetals", intensity: s.petalIntensity } },
      particleCustomization: {
        sizeMultiplier: s.petalSize,
        speedMultiplier: s.petalSpeed,
        customImage: petalImg,
        imageMode: "contain",
      },
      respectReducedMotion: true,
    });
    fx.start();
    fxInstanceRef.current = fx;
    return () => { fx.destroy(); };
  }, [s.petalIntensity, s.petalSize, s.petalSpeed]);

  // Breathing animation (throttled to ~8fps)
  useEffect(() => {
    const id = setInterval(() => {
      setBreathT(performance.now());
    }, 120);
    return () => clearInterval(id);
  }, []);

  // Random blinking
  useEffect(() => {
    const schedule = (setter: (v: boolean) => void) => {
      const blink = () => {
        setter(true);
        setTimeout(() => setter(false), 150);
        timer = setTimeout(blink, Math.random() * 4000 + 3000);
      };
      let timer = setTimeout(blink, Math.random() * 3000 + 2000);
      return () => clearTimeout(timer);
    };
    const c1 = schedule(setPurpleBlinking);
    const c2 = schedule(setBlackBlinking);
    return () => { c1(); c2(); };
  }, []);

  const handleEmailFocus = useCallback(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setIsTyping(true);
    setLookingAtEachOther(true);
    typingTimer.current = setTimeout(() => setLookingAtEachOther(false), 800);
  }, []);

  const handleEmailBlur = useCallback(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = null;
    setIsTyping(false);
    setLookingAtEachOther(false);
  }, []);

  // Password peeking
  const isPwdVisible = showPwd && password.length > 0;
  useEffect(() => {
    if (!isPwdVisible) return;
    const schedule = () => {
      const peek = () => {
        setPurplePeeking(true);
        setTimeout(() => setPurplePeeking(false), 800);
        timer = setTimeout(peek, Math.random() * 3000 + 2000);
      };
      let timer = setTimeout(peek, Math.random() * 2000 + 1000);
      return () => clearTimeout(timer);
    };
    return schedule();
  }, [isPwdVisible, password, showPwd]);

  const purplePos = characterPose.purple;
  const blackPos = characterPose.black;
  const orangePos = characterPose.orange;
  const yellowPos = characterPose.yellow;
  const activeSpiritInfo = spiritGuides[activeSpirit];

  // Transition — simple fade, no SVG outline
  const [transitioning, setTransitioning] = useState(false);

  function startTransition() {
    setTransitioning(true);
    setTimeout(() => nav("/home"), 420);
  }

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("先输入邮箱和密码，再进入校园入口");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      startTransition();
    }, 400);
  };

  const handleSpiritClick = useCallback((spirit: SpiritId, event?: React.MouseEvent<HTMLDivElement>) => {
    event?.stopPropagation();
    setActiveSpirit(spirit);
  }, []);

  const handleSpiritKey = useCallback((spirit: SpiritId, event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setActiveSpirit(spirit);
  }, []);

  // ── Character render helper ──

  const idleBreath = (phase: number, charIdx: number): number => {
    // Slightly different frequency per character
    const freq = [0.0018, 0.0021, 0.0015, 0.0024][charIdx];
    return Math.sin(phase * freq + charIdx * 1.2) * 0.02;
  };

  return (
    <Wrapper $px={mouse.x} $py={mouse.y} $strength={s.parallaxStrength}>
      <FXLayer ref={fxRef} />
      <Bokeh />
      <Komorebi />
      <GroundPetals />
      <VignetteOverlay $opacity={s.vignetteOpacity} />
      <DeskPet />
      <InlineKeyframes />

      <CardLayer>
        <Card>
          {/* ── Left: Character Stage ── */}
          <CharStage>
            <StageErrorBoundary>
            <StageGrid />
            <DecorCircle1 />
            <DecorCircle2 />

            <BrandRow>
              <BrandIcon>◎</BrandIcon>
              江苏高校生活指北
            </BrandRow>

            <SpiritGuideCard $color={activeSpiritInfo.color}>
              <span>{activeSpiritInfo.name}</span>
              <h3>{activeSpiritInfo.title}</h3>
              <p>{activeSpiritInfo.description}</p>
            </SpiritGuideCard>

            <SpiritStageHint>点击四个小精灵，查看它们负责的网站能力</SpiritStageHint>

            <FooterLinks>
              <a href="#">隐私政策</a>
              <a href="#">服务条款</a>
              <a href="#">联系</a>
            </FooterLinks>

            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 400, height: 310 }}>

                {/* Char 0 — Purple (tall rectangle) */}
                <div
                  ref={purpleRef}
                  role="button"
                  tabIndex={0}
                  aria-label={spiritGuides.purple.title}
                  onClick={(event) => handleSpiritClick("purple", event)}
                  onKeyDown={(event) => handleSpiritKey("purple", event)}
                  style={{
                    position: "absolute", bottom: 0, left: PURPLE.left,
                    width: PURPLE.w, zIndex: 1,
                    cursor: "pointer",
                    outline: "none",
                    filter: activeSpirit === "purple" ? "drop-shadow(0 0 26px rgba(155,122,245,0.5))" : "drop-shadow(0 12px 18px rgba(40,10,80,0.12))",
                    transform: (() => {
                      const lean = isPwdVisible ? 0
                        : (isTyping || (password.length > 0 && !showPwd)) ? (purplePos.bodySkew || 0) * 0.8 - 8
                        : submitHovered ? (purplePos.bodySkew || 0) * 0.8 - 3
                        : (purplePos.bodySkew || 0) * 0.8;
                      const tx = (isTyping || (password.length > 0 && !showPwd)) ? 30 : 0;
                      const breath = 1 + idleBreath(breathT, 0);
                      const stretch = 1 + purplePos.stretch / PURPLE.h;
                      return "skewX(" + lean.toFixed(1) + "deg) translateX(" + tx + "px) scaleY(" + (breath * stretch).toFixed(3) + ")";
                    })(),
                    transformOrigin: "bottom center",
                    transition: "transform 0.7s ease-in-out, filter 0.22s ease, opacity 0.22s ease",
                  } as React.CSSProperties}
                >
                  <SpiritHalo $active={activeSpirit === "purple"} $color={spiritGuides.purple.color} />
                  <div style={{
                    width: "100%",
                    height: isTyping ? PURPLE.hTall : PURPLE.h,
                    borderRadius: "30px 30px 14px 14px",
                    background: "linear-gradient(135deg, #9B7AF5 0%, #6C3FF5 30%, #5530D0 100%)",
                    transition: "height 0.7s ease-in-out",
                    boxShadow: "0 0 40px rgba(108,63,245,0.10), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }} />
                  <div style={{
                    position: "absolute", display: "flex", gap: PEYE * 1.4,
                    left: "50%",
                    transform: (() => {
                      const ex = isPwdVisible ? (purplePeeking ? 4 : -4) : (lookingAtEachOther ? 3 : purplePos.faceX * 0.3);
                      const ey = isPwdVisible ? (purplePeeking ? 5 : -4) : (lookingAtEachOther ? 4 : purplePos.faceY * 0.3);
                      return "translateX(-50%) translate(" + ex.toFixed(1) + "px," + ey.toFixed(1) + "px)";
                    })(),
                    top: PURPLE.h * 0.18,
                    transition: "all 0.7s ease-in-out",
                  }}>
                    <EyeBallComp size={PEYE} pupilSize={PPUP} maxDistance={Math.round(PEYE * 0.35)} isBlinking={purpleBlinking}
                      forceLookX={isPwdVisible ? (purplePeeking ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
                      forceLookY={isPwdVisible ? (purplePeeking ? 5 : -4) : lookingAtEachOther ? 4 : undefined} />
                    <EyeBallComp size={PEYE} pupilSize={PPUP} maxDistance={Math.round(PEYE * 0.35)} isBlinking={purpleBlinking}
                      forceLookX={isPwdVisible ? (purplePeeking ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
                      forceLookY={isPwdVisible ? (purplePeeking ? 5 : -4) : lookingAtEachOther ? 4 : undefined} />
                    <div style={{ position: "absolute", left: -(PEYE * 0.6), top: PEYE * 0.5, width: PEYE * 0.5, height: PEYE * 0.28, borderRadius: "50%", background: "rgba(255,150,140,0.25)", filter: "blur(2px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", right: -(PEYE * 0.6), top: PEYE * 0.5, width: PEYE * 0.5, height: PEYE * 0.28, borderRadius: "50%", background: "rgba(255,150,140,0.25)", filter: "blur(2px)", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Char 1 — Black (medium rectangle) */}
                <div
                  ref={blackRef}
                  role="button"
                  tabIndex={0}
                  aria-label={spiritGuides.black.title}
                  onClick={(event) => handleSpiritClick("black", event)}
                  onKeyDown={(event) => handleSpiritKey("black", event)}
                  style={{
                    position: "absolute", bottom: 0, left: BLACK.left,
                    width: BLACK.w, zIndex: 2,
                    cursor: "pointer",
                    outline: "none",
                    filter: activeSpirit === "black" ? "drop-shadow(0 0 22px rgba(255,255,255,0.42))" : "drop-shadow(0 12px 18px rgba(0,0,0,0.14))",
                    transform: (() => {
                      const lean = isPwdVisible ? 0
                        : lookingAtEachOther ? (blackPos.bodySkew || 0) * 0.5 + 6
                        : (isTyping || (password.length > 0 && !showPwd)) ? (blackPos.bodySkew || 0) * 0.7
                        : submitHovered ? (blackPos.bodySkew || 0) * 0.7 - 3
                        : (blackPos.bodySkew || 0) * 0.7;
                      const tx = lookingAtEachOther ? 15 : 0;
                      const breath = 1 + idleBreath(breathT, 1);
                      const stretch = 1 + blackPos.stretch / BLACK.h;
                      return "skewX(" + lean.toFixed(1) + "deg) translateX(" + tx + "px) scaleY(" + (breath * stretch).toFixed(3) + ")";
                    })(),
                    transformOrigin: "bottom center",
                    transition: "transform 0.7s ease-in-out, filter 0.22s ease, opacity 0.22s ease",
                  } as React.CSSProperties}
                >
                  <SpiritHalo $active={activeSpirit === "black"} $color="rgba(255,255,255,0.78)" />
                  <div style={{
                    width: "100%",
                    height: BLACK.h,
                    borderRadius: "22px 22px 10px 10px",
                    background: "linear-gradient(135deg, #4A4A4A 0%, #2D2D2D 35%, #1A1A1A 100%)",
                    transition: "height 0.7s ease-in-out",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }} />
                  <div style={{
                    position: "absolute", display: "flex", gap: BEYE * 1.3,
                    left: "50%",
                    transform: (() => {
                      const ex = isPwdVisible ? -4 : (lookingAtEachOther ? 0 : blackPos.faceX * 0.3);
                      const ey = isPwdVisible ? -4 : (lookingAtEachOther ? -4 : blackPos.faceY * 0.3);
                      return "translateX(-50%) translate(" + ex.toFixed(1) + "px," + ey.toFixed(1) + "px)";
                    })(),
                    top: BLACK.h * 0.2,
                    transition: "all 0.7s ease-in-out",
                  }}>
                    <EyeBallComp size={BEYE} pupilSize={BPUP} maxDistance={Math.round(BEYE * 0.35)} isBlinking={blackBlinking}
                      forceLookX={isPwdVisible ? -4 : lookingAtEachOther ? 0 : undefined}
                      forceLookY={isPwdVisible ? -4 : lookingAtEachOther ? -4 : undefined} />
                    <EyeBallComp size={BEYE} pupilSize={BPUP} maxDistance={Math.round(BEYE * 0.35)} isBlinking={blackBlinking}
                      forceLookX={isPwdVisible ? -4 : lookingAtEachOther ? 0 : undefined}
                      forceLookY={isPwdVisible ? -4 : lookingAtEachOther ? -4 : undefined} />
                    <div style={{ position: "absolute", left: -(BEYE * 0.6), top: BEYE * 0.5, width: BEYE * 0.5, height: BEYE * 0.28, borderRadius: "50%", background: "rgba(255,150,140,0.22)", filter: "blur(2px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", right: -(BEYE * 0.6), top: BEYE * 0.5, width: BEYE * 0.5, height: BEYE * 0.28, borderRadius: "50%", background: "rgba(255,150,140,0.22)", filter: "blur(2px)", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Char 2 — Orange (semi-circle, pupil-only eyes) */}
                <div
                  ref={orangeRef}
                  role="button"
                  tabIndex={0}
                  aria-label={spiritGuides.orange.title}
                  onClick={(event) => handleSpiritClick("orange", event)}
                  onKeyDown={(event) => handleSpiritKey("orange", event)}
                  style={{
                    position: "absolute", bottom: 0, left: ORANGE.left,
                    width: ORANGE.w, zIndex: 5,
                    cursor: "pointer",
                    outline: "none",
                    filter: activeSpirit === "orange" ? "drop-shadow(0 0 24px rgba(255,155,107,0.52))" : "drop-shadow(0 12px 18px rgba(120,50,20,0.12))",
                    transform: (() => {
                      const lean = isPwdVisible ? 0 : submitHovered ? (orangePos.bodySkew || 0) * 0.6 - 2 : (orangePos.bodySkew || 0) * 0.6;
                      const breath = 1 + idleBreath(breathT, 2);
                      const stretch = 1 + orangePos.stretch / ORANGE.h;
                      return "skewX(" + lean.toFixed(1) + "deg) scaleY(" + (breath * stretch).toFixed(3) + ")";
                    })(),
                    transformOrigin: "bottom center",
                    transition: "transform 0.7s ease-in-out, filter 0.22s ease, opacity 0.22s ease",
                  } as React.CSSProperties}
                >
                  <SpiritHalo $active={activeSpirit === "orange"} $color={spiritGuides.orange.color} />
                  <div style={{
                    width: "100%",
                    height: ORANGE.h,
                    borderRadius: "50% 50% 0 0",
                    background: "linear-gradient(135deg, #FFC0A0 0%, #FF9B6B 40%, #F0885A 100%)",
                    transition: "height 0.7s ease-in-out",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                  }} />
                  <div style={{
                    position: "absolute", display: "flex", gap: OPUP * 2.5,
                    left: "50%",
                    transform: (() => {
                      const ex = isPwdVisible ? -4 : orangePos.faceX * 0.3;
                      const ey = isPwdVisible ? -3 : orangePos.faceY * 0.3;
                      return "translateX(-50%) translate(" + ex.toFixed(1) + "px," + ey.toFixed(1) + "px)";
                    })(),
                    top: ORANGE.h * 0.28,
                    transition: "all 0.2s ease-out",
                  }}>
                    <PupilComp size={OPUP} maxDistance={Math.round(OPUP * 0.6)} pupilColor="#3D1F0A"
                      forceLookX={isPwdVisible ? -5 : undefined} forceLookY={isPwdVisible ? -4 : undefined} />
                    <PupilComp size={OPUP} maxDistance={Math.round(OPUP * 0.6)} pupilColor="#3D1F0A"
                      forceLookX={isPwdVisible ? -5 : undefined} forceLookY={isPwdVisible ? -4 : undefined} />
                    <div style={{ position: "absolute", left: -(OPUP * 1.2), top: OPUP * 0.4, width: OPUP * 0.6, height: OPUP * 0.32, borderRadius: "50%", background: "rgba(255,140,130,0.22)", filter: "blur(2.5px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", right: -(OPUP * 1.2), top: OPUP * 0.4, width: OPUP * 0.6, height: OPUP * 0.32, borderRadius: "50%", background: "rgba(255,140,130,0.22)", filter: "blur(2.5px)", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Char 3 — Yellow (rounded top, pupil-only + mouth) */}
                <div
                  ref={yellowRef}
                  role="button"
                  tabIndex={0}
                  aria-label={spiritGuides.yellow.title}
                  onClick={(event) => handleSpiritClick("yellow", event)}
                  onKeyDown={(event) => handleSpiritKey("yellow", event)}
                  style={{
                    position: "absolute", bottom: 0, left: YELLOW.left,
                    width: YELLOW.w, zIndex: 4,
                    cursor: "pointer",
                    outline: "none",
                    filter: activeSpirit === "yellow" ? "drop-shadow(0 0 24px rgba(232,215,84,0.52))" : "drop-shadow(0 12px 18px rgba(120,105,20,0.12))",
                    transform: (() => {
                      const lean = isPwdVisible ? 0 : submitHovered ? (yellowPos.bodySkew || 0) * 0.6 - 2 : (yellowPos.bodySkew || 0) * 0.6;
                      const breath = 1 + idleBreath(breathT, 3);
                      const stretch = 1 + yellowPos.stretch / YELLOW.h;
                      return "skewX(" + lean.toFixed(1) + "deg) scaleY(" + (breath * stretch).toFixed(3) + ")";
                    })(),
                    transformOrigin: "bottom center",
                    transition: "transform 0.7s ease-in-out, filter 0.22s ease, opacity 0.22s ease",
                  } as React.CSSProperties}
                >
                  <SpiritHalo $active={activeSpirit === "yellow"} $color={spiritGuides.yellow.color} />
                  <div style={{
                    width: "100%",
                    height: YELLOW.h,
                    borderRadius: "50% 50% 10px 10px",
                    background: "linear-gradient(135deg, #F5ED90 0%, #E8D754 40%, #D4C040 100%)",
                    transition: "height 0.7s ease-in-out",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                  }} />
                  {/* Mouth */}
                  <div style={{
                    position: "absolute",
                    bottom: YELLOW.h * 0.15,
                    left: "50%",
                    width: YPUP * 1.6,
                    height: YPUP * 0.7,
                    borderRadius: "0 0 50% 50%",
                    border: "2px solid #8A7020",
                    borderTop: "none",
                    transform: "translateX(-50%)",
                  }} />
                  <div style={{
                    position: "absolute", display: "flex", gap: YPUP * 2.2,
                    left: "50%",
                    transform: (() => {
                      const ex = isPwdVisible ? -4 : yellowPos.faceX * 0.3;
                      const ey = isPwdVisible ? -3 : yellowPos.faceY * 0.3;
                      return "translateX(-50%) translate(" + ex.toFixed(1) + "px," + ey.toFixed(1) + "px)";
                    })(),
                    top: YELLOW.h * 0.22,
                    transition: "all 0.2s ease-out",
                  }}>
                    <PupilComp size={YPUP} maxDistance={Math.round(YPUP * 0.6)} pupilColor="#5A4A10"
                      forceLookX={isPwdVisible ? -5 : undefined} forceLookY={isPwdVisible ? -4 : undefined} />
                    <PupilComp size={YPUP} maxDistance={Math.round(YPUP * 0.6)} pupilColor="#5A4A10"
                      forceLookX={isPwdVisible ? -5 : undefined} forceLookY={isPwdVisible ? -4 : undefined} />
                    <div style={{ position: "absolute", left: -(YPUP * 1.2), top: YPUP * 0.4, width: YPUP * 0.6, height: YPUP * 0.32, borderRadius: "50%", background: "rgba(255,140,130,0.22)", filter: "blur(2.5px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", right: -(YPUP * 1.2), top: YPUP * 0.4, width: YPUP * 0.6, height: YPUP * 0.32, borderRadius: "50%", background: "rgba(255,140,130,0.22)", filter: "blur(2.5px)", pointerEvents: "none" }} />
                  </div>
                </div>

              </div>
            </div>
            </StageErrorBoundary>
          </CharStage>

          {/* ── Right: Form ── */}
          <FormPanel>
            <Title>欢迎回来</Title>
            <Subtitle>登录后进入江苏高校生活指北，继续探索你的校园路线</Subtitle>
            <form onSubmit={handleSubmit}>
              <Field>
                <Label>邮箱</Label>
                <Input
                  type="email" placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  autoComplete="off"
                />
              </Field>
              <Field>
                <Label>密码</Label>
                <PwdWrap>
                  <Input
                    type={showPwd ? "text" : "password"}
                    placeholder="输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <EyeToggle type="button" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </EyeToggle>
                </PwdWrap>
              </Field>
              <Row>
                <CheckLabel>
                  <Checkbox type="checkbox" defaultChecked />
                  记住我
                </CheckLabel>
                <Link>忘记密码？</Link>
              </Row>
              <LoginBtn
                type="submit"
                $shaking={shaking}
                $hovered={submitHovered}
                disabled={loading}
                onMouseEnter={() => setSubmitHovered(true)}
                onMouseLeave={() => setSubmitHovered(false)}
              >
                {loading ? "正在进入..." : "进入校园入口"}
              </LoginBtn>
              <ErrorMsg>{error}</ErrorMsg>
              <Divider>或者</Divider>
              <GoogleBtn type="button" onClick={startTransition}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                游客体验
              </GoogleBtn>
              <RegisterHint>
                还没有账号？ <Link>先以游客身份体验</Link>
              </RegisterHint>
            </form>
          </FormPanel>
        </Card>
      </CardLayer>
      {transitioning && <TransitionOverlay $active={transitioning} />}
    </Wrapper>
  );
}
