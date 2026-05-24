import styled, { keyframes } from "styled-components";

const aurora = keyframes`
  0% { transform: translate3d(-2%, 1%, 0) rotate(0deg) scale(1); opacity: 0.78; }
  100% { transform: translate3d(2%, -2%, 0) rotate(5deg) scale(1.06); opacity: 1; }
`;

const gridMove = keyframes`
  to { transform: translate3d(-46px, 46px, 0); }
`;

const petalFall = keyframes`
  0% { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 0; }
  14% { opacity: 0.68; }
  78% { opacity: 0.42; }
  100% { transform: translate3d(58px, 112vh, 0) rotate(520deg); opacity: 0; }
`;

const starBlink = keyframes`
  0%, 100% { opacity: 0.28; transform: scale(0.72); }
  50% { opacity: 0.82; transform: scale(1); }
`;

const SpaceLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 44%, rgba(255, 111, 170, 0.28), transparent 30%),
    radial-gradient(circle at 78% 18%, rgba(112, 222, 255, 0.3), transparent 30%),
    radial-gradient(circle at 18% 72%, rgba(151, 235, 178, 0.24), transparent 26%),
    linear-gradient(135deg, #fff6fb 0%, #e9f8ff 45%, #f4fff4 100%);

  &::before {
    content: "";
    position: absolute;
    inset: -20%;
    opacity: 0.9;
    filter: blur(20px);
    background:
      conic-gradient(from 138deg at 62% 44%, transparent 0deg, rgba(255, 111, 170, 0.28) 42deg, rgba(91, 205, 255, 0.22) 96deg, transparent 150deg, rgba(255, 221, 132, 0.18) 230deg, transparent 320deg),
      radial-gradient(ellipse at 50% 42%, rgba(74, 187, 255, 0.16), transparent 36%);
    mix-blend-mode: multiply;
    animation: ${aurora} 14s ease-in-out infinite alternate;
  }

  &::after {
    content: "";
    position: absolute;
    inset: -46px;
    opacity: 0.22;
    background:
      linear-gradient(rgba(255, 117, 174, 0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(83, 191, 244, 0.18) 1px, transparent 1px);
    background-size: 46px 46px;
    transform: perspective(560px) rotateX(62deg);
    transform-origin: 50% 100%;
    animation: ${gridMove} 10s linear infinite;
  }
`;

const Petal = styled.i<{ $left: number; $delay: number; $duration: number; $size: number }>`
  position: absolute;
  z-index: 1;
  top: -12vh;
  left: ${(p) => p.$left}%;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size * 1.45}px;
  border-radius: 75% 20% 70% 28%;
  background:
    radial-gradient(circle at 34% 24%, rgba(255, 255, 255, 0.92), transparent 24%),
    linear-gradient(150deg, rgba(255, 114, 161, 0.9), rgba(255, 188, 214, 0.34));
  box-shadow: 0 0 18px rgba(255, 96, 151, 0.45);
  animation: ${petalFall} ${(p) => p.$duration}s linear infinite;
  animation-delay: ${(p) => p.$delay}s;
`;

const Star = styled.b<{ $left: number; $top: number; $delay: number }>`
  position: absolute;
  z-index: 1;
  left: ${(p) => p.$left}%;
  top: ${(p) => p.$top}%;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: #ff6fa3;
  box-shadow: 0 0 14px rgba(255, 111, 163, 0.72);
  animation: ${starBlink} 3.2s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}s;
`;

const petals = [
  { left: 6, delay: -2, duration: 23, size: 7 },
  { left: 16, delay: -8, duration: 28, size: 5 },
  { left: 31, delay: -15, duration: 25, size: 6 },
  { left: 47, delay: -5, duration: 30, size: 5 },
  { left: 63, delay: -12, duration: 27, size: 7 },
  { left: 79, delay: -19, duration: 31, size: 5 },
  { left: 92, delay: -7, duration: 26, size: 6 },
];

const stars = [
  { left: 10, top: 18, delay: -0.3 },
  { left: 21, top: 68, delay: -1.6 },
  { left: 36, top: 24, delay: -2.4 },
  { left: 58, top: 14, delay: -0.9 },
  { left: 73, top: 72, delay: -1.9 },
  { left: 87, top: 33, delay: -2.8 },
];

export default function InkBackground() {
  return (
    <SpaceLayer aria-hidden="true">
      {petals.map((petal) => (
        <Petal
          key={petal.left}
          $left={petal.left}
          $delay={petal.delay}
          $duration={petal.duration}
          $size={petal.size}
        />
      ))}
      {stars.map((star) => (
        <Star key={`${star.left}-${star.top}`} $left={star.left} $top={star.top} $delay={star.delay} />
      ))}
    </SpaceLayer>
  );
}
