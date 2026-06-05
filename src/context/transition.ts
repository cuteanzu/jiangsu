import { createContext } from "react";

export interface TransitionContextValue {
  navigateWithTransition: (to: string) => void;
  isTransitioning: boolean;
}

export const TransitionContext = createContext<TransitionContextValue>({
  navigateWithTransition: () => {},
  isTransitioning: false,
});
