import { useLocation } from "react-router-dom";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useTransition } from "../context/useTransition";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { path: "/", label: "首页", role: "总览" },
  { path: "/schools", label: "高校库", role: "筛选台" },
  { path: "/jiangsu", label: "探索地图", role: "发现台" },
  { path: "/experiences", label: "校园经验", role: "现场笔记" },
  { path: "/qa", label: "问答", role: "分诊台" },
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
  padding: 0 28px;
  background: ${(p) =>
    p.$dark
      ? "linear-gradient(180deg, oklch(12% 0.018 72 / 0.94), oklch(9% 0.018 72 / 0.82))"
      : "linear-gradient(180deg, oklch(98% 0.012 82 / 0.96), oklch(95.5% 0.018 78 / 0.9))"};
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  border-bottom: 1px solid
    ${(p) =>
      p.$dark ? "oklch(96% 0.008 78 / 0.12)" : "oklch(75% 0.035 70 / 0.34)"};
  box-shadow: ${(p) =>
    p.$dark
      ? "0 16px 44px oklch(7% 0.018 72 / 0.32)"
      : "0 14px 34px oklch(40% 0.045 58 / 0.08)"};
  font-family: var(--font-ui);
  box-sizing: border-box;
  transform: translateY(${(p) => (p.$hidden ? "-100%" : "0")});
  transition: transform 0.35s ease;

  @media (max-width: 640px) {
    padding: 0 18px;
    height: 56px;
  }
`;

const Brand = styled.button<{ $dark?: boolean }>`
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: ${(p) =>
    p.$dark ? "oklch(96% 0.008 78 / 0.04)" : "oklch(99% 0.008 82 / 0.64)"};
  border: 1px solid
    ${(p) => (p.$dark ? "oklch(96% 0.008 78 / 0.11)" : "oklch(78% 0.035 70 / 0.3)")};
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 950;
  color: ${(p) => (p.$dark ? "oklch(96% 0.008 78)" : "oklch(25% 0.035 55)")};
  letter-spacing: 0;
  padding: 0 13px 0 10px;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 oklch(99% 0.006 82 / 0.42);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &::before {
    content: "";
    width: 18px;
    height: 18px;
    border-radius: 5px;
    background:
      linear-gradient(135deg, oklch(62% 0.12 43), oklch(50% 0.09 205)),
      oklch(55% 0.1 43);
    box-shadow: inset 0 0 0 1px oklch(98% 0.008 82 / 0.38);
  }

  &:hover {
    transform: translateY(-1px);
    border-color: ${(p) => (p.$dark ? "oklch(72% 0.12 42 / 0.34)" : "oklch(65% 0.09 48 / 0.46)")};
  }

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  position: relative;
  min-height: 48px;
  padding: 4px;
  border: 1px solid oklch(78% 0.028 72 / 0.28);
  border-radius: 8px;
  background: oklch(99% 0.006 82 / 0.12);

  @media (max-width: 980px) {
    gap: 0;
    overflow-x: auto;
    max-width: calc(100vw - 190px);
  }
`;

const NavLink = styled.button<{ $active: boolean; $dark?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  min-height: 40px;
  display: grid;
  align-content: center;
  gap: 2px;
  font-size: 13px;
  color: ${(p) =>
    p.$dark
      ? p.$active
        ? "oklch(72% 0.12 42)"
        : "oklch(88% 0.01 78 / 0.68)"
      : p.$active
        ? "oklch(48% 0.11 42)"
        : "oklch(38% 0.032 58)"};
  font-weight: ${(p) => (p.$active ? 900 : 760)};
  padding: 5px 12px;
  border-radius: 8px;
  position: relative;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  background: ${(p) =>
    p.$active
      ? p.$dark
        ? "oklch(72% 0.12 42 / 0.1)"
        : "oklch(94% 0.036 48 / 0.76)"
      : "transparent"};

  span {
    line-height: 1.05;
  }

  em {
    color: ${(p) =>
      p.$dark ? "oklch(82% 0.01 78 / 0.38)" : "oklch(48% 0.03 62 / 0.68)"};
    font-size: 10px;
    font-style: normal;
    font-weight: 800;
  }

  &:hover {
    color: oklch(55% 0.12 42);
    background: ${(p) =>
      p.$dark ? "oklch(72% 0.12 42 / 0.12)" : "oklch(88% 0.055 48 / 0.18)"};
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    font-size: 13px;
    padding: 6px 8px;

    em {
      display: none;
    }
  }
`;

const Indicator = styled.div`
  position: absolute;
  bottom: 5px;
  height: 2px;
  background: oklch(60% 0.12 42);
  border-radius: 1px;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LoginLink = styled.button<{ $active?: boolean; $dark?: boolean }>`
  border: 1px solid
    ${(p) =>
      p.$active
        ? "oklch(64% 0.11 43 / 0.45)"
        : p.$dark
          ? "oklch(72% 0.12 42 / 0.2)"
          : "oklch(70% 0.075 48 / 0.34)"};
  border-radius: 8px;
  background: ${(p) =>
    p.$active
      ? "oklch(94% 0.035 45 / 0.78)"
      : p.$dark
        ? "oklch(96% 0.008 78 / 0.06)"
        : "oklch(99% 0.008 82 / 0.68)"};
  color: ${(p) =>
    p.$active ? "oklch(48% 0.11 42)" : p.$dark ? "oklch(92% 0.008 78 / 0.72)" : "oklch(38% 0.06 50)"};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  white-space: nowrap;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: oklch(52% 0.12 42);
    background: ${(p) =>
      p.$dark
        ? "oklch(96% 0.008 78 / 0.12)"
        : "oklch(99% 0.008 82 / 0.92)"};
    border-color: oklch(64% 0.11 43 / 0.42);
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
        江苏校园指北
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
            <span>{item.label}</span>
            <em>{item.role}</em>
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
