import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  User,
  Bookmark,
  Edit3,
  Heart,
  LogOut,
  MapPin,
  Settings,
  ExternalLink,
} from "lucide-react";

const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(170deg, #fdf7f2 0%, #f7efe4 40%, #f0e8db 100%);
  color: #3a2f28;
  font-family: "Noto Serif SC", "Songti SC", "STSong", "KaiTi", serif;
  box-sizing: border-box;
`;

const Shell = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 40px 32px 80px;

  @media (max-width: 640px) {
    padding: 24px 16px 48px;
  }
`;

// ── Profile header ──

const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(180, 150, 120, 0.15);
  backdrop-filter: blur(12px);
  animation: ${fadeUp} 0.5s ease-out;

  @media (max-width: 560px) {
    flex-direction: column;
    text-align: center;
    padding: 28px 20px;
  }
`;

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8d5c4, #d4b896);
  border: 3px solid rgba(180, 140, 100, 0.25);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #8b6f5a;
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.h1`
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.5px;
`;

const Bio = styled.p`
  margin: 0 0 16px;
  font-size: 15px;
  color: #6b5d4f;
  line-height: 1.7;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 13px;
  color: #8b7b6a;
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const EditButton = styled.button`
  margin-left: auto;
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(180, 140, 100, 0.25);
  background: rgba(255, 255, 255, 0.6);
  color: #6b5d4f;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(180, 140, 100, 0.4);
    color: #3a2f28;
  }

  @media (max-width: 560px) {
    margin-left: 0;
    margin-top: 12px;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(180, 140, 100, 0.12);
  background: transparent;
  color: #b5a08a;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  margin-left: 8px;

  &:hover {
    color: #c76b5e;
    border-color: rgba(199, 107, 94, 0.2);
    background: rgba(199, 107, 94, 0.04);
  }

  @media (max-width: 560px) {
    margin-left: 0;
    margin-top: 8px;
  }
`;

// ── Stats grid ──

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
  animation: ${fadeUp} 0.5s ease-out 0.1s both;

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  padding: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(180, 150, 120, 0.12);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 900;
  color: #c76b5e;
  line-height: 1;
`;

const StatLabel = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: #8b7b6a;
`;

// ── Tab bar ──

const Tabs = styled.div`
  display: flex;
  gap: 0;
  margin-top: 36px;
  border-bottom: 1px solid rgba(180, 150, 120, 0.15);
  animation: ${fadeUp} 0.5s ease-out 0.2s both;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 28px;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: ${(p) => (p.$active ? 800 : 500)};
  color: ${(p) => (p.$active ? "#3a2f28" : "#8b7b6a")};
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: #c76b5e;
    transform: scaleX(${(p) => (p.$active ? 1 : 0)});
    transition: transform 0.25s ease;
  }

  &:hover {
    color: #3a2f28;
  }

  @media (max-width: 560px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

// ── Content area ──

const ContentArea = styled.div`
  margin-top: 28px;
  animation: ${fadeUp} 0.5s ease-out 0.25s both;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 20px;
  color: #8b7b6a;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;
  opacity: 0.4;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
`;

const EmptyLink = styled(Link)`
  display: inline-block;
  margin-top: 16px;
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid rgba(199, 107, 94, 0.25);
  background: rgba(199, 107, 94, 0.06);
  color: #c76b5e;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(199, 107, 94, 0.12);
  }
`;

// ── Footer ──

const PageFooter = styled.footer`
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid rgba(180, 150, 120, 0.12);
  text-align: center;
  font-size: 12px;
  color: #b5a592;
`;

const TAB_LABELS = ["收藏的高校", "我的经验", "我的问答", "浏览记录"] as const;

// Placeholder user — ready for backend integration
const MOCK_USER = {
  name: "访客",
  bio: "探索江苏高校，记录择校之旅。",
  joinDate: "2026",
  stats: {
    favorites: 0,
    experiences: 0,
    answers: 0,
    history: 0,
  },
};

export default function Me() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: clear auth token / session when backend is ready
    navigate("/login");
  };

  return (
    <Page>
      <Shell>
        <ProfileCard>
          <Avatar>
            <User size={44} />
          </Avatar>
          <ProfileInfo>
            <Username>{MOCK_USER.name}</Username>
            <Bio>{MOCK_USER.bio}</Bio>
            <MetaRow>
              <MetaItem>
                <MapPin size={13} />
                江苏
              </MetaItem>
              <MetaItem>
                <ExternalLink size={13} />
                加入于 {MOCK_USER.joinDate}
              </MetaItem>
            </MetaRow>
          </ProfileInfo>
          <EditButton>
            <Settings size={14} />
            编辑资料
          </EditButton>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={14} />
            退出
          </LogoutButton>
        </ProfileCard>

        <StatsGrid>
          <StatCard>
            <StatNumber>{MOCK_USER.stats.favorites}</StatNumber>
            <StatLabel>收藏高校</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{MOCK_USER.stats.experiences}</StatNumber>
            <StatLabel>经验分享</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{MOCK_USER.stats.answers}</StatNumber>
            <StatLabel>问答参与</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{MOCK_USER.stats.history}</StatNumber>
            <StatLabel>浏览记录</StatLabel>
          </StatCard>
        </StatsGrid>

        <Tabs>
          {TAB_LABELS.map((label, i) => (
            <Tab key={i} $active={tab === i} onClick={() => setTab(i)}>
              {label}
            </Tab>
          ))}
        </Tabs>

        <ContentArea>
          {tab === 0 && (
            <EmptyState>
              <EmptyIcon>
                <Bookmark size={48} />
              </EmptyIcon>
              <EmptyText>还没有收藏任何高校</EmptyText>
              <EmptyLink to="/jiangsu">去地图看看</EmptyLink>
            </EmptyState>
          )}
          {tab === 1 && (
            <EmptyState>
              <EmptyIcon>
                <Edit3 size={48} />
              </EmptyIcon>
              <EmptyText>还没有分享校园经验</EmptyText>
              <EmptyLink to="/experiences">浏览经验</EmptyLink>
            </EmptyState>
          )}
          {tab === 2 && (
            <EmptyState>
              <EmptyIcon>
                <Heart size={48} />
              </EmptyIcon>
              <EmptyText>还没有参与问答</EmptyText>
              <EmptyLink to="/qa">去问答看看</EmptyLink>
            </EmptyState>
          )}
          {tab === 3 && (
            <EmptyState>
              <EmptyIcon>
                <MapPin size={48} />
              </EmptyIcon>
              <EmptyText>暂无浏览记录</EmptyText>
              <EmptyLink to="/jiangsu">开始探索</EmptyLink>
            </EmptyState>
          )}
        </ContentArea>

        <PageFooter>江苏高校地图 · 开源项目</PageFooter>
      </Shell>
    </Page>
  );
}
