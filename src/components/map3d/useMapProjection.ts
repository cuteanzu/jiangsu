import { useEffect, useState } from "react";
import * as THREE from "three";
import { geoMercator } from "d3-geo";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

// ── Result types ──

export interface CityGeometryResult {
  name: string;
  geometries: THREE.BufferGeometry[];
  success: boolean;
  error?: string;
}

export interface MapProjectionResult {
  cities: CityGeometryResult[];
  featuresCount: number;
  successCount: number;
  failCount: number;
}

interface GeoProps {
  adcode: number;
  name: string;
}

type JiangsuGeoJSON = FeatureCollection<MultiPolygon | Polygon, GeoProps>;

// ── Internal helpers ──

interface RawRing {
  projected: Array<[number, number]>;
}

interface RawCity {
  name: string;
  rings: RawRing[];
}

/**
 * Load Jiangsu GeoJSON, project ALL coordinates, compute a global 2D
 * bounding box, normalize every point into an 8×8 target area centered
 * at origin, then build extruded 3D geometry for each city.
 *
 * The projection → normalization pipeline:
 *   1. d3.geoMercator().fitExtent([[-5,-5],[5,5]], geoJson)
 *   2. Collect every projected (px, py) across all cities
 *   3. Compute global 2D bounds (minX, maxX, minY, maxY)
 *   4. Normalize: sx = (px - centerX) * scale, sy = -(py - centerY) * scale
 *   5. Build THREE.Shape from (sx, sy)
 *   6. ExtrudeGeometry + rotateX(-PI/2) → map lies flat on XZ, Y is thickness
 */
export function useMapProjection(): MapProjectionResult | null {
  const [result, setResult] = useState<MapProjectionResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/jiangsu-geo.json")
      .then((r) => r.json())
      .then((data: JiangsuGeoJSON) => {
        if (cancelled) return;

        // ═══ Log raw data ═══
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

        // ═══ Step 1: Create projection ═══
        const projection = geoMercator().fitExtent(
          [
            [-5, -5],
            [5, 5],
          ],
          data,
        );

        // ═══ Step 2: Project ALL points & collect global 2D bounds ═══
        const rawCities: RawCity[] = [];
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const feature of data.features) {
          const name = (feature.properties?.name ?? "").replace(/市$/, "");
          if (!name) continue;

          const rawRings: RawRing[] = [];

          // Normalize to array-of-ring-arrays
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

              // Track global 2D bounds
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

        console.log("[3D MAP] global projected bounds:", {
          x: [minX.toFixed(3), maxX.toFixed(3)],
          y: [minY.toFixed(3), maxY.toFixed(3)],
        });

        // ═══ Step 3: Compute normalization ═══
        const width = maxX - minX;
        const height = maxY - minY;
        const targetSize = 8;
        const normScale = targetSize / Math.max(width, height);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        console.log("[3D MAP] normalization:", {
          width: width.toFixed(3),
          height: height.toFixed(3),
          normScale: normScale.toFixed(4),
          centerX: centerX.toFixed(3),
          centerY: centerY.toFixed(3),
        });

        // ═══ Step 4: Build geometry for each city with normalized coords ═══
        const cities: CityGeometryResult[] = [];
        let successCount = 0;
        let failCount = 0;

        for (const rawCity of rawCities) {
          try {
            const geometries: THREE.BufferGeometry[] = [];

            for (const ring of rawCity.rings) {
              const clean = cleanRing(ring.projected);

              if (clean.length < 4) {
                console.warn(
                  `[3D MAP] ${rawCity.name}: ring too small after cleaning (${clean.length} pts), skipping`,
                );
                continue;
              }

              // Build Shape with normalized coords
              const shape = new THREE.Shape();
              const [sx0, sy0] = normalize(clean[0], centerX, centerY, normScale);
              shape.moveTo(sx0, sy0);
              for (let i = 1; i < clean.length; i++) {
                const [sxi, syi] = normalize(clean[i], centerX, centerY, normScale);
                shape.lineTo(sxi, syi);
              }

              // Extrude
              const geo = new THREE.ExtrudeGeometry(shape, {
                depth: 0.18,
                bevelEnabled: true,
                bevelSize: 0.025,
                bevelThickness: 0.025,
                bevelSegments: 2,
              });

              // Rotate: XY-plane shape → XZ-plane map, Z-extrusion → Y-height
              geo.rotateX(-Math.PI / 2);

              // Verify Y size
              geo.computeBoundingBox();
              if (geo.boundingBox) {
                const gSize = new THREE.Vector3();
                geo.boundingBox.getSize(gSize);
                if (gSize.y > 1) {
                  console.error(
                    `[3D MAP] ${rawCity.name}: invalid Y size ${gSize.y.toFixed(2)}, expected < 1`,
                  );
                }
              }

              geometries.push(geo);
            }

            if (geometries.length > 0) {
              cities.push({ name: rawCity.name, geometries, success: true });
              successCount++;
              console.log(
                `[3D MAP]   ✓ ${rawCity.name}: ${geometries.length} geometry piece(s)`,
              );
            } else {
              cities.push({
                name: rawCity.name,
                geometries: [],
                success: false,
                error: "No valid rings",
              });
              failCount++;
            }
          } catch (err) {
            cities.push({
              name: rawCity.name,
              geometries: [],
              success: false,
              error: String(err),
            });
            failCount++;
            console.warn(`[3D MAP]   ✗ ${rawCity.name}: ${String(err)}`);
          }
        }

        const totalMeshes = cities.reduce((s, c) => s + c.geometries.length, 0);
        console.log(
          `[3D MAP] done: ${cities.length} cities, ${totalMeshes} meshes (success=${successCount}, fail=${failCount})`,
        );

        if (!cancelled) {
          setResult({
            cities,
            featuresCount: data.features.length,
            successCount,
            failCount,
          });
        }
      })
      .catch((err) => {
        console.error("[3D MAP] Failed to load GeoJSON:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}

// ── Normalization helpers ──

function normalize(
  pt: [number, number],
  centerX: number,
  centerY: number,
  scale: number,
): [number, number] {
  const sx = (pt[0] - centerX) * scale;
  const sy = -(pt[1] - centerY) * scale; // negate so map faces +Y after rotateX
  return [sx, sy];
}

function cleanRing(ring: Array<[number, number]>): Array<[number, number]> {
  // Remove consecutive duplicates
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

  // Auto-close
  if (result.length >= 3) {
    const first = result[0];
    const last = result[result.length - 1];
    if (Math.abs(first[0] - last[0]) > 1e-9 || Math.abs(first[1] - last[1]) > 1e-9) {
      result.push([first[0], first[1]]);
    }
  }

  return result;
}
