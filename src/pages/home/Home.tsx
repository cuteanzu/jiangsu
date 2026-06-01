import { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Page, CursorAura, Shell } from "./Home.styles";
import AtmosphereLayer from "./AtmosphereLayer";
import Particles from "./Particles";
import FirstView from "./sections/FirstView";
import Reel3D from "./sections/Reel3D";
import Dimensions from "./sections/Dimensions";
import GalleryWall from "./sections/GalleryWall";
import FeaturedUniversities from "./sections/FeaturedUniversities";
import BladeRows from "./sections/BladeRows";
import Contact from "./sections/Contact";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useCustomCursor } from "../../hooks/useCustomCursor";

gsap.registerPlugin(ScrollTrigger);

const StyledFooter = styled.footer`
  position: relative;
  margin-top: 40px;
  padding: clamp(60px, 10vw, 100px) 0 40px;
  text-align: center;
  color: #6b5d53;
  font-size: 13px;
  font-family: "Noto Serif SC", "Songti SC", serif;
  background: linear-gradient(180deg, #fcfaf5 0%, #f8f4f0 100%);
  border-top: 1px solid rgba(180, 150, 130, 0.12);
  overflow: hidden;
`;

const FooterTransitionBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: clamp(280px, 40vh, 520px);
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(252, 250, 245, 0.55) 40%,
    rgba(252, 250, 245, 0.92) 80%,
    rgba(248, 244, 240, 1) 100%
  );
`;

const FooterContent = styled.div`
  position: relative;
  z-index: 1;
