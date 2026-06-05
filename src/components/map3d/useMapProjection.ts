import { useMemo } from "react";
import * as THREE from "three";
import { geoMercator } from "d3-geo";
import { useGeoJSON } from "./useGeoJSON";
import type { JiangsuGeoJSON } from "./useGeoJSON";
import { EXTRUDE_DEPTH, BEVEL_SIZE, BEVEL_THICKNESS, BEVEL_SEGMENTS } from "./mapTheme";
import type { CityCenter } from "./mapTheme";

const DEBUG_MAP_PROJECTION = import.meta.env.DEV;

// ── Result types ──

export interface CityGeometryResult {
  name: string;
  geometries: THREE.BufferGeometry[];
  /** Computed XZ center of the city's extruded geometry */
  center: { x: number; z: number };
  success: boolean;
  error?: string;
}

export interface MapProjectionResult {
  cities: CityGeometryResult[];
  /** Computed city centers keyed by city name */
  cityCenters: CityCenter[];
  featuresCount: number;
  successCount: number;
  failCount: number;
}

// ── Internal helpers ──

interface RawRing {
  projected: Array<[number, number]>;
}

interface RawCity {
  name: string;
  rings: RawRing[];
}

function normalize(
  pt: [number, number],
  centerX: number,
  centerY: number,
  scale: number,
): [number, number] {
  const sx = (pt[0] - centerX) * scale;
  const sy = -(pt[1] - centerY) * scale;
  return [sx, sy];
}

function cleanRing(ring: Array<[number, number]>): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let i = 0; i < ring.length; i++) {
    const prev = result[result.length - 1];
    const curr = ring[i];
    if (
      !prev ||
      Math.abs(curr[0] - prev[0]) > 1e-9 ||
      Math.abs(curr[1] - prev[1]) > 1e-9
    ) {
      result.push(curr);
    }
  }
  if (result.length >= 3) {
    const first = result[0];
    const last = result[result.length - 1];
    if (Math.abs(first[0] - last[0]) > 1e-9 || Math.abs(first[1] - last[1]) > 1e-9) {
      result.push([first[0], first[1]]);
    }
  }
  return result;
}

function computeCityCenter(geometries: THREE.BufferGeometry[]): { x: number; z: number } {
  const box = new THREE.Box3();
  geometries.forEach((geo) => {
    if (!geo.boundingBox) geo.computeBoundingBox();
    if (geo.boundingBox) box.expandByObject(new THREE.Mesh(geo));
  });
  const center = new THREE.Vector3();
  box.getCenter(center);
  return { x: center.x, z: center.z };
}

/**
 * Load Jiangsu GeoJSON (shared via useGeoJSON), project coordinates,
 * normalize into 8x8 target area, build extruded 3D geometry per city.
 *
 * Pipeline:
 *   1. d3.geoMercator().fitExtent([[-5,-5],[5,5]], geoJson)
 *   2. Collect every projected (px, py) across all cities
 *   3. Compute global 2D bounds (minX, maxX, minY, maxY)
 *   4. Normalize: sx = (px - centerX) * scale, sy = -(py - centerY) * scale
 *   5. Build THREE.Shape from (sx, sy)
 *   6. ExtrudeGeometry + rotateX(-PI/2) -> map lies flat on XZ, Y is thickness
 *   7. Compute per-city bounding box center for beacon placement
 */
export function useMapProjection(): MapProjectionResult | null {
  const geoData = useGeoJSON();

  // Build the projection pipeline (memoized, depends only on geoData)
  return useMemo(() => {
    if (!geoData) return null;
    return buildFromGeoJSON(geoData);
  }, [geoData]);
}

