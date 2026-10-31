import type { Metadata } from "next";
import { LeadsView } from "@/features/leads/components/leads-view";
import { getLeadsPageData } from "@/features/leads/data/get-leads";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const workspace = await getWorkspace();
  const data = await getLeadsPageData(workspace.agency.id);
  return <LeadsView data={data} />;
}
