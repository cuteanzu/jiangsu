import { useMemo } from "react";
import { geoMercator } from "d3-geo";
import { useGeoJSON } from "./useGeoJSON";
import type { JiangsuGeoJSON } from "./useGeoJSON";

export interface SchoolSceneCoord {
  x: number;
  y: number;
  z: number;
}

type ToSceneFn = (lat: number, lng: number) => SchoolSceneCoord;

/**
 * Replicates the same d3-geo projection + normalization pipeline as
 * useMapProjection, but only exposes a coordinate converter for
 * placing school pins on the 3D map surface.
 *
 * Uses the shared useGeoJSON() hook — no duplicate fetch.
 * Returns null while the GeoJSON is loading.
 */
export function useSchoolProjection(): ToSceneFn | null {
  const geoData = useGeoJSON();

  const converter = useMemo(() => {
    if (!geoData) return null;
    return buildConverter(geoData);
  }, [geoData]);

  return converter;
}

function buildConverter(data: JiangsuGeoJSON): ToSceneFn {
  // Step 1: same d3 projection
  const projection = geoMercator().fitExtent(
    [[-5, -5], [5, 5]],
    data,
  );

  // Step 2: collect global 2D bounds
  let minX = Infinity; let maxX = -Infinity;
  let minY = Infinity; let maxY = -Infinity;

  for (const feature of data.features) {
    const polygons: Array<Array<Array<[number, number]>>> =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates as Array<Array<[number, number]>>]
        : feature.geometry.type === "MultiPolygon"
          ? feature.geometry.coordinates as Array<Array<Array<[number, number]>>>
          : [];

    for (const polygon of polygons) {
      const ring = polygon[0];
      if (!ring) continue;
      for (const [lng, lat] of ring) {
        const pt = projection([lng, lat]);
        if (!pt) continue;
        const [px, py] = pt;
        if (isNaN(px) || isNaN(py)) continue;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
  }

  // Step 3: compute normalization params
  const width = maxX - minX;
  const height = maxY - minY;
  const targetSize = 8;
  const normScale = targetSize / Math.max(width, height);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Step 4: return converter function
  return (lat: number, lng: number): SchoolSceneCoord => {
    const pt = projection([lng, lat]);
    if (!pt) return { x: 0, y: 0.4, z: 0 };
    const [px, py] = pt;
    const x = (px - centerX) * normScale;
    const z = -(py - centerY) * normScale;
    return { x, y: 0.40, z };
  };
}
