import type { LifeSurveyDTO } from "../services/types";

export type LifeSurveyKey = Exclude<keyof LifeSurveyDTO, "schoolName" | "sourceUrl" | "responseCount">;

export interface LifeSurveyDimension {
  key: LifeSurveyKey;
  label: string;
  group: "住宿" | "学习" | "生活" | "出行";
  weight: number;
}

export interface LifeSurveyItem extends LifeSurveyDimension {
  summary: string;
}

export const LIFE_SURVEY_DIMENSIONS: LifeSurveyDimension[] = [
  { key: "dormSummary", label: "上床下桌", group: "住宿", weight: 10 },
  { key: "acSummary", label: "空调", group: "住宿", weight: 9 },
  { key: "privateBathSummary", label: "独卫", group: "住宿", weight: 9 },
  { key: "hotWaterSummary", label: "热水", group: "住宿", weight: 8 },
  { key: "laundrySummary", label: "洗衣机", group: "住宿", weight: 7 },
  { key: "accessControlSummary", label: "门禁", group: "住宿", weight: 7 },
  { key: "studyRuleSummary", label: "早晚自习", group: "学习", weight: 8 },
  { key: "runningSummary", label: "晨跑打卡", group: "学习", weight: 7 },
  { key: "overnightStudySummary", label: "通宵自习", group: "学习", weight: 6 },
  { key: "computerSummary", label: "电脑", group: "学习", weight: 6 },
  { key: "networkSummary", label: "校园网", group: "生活", weight: 8 },
  { key: "powerNetworkSummary", label: "断电断网", group: "生活", weight: 8 },
  { key: "powerLimitSummary", label: "限电", group: "生活", weight: 7 },
  { key: "canteenSummary", label: "食堂", group: "生活", weight: 8 },
  { key: "deliverySummary", label: "外卖", group: "生活", weight: 8 },
  { key: "supermarketSummary", label: "超市", group: "生活", weight: 6 },
  { key: "expressSummary", label: "快递", group: "生活", weight: 6 },
  { key: "paymentSummary", label: "卡消费", group: "生活", weight: 5 },
  { key: "bankCardSummary", label: "银行卡", group: "生活", weight: 5 },
  { key: "transportSummary", label: "交通", group: "出行", weight: 8 },
  { key: "scooterSummary", label: "电瓶车", group: "出行", weight: 7 },
  { key: "sharedBikeSummary", label: "共享单车", group: "出行", weight: 6 },
  { key: "vacationSummary", label: "寒暑假", group: "学习", weight: 5 },
];

export function cleanSurveyText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

export function getLifeSurveyItems(survey?: LifeSurveyDTO | null): LifeSurveyItem[] {
  if (!survey) return [];
  return LIFE_SURVEY_DIMENSIONS
    .map((dimension) => ({
      ...dimension,
      summary: cleanSurveyText(survey[dimension.key]),
    }))
    .filter((item) => item.summary.length > 0)
    .sort((a, b) => b.weight - a.weight);
}

export function getLifeSurveyCoverage(survey?: LifeSurveyDTO | null) {
  if (!survey) return 0;
  const filled = getLifeSurveyItems(survey).length;
  return Math.round((filled / LIFE_SURVEY_DIMENSIONS.length) * 100);
}

export function hasLifeSurvey(survey?: LifeSurveyDTO | null) {
  return getLifeSurveyItems(survey).length > 0;
}

export function getLifeSurveyHighlights(survey?: LifeSurveyDTO | null, limit = 4) {
  const preferred: LifeSurveyKey[] = [
    "dormSummary",
    "acSummary",
    "privateBathSummary",
    "canteenSummary",
    "deliverySummary",
    "transportSummary",
    "accessControlSummary",
    "networkSummary",
  ];
  const items = getLifeSurveyItems(survey);
  const priority = new Map(preferred.map((key, index) => [key, index]));
  return [...items]
    .sort((a, b) => (priority.get(a.key) ?? 99) - (priority.get(b.key) ?? 99) || b.weight - a.weight)
    .slice(0, limit);
}

export function clipSurveySummary(value: string, max = 52) {
  const text = cleanSurveyText(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function surveyResponseLabel(survey?: LifeSurveyDTO | null) {
  const count = survey?.responseCount ?? 0;
  return count > 0 ? `${count} 份答卷` : "样本待补";
}

export function groupLifeSurveyItems(items: LifeSurveyItem[]) {
  return items.reduce<Record<LifeSurveyDimension["group"], LifeSurveyItem[]>>((groups, item) => {
    groups[item.group].push(item);
    return groups;
  }, {
    "住宿": [],
    "学习": [],
    "生活": [],
    "出行": [],
  });
}
