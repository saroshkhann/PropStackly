"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ChartTooltipCard } from "@/components/charts/chart-tooltip";
import { SectionCard } from "@/components/shared/section-card";
import type { MonthlySales } from "@/domain/analytics";
import { formatPercent, formatPKRCompact } from "@/lib/format";

function SalesTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  const month = payload?.[0]?.payload as MonthlySales | undefined;
  if (!active || !month) return null;
  return (
    <ChartTooltipCard
      title={month.month}
      rows={[{ key: "revenue", label: "closed", value: formatPKRCompact(month.revenuePKR), color: "var(--chart-1)", shape: "square" }]}
      footer={`${month.dealsClosed} deals · ${formatPercent(month.revenuePKR / month.targetPKR)} of target`}
    />
  );
}

export function SalesPerformanceCard({ months, targetPKR }: { months: MonthlySales[]; targetPKR: number }) {
  const latest = months[months.length - 1];
  const hitTarget = months.filter((m) => m.revenuePKR >= m.targetPKR).length;

  return (
    <SectionCard
      id="sales-performance"
      title="Sales performance"
      description={`Closed sales value by month, PKR Crore · ${hitTarget} of ${months.length} months on target`}
      className="xl:col-span-7"
      contentClassName="flex flex-col"
      action={
        latest && (
          <div className="text-right">
            <p className="text-[11.5px] text-muted-foreground">{latest.month} attainment</p>
            <p className="text-sm font-semibold tabular">{formatPercent(latest.revenuePKR / latest.targetPKR)}</p>
          </div>
        )
      }
    >
      <div className="min-h-[248px] flex-1">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 248 }}>
          <BarChart data={months} margin={{ top: 22, right: 76, bottom: 0, left: -4 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value: number) => formatPKRCompact(value, { prefix: false })}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip content={SalesTooltip} cursor={{ fill: "var(--muted)", opacity: 0.6 }} isAnimationActive={false} />
            <ReferenceLine
              y={targetPKR}
              stroke="var(--subtle-foreground)"
              strokeWidth={1}
              label={{ value: `Target ${formatPKRCompact(targetPKR, { prefix: false })}`, position: "right", fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Bar dataKey="revenuePKR" name="Closed sales" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={600}>
              <LabelList
                dataKey="revenuePKR"
                position="top"
                offset={6}
                formatter={(value) => (Number(value) / 10_000_000).toFixed(1)}
                style={{ fill: "var(--secondary-foreground)", fontSize: 11, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Closed sales by month</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Closed value</th><th scope="col">Deals</th></tr></thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}><th scope="row">{m.month}</th><td>{formatPKRCompact(m.revenuePKR)}</td><td>{m.dealsClosed}</td></tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}
