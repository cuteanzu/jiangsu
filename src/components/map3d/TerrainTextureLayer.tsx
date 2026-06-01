import { useMemo } from "react";
import * as THREE from "three";

const TEX_SIZE = 256;

function generateTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#FCF9F5";
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  const imageData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
  const data = imageData.data;

  function hash(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  function fbm(px: number, py: number): number {
    let n = 0; let amp = 1; let freq = 1; let total = 0;
    for (let o = 0; o < 4; o++) {
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

  // Subtle paper fiber noise
  for (let py = 0; py < TEX_SIZE; py++) {
    for (let px = 0; px < TEX_SIZE; px++) {
      const i = (py * TEX_SIZE + px) * 4;
      const n = fbm(px, py);
      const r = 250 + n * 7;
      const g = 247 + n * 7;
      const b = 241 + n * 8;
      data[i] = Math.min(255, r);
      data[i + 1] = Math.min(255, g);
      data[i + 2] = Math.min(255, b);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Green wash — Jiangnan south (Suzhou/Wuxi)
  const greenGrad = ctx.createRadialGradient(TEX_SIZE * 0.70, TEX_SIZE * 0.62, 0, TEX_SIZE * 0.70, TEX_SIZE * 0.62, TEX_SIZE * 0.35);
  greenGrad.addColorStop(0, "rgba(165,200,160,0.12)");
  greenGrad.addColorStop(1, "rgba(165,200,160,0)");
  ctx.fillStyle = greenGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Blue wash — east / Taihu / Yangtze
  const blueGrad = ctx.createRadialGradient(TEX_SIZE * 0.82, TEX_SIZE * 0.46, 0, TEX_SIZE * 0.82, TEX_SIZE * 0.46, TEX_SIZE * 0.30);
  blueGrad.addColorStop(0, "rgba(165,198,225,0.11)");
  blueGrad.addColorStop(1, "rgba(165,198,225,0)");
  ctx.fillStyle = blueGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Warm wash — northwest (Xuzhou)
  const warmGrad = ctx.createRadialGradient(TEX_SIZE * 0.16, TEX_SIZE * 0.26, 0, TEX_SIZE * 0.16, TEX_SIZE * 0.26, TEX_SIZE * 0.38);
  warmGrad.addColorStop(0, "rgba(232,208,192,0.10)");
  warmGrad.addColorStop(1, "rgba(232,208,192,0)");
  ctx.fillStyle = warmGrad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Delicate terrain contour lines — paper grain feel
  ctx.globalAlpha = 0.045;
  ctx.strokeStyle = "#BFAD90";
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    const y0 = (i / 22) * TEX_SIZE + (hash(i, 0) - 0.5) * 45;
    ctx.moveTo(0, y0);
    for (let x = 35; x < TEX_SIZE; x += 35) {
      ctx.lineTo(x, y0 + (hash(i, x) - 0.5) * 48);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // Scattered subtle fiber marks (like handmade paper)
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 120; i++) {
    const fx = hash(i, 1) * TEX_SIZE;
    const fy = hash(i, 2) * TEX_SIZE;
    ctx.beginPath();
    ctx.arc(fx, fy, hash(i, 3) * 25 + 2, 0, Math.PI * 2);
    ctx.fillStyle = hash(i, 4) > 0.5 ? "#D8CCB8" : "#E8DCD0";
    ctx.fill();
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} renderOrder={0}>
      <planeGeometry args={[9, 8.5]} />
      <meshBasicMaterial map={texture} transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
