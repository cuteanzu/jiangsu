import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { X, ArrowLeft, MapPin, Clock, MessageCircle, HelpCircle } from "lucide-react";
import { UNIVERSITIES, universityBandLabel, universityBandReason } from "../../data/jiangsu-universities";
import type { Tier } from "../../data/jiangsu-universities";
import { SCHOOL_REC } from "./schoolRecommendations";
import { cityLifeNote } from "../../data/city-profiles";

const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DetailOverlay = styled.div`
  position: absolute; inset: 0; z-index: 30;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(255,240,235,0.7) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 70%, rgba(235,240,255,0.5) 0%, transparent 50%),
    linear-gradient(175deg, #FDF8F4 0%, #F7F0E8 40%, #F1E8DC 100%);
  backdrop-filter: blur(16px);
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto; padding: 40px 20px 60px;
  animation: ${fadeIn} 0.25s ease-out;
  @media (max-width: 820px) { padding: 20px 12px 40px; }
`;

const MagazineCard = styled.div`
  background: rgba(255,252,247,0.92);
  border-radius: 28px;
  border: 1px solid rgba(200,170,150,0.22);
  box-shadow: 0 8px 50px rgba(140,100,70,0.10), 0 2px 12px rgba(180,150,130,0.06);
  padding: 40px 48px;
  max-width: 980px;
  width: 100%;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  position: relative;
  animation: ${fadeUp} 0.35s ease-out 0.08s both;
  @media (max-width: 820px) { padding: 28px 24px; }
`;

const MagazineClose = styled.button`
  position: absolute; top: 20px; right: 20px;
  border: none; background: rgba(200,170,150,0.12); border-radius: 50%;
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #8b7d73;
  &:hover { background: rgba(200,150,130,0.25); color: #3a2f28; }
  svg { width: 16px; height: 16px; }
`;

const HeroSection = styled.div`
  margin-bottom: 32px; padding-bottom: 24px;
  border-bottom: 1px solid rgba(200,170,150,0.15);
`;

const HeroName = styled.h2`
  margin: 0 0 8px 0;
  font-family: "Noto Serif SC","Songti SC","KaiTi",serif;
  font-size: 28px; font-weight: 800; color: #2a1f18;
  letter-spacing: 0.03em;
  @media (max-width: 820px) { font-size: 22px; }
`;

const HeroMeta = styled.div`
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 12px; font-size: 13px; color: #6b5d53;
  svg { width: 14px; height: 14px; color: #b0a090; }
`;

const HeroTagline = styled.p`
  margin: 0; font-size: 15px; line-height: 1.7; color: #5a4a3a;
  font-family: "Noto Serif SC","Songti SC",serif;
  font-style: italic;
  @media (max-width: 820px) { font-size: 13px; }
`;

const MagazineSection = styled.div` margin-bottom: 32px; `;

const SectionHeading = styled.h3`
  margin: 0 0 14px 0;
  font-family: "Noto Serif SC","Songti SC","KaiTi",serif;
  font-size: 17px; font-weight: 700; color: #3a2f28;
  display: flex; align-items: center; gap: 8px;
  svg { width: 18px; height: 18px; color: #c76b5e; }
`;

const FactCardGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const FactCard = styled.div`
  background: rgba(255,250,246,0.7); border-radius: 14px; padding: 14px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  text-align: center;
  .fl { font-size: 10px; color: #b0a090; font-weight: 500; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .fv { font-size: 16px; font-weight: 700; color: #3a2f28; }
  .fs { font-size: 11px; color: #6b5d53; margin-top: 1px; }
`;

const FitCardGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
`;

const FitCard = styled.div`
  background: rgba(255,250,246,0.6); border-radius: 14px; padding: 14px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  font-size: 12px; line-height: 1.6; color: #5a4a3a;
  .ficon { font-size: 20px; margin-bottom: 6px; display: block; }
  .ftitle { font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #3a2f28; }
`;

const LifeGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

const LifeCard = styled.div`
  background: rgba(255,250,246,0.6); border-radius: 14px; padding: 14px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  font-size: 11px; line-height: 1.6; color: #5a4a3a;
  .licon { font-size: 18px; margin-bottom: 4px; display: block; }
  .ltitle { font-weight: 700; font-size: 12px; margin-bottom: 2px; color: #3a2f28; }
`;

const CardList = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const ContentCard = styled.div`
  background: rgba(255,250,246,0.55); border-radius: 12px; padding: 12px 16px;
  border: 1px solid rgba(200,170,150,0.15);
  font-size: 12px; line-height: 1.6; color: #5a4a3a;
  .ctitle { font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #3a2f28; }
  .cmeta { font-size: 10px; color: #a09080; margin-top: 4px; }
`;

const ActionBar = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-top: 32px; padding-top: 20px;
  border-top: 1px solid rgba(200,170,150,0.15);
`;

const MgzBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 14px;
  font-size: 13px; font-weight: 700;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  cursor: pointer;
  border: 1.5px solid ${({ $primary }) => $primary ? "rgba(200,130,110,0.35)" : "rgba(200,170,150,0.25)"};
  background: ${({ $primary }) => $primary ? "rgba(240,138,120,0.10)" : "rgba(255,252,247,0.6)"};
  color: ${({ $primary }) => $primary ? "#b04a3a" : "#4a3a2a"};
  transition: all 0.15s ease;
  &:hover {
    background: ${({ $primary }) => $primary ? "rgba(240,138,120,0.18)" : "rgba(200,170,150,0.20)"};
    border-color: rgba(200,150,130,0.45);
  }
  svg { width: 15px; height: 15px; }
`;

const TierBadge = styled.span<{ $tier: Tier }>`
  font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: 600;
  background: ${({ $tier }) =>
    $tier === "985" ? "rgba(200,80,60,0.12)" :
    $tier === "211" ? "rgba(180,120,80,0.12)" :
    $tier === "dual" ? "rgba(100,120,180,0.10)" :
    "rgba(150,150,150,0.08)"};
  color: ${({ $tier }) =>
    $tier === "985" ? "#b04a3a" :
    $tier === "211" ? "#9b6a4a" :
    $tier === "dual" ? "#5a6090" :
    "#7a7a7a"};
`;

interface Props {
  schoolName: string;
  onClose: () => void;
}

export default function SchoolDetailOverlay({ schoolName, onClose }: Props) {
  const school = useMemo(() => UNIVERSITIES.find((u) => u.name === schoolName) ?? null, [schoolName]);

  if (!school) return null;

  const life = cityLifeNote(school.city);
  const tierLabel = universityBandLabel(school);
  const tierDesc = school.tier === "985" ? "顶尖研究型大学"
    : school.tier === "211" ? "重点建设高校"
    : school.tier === "dual" ? "双一流学科建设高校"
    : universityBandReason(school);

  const recText = SCHOOL_REC[school.name] ?? `位于${school.city}的一所优秀本科院校。`;

  return (
    <DetailOverlay onClick={onClose}>
      <MagazineCard onClick={(e) => e.stopPropagation()}>
        <MagazineClose type="button" aria-label="关闭学校详情" onClick={onClose}>
          <X size={16} />
        </MagazineClose>

        <HeroSection>
          <HeroName>{school.name}</HeroName>
          <HeroMeta>
            <MapPin size={14} /> {school.city}市
            <TierBadge $tier={school.tier}>{tierLabel}</TierBadge>
            {school.founded && <><Clock size={14} /> {school.founded} 年建校</>}
          </HeroMeta>
          <HeroTagline>{recText}</HeroTagline>
        </HeroSection>

        <MagazineSection>
          <SectionHeading>📋 学校速览</SectionHeading>
          <FactCardGrid>
            <FactCard>
              <div className="fl">所在城市</div>
              <div className="fv">{school.city}</div>
              <div className="fs">江苏省</div>
            </FactCard>
            <FactCard>
              <div className="fl">学校层级</div>
              <div className="fv">{tierLabel}</div>
              <div className="fs">{tierDesc}</div>
            </FactCard>
            {school.founded && (
              <FactCard>
                <div className="fl">建校时间</div>
                <div className="fv">{school.founded}</div>
                <div className="fs">{new Date().getFullYear() - school.founded} 年办学历史</div>
              </FactCard>
            )}
            <FactCard>
              <div className="fl">学校类型</div>
              <div className="fv">本科院校</div>
              <div className="fs">全日制普通高校</div>
            </FactCard>
          </FactCardGrid>
        </MagazineSection>

        <MagazineSection>
          <SectionHeading>🎯 适合怎样的你</SectionHeading>
          <FitCardGrid>
            <FitCard>
              <span className="ficon">📚</span>
              <div className="ftitle">喜欢安静校园环境</div>
              {school.city}高校校园绿树成荫、学习氛围浓厚，适合能静下心、专注学业的学生。图书馆和自习室资源充足，能给你一个安心的学习空间。
            </FitCard>
            <FitCard>
              <span className="ficon">💡</span>
              <div className="ftitle">
                {school.tier === "985" || school.tier === "211" ? "关注学术研究与深造" : "关注应用型专业与就业"}
              </div>
              {school.tier === "985" || school.tier === "211"
                ? "学校学术资源丰富，保研率较高，适合有读研读博规划、想在学术道路上走得更远的学生。"
                : "学校注重实践教学和产教融合，专业设置贴近市场需求，适合毕业后直接就业或创业的学生。"}
            </FitCard>
            <FitCard>
              <span className="ficon">🏙️</span>
              <div className="ftitle">想在本地城市稳定发展</div>
              {school.city}是江苏省{
                school.city === "南京" ? "省会，就业机会丰富，" :
                school.city === "苏州" ? "经济强市，外企和科技企业密集，" :
                "重要城市，"
              }校友网络遍布本地，毕业后留{
                school.city
              }发展优势明显。
            </FitCard>
          </FitCardGrid>
        </MagazineSection>

        <MagazineSection>
          <SectionHeading>🏫 校园生活</SectionHeading>
          <LifeGrid>
            <LifeCard>
              <span className="licon">🛏️</span>
              <div className="ltitle">宿舍</div>
              {life.dorm}
            </LifeCard>
            <LifeCard>
              <span className="licon">🍽️</span>
              <div className="ltitle">食堂</div>
              {life.food}
            </LifeCard>
            <LifeCard>
              <span className="licon">🚌</span>
              <div className="ltitle">交通</div>
              {life.transit}
            </LifeCard>
            <LifeCard>
              <span className="licon">🛍️</span>
              <div className="ltitle">周边生活</div>
              {life.life}
            </LifeCard>
          </LifeGrid>
        </MagazineSection>

        <MagazineSection>
          <SectionHeading>💬 学长学姐经验</SectionHeading>
          <CardList>
            <ContentCard>
              <div className="ctitle">在{school.city}上大学是怎样的体验？</div>
              <div>
                {school.city}是一座{
                  school.city === "南京" ? "历史与现代交融的省会城市，四季分明，梧桐树下的校园充满了人文气息。" :
                  school.city === "苏州" ? "园林之城，古典与现代交织，在这里读书有一种在画中行走的感觉。" :
                  school.city === "无锡" ? "太湖明珠，城市不大但精致宜居，学习之余可以去蠡湖边散步。" :
                  school.city === "徐州" ? "北方气息浓厚的城市，淮海经济区中心，物价友好生活便利。" :
                  school.city === "南通" ? "滨江临海的城市，干净整洁，有'近代第一城'的美誉。" :
                  school.city === "扬州" ? "历史文化名城，早上皮包水晚上水包皮，生活幸福感很高。" :
                  "充满生活气息的城市，节奏不紧不慢，适合安心读书。"
                }
                在校生活体验很好，老师负责，同学友善。
              </div>
              <div className="cmeta">💬 24 条讨论</div>
            </ContentCard>
            <ContentCard>
              <div className="ctitle">{school.city}高校食堂红黑榜</div>
              <div>食堂整体水平不错，价格实惠。{school.name}的食堂在本地高校中口碑较好，推荐尝试招牌菜。</div>
              <div className="cmeta">💬 18 条讨论</div>
            </ContentCard>
          </CardList>
        </MagazineSection>

        <MagazineSection>
          <SectionHeading>❓ 新生问答</SectionHeading>
          <CardList>
            <ContentCard>
              <div className="ctitle">Q: {school.city}生活费一个月多少合适？</div>
              <div>A: 在{school.city}上学，一个月生活费大约{
                school.city === "南京" || school.city === "苏州" ? "1500-2500元" :
                school.city === "徐州" || school.city === "宿迁" || school.city === "连云港" ? "1000-1800元" :
                "1200-2000元"
              }。食堂一顿饭8-15元，加上水果零食、日用品、偶尔外出聚餐，合理规划可以过得不错。</div>
              <div className="cmeta">12 条回答</div>
            </ContentCard>
            <ContentCard>
              <div className="ctitle">Q: {school.city}转专业难不难？</div>
              <div>A: {
                school.tier === "985" || school.tier === "211"
                  ? "重点高校的转专业政策相对规范，一般大一下学期可以申请，需要绩点达到一定要求并通过考核。各专业名额有限，热门专业竞争较大。"
                  : "大多数学校在大一结束时开放转专业申请，需要绩点和面试考核。建议入学后尽早了解目标专业的具体要求。"
              }</div>
              <div className="cmeta">8 条回答</div>
            </ContentCard>
          </CardList>
        </MagazineSection>

        <ActionBar>
          <MgzBtn $primary onClick={onClose}>
            <ArrowLeft size={15} /> 返回地图
          </MgzBtn>
          <MgzBtn>
            <MessageCircle size={15} /> 查看相关经验
          </MgzBtn>
          <MgzBtn>
            <HelpCircle size={15} /> 我要提问
          </MgzBtn>
        </ActionBar>
      </MagazineCard>
    </DetailOverlay>
  );
}
