import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import {
  HOVER_LIFT, HOVER_SCALE, DIM_OPACITY, BASE_OPACITY, SELECTED_OPACITY, SELECTED_COLOR,
  ROUGHNESS, SIDE_ROUGHNESS, METALNESS,
  EDGE_COLOR, EDGE_OPACITY, EDGE_HOVER, EDGE_SELECTED,
  PAPER_TOP, PAPER_HOVER, PAPER_SIDE,
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

// Shared EdgesGeometry cache keyed by geometry uuid
const _edgeCache = new Map<string, THREE.EdgesGeometry>();
function getEdgeGeo(geo: THREE.BufferGeometry): THREE.EdgesGeometry {
  const key = geo.uuid;
  if (!_edgeCache.has(key)) {
    _edgeCache.set(key, new THREE.EdgesGeometry(geo, 15));
  }
  return _edgeCache.get(key)!;
}

/**
 * Single extruded city block — Jiangnan paper-diorama style.
 * Top: rice-paper off-white, matte.
 * Side: light terracotta, slightly rougher.
 * Subtle gold edge lines evoke paper-cut boundaries.
 */
export default function CityMesh({
  name, geometry, hovered, selected, dimmed,
  onPointerEnter, onPointerLeave, onClick,
}: CityMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  const isTransparent = dimmed;
  const opacity = selected ? SELECTED_OPACITY : dimmed ? DIM_OPACITY : BASE_OPACITY;

  const targetScale = hovered || selected ? HOVER_SCALE : 1;
  const targetY = hovered || selected ? HOVER_LIFT : 0;

  const hasGroups = useMemo(() => geometry.groups && geometry.groups.length > 1, [geometry]);

  // Top face — rice-paper off-white
  const matTop = useMemo(() => {
    const color = selected ? SELECTED_COLOR : hovered ? PAPER_HOVER : PAPER_TOP;
    return new THREE.MeshStandardMaterial({
      color,
      roughness: ROUGHNESS,
      metalness: METALNESS,
      transparent: isTransparent,
      opacity,
      depthWrite: !isTransparent,
      polygonOffset: true,
      polygonOffsetFactor: 0.3,
      polygonOffsetUnits: 0.3,
    });
  }, [selected, hovered, isTransparent, opacity]);

  // Side wall — light terracotta
  const matSide = useMemo(() => {
    const color = selected ? SELECTED_COLOR : PAPER_SIDE;
    return new THREE.MeshStandardMaterial({
      color,
      roughness: SIDE_ROUGHNESS,
      metalness: METALNESS,
      transparent: isTransparent,
      opacity,
      depthWrite: !isTransparent,
      polygonOffset: true,
      polygonOffsetFactor: 0.3,
      polygonOffsetUnits: 0.3,
    });
  }, [selected, isTransparent, opacity]);

  // Single-material fallback
  const singleMat = useMemo(() => {
    const color = selected ? SELECTED_COLOR : hovered ? PAPER_HOVER : PAPER_TOP;
    return new THREE.MeshStandardMaterial({
      color,
      roughness: ROUGHNESS,
      metalness: METALNESS,
      transparent: isTransparent,
      opacity,
      depthWrite: !isTransparent,
      polygonOffset: true,
      polygonOffsetFactor: 0.3,
      polygonOffsetUnits: 0.3,
    });
  }, [selected, hovered, isTransparent, opacity]);

  // Edge line material — subtle gold paper-cut boundary
  const edgeGeo = useMemo(() => getEdgeGeo(geometry), [geometry]);
  const edgeMat = useMemo(() => {
    const edgeColor = selected ? EDGE_SELECTED : hovered ? EDGE_HOVER : EDGE_COLOR;
    return new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: selected ? 0.55 : hovered ? 0.48 : EDGE_OPACITY,
      depthTest: true,
      depthWrite: false,
    });
  }, [selected, hovered]);

  // ── Event-driven animation ──
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;

    const startScale = g.scale.x;
    const startY = g.position.y;
    const startTime = performance.now();
    const duration = 300;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    let raf: number;
    const loop = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const et = easeOut(t);
      g.scale.setScalar(startScale + (targetScale - startScale) * et);
      g.position.y = startY + (targetY - startY) * et;
      invalidate();
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hovered, selected, targetScale, targetY, invalidate]);

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
      <mesh
        geometry={geometry}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        material={hasGroups ? [matSide, matTop] : singleMat}
      />
      <lineSegments geometry={edgeGeo} material={edgeMat} />
    </group>
  );
}
