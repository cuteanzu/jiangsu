import {
  CATEGORY_META,
  EXPERIENCES,
  type ExperiencePost,
  type PostCategory,
} from "../data/mock-content";
import type { ExperienceDTO } from "../services/types";

export const ALL_EXPERIENCE_CATEGORIES: (PostCategory | "all")[] = [
  "all",
  "freshman",
  "dorm",
  "cafeteria",
  "study",
  "city-life",
  "exam",
  "career",
];

const CATEGORY_VERDICTS: Record<PostCategory, string> = {
  dorm: "住宿体感",
  cafeteria: "日常补给",
  study: "课程强度",
  freshman: "新生适应",
  "city-life": "城市节奏",
  exam: "升学路径",
  career: "就业去向",
};

export function isPostCategory(value: unknown): value is PostCategory {
  return typeof value === "string" && value in CATEGORY_META;
}

export function getExperienceCategoryMeta(category: PostCategory | "all") {
  return category === "all"
    ? { label: "推荐", color: "#9a5a3b" }
    : CATEGORY_META[category] ?? { label: "校园经验", color: "#9a5a3b" };
}

export function getExperienceCategoryVerdict(category: PostCategory) {
  return CATEGORY_VERDICTS[category] ?? "校园线索";
}

export function heatOfExperience(item: ExperiencePost) {
  return item.likes + item.comments;
}

export function normalizeExperienceTags(tags: unknown): string[] {
  return Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
    : [];
}

export function fallbackExperienceExcerpt(body: string, excerpt?: string | null) {
  if (excerpt?.trim()) return excerpt;
  const firstLine = body.split(/\n+/)[0]?.trim() ?? body;
  return firstLine.length > 86 ? `${firstLine.slice(0, 86)}...` : firstLine;
}

export function toExperiencePost(item: ExperienceDTO, index = 0): ExperiencePost {
  const category = isPostCategory(item.category) ? item.category : "freshman";
  const body = item.body?.trim() || item.excerpt?.trim() || "这条校园经验暂时只有简要信息，后续可以继续补充正文。";
  return {
    id: item.id || `remote-exp-${index}`,
    category,
    schoolId: item.schoolId || "",
    schoolName: item.schoolName || "未关联学校",
    city: item.city || "江苏",
    title: item.title || "未命名校园经验",
    excerpt: fallbackExperienceExcerpt(body, item.excerpt),
    body,
    likes: item.likes ?? 0,
    comments: item.comments ?? 0,
    tags: normalizeExperienceTags(item.tags),
  };
}

export function searchInExperiences(list: ExperiencePost[], term: string) {
  const keyword = term.trim().toLowerCase();
  if (!keyword) return list;
  return list.filter((item) =>
    [item.title, item.excerpt, item.body, item.schoolName, item.city, ...item.tags]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  );
}

export function findLocalExperience(id: string | undefined) {
  if (!id) return null;
  return EXPERIENCES.find((item) => item.id === id) ?? null;
}
