// ── Curated experience posts & Q&A ──
// Pre-written editorial content — not real UGC

export type PostCategory =
  | "dorm"
  | "cafeteria"
  | "study"
  | "freshman"
  | "city-life"
  | "exam"
  | "career";

export interface ExperiencePost {
  id: string;
  category: PostCategory;
  schoolId: string;
  schoolName: string;
  city: string;
  title: string;
  excerpt: string;
  body: string;
  likes: number;
  comments: number;
  tags: string[];
}

export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  schoolId?: string;
  schoolName?: string;
  category: string;
  likes: number;
}

export const CATEGORY_META: Record<PostCategory, { label: string; color: string }> = {
  dorm: { label: "宿舍体验", color: "#c76b5e" },
  cafeteria: { label: "食堂评价", color: "#b8936e" },
  study: { label: "专业学习", color: "#7b5ea7" },
  freshman: { label: "新生避坑", color: "#4a8eb5" },
  "city-life": { label: "城市生活", color: "#5a9e7c" },
  exam: { label: "考研保研", color: "#c44545" },
  career: { label: "就业实习", color: "#4a6fa5" },
};

export const EXPERIENCES: ExperiencePost[] = [
  {
    id: "exp-1",
    category: "dorm",
    schoolId: "nju",
    schoolName: "南京大学",
    city: "南京",
    title: "住得好才能学得好——南大仙林宿舍全攻略",
    excerpt:
      "仙林校区的宿舍条件在江苏高校中算第一梯队，但选房也有一些门道。独立卫浴、空调、热水器一应俱全……",
    body: `南京大学仙林校区的本科生宿舍以四人间为主，上床下桌配置。每栋宿舍楼都配备了独立卫浴、空调和热水器，24 小时热水供应。

选房建议：东区宿舍楼较新但离教学楼略远，西区宿舍离食堂和超市更近。研究生宿舍集中在鼓楼校区，老建筑改造的房间别有韵味，但设施相对老旧。

宿舍楼每层都有自习室和洗衣房，一楼有公共厨房。宿管阿姨普遍温和，查寝频率不算高。唯一的槽点是仙林冬天风大，北向宿舍会偏冷。

整体评分：⭐⭐⭐⭐ 推荐新生优先选择东区新建宿舍楼。`,
    likes: 56,
    comments: 24,
    tags: ["宿舍", "仙林校区", "新生必看"],
  },
  {
    id: "exp-2",
    category: "cafeteria",
    schoolId: "seu",
    schoolName: "东南大学",
    city: "南京",
    title: "九龙湖的隐藏美食——东大食堂深度测评",
    excerpt:
      "东大九龙湖校区有四个食堂，每个都有自己的招牌。梅园的铁板饭、橘园的麻辣香锅，还有桃园的早餐煎饼……",
    body: `东南大学九龙湖校区共有梅、兰、竹、菊四个食堂，外加桃园教工食堂。每个食堂都有自己的王牌窗口。

梅园食堂：铁板饭和麻辣烫是两大招牌，人均 15 元吃饱。二楼的小炒窗口现点现做，锅气十足。
橘园食堂：麻辣香锅窗口排队最长，自选食材现炒，辣度可调。隔壁的奶茶店是自习后的救星。
桃园食堂：早餐最佳选择，煎饼果子和豆腐脑广受好评。早八人的精神支柱。

省錢技巧：食堂支持校园卡和支付宝，周末部分窗口有特价菜。整体吃一个月伙食费大约 800-1200 元。`,
    likes: 42,
    comments: 18,
    tags: ["食堂", "九龙湖", "美食"],
  },
  {
    id: "exp-3",
    category: "freshman",
    schoolId: "suda",
    schoolName: "苏州大学",
    city: "苏州",
    title: "入学前最该知道的——苏大新生生存指南",
    excerpt:
      "苏大本部在古城区，环境美得像园林，但生活配套和想象中不太一样。这几点经验希望你来之前就知道……",
    body: `苏州大学有四个校区：本部（天赐庄）、东区、北区、独墅湖。新生最容易被校区搞晕。

本部在老城区，苏式园林建筑美到窒息，但宿舍条件参差不齐。独墅湖校区现代化程度最高，设施也最新。选宿舍时尽量选独墅湖校区。

苏州的节奏比南京慢，但生活成本不低。学校周边租房贵，建议新生第一年住校适应。苏州话听不懂很正常——老师上课都用普通话。

出行方面：苏州地铁覆盖主要校区，本部到独墅湖大约 40 分钟。共享单车在校园内随处可见。苏州冬天湿冷，北方同学做好心理准备。

推荐新生关注"苏大微生活"公众号，选课攻略和活动信息都有。`,
    likes: 78,
    comments: 32,
    tags: ["新生", "苏州", "避坑"],
  },
  {
    id: "exp-4",
    category: "study",
    schoolId: "njnu",
    schoolName: "南京师范大学",
    city: "南京",
    title: "在南师读中文系是一种什么体验",
    excerpt:
      "南师的中国语言文学是国家重点学科，但真实的课堂、作业量和学术氛围，和你想象的可能不太一样……",
    body: `南京师范大学文学院是南师的王牌院系之一。中国语言文学专业在第四轮学科评估中获评 A 类，师资力量雄厚。

课堂体验：古代文学课是重头戏，教授们引经据典信手拈来。现当代文学方向更活跃，课堂讨论氛围好。每学期至少两篇课程论文，大三开始有学年论文。

自习去处：随园校区的古籍阅览室环境极佳，藏书量在江苏高校中数一数二。仙林校区的敬文图书馆座位充足，考试周需要早起占座。

学术资源：文学院定期请知名作家和学者来讲座，莫言、余华都来过。研究生推免名额较多，保研率在师范类院校中偏高。

如果你真心喜欢文学，南师不会让你失望。但如果只是为了文凭，课程压力可能会让你吃力。`,
    likes: 35,
    comments: 14,
    tags: ["专业学习", "中文系", "文科"],
  },
  {
    id: "exp-5",
    category: "city-life",
    schoolId: "jiangnan",
    schoolName: "江南大学",
    city: "无锡",
    title: "在无锡读书的四年——一座被低估的宝藏城市",
    excerpt:
      "很多人对无锡的印象只有鼋头渚和甜排骨，但在这座城市生活四年后，我发现它比想象中舒服太多……",
    body: `江南大学位于无锡滨湖区，太湖之滨。校园本身就够美——被称为"江南第一学府"并非浪得虚名。

无锡的生活节奏介于南京的忙碌和苏州的安逸之间。地铁 4 条线覆盖市区，从江大到市中心大约半小时。太湖新城商圈这几年发展很快，吃喝玩乐应有尽有。

推荐去处：蠡湖公园骑行、南长街夜市、惠山古镇喝茶。春天鼋头渚樱花，秋天拈花湾。无锡景点学生票半价。

生活成本：月均 1500-2000 元够用。租房预算 1000-1500/月能租到不错的单间。无锡的工资水平在江苏仅次于苏州南京，实习机会不少。

如果你追求不太卷、有品质感的大学生活，无锡是很好的选择。`,
    likes: 41,
    comments: 19,
    tags: ["城市生活", "无锡", "宜居"],
  },
  {
    id: "exp-6",
    category: "exam",
    schoolId: "cumt",
    schoolName: "中国矿业大学",
    city: "徐州",
    title: "矿大考研上岸指南——从双一流到 985 的逆袭路径",
    excerpt:
      "矿大的考研氛围在江苏高校中数一数二。图书馆自习室常年满座，大四考研率超过 60%。这份经验写给想冲 985 的你……",
    body: `中国矿业大学（徐州）虽然地理位置不占优，但学风极其扎实。学校保研率约 15%，考研成功率在省内双一流高校中名列前茅。

热门考研去向：南京大学、东南大学、同济大学、浙江大学。工科生尤其受 985 院校青睐。矿大与多所 985 有联合培养项目，是考研的隐形跳板。

复习资源：南湖校区图书馆四楼是考研党聚集地，氛围浓厚到让人不敢玩手机。学校有专门的考研自习室，需要提前申请座位。考研经验分享会每学期 2-3 场。

关键时间线：大三下学期开始准备，暑假是黄金复习期。矿大期末考试通常在 12 月底，与考研时间接近，需要提前规划。

如果高考失利没考上理想学校，矿大是一个很好的"中转站"。学风会逼着你往前走。`,
    likes: 63,
    comments: 28,
    tags: ["考研", "双一流", "逆袭"],
  },
  {
    id: "exp-7",
    category: "career",
    schoolId: "nuaa",
    schoolName: "南京航空航天大学",
    city: "南京",
    title: "南航毕业生都去哪了——就业数据与个人观察",
    excerpt:
      "南航的就业率在江苏高校中保持领先。航天、军工、互联网是三大主流去向，但也有不少同学选择了出人意料的路径……",
    body: `南京航空航天大学毕业生就业质量报告年年亮眼。航空航天类专业进国企/科研院所比例高（约 40%），计算机/软件类专业多去互联网大厂。

热门雇主：中国商飞、航天科技集团、航空工业集团、华为、中兴。南航在军工和制造业的口碑很硬，简历关基本不会被筛。

实习资源：南航与南京江宁区的众多企业有合作。大三暑期实习是进入大厂的最佳窗口。学校就业指导中心每周发布实习信息，建议从大一就开始关注。

薪资水平：工科应届生起薪普遍在 12-18 万/年（含年终），计算机方向更高。国企起薪低但福利好，五年后总收入差距不大。

非技术方向的同学也不用担心——南航的品牌效应在江苏就业市场足够强，银行、快消、公务员都有不少校友。`,
    likes: 48,
    comments: 22,
    tags: ["就业", "航天", "工科"],
  },
  {
    id: "exp-8",
    category: "dorm",
    schoolId: "ujs",
    schoolName: "江苏大学",
    city: "镇江",
    title: "江苏大学宿舍改造记——把四人寝变成温馨小窝",
    excerpt:
      "江大的宿舍基础条件一般，但花 200 块钱和一下午的时间，就能把普通四人寝改造得舒适又好看……",
    body: `江苏大学本部宿舍以四人间为主，部分是六人间。基础配置：上下铺 + 独立书桌 + 空调 + 公共卫浴。

改造清单（总花费 ~200 元）：
1. 床帘 + 支架（60 元）——创造私密空间，遮光效果好
2. LED 灯串（20 元）——贴在书桌上方，氛围感拉满
3. 桌上置物架（30 元）——收纳神器，桌面瞬间整洁
4. 泡沫地垫（50 元）——冬天光脚不冷，室友可以一起坐地上聊天
5. 门后挂钩（15 元）——挂书包、外套、雨伞

宿舍关系建议：第一周就制定好值日表和熄灯时间，避免日后摩擦。江大的宿管阿姨普遍好说话，偶尔晚归说一声就行。

本部宿舍虽然不新，但胜在离教学楼和食堂都近，五分钟步行覆盖全部。`,
    likes: 29,
    comments: 12,
    tags: ["宿舍改造", "镇江", "生活"],
  },
  {
    id: "exp-9",
    category: "freshman",
    schoolId: "xjtlu",
    schoolName: "西交利物浦大学",
    city: "苏州",
    title: "中外合作大学的真实体验——西交利物浦到底值不值",
    excerpt:
      "一年学费 8.8 万，全英文授课，90% 出国读研——西浦的 tagline 很诱人，但真实体验和营销话术之间有差距……",
    body: `西交利物浦大学位于苏州工业园区，校园建筑现代感十足。全英文授课是真的，大一就要适应全英文学术环境，对英语基础要求很高。

教学模式与国内高校完全不同：没有辅导员、没有固定班级、没有早晚自习。选课制和导师制意味着很强的自主性——自律差的同学可能会跟不上。

出国深造率确实很高（约 85% 去 QS 前 100），但背后是高昂的经济投入。四年学费约 35 万，加上留学硕士又是 30-50 万。家庭经济压力要考虑清楚。

社交方面：学生来自全国各地，国际化程度高（约 10% 国际生）。校园活动丰富但学术竞争也激烈，GPA 压分是公开的秘密。

适合人群：英语好、自律、家庭经济宽裕、有明确出国规划的同学。不适合：随大流选校、英语吃力、喜欢传统校园氛围的同学。`,
    likes: 55,
    comments: 36,
    tags: ["中外合作", "苏州", "择校"],
  },
  {
    id: "exp-10",
    category: "study",
    schoolId: "cpu",
    schoolName: "中国药科大学",
    city: "南京",
    title: "药学这条路——从药大本科到医药行业的真实路径",
    excerpt:
      "药学不是「化学+生物」那么简单。药大的课程设置、实验强度和就业方向，来之前你必须知道……",
    body: `中国药科大学是中国药学教育的最高学府。江宁校区环境优美，实验室设备全国顶尖。

课业强度：大一大二基础课（无机化学、有机化学、生物化学、生理学），实验课占比很高，每周至少两个下午泡在实验室。大三大四进入专业课（药剂学、药理学、药物化学、药物分析），难度跃升。

就业方向：
- 药企研发（恒瑞、正大天晴等）：硕士起步，博士更好
- 医院药房：稳定但收入天花板低
- 药品注册/临床监查：女生选择较多的方向
- 医药代表：收入高但压力大

药大的保研率约 20%，考研气氛浓。如果你想做科研，建议从大二就进实验室跟导师做项目。药学专业考研竞争激烈，但药大背景加成明显。`,
    likes: 37,
    comments: 16,
    tags: ["药学", "专业选择", "医药"],
  },
];

