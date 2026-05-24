export type Tier = "985" | "211" | "dual" | "provincial";

export interface University {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  tier: Tier;
  founded?: number;
  website?: string;
}

// Tier order for visual ranking
export const TIER_ORDER: Record<Tier, number> = {
  "985": 0,
  "211": 1,
  "dual": 2,
  "provincial": 3,
};

export const TIER_LABEL: Record<Tier, string> = {
  "985": "985",
  "211": "211",
  "dual": "双一流",
  "provincial": "本科",
};

// All undergraduate universities in Jiangsu Province (~78)
// Coordinates are approximate school locations
export const UNIVERSITIES: University[] = [
  // ═══ 985 ═══
  { id: "nju", name: "南京大学", city: "南京", lat: 32.1190, lng: 118.9532, tier: "985", founded: 1902 },
  { id: "seu", name: "东南大学", city: "南京", lat: 31.8860, lng: 118.8158, tier: "985", founded: 1902 },

  // ═══ 211 ═══
  { id: "nuaa", name: "南京航空航天大学", city: "南京", lat: 31.9387, lng: 118.7929, tier: "211", founded: 1952 },
  { id: "njust", name: "南京理工大学", city: "南京", lat: 32.0353, lng: 118.8559, tier: "211", founded: 1953 },
  { id: "hhu", name: "河海大学", city: "南京", lat: 31.9103, lng: 118.7591, tier: "211", founded: 1915 },
  { id: "njau", name: "南京农业大学", city: "南京", lat: 32.0376, lng: 118.8416, tier: "211", founded: 1902 },
  { id: "cpu", name: "中国药科大学", city: "南京", lat: 31.8992, lng: 118.9112, tier: "211", founded: 1936 },
  { id: "njnu", name: "南京师范大学", city: "南京", lat: 32.1044, lng: 118.9111, tier: "211", founded: 1902 },
  { id: "suda", name: "苏州大学", city: "苏州", lat: 31.3066, lng: 120.6387, tier: "211", founded: 1900 },
  { id: "jiangnan", name: "江南大学", city: "无锡", lat: 31.4909, lng: 120.2730, tier: "211", founded: 1958 },
  { id: "cumt", name: "中国矿业大学", city: "徐州", lat: 34.2188, lng: 117.1945, tier: "211", founded: 1909 },

  // ═══ 双一流 ═══
  { id: "nuist", name: "南京信息工程大学", city: "南京", lat: 32.2065, lng: 118.7173, tier: "dual", founded: 1960 },
  { id: "njupt", name: "南京邮电大学", city: "南京", lat: 32.0800, lng: 118.9458, tier: "dual", founded: 1942 },
  { id: "njfu", name: "南京林业大学", city: "南京", lat: 32.0793, lng: 118.8135, tier: "dual", founded: 1902 },
  { id: "njmu", name: "南京医科大学", city: "南京", lat: 31.9460, lng: 118.7621, tier: "dual", founded: 1934 },
  { id: "njucm", name: "南京中医药大学", city: "南京", lat: 32.0972, lng: 118.9536, tier: "dual", founded: 1954 },

  // ═══ 南京本科 ═══
  { id: "njupt2", name: "南京工业大学", city: "南京", lat: 32.0789, lng: 118.6489, tier: "provincial" },
  { id: "njue", name: "南京财经大学", city: "南京", lat: 32.0930, lng: 118.9118, tier: "provincial" },
  { id: "njaudit", name: "南京审计大学", city: "南京", lat: 32.0420, lng: 118.5938, tier: "provincial" },
  { id: "njit", name: "南京工程学院", city: "南京", lat: 31.9343, lng: 118.8916, tier: "provincial" },
  { id: "njxzc", name: "南京晓庄学院", city: "南京", lat: 31.9300, lng: 118.9033, tier: "provincial" },
  { id: "njty", name: "南京体育学院", city: "南京", lat: 32.0396, lng: 118.8175, tier: "provincial" },
  { id: "nua", name: "南京艺术学院", city: "南京", lat: 32.0540, lng: 118.7480, tier: "provincial" },
  { id: "njpu", name: "南京警察学院", city: "南京", lat: 32.0890, lng: 118.7973, tier: "provincial" },
  { id: "jssnu", name: "江苏第二师范学院", city: "南京", lat: 32.0843, lng: 118.7939, tier: "provincial" },
  { id: "njtech", name: "南京工业职业技术大学", city: "南京", lat: 32.1318, lng: 118.9602, tier: "provincial" },

  // ═══ 苏州本科 ═══
  { id: "usts", name: "苏州科技大学", city: "苏州", lat: 31.2730, lng: 120.5672, tier: "provincial" },
  { id: "cit", name: "常熟理工学院", city: "苏州", lat: 31.6580, lng: 120.7437, tier: "provincial" },
  { id: "sit", name: "苏州城市学院", city: "苏州", lat: 31.2957, lng: 120.5744, tier: "provincial" },

  // ═══ 无锡本科 ═══
  { id: "wxit", name: "无锡学院", city: "无锡", lat: 31.5023, lng: 120.3908, tier: "provincial" },
  { id: "thnu", name: "太湖学院", city: "无锡", lat: 31.5320, lng: 120.2625, tier: "provincial" },

  // ═══ 徐州本科 ═══
  { id: "jsnu", name: "江苏师范大学", city: "徐州", lat: 34.2065, lng: 117.1755, tier: "provincial" },
  { id: "xzmc", name: "徐州医科大学", city: "徐州", lat: 34.2617, lng: 117.1882, tier: "provincial" },
  { id: "xzit", name: "徐州工程学院", city: "徐州", lat: 34.2430, lng: 117.2803, tier: "provincial" },

  // ═══ 常州本科 ═══
  { id: "cczu", name: "常州大学", city: "常州", lat: 31.8113, lng: 119.9587, tier: "provincial" },
  { id: "jsut", name: "江苏理工学院", city: "常州", lat: 31.7823, lng: 119.9728, tier: "provincial" },
  { id: "czu", name: "常州工学院", city: "常州", lat: 31.8222, lng: 119.9940, tier: "provincial" },

  // ═══ 南通本科 ═══
  { id: "ntu", name: "南通大学", city: "南通", lat: 31.9839, lng: 120.9103, tier: "provincial" },
  { id: "ntit", name: "南通理工学院", city: "南通", lat: 32.0011, lng: 120.8807, tier: "provincial" },

  // ═══ 扬州本科 ═══
  { id: "yzu", name: "扬州大学", city: "扬州", lat: 32.3900, lng: 119.4258, tier: "provincial" },

  // ═══ 镇江本科 ═══
  { id: "ujs", name: "江苏大学", city: "镇江", lat: 32.2010, lng: 119.5119, tier: "provincial" },
  { id: "just", name: "江苏科技大学", city: "镇江", lat: 32.1881, lng: 119.4643, tier: "provincial" },

  // ═══ 盐城本科 ═══
  { id: "ycit", name: "盐城工学院", city: "盐城", lat: 33.3136, lng: 120.1657, tier: "provincial" },
  { id: "yctu", name: "盐城师范学院", city: "盐城", lat: 33.3865, lng: 120.1619, tier: "provincial" },

  // ═══ 淮安本科 ═══
  { id: "hyit", name: "淮阴工学院", city: "淮安", lat: 33.5851, lng: 119.0241, tier: "provincial" },
  { id: "hytc", name: "淮阴师范学院", city: "淮安", lat: 33.6075, lng: 119.0434, tier: "provincial" },

  // ═══ 连云港本科 ═══
  { id: "jou", name: "江苏海洋大学", city: "连云港", lat: 34.6022, lng: 119.2365, tier: "provincial" },

  // ═══ 泰州本科 ═══
  { id: "tzuh", name: "泰州学院", city: "泰州", lat: 32.4732, lng: 119.9238, tier: "provincial" },
  { id: "nusttz", name: "南京理工大学泰州科技学院", city: "泰州", lat: 32.4795, lng: 119.9353, tier: "provincial" },

  // ═══ 宿迁本科 ═══
  { id: "sqc", name: "宿迁学院", city: "宿迁", lat: 33.9469, lng: 118.3205, tier: "provincial" },

  // ═══ Other notable ═══
  { id: "nju_jl", name: "南京大学金陵学院", city: "南京", lat: 32.1450, lng: 118.7203, tier: "provincial" },
  { id: "seu_cx", name: "东南大学成贤学院", city: "南京", lat: 32.0750, lng: 118.7290, tier: "provincial" },
  { id: "nuaa_jc", name: "南航金城学院", city: "南京", lat: 31.8509, lng: 118.7861, tier: "provincial" },
  { id: "kdsu", name: "昆山杜克大学", city: "苏州", lat: 31.3940, lng: 120.9083, tier: "provincial" },
  { id: "xjtlu", name: "西交利物浦大学", city: "苏州", lat: 31.2730, lng: 120.7400, tier: "provincial" },
];

// Grouped by tier
export const UNIVERSITIES_BY_TIER = {
  "985": UNIVERSITIES.filter((u) => u.tier === "985"),
  "211": UNIVERSITIES.filter((u) => u.tier === "211"),
  "dual": UNIVERSITIES.filter((u) => u.tier === "dual"),
  "provincial": UNIVERSITIES.filter((u) => u.tier === "provincial"),
};

// Jiangsu province bounding box for projection
export const JIANGSU_BOUNDS = {
  minLng: 116.35,
  maxLng: 122.0,
  minLat: 30.75,
  maxLat: 35.2,
};
