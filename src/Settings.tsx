import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { defaultSettings, SettingsCtx } from "./settings-context";
import type { Settings } from "./settings-context";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setState] = useState<Settings>(defaultSettings);
  const set = useCallback((p: Partial<Settings>) => setState((prev) => ({ ...prev, ...p })), []);
  const reset = useCallback(() => setState(defaultSettings), []);
  return <SettingsCtx.Provider value={{ s, set, reset }}>{children}</SettingsCtx.Provider>;
}
