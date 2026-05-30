import { Component, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { SettingsProvider } from "./Settings";
import NavBar from "./components/NavBar";

const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/Login"));
const Me = lazy(() => import("./pages/Me"));
const JiangsuMap3D = lazy(() => import("./pages/JiangsuMap3D"));
const Experiences = lazy(() => import("./pages/Experiences"));
const QA = lazy(() => import("./pages/QA"));

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

  if (isLogin) return <>{children}</>;
  return (
    <>
      <NavBar />
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
          <AppLayout>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/me" element={<Me />} />
                <Route path="/home" element={<Home />} />
                <Route path="/jiangsu" element={<JiangsuMap3D />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/qa" element={<QA />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </BrowserRouter>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
