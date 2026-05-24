import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import { UNIVERSITIES } from "../data/jiangsu-universities";
import type { Tier, University } from "../data/jiangsu-universities";

export const MAP_VIEWBOX_WIDTH = 1000;
export const MAP_VIEWBOX_HEIGHT = 760;

export interface MapTransform {
  tx: number;
  ty: number;
  scale: number;
}

export interface JiangsuCityProperties {
  adcode?: number;
  name?: string;
  center?: [number, number];
  centroid?: [number, number];
  [key: string]: unknown;
}

export type JiangsuFeature = Feature<Geometry, JiangsuCityProperties>;
export type JiangsuGeoJson = FeatureCollection<Geometry, JiangsuCityProperties>;

export interface MapFeaturePath {
  id: string;
  name: string;
  d: string;
  center: [number, number];
  bounds: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    width: number;
    height: number;
  };
  shapeCount: number;
  labelX: number;
  labelY: number;
  universityCount: number;
}

export interface ProjectedUniversity extends University {
  x: number;
  y: number;
  visualRank: number;
}

export interface JiangsuMapData {
  viewBox: string;
  width: number;
  height: number;
  features: MapFeaturePath[];
  universities: ProjectedUniversity[];
}

const tierRank: Record<Tier, number> = {
  "985": 0,
  "211": 1,
  dual: 2,
  provincial: 3,
};

const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const MAP_FIT_BOUNDS = {
  left: 118,
  top: 72,
  right: 882,
  bottom: 690,
};

type LngLat = [number, number];

function cityNameOf(feature: JiangsuFeature, index: number): string {
  return feature.properties?.name ?? `城市${index + 1}`;
}

function cityKey(city: string): string {
  return city.replace(/市$/, "");
}

function pushLngLat(position: Position | undefined, coordinates: LngLat[]) {
  if (!position) return;
  const [lng, lat] = position;
  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    coordinates.push([lng, lat]);
  }
}

