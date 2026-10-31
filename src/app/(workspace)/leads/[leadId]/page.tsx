import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadDetailView } from "@/features/leads/components/lead-detail-view";
import { getLeadDetail, getLeadIds } from "@/features/leads/data/get-leads";
import { getWorkspace } from "@/features/workspace/get-workspace";
import LeadDetailLoading from "./loading";

export async function generateStaticParams() {
  const workspace = await getWorkspace();
  return getLeadIds(workspace.agency.id).map((leadId) => ({ leadId }));
}

export async function generateMetadata({ params }: PageProps<"/leads/[leadId]">): Promise<Metadata> {
  const { leadId } = await params;
  const workspace = await getWorkspace();
  const detail = await getLeadDetail(workspace.agency.id, leadId);
  return { title: detail ? `${detail.lead.name} · Leads` : "Lead not found" };
}

async function LeadDetailContent({ params }: { params: PageProps<"/leads/[leadId]">["params"] }) {
  const { leadId } = await params;
  const workspace = await getWorkspace();
  const detail = await getLeadDetail(workspace.agency.id, leadId);
  if (!detail) notFound();
  return <LeadDetailView data={detail} currentUserName={workspace.currentUser.name} />;
}

export default function LeadDetailPage({ params }: PageProps<"/leads/[leadId]">) {
  return (
    <Suspense fallback={<LeadDetailLoading />}>
      <LeadDetailContent params={params} />
    </Suspense>
  );
}
