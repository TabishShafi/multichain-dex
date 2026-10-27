export function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function priceSeries(seedKey: string, points: number, volatility: number, endValue: number): number[] {
  const rand = seededRandom(hashString(seedKey));
  const steps: number[] = [];
  for (let i = 0; i < points; i++) steps.push((rand() - 0.48) * volatility);
  const raw: number[] = [1];
  for (const s of steps) raw.push(raw[raw.length - 1] * (1 + s));
  const last = raw[raw.length - 1];
  return raw.map((v) => (v / last) * endValue);
}

export function fakeHash(seed: string, solana = false): string {
  const rand = seededRandom(hashString(seed));
  if (solana) {
    const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let out = "";
    for (let i = 0; i < 88; i++) out += alphabet[Math.floor(rand() * alphabet.length)];
    return out;
  }
  let out = "0x";
  for (let i = 0; i < 64; i++) out += Math.floor(rand() * 16).toString(16);
  return out;
}

export function fakeAddress(seed: string): string {
  const rand = seededRandom(hashString(seed));
  let out = "0x";
  for (let i = 0; i < 40; i++) out += Math.floor(rand() * 16).toString(16);
  return out;
}
