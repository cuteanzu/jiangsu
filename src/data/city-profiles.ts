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

export interface CityCockpitProfile {
  tags: string[];
  cost: string;
  transit: string;
  jobs: string;
  audience: string;
}

export const DEFAULT_CITY_PROFILE: CityCockpitProfile = {
  tags: ["校园生活", "本科高校", "城市体验"],
  cost: "适中",
  transit: "便利",
  jobs: "稳定",
  audience: "适合想在江苏找到学习节奏、城市资源和生活舒适度平衡点的同学",
};

export const CITY_COCKPIT_PROFILE: Record<string, CityCockpitProfile> = {
  南京: { tags: ["省会资源", "科研氛围", "实习密集"], cost: "中高", transit: "很便利", jobs: "很丰富", audience: "适合目标明确、想接触更多科研平台和城市资源的同学" },
  苏州: { tags: ["园林校园", "产业强市", "城市品质"], cost: "较高", transit: "便利", jobs: "很丰富", audience: "适合喜欢精致城市、外企资源和产业机会的同学" },
  徐州: { tags: ["学风扎实", "生活友好", "考研氛围"], cost: "友好", transit: "便利", jobs: "稳步增长", audience: "适合重视性价比、踏实学风和北方生活气质的同学" },
  无锡: { tags: ["太湖生活", "宜居节奏", "产业实习"], cost: "中等", transit: "便利", jobs: "丰富", audience: "适合想兼顾舒适城市、产业机会和校园生活品质的同学" },
  常州: { tags: ["制造业强", "城市紧凑", "生活轻松"], cost: "中等", transit: "便利", jobs: "稳定", audience: "适合偏应用型专业、想要稳定发展和低通勤压力的同学" },
  南通: { tags: ["江海城市", "生活清爽", "成长空间"], cost: "中等", transit: "较便利", jobs: "发展中", audience: "适合喜欢安静校园、清爽城市和成长型机会的同学" },
  扬州: { tags: ["淮扬生活", "历史名城", "节奏舒缓"], cost: "友好", transit: "便利", jobs: "稳定", audience: "适合重视生活幸福感、师范农学和慢节奏城市的同学" },
  镇江: { tags: ["山水校园", "南京近邻", "工科底色"], cost: "友好", transit: "便利", jobs: "稳定", audience: "适合喜欢紧凑城市、工科院校和宁镇通勤资源的同学" },
  盐城: { tags: ["沿海湿地", "生活成本低", "基础扎实"], cost: "友好", transit: "较便利", jobs: "发展中", audience: "适合想要低生活压力、安静校园和地方产业机会的同学" },
  淮安: { tags: ["运河城市", "师范工科", "物价友好"], cost: "友好", transit: "便利", jobs: "稳定", audience: "适合重视生活成本、师范工科和城市烟火气的同学" },
  泰州: { tags: ["医药产业", "城市安静", "生活宜居"], cost: "友好", transit: "较便利", jobs: "稳定", audience: "适合关注医药健康产业、喜欢安静学习环境的同学" },
  宿迁: { tags: ["新兴城市", "成本低", "校园专注"], cost: "低", transit: "便利", jobs: "成长中", audience: "适合预算敏感、想要专注读书和稳步成长的同学" },
  连云港: { tags: ["山海城市", "港口资源", "空气清爽"], cost: "友好", transit: "较便利", jobs: "发展中", audience: "适合喜欢山海风光、海洋类专业和慢节奏校园的同学" },
};

export function getCityProfile(city: string | null): CityCockpitProfile {
  if (!city) return DEFAULT_CITY_PROFILE;
  return CITY_COCKPIT_PROFILE[city] ?? DEFAULT_CITY_PROFILE;
}
