import { UNIVERSITIES } from "../../data/jiangsu-universities";

// ══════════════════════════════════════════════════
// Image sets — three independent groups, no overlap
// ══════════════════════════════════════════════════

// ── A. 氛围背景 (AtmosphereLayer) — 6 张 ──
// 全屏固定背景，Ken Burns 缓慢缩放 + 随滚动 crossfade
// 内容：南京城市风景、山水、标志性景观
export const ATMOS_PHOTOS = [
  { src: "/media/atm-01.jpg", alt: "南京全景" },
  { src: "/media/atm-02.jpg", alt: "钟山风景区" },
  { src: "/media/atm-03.jpg", alt: "玄武湖" },
  { src: "/media/atm-04.jpg", alt: "秦淮河" },
  { src: "/media/atm-05.jpg", alt: "明城墙" },
  { src: "/media/atm-06.jpg", alt: "长江大桥" },
];

// ── B. 3D 发散图 (Reel3D + Filmstrip) — 10 张 ──
// 3D 透视空间中从中心向外发散 + 首屏底部缩略图滚动条
// x/y/z in rem — coordinates and spread pattern matched from kaitonote reel
export const REEL_PHOTOS = [
  { src: "/media/placeholder-reel.svg", alt: "校园 1", x: -48, y: -24, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 2", x: 32, y: 42, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 3", x: -60, y: 26, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 4", x: 52, y: -26, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 5", x: -26, y: -52, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 6", x: 48, y: 56, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 7", x: -44, y: 48, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 8", x: 52, y: 26, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 9", x: -60, y: -26, z: -5000 },
  { src: "/media/placeholder-reel.svg", alt: "校园 10", x: 26, y: -52, z: -5000 },
];

// Filmstrip reuses reel photos
export const FILMSTRIP_PHOTOS = REEL_PHOTOS;

// ── C. 展示图 (FeaturedUniversities + Dimensions) — 6 张 ──
// 院校卡片背景 + 择校维度左栏
// 内容：校园生活、学生、实验室、宿舍、食堂等场景
export const DISPLAY_PHOTOS = [
  { src: "/media/placeholder-feat.svg", alt: "校园生活" },
  { src: "/media/placeholder-feat.svg", alt: "实验室" },
  { src: "/media/placeholder-feat.svg", alt: "学生活动" },
  { src: "/media/placeholder-feat.svg", alt: "宿舍区" },
  { src: "/media/placeholder-feat.svg", alt: "运动场馆" },
  { src: "/media/placeholder-feat.svg", alt: "校园夜景" },
];

// ══════════════════════════════════════════════════
// Content data
// ══════════════════════════════════════════════════

// ── Dimensions ──

export const DIMENSIONS = [
  {
    number: "01",
    title: "学校",
    text: "江苏 13 个城市的 47 所本科院校，从 985 到特色本科，按所在城市和层次分布。",
    tag: "城市分布 · 学校层次",
  },
  {
    number: "02",
    title: "专业",
    text: "每所学校的优势学科和专业方向，找到和你兴趣匹配的那一个。",
    tag: "学科评估 · 专业方向",
  },
  {
    number: "03",
    title: "生活",
    text: "宿舍条件、食堂水平、城市消费——不只是选学校，也是选未来四年的生活方式。",
    tag: "住宿 · 饮食 · 城市消费",
  },
  {
    number: "04",
    title: "未来",
    text: "保研率、考研去向、就业数据，毕业后的路径提前了解。",
    tag: "升学 · 就业 · 发展",
  },
];

// ── Featured universities ──

export const TIER_COLORS: Record<string, string> = {
  "985": "#c76b5e",
  "211": "#d29669",
  dual: "#69a0c8",
  provincial: "#789b69",
};

const FEATURED_IDS = ["nju", "seu", "suda", "jiangnan", "cumt", "njnu"];

export function getFeatured() {
  return FEATURED_IDS.map((id) => UNIVERSITIES.find((u) => u.id === id)!);
}

// ── Marquee names for Contact ──

export const MARQUEE_NAMES = UNIVERSITIES.map((u) => u.name);

// ══════════════════════════════════════════════════
// D. Gallery photos — 6 张，用于摄影展示区
// ══════════════════════════════════════════════════
// GalleryWall (4 landscape + 2 portrait) + BladeRows (复用 3 landscape)
// 内容：校园建筑细节、学生生活、图书馆、自然特写、夜景、四季

export const GALLERY_PHOTOS = [
  { src: "/media/placeholder-gallery.svg", alt: "校园建筑细节" },
  { src: "/media/placeholder-gallery.svg", alt: "学生生活瞬间", portrait: true },
  { src: "/media/placeholder-gallery.svg", alt: "图书馆内景" },
  { src: "/media/placeholder-gallery.svg", alt: "校园自然特写", portrait: true },
  { src: "/media/placeholder-gallery.svg", alt: "校园夜景" },
  { src: "/media/placeholder-gallery.svg", alt: "四季校园" },
];

// Grid layout map for GalleryWall: which items span extra columns
// 2 = grid-column: span 2, -1 = no special span
export const GALLERY_LAYOUT: number[] = [2, -1, -1, 2, -1, 2];

// ── E. BladeRows: Nanjing — 4 张，单行交替布局 ──

export const BLADE_PHOTOS = [
  { src: "/media/placeholder-gallery.svg", alt: "梧桐大道", portrait: true },
  { src: "/media/placeholder-gallery.svg", alt: "金陵学府" },
  { src: "/media/placeholder-gallery.svg", alt: "秦淮流韵", portrait: true },
  { src: "/media/placeholder-gallery.svg", alt: "钟山毓秀" },
];
