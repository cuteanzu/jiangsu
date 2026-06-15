import type { CSSProperties } from "react";
import styled, { css, keyframes } from "styled-components";
import bgImage from "/bg.webp";
import schoolHero from "/jiangsu/school-hero.png";
import schoolScenery from "/jiangsu/school-scenery.png";

type CampusAtmosphereVariant = "schools" | "notes" | "qa" | "profile";

const petalFall = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, -8vh, 0) rotate(0deg);
  }
  12% {
    opacity: var(--petal-opacity);
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--petal-drift), 112vh, 0) rotate(var(--petal-rotate));
  }
`;

const branchSway = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-3deg); }
  50% { transform: translate3d(6px, 2px, 0) rotate(-2deg); }
`;

const variantStyles = {
  schools: css`
    --atmo-image: url(${schoolScenery});
    --atmo-base: oklch(97% 0.018 78);
    --atmo-photo-opacity: 0.26;
    --atmo-photo-opacity-mobile: 0.18;
    --atmo-photo-blur: 0.4px;
    --atmo-photo-saturation: 112%;
    --atmo-photo-brightness: 1.08;
    --atmo-overlay-a: oklch(98% 0.04 20 / 0.6);
    --atmo-overlay-b: oklch(97% 0.018 78 / 0.92);
    --atmo-overlay-c: oklch(93% 0.032 205 / 0.34);
    --atmo-strip: oklch(100% 0.006 78 / 0.18);
  `,
  notes: css`
    --atmo-image: url(${bgImage});
    --atmo-base: oklch(97% 0.018 78);
    --atmo-photo-opacity: 0.58;
    --atmo-photo-opacity-mobile: 0.42;
    --atmo-photo-blur: 0.2px;
    --atmo-photo-saturation: 108%;
    --atmo-photo-brightness: 1.03;
    --atmo-overlay-a: oklch(98% 0.04 20 / 0.45);
    --atmo-overlay-b: oklch(97% 0.018 78 / 0.82);
    --atmo-overlay-c: oklch(93% 0.026 205 / 0.28);
    --atmo-strip: oklch(100% 0.006 78 / 0.18);
  `,
  qa: css`
    --atmo-image: url(${schoolHero});
    --atmo-base: oklch(96.5% 0.016 96);
    --atmo-photo-opacity: 0.44;
    --atmo-photo-opacity-mobile: 0.32;
    --atmo-photo-blur: 0.6px;
    --atmo-photo-saturation: 96%;
    --atmo-photo-brightness: 1.08;
    --atmo-overlay-a: oklch(95.5% 0.022 195 / 0.42);
    --atmo-overlay-b: oklch(96.5% 0.012 98 / 0.84);
    --atmo-overlay-c: oklch(97% 0.036 20 / 0.28);
    --atmo-strip: oklch(100% 0.006 205 / 0.16);
  `,
  profile: css`
    --atmo-image: url(${schoolHero});
    --atmo-base: oklch(96.2% 0.014 72);
    --atmo-photo-opacity: 0.28;
    --atmo-photo-opacity-mobile: 0.22;
    --atmo-photo-blur: 2.2px;
    --atmo-photo-saturation: 78%;
    --atmo-photo-brightness: 1.08;
    --atmo-overlay-a: oklch(96% 0.02 50 / 0.44);
    --atmo-overlay-b: oklch(96.2% 0.014 72 / 0.92);
    --atmo-overlay-c: oklch(95% 0.016 190 / 0.34);
    --atmo-strip: oklch(100% 0.006 70 / 0.16);
  `,
};

const Layer = styled.div<{ $variant: CampusAtmosphereVariant }>`
  ${(p) => variantStyles[p.$variant]}
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--atmo-base);

  &::before {
    content: "";
    position: fixed;
    inset: var(--nav-height, 72px) 0 0;
    background-image: var(--atmo-image);
    background-size: cover;
    background-position: center top;
    opacity: var(--atmo-photo-opacity);
    filter:
      blur(var(--atmo-photo-blur))
      saturate(var(--atmo-photo-saturation))
      brightness(var(--atmo-photo-brightness));
    transform: scale(1.035);
    transform-origin: center top;
  }

  &::after {
    content: "";
    position: fixed;
    inset: var(--nav-height, 72px) 0 0;
    background:
      linear-gradient(180deg, transparent 0%, oklch(96.5% 0.014 88 / 0.34) 34%, var(--atmo-overlay-b) 64%, var(--atmo-base) 100%),
      linear-gradient(108deg, var(--atmo-overlay-a) 0%, transparent 36%, var(--atmo-overlay-c) 100%),
      repeating-linear-gradient(
        102deg,
        transparent 0 108px,
        var(--atmo-strip) 108px 146px,
        transparent 146px 260px
      ),
      linear-gradient(
        0deg,
        transparent 0 84%,
        oklch(97% 0.018 78 / 0.74) 100%
      );
  }

  @media (max-width: 720px) {
    &::before {
      opacity: var(--atmo-photo-opacity-mobile);
      transform: scale(1.08);
    }

    &::after {
      background:
        linear-gradient(180deg, transparent 0%, oklch(96.5% 0.014 88 / 0.44) 30%, var(--atmo-overlay-b) 56%, var(--atmo-base) 100%),
        linear-gradient(120deg, var(--atmo-overlay-a) 0%, transparent 44%, var(--atmo-overlay-c) 100%);
    }
  }
`;

