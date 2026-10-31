import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/config/navigation";
import { PageHeader } from "./page-header";

export function PlannedModule({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <>
      <PageHeader title={item.label} description={item.description} />
      <section className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-card px-6 py-16 text-center shadow-card">
        <div className="relative mb-5">
          <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/60 text-muted-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="absolute -right-2 -bottom-2 flex size-6 items-center justify-center rounded-full border bg-warning-soft text-warning">
            <Construction className="size-3.5" aria-hidden />
          </span>
        </div>
        <h2 className="text-base font-semibold">Planned for an upcoming batch</h2>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          The {item.label.toLowerCase()} module is part of the PropStackly roadmap. This prototype only implements the
          dashboard so the design can be reviewed first.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>
      </section>
    </>
  );
}
