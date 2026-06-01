import { useState, useEffect, useRef } from "react";

export function useScrollDirection(scroller: HTMLElement | null) {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [scrollY, setScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!scroller) return;

    const onScroll = () => {
      const current = scroller.scrollTop;
      setScrollY(current);
      setIsAtTop(current < 10);
      if (current > prevRef.current) {
        setDirection("down");
      } else if (current < prevRef.current) {
        setDirection("up");
      }
      prevRef.current = current;
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [scroller]);

  return { direction, scrollY, isAtTop };
}
