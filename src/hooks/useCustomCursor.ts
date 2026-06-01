import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useCustomCursor(root: HTMLElement | null) {
  const activeRef = useRef(false);

  useEffect(() => {
    if (!root) return;

    const cursor = root.querySelector<HTMLElement>("[data-cursor]");
    const cursorText = root.querySelector<HTMLElement>("[data-cursor-text]");
    const cursorTargets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-mouse-target]"),
    );

    const canUseCursor =
      cursor &&
      !window.matchMedia("(pointer: coarse), (max-width: 760px)").matches;

    if (!cursor || !canUseCursor) return;

    activeRef.current = true;
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
      if (cursorText) cursorText.textContent = target.dataset.mouseTarget ?? "";
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
      activeRef.current = false;
      window.removeEventListener("pointermove", onPointerMove);
      cursorTargets.forEach((target) => {
        target.removeEventListener("pointerenter", onTargetEnter);
        target.removeEventListener("pointerleave", onTargetLeave);
      });
      gsap.killTweensOf(cursor);
    };
  }, [root]);

  return activeRef;
}
