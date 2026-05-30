import styled from "styled-components";
import { REEL_PHOTOS } from "../data";

const Wrapper = styled.div`
  position: relative;
  height: 400vh;

  @media (min-width: 768px) {
    height: 600vh;
  }
`;

// Matching kaitonote: grid + place-content-center + perspective on the sticky container
const StickyView = styled.section`
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  perspective: 1000rem;
  display: grid;
  place-content: center;
`;

// Each floating image: inset-0 m-auto centering (kaitonote pattern)
const WorkImage = styled.div`
  position: absolute;
  inset: 0;
  margin: auto;
  width: fit-content;
  height: fit-content;
  pointer-events: none;

  img {
    width: 28rem;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);

    @media (max-width: 768px) {
      width: 18rem;
    }
  }
`;

// ── Blur overlay (kaitonote: darkens background as images spread) ──

const BlurOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.1));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
`;

// ── Text overlay ──

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const CopyBlock = styled.div`
  text-align: center;
  margin: 0 0 20px;
  font-size: clamp(40px, 6vw, 80px);
  line-height: 1.12;
  letter-spacing: 0.03em;
  color: #fff;
  opacity: 0;

  @media (max-width: 768px) {
    font-size: clamp(28px, 9vw, 48px);
  }
`;

const Line = styled.span`
  display: block;
  overflow: hidden;
  position: relative;
`;

const LineInner = styled.span`
  display: inline-block;
`;

const Italic = styled(LineInner)`
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-style: italic;
  font-weight: 400;
`;

const Bold = styled(LineInner)`
  font-weight: 900;
`;

const Hint = styled.span`
  display: inline-block;
  overflow: hidden;
  margin-top: 24px;
`;

const HintInner = styled.span`
  display: inline-block;
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted, #888);
`;

export default function Reel3D() {
  return (
    <Wrapper data-reel>
      <StickyView>
        {REEL_PHOTOS.map((img, i) => (
          <WorkImage
            key={i}
            data-reel-work
            data-x={img.x}
            data-y={img.y}
            data-z={img.z}
            style={{ zIndex: -(i + 1) }}
          >
            <img src={img.src} alt={img.alt} loading="lazy" />
          </WorkImage>
        ))}

        <BlurOverlay data-reel-blur />
        <Overlay>
          <CopyBlock data-reel-copy-wrap>
            <Line>
              <Bold data-reel-copy>金陵光影</Bold>
            </Line>
            <Line>
              <Italic data-reel-copy>Jinling in Light</Italic>
            </Line>
          </CopyBlock>
          <Hint>
            <HintInner data-reel-hint>SCROLL TO EXPLORE</HintInner>
          </Hint>
        </Overlay>
      </StickyView>
    </Wrapper>
  );
}
