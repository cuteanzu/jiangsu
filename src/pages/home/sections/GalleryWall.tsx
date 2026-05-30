import { useState } from "react";
import styled from "styled-components";
import { Camera } from "lucide-react";
import { GALLERY_PHOTOS, GALLERY_LAYOUT } from "../data";
import {
  PhotoPlaceholder,
  SectionKicker,
  SectionTitle,
  SectionText,
} from "../Home.styles";

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #1a1418 0%, #2a1f24 40%, #1e1818 100%)",
  "linear-gradient(160deg, #181a1f 0%, #1f242a 40%, #181c1e 100%)",
  "linear-gradient(145deg, #1a1818 0%, #24201b 40%, #1a1818 100%)",
  "linear-gradient(150deg, #18191a 0%, #1f2224 40%, #181a1c 100%)",
  "linear-gradient(135deg, #1a1618 0%, #221d22 40%, #1a1719 100%)",
  "linear-gradient(155deg, #181a18 0%, #1f2420 40%, #181c19 100%)",
];

const Wrapper = styled.div`
  margin-top: clamp(60px, 10vw, 120px);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  gap: 16px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const GridItem = styled.div<{
  $span: boolean;
  $aspect: string;
}>`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  aspect-ratio: ${(p) => p.$aspect};
  grid-column: ${(p) => (p.$span ? "span 2" : "span 1")};
  background: #141414;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    will-change: transform, mask-size;
    mask-image: linear-gradient(to bottom, black 0%, black 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black 100%);
    mask-size: 100% var(--gallery-mask, 0%);
    -webkit-mask-size: 100% var(--gallery-mask, 0%);
    mask-position: 100% top;
    -webkit-mask-position: 100% top;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    transform-origin: top left;
    transition: filter 0.5s ease;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 50%,
      rgba(8, 13, 20, 0.7) 100%
    );
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  &:hover {
    img {
      filter: brightness(1.12);
    }
    box-shadow: 0 0 0 1px rgba(199, 107, 94, 0.25),
      0 24px 48px rgba(0, 0, 0, 0.55);
    &::after {
      opacity: 0.6;
    }
  }

  @media (max-width: 760px) {
    grid-column: span 1 !important;
  }
`;

const Caption = styled.span<{ $visible: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 24px;
  z-index: 2;
  color: #fdf7f2;
  font-family: "Noto Serif SC", serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transform: translateY(${(p) => (p.$visible ? 0 : 8)}px);
  transition: opacity 0.35s ease, transform 0.35s ease;
`;

function GalleryImage({ photo, index }: { photo: (typeof GALLERY_PHOTOS)[number]; index: number }) {
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (failed) {
    return (
      <PhotoPlaceholder
        $aspect={photo.portrait ? "3/4" : "16/9"}
        $gradient={PLACEHOLDER_GRADIENTS[index]}
      />
    );
  }

  return (
    <GridItem
      data-gallery-item
      $span={GALLERY_LAYOUT[index] === 2}
      $aspect={photo.portrait ? "3/4" : "16/9"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <Caption $visible={hovered}>{photo.alt}</Caption>
    </GridItem>
  );
}

export default function GalleryWall() {
  return (
    <Wrapper data-gallery>
      <SectionKicker>
        <Camera size={14} />
        光影纪实
      </SectionKicker>
      <SectionTitle>校园掠影</SectionTitle>
      <SectionText>
        用镜头记录江苏高校的真实瞬间——建筑的光影、生活的温度、四季的变化。
      </SectionText>

      <Grid>
        {GALLERY_PHOTOS.map((photo, i) => (
          <GalleryImage key={i} photo={photo} index={i} />
        ))}
      </Grid>
    </Wrapper>
  );
}
