import { DEFAULT_TIMEZONE } from "@/config/app";

const CRORE = 10_000_000;
const LAKH = 100_000;

const integerFormatter = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

function trimDecimals(value: number, digits: number) {
  return Number(value.toFixed(digits)).toString();
}

/** Formats PKR in the Crore / Lakh notation Pakistani agencies quote prices in. */
export function formatPKRCompact(amount: number, { prefix = true }: { prefix?: boolean } = {}) {
  const abs = Math.abs(amount);
  let body: string;
  if (abs >= CRORE) body = `${trimDecimals(amount / CRORE, 2)} Cr`;
  else if (abs >= LAKH) body = `${trimDecimals(amount / LAKH, 1)} Lac`;
  else body = integerFormatter.format(amount);
  return prefix ? `PKR ${body}` : body;
}

export function formatPKR(amount: number) {
  return `PKR ${integerFormatter.format(amount)}`;
}

export function formatNumber(value: number) {
  return integerFormatter.format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, { signed = false }: { signed?: boolean } = {}) {
  const formatted = `${trimDecimals(Math.abs(value) * 100, 1)}%`;
  if (!signed) return formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

type DateStyle = "day" | "dayMonth" | "weekday" | "time" | "dateTime" | "full" | "month";

const dateStyles: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  day: { day: "numeric" },
  dayMonth: { day: "numeric", month: "short" },
  weekday: { weekday: "short", day: "numeric", month: "short" },
  time: { hour: "numeric", minute: "2-digit", hour12: true },
  dateTime: { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true },
  full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  month: { month: "short" },
};

export function formatDate(iso: string, style: DateStyle = "dayMonth", timeZone = DEFAULT_TIMEZONE) {
  const locale = style === "month" || style === "time" ? "en-US" : "en-GB";
  return new Intl.DateTimeFormat(locale, { ...dateStyles[style], timeZone }).format(new Date(iso));
}

/** Calendar-day key (YYYY-MM-DD) in the agency timezone. */
export function dayKey(iso: string, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelative(iso: string, now: string) {
  const diff = new Date(iso).getTime() - new Date(now).getTime();
  const abs = Math.abs(diff);
  const future = diff > 0;
  let label: string;
  if (abs < MINUTE) return "just now";
  if (abs < HOUR) label = `${Math.round(abs / MINUTE)}m`;
  else if (abs < DAY) label = `${Math.round(abs / HOUR)}h`;
  else label = `${Math.round(abs / DAY)}d`;
  return future ? `in ${label}` : `${label} ago`;
}

export function formatDuration(ms: number) {
  if (ms <= 0) return "0h";
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
