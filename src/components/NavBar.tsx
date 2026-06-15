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
      ? "linear-gradient(180deg, oklch(18% 0.032 24 / 0.9), oklch(13% 0.026 40 / 0.78))"
      : "linear-gradient(180deg, oklch(99% 0.014 76 / 0.96), oklch(97% 0.024 28 / 0.88))"};
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  border-bottom: 1px solid
    ${(p) =>
      p.$dark ? "oklch(96% 0.018 30 / 0.16)" : "oklch(82% 0.05 24 / 0.34)"};
  box-shadow: ${(p) =>
    p.$dark
      ? "0 16px 44px oklch(14% 0.034 24 / 0.28)"
      : "0 14px 34px oklch(52% 0.06 24 / 0.08)"};
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
    p.$dark ? "oklch(96% 0.018 30 / 0.06)" : "oklch(99% 0.018 76 / 0.72)"};
  border: 1px solid
    ${(p) => (p.$dark ? "oklch(96% 0.018 30 / 0.16)" : "oklch(83% 0.052 24 / 0.36)")};
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 950;
  color: ${(p) => (p.$dark ? "oklch(96% 0.018 30)" : "oklch(25% 0.04 48)")};
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
      linear-gradient(135deg, var(--sakura, oklch(70% 0.12 18)), var(--spring-blue, oklch(56% 0.09 205))),
      var(--sakura, oklch(70% 0.12 18));
    box-shadow: inset 0 0 0 1px oklch(98% 0.008 82 / 0.38);
  }

  &:hover {
    transform: translateY(-1px);
    border-color: ${(p) => (p.$dark ? "oklch(80% 0.1 24 / 0.42)" : "oklch(76% 0.1 24 / 0.48)")};
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
  border: 1px solid oklch(84% 0.038 38 / 0.3);
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
        : "oklch(90% 0.018 35 / 0.68)"
      : p.$active
        ? "var(--sakura-deep, oklch(48% 0.12 24))"
        : "oklch(38% 0.036 52)"};
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
        : "oklch(96% 0.045 24 / 0.78)"
      : "transparent"};

  span {
    line-height: 1.05;
  }

  em {
    color: ${(p) =>
      p.$dark ? "oklch(86% 0.018 35 / 0.42)" : "oklch(50% 0.04 48 / 0.68)"};
    font-size: 10px;
    font-style: normal;
    font-weight: 800;
  }

  &:hover {
    color: var(--sakura-deep, oklch(48% 0.12 24));
    background: ${(p) =>
      p.$dark ? "oklch(76% 0.12 24 / 0.13)" : "oklch(94% 0.05 24 / 0.22)"};
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
  background: var(--sakura, oklch(70% 0.12 18));
  border-radius: 1px;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LoginLink = styled.button<{ $active?: boolean; $dark?: boolean }>`
  border: 1px solid
    ${(p) =>
      p.$active
        ? "oklch(76% 0.1 24 / 0.48)"
        : p.$dark
          ? "oklch(78% 0.1 24 / 0.22)"
          : "oklch(82% 0.06 24 / 0.38)"};
  border-radius: 8px;
  background: ${(p) =>
    p.$active
      ? "oklch(96% 0.045 24 / 0.78)"
      : p.$dark
        ? "oklch(96% 0.018 30 / 0.07)"
        : "oklch(99% 0.018 76 / 0.72)"};
  color: ${(p) =>
    p.$active ? "var(--sakura-deep, oklch(48% 0.12 24))" : p.$dark ? "oklch(92% 0.018 30 / 0.72)" : "oklch(38% 0.06 42)"};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  white-space: nowrap;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: var(--sakura-deep, oklch(48% 0.12 24));
    background: ${(p) =>
      p.$dark
        ? "oklch(96% 0.018 30 / 0.12)"
        : "oklch(99% 0.018 76 / 0.92)"};
    border-color: oklch(76% 0.1 24 / 0.42);
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
