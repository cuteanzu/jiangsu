import { useMemo } from "react";
import * as THREE from "three";

const WATER_Y = 0.03;   // recessed below city bases at Y=0

// ═══════════════════════  Water Table (base plane) ═══════════════════════

function WaterTable() {
  const geo = useMemo(() => new THREE.PlaneGeometry(10, 9), []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]} renderOrder={0}>
      <meshBasicMaterial
        color="#D0E0EC"
        transparent
        opacity={0.10}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ═══════════════════════  Yangtze River (wide channel) ═══════════════════════

function YangtzeRiver() {
  const riverGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const pts = [
      [-3.2, -0.55], [-2.5, -0.48], [-1.6, -0.38], [-0.8, -0.22],
      [-0.1, -0.08], [0.4, 0.02], [1.0, 0.00], [1.7, 0.10],
      [2.3, 0.24], [3.0, 0.34], [3.6, 0.48],
    ];
    // Build a ribbon shape by offsetting perpendicular to the path
    const width = 0.10;
    // Simple approach: create a wide tube-like ribbon manually
    shape.moveTo(pts[0][0], pts[0][1] - width);
    for (const [x, z] of pts) shape.lineTo(x, z - width * 0.8);
    for (let i = pts.length - 1; i >= 0; i--) {
      shape.lineTo(pts[i][0], pts[i][1] + width * 0.8);
    }
    shape.closePath();

    return new THREE.ShapeGeometry(shape);
  }, []);

  // Center highlight line
  const lineGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-3.2, 0, -0.55),
        new THREE.Vector3(-2.5, 0, -0.48),
        new THREE.Vector3(-1.6, 0, -0.38),
        new THREE.Vector3(-0.8, 0, -0.22),
        new THREE.Vector3(-0.1, 0, -0.08),
        new THREE.Vector3(0.4, 0, 0.02),
        new THREE.Vector3(1.0, 0, 0.00),
        new THREE.Vector3(1.7, 0, 0.10),
        new THREE.Vector3(2.3, 0, 0.24),
        new THREE.Vector3(3.0, 0, 0.34),
        new THREE.Vector3(3.6, 0, 0.48),
      ],
      false, "catmullrom", 0.7,
    );
    return new THREE.TubeGeometry(curve, 160, 0.018, 8, false);
  }, []);

  return (
    <group>
      {/* Wide river channel */}
      <mesh geometry={riverGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y + 0.005, 0]} renderOrder={1}>
        <meshBasicMaterial
          color="#B0D0E0"
          transparent
          opacity={0.32}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Central highlight */}
      <mesh geometry={lineGeo} position={[0, WATER_Y + 0.012, 0]} renderOrder={2}>
        <meshBasicMaterial
          color="#D0E8F8"
          transparent
          opacity={0.30}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ═══════════════════════  Taihu Lake (3D pool) ═══════════════════════

function TaihuLake() {
  // Lake bed — recessed disc
  const bedGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.52, 0.52, 0.04, 64);
    g.scale(1, 1.5, 1);
    return g;
  }, []);

  // Lake surface
  const surfaceGeo = useMemo(() => {
    const g = new THREE.CircleGeometry(0.52, 64);
    g.scale(1, 1.5, 1);
    return g;
  }, []);

  // Shoreline ring
  const shoreGeo = useMemo(() => {
    const g = new THREE.RingGeometry(0.48, 0.55, 64);
    g.scale(1, 1.5, 1);
    return g;
  }, []);

  const lakeX = 2.1;
  const lakeZ = 2.3;

  return (
    <group>
      {/* Lake bed (dark, deep) */}
      <mesh geometry={bedGeo} position={[lakeX, WATER_Y - 0.015, lakeZ]} renderOrder={0}>
        <meshBasicMaterial color="#98BCCC" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Lake surface */}
      <mesh geometry={surfaceGeo} rotation={[-Math.PI / 2, 0, 0]} position={[lakeX, WATER_Y + 0.008, lakeZ]} renderOrder={1}>
        <meshBasicMaterial
          color="#C0DCE8"
          transparent
          opacity={0.44}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Shoreline */}
      <mesh geometry={shoreGeo} rotation={[-Math.PI / 2, 0, 0]} position={[lakeX, WATER_Y + 0.005, lakeZ]} renderOrder={2}>
        <meshBasicMaterial color="#F0F4F8" transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ═══════════════════════  Grand Canal ═══════════════════════

