import { useCallback, useEffect, useState } from "react";

export type AudienceRole = "gaokao" | "freshman" | "college";

export const AUDIENCE_ROLE_STORAGE_KEY = "scholarium-audience-role";

export const AUDIENCE_ROLE_ORDER: AudienceRole[] = [
  "gaokao",
  "freshman",
  "college",
];

export const AUDIENCE_ROLE_LABELS: Record<AudienceRole, string> = {
  gaokao: "高考毕业生",
  freshman: "准大学生",
  college: "在校大学生",
};

export function isAudienceRole(value: string | null): value is AudienceRole {
  return value === "gaokao" || value === "freshman" || value === "college";
}

export function readAudienceRole(fallback: AudienceRole = "gaokao"): AudienceRole {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(AUDIENCE_ROLE_STORAGE_KEY);
    return isAudienceRole(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

export function writeAudienceRole(role: AudienceRole) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUDIENCE_ROLE_STORAGE_KEY, role);
  } catch {
    // localStorage may be unavailable in private or restricted contexts.
  }
}

export function useAudienceRole(fallback: AudienceRole = "gaokao") {
  const [role, setRoleState] = useState<AudienceRole>(() => readAudienceRole(fallback));

  const setRole = useCallback((nextRole: AudienceRole) => {
    setRoleState(nextRole);
    writeAudienceRole(nextRole);
  }, []);

  useEffect(() => {
    writeAudienceRole(role);
  }, [role]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUDIENCE_ROLE_STORAGE_KEY) return;
      if (isAudienceRole(event.newValue)) setRoleState(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    role,
    roleLabel: AUDIENCE_ROLE_LABELS[role],
    setRole,
  };
}
