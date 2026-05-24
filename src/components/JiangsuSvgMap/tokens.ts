import type { Tier } from "../../data/jiangsu-universities";

export const tierInkStyles: Record<Tier, { color: string; soft: string; label: string; glow: string }> = {
  "985": {
    color: "#ff5f92",
    soft: "rgba(255, 95, 146, 0.18)",
    glow: "rgba(255, 95, 146, 0.5)",
    label: "985 展馆",
  },
  "211": {
    color: "#f6bd60",
    soft: "rgba(246, 189, 96, 0.18)",
    glow: "rgba(246, 189, 96, 0.46)",
    label: "211 展馆",
  },
  dual: {
    color: "#62c7ff",
    soft: "rgba(98, 199, 255, 0.17)",
    glow: "rgba(98, 199, 255, 0.46)",
    label: "双一流展馆",
  },
  provincial: {
    color: "#88d8b0",
    soft: "rgba(136, 216, 176, 0.14)",
    glow: "rgba(136, 216, 176, 0.34)",
    label: "本科展点",
  },
};

export const cityFillPalette = [
  "url(#city-paper-pink)",
  "url(#city-paper-blue)",
  "url(#city-paper-mint)",
  "url(#city-paper-cream)",
];
