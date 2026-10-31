import type { DailyActivity } from "@/domain/analytics";
import { atLocalTime, createRandom } from "./utils";

const HISTORY_DAYS = 200;
const random = createRandom(7319);

export interface ClosedSale {
  closedAt: string;
  valuePKR: number;
}

export const demoClosedSales: ClosedSale[] = [];

/** Daily agency activity for the trailing ~6 months, ending on the demo date. */
export const demoDailyActivity: DailyActivity[] = Array.from({ length: HISTORY_DAYS }, (_, index) => {
  const offset = index - (HISTORY_DAYS - 1);
  const date = atLocalTime(offset, 12);
  const weekday = new Date(date).getUTCDay();
  const growth = 1 + (index / HISTORY_DAYS) * 0.45;
  const weekdayFactor = weekday === 0 ? 1.35 : weekday === 5 ? 0.7 : weekday === 6 ? 1.15 : 1;
  const newLeads = Math.round((9 + random.next() * 8) * growth * weekdayFactor);
  const siteVisits = Math.round(newLeads * (0.22 + random.next() * 0.16));

  const dealsClosed = random.next() < 0.2 * growth ? (random.next() < 0.12 ? 2 : 1) : 0;
  const sales = Array.from({ length: dealsClosed }, () => ({
    closedAt: date,
    valuePKR: Math.round((12_000_000 + random.next() * 55_000_000) / 500_000) * 500_000,
  }));
  demoClosedSales.push(...sales);

  return { date, newLeads, siteVisits, dealsClosed, revenuePKR: sales.reduce((sum, sale) => sum + sale.valuePKR, 0) };
});

export const MONTHLY_SALES_TARGET_PKR = 400_000_000;
