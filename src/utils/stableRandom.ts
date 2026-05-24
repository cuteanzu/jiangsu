export function stableRandom(seed: number, salt = 0): number {
  const value = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

export function stableRange(seed: number, salt: number, min: number, max: number): number {
  return min + stableRandom(seed, salt) * (max - min);
}

export function stablePick<T>(items: readonly T[], seed: number, salt = 0): T {
  return items[Math.floor(stableRandom(seed, salt) * items.length) % items.length];
}
