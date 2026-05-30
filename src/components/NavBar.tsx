import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const NAV_ITEMS = [
  { path: "/", label: "首页" },
  { path: "/jiangsu", label: "探索地图" },
  { path: "/experiences", label: "校园经验" },
  { path: "/qa", label: "问答" },
] as const;

const Bar = styled.nav<{ $dark?: boolean }>`
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

  ${(p) =>
    p.$active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: #c76b5e;
      border-radius: 1px;
    }
  `}

  @media (max-width: 640px) {
    font-size: 13px;
    padding: 6px 8px;
  }
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

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

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
    <Bar $dark={isDark}>
      <Brand $dark={isDark} onClick={() => navigate("/")}>
        江苏高校地图
      </Brand>
      <Links>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            $active={isActive(item.path)}
            $dark={isDark}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </NavLink>
        ))}
        <LoginLink
          $active={isActive("/me")}
          $dark={isDark}
          onClick={() => navigate("/me")}
        >
          我
        </LoginLink>
      </Links>
    </Bar>
  );
}
