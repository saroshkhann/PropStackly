import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { plannedModules } from "@/config/navigation";
import { PlannedModule } from "@/components/shared/planned-module";

export function generateStaticParams() {
  return plannedModules.map((item) => ({ module: item.href.slice(1) }));
}

function findModule(slug: string) {
  return plannedModules.find((item) => item.href === `/${slug}`);
}

export async function generateMetadata({ params }: PageProps<"/[module]">): Promise<Metadata> {
  const { module: slug } = await params;
  return { title: findModule(slug)?.label ?? "Not found" };
}

async function PlannedModuleContent({ params }: { params: PageProps<"/[module]">["params"] }) {
  const { module: slug } = await params;
  const item = findModule(slug);
  if (!item) notFound();
  return <PlannedModule item={item} />;
}

export default function PlannedModulePage({ params }: PageProps<"/[module]">) {
  return (
    <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
      <PlannedModuleContent params={params} />
    </Suspense>
  );
}
