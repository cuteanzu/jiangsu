import { useMemo } from "react";
import * as THREE from "three";

/**
 * Light paper-texture overlay for campus sandbox feel.
 * Subtle noise, soft color washes, delicate terrain lines.
 */

const TEX_SIZE = 512;

function generateTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d")!;

  // ── Warm cream base ──
  ctx.fillStyle = "#FCFAF5";
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // ── Gentle 3-octave value noise for paper grain ──
  const imageData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
  const data = imageData.data;

  function hash(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  function fbm(px: number, py: number): number {
    let n = 0; let amp = 1; let freq = 1; let total = 0;
    for (let o = 0; o < 3; o++) {
      const sx = (px * freq) / TEX_SIZE;
      const sy = (py * freq) / TEX_SIZE;
      const ix = Math.floor(sx * 48);
      const iy = Math.floor(sy * 48);
      const fx = (sx * 48) - ix;
      const fy = (sy * 48) - iy;
      const a = hash(ix, iy);
      const b = hash(ix + 1, iy);
      const c = hash(ix, iy + 1);
      const d = hash(ix + 1, iy + 1);
      n += (a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy) * amp;
      total += amp;
      amp *= 0.5; freq *= 2;
    }
    return n / total;
  }

  for (let py = 0; py < TEX_SIZE; py++) {
    for (let px = 0; px < TEX_SIZE; px++) {
      const i = (py * TEX_SIZE + px) * 4;
      const n = fbm(px, py);
      const r = 252 + n * 5;
      const g = 249 + n * 6;
      const b = 244 + n * 7;
      data[i] = Math.min(255, r);
      data[i + 1] = Math.min(255, g);
      data[i + 2] = Math.min(255, b);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // ── Soft green wash (Jiangnan area — south, Suzhou/Wuxi) ──
  const greenGrad = ctx.createRadialGradient(TEX_SIZE * 0.72, TEX_SIZE * 0.65, 0, TEX_SIZE * 0.72, TEX_SIZE * 0.65, TEX_SIZE * 0.35);
  greenGrad.addColorStop(0, "rgba(180,210,175,0.07)");
  greenGrad.addColorStop(1, "rgba(180,210,175,0)");
  ctx.fillStyle = greenGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // ── Soft blue wash (east coast / Taihu / Yangtze) ──
  const blueGrad = ctx.createRadialGradient(TEX_SIZE * 0.82, TEX_SIZE * 0.48, 0, TEX_SIZE * 0.82, TEX_SIZE * 0.48, TEX_SIZE * 0.28);
  blueGrad.addColorStop(0, "rgba(180,210,230,0.06)");
  blueGrad.addColorStop(1, "rgba(180,210,230,0)");
  ctx.fillStyle = blueGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // ── Soft pink-warm wash (northwest — Xuzhou area) ──
  const warmGrad = ctx.createRadialGradient(TEX_SIZE * 0.18, TEX_SIZE * 0.28, 0, TEX_SIZE * 0.18, TEX_SIZE * 0.28, TEX_SIZE * 0.38);
  warmGrad.addColorStop(0, "rgba(240,215,200,0.06)");
  warmGrad.addColorStop(1, "rgba(240,215,200,0)");
  ctx.fillStyle = warmGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // ── Subtle Yangtze River hint (thin horizontal blue-green band) ──
  ctx.save();
  ctx.globalAlpha = 0.05;
  const riverY = TEX_SIZE * 0.55; // River runs roughly through the middle
  const riverGrad = ctx.createLinearGradient(0, riverY - 20, 0, riverY + 20);
  riverGrad.addColorStop(0, "rgba(180,210,225,0)");
  riverGrad.addColorStop(0.5, "rgba(180,210,225,0.8)");
  riverGrad.addColorStop(1, "rgba(180,210,225,0)");
  ctx.fillStyle = riverGrad;
  // Gently curve the river band west→east
  ctx.beginPath();
  ctx.moveTo(0, riverY - 8);
  ctx.quadraticCurveTo(TEX_SIZE * 0.3, riverY - 12, TEX_SIZE * 0.6, riverY);
  ctx.quadraticCurveTo(TEX_SIZE * 0.85, riverY + 10, TEX_SIZE, riverY + 6);
  ctx.lineTo(TEX_SIZE, riverY + 22);
  ctx.quadraticCurveTo(TEX_SIZE * 0.85, riverY + 26, TEX_SIZE * 0.6, riverY + 16);
  ctx.quadraticCurveTo(TEX_SIZE * 0.3, riverY + 4, 0, riverY + 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── Delicate terrain lines ──
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = "#C0B090";
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    const y0 = (i / 15) * TEX_SIZE + (hash(i, 0) - 0.5) * 40;
    ctx.moveTo(0, y0);
    for (let x = 50; x < TEX_SIZE; x += 50) {
      ctx.lineTo(x, y0 + (hash(i, x) - 0.5) * 50);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  return canvas;
}

export default function TerrainTextureLayer() {
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.255, 0]} renderOrder={1}>
      <planeGeometry args={[9, 8.5]} />
      <meshBasicMaterial map={texture} transparent opacity={0.10} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
