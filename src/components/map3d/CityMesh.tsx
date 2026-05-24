import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import {
  HOVER_LIFT, HOVER_SCALE, DIM_OPACITY, BASE_OPACITY, SELECTED_OPACITY, SELECTED_COLOR,
  ROUGHNESS, METALNESS, EDGE_DEFAULT, EDGE_SELECTED, EDGE_HOVER,
  cityColors,
} from "./mapTheme";

interface CityMeshProps {
  name: string;
  geometry: THREE.BufferGeometry;
  hovered: boolean;
  selected: boolean;
  dimmed: boolean;
  onPointerEnter: (name: string) => void;
  onPointerLeave: () => void;
  onClick: (name: string) => void;
}

/**
 * Extract only the top-outline horizontal edges (no vertical side lines).
 * After rotateX(-PI/2) the top face of the extrusion is near y = EXTRUDE_DEPTH.
 */
function useTopOutline(geometry: THREE.BufferGeometry): THREE.BufferGeometry | null {
  return useMemo(() => {
    const full = new THREE.EdgesGeometry(geometry, 15);
    const pos = full.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    // Find the max Y (top face)
    let maxY = -Infinity;
    for (let i = 0; i < arr.length; i += 3) {
      if (arr[i + 1] > maxY) maxY = arr[i + 1];
    }

    // Collect horizontal edges near the top face
    const verts: number[] = [];
    for (let i = 0; i < arr.length; i += 6) {
      const y0 = arr[i + 1];
      const y1 = arr[i + 4];
      // Both endpoints at nearly same Y (horizontal) and at top
      if (Math.abs(y0 - y1) < 0.006 && y0 > maxY - 0.025) {
        verts.push(arr[i], arr[i + 1], arr[i + 2], arr[i + 3], arr[i + 4], arr[i + 5]);
      }
    }

    if (verts.length < 6) return null;
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return out;
  }, [geometry]);
}

/**
 * Single extruded city block — diorama low-poly style.
 * Only the top outline is drawn (no side wireframe clutter).
 */
export default function CityMesh({
  name, geometry, hovered, selected, dimmed,
  onPointerEnter, onPointerLeave, onClick,
}: CityMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = cityColors(name);

  const sideColor = useMemo(() => new THREE.Color(colors.side), [colors.side]);
  const baseColor = useMemo(() => new THREE.Color(colors.base), [colors.base]);
  const hoverColor = useMemo(() => new THREE.Color(colors.hover), [colors.hover]);
  const highlightColor = useMemo(() => new THREE.Color(SELECTED_COLOR), []);

  const topOutline = useTopOutline(geometry);
  const hasGroups = useMemo(() => geometry.groups && geometry.groups.length > 1, [geometry]);

  // Only transparent when dimmed
  const isTransparent = dimmed;
  const opacity = selected ? SELECTED_OPACITY : dimmed ? DIM_OPACITY : BASE_OPACITY;

  const [matTop, matSide] = useMemo(() => {
    const topClr = selected ? highlightColor : hovered ? hoverColor : baseColor;
    const sideClr = selected ? highlightColor : hovered ? hoverColor : sideColor;
    const top = new THREE.MeshStandardMaterial({
      color: topClr,
      roughness: ROUGHNESS,
      metalness: METALNESS,
      transparent: isTransparent,
      opacity,
      depthWrite: !isTransparent,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const side = new THREE.MeshStandardMaterial({
      color: sideClr,
      roughness: ROUGHNESS + 0.10,
      metalness: METALNESS,
      transparent: isTransparent,
      opacity,
      depthWrite: !isTransparent,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    return [top, side];
  }, [selected, hovered, isTransparent, opacity, baseColor, hoverColor, highlightColor, sideColor]);

  const singleMat = useMemo(() => {
    const matColor = selected ? highlightColor : hovered ? hoverColor : baseColor;
    return new THREE.MeshStandardMaterial({
      color: matColor,
      roughness: ROUGHNESS,
      metalness: METALNESS,
      transparent: isTransparent,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      opacity,
      depthWrite: !isTransparent,
    });
  }, [selected, hovered, isTransparent, opacity, baseColor, hoverColor, highlightColor]);

  // Edge: only top outline, no side lines
  const edgeColor = selected ? EDGE_SELECTED : hovered ? EDGE_HOVER : EDGE_DEFAULT;
  const edgeOpacity = selected ? 1.0 : hovered ? 0.95 : 0.62;

  // Animation
  const targetScale = hovered || selected ? HOVER_SCALE : 1;
  const targetY = hovered || selected ? HOVER_LIFT : 0;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const scaleDistance = Math.abs(g.scale.x - targetScale);
    const yDistance = Math.abs(g.position.y - targetY);

    if (scaleDistance < 0.001 && yDistance < 0.001) {
      if (scaleDistance > 0 || yDistance > 0) {
        g.scale.setScalar(targetScale);
        g.position.y = targetY;
      }
      return;
    }

    if (scaleDistance < 0.001) {
      g.scale.setScalar(targetScale);
    } else {
      const s = THREE.MathUtils.lerp(g.scale.x, targetScale, Math.min(delta * 10, 1));
      g.scale.setScalar(s);
    }

    if (yDistance < 0.001) {
      g.position.y = targetY;
    } else {
      const y = THREE.MathUtils.lerp(g.position.y, targetY, Math.min(delta * 12, 1));
      g.position.y = y;
    }
  });

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    onPointerEnter(name);
  };
  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "";
    onPointerLeave();
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(name);
  };

  return (
    <group ref={groupRef}>
      {/* Extruded body */}
      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        material={hasGroups ? [matSide, matTop] : singleMat}
      />

      {/* Top outline only — crisp, no side wireframe */}
      {topOutline && (
        <lineSegments geometry={topOutline} raycast={() => {}} renderOrder={4}>
          <lineBasicMaterial
            color={edgeColor}
            transparent
            opacity={edgeOpacity}
            depthTest
          />
        </lineSegments>
      )}
    </group>
  );
}