function collectGeometryCoordinates(geometry: Geometry | null, coordinates: LngLat[]) {
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

function geometryShapeCount(geometry: Geometry | null): number {
  if (!geometry) return 0;

  switch (geometry.type) {
    case "Polygon":
      return geometry.coordinates.length > 0 ? 1 : 0;
    case "MultiPolygon":
      return geometry.coordinates.length;
    case "GeometryCollection":
      return geometry.geometries.reduce((count, child) => count + geometryShapeCount(child), 0);
    default:
      return 0;
  }
}

function createFittedMercatorProjection(geojson: JiangsuGeoJson) {
  const coordinates: LngLat[] = [];
  geojson.features.forEach((feature) => collectGeometryCoordinates(feature.geometry, coordinates));

  const rawProjection = geoMercator().scale(1).translate([0, 0]);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  coordinates.forEach((coordinate) => {
    const projected = rawProjection(coordinate);
    if (!projected) return;
    const [x, y] = projected;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return geoMercator().scale(1).translate([MAP_VIEWBOX_WIDTH / 2, MAP_VIEWBOX_HEIGHT / 2]);
  }

  const rawWidth = Math.max(maxX - minX, 1e-6);
  const rawHeight = Math.max(maxY - minY, 1e-6);
  const fitWidth = MAP_FIT_BOUNDS.right - MAP_FIT_BOUNDS.left;
  const fitHeight = MAP_FIT_BOUNDS.bottom - MAP_FIT_BOUNDS.top;
  const scale = Math.min(fitWidth / rawWidth, fitHeight / rawHeight);
  const tx = MAP_FIT_BOUNDS.left + (fitWidth - rawWidth * scale) / 2 - minX * scale;
  const ty = MAP_FIT_BOUNDS.top + (fitHeight - rawHeight * scale) / 2 - minY * scale;

  return geoMercator().scale(scale).translate([tx, ty]);
}

function projectCoordinate(projection: ReturnType<typeof geoMercator>, coordinate?: LngLat): [number, number] | null {
  if (!coordinate) return null;
  const projected = projection(coordinate);
  if (!projected) return null;
  const [x, y] = projected;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
}

function projectedGeometryCenter(feature: JiangsuFeature, projection: ReturnType<typeof geoMercator>): [number, number] {
  const coordinates: LngLat[] = [];
  collectGeometryCoordinates(feature.geometry, coordinates);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  coordinates.forEach((coordinate) => {
    const projected = projectCoordinate(projection, coordinate);
    if (!projected) return;
    const [x, y] = projected;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return [MAP_VIEWBOX_WIDTH / 2, MAP_VIEWBOX_HEIGHT / 2];
  }

  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

function featureLabelPoint(feature: JiangsuFeature, projection: ReturnType<typeof geoMercator>): [number, number] {
  return (
    projectCoordinate(projection, feature.properties?.centroid) ??
    projectCoordinate(projection, feature.properties?.center) ??
    projectedGeometryCenter(feature, projection)
  );
}

function projectUniversityCluster(
  university: University,
  projection: ReturnType<typeof geoMercator>,
  indexInCity: number,
  cityTotal: number,
): [number, number] {
  const projected = projection([university.lng, university.lat]);
  const [baseX, baseY] = projected ?? [MAP_VIEWBOX_WIDTH / 2, MAP_VIEWBOX_HEIGHT / 2];
  if (cityTotal <= 1) return [baseX, baseY];

  const angle = indexInCity * goldenAngle;
  const spread = cityTotal > 18 ? 10.4 : cityTotal > 8 ? 8.4 : 6.8;
  const radius = 10 + Math.sqrt(indexInCity + 1) * spread;
  return [
    baseX + Math.cos(angle) * radius,
    baseY + Math.sin(angle) * radius,
  ];
}

export function buildJiangsuMapData(geojson: JiangsuGeoJson): JiangsuMapData {
  const projection = createFittedMercatorProjection(geojson);
  const pathGenerator = geoPath(projection);
  const universityCountByCity = new Map<string, number>();
  const cityIndexById = new Map<string, number>();
  const cityTotalByName = new Map<string, number>();

  for (const university of UNIVERSITIES) {
    const key = cityKey(university.city);
    universityCountByCity.set(key, (universityCountByCity.get(key) ?? 0) + 1);
    cityTotalByName.set(university.city, (cityTotalByName.get(university.city) ?? 0) + 1);
  }

  const features = geojson.features.map((feature, index) => {
    const name = cityNameOf(feature, index);
    const center = featureLabelPoint(feature, projection);
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feature);
    return {
      id: String(feature.properties?.adcode ?? index),
      name,
      d: pathGenerator(feature) ?? "",
      center,
      bounds: {
        x0,
        y0,
        x1,
        y1,
        width: Math.max(x1 - x0, 1),
        height: Math.max(y1 - y0, 1),
      },
      shapeCount: geometryShapeCount(feature.geometry),
      labelX: center[0],
      labelY: center[1],
      universityCount: universityCountByCity.get(cityKey(name)) ?? 0,
    };
  });

  const universities = UNIVERSITIES
    .map((university) => {
      const indexInCity = cityIndexById.get(university.city) ?? 0;
      cityIndexById.set(university.city, indexInCity + 1);
      const cityTotal = cityTotalByName.get(university.city) ?? 1;
      const [x, y] = projectUniversityCluster(university, projection, indexInCity, cityTotal);
      return {
        ...university,
        x,
        y,
        visualRank: tierRank[university.tier],
      };
    })
    .sort((a, b) => b.visualRank - a.visualRank || a.name.localeCompare(b.name, "zh-CN"));

  return {
    viewBox: `0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`,
    width: MAP_VIEWBOX_WIDTH,
    height: MAP_VIEWBOX_HEIGHT,
    features,
    universities,
  };
}

export function findProjectedUniversity(
  mapData: JiangsuMapData | null,
  id: string | null,
): ProjectedUniversity | null {
  if (!mapData || !id) return null;
  return mapData.universities.find((university) => university.id === id) ?? null;
}
