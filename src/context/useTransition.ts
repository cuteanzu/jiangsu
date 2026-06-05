import { useContext } from "react";
import { TransitionContext } from "./transition";

export function useTransition() {
  return useContext(TransitionContext);
}
