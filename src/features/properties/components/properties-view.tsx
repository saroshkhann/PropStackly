"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, Download, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { notifyDemoAction } from "@/lib/demo";
import type { PropertiesPageData } from "../data/types";
import { emptyPropertyFilters, filterProperties, hasActivePropertyFilters, sortProperties, type PropertyFilters, type PropertySort } from "../lib/property-filters";
import { summarizeProperties } from "../lib/property-metrics";
import { AdvancedFiltersSheet } from "./advanced-filters-sheet";
import { PropertiesOverview } from "./properties-overview";
import { PropertiesTable } from "./properties-table";
import { PropertiesToolbar, type DisplayUnit, type PropertyView } from "./properties-toolbar";
import { PropertyCard } from "./property-card";
import { usePropertySession } from "./property-session";

const PAGE_SIZE = { grid: 12, list: 15 } as const;

export function PropertiesView({ data }: { data: PropertiesPageData }) {
  const session = usePropertySession();
  const [filters, setFilters] = useState<PropertyFilters>(emptyPropertyFilters);
  const [sort, setSort] = useState<PropertySort>("newest");
  const [view, setView] = useState<PropertyView>("grid");
  const [unit, setUnit] = useState<DisplayUnit>("listed");
  const [page, setPage] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const properties = useMemo(() => session.merge(data.properties), [session, data.properties]);
  const summary = useMemo(() => summarizeProperties(properties, data.now), [properties, data.now]);
  const results = useMemo(() => sortProperties(filterProperties(properties, filters), sort), [properties, filters, sort]);

  const pageSize = PAGE_SIZE[view];
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = results.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const updateFilters = (next: PropertyFilters) => {
    setFilters(next);
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">Inventory<DemoBadge /></span>}
        title="Properties"
        description="Every listing your agency manages — for sale and for rent."
        actions={
          <>
            <Button variant="outline" onClick={() => notifyDemoAction("Export listings", "CSV export arrives with the Reports module.")}>
              <Download />
              Export
            </Button>
            <Button asChild>
              <Link href="/properties/new">
                <Plus />
                Add property
              </Link>
            </Button>
          </>
        }
      />

      <PropertiesOverview summary={summary} />

      <section aria-label="Property inventory" className="flex min-w-0 flex-col rounded-xl border bg-card pt-4 shadow-card">
        <PropertiesToolbar
          properties={properties}
          filters={filters}
          onChange={updateFilters}
          sort={sort}
          onSort={setSort}
          view={view}
          onView={(next) => {
            setView(next);
            setPage(0);
          }}
          unit={unit}
          onUnit={setUnit}
          locations={data.locations}
          agents={data.agents}
          onOpenAdvanced={() => setAdvancedOpen(true)}
        />

        <p className="border-t px-5 py-2.5 text-[13px] text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground tabular">{results.length}</span> {results.length === 1 ? "listing" : "listings"}
          {hasActivePropertyFilters(filters) ? " match your filters" : " in inventory"}
        </p>

        {results.length === 0 ? (
          hasActivePropertyFilters(filters) ? (
            <EmptyState
              icon={SearchX}
              title="No listings match"
              description="Try widening the price or area range, or clear some filters."
              action={<Button variant="outline" onClick={() => updateFilters(emptyPropertyFilters)}>Clear filters</Button>}
              className="border-t"
            />
          ) : (
            <EmptyState
              icon={Building2}
              title="No properties yet"
              description="Add your first listing to start matching it with buyers and tenants."
              action={<Button asChild><Link href="/properties/new"><Plus />Add property</Link></Button>}
              className="border-t"
            />
          )
        ) : view === "grid" ? (
          <ul className="grid grid-cols-1 gap-4 border-t bg-muted/20 p-5 sm:grid-cols-2 2xl:grid-cols-3">
            {visible.map((property) => (
              <li key={property.id} className="flex">
                <PropertyCard property={property} unit={unit === "listed" ? undefined : unit} />
              </li>
            ))}
          </ul>
        ) : (
          <PropertiesTable properties={visible} unit={unit === "listed" ? undefined : unit} now={data.now} />
        )}

        {results.length > pageSize && (
          <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t px-5 py-3 text-[13px] text-muted-foreground">
            <p className="tabular">
              Showing <span className="font-medium text-foreground">{currentPage * pageSize + 1}–{Math.min(results.length, (currentPage + 1) * pageSize)}</span> of{" "}
              <span className="font-medium text-foreground">{results.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="tabular max-sm:hidden">
                Page {currentPage + 1} of {pageCount}
              </span>
              <Button variant="outline" size="icon-sm" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous page">
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount - 1} aria-label="Next page">
                <ChevronRight />
              </Button>
            </div>
          </nav>
        )}
      </section>

      <AdvancedFiltersSheet
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        filters={filters}
        onApply={updateFilters}
        properties={properties}
        agents={data.agents}
      />
    </div>
  );
}
