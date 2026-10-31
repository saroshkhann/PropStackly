"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/shared/demo-badge";
import { PageHeader } from "@/components/shared/page-header";
import { notifyDemoAction } from "@/lib/demo";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../data/types";
import {
  activitySeries,
  leadSourceBreakdown,
  RANGE_OPTIONS,
  rangeDays,
  seriesGranularity,
  summarizeRange,
  type RangeKey,
} from "../lib/metrics";
import { KpiGrid } from "./kpi-grid";
import { LeadActivityChart } from "./lead-activity-chart";
import { LeadSourcesCard } from "./lead-sources-card";
import { PipelineCard } from "./pipeline-card";
import { RangeFilter } from "./range-filter";
import { RecentLeadsTable } from "./recent-leads-table";
import { SalesPerformanceCard } from "./sales-performance-card";
import { ScheduleCard } from "./schedule-card";
import { TopAgentsCard } from "./top-agents-card";

/** CSS-only entrance so content is visible in server HTML before hydration. */
function Reveal({ index, className, children }: { index: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn("animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-500 ease-out motion-reduce:animate-none", className)}
    >
      {children}
    </div>
  );
}

export function DashboardView({ data, greeting }: { data: DashboardData; greeting: string }) {
  const [range, setRange] = useState<RangeKey>("30d");
  const days = rangeDays(range);
  const rangeLabel = RANGE_OPTIONS.find((option) => option.key === range)!.label;

  const { current, previous } = useMemo(() => summarizeRange(data.activity, data.listingDates, days), [data, days]);
  const series = useMemo(() => activitySeries(data.activity, data.listingDates, days), [data, days]);
  const sources = useMemo(
    () => leadSourceBreakdown(current.newLeads, data.leadSources, data.leadSourceWeights),
    [current.newLeads, data.leadSources, data.leadSourceWeights],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            {formatDate(data.now, "full")}
            <DemoBadge className="xl:hidden" />
          </span>
        }
        title={`${greeting}, ${data.greetingName}`}
        description="Here's how your agency is performing. The range applies to KPIs, lead activity, and lead sources."
        actions={
          <>
            <RangeFilter value={range} onChange={setRange} />
            <Button variant="outline" onClick={() => notifyDemoAction("Export report", "Exports arrive with the Reports module.")}>
              <Download />
              Export
            </Button>
          </>
        }
      />

      <Reveal index={0}>
        <KpiGrid
          current={current}
          previous={previous}
          series={series}
          rangeLabel={rangeLabel}
          inventory={data.inventory}
          pipeline={data.pipeline}
        />
      </Reveal>

      <Reveal index={1} className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <LeadActivityChart
          series={series}
          rangeLabel={rangeLabel}
          granularity={seriesGranularity(days)}
          totals={{ newLeads: current.newLeads, siteVisits: current.siteVisits }}
        />
        <LeadSourcesCard sources={sources} rangeLabel={rangeLabel} />
      </Reveal>

      <Reveal index={2} className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <ScheduleCard items={data.schedule} now={data.now} />
        <PipelineCard pipeline={data.pipeline} />
      </Reveal>

      <Reveal index={3} className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <SalesPerformanceCard months={data.monthlySales} targetPKR={data.monthlyTargetPKR} />
        <TopAgentsCard agents={data.leaderboard} />
      </Reveal>

      <Reveal index={4}>
        <RecentLeadsTable leads={data.recentLeads} now={data.now} />
      </Reveal>
    </div>
  );
}
