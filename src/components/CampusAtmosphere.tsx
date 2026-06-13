import styled, { css } from "styled-components";
import bgImage from "/bg.webp";

type CampusAtmosphereVariant = "notes" | "qa" | "profile";

const variantStyles = {
  notes: css`
    --atmo-base: oklch(96.5% 0.018 82);
    --atmo-photo-opacity: 0.38;
    --atmo-photo-opacity-mobile: 0.3;
    --atmo-photo-blur: 1.5px;
    --atmo-photo-saturation: 92%;
    --atmo-photo-brightness: 1.04;
    --atmo-overlay-a: oklch(96% 0.02 78 / 0.34);
    --atmo-overlay-b: oklch(96.5% 0.018 82 / 0.88);
    --atmo-overlay-c: oklch(94.5% 0.016 205 / 0.36);
    --atmo-strip: oklch(100% 0.006 78 / 0.18);
  `,
  qa: css`
    --atmo-base: oklch(96% 0.014 197);
    --atmo-photo-opacity: 0.3;
    --atmo-photo-opacity-mobile: 0.24;
    --atmo-photo-blur: 2px;
    --atmo-photo-saturation: 72%;
    --atmo-photo-brightness: 1.08;
    --atmo-overlay-a: oklch(95.5% 0.02 195 / 0.38);
    --atmo-overlay-b: oklch(96.5% 0.012 98 / 0.9);
    --atmo-overlay-c: oklch(94.5% 0.016 72 / 0.32);
    --atmo-strip: oklch(100% 0.006 205 / 0.14);
  `,
  profile: css`
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
    background-image: url(${bgImage});
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

export default function CampusAtmosphere({
  variant,
}: {
  variant: CampusAtmosphereVariant;
}) {
  return <Layer $variant={variant} aria-hidden="true" data-campus-atmosphere={variant} />;
}