function buildFromGeoJSON(data: JiangsuGeoJSON): MapProjectionResult {
  if (DEBUG_MAP_PROJECTION) {
    console.log("[3D MAP] geo loaded — type:", data.type);
    console.log("[3D MAP] features count:", data.features.length);
    console.table(
      data.features.map((f) => ({
        name: f.properties?.name ?? "?",
        type: f.geometry?.type,
        rings: JSON.stringify(
          f.geometry.type === "MultiPolygon"
            ? f.geometry.coordinates.length
            : 1,
        ),
      })),
    );
  }

  // Step 1: Create projection
  const projection = geoMercator().fitExtent(
    [[-5, -5], [5, 5]],
    data,
  );

  // Step 2: Project ALL points & collect global 2D bounds
  const rawCities: RawCity[] = [];
  let minX = Infinity; let maxX = -Infinity;
  let minY = Infinity; let maxY = -Infinity;

  for (const feature of data.features) {
    const name = (feature.properties?.name ?? "").replace(/市$/, "");
    if (!name) continue;

    const rawRings: RawRing[] = [];
    let polygons: Array<Array<Array<[number, number]>>>;
    if (feature.geometry.type === "Polygon") {
      polygons = [feature.geometry.coordinates as Array<Array<[number, number]>>];
    } else if (feature.geometry.type === "MultiPolygon") {
      polygons = feature.geometry.coordinates as Array<Array<Array<[number, number]>>>;
    } else {
      continue;
    }

    for (const polygon of polygons) {
      const outerRing = polygon[0];
      if (!outerRing || outerRing.length < 4) continue;

      const projected: Array<[number, number]> = [];
      for (const [lng, lat] of outerRing) {
        const pt = projection([lng, lat]);
        if (!pt) continue;
        const [px, py] = pt;
        if (isNaN(px) || isNaN(py)) continue;
        projected.push([px, py]);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }

      if (projected.length >= 4) {
        rawRings.push({ projected });
      }
    }

    if (rawRings.length > 0) {
      rawCities.push({ name, rings: rawRings });
    }
  }

  if (DEBUG_MAP_PROJECTION) {
    console.log("[3D MAP] global projected bounds:", {
      x: [minX.toFixed(3), maxX.toFixed(3)],
      y: [minY.toFixed(3), maxY.toFixed(3)],
    });
  }

  // Step 3: Compute normalization
  const width = maxX - minX;
  const height = maxY - minY;
  const targetSize = 8;
  const normScale = targetSize / Math.max(width, height);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  if (DEBUG_MAP_PROJECTION) {
    console.log("[3D MAP] normalization:", {
      width: width.toFixed(3),
      height: height.toFixed(3),
      normScale: normScale.toFixed(4),
      centerX: centerX.toFixed(3),
      centerY: centerY.toFixed(3),
    });
  }

  // Step 4: Build geometry for each city
  const cities: CityGeometryResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const rawCity of rawCities) {
    try {
      const geometries: THREE.BufferGeometry[] = [];

      for (const ring of rawCity.rings) {
        const clean = cleanRing(ring.projected);
        if (clean.length < 4) {
          if (DEBUG_MAP_PROJECTION) {
            console.warn(
              `[3D MAP] ${rawCity.name}: ring too small after cleaning (${clean.length} pts), skipping`,
            );
          }
          continue;
        }

        const shape = new THREE.Shape();
        const [sx0, sy0] = normalize(clean[0], centerX, centerY, normScale);
        shape.moveTo(sx0, sy0);
        for (let i = 1; i < clean.length; i++) {
          const [sxi, syi] = normalize(clean[i], centerX, centerY, normScale);
          shape.lineTo(sxi, syi);
        }

        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: EXTRUDE_DEPTH,
          bevelEnabled: true,
          bevelSize: BEVEL_SIZE,
          bevelThickness: BEVEL_THICKNESS,
          bevelSegments: BEVEL_SEGMENTS,
        });

        geo.rotateX(-Math.PI / 2);
        geometries.push(geo);
      }

      if (geometries.length > 0) {
        const center = computeCityCenter(geometries);
        cities.push({ name: rawCity.name, geometries, center, success: true });
        successCount++;
        if (DEBUG_MAP_PROJECTION) {
          console.log(
            `[3D MAP]   ✓ ${rawCity.name}: ${geometries.length} piece(s), center=(${center.x.toFixed(2)}, ${center.z.toFixed(2)})`,
          );
        }
      } else {
        cities.push({
          name: rawCity.name,
          geometries: [],
          center: { x: 0, z: 0 },
          success: false,
          error: "No valid rings",
        });
        failCount++;
      }
    } catch (err) {
      cities.push({
        name: rawCity.name,
        geometries: [],
        center: { x: 0, z: 0 },
        success: false,
        error: String(err),
      });
      failCount++;
      if (DEBUG_MAP_PROJECTION) {
        console.warn(`[3D MAP]   ✗ ${rawCity.name}: ${String(err)}`);
      }
    }
  }

  const totalMeshes = cities.reduce((s, c) => s + c.geometries.length, 0);
  if (DEBUG_MAP_PROJECTION) {
    console.log(
      `[3D MAP] done: ${cities.length} cities, ${totalMeshes} meshes (success=${successCount}, fail=${failCount})`,
    );
  }

  const cityCenters: CityCenter[] = cities
    .filter((c) => c.success)
    .map((c) => ({ name: c.name, x: c.center.x, z: c.center.z }));

  if (DEBUG_MAP_PROJECTION) {
    console.table(cityCenters.map((c) => ({ name: c.name, x: c.x.toFixed(2), z: c.z.toFixed(2) })));
  }

  return {
    cities,
    cityCenters,
    featuresCount: data.features.length,
    successCount,
    failCount,
  };
}
