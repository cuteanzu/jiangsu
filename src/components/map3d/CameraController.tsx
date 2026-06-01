import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAMERA_POSITION, CAMERA_TARGET } from "./mapTheme";
import type { CityCenter } from "./mapTheme";

interface CameraControllerProps {
  selectedCity: string | null;
  cityCenters: CityCenter[];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const SNAP_THRESHOLD = 0.08;
const OVERVIEW_POS = new THREE.Vector3(...CAMERA_POSITION);
const OVERVIEW_TARGET = new THREE.Vector3(...CAMERA_TARGET);

export default function CameraController({ selectedCity, cityCenters, controlsRef }: CameraControllerProps) {
  const targetPos = useRef(OVERVIEW_POS.clone());
  const targetLook = useRef(OVERVIEW_TARGET.clone());
  const isAnimating = useRef(false);
  const invalidate = useThree((state) => state.invalidate);

  const centerMap = useMemo(() => {
    const map = new Map<string, CityCenter>();
    cityCenters.forEach((c) => map.set(c.name, c));
    return map;
  }, [cityCenters]);

  const selected = useMemo(
    () => (selectedCity ? centerMap.get(selectedCity) ?? null : null),
    [selectedCity, centerMap],
  );

  const desiredPos = useMemo(() => {
    if (!selected) return OVERVIEW_POS.clone();
    return new THREE.Vector3(selected.x, 4.0, selected.z + 3.5);
  }, [selected]);

  const desiredTarget = useMemo(() => {
    if (!selected) return OVERVIEW_TARGET.clone();
    return new THREE.Vector3(selected.x, -0.05, selected.z);
  }, [selected]);

  useEffect(() => {
    targetPos.current.copy(desiredPos);
    targetLook.current.copy(desiredTarget);
    isAnimating.current = true;
    invalidate();
  }, [desiredPos, desiredTarget, invalidate]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !isAnimating.current) return;

    const pos = controls.object.position as THREE.Vector3;
    const look = controls.target as THREE.Vector3;

    const posDist = pos.distanceTo(targetPos.current);
    const lookDist = look.distanceTo(targetLook.current);

    if (posDist < SNAP_THRESHOLD && lookDist < SNAP_THRESHOLD) {
      pos.copy(targetPos.current);
      look.copy(targetLook.current);
      controls.update();
      isAnimating.current = false;
      invalidate();
      return;
    }

    const t = Math.min(delta * 2.8, 1);
    pos.lerp(targetPos.current, t);
    look.lerp(targetLook.current, t);
    controls.update();
    invalidate();
  });

  return null;
}
