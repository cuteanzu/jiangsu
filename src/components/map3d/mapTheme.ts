// ═══════════════════════════════════════════
// 江苏高校探索沙盘 — 江南纸雕风格视觉结构
// ═══════════════════════════════════════════

import { countTierOnePlusByCity } from "../../data/jiangsu-universities";

export interface CityColor {
  name: string;
  base: string;
  hover: string;
  side: string;
}

// ── Paper diorama palette ──
// Top faces: unified rice-paper off-white (subtle per-city warmth variation).
// Side walls: unified light terracotta — like cut paper layers.
export const PAPER_TOP = "#F7F3EC";
export const PAPER_HOVER = "#FCFAF5";
export const PAPER_SIDE = "#E8DDD2";
export const PAPER_SELECTED = "#EAD5C0";

export const cityPalette: CityColor[] = [
  { name: "南京", base: "#F8F3EB", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "苏州", base: "#F7F2EB", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "无锡", base: "#F7F3EC", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "常州", base: "#F7F2EA", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "徐州", base: "#F8F4ED", hover: "#FDFAF6", side: PAPER_SIDE },
  { name: "南通", base: "#F6F2EB", hover: "#FDFAF4", side: PAPER_SIDE },
  { name: "盐城", base: "#F7F3ED", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "连云港", base: "#F7F2EC", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "扬州", base: "#F7F3EB", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "镇江", base: "#F6F2EA", hover: "#FDFAF4", side: PAPER_SIDE },
  { name: "泰州", base: "#F7F3EC", hover: "#FDFAF5", side: PAPER_SIDE },
  { name: "淮安", base: "#F8F3ED", hover: "#FDFAF6", side: PAPER_SIDE },
  { name: "宿迁", base: "#F7F2EC", hover: "#FDFAF5", side: PAPER_SIDE },
];

export const cityColorMap = new Map(cityPalette.map((c) => [c.name, c]));

export function cityColors(name: string): CityColor {
  return cityColorMap.get(name) ?? { name, base: PAPER_TOP, hover: PAPER_HOVER, side: PAPER_SIDE };
}

// ── Tier-one-plus university counts ──
export const CITY_UNIVERSITY_COUNT: Record<string, number> = countTierOnePlusByCity();

// ── Computed city center (produced by useMapProjection at runtime) ──
export interface CityCenter {
  name: string;
  x: number;
  z: number;
}

// ── Paper diorama colors ──
export const SELECTED_COLOR = "#EAD5C0";
export const EDGE_COLOR = "#C8B090";
export const EDGE_OPACITY = 0.48;
export const EDGE_HOVER = "#B8A080";
export const EDGE_SELECTED = "#C8A888";

// ── Beacon colors ──
export const BEACON_WARM = "#F5EDE0";
export const BEACON_PINK = "#F0E5D8";
export const BEACON_BLUE = "#D8E0E8";

// ── Constants (paper diorama edition) ──
export const EXTRUDE_DEPTH = 0.18;
export const BEVEL_SIZE = 0.03;
export const BEVEL_THICKNESS = 0.03;
export const BEVEL_SEGMENTS = 2;
export const DIM_OPACITY = 0.72;
export const BASE_OPACITY = 1.0;
export const SELECTED_OPACITY = 0.92;
export const HOVER_LIFT = 0.05;
export const HOVER_SCALE = 1.008;
export const ROUGHNESS = 0.55;
export const SIDE_ROUGHNESS = 0.62;
export const METALNESS = 0.0;
export const CLEARCOAT = 0.0;

// ── Camera (2.5D diorama view, mild perspective) ──
export const CAMERA_POSITION: [number, number, number] = [0.3, 9.5, 7.2];
export const CAMERA_FOV = 25;
export const CAMERA_TARGET: [number, number, number] = [0, 0, 0];

// City-closeup: ortho zoom adjustment
export const CITY_CAMERA_FACTOR = 0.36;
export const CITY_CAMERA_Y = 6.8;
export const CITY_CAMERA_Z_BASE = 5.8;

// ── Beacon height tiers (paper-diorama: shorter, subtler) ──
export const BEACON_HEIGHT: Record<string, number> = {
  default: 0.16,
  large: 0.32,
  medium: 0.24,
  small: 0.18,
};

export const BEACON_CITIES: string[] = [
  "南京", "苏州", "徐州", "无锡",
];

// Major cities visible by default in overview
export const PROVINCE_VISIBLE_LABELS: string[] = [
  "南京", "苏州", "徐州", "无锡", "常州", "南通", "扬州", "镇江",
];

export const LABEL_CITIES: string[] = [
  "南京", "苏州", "徐州", "无锡", "常州", "南通", "扬州", "镇江",
  "盐城", "淮安", "泰州", "连云港", "宿迁",
];

// ── Scene fog ──
export const FOG_COLOR = "#FCF9F5";
export const FOG_NEAR = 6;
export const FOG_FAR = 16;

// ── Terrain height variation (subtle topography, in world units) ──
export const CITY_BASE_Y: Record<string, number> = {
  "南京": 0.00,
  "苏州": -0.01,
  "无锡": -0.01,
  "常州": 0.00,
  "徐州": 0.02,
  "南通": 0.00,
  "盐城": 0.01,
  "扬州": -0.01,
  "镇江": 0.01,
  "泰州": 0.00,
  "淮安": 0.01,
  "宿迁": 0.02,
  "连云港": 0.01,
};
