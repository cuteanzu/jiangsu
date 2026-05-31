import { useMemo } from "react";
import { geoMercator } from "d3-geo";
import type { GeoProjection } from "d3-geo";
import { useGeoJSON } from "../map3d/useGeoJSON";
import type { CityCenter } from "../map3d/mapTheme";

export interface CityPathData {
  name: string;
  pathD: string;
  center: { x: number; y: number };
}

export interface WaterPathData {
  name: string;
  pathD: string;
}

export interface MapProjection2D {
  cityPaths: CityPathData[];
  cityCenters: CityCenter[];
  svgWidth: number;
  svgHeight: number;
  waterPaths: WaterPathData[];
  provinceOutline: string;
}

const SVG_W = 1200;
const SVG_H = 760;
const PAD = 150;

/**
 * Compute the geographic bounding box of all features.
 */
function computeGeoBounds(geoData: any): {
  minLng: number; maxLng: number;
  minLat: number; maxLat: number;
  centerLng: number; centerLat: number;
} {
  let minLng = Infinity; let maxLng = -Infinity;
  let minLat = Infinity; let maxLat = -Infinity;

  for (const feature of geoData.features) {
    const polygons: Array<Array<Array<[number, number]>>> =
      feature.geometry.type === "MultiPolygon"
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];
    for (const polygon of polygons) {
      for (const [lng, lat] of polygon[0]) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }

  return {
    minLng, maxLng, minLat, maxLat,
    centerLng: (minLng + maxLng) / 2,
    centerLat: (minLat + maxLat) / 2,
  };
}

/**
 * Build a Mercator projection centered on Jiangsu's geographic center,
 * scaled to fit within [PAD, SVG_W-PAD] × [PAD, SVG_H-PAD].
 */
function buildProjection(geoData: any): GeoProjection {
  const { centerLng, centerLat } = computeGeoBounds(geoData);
  const mapW = SVG_W - 2 * PAD;
  const mapH = SVG_H - 2 * PAD;

  // First pass: project at scale=1 to find the coordinate spread
  const tmp = geoMercator()
    .center([centerLng, centerLat])
    .scale(1)
    .translate([0, 0]);

  let minX = Infinity; let maxX = -Infinity;
  let minY = Infinity; let maxY = -Infinity;
  for (const feature of geoData.features) {
    const polygons: Array<Array<Array<[number, number]>>> =
      feature.geometry.type === "MultiPolygon"
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];
    for (const polygon of polygons) {
      for (const [lng, lat] of polygon[0]) {
        const pt = tmp([lng, lat]);
        if (pt) {
          if (pt[0] < minX) minX = pt[0];
          if (pt[0] > maxX) maxX = pt[0];
          if (pt[1] < minY) minY = pt[1];
          if (pt[1] > maxY) maxY = pt[1];
        }
      }
    }
  }

  const dataW = maxX - minX;
  const dataH = maxY - minY;
  const scale = Math.min(mapW / dataW, mapH / dataH);

  return geoMercator()
    .center([centerLng, centerLat])
    .scale(scale)
    .translate([SVG_W / 2, SVG_H / 2]);
}

/**
 * Construct an SVG path string from projected polygon vertices.
 * Bypasses d3-geo path generator to avoid clip-extent artifacts.
 */
