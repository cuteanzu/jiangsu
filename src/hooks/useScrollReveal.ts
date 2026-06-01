import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useScrollReveal(root: HTMLElement | null) {
  useEffect(() => {
    if (!root) return;

    const revealTargets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    const triggers = revealTargets.map((target) =>
      ScrollTrigger.create({
        trigger: target,
        scroller: root,
        start: "top 78%",
        once: true,
        onEnter: () => target.classList.add("is-visible"),
      }),
    );

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [root]);
}
