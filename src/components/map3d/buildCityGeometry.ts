import * as THREE from "three";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import type { GeoProjection } from "d3-geo";

export interface CityGeometryResult {
  name: string;
  geometries: THREE.BufferGeometry[];
  success: boolean;
  error?: string;
}

/**
 * Build extruded 3D geometry for one Jiangsu city from a GeoJSON feature.
 *
 * Pure function — does NOT use React hooks.
 *
 * V1: processes outer rings only (holes are skipped to ensure every city body renders).
 */
export function buildCityGeometry(
  feature: Feature<MultiPolygon | Polygon>,
  projection: GeoProjection,
): CityGeometryResult {
  const name = (feature.properties?.name ?? "未知").replace(/市$/, "");
  const geomType = feature.geometry.type;
  const coordinates = feature.geometry.coordinates;

  try {
    // ── Normalize to an array of polygon coordinate sets ──
    type PolygonCoords = Array<Array<[number, number]>>; // [outer, hole1, hole2...]

    let polygonSets: PolygonCoords[];

    if (geomType === "Polygon") {
      // coordinates = [outerRing, hole1, hole2, ...]
      polygonSets = [coordinates as PolygonCoords];
    } else if (geomType === "MultiPolygon") {
      // coordinates = [[outerRing, hole1, ...], [outerRing, hole1, ...], ...]
      polygonSets = coordinates as PolygonCoords[];
    } else {
      return { name, geometries: [], success: false, error: `Unknown geometry type: ${geomType}` };
    }

    const geometries: THREE.BufferGeometry[] = [];

    for (let pIdx = 0; pIdx < polygonSets.length; pIdx++) {
      const rings = polygonSets[pIdx];
      if (!rings || rings.length === 0) continue;

      const outerRing = rings[0];
      // V1: skip holes to guarantee the main body renders
      // const holeRings = rings.slice(1);

      // ── Project & filter outer ring ──
      const projected: Array<[number, number]> = [];
      for (const [lng, lat] of outerRing) {
        const pt = projection([lng, lat]);
        if (!pt) continue;
        const [px, py] = pt;
        if (isNaN(px) || isNaN(py)) continue;
        // x = px, y = -py (so the map faces right-way-up after rotateX(-PI/2))
        projected.push([px, -py]);
      }

      // Remove duplicate consecutive points
      const clean: Array<[number, number]> = [];
      for (let i = 0; i < projected.length; i++) {
        const prev = clean[clean.length - 1];
        const curr = projected[i];
        if (!prev || Math.abs(curr[0] - prev[0]) > 1e-8 || Math.abs(curr[1] - prev[1]) > 1e-8) {
          clean.push(curr);
        }
      }

      if (clean.length < 4) {
        console.warn(`[buildCityGeometry] ${name} polygon[${pIdx}]: too few valid points (${clean.length}), skipping`);
        continue;
      }

      // Auto-close ring if needed
      const first = clean[0];
      const last = clean[clean.length - 1];
      if (Math.abs(first[0] - last[0]) > 1e-8 || Math.abs(first[1] - last[1]) > 1e-8) {
        clean.push([first[0], first[1]]);
      }

      // ── Build THREE.Shape ──
      const shape = new THREE.Shape();
      shape.moveTo(clean[0][0], clean[0][1]);
      for (let i = 1; i < clean.length; i++) {
        shape.lineTo(clean[i][0], clean[i][1]);
      }
      // shape.closePath() is implicit when we push the first point at the end

      // ── Extrude ──
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.18,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
      });

      // Rotate to lay flat on XZ plane; Y becomes extrusion height
      geo.rotateX(-Math.PI / 2);

      geometries.push(geo);
    }

    if (geometries.length === 0) {
      return { name, geometries: [], success: false, error: "No valid polygon rings produced geometry" };
    }

    return { name, geometries, success: true };
  } catch (err) {
    return { name, geometries: [], success: false, error: String(err) };
  }
}
