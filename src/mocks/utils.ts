import { DEMO_NOW } from "@/config/app";

const HOUR_MS = 3_600_000;

/** Deterministic PRNG so generated demo data is identical on every render. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!,
  };
}

export function hoursFromNow(hours: number) {
  return new Date(new Date(DEMO_NOW).getTime() + hours * HOUR_MS).toISOString();
}

const PKT_OFFSET_MS = 5 * HOUR_MS;

/** ISO timestamp for a wall-clock time in Asia/Karachi, `dayOffset` days from the demo date. */
export function atLocalTime(dayOffset: number, hour: number, minute = 0) {
  const local = new Date(new Date(DEMO_NOW).getTime() + PKT_OFFSET_MS);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - PKT_OFFSET_MS;
  return new Date(midnight + (dayOffset * 24 + hour) * HOUR_MS + minute * 60_000).toISOString();
}
