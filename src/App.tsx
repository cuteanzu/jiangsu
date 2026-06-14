import { Component, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { SettingsProvider } from "./Settings";
import NavBar from "./components/NavBar";
import PageTransitionOverlay from "./components/PageTransitionOverlay";
import { TransitionProvider } from "./context/TransitionContext";
import { hasAuthToken } from "./hooks/useAuth";
import "./styles/interactions.css";

const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/Login"));
const Me = lazy(() => import("./pages/Me"));
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
    @media (max-width: 640px) {
      --nav-height: 56px;
    }
  }
  html {
    background: #080d14;
  }
  body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
`;

function RouteFallback() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center", fontFamily: "serif", color: "#4a3040" }}>
      载入中...
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const next = `${location.pathname}${location.search}`;
  return hasAuthToken() ? <>{children}</> : <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
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
                  <Route path="/me" element={<ProtectedRoute><Me /></ProtectedRoute>} />
                  <Route path="/home" element={<Home />} />
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
