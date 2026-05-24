import { useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural CanvasTexture overlay that sits just above the extruded map
 * to give the surface a subtle terrain / paper texture feel.
 * Does NOT obscure city colors or boundaries.
 *
 * Positioned at y=0.255, depthWrite=false, opacity 0.28.
 */

const TEX_SIZE = 512;

function generateTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d")!;

  // ── Base: warm off-white ──
  ctx.fillStyle = "#FEFAF5";
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // ── Perlin-like noise (value noise with multiple octaves) ──
  const imageData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
  const data = imageData.data;

  // Simple hash-based noise at multiple scales
  function hash(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  for (let py = 0; py < TEX_SIZE; py++) {
    for (let px = 0; px < TEX_SIZE; px++) {
      const i = (py * TEX_SIZE + px) * 4;

      // 3-octave noise
      let noise = 0;
      let amp = 1;
      let freq = 1;
      let total = 0;
      for (let o = 0; o < 3; o++) {
        const sx = (px * freq) / TEX_SIZE;
        const sy = (py * freq) / TEX_SIZE;
        const ix = Math.floor(sx * 64);
        const iy = Math.floor(sy * 64);
        const fx = (sx * 64) - ix;
        const fy = (sy * 64) - iy;
        const a = hash(ix, iy);
        const b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1);
        const d = hash(ix + 1, iy + 1);
        const v = a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
        noise += v * amp;
        total += amp;
        amp *= 0.5;
        freq *= 2;
      }
      noise /= total;

      // Map noise to subtle color variation
      const r = 254 + noise * 6;
      const g = 248 + noise * 8;
      const b = 238 + noise * 10;

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // ── Soft color wash gradients ──
  // Light green wash — south/southeast (fertile Jiangnan)
  const greenGrad = ctx.createRadialGradient(TEX_SIZE * 0.75, TEX_SIZE * 0.7, 0, TEX_SIZE * 0.75, TEX_SIZE * 0.7, TEX_SIZE * 0.35);
  greenGrad.addColorStop(0, "rgba(180,220,170,0.08)");
  greenGrad.addColorStop(1, "rgba(180,220,170,0)");
  ctx.fillStyle = greenGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Light blue wash — east coast
  const blueGrad = ctx.createRadialGradient(TEX_SIZE * 0.85, TEX_SIZE * 0.45, 0, TEX_SIZE * 0.85, TEX_SIZE * 0.45, TEX_SIZE * 0.3);
  blueGrad.addColorStop(0, "rgba(170,200,225,0.07)");
  blueGrad.addColorStop(1, "rgba(170,200,225,0)");
  ctx.fillStyle = blueGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Light warm wash — center/northwest
  const warmGrad = ctx.createRadialGradient(TEX_SIZE * 0.25, TEX_SIZE * 0.35, 0, TEX_SIZE * 0.25, TEX_SIZE * 0.35, TEX_SIZE * 0.4);
  warmGrad.addColorStop(0, "rgba(245,230,200,0.07)");
  warmGrad.addColorStop(1, "rgba(245,230,200,0)");
  ctx.fillStyle = warmGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  return canvas;
}

export default function SurfaceTextureOverlay() {
  const texture = useMemo(() => {
    const canvas = generateTexture();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.255, 0]}
      renderOrder={1}
    >
      <planeGeometry args={[9, 8.5]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.28}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
