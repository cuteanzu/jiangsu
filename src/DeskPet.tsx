import { useState, useRef, useCallback, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// ── Lia images ──
const liaImages = [
  "/lia/calm.png",
  "/lia/archery.png",
  "/lia/happy.png",
  "/lia/dance.png",
];

// ── Animations ──

const idleFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const jumpAnim = keyframes`
  0% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-30px) scale(1.06, 0.94); }
  50% { transform: translateY(0) scale(0.95, 1.05); }
  75% { transform: translateY(-10px) scale(1.02, 0.98); }
  100% { transform: translateY(0) scale(1); }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
`;

const appear = keyframes`
  0% { opacity: 0; transform: translateY(10px) scale(0.8); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

// ── Full-size styled components ──

const Container = styled.div<{ $x: number; $y: number; $dragging: boolean; $jumping: boolean }>`
  position: fixed;
  left: ${(p) => p.$x}px;
  top: ${(p) => p.$y}px;
  z-index: 999;
  cursor: ${(p) => (p.$dragging ? "grabbing" : "grab")};
  animation: ${(p) => (p.$jumping ? jumpAnim : idleFloat)} ${(p) => (p.$jumping ? "0.7s" : "3.5s")} ease-in-out infinite;
  user-select: none;
  -webkit-user-drag: none;
  transition: ${(p) => (p.$dragging ? "none" : "left 0.5s ease-out, top 0.5s ease-out")};
  &:active { cursor: grabbing; }
`;

const PetImg = styled.img<{ $swaying: boolean }>`
  width: 110px;
  height: 110px;
  object-fit: contain;
  pointer-events: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
  animation: ${(p) => (p.$swaying ? sway : "none")} 0.5s ease-in-out;
`;

const Shadow = styled.div`
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 8px;
  background: rgba(0,0,0,0.12);
  border-radius: 50%;
  pointer-events: none;
`;

const Bubble = styled.div<{ $show: boolean; $guide: boolean }>`
  position: absolute;
  top: ${(p) => (p.$guide ? "-92px" : "-42px")};
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: ${(p) => (p.$guide ? "310px" : "240px")};
  background: ${(p) => (p.$guide ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.92)")};
  color: ${(p) => (p.$guide ? "#25306c" : "#6a9a6a")};
  font-size: 12px;
  line-height: 1.55;
  font-weight: ${(p) => (p.$guide ? 800 : 500)};
  padding: ${(p) => (p.$guide ? "11px 14px" : "5px 14px")};
  border: 1px solid ${(p) => (p.$guide ? "rgba(255,255,255,0.72)" : "transparent")};
  border-radius: ${(p) => (p.$guide ? "18px 18px 6px 18px" : "14px")};
  white-space: normal;
  text-align: left;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transition: opacity 0.35s;
  pointer-events: none;
  box-shadow: ${(p) => (p.$guide ? "0 18px 42px rgba(84,112,178,0.18)" : "0 2px 12px rgba(0,0,0,0.08)")};
  backdrop-filter: blur(18px);
  animation: ${(p) => (p.$show ? appear : "none")} 0.3s ease-out;

  strong {
    color: #c76b5e;
  }

  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${(p) => (p.$guide ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.92)")};
  }
`;

const ActionsList = styled.div`
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(180,150,130,0.18);
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: all;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #c76b5e;
  text-align: left;
  padding: 5px 2px;
  border-radius: 6px;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: rgba(199, 107, 94, 0.06);
    padding-left: 8px;
  }

  &::before {
    content: "→";
    font-size: 10px;
  }
`;

const EmojiBurst = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  font-size: 18px;
  pointer-events: none;
  animation: ${appear} 0.3s ease-out;
`;

// ── Compact mode styled components ──

const CompactAnchor = styled.button<{ $x: number; $y: number }>`
  position: fixed;
  left: ${(p) => p.$x}px;
  bottom: ${(p) => p.$y}px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.5px solid rgba(200, 170, 145, 0.3);
  background: rgba(255, 252, 247, 0.88);
  backdrop-filter: blur(14px);
  cursor: pointer;
  z-index: 998;
  box-shadow: 0 6px 22px rgba(130, 95, 60, 0.12);
  padding: 0;
  display: grid;
  place-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: ${idleFloat} 4s ease-in-out infinite;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 28px rgba(130, 95, 60, 0.18);
  }

  img {
    width: 34px;
    height: 34px;
    object-fit: contain;
    pointer-events: none;
  }
`;

const CompactBubble = styled.div<{ $show: boolean; $anchorX: number; $anchorY: number }>`
  position: fixed;
  left: ${(p) => p.$anchorX}px;
  bottom: ${(p) => p.$anchorY + 62}px;
  transform: translateX(calc(-50% + 24px));
  width: max-content;
  max-width: 260px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(200, 170, 145, 0.2);
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.55;
  color: #3a2f28;
  box-shadow: 0 14px 38px rgba(100, 70, 40, 0.12);
  backdrop-filter: blur(18px);
  opacity: ${(p) => (p.$show ? 1 : 0)};
  pointer-events: ${(p) => (p.$show ? "auto" : "none")};
  transition: opacity 0.25s ease;
  animation: ${(p) => (p.$show ? appear : "none")} 0.25s ease-out;
  z-index: 997;

  strong {
    color: #c76b5e;
  }

  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 24px;
    border: 6px solid transparent;
    border-top-color: rgba(255, 255, 255, 0.9);
  }
`;

// ── Messages ──

const messages = [
  "你好呀，冒险家~",
  "今天天气真好呢",
  "樱花好美啊",
  "诶嘿~",
  "一起加油吧！",
  "有什么需要帮忙的吗？",
  "♪ 哼着歌...",
  "好悠闲的一天呢",
  "要不要去冒险？",
  "喜欢这里~",
];

const emojis = ["✨", "💚", "🌸", "⭐", "🍃", "💫"];

// ── Scene-based guide messages ──

export type LiaScene = "home" | "map-province" | "map-city" | "map-school" | "search" | "exp" | "qa";

const sceneMessages: Record<LiaScene, string[]> = {
  home: [
    "点击地图上的城市，开启你的高校探索之旅~",
    "江苏有 78 所本科院校呢，从哪儿开始好呢？",
    "搜索城市名可以直接跳转哦",
  ],
  "map-province": [
    "这是江苏 13 座城市的高校分布，点一座城市看看吧",
    "南京高校最多哦，要不要去看看？",
    "每座城市的高校气质都不一样呢",
  ],
  "map-city": [
    "点击学校名字可以查看档案卡",
    "想了解哪所学校的校园生活？",
    "985、211、双一流……看看不同层级的学校吧",
  ],
  "map-school": [
    "这所学校的学科气质很特别呢",
    "点击查看详情可以看到更多校园信息",
    "喜欢的话就标记一下~",
  ],
  search: [
    "在搜索框输入城市名试试？",
    "或者直接点击地图上的城市也可以哦",
    "试试搜索「南京」~",
  ],
  exp: [
    "这些都是学长学姐的真实分享哦~",
    "点击卡片可以展开查看完整内容",
    "按城市筛选可以找到你关心的地方",
  ],
  qa: [
    "新生最关心的问题都在这里~",
    "点击问题查看过来人的回答",
    "你也可以在首页向莉雅提问哦",
  ],
};

// ── Component ──

export interface DeskPetAction {
  label: string;
  onClick: () => void;
}

interface DeskPetProps {
  guideMessage?: string;
  followMouse?: boolean;
  scene?: LiaScene;
  actions?: DeskPetAction[];
  preferredSide?: "left" | "right";
  /** Compact mode: small circular anchor button, not draggable */
  compact?: boolean;
}

export default function DeskPet({ guideMessage, followMouse = true, scene, actions, preferredSide = "right", compact = false }: DeskPetProps) {
  const [pos, setPos] = useState(() => ({
    x: preferredSide === "left" ? 20 : window.innerWidth - 170,
    y: window.innerHeight - 180,
  }));
  const [dragging, setDragging] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [swaying, setSwaying] = useState(false);
  const [bubble, setBubble] = useState("");
  const [emoji, setEmoji] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const [compactOpen, setCompactOpen] = useState(false);
  const dragRef = useRef({ ox: 0, oy: 0 });
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sceneInitRef = useRef(false);

  const showBubble = useCallback((msg: string) => {
    setBubble(msg);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(""), 2800);
  }, []);

  const showEmoji = useCallback((e: string) => {
    setEmoji(e);
    if (emojiTimer.current) clearTimeout(emojiTimer.current);
    emojiTimer.current = setTimeout(() => setEmoji(""), 1500);
  }, []);

  // Scene-based guide messages
  useEffect(() => {
    if (!scene) return;
    const msgs = sceneMessages[scene];
    if (!msgs || msgs.length === 0) return;
    if (!sceneInitRef.current) {
      sceneInitRef.current = true;
      showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
      return;
    }
    const delay = setTimeout(() => {
      showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 600);
    return () => clearTimeout(delay);
  }, [scene, showBubble]);

  // Random idle chatter (full mode only)
  useEffect(() => {
    if (compact) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        showBubble(messages[Math.floor(Math.random() * messages.length)]);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [showBubble, compact]);

  // Double-click: cycle through images
  const handleDoubleClick = useCallback(() => {
    setImgIdx((prev) => (prev + 1) % liaImages.length);
    showEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  }, [showEmoji]);

  // Click to jump
  const handleClick = useCallback(() => {
    if (dragging) return;
    setJumping(true);
    setSwaying(true);
    showBubble(messages[Math.floor(Math.random() * messages.length)]);
    showEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    setTimeout(() => setJumping(false), 700);
    if (swayTimer.current) clearTimeout(swayTimer.current);
    swayTimer.current = setTimeout(() => setSwaying(false), 500);
  }, [dragging, showBubble, showEmoji]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    dragRef.current = { ox: e.clientX - pos.x, oy: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragRef.current.ox, y: e.clientY - dragRef.current.oy });
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Gentle follow mouse when idle (full mode only)
  const idleTimer = useRef(0);
  useEffect(() => {
    if (!followMouse || compact) return;
    const onMove = (e: MouseEvent) => {
      if (dragging) return;
      clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        setPos((p) => {
          const tx = e.clientX - 80;
          const ty = e.clientY - 100;
          return {
            x: p.x + (tx - p.x) * 0.04,
            y: p.y + (ty - p.y) * 0.04,
          };
        });
      }, 80);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [dragging, followMouse, compact]);

  // Keep pet in bounds
  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: Math.min(p.x, window.innerWidth - 80),
        y: Math.min(p.y, window.innerHeight - 80),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const visibleBubble = guideMessage ?? bubble;

  // ── Compact mode ──
  if (compact) {
    const anchorX = preferredSide === "left" ? 20 : window.innerWidth - 68;
    const anchorY = 24;
    return (
      <>
        <CompactBubble $show={compactOpen} $anchorX={anchorX} $anchorY={anchorY}>
          <strong>莉雅</strong>
          {visibleBubble ? `：${visibleBubble}` : "：需要帮助吗？"}
          {actions && actions.length > 0 && (
            <ActionsList>
              {actions.map((action, i) => (
                <ActionButton key={i} onClick={(e) => { e.stopPropagation(); action.onClick(); setCompactOpen(false); }}>
                  {action.label}
                </ActionButton>
              ))}
            </ActionsList>
          )}
        </CompactBubble>
        <CompactAnchor
          $x={anchorX}
          $y={anchorY}
          onClick={() => {
            setCompactOpen((v) => !v);
            if (!compactOpen && scene) {
              const msgs = sceneMessages[scene];
              if (msgs && msgs.length > 0) {
                showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
              }
            }
          }}
          onDoubleClick={handleDoubleClick}
        >
          <img src={liaImages[imgIdx]} alt="莉雅" />
        </CompactAnchor>
      </>
    );
  }

  // ── Full mode ──
  return (
    <Container
      $x={pos.x}
      $y={pos.y}
      $dragging={dragging}
      $jumping={jumping}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Bubble $show={visibleBubble !== "" || Boolean(actions?.length)} $guide={Boolean(guideMessage)} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {guideMessage ? (
          <>
            <strong>莉雅：</strong>
            {guideMessage}
          </>
        ) : (
          visibleBubble
        )}
        {actions && actions.length > 0 && (
          <ActionsList>
            {actions.map((action, i) => (
              <ActionButton key={i} onClick={action.onClick}>
                {action.label}
              </ActionButton>
            ))}
          </ActionsList>
        )}
      </Bubble>
      <EmojiBurst>{emoji}</EmojiBurst>
      <PetImg
        src={liaImages[imgIdx]}
        alt="莉雅"
        $swaying={swaying}
        draggable={false}
      />
      <Shadow />
    </Container>
  );
}
