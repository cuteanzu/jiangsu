import { useEffect } from "react";
import * as THREE from "three";
import CityMesh from "./CityMesh";
import type { CityGeometryResult } from "./useMapProjection";

interface JiangsuExtrudedMapProps {
  cities: CityGeometryResult[];
  hoveredCity: string | null;
  selectedCity: string | null;
  onHover: (name: string) => void;
  onUnhover: () => void;
  onSelect: (name: string) => void;
  showDebug?: boolean;
  onBoxReady?: (boxCenter: THREE.Vector3, boxSize: THREE.Vector3) => void;
}

/**
 * Renders all Jiangsu city meshes in a group.
 * Debug helpers (grid, axes) only render when showDebug is true.
 */
export default function JiangsuExtrudedMap({
  cities,
  hoveredCity,
  selectedCity,
  onHover,
  onUnhover,
  onSelect,
  showDebug = false,
  onBoxReady,
}: JiangsuExtrudedMapProps) {
  useEffect(() => {
    if (!showDebug) return;

    console.log(
      "[JiangsuExtrudedMap] rendering:",
      cities.map((c) => `${c.name}(${c.geometries.length})`).join(", "),
    );

    if (!onBoxReady) return;

    // Compute Box3 for debug panel (temporary group, not used for positioning)
    const timer = setTimeout(() => {
      const tempGroup = new THREE.Group();
      cities.forEach((city) => {
        city.geometries.forEach((geo) => {
          tempGroup.add(new THREE.Mesh(geo));
        });
      });
      const box = new THREE.Box3().setFromObject(tempGroup);
      onBoxReady(box.getCenter(new THREE.Vector3()), box.getSize(new THREE.Vector3()));
    }, 100);

    return () => clearTimeout(timer);
  }, [cities, onBoxReady, showDebug]);

  return (
    <group>
      {showDebug && (
        <>
          <axesHelper args={[5]} />
          <gridHelper args={[10, 10, "#c8b8a8", "#e8ddd0"]} />
        </>
      )}

      {cities.map((city) =>
        city.geometries.map((geo, i) => (
          <CityMesh
            key={`${city.name}-geometry-${i}`}
            name={city.name}
            geometry={geo}
            hovered={hoveredCity === city.name}
            selected={selectedCity === city.name}
            dimmed={selectedCity !== null && selectedCity !== city.name}
            onPointerEnter={onHover}
            onPointerLeave={onUnhover}
            onClick={onSelect}
          />
        )),
      )}
    </group>
  );
}
