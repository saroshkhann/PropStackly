import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyEditor } from "@/features/properties/components/property-editor";
import { getPropertyDetail, getPropertyIds } from "@/features/properties/data/get-properties";
import { getWorkspace } from "@/features/workspace/get-workspace";
import PropertyDetailLoading from "../loading";

export async function generateStaticParams() {
  const workspace = await getWorkspace();
  return getPropertyIds(workspace.agency.id).map((propertyId) => ({ propertyId }));
}

export const metadata: Metadata = { title: "Edit property" };

async function EditContent({ params }: { params: PageProps<"/properties/[propertyId]/edit">["params"] }) {
  const { propertyId } = await params;
  const workspace = await getWorkspace();
  const detail = await getPropertyDetail(workspace.agency.id, propertyId);
  if (!detail) notFound();
  const { agents, owners, locations, now, property } = detail;
  return <PropertyEditor property={property} options={{ agents, owners, locations }} now={now} agencyId={workspace.agency.id} />;
}

export default function EditPropertyPage({ params }: PageProps<"/properties/[propertyId]/edit">) {
  return (
    <Suspense fallback={<PropertyDetailLoading />}>
      <EditContent params={params} />
    </Suspense>
  );
}
