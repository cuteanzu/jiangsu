import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  CAMERA_POSITION, CAMERA_TARGET,
  CITY_CAMERA_FACTOR, CITY_CAMERA_Y, CITY_CAMERA_Z_BASE,
  CITY_CENTERS,
} from "./mapTheme";

interface CameraControllerProps {
  selectedCity: string | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const SNAP_THRESHOLD = 0.03;

function clampTarget(tx: number, tz: number): [number, number] {
  return [
    THREE.MathUtils.clamp(tx, -3.2, 3.2),
    THREE.MathUtils.clamp(tz, -3.6, 3.2),
  ];
}

export default function CameraController({ selectedCity, controlsRef }: CameraControllerProps) {
  const targetPos = useRef(new THREE.Vector3(...CAMERA_POSITION));
  const targetLook = useRef(new THREE.Vector3(...CAMERA_TARGET));
  // Track whether we're actively animating toward a target
  const isAnimating = useRef(false);

  const selectedCityCenter = useMemo(
    () => (selectedCity ? CITY_CENTERS.find((cc) => cc.name === selectedCity) ?? null : null),
    [selectedCity],
  );

  const desiredPos = useMemo(() => {
    if (!selectedCityCenter) return new THREE.Vector3(...CAMERA_POSITION);
    const [clampedX, clampedZ] = clampTarget(selectedCityCenter.x, selectedCityCenter.z);
    return new THREE.Vector3(
      clampedX * CITY_CAMERA_FACTOR,
      CITY_CAMERA_Y,
      clampedZ * CITY_CAMERA_FACTOR + CITY_CAMERA_Z_BASE,
    );
  }, [selectedCityCenter]);

  const desiredLook = useMemo(() => {
    if (!selectedCityCenter) return new THREE.Vector3(...CAMERA_TARGET);
    const [clampedX, clampedZ] = clampTarget(selectedCityCenter.x, selectedCityCenter.z);
    return new THREE.Vector3(clampedX, 0, clampedZ);
  }, [selectedCityCenter]);

  // When desired target changes, update our goal and mark animation as active
  useEffect(() => {
    targetPos.current.copy(desiredPos);
    targetLook.current.copy(desiredLook);
    isAnimating.current = true;
  }, [desiredPos, desiredLook]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (!isAnimating.current) return;

    const camera = controls.object;
    const look = controls.target as THREE.Vector3;

    const posDist = camera.position.distanceTo(targetPos.current);
    const lookDist = look.distanceTo(targetLook.current);

    // Snap when close enough
    if (posDist < SNAP_THRESHOLD && lookDist < SNAP_THRESHOLD) {
      camera.position.copy(targetPos.current);
      look.copy(targetLook.current);
      controls.update();
      isAnimating.current = false;
      return;
    }

    const t = Math.min(delta * 2.8, 1);
    camera.position.lerp(targetPos.current, t);
    look.lerp(targetLook.current, t);
    controls.update();
  });

  return null;
}
