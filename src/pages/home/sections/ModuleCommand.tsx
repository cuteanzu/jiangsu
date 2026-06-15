import styled from "styled-components";
import { ArrowRight, BookOpen, Compass, Database, MessageCircle, Route } from "lucide-react";
import { useTransition } from "../../../context/useTransition";

type ModuleTone = "data" | "map" | "notes" | "qa";

interface ModuleCardData {
  id: ModuleTone;
  path: string;
  eyebrow: string;
  title: string;
  brief: string;
  action: string;
  metric: string;
  metricLabel: string;
  Icon: typeof Database;
  lines: string[];
  layout: "wide" | "tall" | "compact";
}

const modules: ModuleCardData[] = [
  {
    id: "data",
    path: "/schools",
    eyebrow: "DATA DESK",
    title: "高校库是筛选台",
    brief: "用城市、层次、类型、生活画像和内容线索，把候选学校压缩到真正值得比较的范围。",
    action: "筛学校",
    metric: "47",
    metricLabel: "所本科院校",
    Icon: Database,
    lines: ["学校身份", "城市分布", "生活画像", "内容入口"],
    layout: "wide",
  },
  {
    id: "map",
    path: "/jiangsu",
    eyebrow: "SPATIAL MAP",
    title: "地图是发现台",
    brief: "从城市关系进入学校档案，理解学校和交通、城市机会、生活半径之间的关系。",
    action: "看空间",
    metric: "13",
    metricLabel: "座江苏城市",
    Icon: Compass,
    lines: ["城市定位", "学校分布", "空间关系", "档案入口"],
    layout: "tall",
  },
  {
    id: "notes",
    path: "/experiences",
    eyebrow: "FIELD NOTES",
    title: "经验是现场笔记",
    brief: "把宿舍、食堂、转专业、城市生活写成可阅读的现场切片，回答真实体感。",
    action: "读经验",
    metric: "笔记",
    metricLabel: "长文本判断",
    Icon: BookOpen,
    lines: ["生活细节", "避坑提醒", "成长路径"],
    layout: "compact",
  },
  {
    id: "qa",
    path: "/qa",
    eyebrow: "QUESTION TRIAGE",
    title: "问答是分诊台",
    brief: "把模糊焦虑拆成一个个具体问题，先给结论，再给条件和下一步。",
    action: "查答案",
    metric: "问答",
    metricLabel: "短结论决策",
    Icon: MessageCircle,
    lines: ["一句话结论", "适用条件", "下一步动作"],
    layout: "compact",
  },
];

const toneColor: Record<ModuleTone, string> = {
  data: "oklch(64% 0.115 42)",
  map: "oklch(58% 0.095 205)",
  notes: "oklch(62% 0.1 76)",
  qa: "oklch(56% 0.1 156)",
};

const Wrapper = styled.section`
  position: relative;
  padding: clamp(72px, 9vw, 128px) 0 clamp(60px, 8vw, 108px);
`;

const Head = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 420px);
  gap: clamp(24px, 5vw, 72px);
  align-items: end;
  margin-bottom: clamp(26px, 5vw, 52px);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: oklch(70% 0.12 42);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.12em;
`;

const Title = styled.h2`
  max-width: 12ch;
  margin: 14px 0 0;
  color: oklch(97% 0.012 76);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(38px, 6vw, 72px);
  line-height: 1.03;
  font-weight: 950;
  letter-spacing: 0;
