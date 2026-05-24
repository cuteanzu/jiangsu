import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import JiangsuExtrudedMap from "./JiangsuExtrudedMap";
import CityBeacons from "./CityBeacons";
import SchoolPins from "./SchoolPins";
import CameraController from "./CameraController";
import { useMapProjection } from "./useMapProjection";
import type { CityGeometryResult } from "./useMapProjection";
import { CAMERA_POSITION, CAMERA_FOV } from "./mapTheme";

// ═══════════════════════  Decorations OFF — keep code, don't render ═══════════════════════
const ENABLE_WATER = false;
const ENABLE_LANDMARKS = false;
const ENABLE_TERRAIN = false;
const ENABLE_HEATMAP = false;
const MAP_BACKGROUND =
  "radial-gradient(ellipse at 52% 38%, rgba(195, 210, 235, 0.16) 0%, transparent 54%), " +
  "radial-gradient(ellipse at 82% 22%, rgba(248, 215, 205, 0.18) 0%, transparent 40%), " +
  "radial-gradient(ellipse at 20% 75%, rgba(245, 225, 215, 0.12) 0%, transparent 35%), " +
  "linear-gradient(146deg, #fff9f1 0%, #fbf2ee 37%, #eef6ff 73%, #fff7df 100%)";

// ── Props ──
export interface MapSceneProps {
  hoveredName: string | null;
  selectedName: string | null;
  selectedSchoolName: string | null;
  hoveredSchoolName: string | null;
  showAllPins: boolean;
  hideOverlays: boolean;
  onHover: (name: string) => void;
  onUnhover: () => void;
  onSelect: (name: string) => void;
  onHoverSchool: (name: string | null) => void;
  onSelectSchool: (name: string | null) => void;
}

// ═══════════════════════  Diorama Stage ═══════════════════════

/**
 * Large elliptical glow — warm pink + soft blue mix under the map.
 * Creates the diorama "display platform" feel.
 */
function StageGlow() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const half = 256;

    // Elliptical: wider than tall
    ctx.save();
    ctx.translate(half, half);
    ctx.scale(1, 0.72);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, half);
    grad.addColorStop(0, "rgba(255,240,230,0.48)");
    grad.addColorStop(0.22, "rgba(252,232,222,0.30)");
    grad.addColorStop(0.45, "rgba(235,228,245,0.14)");
    grad.addColorStop(0.70, "rgba(220,235,252,0.05)");
    grad.addColorStop(1, "rgba(240,238,232,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(-half, -half, 1024, 1024);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.008, 0]} renderOrder={0}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial map={texture} transparent opacity={0.48} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * Receiving surface — shadow-only, no visible color board.
 */
function StageFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]} receiveShadow renderOrder={0}>
      <planeGeometry args={[15, 15]} />
      <shadowMaterial transparent opacity={0.38} />
    </mesh>
  );
}

// ═══════════════════════  3D Scene Content ═══════════════════════

