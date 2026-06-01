export function cityLifeNote(city: string): { dorm: string; food: string; transit: string; life: string } {
  const notes: Record<string, { dorm: string; food: string; transit: string; life: string }> = {
    "南京": { dorm: "多数宿舍配有空调和独立卫浴，仙林、江宁校区条件较新。", food: "从南大食堂到东大九龙湖，高校美食密度全国前列。", transit: "地铁网络覆盖主城区，共享单车密集，通勤方便。", life: "省会资源丰富，实习机会多，文化场馆遍布全城。" },
    "苏州": { dorm: "独墅湖高教区宿舍较新，部分有阳台和独立卫生间。", food: "苏帮菜精致，高校食堂融合南北口味。", transit: "地铁+公交+有轨电车，毗邻上海交通便利。", life: "经济发达，外企多，园林与都市生活完美融合。" },
    "无锡": { dorm: "江南大学蠡湖校区宿舍条件优良，多为四人间。", food: "太湖三白、无锡排骨，食堂价格实惠。", transit: "地铁1-4号线串联主城，公交线路密集。", life: "太湖之滨生活舒适，物联网产业聚集地。" },
    "常州": { dorm: "常州大学武进校区宿舍较新，配备空调。", food: "食堂兼顾南北口味，周边小吃街选择多。", transit: "BRT快速公交+地铁，城市规模适中通勤方便。", life: "制造业强市，生活成本低，城市节奏舒适。" },
    "徐州": { dorm: "矿大南湖校区环境优美，宿舍配套齐全。", food: "徐州菜量大实惠，烧烤和地锅鸡是特色。", transit: "地铁+公交覆盖，淮海经济区中心城市。", life: "北方城市氛围，物价友好，本地生活气息浓厚。" },
    "南通": { dorm: "南通大学主校区宿舍较新，多为四人间。", food: "江海风味，海鲜新鲜，食堂性价比高。", transit: "公交为主，地铁在建，城市不大出行方便。", life: "滨江临海，城市干净，基础教育强市。" },
    "扬州": { dorm: "扬州大学瘦西湖校区环境优美，宿舍条件适中。", food: "淮扬菜发源地，从食堂到社会餐饮皆是美食。", transit: "公交覆盖全城，城市规模精致，骑行即可。", life: "历史文化名城，生活节奏慢，宜居度高。" },
    "盐城": { dorm: "宿舍以四人间为主，部分新校区条件较好。", food: "苏北风味，食堂价格实惠，分量足。", transit: "公交+BRT，城市东西向发展，出行便利。", life: "沿海湿地城市，空气质量好，生活成本低。" },
    "镇江": { dorm: "江苏大学本部宿舍条件良好，部分宿舍有独卫。", food: "锅盖面、肴肉是特色，高校食堂种类丰富。", transit: "公交+共享单车，城市紧凑通勤时间短。", life: "山水花园城市，毗邻南京，宜居宜学。" },
    "淮安": { dorm: "淮阴工学院、淮阴师范学院宿舍条件中等。", food: "淮扬菜正宗，食堂价格亲民。", transit: "公交为主，城市规模适中出行方便。", life: "运河之都，生活节奏慢，物价友好。" },
    "泰州": { dorm: "泰州学院宿舍基本配套齐全，部分校区较新。", food: "泰州早茶文化浓厚，食堂选择丰富。", transit: "公交覆盖，城市不大出行便捷。", life: "医药产业聚集地，城市安静宜居。" },
    "宿迁": { dorm: "宿迁学院宿舍条件中等，基本配套完善。", food: "苏北家常口味，食堂实惠。", transit: "公交+共享单车，城市紧凑。", life: "新兴城市，生活成本省内最低之一。" },
    "连云港": { dorm: "江苏海洋大学宿舍配套齐全，部分可观海。", food: "海鲜特色突出，食堂种类丰富。", transit: "BRT+公交，海滨城市出行方便。", life: "港口城市，空气清新，山海风光独特。" },
  };
  return notes[city] ?? { dorm: "宿舍配套完善，多为四人间，有空调。", food: "食堂选择丰富，兼顾各地口味，价格实惠。", transit: "城市公共交通覆盖，出行方便。", life: "生活便利，校园周边配套齐全。" };
}

export interface CityStats {
  area: string;
  population: string;
  universityCount: number;
}

