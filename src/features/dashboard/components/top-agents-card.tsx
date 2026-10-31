import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatPercent, formatPKRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AgentPerformance } from "../lib/metrics";

export function TopAgentsCard({ agents }: { agents: AgentPerformance[] }) {
  return (
    <SectionCard
      id="top-agents"
      title="Agent performance"
      description="Closed value against monthly target · this month"
      className="xl:col-span-5"
      action={
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/team">
            Team
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      <ol className="flex flex-col divide-y">
        {agents.map((agent, index) => {
          const pct = Math.min(1, agent.attainment);
          return (
            <li key={agent.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
              <span className="w-4 text-center text-xs font-medium text-subtle-foreground tabular">{index + 1}</span>
              <UserAvatar name={agent.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-foreground">{agent.name}</p>
                  <p className="shrink-0 text-[13px] font-semibold tabular">{formatPKRCompact(agent.closedValuePKR)}</p>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {agent.closedDeals} closed · {agent.openDeals} open
                  </span>
                  <span className="shrink-0 tabular">{formatPercent(agent.attainment)} of {formatPKRCompact(agent.targetPKR, { prefix: false })}</span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-soft"
                  role="meter"
                  aria-label={`${agent.name} target attainment`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(agent.attainment * 100)}
                >
                  <div
                    className={cn("h-full rounded-full", agent.attainment >= 1 ? "bg-success" : "bg-brand")}
                    style={{ width: `${Math.max(3, pct * 100)}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
