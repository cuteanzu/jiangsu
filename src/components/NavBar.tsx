import { useLocation } from "react-router-dom";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useTransition } from "../context/useTransition";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { path: "/", label: "首页" },
  { path: "/schools", label: "高校库" },
  { path: "/jiangsu", label: "探索地图" },
  { path: "/experiences", label: "校园经验" },
  { path: "/qa", label: "问答" },
] as const;

const Bar = styled.nav<{ $dark?: boolean; $hidden: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-height, 72px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: ${(p) =>
    p.$dark ? "rgba(0, 0, 0, 0.85)" : "rgba(253, 247, 242, 0.9)"};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid
    ${(p) =>
      p.$dark ? "rgba(255, 255, 255, 0.08)" : "rgba(180, 150, 130, 0.18)"};
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;
  box-sizing: border-box;
  transform: translateY(${(p) => (p.$hidden ? "-100%" : "0")});
  transition: transform 0.35s ease;

  @media (max-width: 640px) {
    padding: 0 18px;
    height: 56px;
  }
`;

const Brand = styled.button<{ $dark?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => (p.$dark ? "#fff" : "#3a2f28")};
  letter-spacing: 0;
  padding: 0;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
`;

const NavLink = styled.button<{ $active: boolean; $dark?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: ${(p) =>
    p.$dark
      ? p.$active
        ? "#c76b5e"
        : "rgba(255,255,255,0.65)"
      : p.$active
        ? "#c76b5e"
        : "#6b5d53"};
  font-weight: ${(p) => (p.$active ? 700 : 500)};
  padding: 6px 14px;
  border-radius: 6px;
  position: relative;
  transition: color 0.25s ease, background 0.25s ease;
  white-space: nowrap;

  &:hover {
    color: #c76b5e;
    background: ${(p) =>
      p.$dark ? "rgba(199, 107, 94, 0.1)" : "rgba(199, 107, 94, 0.06)"};
  }

  @media (max-width: 640px) {
    font-size: 13px;
    padding: 6px 8px;
  }
`;

const Indicator = styled.div`
  position: absolute;
  bottom: 0;
  height: 2px;
  background: #c76b5e;
  border-radius: 1px;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LoginLink = styled.button<{ $active?: boolean; $dark?: boolean }>`
  border: 1px solid
    ${(p) =>
      p.$active
        ? "rgba(199, 107, 94, 0.3)"
        : p.$dark
          ? "rgba(199, 107, 94, 0.18)"
          : "rgba(199, 107, 94, 0.18)"};
  border-radius: 8px;
  background: ${(p) =>
    p.$active
      ? "rgba(199, 107, 94, 0.08)"
      : p.$dark
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(255, 252, 247, 0.58)"};
  color: ${(p) =>
    p.$active ? "#c76b5e" : p.$dark ? "rgba(255,255,255,0.7)" : "#8a5a4f"};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  white-space: nowrap;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: #c76b5e;
    background: ${(p) =>
      p.$dark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(255, 252, 247, 0.88)"};
    border-color: rgba(199, 107, 94, 0.3);
  }

  @media (max-width: 640px) {
    font-size: 13px;
    padding: 6px 8px;
  }
`;

export default function NavBar({ $hideOnScroll = false }: { $hideOnScroll?: boolean }) {
  const location = useLocation();
  const { navigateWithTransition } = useTransition();
  const { authenticated, user } = useAuth();
  const currentPath = location.pathname;

  // ── Scroll hide (homepage only) ──
  const [hidden, setHidden] = useState(false);
  const prevScrollRef = useRef(0);

  useEffect(() => {
    if (!$hideOnScroll) return;

    // Lenis adds .lenis-smooth class to the wrapper
    const scroller = document.querySelector<HTMLElement>(".lenis-smooth");
    if (!scroller) return;

    const onScroll = () => {
      const current = scroller.scrollTop;
      if (current > prevScrollRef.current && current > 100) {
        setHidden(true);
      } else if (current < prevScrollRef.current) {
        setHidden(false);
      }
      prevScrollRef.current = current;
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [$hideOnScroll]);

  // ── Animated active indicator ──
  const linksRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const container = linksRef.current;
    if (!container) return;

    const activeLink = container.querySelector<HTMLElement>("[data-active]");
    if (activeLink) {
      setIndicatorStyle({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    }
  }, [currentPath]);

  const handleNav = useCallback(
    (path: string) => {
      if (currentPath === path) return;
      navigateWithTransition(path);
    },
    [currentPath, navigateWithTransition],
  );

  // Hide on login pages
  if (currentPath === "/login") {
    return null;
  }

  const isActive = (path: string) =>
    path === "/"
      ? currentPath === "/" || currentPath === "/home"
      : currentPath === path || currentPath.startsWith(`${path}/`);

  const isDark = currentPath === "/" || currentPath === "/home";

  return (
    <Bar $dark={isDark} $hidden={$hideOnScroll && hidden}>
      <Brand $dark={isDark} onClick={() => handleNav("/")}>
        江苏高校地图
      </Brand>
      <Links ref={linksRef}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            $active={isActive(item.path)}
            $dark={isDark}
            data-active={isActive(item.path) ? "" : undefined}
            onClick={() => handleNav(item.path)}
          >
            {item.label}
          </NavLink>
        ))}
        <Indicator style={indicatorStyle} />
        <LoginLink
          $active={isActive("/me")}
          $dark={isDark}
          onClick={() => handleNav("/me")}
        >
          {authenticated ? user?.nickname || user?.username || "我" : "游客"}
        </LoginLink>
      </Links>
    </Bar>
  );
}
