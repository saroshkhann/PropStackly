import type { Metadata } from "next";
import { PropertiesView } from "@/features/properties/components/properties-view";
import { getPropertiesPageData } from "@/features/properties/data/get-properties";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Properties" };

export default async function PropertiesPage() {
  const workspace = await getWorkspace();
  const data = await getPropertiesPageData(workspace.agency.id);
  return <PropertiesView data={data} />;
}
