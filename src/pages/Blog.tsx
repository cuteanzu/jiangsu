import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import bgImage from "/bg.webp";

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  background: url(${bgImage}) center / cover no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(6, 4, 8, 0.55);
`;

const Content = styled.div`
  position: relative;
  text-align: center;
  color: oklch(0.9 0.01 0);
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 0.06em;
  margin: 0;
`;

const Hint = styled.p`
  font-size: 13px;
  color: oklch(0.7 0.02 0);
  margin: 12px 0 32px;
`;

const BackBtn = styled.button`
  padding: 10px 28px;
  border: 1px solid oklch(0.88 0.02 0 / 0.2);
  border-radius: 8px;
  background: oklch(0.18 0.005 0 / 0.5);
  backdrop-filter: blur(8px);
  color: oklch(0.88 0.01 0);
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 0.04em;
  transition: all 0.3s ease;
  &:hover {
    background: oklch(0.24 0.01 0 / 0.6);
    border-color: oklch(0.72 0.12 10 / 0.4);
  }
`;

export default function Blog() {
  const nav = useNavigate();
  return (
    <Page>
      <Overlay />
      <Content>
        <Title>博客</Title>
        <Hint>技术文章即将上线</Hint>
        <BackBtn onClick={() => nav("/")}>返回首页</BackBtn>
      </Content>
    </Page>
  );
}
