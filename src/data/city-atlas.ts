export const JIANGSU_CITY_ORDER = [
  "南京",
  "苏州",
  "无锡",
  "常州",
  "镇江",
  "扬州",
  "泰州",
  "南通",
  "盐城",
  "淮安",
  "宿迁",
  "徐州",
  "连云港",
] as const;

export type JiangsuCityName = (typeof JIANGSU_CITY_ORDER)[number];

export const CITY_SLUGS: Record<JiangsuCityName, string> = {
  南京: "nanjing",
  苏州: "suzhou",
  无锡: "wuxi",
  常州: "changzhou",
  镇江: "zhenjiang",
  扬州: "yangzhou",
  泰州: "taizhou",
  南通: "nantong",
  盐城: "yancheng",
  淮安: "huaian",
  宿迁: "suqian",
  徐州: "xuzhou",
  连云港: "lianyungang",
};

const CITY_BY_SLUG = new Map(
  JIANGSU_CITY_ORDER.map((city) => [CITY_SLUGS[city], city]),
);

const GENERIC_CITY_ATLAS_IMAGE = "/jiangsu/city-stage.png";

export const CITY_ATLAS_IMAGES: Record<JiangsuCityName, string> = {
  南京: GENERIC_CITY_ATLAS_IMAGE,
  苏州: GENERIC_CITY_ATLAS_IMAGE,
  无锡: GENERIC_CITY_ATLAS_IMAGE,
  常州: GENERIC_CITY_ATLAS_IMAGE,
  镇江: GENERIC_CITY_ATLAS_IMAGE,
  扬州: GENERIC_CITY_ATLAS_IMAGE,
  泰州: GENERIC_CITY_ATLAS_IMAGE,
  南通: GENERIC_CITY_ATLAS_IMAGE,
  盐城: GENERIC_CITY_ATLAS_IMAGE,
  淮安: GENERIC_CITY_ATLAS_IMAGE,
  宿迁: GENERIC_CITY_ATLAS_IMAGE,
  徐州: GENERIC_CITY_ATLAS_IMAGE,
  连云港: GENERIC_CITY_ATLAS_IMAGE,
};

function safeDecodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getCityRouteSlug(city: string): string {
  const normalized = city.replace(/市$/, "") as JiangsuCityName;
  return CITY_SLUGS[normalized] ?? encodeURIComponent(normalized);
}

export function getCityFromRouteParam(value: string | null | undefined): JiangsuCityName | null {
  if (!value) return null;
  const decoded = safeDecodeParam(value).trim();
  const normalized = decoded.replace(/市$/, "");
  const directMatch = JIANGSU_CITY_ORDER.find((city) => city === normalized);
  if (directMatch) return directMatch;
  return CITY_BY_SLUG.get(normalized.toLowerCase()) ?? null;
}

export function getCityAtlasImage(city: string): string {
  const normalized = city.replace(/市$/, "") as JiangsuCityName;
  return CITY_ATLAS_IMAGES[normalized] ?? GENERIC_CITY_ATLAS_IMAGE;
}

export function getAdjacentCity(city: string, direction: -1 | 1): JiangsuCityName {
  const normalized = city.replace(/市$/, "");
  const currentIndex = JIANGSU_CITY_ORDER.findIndex((name) => name === normalized);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (safeIndex + direction + JIANGSU_CITY_ORDER.length) % JIANGSU_CITY_ORDER.length;
  return JIANGSU_CITY_ORDER[nextIndex];
}