function buildPathD(
  geometry: { type: string; coordinates: any },
  projection: GeoProjection,
): string {
  const polygons: Array<Array<Array<[number, number]>>> =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [geometry.coordinates];

  const parts: string[] = [];

  for (const polygon of polygons) {
    const ring = polygon[0];
    if (!ring || ring.length === 0) continue;

    let part = "";
    for (let i = 0; i < ring.length; i++) {
      const pt = projection([ring[i][0], ring[i][1]]);
      if (!pt) continue;
      const cmd = i === 0 ? "M" : "L";
      part += `${cmd}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
    }
    if (part) {
      part += "Z";
      parts.push(part);
    }
  }

  return parts.join(" ");
}

/**
 * Compute centroid by averaging projected polygon vertices.
 */
function computeCentroid(
  geometry: { type: string; coordinates: any },
  projection: GeoProjection,
): { x: number; y: number } {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  const polygons: Array<Array<Array<[number, number]>>> =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [geometry.coordinates];

  for (const polygon of polygons) {
    const ring = polygon[0];
    if (!ring) continue;
    for (const [lng, lat] of ring) {
      const pt = projection([lng, lat]);
      if (pt) {
        sumX += pt[0];
        sumY += pt[1];
        count++;
      }
    }
  }

  if (count === 0) return { x: SVG_W / 2, y: SVG_H / 2 };
  return { x: sumX / count, y: sumY / count };
}

function buildProvinceOutline(
  geoData: any,
  projection: GeoProjection,
): string {
  const parts: string[] = [];
  for (const feature of geoData.features) {
    const pathD = buildPathD(feature.geometry, projection);
    if (pathD) parts.push(pathD);
  }
  return parts.join(" ");
}

function buildWaterPaths(cityPaths: CityPathData[]): WaterPathData[] {
  const get = (name: string) => cityPaths.find((c) => c.name === name);
  const paths: WaterPathData[] = [];

  const nj = get("南京");
  const sz = get("苏州");
  const wx = get("无锡");
  const nt = get("南通");
  const yz = get("扬州");
  const zj = get("镇江");
  const ha = get("淮安");

  // Yangtze River
  if (nj && zj && nt) {
    const ry = (nj.center.y + zj.center.y + nt.center.y) / 3;
    paths.push({
      name: "长江",
      pathD: `M${nj.center.x - 100},${ry - 12} Q${nj.center.x + 50},${ry - 24} ${zj.center.x},${ry} Q${nt.center.x - 60},${ry + 10} ${nt.center.x + 80},${ry - 14} Q${SVG_W - PAD + 30},${ry - 24} ${SVG_W - PAD + 40},${ry - 10}`,
    });
  }

  // Taihu Lake
  if (wx && sz) {
    const tx = (wx.center.x + sz.center.x) / 2;
    const ty = (wx.center.y + sz.center.y) / 2 + 30;
    paths.push({
      name: "太湖",
      pathD: `M${tx - 55},${ty - 48} Q${tx + 30},${ty - 75} ${tx + 60},${ty - 18} Q${tx + 70},${ty + 35} ${tx + 35},${ty + 65} Q${tx - 35},${ty + 78} ${tx - 60},${ty + 35} Q${tx - 78},${ty - 5} ${tx - 55},${ty - 48}Z`,
    });
  }

  // Grand Canal
  if (yz && ha && wx) {
    paths.push({
      name: "大运河",
      pathD: `M${yz.center.x - 8},${PAD - 40} Q${yz.center.x + 18},${(PAD + ha.center.y) / 2} ${ha.center.x + 10},${ha.center.y} Q${yz.center.x - 12},${yz.center.y} ${yz.center.x + 8},${yz.center.y + 18} Q${wx.center.x + 15},${wx.center.y} ${wx.center.x - 5},${wx.center.y + 50}`,
    });
  }

  // Hongze Lake
  if (ha) {
    const hx = ha.center.x - 55;
    const hy = ha.center.y - 65;
    paths.push({
      name: "洪泽湖",
      pathD: `M${hx - 30},${hy - 15} Q${hx + 25},${hy - 38} ${hx + 38},${hy + 10} Q${hx + 30},${hy + 38} ${hx - 10},${hy + 45} Q${hx - 35},${hy + 32} ${hx - 42},${hy + 8} Q${hx - 45},${hy - 14} ${hx - 30},${hy - 15}Z`,
    });
  }

  return paths;
}

export function useHandDrawnProjection(): MapProjection2D | null {
  const geoData = useGeoJSON();

  return useMemo(() => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      return null;
    }

    const projection = buildProjection(geoData);

    const cityPaths: CityPathData[] = [];
    const cityCenters: CityCenter[] = [];

    for (const feature of geoData.features) {
      const name = (feature.properties?.name ?? "").replace(/市$/, "");
      if (!name) continue;

      const pathD = buildPathD(feature.geometry, projection);
      if (!pathD) continue;

      const center = computeCentroid(feature.geometry, projection);

      cityPaths.push({ name, pathD, center });
      cityCenters.push({ name, x: center.x, z: center.y });
    }

    const provinceOutline = buildProvinceOutline(geoData, projection);
    const waterPaths = buildWaterPaths(cityPaths);

    return {
      cityPaths,
      cityCenters,
      svgWidth: SVG_W,
      svgHeight: SVG_H,
      waterPaths,
      provinceOutline,
    };
  }, [geoData]);
}
