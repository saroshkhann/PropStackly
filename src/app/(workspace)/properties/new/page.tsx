import type { Metadata } from "next";
import { PropertyEditor } from "@/features/properties/components/property-editor";
import { getPropertyFormOptions } from "@/features/properties/data/get-properties";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Add property" };

export default async function NewPropertyPage() {
  const workspace = await getWorkspace();
  const { now, ...options } = await getPropertyFormOptions(workspace.agency.id);
  return <PropertyEditor options={options} now={now} agencyId={workspace.agency.id} />;
}
