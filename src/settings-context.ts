import { createContext, useContext } from "react";

export interface Settings {
  parallaxStrength: number;
  vignetteOpacity: number;
  bokehCount: number;
  bokehSize: number;
  bokehOpacity: number;
  komorebiBeamOpacity: number;
  komorebiDustCount: number;
  petalSize: number;
  petalSpeed: number;
  petalIntensity: "minimal" | "subtle" | "moderate" | "bold";
  groundPetalsCount: number;
}

export const defaultSettings: Settings = {
  parallaxStrength: 0.5,
  vignetteOpacity: 0.45,
  bokehCount: 20,
  bokehSize: 1,
  bokehOpacity: 0.4,
  komorebiBeamOpacity: 0.25,
  komorebiDustCount: 40,
  petalSize: 1.8,
  petalSpeed: 0.6,
  petalIntensity: "moderate",
  groundPetalsCount: 25,
};

export const SettingsCtx = createContext<{
  s: Settings;
  set: (p: Partial<Settings>) => void;
  reset: () => void;
}>({ s: defaultSettings, set: () => {}, reset: () => {} });

export function useSettings() {
  return useContext(SettingsCtx);
}
