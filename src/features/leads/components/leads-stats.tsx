import { Flame, Inbox, Trophy, UserRoundX } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatNumber, formatPercent } from "@/lib/format";
import type { summarizeLeads } from "../lib/lead-metrics";

export function LeadsStats({ summary }: { summary: ReturnType<typeof summarizeLeads> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard label="Open leads" icon={Inbox} value={formatNumber(summary.open)} hint={`${summary.newThisWeek} new in the last 7 days`} />
      <StatCard label="Hot leads" icon={Flame} value={formatNumber(summary.hot)} hint="Open and marked hot" />
      <StatCard
        label="Unassigned"
        icon={UserRoundX}
        value={formatNumber(summary.unassigned)}
        hint={summary.unassigned ? "Waiting in the team queue" : "Every open lead has an owner"}
        tone={summary.unassigned ? "attention" : "default"}
      />
      <StatCard label="Win rate" icon={Trophy} value={formatPercent(summary.winRate)} hint={`Across ${summary.closed} closed leads`} />
    </div>
  );
}