function Scene3D({
  cities, hoveredName, selectedName, selectedSchoolName,
  hoveredSchoolName, showAllPins, hideOverlays,
  onHover, onUnhover, onSelect,
  onHoverSchool, onSelectSchool,
}: {
  cities: CityGeometryResult[];
  hoveredName: string | null;
  selectedName: string | null;
  selectedSchoolName: string | null;
  hoveredSchoolName: string | null;
  showAllPins: boolean;
  hideOverlays: boolean;
  onHover: (n: string) => void;
  onUnhover: () => void;
  onSelect: (n: string) => void;
  onHoverSchool: (name: string | null) => void;
  onSelectSchool: (name: string | null) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      {/* ── Map body ── */}
      {cities.length > 0 && (
        <JiangsuExtrudedMap
          cities={cities} hoveredCity={hoveredName} selectedCity={selectedName}
          onHover={onHover} onUnhover={onUnhover} onSelect={onSelect}
        />
      )}

      {/* ── Diorama stage ── */}
      <StageFloor />
      <StageGlow />

      {/* ── Decorations (disabled) ── */}
      {ENABLE_TERRAIN && <TerrainTextureLayerLazy />}
      {ENABLE_HEATMAP && <HeatmapLayerLazy selectedCity={selectedName} />}
      {ENABLE_WATER && <JiangsuWaterSystemLazy />}
      {ENABLE_LANDMARKS && <MiniCampusLandmarksLazy hoveredCity={hoveredName} selectedCity={selectedName} />}

      {/* ── Core interaction layers ── */}
      <CityBeacons selectedCity={selectedName} hoveredCity={hoveredName} hideLabels={hideOverlays} />
      <SchoolPins
        selectedCity={selectedName}
        hoveredSchoolName={hoveredSchoolName}
        selectedSchoolName={selectedSchoolName}
        showAll={showAllPins}
        hideLabels={hideOverlays}
        onHoverSchool={onHoverSchool}
        onSelectSchool={onSelectSchool}
      />

      {/* ── Contact shadows: diorama grounding, above stage ── */}
      <ContactShadows
        position={[0, -0.022, 0]}
        opacity={0.45}
        scale={11}
        blur={3.5}
        far={5}
        resolution={512}
        renderOrder={1}
      />

      {/* ── Camera ── */}
      <CameraController selectedCity={selectedName} controlsRef={controlsRef} />

      {/* ═══════════════════════  Diorama Lighting ═══════════════════════ */}

      {/* Low ambient — keeps shadows visible */}
      <ambientLight intensity={0.55} color="#FFF8F2" />

      {/* Hemisphere — sky + ground gradient for diorama feel */}
      <hemisphereLight
        color="#FFFDF8"
        groundColor="#F1D7C5"
        intensity={0.45}
      />

      {/* Key light: strong shadow-casting sun */}
      <directionalLight
        position={[-4, 8, 5]}
        intensity={2.8}
        color="#FFFDF8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0003}
      />

      {/* Fill light: warm right-side */}
      <directionalLight
        position={[4, 4, -4]}
        intensity={0.65}
        color="#FFF5F0"
      />

      {/* Subtle back rim */}
      <directionalLight
        position={[0, 3, -6]}
        intensity={0.35}
        color="#F5F0FF"
      />

      {/* ── Orbit controls ── */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping={false}
        minDistance={3}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

// ═══════════════════════  Lazy wrappers (tree-shaken when flags off) ═══════════════════════

import JiangsuWaterSystem from "./JiangsuWaterSystem";
import MiniCampusLandmarks from "./MiniCampusLandmarks";
import TerrainTextureLayer from "./TerrainTextureLayer";
import HeatmapLayer from "./HeatmapLayer";

function JiangsuWaterSystemLazy() { return <JiangsuWaterSystem />; }
function MiniCampusLandmarksLazy({ hoveredCity, selectedCity }: { hoveredCity: string | null; selectedCity: string | null }) {
  return <MiniCampusLandmarks hoveredCity={hoveredCity} selectedCity={selectedCity} />;
}
function TerrainTextureLayerLazy() { return <TerrainTextureLayer />; }
function HeatmapLayerLazy({ selectedCity }: { selectedCity: string | null }) {
  return <HeatmapLayer selectedCity={selectedCity} />;
}

// ═══════════════════════  Styles ═══════════════════════

// ═══════════════════════  Main Component ═══════════════════════

export default function MapScene({
  hoveredName, selectedName, selectedSchoolName,
  hoveredSchoolName, showAllPins, hideOverlays,
  onHover, onUnhover, onSelect,
  onHoverSchool, onSelectSchool,
}: MapSceneProps) {
  const mapResult = useMapProjection();

  const cities = mapResult?.cities ?? [];
  const geoLoaded = mapResult !== null;
  const featuresCount = mapResult?.featuresCount ?? 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* HUD: selected */}
      {!hideOverlays && (
        <div
          style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 10, pointerEvents: "none",
            fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
            fontSize: 14, fontWeight: 700,
            color: selectedSchoolName ? "#c76b5e" : "#5a3a2a",
            background: selectedName || selectedSchoolName ? "rgba(255,252,247,0.85)" : "transparent",
            border: selectedName || selectedSchoolName ? "1px solid rgba(200,140,120,0.25)" : "none",
            borderRadius: 10,
            padding: selectedName || selectedSchoolName ? "6px 18px" : 0,
            backdropFilter: (selectedName || selectedSchoolName) ? "blur(10px)" : "none",
            transition: "all 0.28s ease",
          }}
        >
          {selectedSchoolName
            ? `已选择：${selectedSchoolName}，可查看校园详情`
            : selectedName
              ? `已选择：${selectedName}市，发现这里的高校生活`
              : ""}
        </div>
      )}

      {/* HUD: status bar */}
      {!hideOverlays && (
        <div
          style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 10, pointerEvents: "none",
            fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
            fontSize: 12, fontWeight: 600,
            color: (selectedName || selectedSchoolName) ? "#c76b5e" : hoveredName ? "#5a3a2a" : "#8b7d73",
            opacity: 1, transition: "color 0.22s ease",
          }}
        >
          {selectedSchoolName
            ? `已选择：${selectedSchoolName}，可查看校园详情`
            : hoveredSchoolName
              ? `正在查看：${hoveredSchoolName}`
              : selectedName
                ? ""
                : hoveredName
                  ? `正在查看：${hoveredName}市`
                  : "点击城市，看看这里有哪些大学"}
        </div>
      )}

      {geoLoaded && featuresCount !== 13 && (
        <div style={{
          position: "absolute", bottom: 48, left: 12, zIndex: 20,
          background: "rgba(200,60,60,0.85)", color: "#fff",
          fontFamily: "monospace", fontSize: 11, padding: "6px 10px", borderRadius: 6, pointerEvents: "none",
        }}>
          GeoJSON features 数量异常，当前为 {featuresCount}，不是 13
        </div>
      )}

      {/* Diorama backdrop: center warm cream, top-left peach, bottom-right blue */}
      <Canvas
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.1, far: 50 }}
        style={{
          background: MAP_BACKGROUND,
        }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ scene, gl }) => {
          scene.background = null;
          gl.setClearColor(new THREE.Color("#FFF8F0"), 0);
        }}
        shadows
        onPointerMissed={() => onUnhover()}
      >
        <Suspense fallback={null}>
          <Scene3D
            cities={cities} hoveredName={hoveredName} selectedName={selectedName}
            selectedSchoolName={selectedSchoolName}
            hoveredSchoolName={hoveredSchoolName}
            showAllPins={showAllPins}
            hideOverlays={hideOverlays}
            onHover={onHover} onUnhover={onUnhover} onSelect={onSelect}
            onHoverSchool={onHoverSchool}
            onSelectSchool={onSelectSchool}
          />
        </Suspense>
      </Canvas>

      {!mapResult && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#8b7d73", fontFamily: '"Noto Sans SC","PingFang SC",sans-serif',
          fontSize: 14, pointerEvents: "none",
        }}>
          加载地图数据中…
        </div>
      )}
    </div>
  );
}
