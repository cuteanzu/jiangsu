// ═══════════════════════════════════════════
// 江苏高校探索沙盘 — 视觉结构重整
// 干净低多边形沙盘 / 告别线框感
// ═══════════════════════════════════════════

export interface CityColor {
  name: string;
  base: string;
  hover: string;
  side: string;
}

// 13 cities — bright clean pastels
// Side colors ~22% darker for top/bottom face vs side wall differentiation
export const cityPalette: CityColor[] = [
  { name: "南京", base: "#F6BFD2", hover: "#FCD8E6", side: "#CC8DA5" },
  { name: "苏州", base: "#CFEAFF", hover: "#E2F3FF", side: "#A3C2DB" },
  { name: "无锡", base: "#D9F2E1", hover: "#EAF8EF", side: "#ADCAB9" },
  { name: "常州", base: "#FFE2AD", hover: "#FFEDCA", side: "#D9BA85" },
  { name: "徐州", base: "#DED6FA", hover: "#EDE8FC", side: "#B6ACD6" },
  { name: "南通", base: "#F9D2C0", hover: "#FCE3D6", side: "#D3A896" },
  { name: "盐城", base: "#C6E8FF", hover: "#D9F0FF", side: "#9CC0DB" },
  { name: "连云港", base: "#E5D6FF", hover: "#F1E8FF", side: "#BDAADB" },
  { name: "扬州", base: "#FCE7B8", hover: "#FDF0D0", side: "#D8C190" },
  { name: "镇江", base: "#DCEED8", hover: "#EAF6E8", side: "#B4C8B0" },
  { name: "泰州", base: "#F7D5E8", hover: "#FBE4F0", side: "#CFABC0" },
  { name: "淮安", base: "#DDE9FF", hover: "#EDF3FF", side: "#B3C1DB" },
  { name: "宿迁", base: "#E7E0F8", hover: "#F2EEFB", side: "#BFB6D4" },
];

export const cityColorMap = new Map(cityPalette.map((c) => [c.name, c]));

export function cityColors(name: string): CityColor {
  return cityColorMap.get(name) ?? { name, base: "#F2E4D0", hover: "#F8EFE2", side: "#D6C8B4" };
}

// ── University counts ──
export const CITY_UNIVERSITY_COUNT: Record<string, number> = {
  "南京": 26, "苏州": 6, "徐州": 4, "无锡": 3, "常州": 3,
  "镇江": 2, "盐城": 2, "泰州": 2, "南通": 2, "淮安": 2,
  "扬州": 1, "宿迁": 1, "连云港": 1,
};

// ── City center positions ──
export interface CityCenter {
  name: string;
  x: number;
  z: number;
}

export const CITY_CENTERS: CityCenter[] = [
  { name: "南京", x: -2.0, z: -0.5 },
  { name: "苏州", x: 2.5, z: 2.5 },
  { name: "无锡", x: 1.8, z: 1.8 },
  { name: "常州", x: 1.3, z: 1.3 },
  { name: "徐州", x: -2.5, z: -2.8 },
  { name: "南通", x: 2.5, z: 0.5 },
  { name: "盐城", x: 1.0, z: -1.5 },
  { name: "扬州", x: -0.2, z: -0.3 },
  { name: "镇江", x: -0.2, z: 0.0 },
  { name: "泰州", x: 0.8, z: -0.5 },
  { name: "淮安", x: -0.5, z: -1.8 },
  { name: "宿迁", x: -1.2, z: -2.2 },
  { name: "连云港", x: 0.5, z: -3.0 },
];

// ── Highlight & edge colors ──
export const SELECTED_COLOR = "#F4A08F";     // soft pink-coral, not warning red
export const EDGE_DEFAULT = "#FFFFFF";        // white top outline
export const EDGE_HOVER = "#FFD6C8";          // warm peach
export const EDGE_SELECTED = "#FF8E7A";       // coral

// ── Beacon colors ──
export const BEACON_WARM = "#FFE8C0";
export const BEACON_PINK = "#FFD0D8";
export const BEACON_BLUE = "#C8E0FF";

// ── Constants ──
export const EXTRUDE_DEPTH = 0.18;
export const DIM_OPACITY = 0.84;
export const BASE_OPACITY = 1.0;
export const SELECTED_OPACITY = 0.90;
export const HOVER_LIFT = 0.07;
export const HOVER_SCALE = 1.012;
export const ROUGHNESS = 0.62;
export const METALNESS = 0.02;
export const CAMERA_POSITION: [number, number, number] = [0, 6.4, 5.4];
export const CAMERA_FOV = 38;
export const CAMERA_TARGET: [number, number, number] = [0, 0, 0];

// City-closeup: formula-based — keeps camera back so 4-6 cities remain visible
// target = [clampedX, 0, clampedZ]
// position = [cx * 0.36, 6.0, cz * 0.36 + 5.6]
export const CITY_CAMERA_FACTOR = 0.36;
export const CITY_CAMERA_Y = 6.0;
export const CITY_CAMERA_Z_BASE = 5.6;

// ── Beacon height tiers ──
export const BEACON_HEIGHT: Record<string, number> = {
  default: 0.24,
  large: 0.48,
  medium: 0.36,
  small: 0.28,
};

export const BEACON_CITIES: string[] = [
  "南京", "苏州", "徐州", "无锡", "常州",
];

export const PROVINCE_VISIBLE_LABELS: string[] = [
  "南京", "苏州", "徐州", "无锡", "常州", "南通", "连云港",
];

export const LABEL_CITIES: string[] = [
  "南京", "苏州", "徐州", "无锡", "常州",
  "南通", "盐城", "连云港", "扬州", "镇江", "淮安", "泰州", "宿迁",
];
