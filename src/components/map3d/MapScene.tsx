import { lazy, Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import JiangsuExtrudedMap from "./JiangsuExtrudedMap";
import CityBeacons from "./CityBeacons";
import SchoolPins from "./SchoolPins";
import CameraController from "./CameraController";
import { useMapProjection } from "./useMapProjection";
import type { CityGeometryResult } from "./useMapProjection";
import { CAMERA_POSITION, CAMERA_TARGET } from "./mapTheme";
import type { CityCenter } from "./mapTheme";
import type { University } from "../../data/jiangsu-universities";

// ── Decoration toggles ──
const ENABLE_WATER = true;
const ENABLE_LANDMARKS = false;
const ENABLE_TERRAIN = true;
const ENABLE_HEATMAP = false;

const MAP_BACKGROUND =
  "radial-gradient(ellipse at 50% 35%, rgba(252,250,245,0.55) 0%, transparent 55%), " +
  "radial-gradient(ellipse at 80% 25%, rgba(245,225,220,0.13) 0%, transparent 40%), " +
  "radial-gradient(ellipse at 25% 70%, rgba(225,235,245,0.10) 0%, transparent 35%), " +
  "linear-gradient(160deg, #FCFAF5 0%, #F8F4F0 40%, #F2F0F5 100%)";

export interface MapSceneProps {
  universities: University[];
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
  onCameraSettled?: (city: string | null) => void;
}

// ═══════════════════════  Diorama Stage ═══════════════════════

function StageGlow() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const half = 256;

    ctx.save();
    ctx.translate(half, half);
    ctx.scale(1, 0.68);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, half);
    grad.addColorStop(0, "rgba(255,248,240,0.52)");
    grad.addColorStop(0.15, "rgba(252,240,228,0.36)");
    grad.addColorStop(0.35, "rgba(248,235,222,0.20)");
    grad.addColorStop(0.60, "rgba(240,235,240,0.08)");
    grad.addColorStop(0.85, "rgba(235,240,248,0.03)");
    grad.addColorStop(1, "rgba(242,238,232,0)");
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} renderOrder={0}>
      <planeGeometry args={[11, 10]} />
      <meshBasicMaterial map={texture} transparent opacity={0.62} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function StageFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]} renderOrder={0}>
      <planeGeometry args={[15, 15]} />
      <shadowMaterial transparent opacity={0.28} />
    </mesh>
  );
}

// ═══════════════════════  3D Scene Content ═══════════════════════

function Scene3D({
  cities, cityCenters, hoveredName, selectedName, selectedSchoolName,
  hoveredSchoolName, showAllPins, hideOverlays, universities,
  onHover, onUnhover, onSelect,
  onHoverSchool, onSelectSchool,
  onCameraSettled,
}: {
  cities: CityGeometryResult[];
  cityCenters: CityCenter[];
  universities: University[];
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
  onCameraSettled?: (city: string | null) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      {cities.length > 0 && (
        <JiangsuExtrudedMap
          cities={cities} hoveredCity={hoveredName} selectedCity={selectedName}
          onHover={onHover} onUnhover={onUnhover} onSelect={onSelect}
        />
      )}

      <StageFloor />
      <StageGlow />

      {ENABLE_WATER && <JiangsuWaterSystemLazy />}
      {ENABLE_TERRAIN && <TerrainTextureLayerLazy />}
      {ENABLE_HEATMAP && <HeatmapLayerLazy selectedCity={selectedName} cityCenters={cityCenters} />}
      {ENABLE_LANDMARKS && <MiniCampusLandmarksLazy hoveredCity={hoveredName} selectedCity={selectedName} />}
      <PaperAtmosphereLazy />

      <CityBeacons
        cityCenters={cityCenters}
        selectedCity={selectedName}
        hoveredCity={hoveredName}
        hideLabels={hideOverlays}
      />
      <SchoolPins
        universities={universities}
        selectedCity={selectedName}
        hoveredSchoolName={hoveredSchoolName}
        selectedSchoolName={selectedSchoolName}
        showAll={showAllPins}
        hideLabels={hideOverlays}
        onHoverSchool={onHoverSchool}
        onSelectSchool={onSelectSchool}
      />

      <CameraController
        selectedCity={selectedName}
        cityCenters={cityCenters}
        controlsRef={controlsRef}
        onSettled={onCameraSettled}
      />

      {/* ── Paper Diorama Lighting ── */}
      <ambientLight intensity={0.75} color="#FFFBF6" />
      <hemisphereLight color="#FFFDF8" groundColor="#EDDFD0" intensity={0.42} />

      <directionalLight
        position={[-2, 9, 4]}
        intensity={2.2}
        color="#FFFEFB"
      />

      <directionalLight position={[3, 4, -3]} intensity={0.55} color="#FFF8F2" />
      <directionalLight position={[0, 2, -5]} intensity={0.30} color="#F5F0F8" />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableRotate={false}
        enableDamping={false}
        minDistance={3}
        maxDistance={15}
        target={CAMERA_TARGET}
      />
    </>
  );
}

// ═══════════════════════  Lazy wrappers ═══════════════════════

const JiangsuWaterSystemLazy = lazy(() => import("./JiangsuWaterSystem"));
const MiniCampusLandmarksLazy = lazy(() => import("./MiniCampusLandmarks"));
const TerrainTextureLayerLazy = lazy(() => import("./TerrainTextureLayer"));
const HeatmapLayerLazy = lazy(() => import("./HeatmapLayer"));
const PaperAtmosphereLazy = lazy(() => import("./PaperAtmosphere"));

// ═══════════════════════  Main Component ═══════════════════════

export default function MapScene({
  universities, hoveredName, selectedName, selectedSchoolName,
  hoveredSchoolName, showAllPins, hideOverlays,
  onHover, onUnhover, onSelect,
  onHoverSchool, onSelectSchool,
  onCameraSettled,
}: MapSceneProps) {
  const mapResult = useMapProjection();

  const cities = mapResult?.cities ?? [];
  const cityCenters = mapResult?.cityCenters ?? [];
  const geoLoaded = mapResult !== null;
  const featuresCount = mapResult?.featuresCount ?? 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {geoLoaded && featuresCount !== 13 && (
        <div style={{
          position: "absolute", bottom: 48, left: 12, zIndex: 20,
          background: "rgba(200,60,60,0.85)", color: "#fff",
          fontFamily: "monospace", fontSize: 11, padding: "6px 10px", borderRadius: 6, pointerEvents: "none",
        }}>
          GeoJSON features 数量异常，当前为 {featuresCount}，不是 13
        </div>
      )}

      <Canvas
        style={{ background: MAP_BACKGROUND }}
        camera={{ position: CAMERA_POSITION, fov: 35, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop="demand"
        onPointerMissed={() => onUnhover()}
      >
        <Suspense fallback={null}>
          <Scene3D
            cities={cities}
            cityCenters={cityCenters}
            universities={universities}
            hoveredName={hoveredName}
            selectedName={selectedName}
            selectedSchoolName={selectedSchoolName}
            hoveredSchoolName={hoveredSchoolName}
            showAllPins={showAllPins}
            hideOverlays={hideOverlays}
            onHover={onHover}
            onUnhover={onUnhover}
            onSelect={onSelect}
            onHoverSchool={onHoverSchool}
            onSelectSchool={onSelectSchool}
            onCameraSettled={onCameraSettled}
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
