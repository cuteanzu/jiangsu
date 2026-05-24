import { useMemo } from "react";
import * as THREE from "three";
import { CITY_UNIVERSITY_COUNT, CITY_CENTERS } from "./mapTheme";
import type { CityCenter } from "./mapTheme";

/**
 * Soft campus heatmap: light blue → green → yellow → coral pink.
 * NormalBlending for gentle glow; lower opacity to avoid regulatory look.
 */

interface HeatmapLayerProps {
  selectedCity: string | null;
}

const MAX_COUNT = 26;
const TEX_SIZE = 256;

function hotspotRadius(count: number): number {
  const t = count / MAX_COUNT;
  return 0.32 + t * 0.90;
}

function generateGradientTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d")!;

  const half = TEX_SIZE / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0,   "rgba(255,150,140,0.55)");  // core: soft coral
  grad.addColorStop(0.30,"rgba(255,210,160,0.42)");  // warm peach
  grad.addColorStop(0.60,"rgba(180,220,160,0.30)");  // soft green
  grad.addColorStop(0.82,"rgba(150,200,230,0.18)");  // light blue
  grad.addColorStop(1,   "rgba(180,210,240,0)");      // fade out

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  return canvas;
}

function Hotspot({ h, radius, opacity }: { h: CityCenter; radius: number; opacity: number }) {
  const texture = useMemo(() => {
    const canvas = generateGradientTexture();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const geo = useMemo(() => new THREE.PlaneGeometry(radius * 2, radius * 2), [radius]);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[h.x, 0.34, h.z]} renderOrder={2}>
      <meshBasicMaterial
        map={texture} transparent opacity={opacity}
        depthWrite={false} side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function HeatmapLayer({ selectedCity }: HeatmapLayerProps) {
  return (
    <group>
      {CITY_CENTERS.map((h) => {
        const count = CITY_UNIVERSITY_COUNT[h.name] ?? 1;
        const radius = hotspotRadius(count);
        const isSelected = selectedCity === h.name;
        const isDimmed = selectedCity !== null && !isSelected;
        const opacity = isSelected ? 0.75 : isDimmed ? 0.28 : 0.50;
        return <Hotspot key={h.name} h={h} radius={radius} opacity={opacity} />;
      })}
    </group>
  );
}