const BranchLayer = styled.div`
  position: fixed;
  inset: var(--nav-height, 72px) 0 auto auto;
  width: min(520px, 46vw);
  height: 180px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.82;
  transform-origin: right top;
  animation: ${branchSway} 9s ease-in-out infinite;

  &::before {
    content: "";
    position: absolute;
    right: -34px;
    top: 34px;
    width: 112%;
    height: 76px;
    border-top: 11px solid oklch(34% 0.05 38 / 0.38);
    border-radius: 56% 0 0 0;
    transform: rotate(-10deg);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 4px 0 auto auto;
    width: 100%;
    height: 132px;
    background:
      radial-gradient(closest-side, oklch(86% 0.09 18 / 0.78), transparent 66%) 4% 22% / 38px 38px,
      radial-gradient(closest-side, oklch(93% 0.055 18 / 0.9), transparent 68%) 13% 35% / 32px 32px,
      radial-gradient(closest-side, oklch(88% 0.085 18 / 0.78), transparent 66%) 24% 18% / 42px 42px,
      radial-gradient(closest-side, oklch(95% 0.05 18 / 0.88), transparent 67%) 36% 34% / 34px 34px,
      radial-gradient(closest-side, oklch(86% 0.09 18 / 0.76), transparent 66%) 49% 14% / 40px 40px,
      radial-gradient(closest-side, oklch(95% 0.055 18 / 0.9), transparent 68%) 62% 28% / 32px 32px,
      radial-gradient(closest-side, oklch(87% 0.09 18 / 0.78), transparent 66%) 76% 16% / 44px 44px,
      radial-gradient(closest-side, oklch(94% 0.052 18 / 0.88), transparent 68%) 88% 30% / 34px 34px;
    background-repeat: no-repeat;
    filter: drop-shadow(0 8px 12px oklch(55% 0.08 20 / 0.16));
  }

  @media (max-width: 900px) {
    width: 62vw;
    opacity: 0.54;
  }
`;

const PetalField = styled.div`
  position: fixed;
  inset: var(--nav-height, 72px) 0 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;

  span {
    position: absolute;
    left: var(--petal-x);
    top: var(--petal-y);
    width: var(--petal-size);
    height: calc(var(--petal-size) * 0.58);
    border-radius: 72% 32% 72% 32%;
    background:
      linear-gradient(135deg, oklch(99% 0.018 24 / 0.96), oklch(78% 0.12 18 / 0.82));
    box-shadow: inset -1px -1px 3px oklch(55% 0.1 18 / 0.16);
    opacity: 0;
    animation: ${petalFall} var(--petal-duration) linear infinite;
    animation-delay: var(--petal-delay);
    transform-origin: 20% 50%;
  }

  @media (prefers-reduced-motion: reduce) {
    span {
      animation: none;
      opacity: 0.28;
      transform: rotate(18deg);
    }
  }
`;

const petals = [
  { x: "4%", y: "-12%", size: "18px", drift: "24vw", rotate: "210deg", duration: "18s", delay: "-2s", opacity: 0.44 },
  { x: "12%", y: "-18%", size: "12px", drift: "18vw", rotate: "160deg", duration: "22s", delay: "-10s", opacity: 0.36 },
  { x: "23%", y: "-10%", size: "15px", drift: "28vw", rotate: "260deg", duration: "19s", delay: "-6s", opacity: 0.4 },
  { x: "36%", y: "-22%", size: "10px", drift: "16vw", rotate: "180deg", duration: "25s", delay: "-14s", opacity: 0.3 },
  { x: "48%", y: "-14%", size: "17px", drift: "22vw", rotate: "300deg", duration: "21s", delay: "-4s", opacity: 0.38 },
  { x: "62%", y: "-20%", size: "13px", drift: "12vw", rotate: "220deg", duration: "24s", delay: "-12s", opacity: 0.34 },
  { x: "74%", y: "-11%", size: "20px", drift: "-12vw", rotate: "250deg", duration: "20s", delay: "-7s", opacity: 0.42 },
  { x: "86%", y: "-17%", size: "14px", drift: "-18vw", rotate: "190deg", duration: "23s", delay: "-15s", opacity: 0.36 },
  { x: "94%", y: "-8%", size: "16px", drift: "-22vw", rotate: "280deg", duration: "19s", delay: "-9s", opacity: 0.4 },
];

export default function CampusAtmosphere({
  variant,
}: {
  variant: CampusAtmosphereVariant;
}) {
  return (
    <Layer $variant={variant} aria-hidden="true" data-campus-atmosphere={variant}>
      <BranchLayer />
      <PetalField>
        {petals.map((petal, index) => (
          <span
            key={`${petal.x}-${index}`}
            style={{
              "--petal-x": petal.x,
              "--petal-y": petal.y,
              "--petal-size": petal.size,
              "--petal-drift": petal.drift,
              "--petal-rotate": petal.rotate,
              "--petal-duration": petal.duration,
              "--petal-delay": petal.delay,
              "--petal-opacity": petal.opacity,
            } as CSSProperties}
          />
        ))}
      </PetalField>
    </Layer>
  );
}
