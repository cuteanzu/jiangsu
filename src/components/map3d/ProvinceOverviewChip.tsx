import styled from "styled-components";
import { Sparkles } from "lucide-react";

const ChipShell = styled.button`
  position: absolute; z-index: 10; top: 27px; right: 32px;
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  border: 1px solid rgba(214, 175, 145, 0.15);
  border-radius: 12px;
  background: rgba(255, 252, 247, 0.55);
  box-shadow: 0 4px 16px rgba(158, 126, 104, 0.05);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-family: "Noto Sans SC","PingFang SC",sans-serif;
  font-size: 11px; font-weight: 700; color: #8b7d73;
  transition: all 0.18s ease;
  &:hover {
    background: rgba(255, 252, 247, 0.85);
    border-color: rgba(214, 175, 145, 0.30);
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(158, 126, 104, 0.10);
    color: #5a4a3a;
  }
  svg { color: #c76b5e; width: 13px; height: 13px; }
  @media (max-width: 720px) { top: 72px; right: 12px; font-size: 10px; padding: 5px 8px; }
`;

interface ProvinceOverviewChipProps {
  totalCities: number;
  totalUniversities: number;
  keyCount: number;
  onClick: () => void;
}

export default function ProvinceOverviewChip({
  totalCities, totalUniversities, keyCount, onClick,
}: ProvinceOverviewChipProps) {
  return (
    <ChipShell onClick={onClick}>
      <Sparkles size={14} />
      {totalCities}市 · {totalUniversities}所本科 · {keyCount}所重点
    </ChipShell>
  );
}
