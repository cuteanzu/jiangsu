import { useCallback, useEffect, useState } from "react";
import { authApi, authStorage } from "../services/api";
import type { AuthResponse } from "../services/types";

export function hasAuthToken() {
  return Boolean(authStorage.getToken());
}

export function useAuth() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(() => hasAuthToken());
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(() => hasAuthToken());

  const refreshUser = useCallback(async () => {
    const token = authStorage.getToken();
    setAuthenticated(Boolean(token));
    if (!token) {
      setUser(null);
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const current = await authApi.me();
      setUser(current);
      setAuthenticated(true);
      return current;
    } catch (err) {
      const message = err instanceof Error ? err.message : "无法获取用户信息";
      setUser(null);
      setAuthenticated(false);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshUser();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshUser]);

  useEffect(() => {
    const handleChange = () => {
      void refreshUser();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "token" && event.key !== "refreshToken") return;
      void refreshUser();
    };
    window.addEventListener("jiangsu-auth-change", handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("jiangsu-auth-change", handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setAuthenticated(false);
  }, []);

  return {
    authenticated,
    error,
    loading,
    logout,
    refreshUser,
    user,
  };
}
