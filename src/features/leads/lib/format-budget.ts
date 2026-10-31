import type { Lead } from "@/domain/lead";
import { formatPKRCompact } from "@/lib/format";

export function formatBudget(lead: Pick<Lead, "intent" | "budgetMinPKR" | "budgetMaxPKR">) {
  const suffix = lead.intent === "rent" ? "/mo" : "";
  return `${formatPKRCompact(lead.budgetMinPKR, { prefix: false })} – ${formatPKRCompact(lead.budgetMaxPKR, { prefix: false })}${suffix}`;
}
