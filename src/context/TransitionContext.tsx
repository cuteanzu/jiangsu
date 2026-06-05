import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { TransitionContext } from "./transition";

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navType = useNavigationType();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss on route change
  useEffect(() => {
    if (isTransitioning) {
      const id = setTimeout(() => setIsTransitioning(false), 400);
      return () => clearTimeout(id);
    }
  }, [location.pathname, isTransitioning]);

  // Cleanup fallback timer on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const navigateWithTransition = useCallback(
    (to: string) => {
      // Guard: already transitioning or navigating to current page
      if (isTransitioning || location.pathname === to) return;
      // Guard: browser back/forward — no transition
      if (navType === "POP") {
        navigate(to);
        return;
      }

      setIsTransitioning(true);

      // Fallback: force-dismiss overlay after 1.5s
      fallbackTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        fallbackTimerRef.current = null;
      }, 1500);

      // Phase 1: overlay fades in (350ms), then navigate
      setTimeout(() => {
        navigate(to);
        // Phase 2: after navigation, dismiss overlay after 350ms
        setTimeout(() => {
          setIsTransitioning(false);
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
        }, 350);
      }, 350);
    },
    [isTransitioning, location.pathname, navType, navigate],
  );

  return (
    <TransitionContext.Provider value={{ navigateWithTransition, isTransitioning }}>
      {children}
    </TransitionContext.Provider>
  );
}