`;

export default function Home() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [scrollerEl, setScrollerEl] = useState<HTMLElement | null>(null);
  const setPageRef = useCallback((el: HTMLDivElement | null) => {
    pageRef.current = el;
    if (el) setScrollerEl(el);
  }, []);

  useLenisScroll(scrollerEl);
  useScrollReveal(scrollerEl);
  useCustomCursor(scrollerEl);

  // ── GSAP animations (hero intro, Reel3D, Gallery, Blade) ──
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (reducedMotion) return;
      requestAnimationFrame(() => {

      // ── First View intro (kaitonote-pace: inTitle 1.6s / inText 2s / inLine 2s) ──
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });

      intro
        .fromTo(
          "[data-motion-hero='gradient']",
          { autoAlpha: 0.65, scale: 0.95 },
          { autoAlpha: 0.8, scale: 1, duration: 2, ease: "power3.out" },
          "0",
        )
        .fromTo(
          ".first-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 2,
            stagger: 0.25,
            ease: "power3.inOut",
          },
          "0",
        )
        .fromTo(
          "[data-motion-hero='kicker']",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.6 },
          "0.15",
        )
        .fromTo(
          "[data-title-word]",
          { autoAlpha: 0, y: 24, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.6,
            stagger: 0.1,
          },
          "0.3",
        )
        .fromTo(
          "[data-motion-hero='copy']",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 2, stagger: 0.15 },
          "0.55",
        );

      // ── Reel 3D: kaitonote-style cinematic sequence ──
      const reelWorkEls = gsap.utils.toArray<HTMLElement>("[data-reel-work]");
      const reelCopyEls = gsap.utils.toArray<HTMLElement>("[data-reel-copy]");
      const reelCopyWrap = root.querySelector<HTMLElement>("[data-reel-copy-wrap]");
      const reelBlur = root.querySelector<HTMLElement>("[data-reel-blur]");
      const reelHint = root.querySelector<HTMLElement>("[data-reel-hint]");
      let reelTextPlayed = false;

      const reelMain = gsap.timeline({
        ease: "none",
        scrollTrigger: {
          trigger: "[data-reel]",
          scroller: root,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      if (reelCopyWrap) {
        reelMain.to(reelCopyWrap, { opacity: 1, duration: 0.75 }, "first+=0.65");
      }

      const vwScale = Math.max(1, window.innerWidth / 1440);
      reelWorkEls.forEach((el, i) => {
        const x = `${(parseFloat(el.dataset.x ?? "0") * vwScale).toFixed(1)}rem`;
        const y = `${(parseFloat(el.dataset.y ?? "0") * vwScale).toFixed(1)}rem`;
        const z = el.dataset.z ?? "-5000";

        reelMain.fromTo(
          el,
          { x: 0, y: 0, z: `${z}rem`, opacity: 0 },
          {
            x,
            y,
            z: "1000rem",
            opacity: 1,
            duration: 1.5,
            ease: "expo.out",
          },
          `first+=${0.65 + i * 0.075}`,
        );
      });

      if (reelBlur) {
        reelMain.to(reelBlur, { opacity: 1, duration: 0.5 }, "first+=1.5");
      }

      if (reelCopyWrap) {
        reelMain.to(reelCopyWrap, { opacity: 0, duration: 0.5 }, "first+=1.75");
      }

      const reelTextTl = gsap.timeline({ paused: true });

      reelCopyEls.forEach((el, i) => {
        reelTextTl.fromTo(
          el,
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.6,
            ease: "expo.out",
          },
          i === 0 ? "0" : "<+=0.08",
        );
      });

      if (reelHint) {
        reelTextTl.fromTo(
          reelHint,
          { autoAlpha: 0.6 },
          { autoAlpha: 0, duration: 0.6 },
          "-=0.3",
        );
      }

      reelMain.call(
        () => {
          if (!reelTextPlayed) {
            reelTextPlayed = true;
            reelTextTl.play();
          }
        },
        [],
        "first+=0.8",
      );

      // ── GalleryWall: kaitonote-style image reveal ──
      const galleryItems = gsap.utils.toArray<HTMLElement>(
        "[data-gallery-item]",
      );
      galleryItems.forEach((item) => {
        const img = item.querySelector<HTMLElement>("img");
        if (!img) return;

        gsap.set(img, { scale: 1.6 });

        ScrollTrigger.create({
          trigger: item,
          scroller: root,
          start: "top center+=25%",
          once: true,
          onEnter: () => {
            gsap.to(img, {
              "--gallery-mask": "100%",
              duration: 1.2,
              ease: "power3.out",
            });
            gsap.to(img, {
              scale: 1,
              duration: 2,
              ease: "power3.out",
            });
          },
        });
      });

      // ── BladeRows: alternating single-row reveal ──
      const bladeRows = gsap.utils.toArray<HTMLElement>("[data-blade-row]");
      bladeRows.forEach((row) => {
        const photoImg = row.querySelector<HTMLElement>("[data-blade-photo] img");
        const label = row.querySelector<HTMLElement>("[data-blade-text]");

        if (photoImg) gsap.set(photoImg, { scale: 1.6 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            scroller: root,
            start: "top 78%",
            once: true,
          },
        });

        if (photoImg) {
          tl.to(photoImg, { "--blade-mask": "100%", duration: 1, ease: "power3.out" }, 0);
          tl.to(photoImg, { scale: 1, duration: 1.8, ease: "power3.out" }, 0);
        }
        if (label) {
          tl.fromTo(
            label,
            { y: 12, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" },
            0.15,
          );
        }
      });

      // ── Footer transition: fade AtmosphereLayer out ──
      const atmosphere = document.querySelector<HTMLElement>("[data-atmosphere]");
      if (atmosphere) {
        ScrollTrigger.create({
          trigger: "[data-footer-trigger]",
          scroller: root,
          start: "top bottom+=5%",
          end: "top center+=15%",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(atmosphere, { opacity: 1 - self.progress });
          },
        });
      }
      }); // close requestAnimationFrame
    }, root);

    // ── Refresh after layout settles ──
    const refreshId = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <AtmosphereLayer scroller={scrollerEl} />
      <Particles count={35} />
      <Page ref={setPageRef}>
        <CursorAura data-cursor aria-hidden="true">
          <span data-cursor-text />
        </CursorAura>
        <Shell data-page-content>
          <FirstView />
          <Reel3D />

          <section data-reveal>
            <Dimensions />
          </section>

          <section data-reveal>
            <GalleryWall />
          </section>

          <section data-reveal>
            <FeaturedUniversities />
          </section>

          <section data-reveal>
            <BladeRows />
          </section>

          <section data-reveal>
            <Contact />
          </section>

          <StyledFooter data-footer-trigger>
            <FooterTransitionBg />
            <FooterContent>江苏高校地图</FooterContent>
          </StyledFooter>
        </Shell>
      </Page>
    </>
  );
}
