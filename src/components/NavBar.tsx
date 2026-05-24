import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const NAV_ITEMS = [
  { path: "/", label: "首页" },
  { path: "/jiangsu", label: "探索地图" },
  { path: "/experiences", label: "校园经验" },
  { path: "/qa", label: "问答" },
] as const;

const Bar = styled.nav`
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
  background: rgba(253, 247, 242, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(180, 150, 130, 0.18);
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 0 18px;
    height: 56px;
  }
`;

const Brand = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: #3a2f28;
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

const NavLink = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: ${(p) => (p.$active ? "#c76b5e" : "#6b5d53")};
  font-weight: ${(p) => (p.$active ? 700 : 500)};
  padding: 6px 14px;
  border-radius: 6px;
  position: relative;
  transition: color 0.25s ease, background 0.25s ease;
  white-space: nowrap;

  &:hover {
    color: #c76b5e;
    background: rgba(199, 107, 94, 0.06);
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

const LoginLink = styled.button`
  border: 1px solid rgba(199, 107, 94, 0.18);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.58);
  color: #8a5a4f;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  white-space: nowrap;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: #c76b5e;
    background: rgba(255, 252, 247, 0.88);
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

  return (
    <Bar>
      <Brand onClick={() => navigate("/")}>江苏高校生活指南</Brand>
      <Links>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            $active={isActive(item.path)}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </NavLink>
        ))}
        <LoginLink onClick={() => navigate("/login")}>登录</LoginLink>
      </Links>
    </Bar>
  );
}
