import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { MapPin, Clock, BookOpen, MessageCircle, HelpCircle, X, ExternalLink, Flame, Heart } from "lucide-react";
import { UNIVERSITIES, TIER_LABEL, universityBandLabel } from "../../data/jiangsu-universities";
import type { University, Tier } from "../../data/jiangsu-universities";
import { useTransition } from "../../context/useTransition";
import { useAuth } from "../../hooks/useAuth";
import { userApi } from "../../services/api";
import type { SchoolDTO } from "../../services/types";
import { SCHOOL_REC } from "./schoolRecommendations";

const SCHOOL_TAGS: Record<string, string[]> = {
  "南京大学": ["学术氛围浓厚", "鼓楼校区", "仙林大学城"],
  "东南大学": ["建筑老八校", "四牌楼", "九龙湖"],
  "苏州大学": ["园林校园", "独墅湖", "古典与现代"],
  "江南大学": ["食品科学", "太湖之滨", "设计学科"],
  "中国矿业大学": ["矿业工程", "安全科学", "徐州云龙"],
};

function getRec(school: University): string {
  return SCHOOL_REC[school.name] ?? `位于${school.city}的一所优秀本科院校，值得深入了解。`;
}

function getTags(school: University): string[] {
  return SCHOOL_TAGS[school.name] ?? [school.city, TIER_LABEL[school.tier], "本科院校"];
}

// ── Animations ──

const fadeUp = keyframes`
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

// ── Styled ──

const CardWrapper = styled.div`
  position: absolute;
  z-index: 20;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  animation: ${fadeUp} 0.28s ease-out;

  background: rgba(255,252,247,0.94);
  border-radius: 24px;
  border: 1px solid rgba(200,170,150,0.25);
  box-shadow: 0 8px 40px rgba(140,100,70,0.12), 0 2px 8px rgba(180,150,130,0.08);
  backdrop-filter: blur(20px);
  padding: 20px 24px;
  min-width: 320px;
  max-width: 420px;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SchoolName = styled.h3`
  margin: 0;
  font-family: "Noto Serif SC","Songti SC","KaiTi",serif;
  font-size: 18px;
  font-weight: 700;
  color: #3a2f28;
`;

const CloseBtn = styled.button`
  border: none;
  background: rgba(200,170,150,0.15);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8b7d73;
  flex-shrink: 0;
  &:hover { background: rgba(200,150,130,0.25); color: #3a2f28; }
  svg { width: 14px; height: 14px; }
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: 12px;
  color: #6b5d53;
  svg { width: 13px; height: 13px; color: #b0a090; }
`;

const TierBadge = styled.span<{ $tier: Tier }>`
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 5px;
  font-weight: 700;
  background: ${({ $tier }) =>
    $tier === "985" ? "rgba(200,80,60,0.14)" :
    $tier === "211" ? "rgba(140,100,160,0.14)" :
    $tier === "dual" ? "rgba(80,120,180,0.12)" :
    "rgba(120,160,130,0.10)"};
  color: ${({ $tier }) =>
    $tier === "985" ? "#b04a3a" :
    $tier === "211" ? "#7b5ea7" :
    $tier === "dual" ? "#4a6fa5" :
    "#5a8e6a"};
`;

const RecLine = styled.p`
  margin: 0 0 14px 0;
  font-size: 12px;
  line-height: 1.6;
  color: #5a4a3a;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 14px;
`;

const Tag = styled.span`
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(220,210,195,0.3);
  color: #6b5d53;
  font-weight: 500;
`;

const BackendDataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin: 0 0 14px;
`;

const BackendDataItem = styled.div`
  min-width: 0;
  padding: 7px 8px;
  border: 1px solid rgba(200, 170, 150, 0.22);
  border-radius: 9px;
  background: rgba(255, 250, 245, 0.62);

  span {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #9a7660;
    font-size: 9.5px;
    font-weight: 800;
    white-space: nowrap;
  }

  strong {
    display: block;
    overflow: hidden;
    margin-top: 3px;
    color: #3a2f28;
    font-size: 12px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    width: 11px;
    height: 11px;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  cursor: pointer;
  border: 1.5px solid ${({ $primary }) => $primary ? "rgba(200,130,110,0.35)" : "rgba(200,170,150,0.25)"};
  background: ${({ $primary }) => $primary ? "rgba(240,138,120,0.12)" : "rgba(255,252,247,0.6)"};
  color: ${({ $primary }) => $primary ? "#b04a3a" : "#4a3a2a"};
  transition: all 0.15s ease;
  &:hover {
    background: ${({ $primary }) => $primary ? "rgba(240,138,120,0.20)" : "rgba(200,170,150,0.20)"};
    border-color: rgba(200,150,130,0.45);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }
  svg { width: 14px; height: 14px; }
`;

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 12px;
  border: 1.5px solid rgba(130, 155, 180, 0.28);
  background: rgba(245, 250, 252, 0.72);
  color: #455e73;
  cursor: pointer;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(225, 238, 245, 0.86);
    border-color: rgba(100, 140, 170, 0.42);
  }

  svg { width: 14px; height: 14px; }
`;

const InlineHint = styled.p<{ $error?: boolean }>`
  margin: 10px 0 0;
  color: ${({ $error }) => ($error ? "#a84c3d" : "#6b7f62")};
  font-size: 11px;
  line-height: 1.5;
`;

// ── Component ──

interface SchoolInfoCardProps {
  schoolName: string;
  universities?: University[];
  schoolRecord?: SchoolDTO | null;
  onClose: () => void;
  onViewDetail: (school: University) => void;
}

export default function SchoolInfoCard({
  schoolName,
  universities = UNIVERSITIES,
  schoolRecord = null,
  onClose,
  onViewDetail,
}: SchoolInfoCardProps) {
  const { navigateWithTransition } = useTransition();
  const { authenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(Boolean(schoolRecord?.isFavorited));
  const [favoriteCount, setFavoriteCount] = useState(schoolRecord?.favoriteCount ?? 0);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [favoriteError, setFavoriteError] = useState(false);
  const school = useMemo(
    () => universities.find((u) => u.name === schoolName) ?? null,
    [schoolName, universities],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsFavorited(Boolean(schoolRecord?.isFavorited));
      setFavoriteCount(schoolRecord?.favoriteCount ?? 0);
      setFavoriteMessage("");
      setFavoriteError(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [schoolRecord?.favoriteCount, schoolRecord?.id, schoolRecord?.isFavorited]);

  if (!school) return null;

  const website = schoolRecord?.website ?? school.website ?? null;
  const summary = schoolRecord?.brief || getRec(school);
  const schoolParam = encodeURIComponent(schoolRecord?.name ?? school.name);
  const contributionPath = `/me?tab=submissions&type=QUESTION&school=${schoolParam}`;
  const loginPath = `/login?next=${encodeURIComponent(contributionPath)}`;

  const handleOpenExperiences = () => {
    navigateWithTransition(`/experiences?school=${schoolParam}`);
  };

  const handleAskQuestion = () => {
    navigateWithTransition(authenticated ? contributionPath : loginPath);
  };

  const handleToggleFavorite = async () => {
    if (!schoolRecord) {
      setFavoriteError(true);
      setFavoriteMessage("学校档案完善后就可以收藏这所学校。");
      return;
    }

    if (!authenticated) {
      navigateWithTransition("/login");
      return;
    }

    setFavoriteBusy(true);
    setFavoriteMessage("");
    setFavoriteError(false);
    try {
      if (isFavorited) {
        await userApi.removeFavorite(schoolRecord.id);
        setIsFavorited(false);
        setFavoriteCount((count) => Math.max(0, count - 1));
        setFavoriteMessage("已从个人页学校清单移除。");
      } else {
        await userApi.addFavorite(schoolRecord.id);
        setIsFavorited(true);
        setFavoriteCount((count) => count + 1);
        setFavoriteMessage("已加入个人页学校清单。");
      }
    } catch (err) {
      setFavoriteError(true);
      setFavoriteMessage(err instanceof Error ? err.message : "收藏操作失败，请稍后再试。");
    } finally {
      setFavoriteBusy(false);
    }
  };

  return (
    <CardWrapper>
      <Header>
        <SchoolName>{school.name}</SchoolName>
        <CloseBtn onClick={onClose}><X size={14} /></CloseBtn>
      </Header>

      <MetaLine>
        <MapPin size={13} /> {school.city}市
        <TierBadge $tier={school.tier}>{universityBandLabel(school)}</TierBadge>
        {school.founded && (
          <>
            <Clock size={13} /> {school.founded} 年建校
          </>
        )}
      </MetaLine>

      {schoolRecord && (
        <BackendDataGrid>
          <BackendDataItem>
            <span><Flame size={11} /> 热度</span>
            <strong>{schoolRecord.hotScore}</strong>
          </BackendDataItem>
          <BackendDataItem>
            <span><Heart size={11} /> 收藏</span>
            <strong>{favoriteCount}</strong>
          </BackendDataItem>
          <BackendDataItem>
            <span><BookOpen size={11} /> 层次</span>
            <strong>{schoolRecord.level || schoolRecord.type}</strong>
          </BackendDataItem>
        </BackendDataGrid>
      )}

      <RecLine>{summary}</RecLine>

      <TagRow>
        {getTags(school).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </TagRow>

      <ActionRow>
        <ActionBtn $primary onClick={() => onViewDetail(school)}>
          <BookOpen size={14} /> 查看校园详情
        </ActionBtn>
        <ActionBtn onClick={handleToggleFavorite} disabled={favoriteBusy}>
          <Heart size={14} /> {isFavorited ? "已收藏" : "收藏"}
        </ActionBtn>
        {website && (
          <ActionLink href={website} target="_blank" rel="noreferrer">
            官网
            <ExternalLink size={14} />
          </ActionLink>
        )}
        <ActionBtn onClick={handleOpenExperiences}>
          <MessageCircle size={14} /> 查看相关经验
        </ActionBtn>
        <ActionBtn onClick={handleAskQuestion}>
          <HelpCircle size={14} /> 我要提问
        </ActionBtn>
      </ActionRow>
      {favoriteMessage && <InlineHint $error={favoriteError}>{favoriteMessage}</InlineHint>}
    </CardWrapper>
  );
}
