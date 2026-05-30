import { useEffect, useRef } from "react";
import styled from "styled-components";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ATMOS_PHOTOS } from "./data";

gsap.registerPlugin(ScrollTrigger);

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
`;

const PhotoLayer = styled.div`
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  will-change: transform, opacity;
  opacity: 0;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(8, 13, 20, 0.25) 0%,
      rgba(8, 13, 20, 0.35) 40%,
      rgba(8, 13, 20, 0.35) 60%,
      rgba(8, 13, 20, 0.2) 100%
    );
  }
`;

export default function AtmosphereLayer({
  scroller,
}: {
  scroller?: HTMLElement | null;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const layers = wrapper.querySelectorAll<HTMLElement>(".photo-layer");
    if (layers.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Ken Burns: subtle continuous zoom on the active layer
    if (!reducedMotion) {
      layers.forEach((layer, i) => {
        const xDir = i % 2 === 0 ? 1 : -1;
        const yDir = i % 3 === 0 ? -1 : 1;
        gsap.to(layer, {
          scale: 1.08,
          x: `${xDir * 2}%`,
          y: `${yDir * 1.5}%`,
          duration: 20 + i * 3,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
      });
    }

    // Crossfade between layers based on scroll position
    const totalSections = ATMOS_PHOTOS.length;
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.querySelector("[data-page-content]"),
      scroller: scroller ?? undefined,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const rawIndex = progress * (totalSections - 1);
        const fromIndex = Math.floor(rawIndex);
        const toIndex = Math.min(fromIndex + 1, totalSections - 1);
        const blend = rawIndex - fromIndex;

        layers.forEach((layer, i) => {
          if (i === fromIndex) {
            layer.style.opacity = String(1 - blend * 0.7);
          } else if (i === toIndex) {
            layer.style.opacity = String(0.3 + blend * 0.7);
          } else {
            layer.style.opacity = "0";
          }
        });
      },
    });

    return () => {
      scrollTrigger.kill();
      layers.forEach((layer) => gsap.killTweensOf(layer));
    };
  }, [scroller]);

  return (
    <Wrapper ref={wrapperRef}>
      {ATMOS_PHOTOS.map((photo, i) => (
        <PhotoLayer
          key={i}
          className="photo-layer"
          style={{
            backgroundImage: `url(${photo.src})`,
            opacity: i === 0 ? 0.55 : 0,
          }}
        />
      ))}
    </Wrapper>
  );
}