export interface CityCockpitProfile {
  identity: string;
  summary: string;
  impressions: string[];
  suitableFor: string[];
  tips: string;
  tags: string[];
  cost: string;
  transit: string;
  jobs: string;
  audience: string;
  stats: CityStats;
}

export const DEFAULT_CITY_PROFILE: CityCockpitProfile = {
  identity: "江苏城市",
  summary: "江苏省高校资源丰富，是长三角教育重镇。",
  impressions: ["校园生活", "本科高校", "城市体验"],
  suitableFor: ["想在江苏找到学习节奏的同学", "关注城市资源与生活舒适度平衡的同学"],
  tips: "点击城市查看高校分布，在地图上探索各校位置。",
  tags: ["校园生活", "本科高校", "城市体验"],
  cost: "适中",
  transit: "便利",
  jobs: "稳定",
  audience: "适合想在江苏找到学习节奏、城市资源和生活舒适度平衡点的同学",
  stats: { area: "—", population: "—", universityCount: 0 },
};

export const CITY_COCKPIT_PROFILE: Record<string, CityCockpitProfile> = {
  南京: {
    identity: "省会城市 · 六朝古都",
    summary: "江苏省会，长三角辐射中西部的重要门户，教育资源与科研平台高度集中。",
    impressions: ["省会资源", "科研氛围", "实习密集", "文化底蕴", "高校云集"],
    suitableFor: ["目标明确、想接触更多科研平台和城市资源的同学", "偏好大城市节奏、重视实习和就业机会的同学", "对历史文化有认同感、喜欢城市多元生活的同学"],
    tips: "南京高校数量全省第一，26所本科院校覆盖各层次，从985到特色本科应有尽有。建议先确定自己的分数段，再在城市内对比同层次高校。",
    tags: ["省会资源", "科研氛围", "实习密集"],
    cost: "中高",
    transit: "很便利",
    jobs: "很丰富",
    audience: "适合目标明确、想接触更多科研平台和城市资源的同学",
    stats: { area: "6587 km²", population: "约 950 万", universityCount: 26 },
  },
  苏州: {
    identity: "江南水乡城市 · 经济强市",
    summary: "长三角核心城市之一，经济发达、产业密集，校园与园林交相辉映。",
    impressions: ["园林校园", "产业强市", "城市品质", "外企密集", "生活精致"],
    suitableFor: ["喜欢精致城市和外企资源的同学", "关注产业机会、想毗邻上海的同学", "对城市品质和校园环境有要求的同学"],
    tips: "苏州高校以苏大为首，独墅湖高教区聚集多所院校。毗邻上海的地缘优势为实习和就业提供便利。",
    tags: ["园林校园", "产业强市", "城市品质"],
    cost: "较高",
    transit: "便利",
    jobs: "很丰富",
    audience: "适合喜欢精致城市、外企资源和产业机会的同学",
    stats: { area: "8488 km²", population: "约 1290 万", universityCount: 4 },
  },
  无锡: {
    identity: "太湖明珠 · 宜居之城",
    summary: "太湖之滨的产业强市，物联网与制造业集聚，城市品质与生活节奏舒适。",
    impressions: ["太湖生活", "宜居节奏", "产业实习", "物联网", "城市整洁"],
    suitableFor: ["想兼顾舒适城市与产业机会的同学", "对物联网、制造业有兴趣的同学", "喜欢山水环境、偏好中等城市节奏的同学"],
    tips: "江南大学是211重点，蠡湖校区环境优美。无锡地铁通达，城市不大但配套齐全。",
    tags: ["太湖生活", "宜居节奏", "产业实习"],
    cost: "中等",
    transit: "便利",
    jobs: "丰富",
    audience: "适合想兼顾舒适城市、产业机会和校园生活品质的同学",
    stats: { area: "4627 km²", population: "约 750 万", universityCount: 3 },
  },
  徐州: {
    identity: "淮海中心城市 · 汉文化发源地",
    summary: "淮海经济区中心城市，北方城市氛围浓厚，物价友好，学风扎实。",
    impressions: ["学风扎实", "生活友好", "考研氛围", "汉文化", "交通枢纽"],
    suitableFor: ["重视性价比和踏实学风的同学", "喜欢北方生活气质的同学", "关注考研深造、想安静读书的同学"],
    tips: "中国矿业大学是211重点，南湖校区环境优美。徐州作为交通枢纽，高铁通达全国。",
    tags: ["学风扎实", "生活友好", "考研氛围"],
    cost: "友好",
    transit: "便利",
    jobs: "稳步增长",
    audience: "适合重视性价比、踏实学风和北方生活气质的同学",
    stats: { area: "11258 km²", population: "约 900 万", universityCount: 4 },
  },
  常州: {
    identity: "制造业强市 · 龙城",
    summary: "长三角制造业重镇，城市紧凑通勤方便，生活成本与城市资源平衡。",
    impressions: ["制造业强", "城市紧凑", "生活轻松", "恐龙园", "工业底蕴"],
    suitableFor: ["偏应用型专业、想要稳定发展的同学", "喜欢低通勤压力和中等生活成本的同学", "对机械、材料、新能源等方向有兴趣的同学"],
    tips: "常州大学、江苏理工学院等提供多样化选择。BRT+地铁组合让城市出行高效便捷。",
    tags: ["制造业强", "城市紧凑", "生活轻松"],
    cost: "中等",
    transit: "便利",
    jobs: "稳定",
    audience: "适合偏应用型专业、想要稳定发展和低通勤压力的同学",
    stats: { area: "4385 km²", population: "约 540 万", universityCount: 3 },
  },
  南通: {
    identity: "江海门户 · 近代第一城",
    summary: "滨江临海的新兴城市，基础教育强，城市干净清爽，成长空间大。",
    impressions: ["江海城市", "生活清爽", "成长空间", "基础教育", "滨江临海"],
    suitableFor: ["喜欢安静校园和清爽城市的同学", "关注成长型机会的同学", "对海洋、纺织、建筑等方向有兴趣的同学"],
    tips: "南通大学主校区配套完善。城市不大但发展迅速，地铁在建，未来出行将更便利。",
    tags: ["江海城市", "生活清爽", "成长空间"],
    cost: "中等",
    transit: "较便利",
    jobs: "发展中",
    audience: "适合喜欢安静校园、清爽城市和成长型机会的同学",
    stats: { area: "8001 km²", population: "约 770 万", universityCount: 2 },
  },
  扬州: {
    identity: "淮扬文化名城 · 世界美食之都",
    summary: "淮扬菜发源地，历史文化底蕴深厚，生活节奏慢，宜居度极高。",
    impressions: ["淮扬生活", "历史名城", "节奏舒缓", "美食之都", "园林雅致"],
    suitableFor: ["重视生活幸福感的同学", "对师范、农学感兴趣的同学", "喜欢慢节奏和文化底蕴的同学"],
    tips: "扬州大学瘦西湖校区环境优美，城市精致适合骑行。淮扬美食让校园生活更有滋味。",
    tags: ["淮扬生活", "历史名城", "节奏舒缓"],
    cost: "友好",
    transit: "便利",
    jobs: "稳定",
    audience: "适合重视生活幸福感、师范农学和慢节奏城市的同学",
    stats: { area: "6591 km²", population: "约 450 万", universityCount: 2 },
  },
  镇江: {
    identity: "山水花园城市 · 南京近邻",
    summary: "紧邻南京的山水城市，城市紧凑通勤短，工科院校底蕴深厚。",
    impressions: ["山水校园", "南京近邻", "工科底色", "紧凑宜居", "历史底蕴"],
    suitableFor: ["喜欢紧凑城市和工科院校的同学", "想享受宁镇通勤资源的同学", "偏好山水环境、不喜大城市喧嚣的同学"],
    tips: "江苏大学本部在镇江，工科实力突出。城市紧凑，骑行即可通勤，到南京高铁仅20分钟。",
    tags: ["山水校园", "南京近邻", "工科底色"],
    cost: "友好",
    transit: "便利",
    jobs: "稳定",
    audience: "适合喜欢紧凑城市、工科院校和宁镇通勤资源的同学",
    stats: { area: "3840 km²", population: "约 320 万", universityCount: 2 },
  },
  盐城: {
    identity: "沿海湿地城市 · 东方湿地之都",
    summary: "江苏面积最大的城市，沿海湿地生态独特，生活成本低，空气质量优良。",
    impressions: ["沿海湿地", "生活成本低", "基础扎实", "生态城市", "空气优良"],
    suitableFor: ["想要低生活压力的同学", "喜欢安静校园和自然环境的同学", "对生态、农业、师范方向有兴趣的同学"],
    tips: "盐城东西狭长，不同高校分布在市区和各县。湿地生态独特，适合静心求学。",
    tags: ["沿海湿地", "生活成本低", "基础扎实"],
    cost: "友好",
    transit: "较便利",
    jobs: "发展中",
    audience: "适合想要低生活压力、安静校园和地方产业机会的同学",
    stats: { area: "16931 km²", population: "约 670 万", universityCount: 3 },
  },
  淮安: {
    identity: "运河之都 · 淮扬菜正宗",
    summary: "大运河沿线重要城市，淮扬菜发源地之一，生活节奏悠然，物价友好。",
    impressions: ["运河城市", "师范工科", "物价友好", "烟火气", "历史底蕴"],
    suitableFor: ["重视生活成本和烟火气的同学", "对师范、工科专业有兴趣的同学", "喜欢有历史底蕴的中小城市的同学"],
    tips: "淮阴工学院、淮阴师范学院各具特色。城市物价友好，运河文化让日常充满历史感。",
    tags: ["运河城市", "师范工科", "物价友好"],
    cost: "友好",
    transit: "便利",
    jobs: "稳定",
    audience: "适合重视生活成本、师范工科和城市烟火气的同学",
    stats: { area: "10072 km²", population: "约 455 万", universityCount: 2 },
  },
  泰州: {
    identity: "医药产业名城 · 水城慢生活",
    summary: "医药产业集聚地，城市安静宜居，早茶文化浓厚，生活幸福感强。",
    impressions: ["医药产业", "城市安静", "生活宜居", "早茶文化", "水乡风貌"],
    suitableFor: ["关注医药健康产业的同学", "喜欢安静学习环境的同学", "重视生活宜居度的同学"],
    tips: "泰州学院、南京中医药大学泰州校区等提供选择。城市不大但医药产业突出，实习就业有特色。",
    tags: ["医药产业", "城市安静", "生活宜居"],
    cost: "友好",
    transit: "较便利",
    jobs: "稳定",
    audience: "适合关注医药健康产业、喜欢安静学习环境的同学",
    stats: { area: "5787 km²", population: "约 450 万", universityCount: 2 },
  },
  宿迁: {
    identity: "新兴城市 · 江苏绿肺",
    summary: "江苏最年轻的地级市，生态资源丰富，生活成本省内最低，校园学习专注。",
    impressions: ["新兴城市", "成本低", "校园专注", "生态绿色", "潜力成长"],
    suitableFor: ["预算敏感、想要专注读书的同学", "喜欢安静环境和稳步成长的同学", "关注性价比、不介意城市规模的同学"],
    tips: "宿迁学院是主要本科院校。城市年轻有活力，生活成本低，适合安静读书。",
    tags: ["新兴城市", "成本低", "校园专注"],
    cost: "低",
    transit: "便利",
    jobs: "成长中",
    audience: "适合预算敏感、想要专注读书和稳步成长的同学",
    stats: { area: "8555 km²", population: "约 495 万", universityCount: 1 },
  },
  连云港: {
    identity: "山海港口城市 · 新亚欧大陆桥起点",
    summary: "江苏唯一的海滨城市，山海风光独特，港口资源丰富，空气清新宜人。",
    impressions: ["山海城市", "港口资源", "空气清爽", "海洋特色", "风景独特"],
    suitableFor: ["喜欢山海风光的同学", "对海洋类专业有兴趣的同学", "喜欢慢节奏校园和自然环境的同学"],
    tips: "江苏海洋大学可观海，海洋类专业特色突出。城市山海相连，是省内自然风光最独特的求学地。",
    tags: ["山海城市", "港口资源", "空气清爽"],
    cost: "友好",
    transit: "较便利",
    jobs: "发展中",
    audience: "适合喜欢山海风光、海洋类专业和慢节奏校园的同学",
    stats: { area: "7615 km²", population: "约 460 万", universityCount: 1 },
  },
};