function GrandCanal() {
  const tubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(2.5, 0, 2.5), new THREE.Vector3(1.8, 0, 1.8),
        new THREE.Vector3(1.3, 0, 1.3), new THREE.Vector3(0.2, 0, 0.4),
        new THREE.Vector3(-0.2, 0, -0.5), new THREE.Vector3(-0.4, 0, -1.2),
        new THREE.Vector3(-0.6, 0, -1.8), new THREE.Vector3(-0.9, 0, -2.2),
        new THREE.Vector3(-1.2, 0, -2.4), new THREE.Vector3(-2.0, 0, -2.7),
        new THREE.Vector3(-2.5, 0, -2.9),
      ],
      false, "catmullrom", 0.5,
    );
    return new THREE.TubeGeometry(curve, 80, 0.025, 8, false);
  }, []);

  return (
    <mesh geometry={tubeGeo} position={[0, WATER_Y + 0.004, 0]} renderOrder={1}>
      <meshBasicMaterial
        color="#B0CCD8"
        transparent
        opacity={0.26}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ═══════════════════════  Coastline Shelf (east coast) ═══════════════════════

function CoastlineShelf() {
  const strips = useMemo(() => {
    const configs: { x: number; z: number; w: number; h: number }[] = [
      { x: 0.6, z: -3.0, w: 0.16, h: 1.3 },
      { x: 0.9, z: -2.1, w: 0.20, h: 1.0 },
      { x: 1.2, z: -1.1, w: 0.13, h: 0.9 },
      { x: 1.5, z: -0.1, w: 0.13, h: 0.9 },
      { x: 2.0, z: 0.6, w: 0.17, h: 0.8 },
      { x: 2.6, z: 1.3, w: 0.16, h: 0.7 },
    ];
    return configs.map((c) => ({
      pos: [c.x, WATER_Y + 0.015, c.z] as [number, number, number],
      geo: new THREE.PlaneGeometry(c.w, c.h),
    }));
  }, []);

  return (
    <>
      {strips.map((strip, i) => (
        <mesh key={`shelf-${i}`} geometry={strip.geo}
          rotation={[-Math.PI / 2, 0, 0]} position={strip.pos} renderOrder={0}>
          <meshBasicMaterial color="#B8D4E0" transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════  Northern lakes (Hongze, Gaoyou, Luoma) ═══════════════════════

function NorthernLakes() {
  const lakes = useMemo(() => {
    const configs = [
      { name: "洪泽湖", x: -0.7, z: -1.1, rx: 0.16, rz: 0.30 },
      { name: "高邮湖", x: 0.3, z: -0.6, rx: 0.14, rz: 0.20 },
      { name: "骆马湖", x: -1.0, z: -2.0, rx: 0.10, rz: 0.16 },
    ];
    return configs.map((c) => ({
      ...c,
      geo: (() => {
        const g = new THREE.CircleGeometry(1, 40);
        g.scale(c.rx, c.rz, 1);
        return g;
      })(),
    }));
  }, []);

  return (
    <>
      {lakes.map((lake) => (
        <mesh key={lake.name} geometry={lake.geo}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lake.x, WATER_Y + 0.005, lake.z]} renderOrder={1}>
          <meshBasicMaterial color="#B8D8E4" transparent opacity={0.28} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════  Water accent rings ═══════════════════════

function WaterAccents() {
  const rings = useMemo(() => {
    const items: { pos: [number, number, number]; radius: number; opacity: number }[] = [
      { pos: [-2.4, WATER_Y + 0.008, -2.6], radius: 0.15, opacity: 0.08 },
      { pos: [0.0, WATER_Y + 0.008, 0.0], radius: 0.08, opacity: 0.06 },
      { pos: [2.6, WATER_Y + 0.008, 0.3], radius: 0.08, opacity: 0.06 },
    ];
    return items.map((item) => ({
      ...item,
      geo: new THREE.RingGeometry(item.radius * 0.6, item.radius, 40),
    }));
  }, []);

  return (
    <>
      {rings.map((ring, i) => (
        <mesh key={`accent-${i}`} geometry={ring.geo}
          rotation={[-Math.PI / 2, 0, 0]} position={ring.pos} renderOrder={1}>
          <meshBasicMaterial color="#D4E6F2" transparent opacity={ring.opacity} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════  Main ═══════════════════════

export default function JiangsuWaterSystem() {
  return (
    <group>
      <WaterTable />
      <CoastlineShelf />
      <YangtzeRiver />
      <TaihuLake />
      <NorthernLakes />
      <GrandCanal />
      <WaterAccents />
    </group>
  );
}
