import { useState } from "react";
import styled from "styled-components";
import { useSettings } from "./settings-context";
import type { Settings } from "./settings-context";

const Panel = styled.div<{ $open: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const Toggle = styled.button<{ $open: boolean }>`
  width: ${(p) => (p.$open ? "36px" : "32px")};
  height: ${(p) => (p.$open ? "36px" : "32px")};
  border-radius: 50%;
  border: 1px solid oklch(0.88 0.02 0 / 0.3);
  background: oklch(0.18 0.005 0 / 0.55);
  backdrop-filter: blur(8px);
  color: oklch(0.9 0.01 0);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  &:hover {
    background: oklch(0.24 0.01 0 / 0.65);
    border-color: oklch(0.85 0.04 10 / 0.5);
  }
`;

const Body = styled.div`
  background: oklch(0.16 0.005 0 / 0.62);
  backdrop-filter: blur(12px);
  border: 1px solid oklch(0.88 0.02 0 / 0.12);
  border-radius: 12px;
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
  max-width: 220px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 10px;
  color: oklch(0.78 0.01 0);
  min-width: 52px;
  text-align: right;
  letter-spacing: 0.02em;
`;

const Slider = styled.input`
  flex: 1;
  height: 2px;
  accent-color: oklch(0.72 0.12 10);
  cursor: pointer;
`;

const Value = styled.span`
  font-size: 10px;
  color: oklch(0.7 0.02 0);
  min-width: 28px;
  text-align: left;
  font-variant-numeric: tabular-nums;
`;

const Divider = styled.div`
  height: 1px;
  background: oklch(0.88 0.02 0 / 0.08);
  margin: 0;
`;

const ResetButton = styled.button`
  border: 1px solid oklch(0.88 0.02 0 / 0.16);
  border-radius: 8px;
  background: oklch(0.22 0.01 0 / 0.55);
  color: oklch(0.86 0.01 0);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  padding: 7px 10px;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: oklch(0.28 0.01 0 / 0.68);
    border-color: oklch(0.85 0.04 10 / 0.35);
  }
`;

const densityOptions: Settings["petalIntensity"][] = ["minimal", "subtle", "moderate", "bold"];

function formatVal(v: number, dec = 2): string {
  return v.toFixed(dec);
}

export default function Controls() {
  const { s, set, reset } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <Panel $open={open}>
      {open && (
        <Body>
          <Row>
            <Label>视差</Label>
            <Slider type="range" min="0" max="1" step="0.05" value={s.parallaxStrength} onChange={(e) => set({ parallaxStrength: +e.target.value })} />
            <Value>{formatVal(s.parallaxStrength, 1)}</Value>
          </Row>
          <Row>
            <Label>暗角</Label>
            <Slider type="range" min="0" max="0.8" step="0.05" value={s.vignetteOpacity} onChange={(e) => set({ vignetteOpacity: +e.target.value })} />
            <Value>{formatVal(s.vignetteOpacity)}</Value>
          </Row>
          <Divider />
          <Row>
            <Label>散景数量</Label>
            <Slider type="range" min="0" max="40" step="2" value={s.bokehCount} onChange={(e) => set({ bokehCount: +e.target.value })} />
            <Value>{s.bokehCount}</Value>
          </Row>
          <Row>
            <Label>散景大小</Label>
            <Slider type="range" min="0.3" max="2.5" step="0.1" value={s.bokehSize} onChange={(e) => set({ bokehSize: +e.target.value })} />
            <Value>{formatVal(s.bokehSize, 1)}</Value>
          </Row>
          <Row>
            <Label>散景透明</Label>
            <Slider type="range" min="0" max="1" step="0.05" value={s.bokehOpacity} onChange={(e) => set({ bokehOpacity: +e.target.value })} />
            <Value>{formatVal(s.bokehOpacity)}</Value>
          </Row>
          <Divider />
          <Row>
            <Label>光束</Label>
            <Slider type="range" min="0" max="0.6" step="0.05" value={s.komorebiBeamOpacity} onChange={(e) => set({ komorebiBeamOpacity: +e.target.value })} />
            <Value>{formatVal(s.komorebiBeamOpacity, 1)}</Value>
          </Row>
          <Row>
            <Label>微尘</Label>
            <Slider type="range" min="0" max="80" step="5" value={s.komorebiDustCount} onChange={(e) => set({ komorebiDustCount: +e.target.value })} />
            <Value>{s.komorebiDustCount}</Value>
          </Row>
          <Divider />
          <Row>
            <Label>花瓣大小</Label>
            <Slider type="range" min="0.5" max="3" step="0.1" value={s.petalSize} onChange={(e) => set({ petalSize: +e.target.value })} />
            <Value>{formatVal(s.petalSize, 1)}</Value>
          </Row>
          <Row>
            <Label>花瓣速度</Label>
            <Slider type="range" min="0.2" max="2" step="0.1" value={s.petalSpeed} onChange={(e) => set({ petalSpeed: +e.target.value })} />
            <Value>{formatVal(s.petalSpeed, 1)}</Value>
          </Row>
          <Row>
            <Label>密度</Label>
            <Slider type="range" min="0" max="3" step="1" value={densityOptions.indexOf(s.petalIntensity)} onChange={(e) => set({ petalIntensity: densityOptions[+e.target.value] })} />
            <Value style={{ fontSize: 9 }}>{s.petalIntensity}</Value>
          </Row>
          <Row>
            <Label>地面落花</Label>
            <Slider type="range" min="0" max="50" step="2" value={s.groundPetalsCount} onChange={(e) => set({ groundPetalsCount: +e.target.value })} />
            <Value>{s.groundPetalsCount}</Value>
          </Row>
          <Divider />
          <ResetButton type="button" onClick={reset}>重置视觉参数</ResetButton>
        </Body>
      )}
      <Toggle $open={open} onClick={() => setOpen(!open)}>
        {open ? "×" : "✦"}
      </Toggle>
    </Panel>
  );
}