export function getCityProfile(city: string | null): CityCockpitProfile {
  if (!city) return DEFAULT_CITY_PROFILE;
  return CITY_COCKPIT_PROFILE[city] ?? DEFAULT_CITY_PROFILE;
}

export interface NearbyCityHint {
  name: string;
  reason: string;
}

export interface CityMeta {
  name: string;
  identity: string;
  costLevel: string;
  transportLevel: string;
  opportunityLevel: string;
  rhythmLevel: string;
  impressionTags: string[];
  suitableFor: string[];
  exploreTip: string;
  area: string;
  population: string;
  nearbyCities: NearbyCityHint[];
}

const CITY_META_OVERRIDES: Record<string, Pick<CityMeta, "rhythmLevel" | "nearbyCities">> = {
  南京: {
    rhythmLevel: "都市便利",
    nearbyCities: [
      { name: "苏州", reason: "经济机会强，城市品质高" },
      { name: "镇江", reason: "南京近邻，生活成本更友好" },
      { name: "徐州", reason: "高校更多，区域中心" },
    ],
  },
  苏州: {
    rhythmLevel: "精致繁忙",
    nearbyCities: [
      { name: "南京", reason: "高校资源最强" },
      { name: "无锡", reason: "太湖生活，通勤舒适" },
      { name: "常州", reason: "制造业强，成本适中" },
    ],
  },
  无锡: {
    rhythmLevel: "舒适宜居",
    nearbyCities: [
      { name: "苏州", reason: "外企和产业机会更多" },
      { name: "南京", reason: "高校资源更集中" },
      { name: "常州", reason: "城市紧凑，制造业强" },
    ],
  },
  徐州: {
    rhythmLevel: "扎实专注",
    nearbyCities: [
      { name: "南京", reason: "高校资源最强" },
      { name: "宿迁", reason: "成本更低，安静读书" },
      { name: "淮安", reason: "生活成本低，节奏舒适" },
    ],
  },
  常州: {
    rhythmLevel: "紧凑稳定",
    nearbyCities: [
      { name: "无锡", reason: "宜居度高，太湖资源" },
      { name: "苏州", reason: "产业机会更多" },
      { name: "南京", reason: "高校层次更丰富" },
    ],
  },
  南通: {
    rhythmLevel: "清爽成长",
    nearbyCities: [
      { name: "苏州", reason: "就业机会强" },
      { name: "南京", reason: "高校资源更集中" },
      { name: "扬州", reason: "生活节奏舒适" },
    ],
  },
  扬州: {
    rhythmLevel: "从容文艺",
    nearbyCities: [
      { name: "南京", reason: "高校资源最强" },
      { name: "镇江", reason: "山水城市，工科底色" },
      { name: "淮安", reason: "成本友好，节奏舒适" },
    ],
  },
  镇江: {
    rhythmLevel: "山水紧凑",
    nearbyCities: [
      { name: "南京", reason: "高校资源最强" },
      { name: "扬州", reason: "生活节奏舒适" },
      { name: "常州", reason: "制造业机会稳定" },
    ],
  },
  盐城: {
    rhythmLevel: "生态安静",
    nearbyCities: [
      { name: "淮安", reason: "成本低，生活舒适" },
      { name: "南通", reason: "江海城市，成长空间" },
      { name: "南京", reason: "高校资源最强" },
    ],
  },
  淮安: {
    rhythmLevel: "低压烟火",
    nearbyCities: [
      { name: "徐州", reason: "高校更多，区域中心" },
      { name: "宿迁", reason: "成本更低，安静读书" },
      { name: "南京", reason: "高校资源最强" },
    ],
  },
  泰州: {
    rhythmLevel: "安静宜居",
    nearbyCities: [
      { name: "南京", reason: "高校资源最强" },
      { name: "扬州", reason: "文化名城，生活舒适" },
      { name: "南通", reason: "江海城市，成长空间" },
    ],
  },
  宿迁: {
    rhythmLevel: "安静读书",
    nearbyCities: [
      { name: "徐州", reason: "高校更多，区域中心" },
      { name: "淮安", reason: "生活成本低，城市节奏舒适" },
      { name: "南京", reason: "高校资源最强" },
    ],
  },
  连云港: {
    rhythmLevel: "山海慢节奏",
    nearbyCities: [
      { name: "徐州", reason: "高校更多，区域中心" },
      { name: "南京", reason: "高校资源最强" },
      { name: "盐城", reason: "生态城市，成本友好" },
    ],
  },
};

export function getCityMeta(city: string | null): CityMeta {
  const name = city ?? "江苏";
  const profile = getCityProfile(city);
  const override = city ? CITY_META_OVERRIDES[city] : undefined;
  return {
    name,
    identity: profile.identity,
    costLevel: profile.cost,
    transportLevel: profile.transit,
    opportunityLevel: profile.jobs,
    rhythmLevel: override?.rhythmLevel ?? "校园生活",
    impressionTags: profile.impressions,
    suitableFor: profile.suitableFor,
    exploreTip: profile.tips,
    area: profile.stats.area,
    population: profile.stats.population,
    nearbyCities: override?.nearbyCities ?? [],
  };
}
