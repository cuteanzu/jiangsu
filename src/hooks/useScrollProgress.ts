import { useState, useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useScrollProgress(
  scroller: HTMLElement | null,
  triggerSelector: string,
) {
  const [progress, setProgress] = useState(0);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!scroller) return;

    const trigger = scroller.querySelector<HTMLElement>(triggerSelector);
    if (!trigger) return;

    stRef.current = ScrollTrigger.create({
      trigger,
      scroller,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => setProgress(self.progress),
    });

    return () => {
      stRef.current?.kill();
      stRef.current = null;
    };
  }, [scroller, triggerSelector]);

  return progress;
}