export const QA_ENTRIES: QAEntry[] = [
  {
    id: "qa-1",
    question: "南大和东大的宿舍条件哪个更好？",
    answer:
      "整体来说南大仙林校区略优于东大九龙湖校区。南大仙林以四人间为主，独卫独浴配置齐全；东大九龙湖也是四人间但部分楼栋是公共卫浴。两校新校区宿舍都不错，差别在细节：南大热水 24h 供应，东大有时段限制。如果在意住宿体验，南大仙林更推荐。",
    schoolId: "nju",
    schoolName: "南京大学",
    category: "dorm",
    likes: 42,
  },
  {
    id: "qa-2",
    question: "江苏高校的考研氛围怎么样？",
    answer:
      "江苏高校整体考研氛围浓厚，尤其是双一流和省属重点院校。中国矿业大学（徐州）考研率超过 60%，南京师范大学、江苏大学、扬州大学等也是考研大户。南京的 985/211 高校保研率较高（15%-30%），考研压力相对小一些。如果目标是考研上岸，江苏的双非一本是很好的跳板。",
    category: "exam",
    likes: 35,
  },
  {
    id: "qa-3",
    question: "转专业难不难？哪些学校最灵活？",
    answer:
      "转专业难度因学校差异很大。省内转专业政策最宽松的是南京大学（大类招生后自由选择专业方向）和苏州大学（大一末可申请转专业，成功率约 60%）。东南大学、南京航空航天大学转热门专业竞争激烈，通常要求大一绩点排名前 20%。省属本科院校转专业相对容易，但热门专业仍有门槛。建议入学前查阅目标学校的最新转专业实施办法。",
    category: "study",
    likes: 28,
  },
  {
    id: "qa-4",
    question: "在南京上学一个月生活费大概多少？",
    answer:
      "南京大学生月均生活费在 1500-2500 元之间，取决于消费习惯。食堂吃饭每月约 800-1200 元（一天三顿在食堂），加上水果零食 200 元、日用品及话费 200 元、社交娱乐 300-500 元。仙林和江宁的消费略低于鼓楼市中心。如果自己做饭（校外租房），伙食费可以压到 600 元左右。总体来说，2000 元/月在南京可以过得比较舒服。",
    category: "city-life",
    likes: 51,
    schoolId: "nju",
    schoolName: "南京大学",
  },
  {
    id: "qa-5",
    question: "西交利物浦和昆山杜克怎么选？",
    answer:
      "两校定位不同。西浦（西交利物浦）办学时间更长，在校生规模大，专业选择多，毕业生申请英国 G5 研究生有优势。昆山杜克小而精，师生比极低（1:7），课程更偏文理教育（Liberal Arts），美国杜克大学资源加持明显。费用上昆杜更贵（学费约 17 万/年 vs 西浦 8.8 万/年）。追求性价比和英国方向选西浦，追求精英教育和美国方向选昆杜。",
    category: "study",
    likes: 33,
  },
  {
    id: "qa-6",
    question: "江苏的 985/211 分别有哪些？",
    answer:
      "江苏共有 2 所 985 高校：南京大学、东南大学（均在南京）。11 所 211 高校：南京航空航天大学、南京理工大学、河海大学、南京农业大学、中国药科大学、南京师范大学、苏州大学、江南大学（无锡）、中国矿业大学（徐州），加上两所 985。此外还有 5 所双一流建设高校：南京信息工程大学、南京邮电大学、南京林业大学、南京医科大学、南京中医药大学。",
    category: "freshman",
    likes: 67,
  },
  {
    id: "qa-7",
    question: "江苏高校毕业后留在当地工作的多吗？",
    answer:
      "非常高。根据各校就业质量报告，江苏省内高校毕业生留苏就业比例普遍在 60%-80%。南京高校毕业生主要留在南京和苏州，苏州大学约 70% 毕业生留在苏州。江苏经济体量大、产业门类齐全（制造业、IT、医药、金融等），提供了充足的就业岗位。长三角一体化也让跨城就业（上海/杭州）非常方便。",
    category: "career",
    likes: 29,
  },
  {
    id: "qa-8",
    question: "徐州和连云港的高校值得去吗？",
    answer:
      "看你的目标。如果追求学术或考研跳板，中国矿业大学（徐州 211）性价比很高——分数线相对低但学风扎实，考研成功率极高。江苏海洋大学（连云港）的优势专业是海洋科学和水产养殖，在细分领域就业不错。两座城市的生活成本比南京低 30%-40%，但实习机会和城市活力确实不如苏南。如果你的分数刚好匹配，且不介意地理位置，这两所学校都值得认真考虑。",
    category: "city-life",
    likes: 25,
  },
];

/** Filter experiences by search query (matches title, excerpt, school, city, tags) */
export function searchExperiences(query: string): ExperiencePost[] {
  const q = query.toLowerCase();
  return EXPERIENCES.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.excerpt.toLowerCase().includes(q) ||
      e.schoolName.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/** Filter Q&A by search query */
export function searchQA(query: string): QAEntry[] {
  const q = query.toLowerCase();
  return QA_ENTRIES.filter(
    (a) =>
      a.question.toLowerCase().includes(q) ||
      a.answer.toLowerCase().includes(q) ||
      (a.schoolName && a.schoolName.toLowerCase().includes(q))
  );
}

/** Get experiences related to a specific school */
export function experiencesForSchool(schoolId: string): ExperiencePost[] {
  return EXPERIENCES.filter((e) => e.schoolId === schoolId);
}

/** Get Q&A related to a specific school */
export function qaForSchool(schoolId: string): QAEntry[] {
  return QA_ENTRIES.filter((a) => a.schoolId === schoolId);
}
