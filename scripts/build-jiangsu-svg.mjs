import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoMercator, geoPath } from "d3-geo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const inputPath = path.join(rootDir, "public", "jiangsu-geo.json");
const outputPath = path.join(rootDir, "src", "assets", "map", "jiangsu-paths.json");

const width = 1000;
const height = 760;
const fitBounds = {
  left: 118,
  top: 72,
  right: 882,
  bottom: 690,
};

function round(value) {
  return Number(value.toFixed(2));
}

function countShapes(geometry) {
  if (!geometry) return 0;
  if (geometry.type === "Polygon") return 1;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.length;
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.reduce((total, item) => total + countShapes(item), 0);
  }
  return 0;
}

function pushLngLat(position, coordinates) {
  if (!position) return;
  const [lng, lat] = position;
  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    coordinates.push([lng, lat]);
  }
}

function collectGeometryCoordinates(geometry, coordinates) {
  if (!geometry) return;

  switch (geometry.type) {
    case "Point":
      pushLngLat(geometry.coordinates, coordinates);
      break;
    case "MultiPoint":
    case "LineString":
      geometry.coordinates.forEach((position) => pushLngLat(position, coordinates));
      break;
    case "MultiLineString":
    case "Polygon":
      geometry.coordinates.forEach((line) => {
        line.forEach((position) => pushLngLat(position, coordinates));
      });
      break;
    case "MultiPolygon":
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((line) => {
          line.forEach((position) => pushLngLat(position, coordinates));
        });
      });
      break;
    case "GeometryCollection":
      geometry.geometries.forEach((child) => collectGeometryCoordinates(child, coordinates));
      break;
  }
}

function projectLngLat(projection, coordinate) {
  if (!coordinate) return null;
  const projected = projection(coordinate);
  if (!projected) return null;
  const [x, y] = projected;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
}

function getProjectedBounds(feature, projection) {
  const coordinates = [];
  collectGeometryCoordinates(feature.geometry, coordinates);

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  for (const coordinate of coordinates) {
    const projected = projectLngLat(projection, coordinate);
    if (!projected) continue;
    const [x, y] = projected;
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }

  if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(x1) || !Number.isFinite(y1)) {
    return {
      x0: width / 2,
      y0: height / 2,
      x1: width / 2,
      y1: height / 2,
    };
  }

  return { x0, y0, x1, y1 };
}

function getFeatureName(feature) {
  const props = feature.properties ?? {};
  return props.name ?? props.fullname ?? props.NAME ?? props.adcode ?? "未知城市";
}

function createFittedProjection(geojson) {
  const coordinates = [];
  geojson.features.forEach((feature) => collectGeometryCoordinates(feature.geometry, coordinates));

  const rawProjection = geoMercator().scale(1).translate([0, 0]);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const coordinate of coordinates) {
    const projected = rawProjection(coordinate);
    if (!projected) continue;
    const [x, y] = projected;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return geoMercator().scale(1).translate([width / 2, height / 2]);
  }

  const rawWidth = Math.max(maxX - minX, 1e-6);
  const rawHeight = Math.max(maxY - minY, 1e-6);
  const targetWidth = fitBounds.right - fitBounds.left;
  const targetHeight = fitBounds.bottom - fitBounds.top;
  const scale = Math.min(targetWidth / rawWidth, targetHeight / rawHeight);
  const tx = fitBounds.left + (targetWidth - rawWidth * scale) / 2 - minX * scale;
  const ty = fitBounds.top + (targetHeight - rawHeight * scale) / 2 - minY * scale;

  return geoMercator().scale(scale).translate([tx, ty]);
}

const geojson = JSON.parse(await readFile(inputPath, "utf8"));

const projection = createFittedProjection(geojson);
const pathGenerator = geoPath(projection);

const cities = geojson.features.map((feature, index) => {
  const props = feature.properties ?? {};
  const d = pathGenerator(feature) ?? "";
  const bounds = getProjectedBounds(feature, projection);
  const labelPoint =
    projectLngLat(projection, props.centroid) ??
    projectLngLat(projection, props.center) ?? [
      (bounds.x0 + bounds.x1) / 2,
      (bounds.y0 + bounds.y1) / 2,
    ];

  return {
    id: String(props.adcode ?? props.id ?? index),
    name: getFeatureName(feature),
    adcode: props.adcode ?? "",
    d,
    centroid: {
      x: round(labelPoint[0]),
      y: round(labelPoint[1]),
    },
    bounds: {
      x0: round(bounds.x0),
      y0: round(bounds.y0),
      x1: round(bounds.x1),
      y1: round(bounds.y1),
    },
    shapeCount: countShapes(feature.geometry),
  };
});

const output = {
  source: "public/jiangsu-geo.json",
  viewBox: `0 0 ${width} ${height}`,
  width,
  height,
  cityCount: cities.length,
  cities,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`生成完成：${path.relative(rootDir, outputPath)}`);
console.log(`城市数量：${cities.length}`);
console.table(
  cities.map((city) => ({
    name: city.name,
    shapes: city.shapeCount,
    x: city.centroid.x,
    y: city.centroid.y,
  })),
);
