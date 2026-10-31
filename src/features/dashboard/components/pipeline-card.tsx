import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/section-card";
import { formatPKRCompact } from "@/lib/format";
import type { DashboardData } from "../data/types";
import { HorizontalBarList } from "@/components/charts/horizontal-bar-list";

export function PipelineCard({ pipeline }: { pipeline: DashboardData["pipeline"] }) {
  return (
    <SectionCard
      id="sales-pipeline"
      title="Sales pipeline"
      description={`${pipeline.openCount} open deals worth ${formatPKRCompact(pipeline.openValuePKR)} · values in PKR`}
      className="xl:col-span-7"
      action={
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/pipeline">
            Open pipeline
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      <HorizontalBarList
        ariaLabel="Deal value by pipeline stage"
        items={pipeline.stages.map((stage) => ({
          key: stage.id,
          label: stage.label,
          value: stage.valuePKR,
          primary: formatPKRCompact(stage.valuePKR, { prefix: false }),
          secondary: `${stage.count} deals`,
          tooltip: `${stage.label}: ${stage.count} deals · avg ${formatPKRCompact(stage.count ? stage.valuePKR / stage.count : 0)}`,
        }))}
      />
      <p className="mt-3 text-xs text-muted-foreground">Closed won shows deals closed this month. Bars compare total deal value per stage.</p>
    </SectionCard>
  );
}