`;

const Lead = styled.p`
  margin: 0;
  color: oklch(78% 0.018 76 / 0.78);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
  font-size: 15px;
  line-height: 1.9;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: minmax(220px, auto);
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button<{ $tone: ModuleTone; $layout: ModuleCardData["layout"] }>`
  position: relative;
  min-height: ${({ $layout }) => ($layout === "tall" ? "460px" : $layout === "wide" ? "300px" : "220px")};
  grid-column: ${({ $layout }) => ($layout === "wide" ? "span 7" : $layout === "tall" ? "span 5" : "span 6")};
  border: 1px solid oklch(91% 0.012 76 / 0.14);
  border-radius: 8px;
  background:
    linear-gradient(135deg, ${({ $tone }) => toneColor[$tone]}22, transparent 42%),
    oklch(13% 0.018 72 / 0.78);
  color: inherit;
  cursor: pointer;
  overflow: hidden;
  padding: clamp(20px, 3vw, 30px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 22px;
  text-align: left;
  font: inherit;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(oklch(96% 0.01 76 / 0.055) 1px, transparent 1px),
      linear-gradient(90deg, oklch(96% 0.01 76 / 0.04) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(135deg, black, transparent 72%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ $tone }) => toneColor[$tone]}88;
    background:
      linear-gradient(135deg, ${({ $tone }) => toneColor[$tone]}2e, transparent 48%),
      oklch(15% 0.018 72 / 0.88);
  }

  &:focus-visible {
    outline: 3px solid ${({ $tone }) => toneColor[$tone]}44;
    outline-offset: 3px;
  }

  @media (max-width: 960px) {
    grid-column: span 1;
    min-height: 260px;
  }
`;

const TopLine = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
`;

const Badge = styled.span<{ $tone: ModuleTone }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ $tone }) => toneColor[$tone]};
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 0.12em;

  svg {
    width: 15px;
    height: 15px;
  }
`;

const Metric = styled.div<{ $tone: ModuleTone }>`
  display: grid;
  justify-items: end;
  gap: 4px;

  strong {
    color: ${({ $tone }) => toneColor[$tone]};
    font-size: 27px;
    line-height: 1;
    font-weight: 950;
  }

  span {
    color: oklch(78% 0.015 76 / 0.64);
    font-size: 11px;
    font-weight: 760;
  }
`;

const Body = styled.div`
  position: relative;
  z-index: 1;
  align-self: end;
`;

const CardTitle = styled.h3`
  max-width: 11ch;
  margin: 0;
  color: oklch(96% 0.012 76);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.12;
  font-weight: 950;
`;

const Brief = styled.p`
  max-width: 46ch;
  margin: 13px 0 0;
  color: oklch(79% 0.016 76 / 0.74);
  font-size: 13.5px;
  line-height: 1.85;
`;

const FeatureRail = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Feature = styled.span<{ $tone: ModuleTone }>`
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid ${({ $tone }) => toneColor[$tone]}42;
  border-radius: 999px;
  background: oklch(96% 0.008 76 / 0.04);
  color: oklch(86% 0.014 76 / 0.76);
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  font-weight: 820;
`;

const Action = styled.span<{ $tone: ModuleTone }>`
  margin-left: auto;
  color: ${({ $tone }) => toneColor[$tone]};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 950;

  svg {
    width: 14px;
    height: 14px;
  }
`;

export default function ModuleCommand() {
  const { navigateWithTransition } = useTransition();

  return (
    <Wrapper>
      <Head>
        <div>
          <Kicker>
            <Route size={15} />
            SITE COMMAND
          </Kicker>
          <Title>四个模块，各自解决一个判断。</Title>
        </div>
        <Lead>
          首页不再只是展示氛围，而是把用户带进一条清楚的路线：数据先筛、地图发现、经验补真实感、问答做决策分诊。
        </Lead>
      </Head>

      <Grid>
        {modules.map((item) => {
          const Icon = item.Icon;
          return (
            <Card
              key={item.id}
              type="button"
              $tone={item.id}
              $layout={item.layout}
              onClick={() => navigateWithTransition(item.path)}
            >
              <TopLine>
                <Badge $tone={item.id}>
                  <Icon />
                  {item.eyebrow}
                </Badge>
                <Metric $tone={item.id}>
                  <strong>{item.metric}</strong>
                  <span>{item.metricLabel}</span>
                </Metric>
              </TopLine>

              <Body>
                <CardTitle>{item.title}</CardTitle>
                <Brief>{item.brief}</Brief>
              </Body>

              <FeatureRail>
                {item.lines.map((line) => (
                  <Feature key={line} $tone={item.id}>{line}</Feature>
                ))}
                <Action $tone={item.id}>
                  {item.action}
                  <ArrowRight />
                </Action>
              </FeatureRail>
            </Card>
          );
        })}
      </Grid>
    </Wrapper>
  );
}
