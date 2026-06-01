import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface UseLenisScrollOptions {
  /** Whether to respect prefers-reduced-motion */
  reducedMotion?: boolean;
}

export function useLenisScroll(root: HTMLElement | null, _options?: UseLenisScrollOptions) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!root) return;

    const lenis = new Lenis({
      wrapper: root,
      content: root.querySelector<HTMLElement>("[data-page-content]") ?? undefined,
      duration: 1.3,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.86,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(tick);
    };
    const rafId = requestAnimationFrame(tick);

    const resizeLenis = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", resizeLenis);

    return () => {
      ScrollTrigger.removeEventListener("refresh", resizeLenis);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [root]);

  return lenisRef;
}
