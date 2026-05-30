import { useEffect, useRef, useState, useCallback } from "react";
import Lenis from "lenis";
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

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [scrollerEl, setScrollerEl] = useState<HTMLElement | null>(null);
  const setPageRef = useCallback((el: HTMLDivElement | null) => {
    pageRef.current = el;
    if (el) setScrollerEl(el);
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // ── Lenis ──
    const lenis = new Lenis({
      wrapper: root,
      content: root.querySelector<HTMLElement>("[data-page-content]") ?? undefined,
      duration: 1.3,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.86,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(tick);
    };
    const rafId = requestAnimationFrame(tick);

    const resizeLenis = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", resizeLenis);

    // ── GSAP context ──
    // Wrap in rAF to guarantee DOM layout is complete before animation starts.
    // Without this, the intro can flash visible or delay on SPA navigation.
    const ctx = gsap.context(() => {
      if (reducedMotion) return;
      requestAnimationFrame(() => {

      // ── First View intro ──
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });

      intro
        .fromTo(
          "[data-motion-hero='gradient']",
          { scale: 0.3, autoAlpha: 0 },
          { scale: 1, autoAlpha: 0.8, duration: 3, ease: "power3.out" },
          "0",
        )
        .fromTo(
          "[data-motion-hero='kicker']",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.78 },
        )
        .fromTo(
          "[data-title-word]",
          { autoAlpha: 0, yPercent: 110 },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 1.2,
            stagger: 0.14,
            ease: "expo.out",
          },
          "-=0.3",
        )
        .fromTo(
          "[data-motion-hero='copy']",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1 },
          "-=0.55",
        )
        .fromTo(
          ".first-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.4,
            stagger: 0.22,
            ease: "power3.inOut",
          },
          "-=0.5",
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

      // 1. Copy text fades in (early, before images spread)
      if (reelCopyWrap) {
        reelMain.to(reelCopyWrap, { opacity: 1, duration: 0.75 }, "first+=0.65");
      }

      // 2. Images: start at center, spread outward + come forward
      reelWorkEls.forEach((el, i) => {
        const x = el.dataset.x ?? "0";
        const y = el.dataset.y ?? "0";
        const z = el.dataset.z ?? "-5000";

        reelMain.fromTo(
          el,
          { x: 0, y: 0, z: `${z}rem`, opacity: 0 },
          {
            x: `${x}rem`,
            y: `${y}rem`,
            z: "1000rem",
            opacity: 1,
            duration: 1.5,
            ease: "expo.out",
          },
          `first+=${0.65 + i * 0.075}`,
        );
      });

      // 3. Blur overlay fades in (darkens background behind text)
      if (reelBlur) {
        reelMain.to(reelBlur, { opacity: 1, duration: 0.5 }, "first+=1.5");
      }

      // 4. Copy text fades out (as images dominate)
      if (reelCopyWrap) {
        reelMain.to(reelCopyWrap, { opacity: 0, duration: 0.5 }, "first+=1.75");
      }

      // Paused text reveal timeline
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

      // ── Scroll reveal for sections ──
      const revealTargets = Array.from(
        root.querySelectorAll<HTMLElement>("[data-reveal]"),
      );
      revealTargets.forEach((target) => {
        ScrollTrigger.create({
          trigger: target,
          scroller: root,
          start: "top 78%",
          once: true,
          onEnter: () => target.classList.add("is-visible"),
        });
      });

      // ── GalleryWall: kaitonote-style image reveal (mask + scale) ──
      const galleryItems = gsap.utils.toArray<HTMLElement>(
        "[data-gallery-item]",
      );
      galleryItems.forEach((item) => {
        const img = item.querySelector<HTMLElement>("img");
        if (!img) return;

        // Initial state: scaled up (mask hidden via CSS default)
        gsap.set(img, { scale: 1.6 });

        ScrollTrigger.create({
          trigger: item,
          scroller: root,
          start: "top center+=25%",
          once: true,
          onEnter: () => {
            // Mask reveal (kaitonote inImageMask)
            gsap.to(img, {
              "--gallery-mask": "100%",
              duration: 1.2,
              ease: "power3.out",
            });
            // Scale down (kaitonote inImage)
            gsap.to(img, {
              scale: 1,
              duration: 2,
              ease: "power3.out",
            });
          },
        });
      });

      // ── BladeRows: alternating single-row reveal (mask + scale + label fade) ──
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
      }); // close requestAnimationFrame
    }, root);

    // ── Custom cursor ──
    const cursor = root.querySelector<HTMLElement>("[data-cursor]");
    const cursorText = root.querySelector<HTMLElement>("[data-cursor-text]");
    const cursorTargets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-mouse-target]"),
    );
    const canUseCursor =
      cursor &&
      !window.matchMedia("(pointer: coarse), (max-width: 760px)").matches;

    if (cursor && canUseCursor) {
      gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.82 });
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.46, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.46, ease: "power3" });

      const onPointerMove = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        gsap.to(cursor, { autoAlpha: 1, duration: 0.28, overwrite: true });
      };

      const onTargetEnter = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        if (cursorText)
          cursorText.textContent = target.dataset.mouseTarget ?? "";
        gsap.to(cursor, {
          scale: 1.4,
          duration: 0.38,
          ease: "expo.out",
          overwrite: true,
        });
      };

      const onTargetLeave = () => {
        if (cursorText) cursorText.textContent = "";
        gsap.to(cursor, {
          scale: 0.82,
          duration: 0.42,
          ease: "expo.out",
          overwrite: true,
        });
      };

      window.addEventListener("pointermove", onPointerMove);
      cursorTargets.forEach((target) => {
        target.addEventListener("pointerenter", onTargetEnter);
        target.addEventListener("pointerleave", onTargetLeave);
      });

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        cursorTargets.forEach((target) => {
          target.removeEventListener("pointerenter", onTargetEnter);
          target.removeEventListener("pointerleave", onTargetLeave);
        });
        gsap.killTweensOf(cursor);
        ctx.revert();
        ScrollTrigger.removeEventListener("refresh", resizeLenis);
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }

    // ── Cleanup ──
    const refreshId = window.setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 300);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
      ScrollTrigger.removeEventListener("refresh", resizeLenis);
      cancelAnimationFrame(rafId);
      lenis.destroy();
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

          <footer
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 13,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              marginTop: 40,
            }}
          >
            江苏高校地图
          </footer>
        </Shell>
      </Page>
    </>
  );
}
