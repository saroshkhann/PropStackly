import { SectionCard } from "@/components/shared/section-card";
import { formatNumber, formatPercent } from "@/lib/format";
import type { SourceBreakdown } from "../lib/metrics";
import { HorizontalBarList } from "@/components/charts/horizontal-bar-list";

export function LeadSourcesCard({ sources, rangeLabel }: { sources: SourceBreakdown[]; rangeLabel: string }) {
  const top = sources[0];
  return (
    <SectionCard
      id="lead-sources"
      title="Lead sources"
      description={top ? `${top.label} drove ${formatPercent(top.share)} of leads · last ${rangeLabel}` : `Last ${rangeLabel}`}
      className="xl:col-span-4"
    >
      <HorizontalBarList
        ariaLabel="Leads by source"
        items={sources.map((source) => ({
          key: source.id,
          label: source.label,
          value: source.count,
          primary: formatNumber(source.count),
          secondary: formatPercent(source.share),
          tooltip: `${source.label}: ${formatNumber(source.count)} leads (${formatPercent(source.share)})`,
        }))}
      />
    </SectionCard>
  );
}
