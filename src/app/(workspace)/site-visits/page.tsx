import type { Metadata } from "next";
import { SiteVisitsView } from "@/features/site-visits/components/site-visits-view";
import { getSiteVisitsPageData } from "@/features/site-visits/data/get-site-visits";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Site visits" };

export default async function SiteVisitsPage() {
  const workspace = await getWorkspace();
  const data = await getSiteVisitsPageData(workspace.agency.id);
  return <SiteVisitsView data={data} />;
}
