import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailView } from "@/features/properties/components/property-detail-view";
import { getPropertyDetail, getPropertyIds } from "@/features/properties/data/get-properties";
import { getWorkspace } from "@/features/workspace/get-workspace";
import PropertyDetailLoading from "./loading";

export async function generateStaticParams() {
  const workspace = await getWorkspace();
  return getPropertyIds(workspace.agency.id).map((propertyId) => ({ propertyId }));
}

export async function generateMetadata({ params }: PageProps<"/properties/[propertyId]">): Promise<Metadata> {
  const { propertyId } = await params;
  const workspace = await getWorkspace();
  const detail = await getPropertyDetail(workspace.agency.id, propertyId);
  return { title: detail ? `${detail.property.title} · Properties` : "Property not found" };
}

async function PropertyDetailContent({ params }: { params: PageProps<"/properties/[propertyId]">["params"] }) {
  const { propertyId } = await params;
  const workspace = await getWorkspace();
  const detail = await getPropertyDetail(workspace.agency.id, propertyId);
  if (!detail) notFound();
  return <PropertyDetailView data={detail} />;
}

export default function PropertyDetailPage({ params }: PageProps<"/properties/[propertyId]">) {
  return (
    <Suspense fallback={<PropertyDetailLoading />}>
      <PropertyDetailContent params={params} />
    </Suspense>
  );
}
