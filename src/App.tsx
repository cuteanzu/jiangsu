import { Component, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { SettingsProvider } from "./Settings";
import NavBar from "./components/NavBar";
import PageTransitionOverlay from "./components/PageTransitionOverlay";
import { TransitionProvider } from "./context/TransitionContext";
import "./styles/interactions.css";

const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/Login"));
const Me = lazy(() => import("./pages/Me"));
const Schools = lazy(() => import("./pages/Schools"));
const JiangsuMap3D = lazy(() => import("./pages/JiangsuMap3D"));
const Experiences = lazy(() => import("./pages/Experiences"));
const ExperienceDetail = lazy(() => import("./pages/ExperienceDetail"));
const QA = lazy(() => import("./pages/QA"));
const QADetail = lazy(() => import("./pages/QADetail"));

const PageShell = styled.main`
  padding-top: var(--nav-height);
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
`;

const GlobalStyle = createGlobalStyle`
  :root {
    --nav-height: 72px;
    --font-ui: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
    --font-serif: "Noto Serif SC", "Songti SC", serif;
    --paper: oklch(97% 0.018 78);
    --paper-ink: oklch(22% 0.035 48);
    --paper-muted: oklch(47% 0.032 58);
    --paper-border: oklch(84% 0.032 62 / 0.72);
    --sakura: oklch(70% 0.12 18);
    --sakura-deep: oklch(48% 0.12 24);
    --spring-blue: oklch(56% 0.09 205);
    --spring-green: oklch(56% 0.1 145);
    --apricot: oklch(78% 0.09 66);
    --accent-warm: var(--sakura);
    --accent-blue: var(--spring-blue);
    --accent-green: var(--spring-green);
    --shadow-panel: 0 18px 42px oklch(38% 0.05 40 / 0.09);
    @media (max-width: 640px) {
      --nav-height: 56px;
    }
  }
  html {
    background: oklch(12% 0.018 72);
    color-scheme: light;
  }
  body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: var(--font-ui);
    color: var(--paper-ink);
    background: var(--paper);
  }

  * {
    box-sizing: border-box;
  }

  ::selection {
    background: oklch(82% 0.08 48 / 0.42);
    color: oklch(20% 0.035 55);
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }
`;

function RouteFallback() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", color: "oklch(32% 0.06 48)" }}>
      载入中...
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: "red", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          <h1>Error:</h1>
          <p>{this.state.error.message}</p>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isHome = location.pathname === "/" || location.pathname === "/home";

  if (isLogin) return <>{children}</>;
  return (
    <>
      <NavBar $hideOnScroll={isHome} />
      <PageTransitionOverlay />
      <PageShell>{children}</PageShell>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <GlobalStyle />
        <BrowserRouter>
          <TransitionProvider>
            <AppLayout>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/me" element={<Me />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/schools" element={<Schools />} />
                  <Route path="/jiangsu" element={<JiangsuMap3D />} />
                  <Route path="/jiangsu/:citySlug" element={<JiangsuMap3D />} />
                  <Route path="/map" element={<JiangsuMap3D />} />
                  <Route path="/map/:citySlug" element={<JiangsuMap3D />} />
                  <Route path="/experiences" element={<Experiences />} />
                  <Route path="/experiences/:experienceId" element={<ExperienceDetail />} />
                  <Route path="/qa" element={<QA />} />
                  <Route path="/qa/:qaId" element={<QADetail />} />
                </Routes>
              </Suspense>
            </AppLayout>
          </TransitionProvider>
        </BrowserRouter>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
