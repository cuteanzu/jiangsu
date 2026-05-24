import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import type { MapFeaturePath, MapTransform } from "../utils/jiangsuMap";

interface SvgPoint {
  x: number;
  y: number;
}

interface UseMapTransformOptions {
  minScale?: number;
  maxScale?: number;
}

const defaultTransform: MapTransform = { tx: -72, ty: -92, scale: 1.22 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useMapTransform(options: UseMapTransformOptions = {}) {
  const minScale = options.minScale ?? 0.72;
  const maxScale = options.maxScale ?? 3.1;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [transform, setTransform] = useState<MapTransform>(defaultTransform);
  const transformRef = useRef<MapTransform>(defaultTransform);
  const targetRef = useRef<MapTransform>(defaultTransform);
  const draggingRef = useRef(false);
  const lastPointRef = useRef<SvgPoint | null>(null);
  const velocityRef = useRef<SvgPoint>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const inertiaRef = useRef<number | null>(null);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (inertiaRef.current !== null) cancelAnimationFrame(inertiaRef.current);
  }, []);

  const clientToSvg = useCallback((event: Pick<PointerEvent | WheelEvent, "clientX" | "clientY">) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformed = point.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  }, []);

  const animateToTarget = useCallback(() => {
    if (rafRef.current !== null) return;

    const tick = () => {
      const current = transformRef.current;
      const target = targetRef.current;
      const next: MapTransform = {
        tx: current.tx + (target.tx - current.tx) * 0.2,
        ty: current.ty + (target.ty - current.ty) * 0.2,
        scale: current.scale + (target.scale - current.scale) * 0.2,
      };
      const done =
        Math.abs(next.tx - target.tx) < 0.08 &&
        Math.abs(next.ty - target.ty) < 0.08 &&
        Math.abs(next.scale - target.scale) < 0.002;

      if (done) {
        rafRef.current = null;
        transformRef.current = target;
        setTransform(target);
        return;
      }

      transformRef.current = next;
      setTransform(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const setTarget = useCallback((next: MapTransform) => {
    targetRef.current = {
      tx: next.tx,
      ty: next.ty,
      scale: clamp(next.scale, minScale, maxScale),
    };
    animateToTarget();
  }, [animateToTarget, maxScale, minScale]);

  const reset = useCallback(() => {
    stopInertia();
    setTarget(defaultTransform);
  }, [setTarget, stopInertia]);

  const focusPoint = useCallback((x: number, y: number, scale = 1.78) => {
    stopInertia();
    const focusX = 530;
    const focusY = 382;
    setTarget({
      tx: focusX - x * scale,
      ty: focusY - y * scale,
      scale,
    });
  }, [setTarget, stopInertia]);

  const focusFeature = useCallback((feature: MapFeaturePath) => {
    stopInertia();
    const focusX = 530;
    const focusY = 392;
    const cityWidth = Math.max(feature.bounds.width, 1);
    const cityHeight = Math.max(feature.bounds.height, 1);
    const scale = clamp(Math.min(500 / cityWidth, 440 / cityHeight), 1.9, maxScale);

    setTarget({
      tx: focusX - feature.center[0] * scale,
      ty: focusY - feature.center[1] * scale,
      scale,
    });
  }, [maxScale, setTarget, stopInertia]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    const point = clientToSvg(event);
    if (!point) return;
    stopInertia();
    draggingRef.current = true;
    lastPointRef.current = point;
    velocityRef.current = { x: 0, y: 0 };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [clientToSvg, stopInertia]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const point = clientToSvg(event);
    const last = lastPointRef.current;
    if (!point || !last) return;

    const dx = point.x - last.x;
    const dy = point.y - last.y;
    velocityRef.current = { x: dx, y: dy };
    lastPointRef.current = point;
    setTarget({
      tx: targetRef.current.tx + dx,
      ty: targetRef.current.ty + dy,
      scale: targetRef.current.scale,
    });
  }, [clientToSvg, setTarget]);

  const handlePointerUp = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    lastPointRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const coast = () => {
      velocityRef.current = {
        x: velocityRef.current.x * 0.9,
        y: velocityRef.current.y * 0.9,
      };
      if (Math.abs(velocityRef.current.x) < 0.04 && Math.abs(velocityRef.current.y) < 0.04) {
        inertiaRef.current = null;
        return;
      }
      setTarget({
        tx: targetRef.current.tx + velocityRef.current.x,
        ty: targetRef.current.ty + velocityRef.current.y,
        scale: targetRef.current.scale,
      });
      inertiaRef.current = requestAnimationFrame(coast);
    };

    inertiaRef.current = requestAnimationFrame(coast);
  }, [setTarget]);

  const handleWheel = useCallback((event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const point = clientToSvg(event);
    if (!point) return;
    const current = targetRef.current;
    const factor = Math.exp(-event.deltaY * 0.0012);
    const nextScale = clamp(current.scale * factor, minScale, maxScale);
    const ratio = nextScale / current.scale;
    stopInertia();
    setTarget({
      tx: point.x - (point.x - current.tx) * ratio,
      ty: point.y - (point.y - current.ty) * ratio,
      scale: nextScale,
    });
  }, [clientToSvg, maxScale, minScale, setTarget, stopInertia]);

  return {
    svgRef,
    transform,
    reset,
    focusPoint,
    focusFeature,
    bind: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onWheel: handleWheel,
      onDoubleClick: reset,
    },
  };
}
