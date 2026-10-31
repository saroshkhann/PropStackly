"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartLegend, ChartTooltipCard } from "@/components/charts/chart-tooltip";
import { SectionCard } from "@/components/shared/section-card";
import { formatCompactNumber, formatNumber } from "@/lib/format";
import type { ActivityPoint } from "../lib/metrics";

const SERIES = [
  { key: "newLeads", label: "New leads", color: "var(--chart-1)" },
  { key: "siteVisits", label: "Site visits", color: "var(--chart-2)" },
] as const;

function ActivityTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  const point = payload?.[0]?.payload as ActivityPoint | undefined;
  if (!active || !point) return null;
  return (
    <ChartTooltipCard
      title={point.rangeLabel}
      rows={SERIES.map((s) => ({ key: s.key, label: s.label, value: formatNumber(point[s.key]), color: s.color }))}
      footer={point.newLeads ? `${Math.round((point.siteVisits / point.newLeads) * 100)}% of leads booked a visit` : undefined}
    />
  );
}

interface LeadActivityChartProps {
  series: ActivityPoint[];
  rangeLabel: string;
  granularity: "daily" | "weekly";
  totals: { newLeads: number; siteVisits: number };
}

export function LeadActivityChart({ series, rangeLabel, granularity, totals }: LeadActivityChartProps) {
  return (
    <SectionCard
      id="lead-activity"
      title="Lead activity"
      description={`Inbound leads and booked site visits · last ${rangeLabel}${granularity === "weekly" ? ", by week" : ""}`}
      className="xl:col-span-8"
    >
      <ChartLegend items={SERIES.map((s) => ({ key: s.key, label: s.label, color: s.color, value: formatNumber(totals[s.key]) }))} />
      <div className="mt-4 h-[260px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 280 }}>
          <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.14} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickMargin={6}
              allowDecimals={false}
              tickFormatter={(value: number) => formatCompactNumber(value)}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              content={ActivityTooltip}
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="newLeads"
              name="New leads"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#leadsFill)"
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={600}
            />
            <Line
              type="monotone"
              dataKey="siteVisits"
              name="Site visits"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }}
              animationDuration={600}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Lead activity, last {rangeLabel}</caption>
        <thead>
          <tr><th scope="col">Period</th><th scope="col">New leads</th><th scope="col">Site visits</th></tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.key}><th scope="row">{point.rangeLabel}</th><td>{point.newLeads}</td><td>{point.siteVisits}</td></tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}
