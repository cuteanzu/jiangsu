import { TIER_LABEL } from "../data/jiangsu-universities";
import type { Tier, University } from "../data/jiangsu-universities";

interface ProjectedUniversity extends University {
  x: number;
  y: number;
  visualRank: number;
}

export interface SchoolExhibit {
  title: string;
  subtitle: string;
  culture: string;
  scenery: string;
  discipline: string;
  tags: string[];
}

const tierDiscipline: Record<Tier, string> = {
  "985": "综合实力与研究气质突出，适合作为城市高校展线里的核心展厅。",
  "211": "学科底蕴清晰，像城市书页里的重点书签，适合展示专业传统与校园精神。",
  dual: "特色学科辨识度高，适合用更明亮的蓝色展线突出它的专长方向。",
  provincial: "与地方产业、师范教育、应用创新联系紧密，适合呈现城市里的青春日常。",
};

export function cityKey(city: string): string {
  return city.replace(/市$/, "");
}

export function cityRouteParam(city: string): string {
  const key = cityKey(city);
  return key ? `${key}市` : "";
}

export function normalizeCityParam(city: string | null): string | null {
  if (!city) return null;
  const key = cityKey(city.trim());
  return key || null;
}

export function matchesUniversity(university: ProjectedUniversity, query: string): boolean {
  if (!query) return true;
  return (
    university.name.toLowerCase().includes(query) ||
    university.city.toLowerCase().includes(query) ||
    TIER_LABEL[university.tier].toLowerCase().includes(query)
  );
}

export function buildSchoolExhibit(university: University): SchoolExhibit {
  const tier = TIER_LABEL[university.tier];
  const founded = university.founded ? `${university.founded} 年建校` : "建校信息待补充";

  return {
    title: `${university.name}校园展`,
    subtitle: `${university.city} · ${tier} · ${founded}`,
    culture: `${university.name}是${university.city}高校版图中的重要坐标。这里的展览第一屏先呈现校名、层次和城市关系，后续可以继续接入真实校史、校训和代表人物。`,
    scenery: `第一版先用“樱花书页、校园步道、晨光建筑群”的模板意象承载视觉氛围，等真实图片素材补齐后，可以替换为校门、图书馆、主楼和校园季节影像。`,
    discipline: tierDiscipline[university.tier],
    tags: [tier, university.city, founded],
  };
}
